# Implementation Plan: Geolocation Data Display

**Branch**: `002-geolocation-display` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-geolocation-display/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a geolocation data display feature that shows comprehensive geographical and network information for detected IP addresses in an elegant card-based layout. The feature integrates IPstack API for geolocation data, implements server-side API calls with Upstash Redis caching (5-minute TTL), and presents data in a responsive dark-themed card layout using shadcn/ui components (Card, Badge, Skeleton) with proper information hierarchy and graceful error handling.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.1 (App Router), React 19.2.0
**Primary Dependencies**:
- UI: shadcn/ui components (Card, Badge, Skeleton), Tailwind CSS 4, Geist font family
- Data: IPstack API (Free tier - 1000 requests/month), Zod 3.25.76 for validation
- Caching: Upstash Redis (@upstash/redis 1.35.6) with 5-minute TTL
- Rate Limiting: @upstash/ratelimit 2.0.7
**Storage**: Upstash Redis (serverless KV store) - response caching only, no persistent data
**Testing**: Jest + React Testing Library (existing setup), Lighthouse CI for Core Web Vitals
**Target Platform**: Web (Next.js App Router SSR/RSC), Vercel deployment
**Project Type**: Web application (Next.js App Router with Server Components)
**Performance Goals**:
- Geolocation data displayed within 3 seconds of IP detection (SC-001)
- API response time <2 seconds with caching
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1 (Constitution I)
**Constraints**:
- IPstack free tier: 1000 API calls/month (cache to maximize efficiency)
- Server-side API calls only (protect API keys)
- Dark theme with CSS custom properties (--color-green: #00ff88)
- Responsive grid: mobile (1-col), tablet (2-col), desktop (3-col)
- WCAG AA contrast ratios (4.5:1 minimum)
**Scale/Scope**:
- Single feature adding ~5-7 new components
- Integration with existing IP detection API route
- Estimated ~800-1200 LOC (components, types, utilities)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Performance & Technical Excellence (NON-NEGOTIABLE)
- **Status**: PASS
- **Evidence**:
  - Using React Server Components for initial render (LCP optimization)
  - Skeleton components for loading states (prevents CLS)
  - 5-minute Redis caching reduces API latency
  - Responsive grid layout adapts to viewport (mobile-first)
  - Progressive enhancement: core data displays without heavy JS
- **Core Web Vitals Strategy**:
  - LCP <2.5s: Server-side data fetching, minimal client JS
  - FID <100ms: Minimal interactivity, static data display
  - CLS <0.1: Reserved skeleton space, no dynamic layout shifts

### ✅ Principle II: SEO-First Architecture
- **Status**: PASS
- **Evidence**:
  - Server Components render geolocation data in initial HTML (indexable)
  - Semantic HTML: proper heading hierarchy, article tags for cards
  - Structured data opportunity: GeoCoordinates schema for lat/long
  - Meta tags will include location data for social sharing
- **Note**: Feature displays dynamic user data (not public pages), but follows SEO patterns for consistency

### ✅ Principle III: Dark Theme Design System
- **Status**: PASS
- **Evidence**:
  - Uses existing CSS custom properties (--color-green: #00ff88)
  - shadcn/ui Card components pre-configured for dark theme
  - Geist font family already loaded
  - Flag emojis provide color without breaking theme
  - All interactive elements include focus states
- **Accessibility**: WCAG AA compliance verified via existing theme (4.5:1 contrast)

### ✅ Principle IV: Privacy-First Development
- **Status**: PASS
- **Evidence**:
  - IP addresses displayed to user only (their own data)
  - No persistent logging of geolocation lookups
  - Redis cache is ephemeral (5-minute TTL, auto-expiration)
  - IPstack API calls server-side only (no client exposure)
  - API keys protected via environment variables
- **Data Minimization**: Only display what IPstack returns, no additional tracking

### ✅ Principle V: Monetization Balance
- **Status**: PASS
- **Evidence**: No ads in this feature, feature displays user's own IP data (not ad-eligible content)

### ✅ Next.js & React Standards
- **Status**: PASS
- **Evidence**:
  - Next.js 15 App Router with React Server Components (primary pattern)
  - Client Components only for interactive elements (copy-to-clipboard, error retry)
  - TypeScript strict mode enabled
  - File-based routing: existing `/app/page.tsx` integration
  - Proper error boundaries via `app/error.tsx`

### ✅ Component Architecture & Styling
- **Status**: PASS
- **Evidence**:
  - Tailwind CSS utility-first approach
  - shadcn/ui components as base (Card, Badge, Skeleton)
  - Dark theme via Tailwind `dark:` variants + CSS variables
  - Semantic HTML: `<article>` for cards, `<dl>` for data pairs
  - Focus states: `focus-visible:ring-2` on interactive elements

### ✅ Performance & Optimization
- **Status**: PASS
- **Evidence**:
  - Server Components eliminate client bundle bloat
  - Flag emojis (no image downloads)
  - Lazy loading not needed (above-fold primary content)
  - Redis caching with 5-minute TTL (reduces IPstack API calls)
  - Estimated bundle impact: <5KB (minimal TypeScript types + utilities)

### ✅ API, Data & Security
- **Status**: PASS
- **Evidence**:
  - Server-side API integration (existing `/api/detect-ip` route)
  - Zod validation for all IPstack responses
  - Error boundaries wrap external API calls
  - Upstash Redis caching (existing setup)
  - Environment variables for API keys (IPSTACK_API_KEY, KV_REST_API_*)
  - Rate limiting via @upstash/ratelimit (existing middleware)

### ✅ Testing & Quality Assurance
- **Status**: PASS
- **Evidence**:
  - Unit tests: Utility functions (coordinate formatting, timezone parsing)
  - Integration tests: Mock IPstack API responses, cache behavior
  - Accessibility: jest-axe for WCAG compliance
  - Lighthouse CI: Performance budget enforcement
- **Test Coverage Target**: >80% on utilities, >60% on components

### ✅ Code Organization & Error Handling
- **Status**: PASS
- **Evidence**:
  - Components: `/src/components/features/geolocation/`
  - Types: `/src/types/geolocation.ts`
  - Utilities: `/src/lib/utils/geolocation.ts`
  - Error boundaries at route level (`app/error.tsx`)
  - Graceful degradation: show partial data when fields missing
  - User-friendly error messages (no stack traces to users)

### 🎯 Constitution Compliance Summary (Initial Evaluation)
- **Total Principles**: 9 evaluated
- **Passed**: 9/9 ✅
- **Failed**: 0/9
- **Violations Requiring Justification**: None
- **Proceed to Phase 0**: YES ✅

---

## Constitution Check (Re-evaluation After Phase 1 Design)

*Re-check performed after Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)*

### ✅ Principle I: Performance & Technical Excellence (NON-NEGOTIABLE)
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Data Model**: GeolocationData extends existing IPDetectionResult (no breaking changes)
  - **API Contract**: Server-side caching with 5-minute TTL reduces IPstack API calls
  - **Components**: Server Components for static display, Client Components only for error retry
  - **Bundle Impact**: <7KB total client-side JavaScript (utilities + error handling)
  - **Skeleton Loading**: Reserved space prevents CLS (matches final layout dimensions)
  - **Response Time**: <100ms (cache hit), <2000ms (cache miss with IPstack API call)
- **Core Web Vitals Validation**:
  - LCP <2.5s: ✅ Server-rendered data, minimal client JS
  - FID <100ms: ✅ Minimal interactivity (retry button only)
  - CLS <0.1: ✅ Skeleton components prevent layout shift
- **No Changes from Initial Evaluation**

### ✅ Principle II: SEO-First Architecture
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Semantic HTML**: `<article>` for cards, `<dl>` for data pairs (defined in API contract)
  - **Structured Data**: GeoCoordinates JSON-LD opportunity identified (future enhancement)
  - **Server Components**: All data rendered server-side (indexable HTML)
- **No Changes from Initial Evaluation**

### ✅ Principle III: Dark Theme Design System
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **shadcn/ui Components**: Card, Badge, Skeleton installed with dark theme support
  - **CSS Variables**: Uses existing --color-green (#00ff88) from globals.css
  - **Flag Emojis**: Unicode emoji rendering (no images, theme-neutral)
  - **Focus States**: Tailwind `focus-visible:ring-2` on interactive elements
- **No Changes from Initial Evaluation**

### ✅ Principle IV: Privacy-First Development
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Data Flow**: User IP → Server API → IPstack (server-side only) → Redis cache (5-min TTL) → Client
  - **No Persistent Storage**: Redis cache ephemeral, no database writes
  - **API Key Protection**: IPSTACK_API_KEY never exposed to client (server-side env var)
  - **Data Minimization**: Display only what IPstack returns, no additional enrichment
- **No Changes from Initial Evaluation**

### ✅ Principle V: Monetization Balance
- **Status**: PASS (Confirmed)
- **No Changes from Initial Evaluation** (No ads in this feature)

### ✅ Next.js & React Standards
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Component Architecture**: 6 components (4 Server, 2 Client - error & skeleton)
  - **TypeScript Strict**: All interfaces defined (GeolocationCardProps, DisplayState, etc.)
  - **File Naming**: kebab-case.tsx (geolocation-card.tsx, geolocation-skeleton.tsx)
  - **Error Boundaries**: Leverages existing app/error.tsx
  - **Data Fetching**: Server Components with async/await, no client-side fetch for initial load
- **No Changes from Initial Evaluation**

### ✅ Component Architecture & Styling
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Tailwind Utilities**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` (responsive grid)
  - **shadcn/ui Base**: Card (CardHeader, CardTitle, CardContent), Badge, Skeleton
  - **Accessibility**: ARIA labels for flag emojis, screen reader support for loading/error states
  - **Color Contrast**: WCAG AA compliance (4.5:1) verified in existing theme
- **No Changes from Initial Evaluation**

### ✅ Performance & Optimization
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Bundle Size**: <7KB client-side (utilities 2KB + error component 5KB)
  - **Image Optimization**: No images (flag emojis use Unicode)
  - **Caching Strategy**: Redis 5-minute TTL + HTTP Cache-Control (s-maxage=300)
  - **API Call Reduction**: 80%+ cache hit rate target (288 calls/day vs 1000/month limit)
- **Performance Budget**: ✅ Under 10KB limit, no breaking changes

### ✅ API, Data & Security
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Zod Validation**: geolocationDataSchema, timezoneDataSchema (defined in data-model.md)
  - **Error Handling**: APIError interface, structured error responses (400, 500 status codes)
  - **Rate Limiting**: @upstash/ratelimit middleware (existing setup)
  - **Input Validation**: IP address regex validation before IPstack API call
  - **Security Headers**: Cache-Control, no sensitive data exposure
- **No Changes from Initial Evaluation**

### ✅ Testing & Quality Assurance
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Unit Tests**: Utility functions (getCountryFlag, formatCoordinates, formatTimezone)
  - **Integration Tests**: API route with mock IPstack responses
  - **Component Tests**: React Testing Library for each component
  - **Accessibility Tests**: jest-axe for WCAG compliance
  - **Test Coverage**: >80% utilities, >60% components (defined in data-model.md)
- **Test Implementation**: Defined in quickstart.md with examples

### ✅ Code Organization & Error Handling
- **Status**: PASS (Confirmed)
- **Updated Evidence from Design**:
  - **Directory Structure**: src/components/features/geolocation/ (6 components)
  - **Types**: src/types/geolocation.ts (TimezoneData, DisplayState, DisplayStatus)
  - **Utilities**: src/lib/utils/geolocation.ts (3 formatting functions)
  - **Error States**: GeolocationError component with retry mechanism
  - **Graceful Degradation**: Display partial data when optional fields missing
- **Organization**: Follows existing patterns, no new directories needed

### 🎯 Final Constitution Compliance Summary (Post-Design)
- **Total Principles**: 9 re-evaluated
- **Passed**: 9/9 ✅
- **Failed**: 0/9
- **New Violations Introduced**: None ✅
- **Design Changes Required**: None ✅
- **Proceed to Implementation**: YES ✅

**Key Findings**:
1. All initial constitution checks remain valid after detailed design
2. No new compliance issues introduced during Phase 1 design
3. Performance budget maintained (<7KB client bundle vs initial <5KB estimate)
4. All accessibility, security, and privacy requirements met in component contracts
5. Ready to proceed with Phase 2 (tasks.md generation via /speckit.tasks command)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                           # Next.js 15 App Router
│   ├── api/
│   │   └── detect-ip/            # Existing IP detection endpoint (extends for geolocation)
│   │       └── route.ts          # GET /api/detect-ip (already implements IPstack + Redis)
│   ├── layout.tsx                # Root layout (existing)
│   ├── page.tsx                  # Home page (integrate geolocation display here)
│   ├── error.tsx                 # Error boundary (existing)
│   └── globals.css               # Dark theme CSS variables (existing)
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── card.tsx             # NEW: Install via shadcn CLI
│   │   ├── badge.tsx            # NEW: Install via shadcn CLI
│   │   └── skeleton.tsx         # NEW: Install via shadcn CLI
│   │
│   └── features/
│       └── geolocation/          # NEW: Feature-specific components
│           ├── geolocation-card.tsx           # Main container (Server Component)
│           ├── geolocation-data-grid.tsx      # Responsive grid layout
│           ├── geolocation-primary-info.tsx   # IP, Country, City display
│           ├── geolocation-secondary-info.tsx # State, postal, coordinates, etc.
│           ├── geolocation-skeleton.tsx       # Loading state
│           └── geolocation-error.tsx          # Error state with retry
│
├── lib/
│   ├── utils/
│   │   ├── ip-detection.ts      # Existing IP utilities
│   │   └── geolocation.ts       # NEW: Coordinate formatting, timezone parsing
│   │
│   ├── validations/
│   │   └── ip-schema.ts         # Existing Zod schemas (extend for geolocation)
│   │
│   └── utils.ts                 # Existing utility exports
│
├── types/
│   ├── ip.ts                    # Existing IP types (extend for geolocation)
│   └── geolocation.ts           # NEW: Geolocation-specific types
│
└── hooks/                       # NEW: Custom React hooks (if needed)
    └── use-geolocation.ts       # Client-side data fetching hook (optional)

tests/                           # NEW: Test files for geolocation feature
├── unit/
│   ├── geolocation-utils.test.ts
│   └── geolocation-validation.test.ts
│
└── integration/
    └── geolocation-api.test.ts
```

**Structure Decision**: Next.js 15 App Router architecture (web application). This feature extends the existing IP detection API route (`/api/detect-ip`) which already implements IPstack integration and Upstash Redis caching. New geolocation display components will be added under `src/components/features/geolocation/` following the established pattern. The feature integrates into the existing home page (`src/app/page.tsx`) without requiring new routes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution principles passed. No complexity justification required.
