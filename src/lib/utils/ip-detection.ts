/**
 * IP detection utilities
 * Server-side IP extraction from request headers and version detection
 */

import { validateIPv4, validateIPv6 } from '@/lib/validations/ip-schema';
import type { IPVersion, IPAddress } from '@/types/ip';

/**
 * Detects the IP version (IPv4 or IPv6) of a given IP address
 *
 * @param ip - IP address string to check
 * @returns 'IPv4', 'IPv6', or null if invalid
 *
 * @example
 * detectIPVersion('192.168.1.1') // 'IPv4'
 * detectIPVersion('2001:db8::1') // 'IPv6'
 * detectIPVersion('invalid') // null
 */
export function detectIPVersion(ip: string): IPVersion | null {
  if (validateIPv4(ip)) return 'IPv4';
  if (validateIPv6(ip)) return 'IPv6';
  return null;
}

/**
 * Creates an IPAddress object from a raw IP string
 *
 * @param ipString - Raw IP address string
 * @returns IPAddress object with version and validation status
 *
 * @example
 * createIPAddress('8.8.8.8')
 * // { value: '8.8.8.8', version: 'IPv4', isValid: true }
 */
export function createIPAddress(ipString: string): IPAddress {
  const version = detectIPVersion(ipString);

  return {
    value: ipString,
    version: version || 'IPv4', // Default to IPv4 if detection fails
    isValid: version !== null,
  };
}

/**
 * Extracts client IP address from Next.js request headers
 * Prioritizes CF-Connecting-IP (Cloudflare) over X-Forwarded-For (Vercel)
 *
 * @param headers - Headers object from Next.js (from headers() function)
 * @returns Client IP address string or null if not found
 *
 * @example
 * import { headers } from 'next/headers';
 *
 * const headersList = await headers();
 * const clientIP = extractIPFromHeaders(headersList);
 */
export function extractIPFromHeaders(headers: Headers): string | null {
  // Try Cloudflare header first (most reliable)
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Try X-Forwarded-For (Vercel and other proxies)
  // Format: "client, proxy1, proxy2" - client IP is first
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIP = forwardedFor.split(',')[0]?.trim();
    if (clientIP) {
      return clientIP;
    }
  }

  // Try X-Real-IP (nginx and some proxies)
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // No IP found
  return null;
}

/**
 * Detects client IP from Next.js headers and creates IPAddress object
 *
 * @param headers - Headers object from Next.js
 * @returns IPAddress object or null if no IP found
 *
 * @example
 * import { headers } from 'next/headers';
 *
 * const headersList = await headers();
 * const ipAddress = detectClientIP(headersList);
 * if (ipAddress?.isValid) {
 *   console.log(`Detected ${ipAddress.version}: ${ipAddress.value}`);
 * }
 */
export function detectClientIP(headers: Headers): IPAddress | null {
  const ipString = extractIPFromHeaders(headers);

  if (!ipString) {
    return null;
  }

  return createIPAddress(ipString);
}
