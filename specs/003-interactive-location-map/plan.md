# Implementation Plan: Interactive Location Map

**Branch**: `003-interactive-location-map` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-interactive-location-map/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an interactive map component using Mapbox GL JS that visualizes the user's detected location with a glowing green pin marker. The map will be responsive (full-width mobile, 60% desktop), dark-themed to match the existing design system, and positioned below the geolocation cards. The component will integrate with existing geolocation data (latitude/longitude), handle missing coordinates gracefully, and include zoom/pan controls with proper cleanup on unmount.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.1 (App Router), React 19.2.0
**Primary Dependencies**: Mapbox GL JS (NEEDS CLARIFICATION - version), React 19.2.0, Next.js 16.0.1, Tailwind CSS 4
**Storage**: N/A (reads from existing geolocation state, no persistence)
**Testing**: Jest + React Testing Library for unit tests, Playwright for E2E map interaction tests
**Target Platform**: Modern browsers with WebGL support (Chrome 79+, Firefox 70+, Safari 13+, Edge 79+)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**:
- Map load within 2 seconds of geolocation data availability
- Interactions (pan/zoom) respond within 100ms
- CLS < 0.1 (reserved space for map container)
- Bundle impact: NEEDS CLARIFICATION (dynamic import of Mapbox GL JS)
**Constraints**:
- No map service API key exposure to client (NEEDS CLARIFICATION - server-side rendering approach)
- Dark theme styling must match existing design system (#00ff88 green, dark background)
- Respect prefers-reduced-motion for pulse animation
- Graceful degradation when WebGL unavailable
**Scale/Scope**:
- Single map component with ~300-500 LOC
- Integration with existing GeolocationData interface
- Environment variable for Mapbox access token

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Web Vitals Compliance
- ✅ **LCP < 2.5s**: Map lazy-loaded with dynamic import, won't affect above-fold LCP
- ✅ **FID < 100ms**: Map interactions use requestAnimationFrame, optimized event handlers
- ⚠️ **CLS < 0.1**: MUST reserve exact height (300-400px) for map container to prevent layout shift
- ✅ **Mobile-first**: Responsive design specified (full-width mobile, 60% desktop)
- ✅ **Progressive enhancement**: Core geolocation data works without map, map is enhancement

**Actions Required**: Implement fixed height reservation for map container, verify no layout shift during load

### SEO-First Architecture
- ✅ **Semantic HTML**: Map wrapped in `<section>` with proper ARIA labels
- ✅ **SSR for indexed content**: Map is client-side only (marked with 'use client'), geolocation data remains server-rendered
- N/A **Structured data**: Map is UI enhancement, doesn't affect existing JSON-LD
- ✅ **Meta tags**: No changes needed, map doesn't affect page metadata

**Status**: PASS - Map is visual enhancement, doesn't impact SEO of core content

### Dark Theme Design System
- ✅ **Dark theme (#0a0a0a)**: Mapbox dark-v11 style matches background
- ✅ **Electric green (#00ff88)**: Custom marker uses existing --color-green
- ✅ **Glass-morphism**: Map container can use existing card styling with backdrop-blur
- ✅ **Focus states**: Navigation controls will have visible focus indicators
- ✅ **WCAG AA contrast**: Dark map + green marker meets 4.5:1 ratio

**Status**: PASS - All design system requirements met

### Privacy-First Development
- ✅ **Minimal data collection**: Uses existing geolocation data, no new collection
- ✅ **No tracking**: Map display is client-side only, no logging
- ⚠️ **API key security**: Mapbox access token MUST be public (NEXT_PUBLIC_*) as it's client-side
  - Mitigation: URL restrictions on Mapbox token to prevent abuse
  - Alternative: NEEDS RESEARCH - server-side tile proxy (adds complexity)
- ✅ **No data persistence**: Map state not saved, coordinates from existing data

**Actions Required**: Research Mapbox token security best practices, implement URL restrictions

### Monetization Balance
- ✅ **No CWV impact**: Map lazy-loaded below fold, doesn't affect ad placement
- ✅ **No layout shift**: Reserved space prevents ad container displacement
- N/A **Ad placement**: Map positioned below geolocation cards, doesn't interfere with ad units

**Status**: PASS - No impact on existing monetization strategy

### Next.js & React Standards
- ✅ **Next.js 16 App Router**: Component follows existing patterns
- ✅ **Client Component**: Map requires browser APIs (window, DOM), 'use client' directive needed
- ✅ **TypeScript strict mode**: All props typed with interfaces
- ✅ **File-based routing**: Component in `/components/features/map/`

**Status**: PASS - Follows established patterns

### Performance & Optimization
- ⚠️ **Bundle size < 100KB total**: Mapbox GL JS is ~60KB gzipped
  - MUST use dynamic import: `const MapComponent = dynamic(() => import('./map'), { ssr: false })`
  - NEEDS VERIFICATION: Check total bundle size after addition
- ✅ **Lazy loading**: Map loaded only when geolocation data available and in viewport
- ✅ **Image optimization**: Map tiles loaded progressively by Mapbox GL JS

**Actions Required**: Implement dynamic import, verify bundle size with `@next/bundle-analyzer`

### Security Requirements
- ✅ **Environment variables**: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local
- ⚠️ **CSP compliance**: NEEDS CLARIFICATION - Mapbox domains must be whitelisted in CSP
  - Required CSP additions: `img-src api.mapbox.com`, `script-src api.mapbox.com`, `worker-src blob:`
- ✅ **HTTPS enforcement**: Mapbox requires HTTPS in production
- N/A **Rate limiting**: Mapbox handles rate limiting at API level

**Actions Required**: Update CSP headers in next.config.js to whitelist Mapbox domains

### Overall Constitution Compliance

**Status**: ⚠️ CONDITIONAL PASS

**Blockers**: None

**Required Actions Before Proceeding**:
1. Research Mapbox token security and URL restrictions
2. Plan CSP header updates for Mapbox domains
3. Verify bundle size impact with dynamic import strategy
4. Confirm fixed height reservation prevents CLS

**Re-evaluation Required After Phase 1**: Verify final bundle size and CLS metrics

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
├── components/
│   └── features/
│       ├── map/                              # NEW: Map feature components
│       │   ├── location-map.tsx              # Main map component (Client Component)
│       │   ├── map-marker.tsx                # Custom green pin marker
│       │   ├── map-error.tsx                 # Error state component
│       │   └── index.ts                      # Barrel export
│       ├── geolocation/                      # EXISTING: Geolocation components
│       │   └── geolocation-card.tsx          # Map will be added here as child
│       └── ip-detection/
├── types/
│   ├── geolocation.ts                        # EXISTING: Has GeolocationData with lat/lng
│   └── map.ts                                # NEW: Map-specific types
├── lib/
│   └── utils/
│       └── map-helpers.ts                    # NEW: Map utility functions
└── app/
    ├── page.tsx                              # MODIFY: Add map below geolocation cards
    └── globals.css                           # EXISTING: Has glow-pulse animation

.env.local                                     # NEW: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
next.config.js                                 # MODIFY: CSP headers for Mapbox
```

**Structure Decision**: Web application using Next.js App Router. Map components follow existing feature-based organization under `src/components/features/map/`. The main map component will be a Client Component ('use client') that integrates with existing GeolocationData from the geolocation feature. Dynamic import used at the page level to prevent SSR and reduce initial bundle size.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. All warnings in Constitution Check are standard considerations that will be addressed during implementation:
- CLS prevention via fixed height (standard practice)
- Bundle size management via dynamic import (standard practice)
- CSP header updates (standard security configuration)
- Mapbox token URL restrictions (standard security configuration)
