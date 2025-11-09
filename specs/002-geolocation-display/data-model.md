# Data Model: Geolocation Data Display

**Feature**: 002-geolocation-display
**Date**: 2025-11-09
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data entities, TypeScript interfaces, and validation schemas for the geolocation data display feature. All entities extend the existing IP detection data model defined in [src/types/ip.ts](src/types/ip.ts).

---

## Entity Definitions

### 1. GeolocationData

**Description**: Comprehensive geolocation information returned by IPstack API and displayed in the UI. Extends the existing `IPDetectionResult` interface.

**Source**: IPstack API response, transformed and cached in Redis

**Lifecycle**: Ephemeral (5-minute cache TTL), not persisted to database

**Fields**:

| Field Name | Type | Required | Description | Validation Rules | Example |
|------------|------|----------|-------------|------------------|---------|
| `ip` | `string` | ✅ Yes | IP address (IPv4 or IPv6) | Valid IP format (regex validated) | `"203.0.113.45"` |
| `version` | `IPVersion` | ✅ Yes | IP protocol version | Enum: `"IPv4" \| "IPv6"` | `"IPv4"` |
| `country_code` | `string` | ❌ No | ISO 3166-1 alpha-2 country code | 2 uppercase letters | `"US"` |
| `country_name` | `string` | ❌ No | Full country name | Non-empty string | `"United States"` |
| `region_code` | `string` | ❌ No | ISO 3166-2 region code | 2-3 uppercase letters/digits | `"CA"` |
| `region_name` | `string` | ❌ No | Full region/state name | Non-empty string | `"California"` |
| `city` | `string` | ❌ No | City name | Non-empty string | `"San Francisco"` |
| `zip` | `string` | ❌ No | Postal/ZIP code | Non-empty string | `"94102"` |
| `latitude` | `number` | ❌ No | Latitude coordinate | -90 to 90 | `37.7749` |
| `longitude` | `number` | ❌ No | Longitude coordinate | -180 to 180 | `-122.4194` |
| `isp` | `string` | ❌ No | Internet Service Provider name | Non-empty string | `"Comcast Cable"` |
| `organization` | `string` | ❌ No | Organization name | Non-empty string | `"Comcast Cable Communications"` |
| `connection_type` | `string` | ❌ No | Connection type (not available on IPstack free tier) | Non-empty string or undefined | `undefined` |
| `timezone` | `TimezoneData` | ❌ No | Timezone information | Object with id, offset, code | (see TimezoneData) |
| `cached` | `boolean` | ✅ Yes | Whether data is from cache | Boolean | `true` |
| `timestamp` | `string` | ✅ Yes | ISO 8601 timestamp of fetch | Valid ISO string | `"2025-11-09T10:30:00.000Z"` |

**Relationships**:
- Extends: `IPDetectionResult` (existing type)
- Contains: `TimezoneData` (nested object)
- Uses: `IPVersion` (existing enum)

**State Transitions**: N/A (read-only data, no state machine)

**Validation Schema** (Zod):
```typescript
import { z } from 'zod';

const geolocationDataSchema = z.object({
  ip: z.string().ip(),
  version: z.enum(['IPv4', 'IPv6']),
  country_code: z.string().length(2).toUpperCase().optional(),
  country_name: z.string().min(1).optional(),
  region_code: z.string().min(2).max(3).toUpperCase().optional(),
  region_name: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  zip: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isp: z.string().min(1).optional(),
  organization: z.string().min(1).optional(),
  connection_type: z.string().min(1).optional(),
  timezone: timezoneDataSchema.optional(),
  cached: z.boolean(),
  timestamp: z.string().datetime(),
});
```

---

### 2. TimezoneData

**Description**: Timezone information including IANA identifier and UTC offset.

**Source**: IPstack API response (nested in geolocation object)

**Lifecycle**: Embedded within `GeolocationData`, same 5-minute cache TTL

**Fields**:

| Field Name | Type | Required | Description | Validation Rules | Example |
|------------|------|----------|-------------|------------------|---------|
| `id` | `string` | ✅ Yes | IANA timezone identifier | Non-empty string, valid timezone | `"America/New_York"` |
| `offset` | `number` | ❌ No | UTC offset in seconds | Integer, -43200 to 50400 | `-18000` |
| `code` | `string` | ❌ No | Timezone abbreviation | 3-5 uppercase letters | `"EST"` or `"PDT"` |
| `gmt_offset` | `number` | ❌ No | GMT offset in hours | Integer, -12 to 14 | `-5` |
| `is_daylight_saving` | `boolean` | ❌ No | Whether DST is active | Boolean | `false` |

**Relationships**:
- Embedded in: `GeolocationData`
- No direct relationships to other entities

**Validation Schema** (Zod):
```typescript
const timezoneDataSchema = z.object({
  id: z.string().min(1), // IANA timezone (e.g., "America/New_York")
  offset: z.number().int().min(-43200).max(50400).optional(), // UTC offset in seconds
  code: z.string().min(3).max(5).toUpperCase().optional(), // Timezone code (EST, PDT)
  gmt_offset: z.number().int().min(-12).max(14).optional(), // GMT offset in hours
  is_daylight_saving: z.boolean().optional(),
});
```

---

### 3. DisplayState

**Description**: UI state machine for geolocation data fetching and display. Used by Client Components to track loading, success, error, and partial data states.

**Source**: Client-side React state (useState, useReducer, or server action state)

**Lifecycle**: Component-scoped, resets on page navigation

**States**:

| State | Description | Transitions To | UI Behavior |
|-------|-------------|----------------|-------------|
| `idle` | Initial state, no data fetched | `loading` | Show "Detect IP" button or auto-trigger fetch |
| `loading` | Data fetch in progress | `success`, `error`, `partial` | Show skeleton components |
| `success` | Full geolocation data loaded | `loading` (on refetch) | Show complete data cards |
| `partial` | Some geolocation fields missing | `loading` (on retry) | Show available data, hide missing fields |
| `error` | Fetch failed (network, API error) | `loading` (on retry) | Show error message + retry button |

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `status` | `DisplayStatus` | ✅ Yes | Current state | Enum: `idle \| loading \| success \| partial \| error` |
| `data` | `GeolocationData` | ❌ No | Geolocation data (when available) | Valid GeolocationData or null |
| `error` | `APIError` | ❌ No | Error details (when status is error) | Valid APIError or null |

**State Transitions**:
```
idle → loading (user triggers fetch or auto-fetch)
loading → success (API returns complete data)
loading → partial (API returns data with missing fields)
loading → error (API fails, network error, validation error)
error → loading (user clicks retry)
partial → loading (user clicks retry/refresh)
success → loading (user triggers manual refetch)
```

**TypeScript Interface**:
```typescript
type DisplayStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error';

interface DisplayState {
  status: DisplayStatus;
  data: GeolocationData | null;
  error: APIError | null;
}
```

**Validation Rules**:
- If `status === 'success' || status === 'partial'`, `data` must be non-null
- If `status === 'error'`, `error` must be non-null
- If `status === 'idle' || status === 'loading'`, `data` and `error` should be null

---

### 4. GeolocationCardProps

**Description**: Props interface for geolocation display components. Defines the contract between parent and child components.

**Source**: Component props passed from Server Component to Client Component (or within Client Components)

**Lifecycle**: Component render scope

**Fields**:

| Field Name | Type | Required | Description | Default |
|------------|------|----------|-------------|---------|
| `data` | `GeolocationData` | ✅ Yes | Geolocation data to display | N/A (required) |
| `showSkeleton` | `boolean` | ❌ No | Whether to show loading skeleton | `false` |
| `onRetry` | `() => void` | ❌ No | Callback for retry button (error state) | `undefined` |
| `className` | `string` | ❌ No | Additional CSS classes | `""` |
| `compact` | `boolean` | ❌ No | Whether to show compact view | `false` |

**TypeScript Interface**:
```typescript
interface GeolocationCardProps {
  data: GeolocationData;
  showSkeleton?: boolean;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}
```

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     IPDetectionResult                        │
│  (Existing type from src/types/ip.ts)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ip: string                                          │    │
│  │ version: IPVersion                                  │    │
│  │ cached: boolean                                     │    │
│  │ timestamp: string                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ extends
                            │
┌─────────────────────────────────────────────────────────────┐
│                      GeolocationData                         │
│  (New extended type for this feature)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ...all fields from IPDetectionResult                │    │
│  │ country_code?: string                               │    │
│  │ country_name?: string                               │    │
│  │ region_code?: string                                │    │
│  │ region_name?: string                                │    │
│  │ city?: string                                       │    │
│  │ zip?: string                                        │    │
│  │ latitude?: number                                   │    │
│  │ longitude?: number                                  │    │
│  │ isp?: string                                        │    │
│  │ organization?: string                               │    │
│  │ connection_type?: string                            │    │
│  │ timezone?: TimezoneData ─────────────────────┐      │    │
│  └─────────────────────────────────────────────┼──────┘    │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                                 │ embeds
                                                 ▼
                            ┌─────────────────────────────────┐
                            │       TimezoneData              │
                            │  ┌─────────────────────────┐    │
                            │  │ id: string              │    │
                            │  │ offset?: number         │    │
                            │  │ code?: string           │    │
                            │  │ gmt_offset?: number     │    │
                            │  │ is_daylight_saving?: bool│   │
                            │  └─────────────────────────┘    │
                            └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       DisplayState                           │
│  (Client-side UI state)                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ status: DisplayStatus                               │    │
│  │ data: GeolocationData | null ───────────────────────┼────┼──> References GeolocationData
│  │ error: APIError | null                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Transformations

### 1. IPstack API Response → GeolocationData

**Transformation Logic** (exists in [src/app/api/detect-ip/route.ts:82-107](src/app/api/detect-ip/route.ts)):

```typescript
function transformIPstackResponse(
  data: IPstackResponse,
  ip: string,
  cached: boolean
): GeolocationData {
  return {
    ip: data.ip || ip,
    version: data.type === 'ipv6' ? 'IPv6' : 'IPv4',
    country_code: data.country_code,
    country_name: data.country_name,
    region_code: data.region_code,
    region_name: data.region_name,
    city: data.city,
    zip: data.zip,
    latitude: data.latitude,
    longitude: data.longitude,
    isp: data.connection?.isp,
    organization: data.connection?.isp, // Use ISP as organization on free tier
    connection_type: undefined, // Not available on free tier
    timezone: data.timezone ? {
      id: data.timezone.id,
      offset: data.timezone.offset,
      code: data.timezone.code,
      gmt_offset: data.timezone.gmt_offset,
      is_daylight_saving: data.timezone.is_daylight_saving,
    } : undefined,
    cached,
    timestamp: new Date().toISOString(),
  };
}
```

**Validation**: Apply `geolocationDataSchema.parse(result)` before returning to client

### 2. Country Code → Flag Emoji

**Transformation Logic** (new utility function):

```typescript
export function getCountryFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'; // Globe emoji for unknown countries
  }

  // Convert ISO 3166-1 alpha-2 to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Examples:
// getCountryFlag('US') → '🇺🇸'
// getCountryFlag('GB') → '🇬🇧'
// getCountryFlag('JP') → '🇯🇵'
// getCountryFlag(undefined) → '🌍'
```

### 3. Coordinates → Formatted String

**Transformation Logic** (new utility function):

```typescript
export function formatCoordinates(
  latitude: number | undefined,
  longitude: number | undefined
): string {
  if (latitude === undefined || longitude === undefined) {
    return 'Coordinates unavailable';
  }

  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';

  const latFormatted = Math.abs(latitude).toFixed(4);
  const lonFormatted = Math.abs(longitude).toFixed(4);

  return `${latFormatted}°${latDirection}, ${lonFormatted}°${lonDirection}`;
}

// Examples:
// formatCoordinates(37.7749, -122.4194) → '37.7749°N, 122.4194°W'
// formatCoordinates(-33.8688, 151.2093) → '33.8688°S, 151.2093°E'
// formatCoordinates(undefined, undefined) → 'Coordinates unavailable'
```

### 4. Timezone Data → Formatted String

**Transformation Logic** (new utility function):

```typescript
export function formatTimezone(timezone: TimezoneData | undefined): string {
  if (!timezone || !timezone.id) {
    return 'Timezone unavailable';
  }

  let formatted = timezone.id;

  if (timezone.offset !== undefined) {
    const offsetHours = timezone.offset / 3600;
    const sign = offsetHours >= 0 ? '+' : '';
    formatted += ` (UTC${sign}${offsetHours})`;
  } else if (timezone.gmt_offset !== undefined) {
    const sign = timezone.gmt_offset >= 0 ? '+' : '';
    formatted += ` (UTC${sign}${timezone.gmt_offset})`;
  }

  return formatted;
}

// Examples:
// formatTimezone({ id: 'America/New_York', offset: -18000 }) → 'America/New_York (UTC-5)'
// formatTimezone({ id: 'Europe/London', offset: 0 }) → 'Europe/London (UTC+0)'
// formatTimezone({ id: 'Asia/Tokyo', gmt_offset: 9 }) → 'Asia/Tokyo (UTC+9)'
// formatTimezone(undefined) → 'Timezone unavailable'
```

---

## Validation Rules Summary

### Required Fields (Must Always Be Present)
- `ip` (string, valid IP format)
- `version` (enum: IPv4 | IPv6)
- `cached` (boolean)
- `timestamp` (ISO 8601 string)

### Optional Fields (Graceful Degradation)
All other fields are optional and will be handled gracefully if missing:
- Geographic: `country_code`, `country_name`, `region_code`, `region_name`, `city`, `zip`
- Coordinates: `latitude`, `longitude` (both required together, or both optional)
- Network: `isp`, `organization`, `connection_type`
- Time: `timezone` (entire object optional)

### Validation Error Handling
- **Invalid IP**: Return 400 error, do not proceed
- **Missing optional fields**: Display "Not available" or hide field
- **Malformed API response**: Log error, return partial data if possible
- **Coordinates out of range**: Reject with validation error (lat: -90 to 90, lon: -180 to 180)

---

## Implementation Checklist

- [ ] Extend `src/types/ip.ts` with `GeolocationData` interface
- [ ] Create `src/types/geolocation.ts` for new types (TimezoneData, DisplayState, DisplayStatus)
- [ ] Update `src/lib/validations/ip-schema.ts` with Zod schemas (geolocationDataSchema, timezoneDataSchema)
- [ ] Create `src/lib/utils/geolocation.ts` with transformation utilities:
  - `getCountryFlag(countryCode)`
  - `formatCoordinates(lat, lon)`
  - `formatTimezone(timezone)`
- [ ] Add unit tests for all utility functions
- [ ] Verify existing API route returns all required fields
- [ ] Update API route to validate response with extended schema

---

**Phase 1 Status**: Data model defined, ready for API contract generation.
