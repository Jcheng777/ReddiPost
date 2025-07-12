import { NextResponse } from 'next/server';
import { redditAPI } from '@/lib/reddit-api';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await redditAPI.getUser();
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: error.response?.status || 500 }
    );
  }
}