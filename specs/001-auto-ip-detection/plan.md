# Implementation Plan: Automatic IP Detection

**Branch**: `001-auto-ip-detection` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auto-ip-detection/spec.md`

## Summary

Build automatic IP detection feature that displays visitor's public IP address (IPv4/IPv6) on homepage load with one-click copy functionality. Uses Next.js 15 App Router with Server Components for initial detection via request headers (X-Forwarded-For, CF-Connecting-IP), client-side validation with IPstack API through protected route handlers, and React state management for copy functionality. Visual design features monospace font display with electric green (#00ff88) glowing copy button with CSS transitions for feedback.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)
**Primary Dependencies**: Next.js 15, React 19, Zod 3.x, Tailwind CSS 4, shadcn/ui, IPstack API
**Storage**: Vercel KV (Redis) for 5-minute IP detection response caching
**Testing**: Jest + React Testing Library (unit), Playwright (E2E), jest-axe (accessibility)
**Target Platform**: Vercel Edge Runtime (serverless functions), modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (Next.js 15 App Router single-page app)
**Performance Goals**: <2s IP detection, <100ms copy feedback, <100KB total JS bundle, LCP <2.5s
**Constraints**: Core Web Vitals compliance (LCP <2.5s, FID <100ms, CLS <0.1), WCAG AA accessibility, privacy-first (no IP logging beyond cache TTL)
**Scale/Scope**: Single feature for MVP, foundation for future geolocation features, designed for 100k+ daily visitors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Performance & Technical Excellence ✅ PASS

- **LCP <2.5s**: Server-side IP detection via headers ensures instant display (no client-side API delay for initial render). Estimated LCP: ~1.5s with proper font loading.
- **FID <100ms**: Client Components only for copy button interaction, minimal JavaScript execution. useState for local state avoids complex state management overhead.
- **CLS <0.1**: Reserved space for IP display during loading state prevents layout shift. Fixed button dimensions ensure no shift on visual feedback.
- **Mobile-first**: Responsive Tailwind utilities ensure proper display on all viewport sizes.
- **Progressive enhancement**: Server-rendered IP detection works without JavaScript for display; copy requires JS but degrades gracefully with clear messaging.

### Principle II: SEO-First Architecture ✅ PASS

- **Semantic HTML**: Proper heading hierarchy with H1 for "Your IP Address", semantic `<code>` tag for monospace IP display.
- **Structured data**: JSON-LD schema for WebSite with potentialAction for IP lookup (Phase 2 - manual lookup feature).
- **Server-side rendering**: IP detection happens in Server Component, content available to crawlers immediately.
- **Meta tags**: Proper title, description, and Open Graph tags via Next.js Metadata API.

### Principle III: Dark Theme Design System ✅ PASS

- **Dark theme default**: Background #0a0a0a, text colors optimized for dark backgrounds.
- **Electric green (#00ff88)**: Used for copy button and success feedback glow effect.
- **Inter font**: Using next/font for optimized loading with display:swap.
- **Monospace font**: font-mono utility class for IP display (system monospace stack).
- **Glass-morphism**: Copy button features backdrop-blur with transparency for depth.
- **Focus states**: Custom focus-visible ring with green accent for keyboard navigation.
- **WCAG AA**: Green (#00ff88) on dark background meets 4.5:1 contrast ratio.

### Principle IV: Privacy-First Development ✅ PASS

- **Minimal data collection**: Only detect IP, no additional tracking or logging.
- **No persistent logging**: IP addresses cached only for 5 minutes (Vercel KV TTL), then purged.
- **Transparent disclosure**: Privacy notice below IP display explains caching for performance.
- **GDPR/CCPA compliance**: No cookies, no consent required (legitimate interest for service function).
- **API key protection**: IPstack API key server-side only, never exposed to client.

### Principle V: Monetization Balance ⚠️ DEFERRED

- **Ad placement**: Not applicable for this feature (Phase 1 MVP). Future ad units will be lazy-loaded below fold per constitution.
- **Performance impact**: No ads in this phase, Core Web Vitals unaffected.

### Next.js & React Standards ✅ PASS

- **App Router exclusively**: Using app/ directory, no pages/ directory.
- **Server Components first**: IP detection in Server Component (app/page.tsx), Client Component only for copy button.
- **TypeScript strict mode**: All code typed with no `any` types.
- **File-based routing**: app/page.tsx for homepage, app/api/detect-ip/route.ts for API.

### Component Architecture & Styling ✅ PASS

- **shadcn/ui Button**: Customized with green variant for copy button.
- **Component organization**: IPDisplay in components/features/, Button in components/ui/.
- **TypeScript interfaces**: Proper prop types for all components.
- **Compound patterns**: Not needed for simple IP display component.

### Performance & Optimization ✅ PASS

- **Bundle size**: Minimal dependencies (Zod ~15KB, no heavy libraries). Target: <50KB for feature.
- **Dynamic imports**: Not needed (no heavy libraries in this feature).
- **Code splitting**: Automatic via Next.js App Router.
- **Lazy loading**: Copy button Client Component loaded only when needed.

### API, Data & Security ✅ PASS

- **Server-side API calls**: IPstack called from route handler (app/api/detect-ip/route.ts), never client-side.
- **Response caching**: Vercel KV with 5-minute TTL for IP detection responses.
- **Zod validation**: IPv4/IPv6 validation schemas for all IP inputs.
- **Error boundaries**: app/error.tsx for global errors, component-level try/catch for API failures.
- **Environment variables**: IPSTACK_API_KEY in .env.local, never committed.
- **Rate limiting**: Middleware-based rate limiting (10 requests/minute per IP).

### Testing & Quality Assurance ⚠️ PARTIAL

- **Unit tests**: IP validation utils, formatting functions (Zod schemas).
- **Integration tests**: API route handler with mocked IPstack responses.
- **E2E tests**: Full user flow (load page → see IP → copy → verify clipboard).
- **Accessibility**: jest-axe tests for keyboard navigation and screen reader support.
- **Performance**: Lighthouse CI in GitHub Actions (blocking <90 score).
- **Note**: Tests will be written in Phase 2 (tasks.md), not Phase 1 (design).

### Code Organization & Error Handling ✅ PASS

- **Directory structure**: Following constitution-defined structure.
- **Error boundaries**: Global app/error.tsx, route-level fallbacks.
- **Graceful degradation**: Fallback to client-side detection if server headers missing.
- **Logging**: Structured logging with environment-aware verbosity.

## Project Structure

### Documentation (this feature)

```text
specs/001-auto-ip-detection/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Research findings and decisions
├── data-model.md        # Data structures and validation
├── quickstart.md        # Development quickstart guide
├── contracts/           # API contracts
│   └── detect-ip.yaml   # OpenAPI spec for IP detection endpoint
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

This is a web application using Next.js 15 App Router. The structure follows the IP.ME constitution's defined layout:

```text
app/                           # Next.js 15 App Router
├── page.tsx                   # Homepage with Server Component IP detection
├── layout.tsx                 # Root layout (existing)
├── error.tsx                  # Error boundary for feature
├── api/
│   └── detect-ip/
│       └── route.ts           # API route for client-side IP validation
└── globals.css                # Global styles (existing)

components/                    # React components
├── ui/
│   └── button.tsx            # shadcn/ui Button (customized for green variant)
└── features/
    └── ip-detection/
        ├── ip-display.tsx    # Server Component for IP display
        └── copy-button.tsx   # Client Component for copy functionality

lib/                           # Shared utilities
├── utils/
│   ├── ip-detection.ts       # IP detection from headers
│   ├── format-ip.ts          # IPv4/IPv6 formatting utilities
│   └── clipboard.ts          # Clipboard API wrapper with fallbacks
└── validations/
    └── ip-schema.ts          # Zod schemas for IP validation

types/                         # TypeScript definitions
└── ip.ts                     # IP address types and interfaces

config/
└── site.ts                   # Site metadata (updated with IP feature description)

hooks/
└── use-copy-to-clipboard.ts  # Custom hook for clipboard operations

public/                        # Static assets (no changes for this feature)

__tests__/                     # Tests (Phase 2 - not created in /speckit.plan)
├── unit/
│   ├── ip-detection.test.ts
│   ├── ip-schema.test.ts
│   └── format-ip.test.ts
├── integration/
│   └── detect-ip-route.test.ts
└── e2e/
    └── ip-display-copy.spec.ts
```

**Structure Decision**: Using standard Next.js 15 App Router web application structure. Server Components in `app/` handle initial IP detection via request headers for optimal performance. Client Components in `components/features/` provide interactive copy functionality. Utilities in `lib/` are framework-agnostic and testable. API routes in `app/api/` handle client-side validation via IPstack. This structure supports progressive enhancement: server-rendered IP display works without JavaScript, copy button enhances UX when JS available.

## Complexity Tracking

No constitutional violations. All principles satisfied with justifications provided in Constitution Check section above.

## Phase 0: Research (Complete)

See [research.md](./research.md) for detailed research findings.

### Key Decisions

1. **IP Detection Strategy**: Server-side via Next.js headers() API reading X-Forwarded-For and CF-Connecting-IP headers for instant detection. Client-side IPstack API as validation/fallback.

2. **Zod Validation Patterns**: Use `z.string().ip({ version: "v4" })` and `z.string().ip({ version: "v6" })` for strict validation. No custom regex needed.

3. **Clipboard API Implementation**: Navigator Clipboard API with try/catch fallback to document.execCommand for older browsers. Clear error messaging when clipboard denied.

4. **Tailwind Animations**: Use `transition`, `duration-200`, `ease-in-out` for button state changes. Keyframe animation via `@keyframes` for glow effect on copy success.

5. **shadcn Button Customization**: Create new variant in button.tsx with green background, darker green hover, and glow effect using box-shadow.

6. **Caching Strategy**: Vercel KV (Redis) with 5-minute TTL for IPstack responses. Cache key: `ip-lookup:${ipAddress}`. Reduces API costs and improves response time.

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete data structures.

**Summary**:
- `IPAddress` type: Discriminated union for IPv4/IPv6 with validation
- `DetectionState`: Union type for loading/success/error states
- `IPDetectionResult`: API response shape with geolocation data
- Zod schemas for runtime validation at API boundaries

### API Contracts

See [contracts/detect-ip.yaml](./contracts/detect-ip.yaml) for OpenAPI specification.

**Endpoints**:
- `GET /api/detect-ip`: Client-side IP detection endpoint
  - Query params: `ip` (optional, for validation)
  - Response: JSON with IP address, version, country, city, ISP
  - Errors: 400 (invalid IP), 429 (rate limited), 500 (service error)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for development setup and workflow.

## Implementation Approach

### Server Component Strategy (User Story 1 - P1)

**IP Detection Flow**:
1. User loads homepage (app/page.tsx)
2. Server Component reads request headers via `headers()` from `next/headers`
3. Extract IP from X-Forwarded-For (Vercel) or CF-Connecting-IP (Cloudflare)
4. Validate IP format using Zod schema
5. Render `<IPDisplay>` Server Component with detected IP
6. Loading state shows skeleton (Suspense fallback)
7. Client hydrates, copy button becomes interactive

**Benefits**:
- Instant display (no client-side API call for initial render)
- SEO-friendly (IP in HTML source)
- Works without JavaScript (progressive enhancement)
- LCP optimized (<1.5s with proper font loading)

### Client Component Strategy (User Story 2 - P2)

**Copy Functionality Flow**:
1. User clicks green copy button
2. `useCopyToClipboard` hook invoked
3. Try Navigator Clipboard API: `navigator.clipboard.writeText(ip)`
4. On success: Button shows green glow + "Copied!" text for 2 seconds
5. On failure: Try fallback `document.execCommand('copy')`
6. If both fail: Show error toast "Clipboard unavailable"
7. Reset button state after 2 seconds

**Visual Feedback**:
- Button transforms: `scale-95` on click, `scale-100` on release
- Text changes: "Copy" → "Copied!" → "Copy"
- Glow effect: `box-shadow: 0 0 20px rgba(0, 255, 136, 0.6)`
- Duration: 200ms transitions, 2s feedback display

### Error Handling Strategy (User Story 3 - P3)

**Error Scenarios**:
1. **Headers missing**: Fallback to client-side detection via `/api/detect-ip`
2. **Invalid IP format**: Display error message "Unable to detect IP"
3. **IPstack API failure**: Use cached response or show "Detection service unavailable"
4. **Rate limit exceeded**: Display "Too many requests, please try again in 1 minute"
5. **Clipboard denied**: Show "Clipboard access denied, please copy manually"

**Retry Logic**:
- Exponential backoff: 1s, 2s, 4s delays
- Max 3 retries for API failures
- Manual retry button after 3 failures
- Clear error messages with actionable guidance

### Performance Optimizations

1. **Server-side detection**: No client API call for initial render (saves ~500ms)
2. **Font optimization**: `next/font` with `display: swap` for Inter and monospace
3. **Code splitting**: Client Components auto-split by Next.js
4. **Caching**: 5-minute Vercel KV cache reduces IPstack API calls by ~80%
5. **Minimal dependencies**: Zod only runtime dependency (~15KB gzipped)
6. **CSS-only animations**: No JavaScript animation libraries (0KB)

**Expected Metrics**:
- LCP: ~1.5s (server-rendered IP display)
- FID: <50ms (minimal JavaScript)
- CLS: 0 (reserved space for all states)
- Total JS: ~45KB gzipped (Next.js + React + Zod + feature code)
- Time to Interactive: <2s

### Accessibility Considerations

1. **Keyboard navigation**: Tab order: IP display → Copy button → Retry button (if error)
2. **Focus indicators**: Custom green ring on focus-visible (keyboard only)
3. **Screen readers**: aria-live="polite" for copy feedback, descriptive aria-labels
4. **Color contrast**: All text meets WCAG AA (4.5:1 for normal text)
5. **Semantic HTML**: Proper heading hierarchy, <code> for IP, <button> for actions
6. **Skip links**: Not needed (single-feature page)

### Security Considerations

1. **API key protection**: IPSTACK_API_KEY in server-side route handler only
2. **Rate limiting**: Vercel Edge Middleware limits to 10 requests/minute per IP
3. **Input validation**: All IP addresses validated via Zod before processing
4. **No logging**: IP addresses not persisted beyond cache TTL (5 minutes)
5. **CSP headers**: Configured in next.config.js to prevent XSS
6. **HTTPS enforcement**: Vercel production environment enforces HTTPS

## Post-Phase 1 Constitution Check ✅ PASS

All principles remain satisfied after detailed design:

- **Performance**: Server-side detection ensures <1.5s LCP, minimal JS for <50ms FID
- **SEO**: Server-rendered content with proper semantic HTML and metadata
- **Dark Theme**: Green (#00ff88) copy button with glass-morphism effects
- **Privacy**: 5-minute cache only, no persistent logging, no tracking cookies
- **Monetization**: N/A for Phase 1 MVP
- **Standards**: App Router Server Components with TypeScript strict mode
- **Architecture**: shadcn/ui Button customized, Tailwind utility-first styling
- **Optimization**: <50KB bundle, font optimization, code splitting
- **Security**: Server-side API calls, Zod validation, rate limiting, CSP headers
- **Testing**: Comprehensive test strategy defined for Phase 2 implementation
- **Organization**: Constitution-compliant directory structure
- **Error Handling**: Global boundaries, graceful degradation, retry mechanisms

## Next Steps

1. **Run `/speckit.tasks`**: Generate task breakdown for implementation
2. **Setup dependencies**: Install Zod, configure shadcn/ui, setup Vercel KV
3. **Implement Phase 1 (P1)**: Server-side IP detection and display
4. **Implement Phase 2 (P2)**: Copy button functionality
5. **Implement Phase 3 (P3)**: Error handling and retry logic
6. **Testing**: Unit → Integration → E2E → Accessibility
7. **Performance audit**: Lighthouse CI, Core Web Vitals validation
8. **Deploy**: Vercel preview deployment for testing

**Estimated Timeline**: 2-3 days for full implementation including tests and optimization.
