# Tasks: Automatic IP Detection

**Input**: Design documents from `/specs/001-auto-ip-detection/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/detect-ip.yaml

**Tests**: Tests are NOT requested in the specification, so test tasks are excluded from this implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 15 App Router web application with the following structure:
- **App Router**: `app/` directory for pages and API routes
- **Components**: `components/ui/` for shadcn/ui, `components/features/` for feature-specific components
- **Utilities**: `lib/utils/` for shared utilities, `lib/validations/` for Zod schemas
- **Types**: `types/` for TypeScript definitions
- **Hooks**: `hooks/` for custom React hooks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup for IP detection feature

- [X] T001 Install Zod validation library (zod@^3.24.2) via npm
- [X] T002 Install Upstash Redis client (@upstash/redis) via npm
- [X] T003 [P] Configure shadcn/ui and add Button component to components/ui/button.tsx
- [X] T004 [P] Create environment variables file .env.local with IPSTACK_API_KEY placeholder
- [X] T005 [P] Configure Tailwind CSS with custom green color (#00ff88) in tailwind.config.ts
- [X] T006 [P] Add glow-pulse keyframe animation to app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, validations, and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Define IPVersion, IPAddress, DetectionState, IPDetectionResult, CopyState, and APIError TypeScript types in types/ip.ts
- [X] T008 [P] Create Zod validation schemas (ipv4Schema, ipv6Schema, ipSchema, ipDetectionResultSchema, apiErrorSchema) in lib/validations/ip-schema.ts
- [X] T009 [P] Implement IP version detection utility (detectIPVersion) in lib/utils/ip-detection.ts
- [X] T010 [P] Implement IP formatting utilities (formatIPv4, formatIPv6) in lib/utils/format-ip.ts
- [X] T011 [P] Create useCopyToClipboard custom hook with Navigator Clipboard API and execCommand fallback in hooks/use-copy-to-clipboard.ts
- [X] T012 [P] Add green and greenGlow button variants to components/ui/button.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instant IP Display on Page Load (Priority: P1) 🎯 MVP

**Goal**: Automatically detect and display visitor's public IP address (IPv4/IPv6) on homepage load with loading states and proper styling

**Independent Test**: Load the homepage and verify the visitor's IP address appears within 2 seconds in monospace font above the fold without any user interaction

### Implementation for User Story 1

- [X] T013 [P] [US1] Create Server Component IPDisplay with server-side IP detection from headers in components/features/ip-detection/ip-display.tsx
- [X] T014 [P] [US1] Implement server-side IP extraction utility reading X-Forwarded-For and CF-Connecting-IP headers in lib/utils/ip-detection.ts
- [X] T015 [US1] Update homepage app/page.tsx to use headers() from next/headers and render IPDisplay Server Component
- [X] T016 [US1] Add loading skeleton UI with Suspense fallback for IP detection in app/page.tsx
- [X] T017 [US1] Style IP display with monospace font (font-mono), dark background (#0a0a0a), and responsive layout using Tailwind CSS
- [X] T018 [US1] Add proper semantic HTML structure with H1 heading and code tag for IP display
- [X] T019 [US1] Create error boundary app/error.tsx for feature-level error handling

**Checkpoint**: At this point, User Story 1 should be fully functional - IP displays automatically on page load with proper loading and error states

---

## Phase 4: User Story 2 - One-Click IP Copy (Priority: P2)

**Goal**: Provide copy button with green glow styling that copies IP to clipboard with visual feedback

**Independent Test**: Click the copy button next to a displayed IP address and verify the IP is on the clipboard with visual feedback showing "Copied!" for 2 seconds

### Implementation for User Story 2

- [X] T020 [P] [US2] Create CopyButton Client Component with green styling and click handler in components/features/ip-detection/copy-button.tsx
- [X] T021 [US2] Integrate useCopyToClipboard hook into CopyButton component
- [X] T022 [US2] Implement visual feedback states (green → greenGlow transition, "Copy" → "Copied!" text change) with 2-second auto-reset
- [X] T023 [US2] Add CSS transitions (duration-200, scale-95 on click) and glow-pulse animation on success
- [X] T024 [US2] Handle clipboard errors with fallback message "Failed to copy. Please copy manually."
- [X] T025 [US2] Add accessibility features (aria-live="polite", keyboard focus states, descriptive aria-labels)
- [X] T026 [US2] Update IPDisplay component to include CopyButton Client Component

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - IP displays and can be copied to clipboard with visual feedback

---

## Phase 5: User Story 3 - Error Recovery and Offline Handling (Priority: P3)

**Goal**: Handle IP detection failures gracefully with clear error messages and retry functionality

**Independent Test**: Simulate network failures or API errors and verify friendly error messages display with retry button that attempts re-detection

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create API route handler GET /api/detect-ip/route.ts for client-side IP validation and fallback detection
- [ ] T028 [P] [US3] Implement IPstack API integration with server-side API key protection in app/api/detect-ip/route.ts
- [ ] T029 [US3] Add Upstash Redis caching layer with 5-minute TTL (cache key format: ip-lookup:${ipAddress})
- [ ] T030 [US3] Implement rate limiting middleware (10 requests/minute per IP) using Next.js Edge Middleware
- [ ] T031 [US3] Add Zod validation for API responses using ipDetectionResultSchema
- [ ] T032 [US3] Implement error response handling (400 invalid IP, 429 rate limited, 500 service unavailable) with apiErrorSchema
- [ ] T033 [US3] Create retry logic with exponential backoff (1s, 2s, 4s delays, max 3 retries)
- [ ] T034 [US3] Add fallback detection flow: headers → client API call → IPstack API
- [ ] T035 [US3] Update IPDisplay component to show user-friendly error messages with retry button
- [ ] T036 [US3] Implement "Try Again" button that triggers re-detection via API route
- [ ] T037 [US3] Add timeout handling for detections exceeding 5 seconds with "Detection in progress..." message
- [ ] T038 [US3] Handle max retry failures (3 failures) with alternative guidance message

**Checkpoint**: All user stories should now be independently functional - IP detection works with graceful error handling and retry capabilities

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T039 [P] Add Next.js Metadata API configuration for SEO (title, description, Open Graph tags) in app/layout.tsx
- [ ] T040 [P] Create JSON-LD structured data for WebSite schema in app/page.tsx
- [ ] T041 [P] Configure Content Security Policy headers in next.config.js
- [ ] T042 [P] Add privacy notice text below IP display explaining 5-minute caching in IPDisplay component
- [ ] T043 [P] Optimize font loading with next/font (Inter with display:swap) in app/layout.tsx
- [ ] T044 [P] Update site metadata configuration in config/site.ts
- [ ] T045 Add code comments and JSDoc documentation across all components and utilities
- [ ] T046 Verify Core Web Vitals compliance (LCP <2.5s, FID <100ms, CLS <0.1) using Lighthouse
- [ ] T047 Run accessibility audit with focus on keyboard navigation and screen reader support
- [ ] T048 Verify bundle size under 100KB total JS (<50KB for feature code) using next build --analyze
- [ ] T049 Test IPv4 and IPv6 address display formatting across different formats
- [ ] T050 Validate quickstart.md development workflow and update if needed
- [ ] T051 Final code cleanup and refactoring for TypeScript strict mode compliance
- [ ] T052 Security audit: verify API keys server-side only, no IP logging beyond cache TTL

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion (needs IPDisplay component to exist)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2, provides fallback detection mechanism

### Within Each User Story

- **US1**: Server utilities → IPDisplay component → Homepage integration → Styling → Error boundary
- **US2**: CopyButton component → Visual feedback → Accessibility → Integration with IPDisplay
- **US3**: API route → IPstack integration → Caching → Error handling → Retry logic → UI updates

### Parallel Opportunities

- **Phase 1 Setup**: T001, T002, T003, T004, T005, T006 can all run in parallel
- **Phase 2 Foundational**: T007, T008, T009, T010, T011, T012 can all run in parallel
- **Within US1**: T013 and T014 can run in parallel (different utilities)
- **Within US2**: T020 can start immediately after US1 complete
- **Within US3**: T027 and T028 can run in parallel (same file but different concerns)
- **Phase 6 Polish**: T039, T040, T041, T042, T043, T044 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational utilities together:
Task: "Create Zod validation schemas in lib/validations/ip-schema.ts"
Task: "Implement IP version detection utility in lib/utils/ip-detection.ts"
Task: "Create useCopyToClipboard hook in hooks/use-copy-to-clipboard.ts"

# Launch Server Component and utilities together:
Task: "Create IPDisplay Server Component in components/features/ip-detection/ip-display.tsx"
Task: "Implement server-side IP extraction in lib/utils/ip-detection.ts"
```

---

## Parallel Example: Phase 6 Polish

```bash
# Launch all metadata and configuration tasks together:
Task: "Add Next.js Metadata API configuration in app/layout.tsx"
Task: "Create JSON-LD structured data in app/page.tsx"
Task: "Configure CSP headers in next.config.js"
Task: "Optimize font loading in app/layout.tsx"
Task: "Update site metadata in config/site.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T013-T019)
4. **STOP and VALIDATE**: Test User Story 1 independently - IP displays on page load
5. Deploy to Vercel preview for testing

**MVP Deliverable**: Homepage that automatically detects and displays visitor's IP address with loading states

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) ✅
3. Add User Story 2 → Test independently → Deploy/Demo (Copy functionality added)
4. Add User Story 3 → Test independently → Deploy/Demo (Error handling and retry)
5. Add Polish → Final production-ready version

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (IP Display)
   - Developer B: User Story 3 (API route and error handling) - can work in parallel
3. After US1 complete:
   - Developer A continues with User Story 2 (Copy functionality)
   - Developer B continues with US3 integration
4. Team tackles Polish tasks in parallel

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- No test tasks included (not requested in specification)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Server Components used for initial IP detection (optimal performance)
- Client Components only for interactive copy button (minimal JavaScript)
- API route provides fallback/validation when server headers unavailable
- All IP addresses validated via Zod schemas at runtime
- Upstash Redis cache reduces IPstack API costs by ~80%
- Privacy-first: 5-minute cache only, no persistent IP logging
- Core Web Vitals optimized: LCP <2s via server-side detection
- Accessibility: WCAG AA compliance with keyboard navigation and screen readers
- Security: API keys server-side only, rate limiting, input validation, CSP headers

---

## Summary

- **Total Tasks**: 52 tasks across 6 phases
- **MVP Tasks**: 19 tasks (Phases 1-3 = Setup + Foundational + User Story 1)
- **Test Tasks**: 0 (not requested in specification)
- **Parallel Opportunities**: 24 tasks marked [P] can run in parallel within their phases
- **Estimated Timeline**: 2-3 days for full implementation (MVP in 1 day)

**Task Breakdown by User Story**:
- User Story 1 (Instant IP Display): 7 tasks (T013-T019)
- User Story 2 (One-Click Copy): 7 tasks (T020-T026)
- User Story 3 (Error Recovery): 12 tasks (T027-T038)
- Setup + Foundational: 12 tasks (T001-T012)
- Polish: 14 tasks (T039-T052)

**Independent Test Criteria**:
- **US1**: Load homepage → IP appears within 2s → Passes ✓
- **US2**: Click copy button → IP on clipboard → "Copied!" feedback → Passes ✓
- **US3**: Simulate API failure → Error message displays → Click retry → Detection re-attempts → Passes ✓

**Suggested MVP Scope**: Complete Phases 1-3 (User Story 1 only) for minimum viable product demonstrating core IP detection functionality. This delivers immediate user value and can be deployed independently.
