import { NextResponse } from 'next/server';
import { redditAPI } from '@/lib/reddit-api';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { keywords, limit = 10 } = await request.json();

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 });
    }

    // Search for subreddits using the keywords
    const subreddits = await searchSubreddits(keywords, limit);

    return NextResponse.json({ subreddits });
  } catch (error: any) {
    console.error('Error searching subreddits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search subreddits' },
      { status: error.response?.status || 500 }
    );
  }
}

async function searchSubreddits(keywords: string[], limit: number) {
  try {
    // Create search query from keywords
    const searchQuery = keywords.slice(0, 5).join(' OR ');
    
    // Search for subreddits
    const searchResponse = await redditAPI.searchSubreddits(searchQuery, limit);
    
    if (!searchResponse?.data?.children) {
      return [];
    }

    // Process and enrich subreddit data
    const subreddits = await Promise.all(
      searchResponse.data.children.map(async (child: any) => {
        const subredditData = child.data;
        
        try {
          // Get additional subreddit info
          const aboutData = await redditAPI.getSubredditAbout(subredditData.display_name);
          
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
            rules: [],
            relevanceScore: calculateRelevance(subredditData, keywords)
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
            rules: [],
            relevanceScore: calculateRelevance(subredditData, keywords)
          };
        }
      })
    );

    // Sort by relevance score
    return subreddits.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error in searchSubreddits:', error);
    throw error;
  }
}

function calculateRelevance(subredditData: any, keywords: string[]): number {
  let score = 0;
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // Check name matches
  const nameLower = subredditData.display_name.toLowerCase();
  lowerKeywords.forEach(keyword => {
    if (nameLower.includes(keyword)) score += 20;
  });
  
  // Check title matches
  const titleLower = (subredditData.title || '').toLowerCase();
  lowerKeywords.forEach(keyword => {
    if (titleLower.includes(keyword)) score += 15;
  });
  
  // Check description matches
  const descLower = (subredditData.public_description || '').toLowerCase();
  lowerKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) score += 10;
  });
  
  // Bonus for active communities
  if (subredditData.subscribers > 100000) score += 10;
  else if (subredditData.subscribers > 10000) score += 5;
  
  // Cap at 100
  return Math.min(score, 100);
}