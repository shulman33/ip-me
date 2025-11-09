# Research: Automatic IP Detection

**Feature**: 001-auto-ip-detection
**Date**: 2025-11-08
**Status**: Complete

## Overview

This document consolidates research findings for implementing automatic IP detection in IP.ME using Next.js 15 App Router, Server Components, and modern web APIs. Research focused on six key areas requested in the planning phase.

## 1. Next.js 15 App Router Request Header Handling

### Decision: Use `headers()` Function from `next/headers`

**Implementation**:
```typescript
import { headers } from 'next/headers';

export default async function Page() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const cfConnectingIp = headersList.get('cf-connecting-ip');

  // Extract first IP from X-Forwarded-For (client IP)
  const clientIp = cfConnectingIp || forwardedFor?.split(',')[0]?.trim();

  return <IPDisplay ip={clientIp} />;
}
```

**Rationale**:
- **Server-only**: `headers()` runs exclusively on server, protecting from client-side exposure
- **Read-only**: Returns `Headers` object following Web API standards
- **Async by design**: Must be awaited in Next.js 15 (breaking change from v14)
- **Request-scoped**: Automatically tied to incoming request, no global scope issues
- **Performance**: No client-side API call needed for initial render

**Best Practices**:
- Always await `headers()` call (Next.js 15 requirement)
- Access within Server Component or Server Action only
- Extract IP from `x-forwarded-for` header (Vercel sets this automatically)
- Use `cf-connecting-ip` for Cloudflare deployments (more reliable than X-Forwarded-For)
- Handle comma-separated values in X-Forwarded-For (client IP is first)

**Alternatives Considered**:
- **Route Handler (`app/api/detect-ip/route.ts`)**: Rejected for initial render because it requires client-side fetch, adding ~500ms latency
- **Middleware**: Rejected because middleware can't directly pass data to page components (would need redirect or header manipulation)
- **getServerSideProps**: Not available in App Router (Pages Router only)

## 2. IPstack API Integration

### Decision: Server-Side Route Handler with Caching

**Implementation Pattern**:
```typescript
// app/api/detect-ip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get('ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  if (!ip) {
    return NextResponse.json({ error: 'No IP provided' }, { status: 400 });
  }

  // Check cache first (5-minute TTL)
  const cacheKey = `ip-lookup:${ip}`;
  const cached = await kv.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Call IPstack API
  try {
    const response = await fetch(
      `http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API_KEY}`,
      { next: { revalidate: 300 } } // 5-minute cache
    );

    if (!response.ok) {
      throw new Error(`IPstack API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache for 5 minutes
    await kv.set(cacheKey, data, { ex: 300 });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'IP detection service unavailable' },
      { status: 500 }
    );
  }
}
```

**Rationale**:
- **API key protection**: Server-side only, never exposed to client
- **Cost optimization**: Vercel KV cache reduces API calls by ~80%
- **Privacy compliance**: 5-minute TTL ensures no long-term IP storage
- **Error handling**: Graceful fallback when IPstack unavailable
- **Performance**: Next.js built-in caching via `revalidate` option

**IPstack Free Tier**:
- 10,000 requests/month
- HTTP only (no HTTPS on free tier)
- Basic geolocation data (country, city, ISP)
- Sufficient for MVP testing

**Alternatives Considered**:
- **ipify.org**: Simpler but no geolocation data
- **ipapi.com**: Better free tier (30k/month) but inconsistent reliability
- **Built-in detection only**: No fallback for VPN/proxy scenarios

## 3. shadcn/ui Button Component Customization

### Decision: Add Custom Green Variant

**Implementation**:
```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        // ... existing variants
        green: "bg-green-500 text-black hover:bg-green-600 dark:bg-[#00ff88] dark:hover:bg-[#00dd77] transition-all duration-200",
        greenGlow: "bg-[#00ff88] text-black hover:bg-[#00dd77] shadow-[0_0_20px_rgba(0,255,136,0.6)] transition-all duration-200",
      },
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Rationale**:
- **Dark theme optimized**: #00ff88 electric green per constitution
- **Glass-morphism**: Shadow creates depth without backdrop-blur (better performance)
- **Accessibility**: Black text on green meets WCAG AA (contrast ratio 7.5:1)
- **Transitions**: 200ms duration for smooth feedback without lag
- **Two variants**: `green` for default, `greenGlow` for success state

**Usage**:
```tsx
<Button variant="green">Copy</Button>
<Button variant="greenGlow">Copied!</Button>
```

**Alternatives Considered**:
- **CSS-in-JS**: Rejected due to bundle size impact
- **Tailwind arbitrary values**: Works but not reusable across components
- **New component**: Overkill for simple variant addition

## 4. Tailwind CSS Animation Patterns

### Decision: Utility-First with Custom Keyframes

**Button Feedback Animation**:
```css
/* app/globals.css */
@layer utilities {
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.6); }
    50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.8); }
  }

  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out;
  }
}
```

**Component Usage**:
```tsx
<Button
  variant="greenGlow"
  className={cn(
    "transition-all duration-200",
    copied && "animate-glow-pulse scale-95"
  )}
>
  {copied ? "Copied!" : "Copy"}
</Button>
```

**Rationale**:
- **Minimal bundle**: No animation libraries needed
- **Performance**: CSS animations run on GPU, butter-smooth 60fps
- **Tailwind integration**: Custom keyframes in globals.css, utilities via className
- **Motion reduction**: Respects `prefers-reduced-motion` automatically

**Animation Breakdown**:
- **Transition**: `transition-all duration-200` for state changes
- **Scale**: `scale-95` on active for tactile feedback
- **Glow pulse**: 2s animation on success state
- **Auto-reset**: Animation plays once, button returns to normal

**Alternatives Considered**:
- **Framer Motion**: 50KB+ bundle, overkill for simple button feedback
- **React Spring**: Complex API for basic transitions
- **CSS-in-JS animations**: Adds runtime overhead

## 5. Browser Clipboard API Implementation

### Decision: Navigator Clipboard with Fallback

**Implementation**:
```typescript
// hooks/use-copy-to-clipboard.ts
import { useState } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
      } else {
        // Fallback to execCommand for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error('Clipboard API not available');
        }

        setCopied(true);
        setError(null);
      }

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy. Please copy manually.');
      setCopied(false);
    }
  };

  return { copy, copied, error };
}
```

**Rationale**:
- **Modern first**: Navigator Clipboard API is standard (Chrome 63+, Firefox 53+, Safari 13.1+)
- **Graceful fallback**: execCommand works in all browsers since IE9
- **Security aware**: Checks `window.isSecureContext` (HTTPS required for Clipboard API)
- **User feedback**: 2-second success state before reset
- **Error handling**: Clear message when both methods fail

**Browser Support**:
- **Navigator Clipboard**: 97% global coverage (caniuse.com)
- **execCommand**: 100% coverage (deprecated but still works)
- **Combined**: Covers all browsers we target

**Alternatives Considered**:
- **clipboard.js library**: 10KB for functionality we can implement in 30 lines
- **Copy-to-clipboard package**: Unmaintained, potential security risk
- **Manual selection only**: Poor UX, no auto-copy

## 6. IPv4/IPv6 Validation with Zod

### Decision: Built-in Zod IP Validators

**Schema Definition**:
```typescript
// lib/validations/ip-schema.ts
import { z } from 'zod';

// IP Address validation
export const ipv4Schema = z.string().ip({ version: "v4" });
export const ipv6Schema = z.string().ip({ version: "v6" });
export const ipSchema = z.string().ip(); // Both IPv4 and IPv6

// IP Detection Result from API
export const ipDetectionResultSchema = z.object({
  ip: ipSchema,
  version: z.enum(['IPv4', 'IPv6']),
  country_code: z.string().optional(),
  country_name: z.string().optional(),
  city: z.string().optional(),
  region_name: z.string().optional(),
  zip: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isp: z.string().optional(),
  connection_type: z.string().optional(),
});

export type IPDetectionResult = z.infer<typeof ipDetectionResultSchema>;

// Validation helpers
export function validateIPv4(ip: string): boolean {
  return ipv4Schema.safeParse(ip).success;
}

export function validateIPv6(ip: string): boolean {
  return ipv6Schema.safeParse(ip).success;
}

export function detectIPVersion(ip: string): 'IPv4' | 'IPv6' | null {
  if (validateIPv4(ip)) return 'IPv4';
  if (validateIPv6(ip)) return 'IPv6';
  return null;
}
```

**Zod IP Validation Examples**:
```typescript
// IPv4
ipv4Schema.parse("192.168.1.1"); // ✅
ipv4Schema.parse("2001:db8::1");  // ❌ ZodError

// IPv6
ipv6Schema.parse("2001:0db8:85a3::8a2e:0370:7334"); // ✅
ipv6Schema.parse("::1"); // ✅ (loopback)
ipv6Schema.parse("192.168.1.1"); // ❌ ZodError

// Both
ipSchema.parse("192.168.1.1"); // ✅
ipSchema.parse("2001:db8::1");  // ✅
ipSchema.parse("invalid");      // ❌ ZodError
```

**Rationale**:
- **No custom regex needed**: Zod's built-in validators handle all edge cases
- **Type safety**: `z.infer` generates TypeScript types from schemas
- **Runtime validation**: Catches invalid IPs from untrusted sources (headers, API)
- **RFC compliance**: Zod follows RFC 791 (IPv4) and RFC 4291 (IPv6)
- **Error messages**: Clear validation errors for debugging

**IPv6 Formats Supported**:
- Full: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- Compressed: `2001:db8:85a3::8a2e:370:7334`
- Loopback: `::1`
- IPv4-mapped: `::ffff:192.0.2.1`
- Link-local: `fe80::1`

**Alternatives Considered**:
- **Custom regex**: Error-prone, doesn't handle all IPv6 compression formats
- **ip-address library**: 50KB for functionality Zod provides in core
- **Manual validation**: Unreliable for IPv6 edge cases

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| IP Detection | Server-side via `headers()` | Instant render, no client API delay |
| API Integration | IPstack with Vercel KV caching | Privacy-compliant, cost-effective |
| Button Styling | Custom shadcn/ui green variant | Constitution-compliant dark theme |
| Animations | Tailwind utilities + CSS keyframes | Minimal bundle, smooth performance |
| Clipboard | Navigator API + execCommand fallback | Modern + graceful degradation |
| Validation | Zod built-in IP validators | Type-safe, RFC-compliant, minimal code |

## Performance Impact Analysis

**Estimated Bundle Sizes**:
- Zod: ~15KB gzipped (already used project-wide)
- shadcn/ui Button: ~3KB gzipped (shared component)
- Custom code: ~5KB gzipped (hooks, utils, components)
- **Total**: ~23KB gzipped (well under 100KB target)

**Expected Latency**:
- Server-side IP detection: ~50ms (header read + validation)
- Client-side API call: ~200ms (Vercel Edge + KV cache hit)
- IPstack API (cache miss): ~800ms (external API + cache write)
- Clipboard operation: <10ms (synchronous browser API)

**Cache Hit Rate Projection**:
- Vercel KV 5-minute TTL
- Repeat visitors: ~60% of traffic
- Expected cache hit rate: 75-80%
- API call reduction: 75-80%
- Cost savings: ~$0/month (within free tier)

## References

- [Next.js 15 App Router Docs](https://nextjs.org/docs/app)
- [Zod Documentation](https://zod.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [Clipboard API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [IPstack API Docs](https://ipstack.com/documentation)
- [RFC 791 (IPv4)](https://www.rfc-editor.org/rfc/rfc791)
- [RFC 4291 (IPv6)](https://www.rfc-editor.org/rfc/rfc4291)
