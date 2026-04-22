import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/api/health'];

// --- Rate limit store (use Redis in production) ---
const rateLimitMap = new Map();
const RATE_LIMIT = 60;       // requests
const WINDOW_MS = 60_000;    // per minute

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

  if (now - entry.lastReset > WINDOW_MS) {
    entry.count = 0;
    entry.lastReset = now;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  return entry.count > RATE_LIMIT;
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Rate limit — apply to API routes only
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // 2. Auth check
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = req.headers.get('authorization')?.split(' ')[1]
    || req.cookies.get('token')?.value;

  if (!token || !verifyToken(token)) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/items/:path*', '/api/matches/:path*', '/api/chats/:path*'],
};