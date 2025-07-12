import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production'
);

export interface SessionToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export async function encrypt(payload: SessionToken): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function decrypt(token: string): Promise<SessionToken | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionToken;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionToken | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) return null;

  return decrypt(session.value);
}

export async function setSession(token: SessionToken) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt(token);
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}