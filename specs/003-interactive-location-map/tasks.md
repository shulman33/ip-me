# Tasks: Interactive Location Map

**Input**: Design documents from `/specs/003-interactive-location-map/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in specification - test tasks are OMITTED per specification guidelines

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for map feature

- [X] T001 Install Mapbox GL JS dependencies: `npm install mapbox-gl@^3.0.0 @types/mapbox-gl`
- [X] T002 [P] Create environment variable NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local
- [X] T003 [P] Add .env.example with NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN placeholder
- [X] T004 Update next.config.js with CSP headers to whitelist Mapbox domains (api.mapbox.com, tiles.mapbox.com)
- [X] T005 Create directory structure: src/components/features/map/, src/types/map.ts, src/lib/utils/map-helpers.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, constants, and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create map type definitions in src/types/map.ts (MapCoordinates, MapLoadState, MapError, LocationMapProps, MapErrorProps, MapSkeletonProps)
- [X] T007 [P] Implement MAP_DEFAULTS constants in src/lib/utils/map-helpers.ts
- [X] T008 [P] Implement MAP_ERROR_MESSAGES constants in src/lib/utils/map-helpers.ts
- [X] T009 [P] Implement MAP_BREAKPOINTS and MAP_DIMENSIONS constants in src/lib/utils/map-helpers.ts
- [X] T010 [P] Implement validateCoordinates function in src/lib/utils/map-helpers.ts
- [X] T011 [P] Implement checkWebGLSupport function in src/lib/utils/map-helpers.ts
- [X] T012 [P] Implement toMapboxCoordinates helper function in src/lib/utils/map-helpers.ts
- [X] T013 [P] Implement getMapboxAccessToken function in src/lib/utils/map-helpers.ts
- [X] T014 [P] Implement prefersReducedMotion function in src/lib/utils/map-helpers.ts
- [X] T015 [P] Implement createMarkerElement function in src/lib/utils/map-helpers.ts
- [X] T016 [P] Create MapError component in src/components/features/map/map-error.tsx
- [X] T017 [P] Create MapSkeleton component in src/components/features/map/map-skeleton.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Location on Interactive Map (Priority: P1) 🎯 MVP

**Goal**: Display interactive map with glowing green pin marker at user's detected location, supporting pan and zoom interactions

**Independent Test**: Load page with valid geolocation coordinates, verify map renders centered on location with animated green marker, test pan/zoom controls work smoothly

### Implementation for User Story 1

- [ ] T018 [US1] Create LocationMap component skeleton in src/components/features/map/location-map.tsx with 'use client' directive
- [ ] T019 [US1] Implement map initialization logic using useEffect in location-map.tsx with Mapbox GL JS v3.x
- [ ] T020 [US1] Add coordinate validation and WebGL support checks at component mount in location-map.tsx
- [ ] T021 [US1] Implement map instance creation with dark-v11 style and access token in location-map.tsx
- [ ] T022 [US1] Create custom marker element with green color (#00ff88) and 32px circular shape in location-map.tsx
- [ ] T023 [US1] Add glow pulse animation to marker (respecting prefers-reduced-motion) in location-map.tsx
- [ ] T024 [US1] Add mapboxgl.Marker instance to map at user coordinates in location-map.tsx
- [ ] T025 [US1] Implement NavigationControl (zoom controls only, no compass) positioned bottom-right in location-map.tsx
- [ ] T026 [US1] Add map load event handler to update component state in location-map.tsx
- [ ] T027 [US1] Implement window resize handler with map.resize() in location-map.tsx
- [ ] T028 [US1] Add cleanup logic in useEffect return (remove marker and map instance) in location-map.tsx
- [ ] T029 [US1] Apply responsive container styling with Tailwind classes (full-width mobile, 60% desktop, 300-400px height) in location-map.tsx
- [ ] T030 [US1] Add ARIA labels for accessibility (role="region", aria-label with coordinates) in location-map.tsx
- [ ] T031 [US1] Create barrel export in src/components/features/map/index.ts
- [ ] T032 [US1] Integrate LocationMap with dynamic import in src/app/page.tsx (ssr: false, loading: MapSkeleton)
- [ ] T033 [US1] Add conditional rendering in page.tsx to show map only when latitude/longitude exist
- [ ] T034 [US1] Position map component below existing GeolocationPrimaryInfo and GeolocationSecondaryInfo components in page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - map displays with marker, zoom/pan work, responsive design adapts to viewport

---

## Phase 4: User Story 2 - Graceful Handling of Missing Location Data (Priority: P2)

**Goal**: Show clear, helpful error message when coordinates are unavailable instead of broken UI

**Independent Test**: Load page with geolocation data lacking lat/lng, verify user-friendly message displays without breaking layout or other geolocation info

### Implementation for User Story 2

- [ ] T035 [US2] Add map error event handler in location-map.tsx to catch tile load failures
- [ ] T036 [US2] Implement error state management with useState in location-map.tsx
- [ ] T037 [US2] Add conditional rendering to show MapError component when error state is set in location-map.tsx
- [ ] T038 [US2] Add error callback prop (onMapError) support in location-map.tsx
- [ ] T039 [US2] Test and verify error handling for missing coordinates scenario
- [ ] T040 [US2] Test and verify error handling for invalid coordinates (out of range) scenario
- [ ] T041 [US2] Test and verify error handling for WebGL unsupported scenario
- [ ] T042 [US2] Test and verify error handling for map service unavailable scenario
- [ ] T043 [US2] Verify MapError component displays consistently with dark theme styling

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - map shows when data valid, error message when data missing

---

## Phase 5: User Story 3 - Dark Theme Visual Consistency (Priority: P3)

**Goal**: Map styling matches application's dark theme for cohesive visual experience

**Independent Test**: View map in dark mode, verify tiles, controls, and background use dark styling that harmonizes with surrounding UI

### Implementation for User Story 3

- [ ] T044 [US3] Verify dark-v11 Mapbox style is applied correctly in location-map.tsx
- [ ] T045 [US3] Create custom CSS overrides for NavigationControl in globals.css or component styles
- [ ] T046 [US3] Style zoom control buttons with dark background (rgba(26, 26, 26, 0.8)) and glass-morphism effect
- [ ] T047 [US3] Add hover states for controls using existing --color-green with 10% opacity
- [ ] T048 [US3] Ensure map container border-radius matches existing card components (0.5rem)
- [ ] T049 [US3] Verify marker green color (#00ff88) contrasts properly with dark map tiles
- [ ] T050 [US3] Test visual consistency across different map zoom levels
- [ ] T051 [US3] Verify no color conflicts when map is positioned next to geolocation cards

**Checkpoint**: All user stories should now be independently functional with polished dark theme styling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T052 [P] Verify bundle size impact with @next/bundle-analyzer is within 100KB budget
- [ ] T053 [P] Run Lighthouse audit to verify CLS < 0.1 (no layout shift when map loads)
- [ ] T054 [P] Test map performance: verify load time < 2 seconds, interactions < 100ms response
- [ ] T055 [P] Verify reduced motion accessibility: test with OS prefers-reduced-motion enabled
- [ ] T056 [P] Test keyboard navigation: verify tab access to zoom controls, Enter/Space to activate
- [ ] T057 [P] Verify map works correctly on various viewport sizes (320px to 1920px)
- [ ] T058 [P] Test edge cases: North/South Pole, International Date Line, ocean coordinates
- [ ] T059 Update CLAUDE.md with Mapbox GL JS v3.x technology stack
- [ ] T060 Run validation steps from quickstart.md
- [ ] T061 Document any deviations from original plan in plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 with error handling but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances visual styling but independently testable

### Within Each User Story

**User Story 1 (Interactive Map Display)**:
1. Component skeleton → Map initialization → Validation checks
2. Map instance creation → Marker creation → Animation setup
3. Controls → Event handlers → Cleanup logic
4. Styling → Accessibility → Integration with page

**User Story 2 (Error Handling)**:
1. Error event handlers → Error state management
2. Conditional rendering → Testing error scenarios
3. All error scenarios must be tested independently

**User Story 3 (Dark Theme)**:
1. CSS overrides → Control styling → Visual verification
2. Theme consistency checks across zoom levels and positions

### Parallel Opportunities

- **Phase 1 Setup**: T001, T002, T003 can run in parallel
- **Phase 2 Foundational**: T006-T017 are all parallelizable (different sections of files or different files)
- **User Stories**: US2 and US3 can be worked on in parallel after US1 completes (if team capacity allows)
- **Polish Phase**: T052-T058 can all run in parallel (different validation tasks)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all type definitions in parallel:
Task: "Create map type definitions in src/types/map.ts"
Task: "Implement MAP_DEFAULTS constants in src/lib/utils/map-helpers.ts"
Task: "Implement MAP_ERROR_MESSAGES constants in src/lib/utils/map-helpers.ts"

# Launch all utility functions in parallel:
Task: "Implement validateCoordinates function in src/lib/utils/map-helpers.ts"
Task: "Implement checkWebGLSupport function in src/lib/utils/map-helpers.ts"
Task: "Implement toMapboxCoordinates helper in src/lib/utils/map-helpers.ts"

# Launch all foundational components in parallel:
Task: "Create MapError component in src/components/features/map/map-error.tsx"
Task: "Create MapSkeleton component in src/components/features/map/map-skeleton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T017) - CRITICAL foundation
3. Complete Phase 3: User Story 1 (T018-T034)
4. **STOP and VALIDATE**:
   - Load page with valid coordinates
   - Verify map renders with green marker
   - Test pan and zoom interactions
   - Verify responsive layout (mobile and desktop)
5. Deploy/demo if ready - you now have a working interactive map!

### Incremental Delivery

1. **Foundation**: Setup + Foundational (T001-T017) → Core utilities ready
2. **MVP**: Add User Story 1 (T018-T034) → Test independently → Deploy/Demo
   - Users can now see their location on an interactive map
3. **Reliability**: Add User Story 2 (T035-T043) → Test independently → Deploy/Demo
   - Users now see helpful errors when coordinates missing
4. **Polish**: Add User Story 3 (T044-T051) → Test independently → Deploy/Demo
   - Map now perfectly matches dark theme design system
5. **Quality**: Complete Polish phase (T052-T061) → Final validation
   - Performance, accessibility, and edge cases verified

### Parallel Team Strategy

With multiple developers:

1. **Phase 1-2**: Team completes Setup + Foundational together (T001-T017)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T018-T034) - Core map functionality
   - Developer B: User Story 2 (T035-T043) - Error handling (waits for US1 completion)
   - Developer C: User Story 3 (T044-T051) - Dark theme polish (can start in parallel)
3. **Integration**: All stories merge and work together independently
4. **Final**: Team completes Polish phase together (T052-T061)

---

## Context7 Integration Notes

Mapbox GL JS documentation was retrieved from Context7 to ensure accurate implementation:
- **Library**: /mapbox/mapbox-gl-js (Trust Score: 8.5, 407 code snippets)
- **Key Insights**:
  - Custom marker creation using HTML elements with `new mapboxgl.Marker({element: el})`
  - React integration pattern using useRef for map/marker instances
  - Proper cleanup with `marker.remove()` and `map.remove()` in useEffect return
  - NavigationControl configuration with `showCompass: false, showZoom: true`
  - Access token configuration per-map instance or globally

---

## Notes

- All tasks use exact file paths for clarity
- [P] marker indicates tasks that can run in parallel (no dependencies)
- [Story] label (US1, US2, US3) maps tasks to specific user stories
- Each user story is independently completable and testable
- No test tasks included (not explicitly requested in specification)
- Mapbox GL JS v3.x chosen per research.md recommendations
- Dark-v11 style provides built-in dark theme matching design system
- Bundle size impact: ~68KB gzipped (within 100KB budget)
- CSP headers required for Mapbox domains (security consideration)
- Environment variable must be public (NEXT_PUBLIC_*) for client-side usage
- Map is enhancement feature - page remains functional without it
