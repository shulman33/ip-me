/**
 * Next.js Edge Middleware
 *
 * Implements rate limiting for /api/detect-ip endpoint
 * - 10 requests per minute per IP address
 * - Uses Upstash Redis for distributed rate limiting
 * - Compatible with Edge Runtime
 *
 * Based on: specs/001-auto-ip-detection/tasks.md (T030)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ERROR_CODES } from '@/types/ip';
import type { APIError } from '@/types/ip';

/**
 * Rate limit configuration
 */
const RATE_LIMIT = {
  MAX_REQUESTS: 10,      // Maximum requests
  WINDOW_MS: 60 * 1000,  // Time window in milliseconds (1 minute)
};

/**
 * Upstash Redis rate limiter
 * Uses fixed window algorithm: 10 requests per 60 seconds
 * Ephemeral cache reduces Redis calls for repeated requests
 */
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(RATE_LIMIT.MAX_REQUESTS, '60 s'),
  ephemeralCache: new Map(),
  prefix: '@upstash/ratelimit/ip-detection',
});

/**
 * Extracts client IP from request headers
 * Prioritizes CF-Connecting-IP over X-Forwarded-For
 */
function getClientIP(request: NextRequest): string {
  // Try Cloudflare header first
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Try X-Forwarded-For (Vercel)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIP = forwardedFor.split(',')[0]?.trim();
    if (clientIP) {
      return clientIP;
    }
  }

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to 'unknown' (should rarely happen)
  return 'unknown';
}


/**
 * Creates rate limit error response
 */
function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): NextResponse<APIError> {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  const errorBody: APIError = {
    error: 'Rate limit exceeded. Please try again in 1 minute.',
    code: ERROR_CODES.RATE_LIMITED,
    details: {
      limit,
      window: `${RATE_LIMIT.WINDOW_MS / 1000}s`,
      retry_after: retryAfter,
    },
  };

  return NextResponse.json(errorBody, {
    status: 429,
    headers: {
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    },
  });
}

/**
 * Middleware function
 * Runs on every request matching the config matcher
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to /api/detect-ip endpoint
  if (pathname === '/api/detect-ip') {
    const clientIP = getClientIP(request);

    // Check rate limit using Upstash
    const { success, limit, remaining, reset } = await ratelimit.limit(clientIP);

    if (!success) {
      console.warn(`[Rate Limit] IP ${clientIP} exceeded limit`);
      return createRateLimitResponse(limit, remaining, reset);
    }

    console.log(`[Rate Limit] IP ${clientIP} - Request allowed (${remaining}/${limit} remaining)`);

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

    return response;
  }

  // Continue to the route handler
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Matches only /api/detect-ip routes
 */
export const config = {
  matcher: '/api/detect-ip',
};
