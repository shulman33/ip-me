/**
 * Zod validation schemas for IP detection feature
 * Based on data-model.md specification
 */

import { z } from 'zod';

/**
 * IP version enum schema
 */
export const ipVersionSchema = z.enum(['IPv4', 'IPv6']);

/**
 * IPv4 address validation schema
 * Validates format: 0-255.0-255.0-255.0-255 (RFC 791)
 */
export const ipv4Schema = z.string().ip({ version: "v4" });

/**
 * IPv6 address validation schema
 * Supports: Full, compressed, IPv4-mapped, link-local formats (RFC 4291)
 */
export const ipv6Schema = z.string().ip({ version: "v6" });

/**
 * Generic IP address schema (both IPv4 and IPv6)
 */
export const ipSchema = z.string().ip();

/**
 * IP Address object schema with version and validation status
 */
export const ipAddressSchema = z.object({
  value: ipSchema,
  version: ipVersionSchema,
  isValid: z.boolean(),
});

/**
 * IPv4 Address object schema (strict)
 */
export const ipv4AddressSchema = z.object({
  value: ipv4Schema,
  version: z.literal('IPv4'),
  isValid: z.literal(true),
});

/**
 * IPv6 Address object schema (strict)
 */
export const ipv6AddressSchema = z.object({
  value: ipv6Schema,
  version: z.literal('IPv6'),
  isValid: z.literal(true),
});

/**
 * Detection status enum schema
 */
export const detectionStatusSchema = z.enum(['idle', 'loading', 'success', 'error', 'retrying']);

/**
 * Detection state schema for IP lookup process
 */
export const detectionStateSchema = z.object({
  status: detectionStatusSchema,
  error: z.string().nullable(),
  retryCount: z.number().int().min(0).max(3),
  lastAttempt: z.date().nullable(),
});

/**
 * Timezone data schema from IPstack API
 */
export const timezoneDataSchema = z.object({
  id: z.string().min(1),                                // IANA timezone (e.g., "America/New_York")
  offset: z.number().int().min(-43200).max(50400).nullable().optional(), // UTC offset in seconds
  code: z.string().min(3).max(5).nullable().optional(),            // Timezone code (EST, PDT)
  gmt_offset: z.number().int().min(-12).max(14).nullable().optional(), // GMT offset in hours
  is_daylight_saving: z.boolean().nullable().optional(),
});

/**
 * IP Detection Result schema from API
 * Includes geolocation and network data from IPstack
 */
export const ipDetectionResultSchema = z.object({
  // Core IP data (required)
  ip: ipSchema,
  version: ipVersionSchema,

  // Geolocation data (optional - may not be available for all IPs)
  country_code: z.string().length(2).nullable().optional(),
  country_name: z.string().nullable().optional(),
  region_code: z.string().nullable().optional(),
  region_name: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  // Network data (optional)
  isp: z.string().nullable().optional(),
  connection_type: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),

  // Timezone data (optional)
  timezone: timezoneDataSchema.optional(),

  // Metadata (required)
  cached: z.boolean(),
  timestamp: z.string().datetime(), // ISO 8601 format
});

/**
 * Geolocation data schema (alias for IP detection result)
 */
export const geolocationDataSchema = ipDetectionResultSchema;

/**
 * API Error response schema
 */
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

/**
 * Type inference exports
 */
export type IPVersion = z.infer<typeof ipVersionSchema>;
export type IPAddress = z.infer<typeof ipAddressSchema>;
export type DetectionStatus = z.infer<typeof detectionStatusSchema>;
export type DetectionState = z.infer<typeof detectionStateSchema>;
export type TimezoneData = z.infer<typeof timezoneDataSchema>;
export type IPDetectionResult = z.infer<typeof ipDetectionResultSchema>;
export type GeolocationData = z.infer<typeof geolocationDataSchema>;
export type APIError = z.infer<typeof apiErrorSchema>;

/**
 * Validation helper functions
 */

/**
 * Validates if a string is a valid IPv4 address
 */
export function validateIPv4(ip: string): boolean {
  return ipv4Schema.safeParse(ip).success;
}

/**
 * Validates if a string is a valid IPv6 address
 */
export function validateIPv6(ip: string): boolean {
  return ipv6Schema.safeParse(ip).success;
}

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 */
export function validateIP(ip: string): boolean {
  return ipSchema.safeParse(ip).success;
}
