import { NextResponse } from 'next/server';
import { redditAPI } from '@/lib/reddit-api';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const posts = await redditAPI.getUserPosts(limit);
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: error.response?.status || 500 }
    );
  }
}