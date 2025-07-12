import { NextResponse } from 'next/server';
import { redditAPI } from '@/lib/reddit-api';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subreddit, title, content, kind = 'self' } = body;

    if (!subreddit || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await redditAPI.submitPost(subreddit, title, content, kind);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error submitting post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit post' },
      { status: error.response?.status || 500 }
    );
  }
}