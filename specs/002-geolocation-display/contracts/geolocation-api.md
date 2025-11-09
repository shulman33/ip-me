# API Contract: Geolocation Data Display

**Feature**: 002-geolocation-display
**Date**: 2025-11-09
**Phase**: 1 - Design & Contracts

## Overview

This document defines the API contracts for the geolocation data display feature. The feature extends the existing `/api/detect-ip` endpoint which already implements IPstack API integration and Upstash Redis caching.

**Note**: This feature does NOT create new API routes. It extends the existing endpoint and defines the UI component contracts.

---

## REST API Endpoints

### GET /api/detect-ip

**Description**: Detects client IP address and returns comprehensive geolocation data including geographic location, network information, and timezone details.

**Existing Implementation**: [src/app/api/detect-ip/route.ts](../../../src/app/api/detect-ip/route.ts)

**Status**: ✅ Already implemented (extends existing endpoint with full geolocation data)

#### Request

**Method**: `GET`

**URL**: `/api/detect-ip`

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `ip` | `string` | No | Specific IP address to lookup (if not provided, detected from headers) | `?ip=203.0.113.45` |

**Headers**:
- `x-forwarded-for`: Fallback for IP detection (automatically set by Vercel/proxy)
- `x-real-ip`: Fallback for IP detection
- `cf-connecting-ip`: Cloudflare IP (if applicable)

**Request Examples**:

```http
# Auto-detect IP from request headers
GET /api/detect-ip HTTP/1.1
Host: ip-me.vercel.app
Accept: application/json
```

```http
# Manual IP lookup
GET /api/detect-ip?ip=8.8.8.8 HTTP/1.1
Host: ip-me.vercel.app
Accept: application/json
```

#### Response

**Success Response (200 OK)**:

```typescript
{
  // Required fields (always present)
  ip: string;              // IP address (IPv4 or IPv6)
  version: "IPv4" | "IPv6"; // IP protocol version
  cached: boolean;          // Whether data is from Redis cache
  timestamp: string;        // ISO 8601 timestamp (e.g., "2025-11-09T10:30:00.000Z")

  // Optional geographic fields (may be undefined)
  country_code?: string;    // ISO 3166-1 alpha-2 code (e.g., "US")
  country_name?: string;    // Full country name (e.g., "United States")
  region_code?: string;     // ISO 3166-2 region code (e.g., "CA")
  region_name?: string;     // Full region/state name (e.g., "California")
  city?: string;            // City name (e.g., "San Francisco")
  zip?: string;             // Postal/ZIP code (e.g., "94102")

  // Optional coordinate fields
  latitude?: number;        // Latitude (-90 to 90)
  longitude?: number;       // Longitude (-180 to 180)

  // Optional network fields
  isp?: string;             // ISP name (e.g., "Comcast Cable")
  organization?: string;    // Organization name (e.g., "Comcast Cable Communications")
  connection_type?: string; // Connection type (undefined on IPstack free tier)

  // Optional timezone object
  timezone?: {
    id: string;                     // IANA timezone (e.g., "America/New_York")
    offset?: number;                // UTC offset in seconds (e.g., -18000 = -5 hours)
    code?: string;                  // Timezone abbreviation (e.g., "EST")
    gmt_offset?: number;            // GMT offset in hours (e.g., -5)
    is_daylight_saving?: boolean;   // DST active flag
  };
}
```

**Success Example** (Full Data):

```json
{
  "ip": "203.0.113.45",
  "version": "IPv4",
  "country_code": "US",
  "country_name": "United States",
  "region_code": "CA",
  "region_name": "California",
  "city": "San Francisco",
  "zip": "94102",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "isp": "Comcast Cable Communications",
  "organization": "Comcast Cable Communications",
  "connection_type": undefined,
  "timezone": {
    "id": "America/Los_Angeles",
    "offset": -28800,
    "code": "PST",
    "gmt_offset": -8,
    "is_daylight_saving": false
  },
  "cached": true,
  "timestamp": "2025-11-09T10:30:00.000Z"
}
```

**Success Example** (Partial Data - Missing Optional Fields):

```json
{
  "ip": "198.51.100.1",
  "version": "IPv4",
  "country_code": "XX",
  "country_name": "Unknown",
  "cached": false,
  "timestamp": "2025-11-09T10:35:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid IP Format:

```json
{
  "error": "Invalid IP address format",
  "code": "INVALID_IP",
  "details": {
    "provided": "not-an-ip",
    "expected": "Valid IPv4 or IPv6 address"
  }
}
```

**400 Bad Request** - No IP Provided:

```json
{
  "error": "No IP address provided and unable to detect from headers",
  "code": "NO_IP_PROVIDED"
}
```

**500 Internal Server Error** - API Failure:

```json
{
  "error": "IP detection service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

**500 Internal Server Error** - Validation Failure:

```json
{
  "error": "Failed to validate API response",
  "code": "VALIDATION_FAILED",
  "details": {
    "zodError": { /* Zod validation error details */ }
  }
}
```

#### Caching

**Strategy**: Server-side caching via Upstash Redis (existing implementation)

- **Cache Key**: `ip-lookup:{ip_address}` (e.g., `ip-lookup:203.0.113.45`)
- **TTL**: 300 seconds (5 minutes)
- **Behavior**:
  - Cache HIT: Return cached data, set `cached: true`, update `timestamp`
  - Cache MISS: Fetch from IPstack API, store in cache, set `cached: false`
  - Redis unavailable: Gracefully degrade to direct API calls (no caching)

**Client-Side Caching**:

```http
Cache-Control: public, s-maxage=300, stale-while-revalidate=60
```

- Browser/CDN cache: 5 minutes
- Stale-while-revalidate: 60 seconds (serve stale data while fetching fresh data)

#### Rate Limiting

**Implementation**: Existing `@upstash/ratelimit` middleware (if configured)

- **Limits**: To be determined (not specified in current implementation)
- **Response**: 429 Too Many Requests (if rate limit exceeded)

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

#### Security

- **API Key Protection**: IPstack API key stored in `IPSTACK_API_KEY` environment variable (server-side only)
- **HTTPS Enforcement**: All requests must use HTTPS in production
- **No PII Logging**: IP addresses not logged or persisted beyond cache TTL
- **Input Validation**: IP addresses validated via regex before API calls
- **Error Sanitization**: Internal errors logged server-side, user-friendly messages returned to client

---

## Component Contracts (TypeScript Interfaces)

### 1. GeolocationCard Component

**Description**: Main container component that displays geolocation data in a card-based layout.

**Component Type**: Server Component (default) or Client Component (if interactivity needed)

**Props Interface**:

```typescript
interface GeolocationCardProps {
  data: GeolocationData;      // Geolocation data to display (required)
  showSkeleton?: boolean;     // Show loading skeleton (default: false)
  onRetry?: () => void;       // Retry callback for error state (optional)
  className?: string;         // Additional CSS classes (optional)
  compact?: boolean;          // Compact view mode (default: false)
}
```

**Usage Example**:

```tsx
import { GeolocationCard } from '@/components/features/geolocation/geolocation-card';

export default async function Page() {
  // Fetch geolocation data (Server Component)
  const response = await fetch('http://localhost:3000/api/detect-ip', {
    cache: 'no-store' // Always fetch fresh data
  });
  const data = await response.json();

  return <GeolocationCard data={data} />;
}
```

---

### 2. GeolocationDataGrid Component

**Description**: Responsive grid layout component that arranges geolocation cards.

**Component Type**: Server Component

**Props Interface**:

```typescript
interface GeolocationDataGridProps {
  data: GeolocationData;      // Geolocation data (required)
  children?: React.ReactNode; // Optional child components
  className?: string;         // Additional CSS classes
}
```

**Behavior**:
- Mobile (<640px): 1-column grid
- Tablet (640-1024px): 2-column grid
- Desktop (>1024px): 3-column grid

**Usage Example**:

```tsx
<GeolocationDataGrid data={geolocationData}>
  <GeolocationPrimaryInfo data={geolocationData} />
  <GeolocationSecondaryInfo data={geolocationData} />
  <GeolocationNetworkInfo data={geolocationData} />
</GeolocationDataGrid>
```

---

### 3. GeolocationPrimaryInfo Component

**Description**: Displays primary geolocation info (IP, country, city) with prominent styling.

**Component Type**: Server Component

**Props Interface**:

```typescript
interface GeolocationPrimaryInfoProps {
  data: GeolocationData;  // Geolocation data (required)
  className?: string;     // Additional CSS classes
}
```

**Displayed Fields**:
- IP address (large, bold)
- Country name + flag emoji (large, bold)
- City name (large, bold)

**Behavior**:
- If `country_code` missing: Show "Unknown Country"
- If `city` missing: Show "City unavailable"
- Flag emoji from `getCountryFlag(data.country_code)`

---

### 4. GeolocationSecondaryInfo Component

**Description**: Displays secondary geolocation info (state, postal, coordinates, timezone).

**Component Type**: Server Component

**Props Interface**:

```typescript
interface GeolocationSecondaryInfoProps {
  data: GeolocationData;  // Geolocation data (required)
  className?: string;     // Additional CSS classes
}
```

**Displayed Fields**:
- State/Region (if available)
- Postal code (if available)
- Coordinates (formatted via `formatCoordinates()`)
- Timezone (formatted via `formatTimezone()`)

**Behavior**:
- Only show fields that are present in `data`
- Hide fields with undefined values (no "Not available" placeholders)

---

### 5. GeolocationSkeleton Component

**Description**: Loading skeleton component that reserves space for geolocation data.

**Component Type**: Server Component (static markup)

**Props Interface**:

```typescript
interface GeolocationSkeletonProps {
  className?: string; // Additional CSS classes
}
```

**Behavior**:
- Renders skeleton placeholders matching final layout dimensions
- Uses shadcn/ui `<Skeleton>` component
- Prevents layout shift (CLS <0.1)

**Usage Example**:

```tsx
import { Suspense } from 'react';
import { GeolocationCard } from '@/components/features/geolocation/geolocation-card';
import { GeolocationSkeleton } from '@/components/features/geolocation/geolocation-skeleton';

export default async function Page() {
  return (
    <Suspense fallback={<GeolocationSkeleton />}>
      <GeolocationCard data={await fetchGeolocationData()} />
    </Suspense>
  );
}
```

---

### 6. GeolocationError Component

**Description**: Error state component with user-friendly message and retry button.

**Component Type**: Client Component (uses onClick handler)

**Props Interface**:

```typescript
interface GeolocationErrorProps {
  error: APIError;         // Error details from API (required)
  onRetry: () => void;     // Retry callback (required)
  className?: string;      // Additional CSS classes
}
```

**Behavior**:
- Display user-friendly error message (from `error.error` field)
- Show retry button (calls `onRetry` on click)
- Log error details to console (development only)

**Usage Example**:

```tsx
'use client';

import { GeolocationError } from '@/components/features/geolocation/geolocation-error';

export function GeolocationWrapper() {
  const [error, setError] = useState<APIError | null>(null);

  const handleRetry = () => {
    setError(null);
    // Trigger refetch logic
  };

  if (error) {
    return <GeolocationError error={error} onRetry={handleRetry} />;
  }

  // Normal rendering...
}
```

---

## Event Contracts (User Actions)

### 1. Manual IP Lookup

**Trigger**: User enters custom IP address in input field

**Action**: Client-side fetch to `/api/detect-ip?ip={userIP}`

**State Transition**: `idle` → `loading` → `success` | `error` | `partial`

### 2. Retry on Error

**Trigger**: User clicks "Retry" button after fetch failure

**Action**: Client-side refetch to `/api/detect-ip`

**State Transition**: `error` → `loading` → `success` | `error` | `partial`

### 3. Copy to Clipboard (Future Enhancement)

**Trigger**: User clicks "Copy" button next to IP address or coordinates

**Action**: `navigator.clipboard.writeText(data)`

**Feedback**: Show toast notification "Copied to clipboard"

---

## Validation Contracts

### Request Validation

- **IP Address Format**: Validated via Zod schema (`z.string().ip()`)
- **Query Parameter Types**: String only (no SQL injection risk)

### Response Validation

- **Zod Schema**: `geolocationDataSchema.parse(apiResponse)`
- **Required Fields**: `ip`, `version`, `cached`, `timestamp`
- **Optional Fields**: All other fields gracefully handled if missing

### Error Handling

- **Network Errors**: Catch fetch failures, return generic error message
- **API Errors**: Parse error response, display user-friendly message
- **Validation Errors**: Log Zod errors server-side, return sanitized error to client

---

## Testing Contracts

### API Route Tests (Integration)

```typescript
describe('GET /api/detect-ip', () => {
  it('should return geolocation data for valid IP', async () => {
    const response = await fetch('/api/detect-ip?ip=8.8.8.8');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ip).toBe('8.8.8.8');
    expect(data.version).toBe('IPv4');
    expect(data.cached).toBeDefined();
  });

  it('should return 400 for invalid IP format', async () => {
    const response = await fetch('/api/detect-ip?ip=not-an-ip');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('INVALID_IP');
  });

  it('should cache results for 5 minutes', async () => {
    // First request (cache miss)
    const response1 = await fetch('/api/detect-ip?ip=8.8.8.8');
    const data1 = await response1.json();
    expect(data1.cached).toBe(false);

    // Second request (cache hit)
    const response2 = await fetch('/api/detect-ip?ip=8.8.8.8');
    const data2 = await response2.json();
    expect(data2.cached).toBe(true);
  });
});
```

### Component Tests (Unit)

```typescript
describe('GeolocationCard', () => {
  it('should render primary info (IP, country, city)', () => {
    const mockData: GeolocationData = {
      ip: '8.8.8.8',
      version: 'IPv4',
      country_code: 'US',
      country_name: 'United States',
      city: 'Mountain View',
      cached: false,
      timestamp: new Date().toISOString(),
    };

    render(<GeolocationCard data={mockData} />);

    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    expect(screen.getByText(/United States/)).toBeInTheDocument();
    expect(screen.getByText('Mountain View')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const mockData: GeolocationData = {
      ip: '8.8.8.8',
      version: 'IPv4',
      cached: false,
      timestamp: new Date().toISOString(),
    };

    render(<GeolocationCard data={mockData} />);

    expect(screen.queryByText('State/Region')).not.toBeInTheDocument();
    expect(screen.queryByText('City')).not.toBeInTheDocument();
  });
});
```

---

## Performance Contracts

### Response Time Targets

- **Cache Hit**: <100ms (Redis GET + JSON serialization)
- **Cache Miss**: <2000ms (IPstack API call + Redis SET)
- **Error Response**: <50ms (validation failure, return error)

### Caching Efficiency

- **Cache Hit Rate**: Target >80% in production (5-minute TTL)
- **API Call Reduction**: Max 288 calls/day for single IP (vs 17,280 without caching)
- **Free Tier Compliance**: <1000 IPstack API calls/month

### Bundle Size Impact

- **Server Components**: 0KB client bundle (rendered server-side)
- **Client Components**: <5KB (error handling, retry logic only)
- **Utilities**: <2KB (coordinate/timezone formatting)
- **Total**: <7KB added to client bundle

---

## Accessibility Contracts

### Semantic HTML

- Use `<article>` for geolocation cards
- Use `<dl>` (description list) for data key-value pairs
- Use `<button>` for retry action (not `<div>` with onClick)

### ARIA Labels

```tsx
<button onClick={onRetry} aria-label="Retry fetching geolocation data">
  Retry
</button>

<span aria-label={`${data.country_name} flag`}>
  {getCountryFlag(data.country_code)}
</span>
```

### Keyboard Navigation

- All interactive elements (retry button) must be keyboard accessible
- Focus indicators visible (Tailwind `focus-visible:ring-2`)

### Screen Reader Support

- Meaningful text for all data fields
- Loading state announced via `aria-live="polite"`
- Error state announced via `aria-live="assertive"`

---

**Phase 1 Status**: API contracts defined, ready for quickstart documentation.
