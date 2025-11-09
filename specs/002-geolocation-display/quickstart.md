# Quickstart: Geolocation Data Display

**Feature**: 002-geolocation-display
**Date**: 2025-11-09
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide helps developers understand, build, and test the geolocation data display feature. Follow this guide to get up to speed quickly.

---

## 🎯 What This Feature Does

Displays comprehensive geolocation information for detected IP addresses in an elegant, responsive card-based layout:

- **Primary Info**: IP address, country (with flag emoji), city (large, prominent display)
- **Secondary Info**: State/region, postal code, coordinates, ISP, timezone
- **Smart Caching**: 5-minute Redis cache reduces API calls, improves performance
- **Responsive Design**: 1-column (mobile) → 2-column (tablet) → 3-column (desktop)
- **Error Handling**: User-friendly messages, retry mechanism for transient failures
- **Accessibility**: WCAG AA compliance, keyboard navigation, screen reader support

---

## 📋 Prerequisites

**Required Knowledge**:
- TypeScript 5.x
- React 19 (Server Components & Client Components)
- Next.js 16 (App Router, server actions, caching)
- Tailwind CSS 4 (utility-first styling)
- Zod (runtime validation)

**Development Environment**:
- Node.js 20+ (LTS)
- npm or pnpm
- Git
- VSCode (recommended) with ESLint, Prettier, TypeScript extensions

**API Keys & Services**:
- IPstack API key (Free tier: 1000 requests/month)
  - Sign up: https://ipstack.com/product
  - Add to `.env.local`: `IPSTACK_API_KEY=your_key_here`
- Upstash Redis (Free tier: 10K commands/day)
  - Sign up: https://upstash.com
  - Add to `.env.local`: `KV_REST_API_URL` and `KV_REST_API_TOKEN`

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Check Existing Setup

The feature extends existing infrastructure. Verify these files exist:

```bash
# API route (already implements IPstack + Redis caching)
ls src/app/api/detect-ip/route.ts

# Type definitions
ls src/types/ip.ts

# Validation schemas
ls src/lib/validations/ip-schema.ts

# Environment variables
cat .env.local | grep -E "IPSTACK|KV_REST"
```

**Expected Output**:
```
✅ src/app/api/detect-ip/route.ts (exists)
✅ src/types/ip.ts (exists)
✅ src/lib/validations/ip-schema.ts (exists)
✅ IPSTACK_API_KEY=xxx
✅ KV_REST_API_URL=xxx
✅ KV_REST_API_TOKEN=xxx
```

### Step 2: Install shadcn/ui Components

```bash
# Install required shadcn/ui components
npx shadcn@latest add card badge skeleton

# Verify installation
ls src/components/ui/{card,badge,skeleton}.tsx
```

**Expected Output**:
```
✅ src/components/ui/card.tsx
✅ src/components/ui/badge.tsx
✅ src/components/ui/skeleton.tsx
```

### Step 3: Test Existing API

```bash
# Start dev server
npm run dev

# Test API endpoint (in another terminal)
curl http://localhost:3000/api/detect-ip | jq

# Expected response:
# {
#   "ip": "127.0.0.1",
#   "version": "IPv4",
#   "country_code": "XX",
#   "country_name": "Unknown",
#   "cached": false,
#   "timestamp": "2025-11-09T10:00:00.000Z"
# }
```

---

## 📂 Project Structure

### Feature File Organization

```
src/
├── components/features/geolocation/   # NEW: Feature components
│   ├── geolocation-card.tsx          # Main container
│   ├── geolocation-data-grid.tsx     # Responsive grid
│   ├── geolocation-primary-info.tsx  # IP, country, city
│   ├── geolocation-secondary-info.tsx # State, postal, coords, etc.
│   ├── geolocation-skeleton.tsx      # Loading state
│   └── geolocation-error.tsx         # Error state + retry
│
├── types/geolocation.ts               # NEW: Geolocation-specific types
├── lib/utils/geolocation.ts           # NEW: Formatting utilities
└── app/page.tsx                       # UPDATE: Integrate display
```

### Implementation Order

1. **Types & Validation** (Foundation)
   - Extend `src/types/ip.ts` with `GeolocationData`
   - Create `src/types/geolocation.ts` (TimezoneData, DisplayState)
   - Update `src/lib/validations/ip-schema.ts` (Zod schemas)

2. **Utilities** (Business Logic)
   - Create `src/lib/utils/geolocation.ts`
   - Functions: `getCountryFlag()`, `formatCoordinates()`, `formatTimezone()`
   - Add unit tests

3. **Components** (UI Layer)
   - Bottom-up: Skeleton → Error → PrimaryInfo → SecondaryInfo → DataGrid → Card
   - Test each component in isolation

4. **Integration** (Page-Level)
   - Update `src/app/page.tsx` to fetch and display geolocation data
   - Add Suspense boundary with skeleton fallback
   - Test end-to-end flow

---

## 🛠️ Development Workflow

### Create a New Component (Example: GeolocationPrimaryInfo)

**1. Create Component File**:

```bash
# Create component directory
mkdir -p src/components/features/geolocation

# Create component file
touch src/components/features/geolocation/geolocation-primary-info.tsx
```

**2. Write Component Code**:

```tsx
// src/components/features/geolocation/geolocation-primary-info.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCountryFlag } from '@/lib/utils/geolocation';
import type { GeolocationData } from '@/types/ip';

interface GeolocationPrimaryInfoProps {
  data: GeolocationData;
  className?: string;
}

export function GeolocationPrimaryInfo({ data, className }: GeolocationPrimaryInfoProps) {
  const flag = getCountryFlag(data.country_code);
  const country = data.country_name || 'Unknown Country';
  const city = data.city || 'City unavailable';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold font-mono">{data.ip}</div>
        <div className="text-2xl font-bold">
          <span className="mr-2" aria-label={`${country} flag`}>{flag}</span>
          {country}
        </div>
        <div className="text-xl">{city}</div>
        {data.cached && (
          <Badge variant="outline" className="text-green">
            Cached
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
```

**3. Create Unit Test**:

```bash
touch src/components/features/geolocation/__tests__/geolocation-primary-info.test.tsx
```

```tsx
import { render, screen } from '@testing-library/react';
import { GeolocationPrimaryInfo } from '../geolocation-primary-info';
import type { GeolocationData } from '@/types/ip';

describe('GeolocationPrimaryInfo', () => {
  const mockData: GeolocationData = {
    ip: '8.8.8.8',
    version: 'IPv4',
    country_code: 'US',
    country_name: 'United States',
    city: 'Mountain View',
    cached: false,
    timestamp: new Date().toISOString(),
  };

  it('renders IP address', () => {
    render(<GeolocationPrimaryInfo data={mockData} />);
    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
  });

  it('renders country name with flag', () => {
    render(<GeolocationPrimaryInfo data={mockData} />);
    expect(screen.getByText(/United States/)).toBeInTheDocument();
    expect(screen.getByLabelText('United States flag')).toBeInTheDocument();
  });

  it('handles missing city gracefully', () => {
    const dataWithoutCity = { ...mockData, city: undefined };
    render(<GeolocationPrimaryInfo data={dataWithoutCity} />);
    expect(screen.getByText('City unavailable')).toBeInTheDocument();
  });
});
```

**4. Run Tests**:

```bash
npm test -- geolocation-primary-info
```

---

## 🧪 Testing Guide

### Unit Tests (Utilities)

```bash
# Test coordinate formatting
npm test -- geolocation.test.ts

# Example test
describe('formatCoordinates', () => {
  it('formats positive coordinates correctly', () => {
    expect(formatCoordinates(37.7749, -122.4194)).toBe('37.7749°N, 122.4194°W');
  });

  it('handles missing coordinates', () => {
    expect(formatCoordinates(undefined, undefined)).toBe('Coordinates unavailable');
  });
});
```

### Integration Tests (API)

```bash
# Test API route
npm test -- detect-ip.test.ts

# Example test
describe('GET /api/detect-ip', () => {
  it('returns geolocation data', async () => {
    const response = await fetch('/api/detect-ip?ip=8.8.8.8');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ip).toBe('8.8.8.8');
  });
});
```

### Component Tests (React Testing Library)

```bash
# Test component rendering
npm test -- geolocation-card.test.tsx
```

### E2E Tests (Playwright - Future)

```bash
# Test full user flow
npx playwright test geolocation.spec.ts
```

---

## 🐛 Debugging Tips

### Issue: API Returns "Service Unavailable"

**Symptom**: `GET /api/detect-ip` returns 500 error

**Diagnosis**:
1. Check IPstack API key: `echo $IPSTACK_API_KEY`
2. Test IPstack directly: `curl "http://api.ipstack.com/8.8.8.8?access_key=$IPSTACK_API_KEY"`
3. Check server logs: `npm run dev` (look for `[IPstack Error]`)

**Solution**:
- Verify API key is correct (not expired, not rate-limited)
- Ensure `.env.local` is loaded (restart dev server)

### Issue: Redis Cache Not Working

**Symptom**: All requests show `cached: false`

**Diagnosis**:
1. Check Redis env vars: `echo $KV_REST_API_URL`
2. Check server logs: Look for `[Cache HIT]` or `[Cache MISS]`
3. Test Redis: `curl -X GET "$KV_REST_API_URL/get/test-key" -H "Authorization: Bearer $KV_REST_API_TOKEN"`

**Solution**:
- Verify Upstash credentials in `.env.local`
- Check Upstash dashboard for connection errors
- Restart dev server after updating env vars

### Issue: Flag Emojis Not Rendering

**Symptom**: Country codes show as text (e.g., "US") instead of flags

**Diagnosis**:
1. Check browser (flag emojis require modern browsers)
2. Verify `getCountryFlag()` implementation
3. Test with known codes: `getCountryFlag('US')` → 🇺🇸

**Solution**:
- Update browser to latest version
- Check OS emoji support (Windows 10+, macOS 10.10+, Linux with emoji fonts)
- Fallback: Show country name if emoji not supported

### Issue: Layout Shift (CLS) on Load

**Symptom**: Content jumps when data loads

**Diagnosis**:
1. Use Lighthouse CI: `npm run lighthouse`
2. Check for missing skeleton dimensions
3. Verify grid spacing consistency

**Solution**:
- Ensure skeleton components match final layout height/width
- Use `min-h-[XXpx]` on containers to reserve space
- Test with slow 3G throttling to catch shifts

---

## 📊 Performance Monitoring

### Lighthouse CI (Core Web Vitals)

```bash
# Run Lighthouse audit
npm run lighthouse

# Check scores
# - LCP should be <2.5s
# - FID should be <100ms
# - CLS should be <0.1
```

### Redis Cache Hit Rate

```bash
# Check server logs for cache metrics
grep -E "Cache (HIT|MISS)" .next/server.log | wc -l

# Expected: >80% hit rate in production
```

### IPstack API Usage

```bash
# Count API calls (cache misses)
grep "Cache MISS" .next/server.log | wc -l

# Expected: <1000 calls/month (free tier limit)
```

---

## 🔗 Key Resources

### Documentation
- **Feature Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/geolocation-api.md](./contracts/geolocation-api.md)
- **Research**: [research.md](./research.md)

### External Docs
- [Next.js 15 App Router](https://nextjs.org/docs/15/app)
- [shadcn/ui Components](https://ui.shadcn.com)
- [IPstack API Docs](http://api.ipstack.com/documentation)
- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Tailwind CSS 4](https://tailwindcss.com/docs)

### Code References
- Existing API Route: [src/app/api/detect-ip/route.ts](../../../src/app/api/detect-ip/route.ts)
- IP Types: [src/types/ip.ts](../../../src/types/ip.ts)
- Validation Schemas: [src/lib/validations/ip-schema.ts](../../../src/lib/validations/ip-schema.ts)

---

## ✅ Implementation Checklist

### Phase 0: Setup ✅
- [x] IPstack API key configured
- [x] Upstash Redis configured
- [x] shadcn/ui components installed (card, badge, skeleton)
- [x] Dev server running (`npm run dev`)

### Phase 1: Foundation (Types & Validation)
- [ ] Extend `src/types/ip.ts` with `GeolocationData`
- [ ] Create `src/types/geolocation.ts` (TimezoneData, DisplayState, DisplayStatus)
- [ ] Update `src/lib/validations/ip-schema.ts` with Zod schemas
- [ ] Write unit tests for validation schemas

### Phase 2: Utilities (Business Logic)
- [ ] Create `src/lib/utils/geolocation.ts`
- [ ] Implement `getCountryFlag(countryCode: string): string`
- [ ] Implement `formatCoordinates(lat?: number, lon?: number): string`
- [ ] Implement `formatTimezone(timezone?: TimezoneData): string`
- [ ] Write unit tests for all utility functions (>80% coverage)

### Phase 3: Components (UI Layer)
- [ ] Create `src/components/features/geolocation/geolocation-skeleton.tsx`
- [ ] Create `src/components/features/geolocation/geolocation-error.tsx`
- [ ] Create `src/components/features/geolocation/geolocation-primary-info.tsx`
- [ ] Create `src/components/features/geolocation/geolocation-secondary-info.tsx`
- [ ] Create `src/components/features/geolocation/geolocation-data-grid.tsx`
- [ ] Create `src/components/features/geolocation/geolocation-card.tsx`
- [ ] Write component tests for each (>60% coverage)

### Phase 4: Integration (Page-Level)
- [ ] Update `src/app/page.tsx` to fetch geolocation data
- [ ] Add Suspense boundary with skeleton fallback
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Test error handling (network failure, invalid IP)
- [ ] Test caching behavior (first load vs. cached)

### Phase 5: Quality Assurance
- [ ] Run Lighthouse CI (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] Run accessibility tests (jest-axe, WCAG AA compliance)
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Manual QA on mobile devices (iOS Safari, Android Chrome)

### Phase 6: Documentation & Handoff
- [ ] Update [CLAUDE.md](../../../CLAUDE.md) with new technologies
- [ ] Add inline code comments for complex logic
- [ ] Create PR with detailed description
- [ ] Request code review from team
- [ ] Merge to main after approval

---

## 🎓 Learning Path

**New to Next.js 15 App Router?**
1. Read: [Next.js App Router Fundamentals](https://nextjs.org/docs/15/app/building-your-application/routing)
2. Watch: [Next.js App Router Tutorial](https://www.youtube.com/watch?v=gSSsZReIFRk)
3. Practice: Build a simple page with Server Components

**New to shadcn/ui?**
1. Read: [shadcn/ui Introduction](https://ui.shadcn.com/docs)
2. Explore: [Component Examples](https://ui.shadcn.com/docs/components/card)
3. Install: `npx shadcn@latest add card` and inspect the generated code

**New to Zod Validation?**
1. Read: [Zod Documentation](https://zod.dev)
2. Example: `z.object({ name: z.string().min(1), age: z.number().min(0) })`
3. Practice: Validate an API response in the dev console

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm test`)
- [ ] Lighthouse score >90 for Performance, Accessibility, Best Practices, SEO
- [ ] Environment variables configured in Vercel dashboard
- [ ] IPstack API key rate limit monitored (setup alerts at 800/1000 calls)
- [ ] Redis cache metrics look healthy (>80% hit rate)
- [ ] Error tracking configured (Sentry, LogRocket, or similar)
- [ ] Feature flag enabled (if using feature flagging system)

---

**Phase 1 Status**: Quickstart guide complete, ready for agent context update.
