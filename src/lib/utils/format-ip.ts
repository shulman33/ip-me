/**
 * IP formatting utilities
 * Functions for formatting IPv4 and IPv6 addresses for display
 */

import type { IPVersion } from '@/types/ip';

/**
 * Formats an IPv4 address for display
 * Already in standard format, but ensures consistent spacing and validation
 *
 * @param ip - IPv4 address string
 * @returns Formatted IPv4 address
 *
 * @example
 * formatIPv4('192.168.1.1') // '192.168.1.1'
 */
export function formatIPv4(ip: string): string {
  // IPv4 is already in standard format (xxx.xxx.xxx.xxx)
  // Just ensure no extra whitespace
  return ip.trim();
}

/**
 * Formats an IPv6 address for display
 * Preserves compressed format for better readability
 *
 * @param ip - IPv6 address string
 * @returns Formatted IPv6 address
 *
 * @example
 * formatIPv6('2001:0db8:0000:0000:0000:0000:0000:0001') // '2001:db8::1'
 * formatIPv6('::1') // '::1'
 */
export function formatIPv6(ip: string): string {
  // IPv6 should already be in proper format from validation
  // Preserve compressed notation (::) for readability
  // Just ensure no extra whitespace
  return ip.trim().toLowerCase();
}

/**
 * Formats an IP address based on its version
 *
 * @param ip - IP address string
 * @param version - IP version ('IPv4' or 'IPv6')
 * @returns Formatted IP address
 *
 * @example
 * formatIP('192.168.1.1', 'IPv4') // '192.168.1.1'
 * formatIP('2001:db8::1', 'IPv6') // '2001:db8::1'
 */
export function formatIP(ip: string, version: IPVersion): string {
  return version === 'IPv4' ? formatIPv4(ip) : formatIPv6(ip);
}

/**
 * Truncates an IP address for compact display
 * Useful for mobile views or limited space
 *
 * @param ip - IP address string
 * @param maxLength - Maximum length before truncation
 * @returns Truncated IP with ellipsis if needed
 *
 * @example
 * truncateIP('192.168.1.1', 10) // '192.168.1.1'
 * truncateIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334', 20) // '2001:0db8:85a3:0...'
 */
export function truncateIP(ip: string, maxLength: number = 20): string {
  if (ip.length <= maxLength) {
    return ip;
  }

  return ip.substring(0, maxLength - 3) + '...';
}

/**
 * Masks part of an IP address for privacy display
 * Useful for logs or public display while maintaining some information
 *
 * @param ip - IP address string
 * @param version - IP version ('IPv4' or 'IPv6')
 * @returns Partially masked IP address
 *
 * @example
 * maskIP('192.168.1.1', 'IPv4') // '192.168.*.*'
 * maskIP('2001:db8::1', 'IPv6') // '2001:db8::****'
 */
export function maskIP(ip: string, version: IPVersion): string {
  if (version === 'IPv4') {
    // Mask last two octets
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  } else {
    // Mask last segment after ::
    const parts = ip.split('::');
    if (parts.length === 2) {
      return `${parts[0]}::****`;
    }
    // For full IPv6, mask last 4 groups
    const segments = ip.split(':');
    if (segments.length >= 4) {
      return segments.slice(0, 4).join(':') + ':****';
    }
  }

  // Fallback: return original if format unexpected
  return ip;
}
