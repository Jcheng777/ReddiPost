import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productDescription } = await request.json();

    if (!productDescription || productDescription.trim().length === 0) {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }

    // Use GPT to extract keywords
    let keywords: string[];
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a Reddit subreddit discovery expert. Extract 1-3 MAIN THEME keywords from a product description that capture the core essence of what the product is about.

Focus on identifying the PRIMARY theme, not every possible keyword. Think about what subreddit communities would be most relevant.

Examples:
- "AI app for HR to screen candidates" → ["recruiting", "hiring", "hr"]
- "Budgeting app for college students" → ["personalfinance", "college", "budgeting"]
- "Tool for React developers to debug performance" → ["reactjs", "webdev", "javascript"]
- "Platform for musicians to collaborate remotely" → ["wearethemusicmakers", "musicproduction", "musicians"]

Rules:
- Extract 1-3 keywords maximum that represent the MAIN theme
- Can be single words or common subreddit-style terms (like "personalfinance", "reactjs")
- Lowercase all keywords
- Focus on terms that actual subreddit names might contain
- Avoid overly generic terms unless they're the core theme

Return as JSON: {"keywords": ["keyword1", "keyword2", "keyword3"]}`
          },
          {
            role: "user",
            content: productDescription
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response || '{"keywords": []}');
      keywords = parsed.keywords || [];
      
      console.log('\n=== Keyword Extraction ===');
      console.log('Product description:', productDescription);
      console.log('Extracted keywords:', keywords);
      console.log('Extraction method: GPT-3.5');

      // Fallback to basic extraction if GPT fails or returns empty
      if (keywords.length === 0) {
        console.log('GPT returned empty keywords, using fallback extraction');
        keywords = extractKeywords(productDescription);
      }
    } catch (openAIError) {
      console.error('OpenAI error, falling back to basic extraction:', openAIError);
      // Fallback to basic keyword extraction
      keywords = extractKeywords(productDescription);
      console.log('\n=== Keyword Extraction ===');
      console.log('Product description:', productDescription);
      console.log('Extracted keywords:', keywords);
      console.log('Extraction method: Fallback (word frequency)');
    }

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return NextResponse.json({ error: 'Failed to extract keywords' }, { status: 500 });
  }
}

function extractKeywords(text: string): string[] {
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what',
    'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'some', 'any', 'few', 'more', 'most', 'other', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'built', 'created', 'made',
    'helps', 'help', 'using', 'use', 'my', 'our', 'your'
  ]);

  // Technology and startup-related keywords to prioritize
  const techKeywords = new Set([
    'app', 'saas', 'tool', 'platform', 'software', 'api', 'startup',
    'business', 'service', 'product', 'solution', 'system', 'automation',
    'ai', 'ml', 'web', 'mobile', 'cloud', 'data', 'analytics', 'dashboard',
    'management', 'tracking', 'monitoring', 'optimization', 'integration',
    'workflow', 'productivity', 'collaboration', 'communication', 'security',
    'payment', 'subscription', 'marketplace', 'social', 'content', 'marketing',
    'sales', 'crm', 'erp', 'inventory', 'scheduling', 'booking', 'learning',
    'education', 'health', 'fitness', 'finance', 'crypto', 'blockchain',
    'ecommerce', 'retail', 'media', 'entertainment', 'gaming', 'travel'
  ]);

  // Clean and tokenize the text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Get single words only, prioritizing tech keywords
  const keywords = Array.from(wordFreq.entries())
    .map(([word, freq]) => ({
      word,
      score: freq * (techKeywords.has(word) ? 2 : 1)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.word);

  // Return unique keywords
  return [...new Set(keywords)];
}