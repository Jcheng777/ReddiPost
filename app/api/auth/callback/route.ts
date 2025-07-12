import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { setSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=invalid_request', request.url));
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state');
  
  if (!storedState || storedState.value !== state) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  // Clear the state cookie
  cookieStore.delete('oauth_state');

  try {
    // Exchange code for tokens
    const authString = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDDIT_REDIRECT_URI!,
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ReddiPost/1.0',
        },
      }
    );

    const { access_token, refresh_token, expires_in, scope } = response.data;

    // Store tokens in session
    await setSession({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
      scope: scope,
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }
}