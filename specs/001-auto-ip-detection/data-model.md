# Data Model: Automatic IP Detection

**Feature**: 001-auto-ip-detection
**Date**: 2025-11-08

## Overview

This document defines the data structures, types, and validation schemas for the automatic IP detection feature. All types are TypeScript-first with Zod runtime validation at API boundaries.

## Core Entities

### IPAddress

Represents a validated IP address (IPv4 or IPv6).

**TypeScript Definition**:
```typescript
// types/ip.ts
export type IPVersion = 'IPv4' | 'IPv6';

export interface IPAddress {
  value: string;           // The IP address string
  version: IPVersion;      // IPv4 or IPv6
  isValid: boolean;        // Validation result
}
```

**Zod Schema**:
```typescript
// lib/validations/ip-schema.ts
import { z } from 'zod';

export const ipVersionSchema = z.enum(['IPv4', 'IPv6']);

export const ipAddressSchema = z.object({
  value: z.string().ip(),  // Validates both IPv4 and IPv6
  version: ipVersionSchema,
  isValid: z.boolean(),
});

// Separate validators for specific versions
export const ipv4AddressSchema = z.object({
  value: z.string().ip({ version: "v4" }),
  version: z.literal('IPv4'),
  isValid: z.literal(true),
});

export const ipv6AddressSchema = z.object({
  value: z.string().ip({ version: "v6" }),
  version: z.literal('IPv6'),
  isValid: z.literal(true),
});

export type IPAddress = z.infer<typeof ipAddressSchema>;
```

**Validation Rules**:
- **IPv4 Format**: 0-255.0-255.0-255.0-255 (RFC 791)
- **IPv6 Format**: Full, compressed, IPv4-mapped, link-local (RFC 4291)
- **Invalid Examples**: "999.999.999.999", "gggg::1", "not-an-ip"

**Usage Example**:
```typescript
const ip: IPAddress = {
  value: "192.168.1.1",
  version: "IPv4",
  isValid: true,
};

// Validate at runtime
ipv4AddressSchema.parse(ip); // ✅ Success
```

### DetectionState

Represents the current state of IP detection process.

**TypeScript Definition**:
```typescript
// types/ip.ts
export type DetectionStatus = 'idle' | 'loading' | 'success' | 'error' | 'retrying';

export interface DetectionState {
  status: DetectionStatus;
  error: string | null;      // Error message if status === 'error'
  retryCount: number;        // Number of retry attempts (0-3)
  lastAttempt: Date | null;  // Timestamp of last detection attempt
}
```

**Zod Schema**:
```typescript
// lib/validations/ip-schema.ts
export const detectionStatusSchema = z.enum(['idle', 'loading', 'success', 'error', 'retrying']);

export const detectionStateSchema = z.object({
  status: detectionStatusSchema,
  error: z.string().nullable(),
  retryCount: z.number().int().min(0).max(3),
  lastAttempt: z.date().nullable(),
});

export type DetectionState = z.infer<typeof detectionStateSchema>;
```

**State Transitions**:
```
idle → loading → success (happy path)
idle → loading → error (API failure)
error → retrying → loading (retry attempt)
retrying → error (max retries exceeded)
```

**Usage Example**:
```typescript
const [state, setState] = useState<DetectionState>({
  status: 'idle',
  error: null,
  retryCount: 0,
  lastAttempt: null,
});

// On detection start
setState({ status: 'loading', error: null, retryCount: 0, lastAttempt: new Date() });

// On success
setState({ status: 'success', error: null, retryCount: 0, lastAttempt: new Date() });

// On error
setState({ status: 'error', error: 'API unavailable', retryCount: 1, lastAttempt: new Date() });
```

### IPDetectionResult

Complete result from IP detection API including geolocation data.

**TypeScript Definition**:
```typescript
// types/ip.ts
export interface IPDetectionResult {
  // Core IP data
  ip: string;
  version: IPVersion;

  // Geolocation data (from IPstack API)
  country_code?: string;      // ISO 3166-1 alpha-2 (e.g., "US")
  country_name?: string;      // Full country name
  region_code?: string;       // ISO 3166-2 region code
  region_name?: string;       // Full region/state name
  city?: string;              // City name
  zip?: string;               // Postal code
  latitude?: number;          // -90 to 90
  longitude?: number;         // -180 to 180

  // Network data
  isp?: string;               // Internet Service Provider
  connection_type?: string;   // "cable", "dsl", "cellular", etc.
  organization?: string;      // Organization name

  // Metadata
  cached: boolean;            // True if from Vercel KV cache
  timestamp: string;          // ISO 8601 timestamp
}
```

**Zod Schema**:
```typescript
// lib/validations/ip-schema.ts
export const ipDetectionResultSchema = z.object({
  // Core IP data (required)
  ip: z.string().ip(),
  version: ipVersionSchema,

  // Geolocation data (optional - may not be available for all IPs)
  country_code: z.string().length(2).optional(),
  country_name: z.string().optional(),
  region_code: z.string().optional(),
  region_name: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Network data (optional)
  isp: z.string().optional(),
  connection_type: z.string().optional(),
  organization: z.string().optional(),

  // Metadata (required)
  cached: z.boolean(),
  timestamp: z.string().datetime(), // ISO 8601 format
});

export type IPDetectionResult = z.infer<typeof ipDetectionResultSchema>;
```

**Example Data**:
```json
{
  "ip": "8.8.8.8",
  "version": "IPv4",
  "country_code": "US",
  "country_name": "United States",
  "region_code": "CA",
  "region_name": "California",
  "city": "Mountain View",
  "zip": "94043",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "isp": "Google LLC",
  "connection_type": "corporate",
  "organization": "Google LLC",
  "cached": false,
  "timestamp": "2025-11-08T10:30:00.000Z"
}
```

**Usage Example**:
```typescript
// In API route handler
const result: IPDetectionResult = ipDetectionResultSchema.parse({
  ip: detectedIP,
  version: detectIPVersion(detectedIP),
  ...ipstackData,
  cached: fromCache,
  timestamp: new Date().toISOString(),
});

return NextResponse.json(result);
```

## Utility Types

### CopyState

Manages clipboard copy operation state.

**TypeScript Definition**:
```typescript
// types/ip.ts
export interface CopyState {
  copied: boolean;
  error: string | null;
}
```

**Usage Example**:
```typescript
const [copyState, setCopyState] = useState<CopyState>({
  copied: false,
  error: null,
});
```

### APIError

Standardized error response from API routes.

**TypeScript Definition**:
```typescript
// types/ip.ts
export interface APIError {
  error: string;             // User-friendly error message
  code: string;              // Machine-readable error code
  details?: Record<string, unknown>; // Additional error context
}
```

**Zod Schema**:
```typescript
// lib/validations/ip-schema.ts
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type APIError = z.infer<typeof apiErrorSchema>;
```

**Error Codes**:
```typescript
export const ERROR_CODES = {
  INVALID_IP: 'invalid_ip',
  RATE_LIMITED: 'rate_limited',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  NO_IP_PROVIDED: 'no_ip_provided',
  VALIDATION_FAILED: 'validation_failed',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

**Example Error Response**:
```json
{
  "error": "Invalid IP address format",
  "code": "invalid_ip",
  "details": {
    "provided": "999.999.999.999",
    "expected": "Valid IPv4 or IPv6 address"
  }
}
```

## Data Flow

### Server-Side Detection (Initial Page Load)

```
Request Headers
     ↓
headers() API (Next.js)
     ↓
Extract X-Forwarded-For / CF-Connecting-IP
     ↓
Validate with ipSchema.safeParse()
     ↓
Detect version (IPv4/IPv6)
     ↓
Create IPAddress object
     ↓
Render <IPDisplay> Server Component
```

### Client-Side Validation (Fallback/Retry)

```
User Action (page load / retry)
     ↓
Fetch /api/detect-ip
     ↓
Route Handler: Read headers or query param
     ↓
Check Vercel KV cache
     ↓
(Cache hit) → Return cached IPDetectionResult
     ↓
(Cache miss) → Call IPstack API
     ↓
Validate response with ipDetectionResultSchema
     ↓
Store in Vercel KV (5 min TTL)
     ↓
Return IPDetectionResult to client
     ↓
Update DetectionState (success/error)
```

### Copy Operation

```
User clicks copy button
     ↓
useCopyToClipboard hook invoked
     ↓
Try navigator.clipboard.writeText(ip.value)
     ↓
(Success) → Update CopyState { copied: true }
     ↓
(Failure) → Try document.execCommand('copy')
     ↓
(Success) → Update CopyState { copied: true }
     ↓
(Failure) → Update CopyState { error: "Clipboard unavailable" }
     ↓
Auto-reset after 2 seconds
```

## Validation Examples

### Valid IPv4 Addresses

```typescript
ipv4Schema.parse("192.168.1.1");      // ✅ Private network
ipv4Schema.parse("8.8.8.8");          // ✅ Public DNS
ipv4Schema.parse("127.0.0.1");        // ✅ Localhost
ipv4Schema.parse("255.255.255.255");  // ✅ Broadcast
```

### Valid IPv6 Addresses

```typescript
ipv6Schema.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // ✅ Full
ipv6Schema.parse("2001:db8:85a3::8a2e:370:7334");            // ✅ Compressed
ipv6Schema.parse("::1");                                      // ✅ Loopback
ipv6Schema.parse("fe80::1");                                  // ✅ Link-local
ipv6Schema.parse("::ffff:192.0.2.1");                         // ✅ IPv4-mapped
```

### Invalid IP Addresses

```typescript
ipSchema.safeParse("999.999.999.999");  // ❌ Out of range
ipSchema.safeParse("gggg::1");          // ❌ Invalid hex
ipSchema.safeParse("not-an-ip");        // ❌ Not IP format
ipSchema.safeParse("");                 // ❌ Empty string
ipSchema.safeParse("192.168.1");        // ❌ Incomplete IPv4
```

## Privacy & Security Considerations

### Data Retention

**Cache Storage (Vercel KV)**:
- **Key format**: `ip-lookup:${ipAddress}`
- **TTL**: 300 seconds (5 minutes)
- **Auto-expiration**: Keys automatically deleted after TTL
- **No manual cleanup needed**: Redis handles expiration

**Rationale**: 5-minute cache balances performance (reduce API calls) with privacy (no long-term storage).

### PII Handling

**IP Address Classification**: Personal Identifiable Information (PII) under GDPR Article 4(1).

**Compliance Measures**:
- **No persistent logging**: IPs only in ephemeral cache (5 min TTL)
- **No analytics tracking**: IP not sent to third-party analytics
- **No database storage**: No IP addresses in permanent storage
- **Legitimate interest**: IP detection is core service functionality
- **User transparency**: Privacy notice explains caching

### API Key Security

**Environment Variables**:
```
IPSTACK_API_KEY=<secret>  # Server-side only, never exposed to client
```

**Protection Mechanisms**:
- Route handler runs server-side (Edge Runtime)
- API key accessed via `process.env` (Node.js runtime)
- Next.js automatically excludes from client bundle
- `.env.local` in `.gitignore` (never committed)

## Testing Data

### Test IPs for Development

```typescript
export const TEST_IPS = {
  // IPv4
  localhost_v4: '127.0.0.1',
  private_v4: '192.168.1.1',
  public_v4: '8.8.8.8',  // Google DNS

  // IPv6
  localhost_v6: '::1',
  public_v6: '2001:4860:4860::8888',  // Google DNS
  ipv4_mapped: '::ffff:8.8.8.8',

  // Invalid
  invalid_ipv4: '999.999.999.999',
  invalid_ipv6: 'gggg::1',
  malformed: 'not-an-ip',
} as const;
```

### Mock API Responses

```typescript
export const MOCK_IP_DETECTION_RESULT: IPDetectionResult = {
  ip: '8.8.8.8',
  version: 'IPv4',
  country_code: 'US',
  country_name: 'United States',
  region_code: 'CA',
  region_name: 'California',
  city: 'Mountain View',
  zip: '94043',
  latitude: 37.4056,
  longitude: -122.0775,
  isp: 'Google LLC',
  connection_type: 'corporate',
  organization: 'Google LLC',
  cached: false,
  timestamp: '2025-11-08T10:30:00.000Z',
};
```

## Summary

This data model provides:
- **Type safety**: TypeScript definitions with Zod runtime validation
- **Privacy compliance**: Ephemeral cache, no persistent storage
- **Comprehensive validation**: All IP formats (IPv4, IPv6, edge cases)
- **Clear state management**: Explicit states for loading, success, error
- **API-first design**: Structured responses with error codes
- **Test coverage**: Mock data for unit and integration tests

All schemas follow the IP.ME constitution's security and privacy principles while ensuring robust data validation at API boundaries.
