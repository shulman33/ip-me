# Tasks: Geolocation Data Display

**Feature**: 002-geolocation-display
**Branch**: `002-geolocation-display`
**Input**: Design documents from `/specs/002-geolocation-display/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT explicitly requested in the feature specification - focusing on implementation only.

**Organization**: Tasks are grouped by user story (US1, US2, US3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shadcn/ui components installation, and codebase exploration

- [X] T001 Explore existing codebase structure using Task tool with Explore agent to understand current organization of src/app/, src/components/, src/types/, and src/lib/
- [X] T002 Use Context7 to fetch latest documentation for Next.js 16.0.1 App Router (resolve-library-id "Next.js" then get-library-docs for App Router patterns)
- [X] T003 Use Context7 to fetch latest documentation for React 19.2.0 Server Components (resolve-library-id "React" then get-library-docs for Server Components and Client Components)
- [X] T004 Use Context7 to fetch latest documentation for shadcn/ui (resolve-library-id "shadcn/ui" then get-library-docs focusing on Card, Badge, and Skeleton components)
- [X] T005 [P] Install shadcn/ui Card component via `npx shadcn@latest add card` and verify installation in src/components/ui/card.tsx
- [X] T006 [P] Install shadcn/ui Badge component via `npx shadcn@latest add badge` and verify installation in src/components/ui/badge.tsx
- [X] T007 [P] Install shadcn/ui Skeleton component via `npx shadcn@latest add skeleton` and verify installation in src/components/ui/skeleton.tsx
- [X] T008 Create feature directory structure: src/components/features/geolocation/ for all geolocation-specific components
- [X] T009 Verify environment variables are configured: IPSTACK_API_KEY, KV_REST_API_URL, KV_REST_API_TOKEN in .env.local

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, validation schemas, and utility functions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Explore existing type definitions and validation schemas using Task tool with Explore agent to understand src/types/ip.ts and src/lib/validations/ip-schema.ts structure
- [X] T011 Use Context7 to fetch latest documentation for Zod 3.25.76 (resolve-library-id "Zod" then get-library-docs for validation patterns and schema composition)
- [X] T012 [P] Extend src/types/ip.ts with GeolocationData interface (extends IPDetectionResult with all geolocation fields from data-model.md)
- [X] T013 [P] Create src/types/geolocation.ts with TimezoneData, DisplayState, DisplayStatus, and GeolocationCardProps interfaces
- [X] T014 Update src/lib/validations/ip-schema.ts with geolocationDataSchema and timezoneDataSchema using Zod (validate all fields per data-model.md)
- [X] T015 Create src/lib/utils/geolocation.ts with utility function stubs (getCountryFlag, formatCoordinates, formatTimezone)
- [X] T016 [P] Implement getCountryFlag(countryCode: string): string utility in src/lib/utils/geolocation.ts (convert ISO 3166-1 alpha-2 to flag emoji)
- [X] T017 [P] Implement formatCoordinates(latitude?: number, longitude?: number): string utility in src/lib/utils/geolocation.ts (4 decimal places with cardinal directions)
- [X] T018 [P] Implement formatTimezone(timezone?: TimezoneData): string utility in src/lib/utils/geolocation.ts (IANA name + UTC offset)
- [X] T019 Verify existing src/app/api/detect-ip/route.ts returns all required geolocation fields by testing with curl or browser

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Primary Location Information (Priority: P1) 🎯 MVP

**Goal**: Display user's primary geographic location (country with flag emoji, city) in a prominent, easy-to-read card within 3 seconds of IP detection

**Independent Test**: Load the page and verify country (with flag emoji) and city display prominently in a dark-themed card within 3 seconds of IP detection

- [X] T020 Explore existing page structure using Task tool with Explore agent to understand src/app/page.tsx and how it integrates with the API route
- [X] T021 Use Context7 to fetch Next.js 16.0.1 documentation on Server Components and data fetching patterns (focusing on fetch with cache options)
- [X] T022 [P] [US1] Create GeolocationSkeleton component in src/components/features/geolocation/geolocation-skeleton.tsx (Server Component with shadcn/ui Skeleton, matches final layout dimensions)
- [X] T023 [P] [US1] Create GeolocationError component in src/components/features/geolocation/geolocation-error.tsx (Client Component with retry button and user-friendly error messages)
- [X] T024 [US1] Create GeolocationPrimaryInfo component in src/components/features/geolocation/geolocation-primary-info.tsx (Server Component displaying IP, country with flag, city)
- [X] T025 [US1] Test GeolocationPrimaryInfo component renders correctly with mock data (IP: "8.8.8.8", country_code: "US", city: "Mountain View")
- [X] T026 [US1] Test GeolocationPrimaryInfo handles missing city gracefully (displays "City unavailable")
- [X] T027 [US1] Test GeolocationPrimaryInfo handles missing country_code gracefully (displays "Unknown Country" with globe emoji)
- [X] T028 [US1] Create GeolocationCard container component in src/components/features/geolocation/geolocation-card.tsx (Server Component wrapping primary info in shadcn/ui Card)
- [X] T029 [US1] Integrate GeolocationCard into src/app/page.tsx with React Suspense boundary (fallback to GeolocationSkeleton)
- [X] T030 [US1] Test end-to-end flow: load page, verify skeleton shows, verify primary location data displays within 3 seconds
- [X] T031 [US1] Verify flag emoji renders correctly for various country codes (US 🇺🇸, GB 🇬🇧, JP 🇯🇵)
- [X] T032 [US1] Test error state displays properly when API fails (show GeolocationError with retry button)

**Checkpoint**: User Story 1 complete - primary location (IP, country, city) displays prominently in dark-themed card

---

## Phase 4: User Story 2 - Access Detailed Geographic and Network Information (Priority: P2)

**Goal**: Display comprehensive details including state/region, postal code, coordinates, ISP, connection type, and timezone in organized sections below primary data

**Independent Test**: Verify all available secondary data fields (state, postal, coordinates, ISP, connection type, timezone) display in organized sections below primary location data

- [X] T033 Explore existing component structure using Task tool with Explore agent to understand how GeolocationCard can be extended with additional info sections
- [X] T034 Use Context7 to fetch Tailwind CSS 4 documentation on grid layouts and responsive design patterns (grid-cols-1, md:grid-cols-2, lg:grid-cols-3)
- [X] T035 [P] [US2] Create GeolocationSecondaryInfo component in src/components/features/geolocation/geolocation-secondary-info.tsx (Server Component for state, postal, coordinates, timezone)
- [X] T036 [P] [US2] Create GeolocationNetworkInfo component (optional separate component) or extend GeolocationSecondaryInfo to include ISP and connection type
- [X] T037 [US2] Implement responsive data grid in GeolocationDataGrid component at src/components/features/geolocation/geolocation-data-grid.tsx (1-col mobile, 2-col tablet, 3-col desktop)
- [X] T038 [US2] Test GeolocationSecondaryInfo renders state/region when available
- [X] T039 [US2] Test GeolocationSecondaryInfo renders postal code when available
- [X] T040 [US2] Test GeolocationSecondaryInfo renders formatted coordinates using formatCoordinates utility (e.g., "37.7749°N, 122.4194°W")
- [X] T041 [US2] Test GeolocationSecondaryInfo renders ISP and organization information when available
- [X] T042 [US2] Test GeolocationSecondaryInfo renders connection type when available (note: undefined on IPstack free tier)
- [X] T043 [US2] Test GeolocationSecondaryInfo renders formatted timezone using formatTimezone utility (e.g., "America/New_York (UTC-5)")
- [X] T044 [US2] Update GeolocationCard to include GeolocationSecondaryInfo below GeolocationPrimaryInfo
- [X] T045 [US2] Test responsive grid layout adapts correctly: 1-column on mobile (<640px), 2-column on tablet (640-1024px), 3-column on desktop (>1024px)
- [X] T046 [US2] Verify information hierarchy is clear: primary data (IP, country, city) more prominent than secondary data (larger font, bold styling)
- [X] T047 [US2] Test end-to-end flow: all secondary data displays in organized, logical groups (geographic data together, network data together, time data together)

**Checkpoint**: User Story 2 complete - comprehensive geolocation details display in organized sections with proper information hierarchy

---

## Phase 5: User Story 3 - Graceful Handling of Missing or Unavailable Data (Priority: P3)

**Goal**: Adapt interface gracefully when certain data points are unavailable by omitting fields or showing friendly "not available" messages without breaking the UI

**Independent Test**: Simulate API responses with missing fields (no postal code, no ISP data) and verify UI adapts without breaking or showing empty fields

- [X] T048 Explore API error handling patterns using Task tool with Explore agent to understand existing error boundaries in src/app/error.tsx
- [X] T049 Use Context7 to fetch Next.js 16.0.1 documentation on error handling, error boundaries, and error.tsx patterns
- [X] T050 [US3] Update GeolocationPrimaryInfo to handle missing country_code (show generic globe emoji 🌍)
- [X] T051 [US3] Update GeolocationPrimaryInfo to handle missing country_name (show "Unknown Country")
- [X] T052 [US3] Update GeolocationPrimaryInfo to handle missing city (show "City unavailable" or omit field)
- [X] T053 [US3] Update GeolocationSecondaryInfo to hide state/region field when unavailable (no empty placeholder)
- [X] T054 [US3] Update GeolocationSecondaryInfo to hide postal code field when unavailable
- [X] T055 [US3] Update GeolocationSecondaryInfo to handle missing coordinates gracefully (formatCoordinates returns "Coordinates unavailable")
- [X] T056 [US3] Update GeolocationSecondaryInfo to hide ISP/organization when unavailable
- [X] T057 [US3] Update GeolocationSecondaryInfo to handle missing timezone gracefully (formatTimezone returns "Timezone unavailable")
- [X] T058 [US3] Enhance GeolocationError component with user-friendly error messages for different failure scenarios (network timeout, invalid IP, API unavailable)
- [X] T059 [US3] Add retry mechanism to GeolocationError component (button triggers client-side refetch)
- [X] T060 [US3] Test with partial data response (only IP, country_code, country_name present) - verify available data displays, missing fields omitted
- [X] T061 [US3] Test with empty geolocation data (only IP and version) - verify graceful message "Location information unavailable for this IP"
- [X] T062 [US3] Test API failure scenario - verify GeolocationError displays with user-friendly message and retry button
- [X] T063 [US3] Test API timeout scenario (simulate with network throttling) - verify timeout message displays after 10 seconds with retry option
- [X] T064 [US3] Test retry functionality - click retry button, verify loading state shows, verify successful retry displays data

**Checkpoint**: User Story 3 complete - all edge cases handled gracefully, no UI breaks with missing data

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, accessibility, performance validation, and documentation

- [ ] T065 [P] Verify WCAG AA contrast ratios (4.5:1 minimum) for all text elements in dark theme using browser DevTools or axe extension
- [ ] T066 [P] Test keyboard navigation: ensure retry button and all interactive elements are keyboard accessible (Tab, Enter, Escape)
- [ ] T067 [P] Test screen reader support: verify flag emoji has aria-label with country name, loading states announced via aria-live="polite"
- [X] T068 [P] Add semantic HTML improvements: use `<article>` for cards, `<dl>` for data key-value pairs
- [ ] T069 Run Lighthouse CI audit to verify Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] T070 Verify Redis cache hit rate in server logs (target >80% cache hits) using grep "Cache HIT" commands
- [ ] T071 Monitor IPstack API usage to ensure <1000 calls/month (free tier limit) using grep "Cache MISS" commands
- [ ] T072 Test responsive layout on actual mobile devices (iOS Safari, Android Chrome)
- [ ] T073 Verify skeleton components prevent layout shift (CLS <0.1) by matching final layout dimensions
- [X] T074 Update /CLAUDE.md with new technologies: TypeScript 5.x with Next.js 16.0.1, React 19.2.0, shadcn/ui components, Upstash Redis caching
- [ ] T075 Add inline code comments for complex logic (flag emoji conversion, coordinate formatting, timezone parsing)
- [ ] T076 Validate implementation against quickstart.md checklist (all phases complete)
- [ ] T077 Create pull request with detailed description of all three user stories implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 components but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 and US2 error handling but should be independently testable

### Within Each User Story

- Skeleton and error components before main components (US1)
- Primary info component before secondary info component (US2 depends on US1 foundation)
- Core implementation before edge case handling (US3 depends on US1 and US2 components existing)

### Parallel Opportunities

- **Phase 1**: T005, T006, T007 (shadcn/ui component installations) can run in parallel
- **Phase 2**: T012, T013 (type definitions), T016, T017, T018 (utility functions) can run in parallel within their groups
- **Phase 3**: T022, T023 (Skeleton and Error components) can run in parallel
- **Phase 4**: T035, T036 (secondary info components) can run in parallel
- **Phase 6**: T065, T066, T067, T068 (accessibility tasks) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all type definitions together:
Task: "Extend src/types/ip.ts with GeolocationData interface"
Task: "Create src/types/geolocation.ts with TimezoneData, DisplayState, DisplayStatus"

# Launch all utility functions together:
Task: "Implement getCountryFlag utility in src/lib/utils/geolocation.ts"
Task: "Implement formatCoordinates utility in src/lib/utils/geolocation.ts"
Task: "Implement formatTimezone utility in src/lib/utils/geolocation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install shadcn/ui, explore codebase with Context7)
2. Complete Phase 2: Foundational (types, validation, utilities - CRITICAL)
3. Complete Phase 3: User Story 1 (primary location display)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready (MVP delivers core value)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: primary location display!)
3. Add User Story 2 → Test independently → Deploy/Demo (comprehensive details)
4. Add User Story 3 → Test independently → Deploy/Demo (production-ready error handling)
5. Polish → Final quality assurance → Production release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (primary info)
   - Developer B: User Story 2 (secondary info) - can start components in parallel with US1
   - Developer C: User Story 3 (error handling) - begins after US1/US2 components exist
3. Stories integrate independently without breaking each other

---

## Context7 Usage Throughout Implementation

**IMPORTANT**: Use Context7 MCP server for up-to-date documentation at the start of each phase:

- **Phase 1 Setup**: Fetch Next.js 16, React 19, shadcn/ui docs
- **Phase 2 Foundational**: Fetch Zod 3.25.76 validation docs
- **Phase 3 US1**: Fetch Next.js Server Components and data fetching patterns
- **Phase 4 US2**: Fetch Tailwind CSS 4 responsive grid documentation
- **Phase 5 US3**: Fetch Next.js error handling and error boundary docs

**Workflow for each phase**:
1. Use `resolve-library-id` to find the correct library
2. Use `get-library-docs` to fetch relevant documentation for the current task
3. Explore existing codebase with Task tool (Explore agent) to understand current structure
4. Implement tasks based on up-to-date documentation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story delivers independent value and should be testable on its own
- Commit after each task or logical group for easy rollback
- Stop at any checkpoint to validate story independently
- Use Context7 liberally to ensure implementation follows latest best practices
- Explore codebase at start of each phase to understand existing patterns
