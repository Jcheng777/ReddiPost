import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { openai } from "@/lib/openai"

const tonePrompts = {
  "founder-story": {
    name: "Founder Story",
    prompt: `Write a Reddit post as a founder sharing their journey. Be authentic and personal. Include:
- The problem you personally faced that led to building this
- Challenges and learnings during development
- A humble ask for feedback from the community
- No aggressive promotion, focus on the story and value`,
  },
  "feedback": {
    name: "Asking for Feedback",
    prompt: `Write a Reddit post asking for genuine feedback. Be humble and specific. Include:
- Brief context about what you've built
- Specific questions about what you want feedback on
- Openness to criticism and suggestions
- Gratitude for the community's time and input`,
  },
  "question": {
    name: "Question",
    prompt: `Write a Reddit post as someone exploring a problem space. Be curious and engaging. Include:
- The problem you're trying to solve
- What solutions you've tried or considered
- Genuine questions for the community
- Mention you're considering building something but want input first`,
  },
  "free-tool": {
    name: "Free Tool Drop",
    prompt: `Write a Reddit post sharing a free tool with the community. Be generous and helpful. Include:
- What the tool does and who it's for
- Why you built it (personal need/community contribution)
- Clear mention that it's completely free
- Invitation for feedback and feature requests`,
  },
}

export async function POST(req: Request) {
  // Check authentication
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { productDescription, subreddit, tone } = await req.json()

    // Validate inputs
    if (!productDescription || !subreddit || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const toneConfig = tonePrompts[tone as keyof typeof tonePrompts]
    if (!toneConfig) {
      return NextResponse.json({ error: "Invalid tone" }, { status: 400 })
    }

    // Use GPT to generate the post
    let generatedPost;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an experienced Reddit user who understands each subreddit's culture and rules. Generate a Reddit post for ${subreddit}.

${toneConfig.prompt}

Important guidelines:
- Match the subreddit's typical post style and tone
- Be conversational and authentic, not corporate
- Use proper Reddit formatting (paragraphs, not walls of text)
- No emojis unless specifically appropriate for the subreddit
- Keep titles concise and engaging (under 100 characters)
- Add a TL;DR at the end for longer posts

Return a JSON object with:
{
  "title": "the post title",
  "body": "the post body with proper formatting",
  "tldr": "a one-line summary"
}`
          },
          {
            role: "user",
            content: `Product/Project Description: ${productDescription}

Generate a ${toneConfig.name} post for ${subreddit}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      generatedPost = JSON.parse(response || '{}');

      // Validate the response
      if (!generatedPost.title || !generatedPost.body || !generatedPost.tldr) {
        throw new Error('Invalid response format from GPT');
      }
    } catch (gptError) {
      console.error('GPT generation error, using fallback:', gptError);
      // Fallback to basic templates
      generatedPost = getFallbackPost(productDescription, subreddit, tone);
    }

    return NextResponse.json({ post: generatedPost })
  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json({ error: "Failed to generate post" }, { status: 500 })
  }
}

function getFallbackPost(productDescription: string, subreddit: string, tone: string) {
  const subredditName = subreddit.replace('r/', '');
  
  // Extract a problem statement from the product description
  // This is a simple extraction - just takes the first 50 chars or so
  const problemStatement = productDescription.length > 50 
    ? productDescription.substring(0, 50) + "..."
    : productDescription;
  
  const templates = {
    "founder-story": {
      title: `I built a tool after struggling with ${problemStatement}`,
      body: `Hey ${subredditName},\n\nAfter months of frustration with existing solutions, I decided to build something better. ${productDescription}\n\nThe journey wasn't easy - I spent countless nights coding and redesigning based on user feedback.\n\nI'd love to hear what you think and if this solves a pain point for you too. What features would you like to see added?`,
      tldr: "Built a tool to solve my own problem, would love your feedback!",
    },
    "feedback": {
      title: "[Feedback Request] Working on something new - would love your input",
      body: `Hi ${subredditName},\n\nI've been working on: ${productDescription}\n\nI'm still in the early stages and would really appreciate honest feedback from this community.\n\nSpecific questions:\n- Does this solve a real problem for you?\n- What features are missing?\n- How could the UX be improved?\n\nThanks in advance for any insights!`,
      tldr: "Building a new tool, seeking honest feedback from the community.",
    },
    "question": {
      title: `Has anyone found a good solution for ${problemStatement}?`,
      body: `I've been struggling with this challenge and wondering if anyone here has found a good approach.\n\n${productDescription}\n\nI'm considering building something to address this, but wanted to check:\n- What tools are you currently using?\n- What's working/not working?\n- Would something like this be useful?\n\nAppreciate any thoughts!`,
      tldr: "Looking for solutions to a problem, considering building something.",
    },
    "free-tool": {
      title: "Made a free tool that might help some of you",
      body: `Hey ${subredditName},\n\nI wanted to share something I built that might be useful: ${productDescription}\n\nIt's completely free to use - no ads, no premium tiers, just wanted to contribute something helpful to the community.\n\nWould love to know:\n- Is this actually useful?\n- What features should I add?\n- Any bugs or issues?\n\nThanks for checking it out!`,
      tldr: "Free tool for the community - feedback welcome!",
    },
  };

  return templates[tone as keyof typeof templates] || templates["founder-story"];
}