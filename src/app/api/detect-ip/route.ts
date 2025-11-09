/**
 * API Route Handler: GET /api/detect-ip
 *
 * Detects client IP address and returns geolocation data.
 * Features:
 * - Server-side IP detection from headers (fallback)
 * - IPstack API integration for geolocation data
 * - Upstash Redis caching (5-minute TTL)
 * - Zod validation for all responses
 * - Comprehensive error handling
 *
 * Based on: specs/001-auto-ip-detection/contracts/detect-ip.yaml
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import {
  ipDetectionResultSchema,
  apiErrorSchema,
  validateIP,
} from '@/lib/validations/ip-schema';
import { detectIPVersion, extractIPFromHeaders } from '@/lib/utils/ip-detection';
import { ERROR_CODES } from '@/types/ip';
import type { IPDetectionResult, APIError, IPVersion } from '@/types/ip';

/**
 * Initialize Upstash Redis client (optional - graceful degradation if not configured)
 */
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

/**
 * Cache TTL in seconds (5 minutes)
 */
const CACHE_TTL = 300;

/**
 * Cache key prefix for IP lookups
 */
const CACHE_KEY_PREFIX = 'ip-lookup:';

/**
 * IPstack API response interface
 * Based on IPstack API documentation
 */
interface IPstackResponse {
  ip?: string;
  type?: 'ipv4' | 'ipv6';
  country_code?: string;
  country_name?: string;
  region_code?: string;
  region_name?: string;
  city?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    calling_code?: string;
    capital?: string;
    country_flag?: string;
    languages?: Array<{ code: string; name: string; native: string }>;
  };
  connection?: {
    asn?: number;
    isp?: string;
  };
  success?: boolean;
  error?: {
    code?: number;
    type?: string;
    info?: string;
  };
}

/**
 * Transforms IPstack API response to our IPDetectionResult format
 */
function transformIPstackResponse(
  data: IPstackResponse,
  ip: string,
  cached: boolean
): IPDetectionResult {
  // Detect IP version (use our utility as fallback)
  const version: IPVersion = data.type === 'ipv6' ? 'IPv6' : 'IPv4';

  return {
    ip: data.ip || ip,
    version,
    country_code: data.country_code,
    country_name: data.country_name,
    region_code: data.region_code,
    region_name: data.region_name,
    city: data.city,
    zip: data.zip,
    latitude: data.latitude,
    longitude: data.longitude,
    isp: data.connection?.isp,
    connection_type: undefined, // IPstack doesn't provide this on free tier
    organization: data.connection?.isp, // Use ISP as organization
    cached,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetches IP geolocation data from IPstack API
 */
async function fetchFromIPstack(ip: string): Promise<IPDetectionResult> {
  const apiKey = process.env.IPSTACK_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    // No API key configured - return minimal result
    const version = detectIPVersion(ip) || 'IPv4';
    return {
      ip,
      version,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Call IPstack API (free tier uses HTTP, not HTTPS)
    const response = await fetch(
      `http://api.ipstack.com/${ip}?access_key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Don't cache at fetch level (we handle caching with Redis)
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`IPstack API returned ${response.status}`);
    }

    const data: IPstackResponse = await response.json();

    // Check for API error response
    if (data.success === false && data.error) {
      console.error('[IPstack Error]', data.error);
      throw new Error(data.error.info || 'IPstack API error');
    }

    // Transform and return
    return transformIPstackResponse(data, ip, false);
  } catch (error) {
    console.error('[fetchFromIPstack] Error:', error);

    // Return minimal result on API failure
    const version = detectIPVersion(ip) || 'IPv4';
    return {
      ip,
      version,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves IP detection result with caching
 */
async function getIPDetectionResult(ip: string): Promise<IPDetectionResult> {
  const cacheKey = `${CACHE_KEY_PREFIX}${ip}`;

  // Try cache first (if Redis is configured)
  if (redis) {
    try {
      const cached = await redis.get<IPDetectionResult>(cacheKey);

      if (cached) {
        console.log(`[Cache HIT] ${ip}`);
        return {
          ...cached,
          cached: true,
          timestamp: new Date().toISOString(), // Update timestamp
        };
      }

      console.log(`[Cache MISS] ${ip}`);
    } catch (error) {
      console.error('[Redis Error]', error);
      // Continue without cache on Redis error
    }
  }

  // Fetch from IPstack API
  const result = await fetchFromIPstack(ip);

  // Store in cache (if Redis is configured)
  if (redis) {
    try {
      await redis.set(cacheKey, result, { ex: CACHE_TTL });
      console.log(`[Cache SET] ${ip} (TTL: ${CACHE_TTL}s)`);
    } catch (error) {
      console.error('[Redis Set Error]', error);
      // Continue without caching on Redis error
    }
  }

  return result;
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  error: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse<APIError> {
  const errorBody: APIError = {
    error,
    code,
    ...(details && { details }),
  };

  // Validate error response with Zod
  const validated = apiErrorSchema.parse(errorBody);

  return NextResponse.json(validated, { status });
}

/**
 * GET /api/detect-ip
 *
 * Query Parameters:
 * - ip (optional): IP address to validate/lookup
 *
 * Returns:
 * - 200: IPDetectionResult with geolocation data
 * - 400: Invalid IP address format
 * - 500: Service unavailable
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract IP from query parameter or request headers
    const searchParams = request.nextUrl.searchParams;
    const queryIP = searchParams.get('ip');

    let ip: string | null = null;

    if (queryIP) {
      // Validate provided IP
      if (!validateIP(queryIP)) {
        return createErrorResponse(
          'Invalid IP address format',
          ERROR_CODES.INVALID_IP,
          400,
          {
            provided: queryIP,
            expected: 'Valid IPv4 or IPv6 address',
          }
        );
      }
      ip = queryIP;
    } else {
      // Fallback: Extract from request headers
      ip = extractIPFromHeaders(request.headers);
    }

    if (!ip) {
      return createErrorResponse(
        'No IP address provided and unable to detect from headers',
        ERROR_CODES.NO_IP_PROVIDED,
        400
      );
    }

    // Get detection result (with caching)
    const result = await getIPDetectionResult(ip);

    // Validate response with Zod before returning
    const validated = ipDetectionResultSchema.parse(result);

    return NextResponse.json(validated, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[GET /api/detect-ip] Error:', error);

    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return createErrorResponse(
        'Failed to validate API response',
        ERROR_CODES.VALIDATION_FAILED,
        500,
        {
          zodError: error,
        }
      );
    }

    // Generic server error
    return createErrorResponse(
      'IP detection service temporarily unavailable',
      ERROR_CODES.SERVICE_UNAVAILABLE,
      500
    );
  }
}
