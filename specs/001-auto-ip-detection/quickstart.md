# Quickstart: Automatic IP Detection

**Feature**: 001-auto-ip-detection
**Branch**: `001-auto-ip-detection`
**Est. Time**: 30 minutes setup + 2-3 days implementation

## Prerequisites

- Node.js 18+ installed
- npm/yarn/pnpm package manager
- Next.js 15 project initialized (already complete for IP.ME)
- Vercel account (for KV and deployment)
- IPstack API free tier account

## 1. Environment Setup (15 min)

### Install Dependencies

```bash
# Core dependencies (if not already installed)
npm install zod@^3.24.2

# Development dependencies
npm install -D @types/node typescript

# Vercel KV for caching
npm install @vercel/kv
```

### Setup Environment Variables

Create `.env.local` in project root:

```env
# IPstack API Key (get free tier at ipstack.com)
IPSTACK_API_KEY=your_api_key_here

# Vercel KV (auto-configured on Vercel, local dev uses mock)
KV_URL=your_kv_rest_api_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

**Get IPstack API Key**:
1. Sign up at https://ipstack.com/signup/free
2. Free tier: 10,000 requests/month
3. Copy API key to `.env.local`

**Setup Vercel KV** (for caching):
1. Go to Vercel Dashboard → Storage → Create Database → KV
2. Name: `ip-detection-cache`
3. Copy environment variables to `.env.local`
4. For local dev, use `@vercel/kv` mock mode (no KV needed)

### Verify Environment

```bash
# Check Node.js version (should be 18+)
node --version

# Verify dependencies installed
npm list zod @vercel/kv

# Test environment variables loaded
npm run dev
# Open browser dev tools → Console → check for errors
```

## 2. Project Structure Setup (5 min)

### Create Directory Structure

```bash
# From project root
mkdir -p components/ui
mkdir -p components/features/ip-detection
mkdir -p lib/utils
mkdir -p lib/validations
mkdir -p types
mkdir -p hooks
mkdir -p app/api/detect-ip
```

### Initialize shadcn/ui (if not already done)

```bash
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Add shadcn/ui Button Component

```bash
npx shadcn@latest add button
```

This creates `components/ui/button.tsx` which we'll customize in implementation.

## 3. Development Workflow

### Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Recommended Dev Tools

1. **VS Code Extensions**:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript Vue Plugin (Volar) for better TS support

2. **Browser Extensions**:
   - React Developer Tools
   - Redux DevTools (for state debugging)

3. **Testing Tools**:
   - Playwright for E2E tests
   - Jest + React Testing Library for unit tests

## 4. Implementation Order (Follow Tasks.md)

Once `/speckit.tasks` is run, follow this sequence:

### Phase 1: Setup (1-2 hours)

1. Install all dependencies
2. Configure Tailwind with custom green color
3. Setup TypeScript strict mode
4. Initialize Vercel KV connection

### Phase 2: Foundational (2-3 hours)

1. Create Zod validation schemas (`lib/validations/ip-schema.ts`)
2. Define TypeScript types (`types/ip.ts`)
3. Build utility functions (`lib/utils/ip-detection.ts`, `lib/utils/format-ip.ts`)
4. Implement clipboard hook (`hooks/use-copy-to-clipboard.ts`)

### Phase 3: User Story 1 - IP Display (4-6 hours)

1. Create Server Component for IP detection (`app/page.tsx`)
2. Build IP Display component (`components/features/ip-detection/ip-display.tsx`)
3. Implement server-side header reading
4. Add loading states with Suspense
5. Style with Tailwind (dark theme, monospace font)

### Phase 4: User Story 2 - Copy Functionality (2-3 hours)

1. Customize Button component with green variant
2. Build Copy Button Client Component
3. Implement clipboard operations
4. Add visual feedback (glow, text change)
5. Handle clipboard errors gracefully

### Phase 5: User Story 3 - Error Handling (3-4 hours)

1. Create API route handler (`app/api/detect-ip/route.ts`)
2. Integrate IPstack API with caching
3. Implement error boundaries
4. Add retry logic with exponential backoff
5. Create user-friendly error messages

### Phase 6: Testing & Polish (4-6 hours)

1. Write unit tests for utilities and hooks
2. Write integration tests for API routes
3. Write E2E tests for user flows
4. Run accessibility audits (jest-axe)
5. Performance optimization (Lighthouse)
6. Final QA and bug fixes

**Total Estimated Time**: 15-24 hours (2-3 days)

## 5. Testing Strategy

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- ip-detection.test.ts

# Watch mode for development
npm test -- --watch
```

Test files live in `__tests__/unit/`:
- `ip-detection.test.ts` - IP detection utilities
- `ip-schema.test.ts` - Zod validation schemas
- `format-ip.test.ts` - IP formatting functions

### Integration Tests

```bash
# Run integration tests
npm test -- --testPathPattern=integration
```

Test files live in `__tests__/integration/`:
- `detect-ip-route.test.ts` - API route handler with mocked IPstack

### E2E Tests

```bash
# Install Playwright (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- ip-display-copy.spec.ts
```

Test files live in `__tests__/e2e/`:
- `ip-display-copy.spec.ts` - Full user journey

### Accessibility Tests

```bash
# Run a11y tests
npm test -- --testPathPattern=a11y
```

Accessibility checks integrated in unit tests via `jest-axe`.

## 6. Performance Validation

### Lighthouse CI

```bash
# Run Lighthouse locally
npx lighthouse http://localhost:3000 --view

# Check Core Web Vitals
npm run lighthouse:ci
```

**Expected Scores**:
- Performance: >90
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: <2.5s (target: ~1.5s)
- **FID (First Input Delay)**: <100ms (target: <50ms)
- **CLS (Cumulative Layout Shift)**: <0.1 (target: 0)

### Bundle Size Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Expected bundle sizes:
# - Total JS: <100KB gzipped (constitution limit)
# - Feature code: ~45KB gzipped (includes Zod, hooks, components)
```

## 7. Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Environment Variables on Vercel**:
1. Go to Project Settings → Environment Variables
2. Add `IPSTACK_API_KEY` (from .env.local)
3. Vercel KV variables auto-configured

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 8. Debugging Tips

### Common Issues

**Issue**: `headers() called outside request scope`
**Fix**: Ensure `headers()` called inside Server Component or Route Handler, not at module level.

**Issue**: `Clipboard API unavailable`
**Fix**: Must use HTTPS (localhost is exempt). Check `window.isSecureContext` in console.

**Issue**: `IPstack 403 Forbidden`
**Fix**: Free tier only supports HTTP, not HTTPS. Use `http://api.ipstack.com` not `https`.

**Issue**: `Vercel KV connection failed`
**Fix**: Verify environment variables set in Vercel dashboard, redeploy after adding.

**Issue**: `Zod validation error: invalid IP`
**Fix**: Check IP format with `z.string().ip()`. Verify headers not empty/undefined.

### Debugging Commands

```bash
# Check Next.js build output
npm run build -- --debug

# Verify TypeScript types
npx tsc --noEmit

# Check Tailwind classes compiled
npm run dev
# Open browser dev tools → Inspect element → Check computed styles

# Test API route directly
curl http://localhost:3000/api/detect-ip
curl "http://localhost:3000/api/detect-ip?ip=8.8.8.8"
```

### Dev Tools

**React DevTools**:
- Inspect component tree
- Check props/state
- Profile renders

**Network Tab**:
- Monitor API calls to `/api/detect-ip`
- Check cache headers
- Verify response times

**Console**:
- Check for Zod validation errors
- Monitor clipboard API calls
- Track state changes

## 9. Code Quality Checks

### Pre-commit Checklist

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run tests
npm test

# Build succeeds
npm run build
```

### Git Workflow

```bash
# Ensure on feature branch
git checkout 001-auto-ip-detection

# Commit small, focused changes
git add <files>
git commit -m "feat: implement server-side IP detection"

# Follow conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: add tests
# chore: maintenance
```

## 10. Resources

### Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [IPstack API](https://ipstack.com/documentation)

### Internal Docs

- [Spec](./spec.md) - Feature requirements
- [Plan](./plan.md) - Implementation plan
- [Data Model](./data-model.md) - Type definitions
- [Research](./research.md) - Technical decisions
- [API Contract](./contracts/detect-ip.yaml) - OpenAPI spec

### Helpful Commands

```bash
# Quick reference
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm test                 # Run all tests
npm run type-check       # TypeScript check
npx shadcn@latest add    # Add shadcn/ui component
```

## Next Steps

1. ✅ **Setup complete** - Environment configured
2. ⏭️ **Run `/speckit.tasks`** - Generate task breakdown
3. 🚀 **Start implementing** - Follow task order
4. ✅ **Test thoroughly** - Unit → Integration → E2E
5. 🎉 **Deploy to Vercel** - Ship to production

**Questions?** Check [research.md](./research.md) for technical decisions or [plan.md](./plan.md) for architecture details.

Happy coding! 🚀
