# Quickstart: Interactive Location Map

**Feature**: 003-interactive-location-map
**Branch**: `003-interactive-location-map`
**Date**: 2025-11-09

## Overview

This guide helps developers implement the interactive location map feature. Follow these steps to add a dark-themed Mapbox GL JS map that displays user location with a glowing green pin marker.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Completed features 001 (IP detection) and 002 (geolocation display)
- ✅ GeolocationData includes `latitude` and `longitude` fields
- ✅ Node.js 18+ and npm installed
- ✅ Mapbox account (free tier is sufficient)

---

## Step 1: Get Mapbox Access Token

### 1.1 Create Mapbox Account

1. Go to https://www.mapbox.com/
2. Sign up for a free account (50,000 map loads/month)
3. Verify your email address

### 1.2 Create Access Token

1. Navigate to https://account.mapbox.com/access-tokens/
2. Click "Create a token"
3. Token name: `ip-me-production`
4. Scopes needed:
   - ✅ `styles:read`
   - ✅ `fonts:read`
   - ✅ `sprites:read`
   - ❌ Uncheck all write scopes
5. Click "Create token"
6. Copy the token (starts with `pk.`)

### 1.3 Configure URL Restrictions (IMPORTANT)

1. Click on your token in the list
2. Under "URL restrictions", click "Add URL"
3. Add these URLs:
   ```
   http://localhost:*
   https://yourdomain.com
   https://*.vercel.app
   ```
4. Save changes

**Why this matters**: Prevents token abuse if accidentally exposed

---

## Step 2: Install Dependencies

```bash
# Install Mapbox GL JS
npm install mapbox-gl@^3.0.0

# Install TypeScript types
npm install --save-dev @types/mapbox-gl
```

**Expected bundle size impact**: +68KB gzipped (within 100KB budget)

---

## Step 3: Configure Environment Variables

Create or update `.env.local`:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

**Important**: This token MUST be public (`NEXT_PUBLIC_*`) because Mapbox GL JS runs client-side.

Add to `.gitignore` (should already exist):

```
.env.local
```

Create `.env.example` for other developers:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token_here
```

---

## Step 4: Update CSP Headers

Edit `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;
              worker-src 'self' blob:;
              child-src blob:;
              connect-src 'self' https://api.mapbox.com https://events.mapbox.com;
              style-src 'self' 'unsafe-inline' https://api.mapbox.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

**Why needed**: Mapbox GL JS uses WebGL, web workers, and dynamic scripts

---

## Step 5: Create Type Definitions

Create `src/types/map.ts`:

```typescript
/**
 * Geographic coordinates for map positioning
 */
export interface MapCoordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/**
 * Map load state
 */
export type MapLoadState = 'initializing' | 'loading' | 'loaded' | 'error';

/**
 * Map error types
 */
export interface MapError {
  type: 'coordinates' | 'webgl' | 'load' | 'token';
  message: string;
  details?: unknown;
}

/**
 * LocationMap component props
 */
export interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerColor?: string;
  animated?: boolean;
  className?: string;
  onMapLoad?: () => void;
  onMapError?: (error: MapError) => void;
}

/**
 * MapError component props
 */
export interface MapErrorProps {
  message: string;
  type?: 'coordinates' | 'webgl' | 'load' | 'token';
  className?: string;
}
```

---

## Step 6: Create Utility Functions

Create `src/lib/utils/map-helpers.ts`:

```typescript
import mapboxgl from 'mapbox-gl';
import type { MapError, MapCoordinates } from '@/types/map';

// Constants
export const MAP_DEFAULTS = {
  ZOOM_LEVEL: 12,
  STYLE: 'mapbox://styles/mapbox/dark-v11',
  MARKER_COLOR: '#00ff88',
  MARKER_SCALE: 1.2,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
} as const;

export const MAP_ERROR_MESSAGES = {
  COORDINATES_MISSING: 'Location coordinates unavailable',
  WEBGL_UNSUPPORTED: 'Your browser does not support interactive maps',
  LOAD_FAILED: 'Map temporarily unavailable',
  TOKEN_INVALID: 'Map temporarily unavailable',
} as const;

// Validation
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
        message: MAP_ERROR_MESSAGES.COORDINATES_MISSING
      }
    };
  }

  if (latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Invalid coordinate values',
        details: { latitude, longitude }
      }
    };
  }

  return { valid: true };
}

export function checkWebGLSupport(): { supported: boolean; error?: MapError } {
  if (!mapboxgl.supported()) {
    return {
      supported: false,
      error: {
        type: 'webgl',
        message: MAP_ERROR_MESSAGES.WEBGL_UNSUPPORTED
      }
    };
  }
  return { supported: true };
}

// Helpers
export function toMapboxCoordinates(coords: MapCoordinates): [number, number] {
  return [coords.longitude, coords.latitude];
}

export function getMapboxAccessToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured');
  }
  return token;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

---

## Step 7: Create Map Components

### 7.1 MapError Component

Create `src/components/features/map/map-error.tsx`:

```typescript
import type { MapErrorProps } from '@/types/map';

export function MapError({ message, type, className }: MapErrorProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-border bg-card p-8 ${className || ''}`}
      role="alert"
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
```

### 7.2 MapSkeleton Component

Create `src/components/features/map/map-skeleton.tsx`:

```typescript
export function MapSkeleton({ className, height }: { className?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/20 ${className || ''}`}
      style={{ height: height || '300px', width: '100%' }}
      aria-label="Loading map"
    />
  );
}
```

### 7.3 LocationMap Component

Create `src/components/features/map/location-map.tsx`:

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { LocationMapProps, MapLoadState, MapError } from '@/types/map';
import {
  MAP_DEFAULTS,
  validateCoordinates,
  checkWebGLSupport,
  toMapboxCoordinates,
  getMapboxAccessToken,
  prefersReducedMotion,
} from '@/lib/utils/map-helpers';
import { MapError as MapErrorComponent } from './map-error';

export function LocationMap({
  latitude,
  longitude,
  zoom = MAP_DEFAULTS.ZOOM_LEVEL,
  markerColor = MAP_DEFAULTS.MARKER_COLOR,
  animated = true,
  className,
  onMapLoad,
  onMapError,
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [loadState, setLoadState] = useState<MapLoadState>('initializing');
  const [error, setError] = useState<MapError | null>(null);

  useEffect(() => {
    // Validate coordinates
    const coordValidation = validateCoordinates(latitude, longitude);
    if (!coordValidation.valid) {
      setLoadState('error');
      setError(coordValidation.error!);
      onMapError?.(coordValidation.error!);
      return;
    }

    // Check WebGL support
    const webglCheck = checkWebGLSupport();
    if (!webglCheck.supported) {
      setLoadState('error');
      setError(webglCheck.error!);
      onMapError?.(webglCheck.error!);
      return;
    }

    if (!mapContainer.current || map.current) return;

    // Initialize map
    setLoadState('loading');

    try {
      const accessToken = getMapboxAccessToken();

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_DEFAULTS.STYLE,
        center: toMapboxCoordinates({ latitude, longitude }),
        zoom,
        minZoom: MAP_DEFAULTS.MIN_ZOOM,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM,
        accessToken,
      });

      // Create custom marker
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.width = '32px';
      markerEl.style.height = '32px';
      markerEl.style.backgroundColor = markerColor;
      markerEl.style.borderRadius = '50%';

      // Add pulse animation if enabled and user allows
      if (animated && !prefersReducedMotion()) {
        markerEl.classList.add('animate-glow-pulse');
      }

      marker.current = new mapboxgl.Marker({
        element: markerEl,
      })
        .setLngLat(toMapboxCoordinates({ latitude, longitude }))
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'bottom-right'
      );

      // Handle load event
      map.current.on('load', () => {
        setLoadState('loaded');
        onMapLoad?.();
      });

      // Handle error event
      map.current.on('error', (e) => {
        const mapError: MapError = {
          type: 'load',
          message: 'Map temporarily unavailable',
          details: e,
        };
        setLoadState('error');
        setError(mapError);
        onMapError?.(mapError);
      });

      // Handle resize
      const handleResize = () => map.current?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        marker.current?.remove();
        map.current?.remove();
      };
    } catch (e) {
      const mapError: MapError = {
        type: 'token',
        message: 'Map temporarily unavailable',
        details: e,
      };
      setLoadState('error');
      setError(mapError);
      onMapError?.(mapError);
    }
  }, [latitude, longitude, zoom, markerColor, animated, onMapLoad, onMapError]);

  if (loadState === 'error' && error) {
    return <MapErrorComponent message={error.message} type={error.type} />;
  }

  return (
    <div
      className={`w-full h-[300px] sm:w-[60%] sm:h-[400px] sm:mx-auto rounded-lg overflow-hidden ${className || ''}`}
    >
      <div
        ref={mapContainer}
        className="w-full h-full"
        role="region"
        aria-label={`Interactive map showing location at ${latitude}, ${longitude}`}
      />
    </div>
  );
}
```

### 7.4 Barrel Export

Create `src/components/features/map/index.ts`:

```typescript
export { LocationMap } from './location-map';
export { MapError } from './map-error';
export { MapSkeleton } from './map-skeleton';
```

---

## Step 8: Integrate with Existing Geolocation Display

Edit `src/app/page.tsx` or wherever geolocation is displayed:

```typescript
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/features/map';

// Dynamic import to prevent SSR and reduce initial bundle
const LocationMap = dynamic(
  () => import('@/components/features/map').then(mod => ({ default: mod.LocationMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton />
  }
);

export default function Page() {
  // ... existing code to get geolocation data

  return (
    <div>
      {/* Existing geolocation cards */}
      <GeolocationPrimaryInfo data={geolocationData} />
      <GeolocationSecondaryInfo data={geolocationData} />

      {/* NEW: Add map below geolocation info */}
      {geolocationData.latitude && geolocationData.longitude && (
        <div className="mt-6">
          <LocationMap
            latitude={geolocationData.latitude}
            longitude={geolocationData.longitude}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Step 9: Test the Implementation

### 9.1 Development Testing

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# You should see:
# - Geolocation data cards
# - Dark-themed map below with green pin marker
# - Map centered on your detected location
```

### 9.2 Test Error States

**Test 1: Missing Coordinates**
```typescript
// Temporarily mock null coordinates
const testData = { ...geolocationData, latitude: null, longitude: null };
<LocationMap latitude={testData.latitude!} longitude={testData.longitude!} />
// Expected: Error message "Location coordinates unavailable"
```

**Test 2: WebGL Unsupported**
```typescript
// Disable WebGL in browser DevTools > Rendering > Emulate WebGL disabled
// Expected: Error message "Your browser does not support interactive maps"
```

### 9.3 Test Responsive Design

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test on various viewports:
   - Mobile (375px): Full width, 300px height
   - Desktop (1024px): 60% width, 400px height

### 9.4 Test Accessibility

1. **Keyboard Navigation**:
   - Tab to zoom controls
   - Press +/- to zoom

2. **Reduced Motion**:
   - Enable in OS settings: System Preferences > Accessibility > Display > Reduce motion
   - Verify: Pin marker doesn't pulse

3. **Screen Reader**:
   - Use VoiceOver (Mac) or NVDA (Windows)
   - Verify: Map region announced correctly

---

## Step 10: Verify Performance

### 10.1 Check Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build

# Check that total JS bundle < 100KB gzipped
```

### 10.2 Check Core Web Vitals

```bash
# Run Lighthouse
npm run build
npm start

# Open Chrome DevTools > Lighthouse > Run audit
# Verify:
# - LCP < 2.5s ✅
# - FID < 100ms ✅
# - CLS < 0.1 ✅
```

---

## Common Issues & Solutions

### Issue: "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured"

**Solution**:
1. Check `.env.local` file exists
2. Verify token name: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (exact spelling)
3. Restart dev server after adding env var

### Issue: Map shows blank/gray tiles

**Solution**:
1. Check browser console for 401 errors (invalid token)
2. Verify token is public token (starts with `pk.`)
3. Check URL restrictions include `localhost`

### Issue: "Map temporarily unavailable" error

**Possible causes**:
1. **No internet connection**: Check network tab in DevTools
2. **CSP blocking Mapbox**: Check console for CSP errors, update next.config.js
3. **Rate limit exceeded**: Free tier allows 50k loads/month

### Issue: Layout shift when map loads

**Solution**:
1. Verify fixed height is applied: `h-[300px]` or `h-[400px]`
2. Check that parent container doesn't have `height: auto`
3. Use MapSkeleton during loading

### Issue: Marker not visible on dark map

**Solution**:
1. Verify marker color is bright: `#00ff88` (default green)
2. Check marker is not behind map layers
3. Verify coordinates are within map bounds

---

## Next Steps

After completing implementation:

1. ✅ Run tests: `npm test`
2. ✅ Run linting: `npm run lint`
3. ✅ Create pull request
4. ✅ Update CLAUDE.md with Mapbox technology
5. ✅ Document any deviations from plan

**Ready for /speckit.tasks**: This feature is now planned and ready for task generation.
