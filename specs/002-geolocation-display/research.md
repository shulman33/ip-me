# Research: Geolocation Data Display

**Feature**: 002-geolocation-display
**Date**: 2025-11-09
**Status**: Phase 0 Complete

## Overview

This document consolidates research findings from the Technical Context phase, resolving all "NEEDS CLARIFICATION" items and documenting technology decisions for building the geolocation data display feature.

## Research Tasks Completed

### 1. IPstack API Integration Patterns (Free Tier)

**Decision**: Use existing `/api/detect-ip` route handler, extend response schema to include all geolocation fields

**Rationale**:
- IPstack API already integrated in the codebase ([src/app/api/detect-ip/route.ts:112-166](src/app/api/detect-ip/route.ts))
- Current implementation includes:
  - Server-side API calls (protects API key)
  - Upstash Redis caching with 5-minute TTL
  - Zod validation for responses
  - Error handling with graceful degradation
  - Free tier provides: country, region, city, postal code, coordinates, ISP, timezone
  - Free tier limitations: No connection type, HTTP only (not HTTPS)

**Implementation Notes**:
- IPstack response already includes all required fields (country_name, city, region_name, zip, latitude, longitude, connection.isp, location data)
- Current `transformIPstackResponse` function ([src/app/api/detect-ip/route.ts:82-107](src/app/api/detect-ip/route.ts)) already maps API response to our format
- Connection type is set to `undefined` on free tier ([src/app/api/detect-ip/route.ts:102](src/app/api/detect-ip/route.ts))
- **Action**: Extend Zod schema to validate all geolocation fields, update TypeScript types

**Alternatives Considered**:
- ipapi.co: Rejected - Less generous free tier (1000/day vs 1000/month), less reliable
- ip-api.com: Rejected - No commercial use allowed on free tier
- MaxMind GeoIP2: Rejected - Requires database hosting, more complex setup

**References**:
- IPstack API Docs: http://api.ipstack.com/documentation (HTTP endpoint for free tier)
- Existing implementation: [src/app/api/detect-ip/route.ts](src/app/api/detect-ip/route.ts)

---

### 2. Upstash Redis Caching Strategy (5-Minute TTL)

**Decision**: Use existing Upstash Redis setup, maintain 5-minute TTL for geolocation responses

**Rationale**:
- Redis client already initialized in `/api/detect-ip` route ([src/app/api/detect-ip/route.ts:29-34](src/app/api/detect-ip/route.ts))
- Current implementation:
  - Cache key format: `ip-lookup:{ip_address}`
  - TTL: 300 seconds (5 minutes)
  - Graceful degradation if Redis unavailable
  - Cache hit/miss logging for monitoring
- 5-minute TTL balances:
  - API call reduction (max 288 calls/day for single IP = 8,640/month << 1000 limit)
  - Data freshness (geolocation rarely changes within 5 minutes)
  - Free tier efficiency (Upstash Redis free tier: 10K commands/day)

**Implementation Notes**:
- Current caching flow ([src/app/api/detect-ip/route.ts:171-210](src/app/api/detect-ip/route.ts)):
  1. Check cache (Redis GET)
  2. On miss: Fetch from IPstack, store in cache (Redis SET with EX)
  3. On hit: Return cached data, update timestamp
- Cache storage uses full `IPDetectionResult` object (includes all geolocation fields)
- **Action**: No changes needed to caching logic, schema already includes geolocation data

**Alternatives Considered**:
- Next.js Data Cache (fetch API): Rejected - Less control over cache invalidation, no cross-request caching
- In-memory cache (Node.js Map): Rejected - Doesn't persist across serverless function invocations
- Longer TTL (15+ minutes): Rejected - Less responsive to VPN/proxy changes

**References**:
- Upstash Redis Docs: Fetched via Context7 (set/get with expiration examples)
- Next.js Caching Docs: Fetched via Context7 (App Router caching strategies)

---

### 3. shadcn/ui Component Selection & Dark Theme Integration

**Decision**: Install Card, Badge, and Skeleton components via shadcn CLI, customize with existing CSS variables

**Rationale**:
- shadcn/ui components are:
  - Accessible by default (Radix UI primitives)
  - Customizable (copy-paste into project, not npm dependency)
  - Dark theme compatible (uses Tailwind dark: variants)
- Existing dark theme setup ([src/app/globals.css:26-36](src/app/globals.css)):
  - CSS custom properties for colors (--background, --foreground, --card, --border, --color-green)
  - Automatic dark mode via `prefers-color-scheme: dark`
  - Tailwind integration via `@theme inline` directive
- Component mapping:
  - **Card**: Main container for geolocation data (CardHeader, CardContent, CardFooter)
  - **Badge**: Highlight tags (e.g., "Cached", connection type, timezone)
  - **Skeleton**: Loading placeholders (prevents CLS during data fetch)

**Implementation Notes**:
- Install via CLI: `npx shadcn@latest add card badge skeleton`
- Components will be added to `src/components/ui/`
- Default styling uses existing CSS variables (no conflicts)
- Example from Context7 docs:
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>IP Geolocation</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Data grid */}
    </CardContent>
  </Card>
  ```
- **Action**: Install components, verify dark theme compatibility, add custom variants if needed

**Alternatives Considered**:
- Material-UI (MUI): Rejected - Heavy bundle size, complex theming
- Custom components from scratch: Rejected - Reinvents accessibility, more maintenance
- Headless UI: Rejected - More boilerplate than shadcn/ui

**References**:
- shadcn/ui Card Docs: Fetched via Context7 (import and usage examples)
- shadcn/ui Badge Docs: Fetched via Context7 (variant examples)
- shadcn/ui Skeleton Docs: Fetched via Context7 (loading state patterns)

---

### 4. Responsive Grid Layout Strategy (Mobile/Tablet/Desktop)

**Decision**: CSS Grid with Tailwind breakpoints (sm/md/lg), 1-col → 2-col → 3-col progression

**Rationale**:
- Tailwind CSS 4 provides mobile-first breakpoints:
  - Default (< 640px): 1 column (mobile)
  - `sm:` (640px+): 1-2 columns (large mobile/small tablet)
  - `md:` (768px+): 2 columns (tablet)
  - `lg:` (1024px+): 3 columns (desktop)
- CSS Grid advantages over Flexbox:
  - Explicit column control (prevents unwanted wrapping)
  - Gap property for consistent spacing
  - Easier to maintain equal heights
- Constitution compliance:
  - Mobile-first design (Principle I: Performance)
  - No layout shift (grid defined upfront, CLS <0.1)

**Implementation Example**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <GeolocationCard title="Geographic Data">
    {/* Country, city, region, postal */}
  </GeolocationCard>
  <GeolocationCard title="Network Data">
    {/* ISP, connection type */}
  </GeolocationCard>
  <GeolocationCard title="Coordinates & Time">
    {/* Lat/long, timezone */}
  </GeolocationCard>
</div>
```

**Implementation Notes**:
- Each card is self-contained (semantic `<article>` or `<section>`)
- Gap spacing: `gap-4` (16px) for breathing room
- Cards adapt height automatically (CSS Grid implicit row sizing)
- **Action**: Build grid wrapper component, test responsive behavior

**Alternatives Considered**:
- Flexbox with wrapping: Rejected - Harder to control exact column counts
- Table layout: Rejected - Poor mobile responsiveness, semantic mismatch
- Single column on all viewports: Rejected - Wastes desktop screen space

**References**:
- Tailwind CSS Grid Docs: https://tailwindcss.com/docs/grid-template-columns
- Responsive Design: https://tailwindcss.com/docs/responsive-design

---

### 5. Flag Emoji Rendering Strategy

**Decision**: Use Unicode flag emojis (country code → emoji conversion), no fallback images

**Rationale**:
- IPstack API returns `country_code` (ISO 3166-1 alpha-2, e.g., "US", "GB")
- Unicode provides regional indicator symbols (U+1F1E6 - U+1F1FF)
- Conversion formula: `countryCode.split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')`
- Example: "US" → 🇺🇸, "GB" → 🇬🇧
- Advantages:
  - Zero HTTP requests (no image downloads)
  - Native OS rendering (consistent with system)
  - Works in all modern browsers (95%+ support)
- Edge cases:
  - Unknown country code → Show generic 🌍 globe emoji
  - Emoji not supported (old browsers) → Graceful degradation to text code (e.g., "US")

**Implementation Notes**:
- Utility function: `getCountryFlag(countryCode: string): string`
- Test with various country codes (US, GB, JP, BR, DE)
- Accessibility: Include `aria-label` with full country name
- **Action**: Create utility function, add tests for edge cases

**Alternatives Considered**:
- SVG flag library (flagpack, flag-icons): Rejected - Adds HTTP requests, bundle size
- Image CDN (Flagcdn.com): Rejected - External dependency, network latency
- Text-only country names: Rejected - Less visual, less engaging

**References**:
- Unicode Regional Indicators: https://en.wikipedia.org/wiki/Regional_indicator_symbol
- Browser support: https://caniuse.com/emoji

---

### 6. Coordinate Display Formatting

**Decision**: Show latitude/longitude with 4 decimal places (±11 meters precision), DMS conversion optional

**Rationale**:
- IPstack returns coordinates as floats (e.g., `37.7749`, `-122.4194`)
- Decimal degree precision:
  - 4 decimals: ±11.1 meters (sufficient for city-level accuracy)
  - 6 decimals: ±0.11 meters (overkill for IP geolocation)
- Format: `37.7749°N, 122.4194°W` (with degree symbol, cardinal direction)
- No DMS (Degrees-Minutes-Seconds) conversion in MVP:
  - Most users understand decimal degrees
  - Adds complexity (conversion logic, more screen space)
  - Can add later as toggle/preference

**Implementation Notes**:
- Utility function: `formatCoordinates(lat: number, lon: number): string`
- Example output: `"40.7128°N, 74.0060°W"`
- Handle edge cases:
  - Latitude: -90 to 90 (S to N)
  - Longitude: -180 to 180 (W to E)
  - Zero values: `0.0000°, 0.0000°` (Null Island)
- **Action**: Create formatting function, add unit tests

**Alternatives Considered**:
- DMS format (40°42'46"N): Rejected - Less familiar to general users
- Copy to clipboard for coordinates: Accepted - Add later as enhancement
- Link to Google Maps: Accepted - Add later as enhancement

**References**:
- Decimal degrees: https://en.wikipedia.org/wiki/Decimal_degrees

---

### 7. Timezone Display Strategy

**Decision**: Show timezone name + UTC offset (e.g., "America/New_York (UTC-5)")

**Rationale**:
- IPstack returns timezone object with:
  - `id`: IANA timezone identifier (e.g., "America/New_York")
  - `offset`: UTC offset in seconds (e.g., `-18000` = -5 hours)
  - Potentially `gmt_offset`, `code`, `is_daylight_saving` (varies by IPstack plan)
- Display format: `{timezone_id} (UTC{offset})`
  - Example: "America/New_York (UTC-5)" or "Europe/London (UTC+0)"
- Benefits:
  - Timezone name is unambiguous (handles DST automatically)
  - UTC offset provides quick reference for time difference
  - Familiar format (used by calendars, scheduling tools)

**Implementation Notes**:
- Utility function: `formatTimezone(timezoneId: string, offsetSeconds: number): string`
- Convert offset seconds to hours: `offsetHours = offsetSeconds / 3600`
- Format offset: `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`
- Handle edge cases:
  - Missing timezone data → Show "Timezone unavailable"
  - UTC+0 → "UTC+0" (not "UTC0")
- **Action**: Create formatting function, test with various timezones

**Alternatives Considered**:
- Offset only (e.g., "UTC-5"): Rejected - Doesn't convey DST, less specific
- Timezone name only: Rejected - Users need offset for quick time calculation
- Current local time: Rejected - Adds client-side JS, potential for staleness

**References**:
- IANA Timezone Database: https://www.iana.org/time-zones

---

### 8. Error Handling & Retry Mechanism

**Decision**: Display user-friendly error messages, provide retry button for transient failures

**Rationale**:
- Error sources:
  1. IPstack API failure (network, rate limit, invalid API key)
  2. Redis cache failure (connection timeout)
  3. Invalid IP address format
  4. Zod validation failure (malformed API response)
- Current error handling ([src/app/api/detect-ip/route.ts:291-312](src/app/api/detect-ip/route.ts)):
  - Returns structured JSON errors with `error`, `code`, `details` fields
  - HTTP status codes: 400 (client error), 500 (server error)
  - Logs errors server-side without exposing sensitive data
- UI error states:
  - Transient errors (network timeout): Show retry button
  - Permanent errors (invalid IP): Show error message, no retry
  - Graceful degradation: Show partial data if available

**Implementation Notes**:
- Error component: `GeolocationError.tsx` (Client Component)
  - Display error message from API response
  - Retry button triggers client-side refetch
  - Use existing error boundary ([src/app/error.tsx](src/app/error.tsx)) for unhandled errors
- Error messages (user-friendly):
  - API failure: "Unable to fetch location data. Please try again."
  - Invalid IP: "Invalid IP address format."
  - Timeout: "Request timed out. Please check your connection."
- **Action**: Create error component with retry logic, add error state tests

**Alternatives Considered**:
- Automatic retry (exponential backoff): Rejected - May waste API quota, prefer user-triggered
- Silent failure (no error shown): Rejected - Violates transparency principle
- Technical error messages (stack traces): Rejected - Violates privacy, confuses users

**References**:
- Next.js Error Handling: Fetched via Context7 (error.tsx boundaries)
- Existing error route: [src/app/error.tsx](src/app/error.tsx)

---

### 9. Loading State & Skeleton Components

**Decision**: Use shadcn/ui Skeleton component with reserved space matching final layout (prevents CLS)

**Rationale**:
- Constitution Principle I: CLS <0.1 requires no layout shift during load
- Strategy:
  1. Reserve exact space for data cards (height, width)
  2. Show skeleton placeholders (animated pulse effect)
  3. Replace skeletons with real data when loaded
- shadcn/ui Skeleton provides:
  - Accessible loading state (aria-busy, aria-label)
  - Pulse animation (smooth, not distracting)
  - Customizable dimensions (h-[20px], w-[100px], rounded-full)

**Implementation Notes**:
- Loading component: `GeolocationSkeleton.tsx`
  - Mirrors final card structure (same grid, same card count)
  - Skeleton for each data field (IP, country, city, etc.)
  - Example from Context7:
    ```tsx
    <Skeleton className="h-[20px] w-[100px] rounded-full" />
    ```
- React Suspense boundary (optional):
  - Wrap Server Component in `<Suspense fallback={<GeolocationSkeleton />}>`
  - Automatic loading state during data fetch
- **Action**: Build skeleton component, ensure dimensions match final layout

**Alternatives Considered**:
- Spinner/loading indicator: Rejected - Causes layout shift, less informative
- Blank space: Rejected - Poor UX, user doesn't know what's loading
- Progressive rendering (show data as it loads): Rejected - Complex for this feature

**References**:
- shadcn/ui Skeleton Docs: Fetched via Context7 (usage examples)
- React Suspense: https://react.dev/reference/react/Suspense

---

## Technology Stack Summary

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | Next.js (App Router) | 16.0.1 | Server Components, built-in caching, SEO optimization |
| **Language** | TypeScript | 5.x | Type safety, IDE support, catches errors early |
| **UI Library** | React | 19.2.0 | Component-based architecture, large ecosystem |
| **Component Library** | shadcn/ui | Latest | Accessible, customizable, dark theme compatible |
| **Styling** | Tailwind CSS | 4.x | Utility-first, mobile-first, small bundle size |
| **Fonts** | Geist Sans/Mono | 1.5.1 | Modern, readable, already configured |
| **Geolocation API** | IPstack | Free tier | 1000 requests/month, comprehensive data, existing integration |
| **Caching** | Upstash Redis | 1.35.6 | Serverless, 5-minute TTL, existing setup |
| **Validation** | Zod | 3.25.76 | Runtime type checking, API response validation |
| **Testing** | Jest + RTL | Existing | Unit tests, integration tests, accessibility tests |
| **Performance Monitoring** | Lighthouse CI | Existing | Core Web Vitals enforcement, performance budgets |

---

## Clarifications Resolved

All "NEEDS CLARIFICATION" items from Technical Context have been resolved:

1. ✅ **IPstack API Integration**: Use existing `/api/detect-ip` route, extend schema
2. ✅ **Upstash Redis Caching**: Use existing setup, 5-minute TTL confirmed
3. ✅ **shadcn/ui Components**: Install Card, Badge, Skeleton via CLI
4. ✅ **Responsive Grid**: CSS Grid with Tailwind breakpoints (1/2/3 columns)
5. ✅ **Flag Emojis**: Unicode flag conversion, no image fallbacks
6. ✅ **Coordinate Display**: 4 decimal places, decimal degrees format
7. ✅ **Timezone Display**: IANA name + UTC offset (e.g., "America/New_York (UTC-5)")
8. ✅ **Error Handling**: User-friendly messages, retry button for transient errors
9. ✅ **Loading States**: shadcn/ui Skeleton, reserved space (prevents CLS)

---

## Next Steps (Phase 1: Design & Contracts)

1. Generate [data-model.md](data-model.md) - Define TypeScript interfaces for geolocation data entities
2. Generate API contracts in [contracts/](contracts/) - Document API request/response schemas
3. Generate [quickstart.md](quickstart.md) - Developer onboarding guide
4. Update [CLAUDE.md](/CLAUDE.md) - Add new technologies to project context
5. Re-evaluate Constitution Check with detailed design

**Phase 0 Status**: ✅ COMPLETE - All research tasks resolved, no blockers for Phase 1.
