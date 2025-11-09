# Data Model: Interactive Location Map

**Feature**: 003-interactive-location-map
**Date**: 2025-11-09
**Status**: Design Phase

## Overview

This document defines the data structures, component interfaces, and state management for the interactive location map feature. The map component integrates with existing geolocation data and provides visual representation of user location.

---

## Type Definitions

### Core Map Types

```typescript
/**
 * Geographic coordinates for map positioning
 */
export interface MapCoordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/**
 * Map initialization configuration
 */
export interface MapConfig {
  center: [number, number];  // [longitude, latitude] - Mapbox convention
  zoom: number;              // 0-22, default 12 for city-level view
  style: string;             // Mapbox style URL
  accessToken: string;       // Mapbox public access token
}

/**
 * Map instance state
 */
export type MapLoadState = 'initializing' | 'loading' | 'loaded' | 'error';

/**
 * Map error types
 */
export interface MapError {
  type: 'coordinates' | 'webgl' | 'load' | 'token';
  message: string;           // User-friendly error message
  details?: unknown;         // Technical details for logging
}
```

### Marker Types

```typescript
/**
 * Custom marker configuration
 */
export interface MarkerConfig {
  coordinates: MapCoordinates;
  color: string;             // Hex color (e.g., '#00ff88')
  scale?: number;            // 0.5-2.0, default 1.2
  animated?: boolean;        // Whether to apply pulse animation
  draggable?: boolean;       // Whether marker can be dragged
}

/**
 * Marker element styling
 */
export interface MarkerStyle {
  width: string;             // CSS width (e.g., '32px')
  height: string;            // CSS height (e.g., '32px')
  backgroundColor: string;   // Hex color
  borderRadius: string;      // CSS border-radius (e.g., '50%')
  className?: string;        // Additional CSS classes
}
```

---

## Component Props Interfaces

### LocationMap Component

**File**: `src/components/features/map/location-map.tsx`

```typescript
/**
 * Props for the main LocationMap component
 */
export interface LocationMapProps {
  /** Latitude coordinate (-90 to 90) */
  latitude: number;

  /** Longitude coordinate (-180 to 180) */
  longitude: number;

  /** Optional initial zoom level (0-22), defaults to 12 */
  zoom?: number;

  /** Optional custom marker color, defaults to --color-green (#00ff88) */
  markerColor?: string;

  /** Whether to animate the marker, defaults to true (respects prefers-reduced-motion) */
  animated?: boolean;

  /** Optional className for container styling */
  className?: string;

  /** Optional callback for map load success */
  onMapLoad?: () => void;

  /** Optional callback for map errors */
  onMapError?: (error: MapError) => void;
}
```

### MapError Component

**File**: `src/components/features/map/map-error.tsx`

```typescript
/**
 * Props for the MapError component
 */
export interface MapErrorProps {
  /** Error message to display */
  message: string;

  /** Optional error type for icon selection */
  type?: 'coordinates' | 'webgl' | 'load' | 'token';

  /** Optional className for styling */
  className?: string;
}
```

### MapSkeleton Component

**File**: `src/components/features/map/map-skeleton.tsx`

```typescript
/**
 * Props for the MapSkeleton loading component
 */
export interface MapSkeletonProps {
  /** Optional className for styling */
  className?: string;

  /** Optional height override, defaults to responsive height */
  height?: string;
}
```

---

## Component State Management

### LocationMap Internal State

```typescript
/**
 * Internal state structure for LocationMap component
 */
interface LocationMapState {
  // Map instance reference (stored in useRef, not useState)
  mapInstance: mapboxgl.Map | null;

  // Marker instance reference (stored in useRef, not useState)
  markerInstance: mapboxgl.Marker | null;

  // Load state (useState)
  loadState: MapLoadState;

  // Error state (useState)
  error: MapError | null;

  // Reduced motion preference (useState)
  prefersReducedMotion: boolean;
}
```

**State Initialization**:
```typescript
const [loadState, setLoadState] = useState<MapLoadState>('initializing');
const [error, setError] = useState<MapError | null>(null);
const [prefersReducedMotion] = useState(() =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const mapContainer = useRef<HTMLDivElement>(null);
const map = useRef<mapboxgl.Map | null>(null);
const marker = useRef<mapboxgl.Marker | null>(null);
```

---

## Data Validation

### Coordinate Validation

```typescript
/**
 * Validates geographic coordinates
 */
export function validateCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): { valid: boolean; error?: MapError } {
  if (latitude === null || latitude === undefined ||
      longitude === null || longitude === undefined) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Location coordinates unavailable'
      }
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Invalid latitude value',
        details: { latitude }
      }
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Invalid longitude value',
        details: { longitude }
      }
    };
  }

  return { valid: true };
}
```

### WebGL Support Detection

```typescript
/**
 * Checks if browser supports WebGL (required for Mapbox GL JS)
 */
export function checkWebGLSupport(): { supported: boolean; error?: MapError } {
  if (!mapboxgl.supported()) {
    return {
      supported: false,
      error: {
        type: 'webgl',
        message: 'Your browser does not support interactive maps'
      }
    };
  }

  return { supported: true };
}
```

---

## Integration with Existing Types

### Relationship to GeolocationData

The map component extends the existing geolocation feature:

```typescript
// Existing type from src/types/ip.ts
export interface GeolocationData {
  // ... other fields
  latitude?: number | null;
  longitude?: number | null;
  // ... other fields
}

// Map component consumes this data
function GeolocationCard({ data }: { data: GeolocationData }) {
  return (
    <>
      <GeolocationPrimaryInfo data={data} />
      <GeolocationSecondaryInfo data={data} />

      {/* NEW: Add map below existing geolocation info */}
      {data.latitude && data.longitude && (
        <LocationMap
          latitude={data.latitude}
          longitude={data.longitude}
        />
      )}
    </>
  );
}
```

**Design Note**: The map is an optional enhancement. If coordinates are missing, the geolocation cards still display normally without the map.

---

## CSS Custom Properties

### Map Container Styling

```typescript
/**
 * CSS custom properties for map theming
 * These extend existing design tokens from globals.css
 */
export const mapThemeVariables = {
  // Uses existing CSS variables
  '--map-border-color': 'var(--border)',           // #404040
  '--map-background': 'var(--card)',               // #2a2a2a
  '--map-marker-color': 'var(--color-green)',      // #00ff88

  // New map-specific variables
  '--map-height-mobile': '300px',
  '--map-height-desktop': '400px',
  '--map-border-radius': '0.5rem',                 // 8px, matches card
} as const;
```

---

## Constants

### Map Configuration Constants

**File**: `src/lib/utils/map-helpers.ts`

```typescript
/**
 * Default map configuration values
 */
export const MAP_DEFAULTS = {
  ZOOM_LEVEL: 12,                                    // City-level view
  STYLE: 'mapbox://styles/mapbox/dark-v11',         // Dark theme
  MARKER_COLOR: '#00ff88',                          // --color-green
  MARKER_SCALE: 1.2,                                // Slightly larger for visibility
  MARKER_SIZE: '32px',                              // CSS size
  MIN_ZOOM: 3,                                      // Prevent zooming out too far
  MAX_ZOOM: 18,                                     // Prevent zooming in too far
} as const;

/**
 * Error messages (user-facing)
 */
export const MAP_ERROR_MESSAGES = {
  COORDINATES_MISSING: 'Location coordinates unavailable',
  WEBGL_UNSUPPORTED: 'Your browser does not support interactive maps',
  LOAD_FAILED: 'Map temporarily unavailable',
  TOKEN_INVALID: 'Map temporarily unavailable',      // Don't expose security details
} as const;

/**
 * Responsive breakpoints (matches Tailwind)
 */
export const MAP_BREAKPOINTS = {
  MOBILE_MAX: 639,      // < 640px
  DESKTOP_MIN: 640,     // >= 640px
} as const;
```

---

## State Transitions

### Map Load Lifecycle

```
initializing → loading → loaded
            ↘          ↗
              error
```

**State Descriptions**:
- **initializing**: Component mounted, checking WebGL support
- **loading**: Map instance created, loading tiles
- **loaded**: Map fully rendered, interactive
- **error**: Any error occurred (stays in error state)

**State Transition Logic**:
```typescript
useEffect(() => {
  // initializing → error (WebGL check)
  if (!checkWebGLSupport().supported) {
    setLoadState('error');
    setError({ type: 'webgl', message: MAP_ERROR_MESSAGES.WEBGL_UNSUPPORTED });
    return;
  }

  // initializing → loading
  setLoadState('loading');

  const mapInstance = new mapboxgl.Map({...});

  // loading → loaded
  mapInstance.on('load', () => {
    setLoadState('loaded');
    onMapLoad?.();
  });

  // loading → error
  mapInstance.on('error', (e) => {
    setLoadState('error');
    setError({ type: 'load', message: MAP_ERROR_MESSAGES.LOAD_FAILED, details: e });
    onMapError?.(error);
  });

  return () => {
    mapInstance.remove();
  };
}, [latitude, longitude]);
```

---

## Performance Considerations

### Memory Management

**Map Instance Cleanup**:
```typescript
// CRITICAL: Always remove map instance on unmount
useEffect(() => {
  const mapInstance = new mapboxgl.Map({...});

  return () => {
    marker.current?.remove();  // Remove marker first
    mapInstance.remove();      // Then remove map (prevents memory leaks)
  };
}, []);
```

**Why This Matters**:
- Mapbox GL JS creates WebGL contexts which are limited browser resources
- Failing to remove map instances causes memory leaks
- Multiple leaked contexts can crash the browser tab

### Bundle Size Impact

**Dynamic Import Pattern**:
```typescript
// In page.tsx or parent component
const LocationMap = dynamic(
  () => import('@/components/features/map/location-map'),
  {
    ssr: false,
    loading: () => <MapSkeleton />
  }
);
```

**Size Budget**:
- Mapbox GL JS: ~60KB gzipped
- Mapbox CSS: ~8KB gzipped
- Component code: ~2KB gzipped
- **Total**: ~70KB (within 100KB total budget)

---

## Accessibility

### ARIA Labels

```typescript
<div
  ref={mapContainer}
  role="region"
  aria-label={`Interactive map showing location at ${latitude}, ${longitude}`}
  className="map-container"
/>
```

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Don't apply pulse animation if user prefers reduced motion
if (!prefersReducedMotion && animated) {
  markerElement.classList.add('animate-glow-pulse');
}
```

### Keyboard Navigation

- Navigation controls (zoom buttons) are keyboard accessible by default
- Use semantic HTML for error messages (proper heading hierarchy)

---

## Testing Data

### Mock Coordinates

```typescript
/**
 * Test data for map component testing
 */
export const MOCK_COORDINATES = {
  NYC: { latitude: 40.7128, longitude: -74.0060 },
  LONDON: { latitude: 51.5074, longitude: -0.1278 },
  TOKYO: { latitude: 35.6762, longitude: 139.6503 },
  SYDNEY: { latitude: -33.8688, longitude: 151.2093 },
  NORTH_POLE: { latitude: 90, longitude: 0 },        // Edge case
  SOUTH_POLE: { latitude: -90, longitude: 0 },       // Edge case
  DATELINE: { latitude: 0, longitude: 180 },         // Edge case
  NULL_COORDS: { latitude: null, longitude: null },  // Error case
  INVALID_LAT: { latitude: 100, longitude: 0 },      // Invalid
} as const;
```

---

## Summary

This data model provides:
- ✅ Type-safe interfaces for all components
- ✅ Validation logic for coordinates and WebGL support
- ✅ State management patterns for map lifecycle
- ✅ Integration points with existing GeolocationData
- ✅ Constants for configuration and error messages
- ✅ Performance and accessibility considerations
- ✅ Testing data for comprehensive coverage

**Next Steps**: Generate API contracts based on these interfaces.
