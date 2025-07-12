import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  const state = crypto.randomBytes(32).toString('hex');
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;
  
  // Store state in a cookie for CSRF protection
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
  authUrl.searchParams.append('client_id', clientId!);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('redirect_uri', redirectUri!);
  authUrl.searchParams.append('duration', 'permanent');
  authUrl.searchParams.append('scope', 'identity read submit edit');

  // Log the generated URL for debugging
  console.log('Generated auth URL:', authUrl.toString());
  console.log('Client ID:', clientId);
  console.log('Redirect URI:', redirectUri);

  return NextResponse.json({ authUrl: authUrl.toString() });
}