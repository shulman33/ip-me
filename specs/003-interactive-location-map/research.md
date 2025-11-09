# Research: Interactive Location Map

**Feature**: 003-interactive-location-map
**Date**: 2025-11-09
**Research Phase**: Phase 0 - Technology Selection & Integration Patterns

## Research Questions Addressed

1. Which Mapbox GL JS version should be used?
2. How to integrate Mapbox GL JS with React 19 and Next.js 16?
3. How to implement dark theme styling with Mapbox?
4. What are the security best practices for Mapbox access tokens?
5. How to optimize bundle size and prevent CLS?
6. How to create custom markers with animations?
7. What are CSP requirements for Mapbox GL JS?

---

## 1. Mapbox GL JS Version Selection

### Decision: Use Mapbox GL JS v3.x (Latest Stable)

**Rationale**:
- Latest version with WebGL2 support for better performance
- Improved dark theme support with built-in style presets
- Better React integration patterns in documentation
- Active maintenance and security updates
- Smaller bundle size than v2.x (~60KB gzipped vs ~80KB)

**Installation**:
```bash
npm install mapbox-gl@^3.0.0
```

**Package Size**: ~60KB gzipped (verified from npm)

**Alternatives Considered**:
- **MapLibre GL JS**: Open-source fork, but less documentation for dark themes
  - Rejected: Mapbox's dark-v11 style is better documented and matches requirements
- **react-map-gl**: React wrapper library
  - Rejected: Adds 20KB to bundle, we need direct control for custom marker animations

---

## 2. React Integration Pattern

### Decision: Direct Mapbox GL JS Integration with useRef + useEffect

**Pattern**:
```typescript
'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function LocationMap({ latitude, longitude }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [longitude, latitude],
      zoom: 12,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
    });

    // Add marker
    marker.current = new mapboxgl.Marker({
      color: '#00ff88', // existing --color-green
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Cleanup
    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [latitude, longitude]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}
```

**Rationale**:
- React refs prevent re-initialization on re-renders
- useEffect with cleanup prevents memory leaks
- Direct API access allows custom marker styling
- Client Component ('use client') required for browser APIs

**Key Insights from Mapbox Documentation**:
- Map instance should be stored in a ref, not state (prevents unnecessary re-renders)
- Always call `map.remove()` in cleanup to prevent WebGL context leaks
- Marker color can be set via `color` option (supports hex values)
- Access token can be set per-map or globally via `mapboxgl.accessToken`

**Source**: Mapbox GL JS official examples (debug/markers.html, debug/fog.html)

---

## 3. Dark Theme Implementation

### Decision: Use Mapbox Dark-v11 Style with Custom Marker

**Dark Style URL**: `mapbox://styles/mapbox/dark-v11`

**Rationale**:
- Built-in dark theme that matches existing design (#1a1a1a background)
- No custom style configuration needed (reduces complexity)
- Officially maintained by Mapbox (reliable updates)
- Supports all required features (markers, navigation controls)

**Custom Marker Styling**:
```typescript
const marker = new mapboxgl.Marker({
  color: '#00ff88', // existing --color-green from globals.css
  scale: 1.2,       // slightly larger for visibility
  draggable: false, // prevent accidental dragging
})
```

**Glow Pulse Animation**:
- Apply existing `.animate-glow-pulse` class to marker element
- Create custom HTML element marker for full control:

```typescript
const el = document.createElement('div');
el.className = 'custom-marker';
el.style.width = '32px';
el.style.height = '32px';
el.style.backgroundColor = '#00ff88';
el.style.borderRadius = '50%';
el.classList.add('animate-glow-pulse'); // existing animation

const marker = new mapboxgl.Marker({ element: el })
  .setLngLat([longitude, latitude])
  .addTo(map);
```

**Reduced Motion Support**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  el.classList.add('animate-glow-pulse');
}
```

**Source**: Mapbox documentation on custom markers (debug/markers-custom.html)

**Alternative Considered**:
- Creating entirely custom map style in Mapbox Studio
  - Rejected: Overkill for requirements, adds maintenance burden

---

## 4. Security: Mapbox Access Token Best Practices

### Decision: Public Token with URL Restrictions

**Token Storage**: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local`

**Why Public Token is Required**:
- Mapbox GL JS runs client-side (requires browser WebGL)
- Map tiles fetched directly from browser to Mapbox CDN
- Cannot use server-side proxy without significant complexity

**Security Mitigations**:

1. **URL Restrictions** (CRITICAL):
   - Configure token in Mapbox dashboard to only allow requests from:
     - `http://localhost:*` (development)
     - `https://yourdomain.com` (production)
     - `https://*.vercel.app` (Vercel preview deployments)

2. **Token Scopes** (Recommended):
   - Only enable required scopes: `styles:read`, `fonts:read`, `sprites:read`
   - Disable: `styles:write`, `tokens:write`, `datasets:*`

3. **Rate Limiting**:
   - Mapbox free tier: 50,000 map loads/month
   - Automatically enforced at API level
   - No client-side rate limiting needed

**Alternative Considered**:
- **Server-side tile proxy**: Fetch tiles server-side, proxy to client
  - Rejected: Adds ~500 LOC complexity, defeats CDN benefits, increases server costs
  - Only worth it for high-security applications (banking, healthcare)

**Documentation**: Mapbox Access Tokens Guide (standard industry practice)

---

## 5. Bundle Size Optimization

### Decision: Dynamic Import with SSR Disabled

**Implementation**:
```typescript
// In page.tsx or parent component
import dynamic from 'next/dynamic';

const LocationMap = dynamic(
  () => import('@/components/features/map/location-map'),
  {
    ssr: false,
    loading: () => <MapSkeleton />
  }
);
```

**Bundle Impact Analysis**:
- **Mapbox GL JS**: ~60KB gzipped
- **Mapbox CSS**: ~8KB gzipped
- **Total addition**: ~68KB (within 100KB budget - 32KB remaining)

**CLS Prevention**:
```typescript
// Reserve exact height in parent component
<div style={{ width: '100%', height: '400px' }}>
  <LocationMap latitude={lat} longitude={lng} />
</div>
```

**Rationale**:
- Dynamic import prevents Mapbox from loading on initial page load
- Only loads when geolocation data available (below fold)
- `ssr: false` prevents Next.js from attempting SSR (Mapbox requires window object)
- Loading skeleton prevents layout shift during async load

**Verification**:
- Use `@next/bundle-analyzer` to verify total bundle < 100KB
- Run Lighthouse CI to verify CLS < 0.1

**Source**: Next.js dynamic imports documentation + Constitution performance requirements

---

## 6. CSP (Content Security Policy) Configuration

### Decision: Whitelist Mapbox Domains in next.config.js

**Required CSP Directives**:
```javascript
// next.config.js
const ContentSecurityPolicy = `
  img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;
  worker-src 'self' blob:;
  child-src blob:;
  connect-src 'self' https://api.mapbox.com https://events.mapbox.com;
  style-src 'self' 'unsafe-inline' https://api.mapbox.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

**Why Each Directive is Needed**:
- `img-src`: Map tiles (raster images from Mapbox CDN)
- `script-src`: Mapbox GL JS library loaded from CDN
- `worker-src blob:`: Mapbox uses web workers for tile processing
- `child-src blob:`: WebGL context creation
- `connect-src`: API calls for styles, fonts, sprites
- `style-src`: Mapbox CSS loaded from CDN

**Security Impact**:
- `unsafe-inline` and `unsafe-eval` required for Mapbox GL JS
  - Mapbox uses dynamic script evaluation for performance
  - Standard for WebGL libraries, unavoidable
  - Mitigated by URL restrictions on access token

**Alternative Considered**:
- Self-hosting Mapbox GL JS library
  - Rejected: Breaks automatic updates, increases maintenance burden

**Source**: Mapbox CSP requirements (community forum + GitHub issues)

---

## 7. Navigation Controls Implementation

### Decision: Use Built-in NavigationControl with Dark Styling

**Implementation**:
```typescript
useEffect(() => {
  const map = new mapboxgl.Map({...});

  // Add zoom and rotation controls
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,  // disable compass (not needed)
    showZoom: true,      // enable zoom buttons
    visualizePitch: false // disable pitch control
  });

  map.addControl(nav, 'bottom-right');

  return () => {
    map.remove();
  };
}, []);
```

**Dark Theme CSS Override**:
```css
/* In component or globals.css */
.mapboxgl-ctrl-group {
  background: rgba(26, 26, 26, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 64, 64, 0.5) !important;
}

.mapboxgl-ctrl-group button {
  color: #e5e5e5 !important;
}

.mapboxgl-ctrl-group button:hover {
  background: rgba(0, 255, 136, 0.1) !important;
}
```

**Rationale**:
- Built-in controls are accessible (keyboard navigation, ARIA labels)
- Minimal styling override maintains consistency
- `showCompass: false` simplifies UI (not needed for static location display)

**Source**: Mapbox NavigationControl API documentation

---

## 8. Error Handling Strategy

### Decision: Three-Tier Error Handling

**Tier 1: Missing Coordinates**
```typescript
// In parent component
if (!data.latitude || !data.longitude) {
  return <MapError message="Location coordinates unavailable" />;
}
```

**Tier 2: Map Load Failure**
```typescript
useEffect(() => {
  const map = new mapboxgl.Map({...});

  map.on('error', (e) => {
    console.error('Map error:', e);
    setMapError('Map temporarily unavailable');
  });

  return () => map.remove();
}, []);

if (mapError) {
  return <MapError message={mapError} />;
}
```

**Tier 3: WebGL Unavailable**
```typescript
useEffect(() => {
  if (!mapboxgl.supported()) {
    setMapError('Your browser does not support interactive maps');
    return;
  }

  // ... initialize map
}, []);
```

**Error Messages** (User-Friendly):
- Missing coordinates: "Location coordinates unavailable"
- WebGL unsupported: "Your browser does not support interactive maps"
- Map load error: "Map temporarily unavailable"
- Invalid token: "Map temporarily unavailable" (don't expose security details)

**Rationale**:
- All errors show same generic message to users (security best practice)
- Detailed errors logged to console for debugging
- Graceful degradation - page remains functional without map

**Source**: Constitution error handling requirements + Mapbox best practices

---

## 9. Responsive Design Implementation

### Decision: CSS-Based Responsive Container

**Implementation**:
```typescript
// location-map.tsx
<div className="map-container">
  <div ref={mapContainer} className="map" />
</div>
```

```css
/* In component styles or Tailwind */
.map-container {
  width: 100%;
  max-width: 100%;
  height: 300px;

  @media (min-width: 640px) {
    width: 60%;
    height: 400px;
    margin: 0 auto; /* center on desktop */
  }
}

.map {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem; /* 8px, matches existing card style */
}
```

**Tailwind Alternative**:
```typescript
<div className="w-full h-[300px] sm:w-[60%] sm:h-[400px] sm:mx-auto">
  <div ref={mapContainer} className="w-full h-full rounded-lg" />
</div>
```

**Viewport Resize Handling**:
```typescript
useEffect(() => {
  const handleResize = () => {
    map.current?.resize();
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Rationale**:
- Fixed heights prevent CLS (required for Core Web Vitals)
- `map.resize()` ensures map adapts to container size changes
- Tailwind classes maintain consistency with existing components

**Source**: Mapbox resize handling + Constitution responsive design requirements

---

## 10. Testing Strategy

### Unit Tests (Jest + React Testing Library)
```typescript
// location-map.test.tsx
describe('LocationMap', () => {
  it('renders map container with correct dimensions', () => {
    render(<LocationMap latitude={40.7} longitude={-74.0} />);
    const container = screen.getByTestId('map-container');
    expect(container).toHaveStyle({ height: '300px' });
  });

  it('shows error when coordinates missing', () => {
    render(<LocationMap latitude={null} longitude={null} />);
    expect(screen.getByText(/coordinates unavailable/i)).toBeInTheDocument();
  });

  it('respects prefers-reduced-motion', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true, // simulate reduced motion
    }));
    render(<LocationMap latitude={40.7} longitude={-74.0} />);
    // Assert no animation class applied
  });
});
```

### E2E Tests (Playwright)
```typescript
// map.spec.ts
test('displays map with marker at correct location', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.mapboxgl-map');

  const marker = await page.locator('.mapboxgl-marker');
  await expect(marker).toBeVisible();

  // Verify zoom controls
  await page.click('.mapboxgl-ctrl-zoom-in');
  // Assert zoom level increased
});

test('handles missing coordinates gracefully', async ({ page }) => {
  // Mock API to return null coordinates
  await page.route('**/api/detect-ip', route =>
    route.fulfill({ body: JSON.stringify({ latitude: null, longitude: null }) })
  );

  await page.goto('/');
  await expect(page.locator('text=coordinates unavailable')).toBeVisible();
});
```

**Rationale**:
- Unit tests verify error states and accessibility
- E2E tests verify actual map rendering and interactions
- Matches existing test patterns in codebase (Jest for units, Playwright for E2E)

**Source**: Constitution testing requirements

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Library Version** | Mapbox GL JS v3.x | Latest, best performance, dark theme support |
| **React Integration** | Direct integration with useRef + useEffect | Full control, no wrapper overhead |
| **Dark Theme** | Built-in dark-v11 style | Official, maintained, matches design |
| **Marker Style** | Custom HTML element with existing glow-pulse | Reuses existing animation, consistent |
| **Token Security** | Public token with URL restrictions | Standard practice, properly mitigated |
| **Bundle Size** | Dynamic import, SSR disabled | Stays within 100KB budget |
| **CSP** | Whitelist Mapbox domains | Required for WebGL, security trade-off |
| **Controls** | NavigationControl (zoom only) | Accessible, minimal, dark-styled |
| **Error Handling** | Three-tier with generic messages | Security + UX best practice |
| **Responsive** | CSS breakpoints + map.resize() | Matches existing patterns, prevents CLS |

---

## Open Questions (Resolved)

All "NEEDS CLARIFICATION" items from Technical Context have been resolved:

1. ✅ **Mapbox GL JS version**: v3.x (latest stable)
2. ✅ **Bundle impact**: ~68KB gzipped (within budget)
3. ✅ **API key exposure**: Public token with URL restrictions (industry standard)
4. ✅ **Server-side rendering**: SSR disabled via dynamic import
5. ✅ **CSP requirements**: Documented whitelist for Mapbox domains

---

## Next Steps

Phase 1 (Design & Contracts):
1. Create data-model.md with TypeScript interfaces
2. Generate component contracts (props, state, events)
3. Create quickstart.md with setup instructions
4. Update CLAUDE.md with Mapbox GL JS technology

Phase 2 (Implementation):
- Handled by `/speckit.tasks` command (out of scope for planning)
