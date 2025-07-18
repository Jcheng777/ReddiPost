import { NextResponse } from 'next/server';
import { redditAPI } from '@/lib/reddit-api';
import { getSession } from '@/lib/auth';
import { generateEmbedding, generateEmbeddings, cosineSimilarity } from '@/lib/embeddings';

console.log('Reddit search route loaded');

export async function POST(request: Request) {
  console.log('=== Reddit Search API Called ===');
  console.log('Time:', new Date().toISOString());
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { keywords, limit = 10, productDescription } = await request.json();

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 });
    }

    // Search for subreddits using the keywords
    const subreddits = await searchSubreddits(keywords, limit, productDescription);

    return NextResponse.json({ subreddits });
  } catch (error: any) {
    console.error('Error searching subreddits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search subreddits' },
      { status: error.response?.status || 500 }
    );
  }
}

async function searchSubreddits(keywords: string[], limit: number, productDescription?: string) {
  try {
    // Make separate API calls for each keyword
    console.log('Searching subreddits with keywords:', keywords);
    
    const searchPromises = keywords.map(async (keyword) => {
      console.log(`\n--- Searching for keyword: "${keyword}" ---`);
      try {
        const searchLimit = Math.max(25, Math.ceil(limit / keywords.length) + 10);
        console.log(`  Searching with limit: ${searchLimit}`);
        const response = await redditAPI.searchSubreddits(keyword, searchLimit);
        console.log(`  Raw response:`, response?.data ? `${response.data.children?.length || 0} results` : 'No data');
        let results = response?.data?.children || [];
        
        // Additional NSFW filter as backup
        const beforeFilter = results.length;
        results = results.filter((r: any) => !r.data.over_18);
        if (beforeFilter !== results.length) {
          console.log(`  Filtered out ${beforeFilter - results.length} NSFW subreddits`);
        }
        
        console.log(`Results for "${keyword}": ${results.length} subreddits found`);
        
        // Log first 3 subreddit names and descriptions for this keyword
        if (results.length > 0) {
          console.log(`  Top results:`);
          results.slice(0, 3).forEach((r: any) => {
            const desc = r.data.public_description || r.data.title || 'No description';
            const nsfw = r.data.over_18 ? ' [NSFW]' : '';
            console.log(`    - r/${r.data.display_name}${nsfw}: ${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}`);
          });
        }
        
        return results;
      } catch (error) {
        console.error(`Error searching for keyword "${keyword}":`, error);
        return [];
      }
    });
    
    // Wait for all searches to complete
    const allResults = await Promise.all(searchPromises);
    
    // Flatten and deduplicate results, tracking keyword matches
    const subredditMap = new Map();
    const keywordMatchCount = new Map();
    
    allResults.forEach((results, index) => {
      const keyword = keywords[index];
      results.forEach((child: any) => {
        const name = child.data.display_name;
        if (!subredditMap.has(name)) {
          subredditMap.set(name, child);
          keywordMatchCount.set(name, [keyword]);
        } else {
          const matches = keywordMatchCount.get(name) || [];
          if (!matches.includes(keyword)) {
            matches.push(keyword);
            keywordMatchCount.set(name, matches);
          }
        }
      });
    });
    
    const uniqueResults = Array.from(subredditMap.values());
    console.log(`\n=== Aggregation Results ===`);
    console.log(`Total unique subreddits found: ${uniqueResults.length}`);
    
    // Log which subreddits matched multiple keywords
    const multiMatchSubreddits = Array.from(keywordMatchCount.entries())
      .filter(([_, matches]) => matches.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    if (multiMatchSubreddits.length > 0) {
      console.log('\nSubreddits matching multiple keywords:');
      multiMatchSubreddits.slice(0, 5).forEach(([name, matches]) => {
        console.log(`  r/${name} - matched: [${matches.join(', ')}]`);
      });
    }

    // Process and enrich subreddit data
    const subreddits = await Promise.all(
      uniqueResults.map(async (child: any) => {
        const subredditData = child.data;
        
        try {
          // Get additional subreddit info
          console.log(`Fetching about data for r/${subredditData.display_name}`);
          const aboutData = await redditAPI.getSubredditAbout(subredditData.display_name);
          console.log(`About data for r/${subredditData.display_name}:`, JSON.stringify(aboutData, null, 2));
          
          // Filter out over18 subreddits
          if (aboutData.data?.over18 || subredditData.over18) {
            console.log(`Filtering out r/${subredditData.display_name} - marked as over18`);
            return null;
          }
          
          return {
            name: `r/${subredditData.display_name}`,
            displayName: subredditData.display_name,
            title: subredditData.title,
            description: subredditData.public_description || aboutData.data?.public_description || '',
            subscribers: aboutData.data?.subscribers || subredditData.subscribers || 0,
            activeUsers: aboutData.data?.active_user_count || 0,
            created: new Date(subredditData.created_utc * 1000).toISOString(),
            over18: subredditData.over_18 || false,
            allowsVideos: aboutData.data?.allow_videos || false,
            allowsImages: aboutData.data?.allow_images || false,
            submissionType: aboutData.data?.submission_type || 'any',
            subredditType: aboutData.data?.subreddit_type || 'public',
            rules: [],
            relevanceScore: calculateRelevance(subredditData, keywords, keywordMatchCount.get(subredditData.display_name) || [])
          };
        } catch (error) {
          console.error(`Error fetching details for r/${subredditData.display_name}:`, error);
          return {
            name: `r/${subredditData.display_name}`,
            displayName: subredditData.display_name,
            title: subredditData.title,
            description: subredditData.public_description || '',
            subscribers: subredditData.subscribers || 0,
            activeUsers: 0,
            created: new Date(subredditData.created_utc * 1000).toISOString(),
            over18: subredditData.over_18 || false,
            allowsVideos: true,
            allowsImages: true,
            submissionType: 'any',
            subredditType: 'public',
            rules: [],
            relevanceScore: calculateRelevance(subredditData, keywords, keywordMatchCount.get(subredditData.display_name) || [])
          };
        }
      })
    );

    // Filter out null values (over18 subreddits)
    const filteredSubreddits = subreddits.filter(sub => sub !== null);
    console.log(`Filtered out ${subreddits.length - filteredSubreddits.length} over18 subreddits`);

    // Apply semantic scoring if product description is provided
    let scoredSubreddits = filteredSubreddits;
    if (productDescription && filteredSubreddits.length > 0) {
      console.log('\n=== Applying Semantic Scoring ===');
      console.log('Product description:', productDescription);
      
      try {
        // Generate embedding for product description
        const productEmbedding = await generateEmbedding(productDescription);
        console.log('Generated product description embedding');
        
        // Prepare subreddit texts
        const subredditTexts = filteredSubreddits.map(sub => {
          const title = sub.title || sub.displayName || '';
          const desc = sub.description || '';
          return `${title}. ${desc}`.trim();
        });
        
        // Generate embeddings for all subreddits in batch
        console.log(`Generating embeddings for ${subredditTexts.length} subreddits...`);
        const subredditEmbeddings = await generateEmbeddings(subredditTexts);
        
        // Calculate semantic scores and update relevance scores
        scoredSubreddits = filteredSubreddits.map((sub, index) => {
          const semanticScore = cosineSimilarity(productEmbedding, subredditEmbeddings[index]);
          
          // Base score: 80% semantic
          let score = semanticScore * 100 * 0.8;
          
          // Add 10% for subscriber count
          if (sub.subscribers >= 1000) {
            score += 10; // Active community bonus
          } else {
            score += 5; // Small community, still gets some points
          }
          
          // Add 10% for public subreddits
          const subredditType = sub.subredditType || 'public';
          if (subredditType === 'public') {
            score += 10; // Public/open community bonus
          } else if (subredditType === 'restricted') {
            score += 5; // Restricted gets half bonus
          }
          // Private gets 0 bonus
          
          const finalScore = Math.round(score);
          
          console.log(`r/${sub.displayName}:`);
          console.log(`  - Semantic: ${Math.round(semanticScore * 100)}%`);
          console.log(`  - Subscribers: ${sub.subscribers.toLocaleString()} (${sub.subscribers >= 1000 ? '+10%' : '+5%'})`);
          console.log(`  - Type: ${sub.submissionType} (${sub.submissionType === 'public' || sub.submissionType === 'any' ? '+10%' : sub.submissionType === 'restricted' ? '+5%' : '+0%'})`);
          console.log(`  - Final Score: ${finalScore}%`);
          
          return {
            ...sub,
            relevanceScore: finalScore
          };
        });
        
        console.log('Semantic scoring completed successfully');
      } catch (error) {
        console.error('Error during semantic scoring:', error);
        console.log('Falling back to keyword-only scores');
        scoredSubreddits = filteredSubreddits;
      }
    }

    // Sort by relevance score and limit to requested number
    const finalResults = scoredSubreddits
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
    
    console.log(`\n=== Final Results (Top ${limit}) ===`);
    finalResults.slice(0, 10).forEach((sub, index) => {
      const desc = sub.description || 'No description';
      console.log(`${index + 1}. r/${sub.displayName} (Score: ${sub.relevanceScore}%)`);
      console.log(`   ${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}`);
    });
    
    console.log(`\n=== Search Summary ===`);
    console.log(`Keywords used: [${keywords.join(', ')}]`);
    console.log(`Total results returned: ${finalResults.length}`);
    
    return finalResults;
  } catch (error) {
    console.error('Error in searchSubreddits:', error);
    throw error;
  }
}

function calculateRelevance(subredditData: any, keywords: string[], matchedKeywords: string[]): number {
  let score = 0;
  
  // Base score: 30 points for each keyword that led to this subreddit being found
  score += matchedKeywords.length * 30;
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const nameLower = subredditData.display_name.toLowerCase();
  const titleLower = (subredditData.title || '').toLowerCase();
  const descLower = (subredditData.public_description || '').toLowerCase();
  
  // Additional points for exact matches in subreddit name
  lowerKeywords.forEach(keyword => {
    if (nameLower === keyword || nameLower.includes(keyword)) score += 20;
  });
  
  // Check title matches
  lowerKeywords.forEach(keyword => {
    if (titleLower.includes(keyword)) score += 10;
  });
  
  // Check description matches
  lowerKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) score += 5;
  });
  
  // Bonus for active communities
  if (subredditData.subscribers > 100000) score += 10;
  else if (subredditData.subscribers > 10000) score += 5;
  
  // Cap at 100
  return Math.min(score, 100);
}