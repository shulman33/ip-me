/**
 * Type definitions for IP detection feature
 * Based on data-model.md specification
 */

/**
 * IP version type (IPv4 or IPv6)
 */
export type IPVersion = 'IPv4' | 'IPv6';

/**
 * Represents a validated IP address
 */
export interface IPAddress {
  value: string;           // The IP address string
  version: IPVersion;      // IPv4 or IPv6
  isValid: boolean;        // Validation result
}

/**
 * Detection status for IP lookup process
 */
export type DetectionStatus = 'idle' | 'loading' | 'success' | 'error' | 'retrying';

/**
 * State management for IP detection process
 */
export interface DetectionState {
  status: DetectionStatus;
  error: string | null;      // Error message if status === 'error'
  retryCount: number;        // Number of retry attempts (0-3)
  lastAttempt: Date | null;  // Timestamp of last detection attempt
}

/**
 * Complete result from IP detection API including geolocation data
 */
export interface IPDetectionResult {
  // Core IP data (required)
  ip: string;
  version: IPVersion;

  // Geolocation data (optional - from IPstack API)
  country_code?: string;      // ISO 3166-1 alpha-2 (e.g., "US")
  country_name?: string;      // Full country name
  region_code?: string;       // ISO 3166-2 region code
  region_name?: string;       // Full region/state name
  city?: string;              // City name
  zip?: string;               // Postal code
  latitude?: number;          // -90 to 90
  longitude?: number;         // -180 to 180

  // Network data (optional)
  isp?: string;               // Internet Service Provider
  connection_type?: string;   // "cable", "dsl", "cellular", etc.
  organization?: string;      // Organization name

  // Metadata (required)
  cached: boolean;            // True if from Vercel KV cache
  timestamp: string;          // ISO 8601 timestamp
}

/**
 * Clipboard copy operation state
 */
export interface CopyState {
  copied: boolean;
  error: string | null;
}

/**
 * Standardized API error response
 */
export interface APIError {
  error: string;             // User-friendly error message
  code: string;              // Machine-readable error code
  details?: Record<string, unknown>; // Additional error context
}

/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  INVALID_IP: 'invalid_ip',
  RATE_LIMITED: 'rate_limited',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  NO_IP_PROVIDED: 'no_ip_provided',
  VALIDATION_FAILED: 'validation_failed',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
