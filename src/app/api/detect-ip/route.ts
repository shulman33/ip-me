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
import {
  ipDetectionResultSchema,
  apiErrorSchema,
  validateIP,
} from '@/lib/validations/ip-schema';
import { extractIPFromHeaders } from '@/lib/utils/ip-detection';
import { getIPDetectionResult } from '@/lib/services/geolocation';
import { ERROR_CODES } from '@/types/ip';
import type { APIError } from '@/types/ip';

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
