<!--
SYNC IMPACT REPORT
==================
Version Change: [NEW] → 1.0.0
Modified Principles: N/A (Initial constitution)
Added Sections:
  - Core Principles (5 principles)
  - Next.js & React Standards
  - Component Architecture & Styling
  - Performance & Optimization
  - API, Data & Security
  - Testing & Quality Assurance
  - Code Organization & Error Handling
  - Governance
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section will reference new principles
  ✅ spec-template.md - No changes required (technology-agnostic by design)
  ✅ tasks-template.md - No changes required (follows user story structure)
Follow-up TODOs: None
-->

# IP.ME Constitution

## Core Principles

### I. Performance & Technical Excellence (NON-NEGOTIABLE)

**Core Web Vitals compliance is mandatory**:
- Largest Contentful Paint (LCP) MUST be <2.5s
- First Input Delay (FID) MUST be <100ms
- Cumulative Layout Shift (CLS) MUST be <0.1
- Mobile-first responsive design MUST be implemented for all components
- Progressive enhancement MUST be applied - core functionality works without JavaScript

**Rationale**: Performance directly impacts SEO rankings, user engagement, and conversion rates. Core Web Vitals are ranking factors and non-compliance undermines the entire product value proposition.

### II. SEO-First Architecture

**Search engine optimization is a first-class architectural concern**:
- Semantic HTML with proper heading hierarchy (single H1, logical H2-H6) MUST be used
- Structured data (JSON-LD) MUST be implemented for all pages
- Meta tags, canonical URLs, and Open Graph MUST be properly configured
- Dynamic sitemap generation MUST be implemented for location-specific pages
- Server-side rendering (SSR) MUST be used for content that needs to be indexed

**Rationale**: SEO is the primary traffic acquisition channel. Technical SEO must be embedded in architecture, not added as an afterthought.

### III. Dark Theme Design System

**Consistent visual language across all components**:
- Dark theme (#0a0a0a background) is the default and MUST be used
- Electric green (#00ff88) and cyan (#00d4ff) accent colors MUST be used for CTAs and highlights
- Inter font family or system fonts MUST be used
- Glass-morphism effects (backdrop-blur, transparency) MUST be applied consistently
- All interactive elements MUST have proper focus states with visible indicators
- Color contrast ratios MUST meet WCAG AA standards (4.5:1 for text)

**Rationale**: Visual consistency builds brand recognition and trust. Dark theme reduces eye strain and differentiates the product in a crowded market.

### IV. Privacy-First Development

**User privacy is non-negotiable**:
- Minimal data collection - only collect what's necessary for core functionality
- Transparent disclosure - privacy policy MUST be accessible and written in plain language
- GDPR and CCPA compliance MUST be built into data handling patterns
- No tracking cookies without explicit user consent
- User IP lookups MUST NOT be logged or persisted beyond caching requirements

**Rationale**: Privacy builds trust and is a legal requirement. Privacy-by-design prevents future compliance issues and differentiates the product from ad-tech competitors.

### V. Monetization Balance

**Ads enhance UX while maintaining technical excellence**:
- Ad placement MUST NOT negatively impact Core Web Vitals
- Ads MUST be lazy-loaded below the fold
- Ad containers MUST have reserved space to prevent layout shift (CLS)
- Maximum 3 ad units per page to maintain clean UX
- Ad-free experience MUST be available for premium users (future)

**Rationale**: Revenue is necessary for sustainability, but ads that harm performance or UX undermine SEO and user retention. Balance is achieved through technical implementation, not compromise.

## Next.js & React Standards

### Framework & Language Requirements

- **Next.js 15 App Router**: MUST use exclusively, no Pages Router
- **React Server Components**: MUST be preferred over Client Components
  - Only use Client Components when interactivity, browser APIs, or React hooks are required
  - Mark with 'use client' directive at top of file
- **Incremental Static Regeneration (ISR)**: MUST be implemented for dynamic content (location pages, IP data)
- **TypeScript**: MUST be used for all code with strict mode enabled
  - No `any` types except in explicitly justified cases
  - Proper type definitions for all props, state, and function signatures
- **File-based routing**: MUST follow Next.js conventions (app/[route]/page.tsx)

### Component Development Standards

- **Component Organization**: Place in `/components` with proper TypeScript interfaces
  - Use named exports for components
  - Co-locate types with components in same file unless shared
- **shadcn/ui Foundation**: MUST use as base component library, customize for dark theme
- **Compound Component Patterns**: MUST be used for complex UI elements (tabs, accordions, modals)
- **React.forwardRef**: MUST be used for components that need DOM refs
- **Prop Validation**: All props MUST have TypeScript interfaces/types
- **Component Naming**: PascalCase for components, kebab-case for file names

## Component Architecture & Styling

### Tailwind CSS Conventions

- **Utility-First**: Tailwind MUST be used exclusively, no custom CSS unless absolutely necessary
  - If custom CSS is required, justify in PR and place in module.css with CSS modules
- **Dark Theme Implementation**: Use Tailwind's `dark:` variants
- **Spacing Scale**: Use consistent scale (4px, 8px, 16px, 24px, 32px) via Tailwind spacing utilities
- **Focus States**: All interactive elements MUST have visible focus indicators
  - Use `focus-visible:` variants for keyboard-only focus
- **Color System**: Define brand colors in `tailwind.config.js`
  - Primary: Electric green (#00ff88)
  - Secondary: Cyan (#00d4ff)
  - Background: Dark (#0a0a0a)
  - Surface: Dark gray (#1a1a1a)

### Accessibility Requirements

- **Semantic HTML**: Use proper HTML5 elements (header, nav, main, article, footer)
- **ARIA Labels**: Add where semantic HTML is insufficient
- **Keyboard Navigation**: All interactive elements MUST be keyboard accessible
- **Screen Reader Support**: Meaningful alt text, proper heading hierarchy, skip links
- **Color Contrast**: MUST meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

## Performance & Optimization

### Bundle Size Requirements

- **Total JavaScript**: <100KB gzipped across all bundles
- **Dynamic Imports**: MUST be used for heavy libraries (map components, analytics)
  - Example: `const MapComponent = dynamic(() => import('./Map'), { ssr: false })`
- **Code Splitting**: Automatic via Next.js, verify with bundle analyzer
- **Tree Shaking**: Ensure all imports are tree-shakeable (import only what's needed)

### Image & Asset Optimization

- **Next.js Image Component**: MUST be used for all images
  - Proper `width`, `height`, and `alt` attributes required
  - Use `priority` prop for LCP images
  - Use `loading="lazy"` for below-fold images
- **Image Formats**: Prefer WebP with JPEG/PNG fallbacks (handled by Next.js Image)
- **Font Optimization**: Use `next/font` for self-hosted fonts with `display: swap`

### Loading & Caching Strategies

- **Lazy Loading**: Below-fold content (ads, maps, secondary features) MUST be lazy loaded
- **Cache Headers**: Implement proper caching with Next.js built-in mechanisms
- **Service Workers**: Implement for offline support and performance (future enhancement)
- **Prefetching**: Use Next.js Link component with automatic prefetching for internal links

## API, Data & Security

### API Integration Standards

- **Server-Side API Calls**: All external API calls (IPstack) MUST be server-side to protect API keys
  - Use Route Handlers (`app/api/*/route.ts`) or Server Components
  - Never expose API keys to client
- **Response Caching**: MUST implement with 5-minute TTL using Vercel KV or Next.js cache
  - Cache IP geolocation responses to reduce API costs
  - Implement cache invalidation strategy
- **Type Safety**: Use Zod for runtime validation of API responses
  - Define schemas for all external API responses
  - Validate and parse responses before use
- **Error Boundaries**: MUST wrap all external API integrations
  - Graceful degradation with fallback UI
  - User-friendly error messages

### Data Handling Patterns

- **Loading States**: All async operations MUST have loading indicators
  - Use Suspense boundaries with fallback UI
  - Skeleton screens for better perceived performance
- **Error Handling**: Proper error states with retry mechanisms
  - Catch and handle errors at component level
  - Log errors without exposing sensitive data
- **Input Validation**: Sanitize and validate all user inputs (IP addresses)
  - Use regex validation for IP address format
  - Prevent injection attacks

### Security Requirements

- **Environment Variables**: MUST be used for all secrets and API keys
  - Use `NEXT_PUBLIC_` prefix only for truly public values
  - Never commit `.env.local` to version control
- **Content Security Policy**: MUST implement proper CSP headers in `next.config.js`
- **Rate Limiting**: MUST implement for manual IP lookup functionality
  - Use Vercel Edge Config or middleware for rate limiting
  - Return 429 status code with retry-after header
- **HTTPS Enforcement**: MUST enforce HTTPS in production
- **Cookie Security**: Use `secure`, `httpOnly`, `sameSite` flags appropriately

## Testing & Quality Assurance

### Testing Requirements

- **Unit Tests**: MUST be written for utility functions and custom hooks
  - Use Jest and React Testing Library
  - Aim for >80% coverage on utilities and hooks
- **Integration Tests**: MUST be written for API routes and data fetching logic
  - Test API route handlers with mock external APIs
  - Verify caching behavior
- **E2E Tests**: MUST be written for critical user flows
  - IP detection on page load
  - Manual IP lookup
  - Use Playwright or Cypress
- **Accessibility Testing**: MUST use jest-axe or similar in component tests
  - Automated a11y checks in CI/CD pipeline
- **Performance Testing**: MUST use Lighthouse CI in GitHub Actions
  - Block PRs that fail Core Web Vitals thresholds
  - Generate performance reports on every deployment

### Quality Gates

- **Pre-commit Hooks**: Lint, format, and type-check before commit
  - Use Husky and lint-staged
  - Run prettier, eslint, and tsc
- **CI/CD Pipeline**: All tests MUST pass before merge
  - Run unit, integration, and E2E tests
  - Run Lighthouse CI performance checks
  - Run accessibility audits
- **Code Review**: All PRs MUST be reviewed by at least one other developer
  - Verify adherence to constitution principles
  - Check for performance implications
  - Validate accessibility and SEO considerations

## Code Organization & Error Handling

### Directory Structure

```
app/                    # Next.js 15 App Router
├── (routes)/          # Route groups
├── api/               # API route handlers
├── layout.tsx         # Root layout
└── page.tsx           # Home page

components/            # Reusable React components
├── ui/               # shadcn/ui components (customized)
└── features/         # Feature-specific components

lib/                   # Shared utilities
├── api/              # API client functions
├── utils/            # General utilities
└── validations/      # Zod schemas

types/                 # TypeScript type definitions
├── api.ts            # API response types
└── index.ts          # Shared types

config/                # Configuration files
├── site.ts           # Site metadata and constants
└── seo.ts            # SEO configuration

hooks/                 # Custom React hooks
└── use-*.ts          # Hook files (kebab-case)

public/                # Static assets
├── images/
└── fonts/
```

### File Naming Conventions

- **Components**: `kebab-case.tsx` (file) + `PascalCase` (component name)
- **Utilities**: `kebab-case.ts`
- **Types**: `kebab-case.ts`
- **Hooks**: `use-hook-name.ts`
- **Constants**: `SCREAMING_SNAKE_CASE` in `kebab-case.ts` files

### Error Handling Standards

- **Global Error Boundary**: MUST implement `app/error.tsx` and `app/global-error.tsx`
- **Route-Level Error Handling**: Use `error.tsx` files in route segments as needed
- **Graceful Degradation**: All features MUST have fallback states
  - Show cached data if API fails
  - Display user-friendly error messages
  - Provide retry mechanisms
- **Logging**: Implement structured logging without exposing sensitive data
  - Use environment-aware logging (verbose in dev, minimal in prod)
  - Never log API keys, user IPs, or sensitive data
- **Fallback UI**: All dynamic content MUST have skeleton or placeholder states

### Import Organization

- **Import Order**: Group imports logically
  1. React and Next.js imports
  2. Third-party libraries
  3. Internal components
  4. Internal utilities and hooks
  5. Types
  6. Styles
- **Barrel Exports**: Use `index.ts` files for cleaner imports from directories
- **Absolute Imports**: Configure `@/` path alias in `tsconfig.json` for imports

## Governance

### Amendment Process

- **Constitution Changes**: Require documented justification and approval
  - Breaking changes (removing principles, adding restrictions) require team consensus
  - Additions and clarifications can be proposed via PR
  - All amendments MUST update version number and sync dependent templates
- **Version Control**: Follow semantic versioning (MAJOR.MINOR.PATCH)
  - MAJOR: Backward incompatible governance changes
  - MINOR: New principles or significant additions
  - PATCH: Clarifications, typo fixes, non-semantic refinements
- **Migration Plan**: Breaking changes MUST include migration guide and timeline

### Code Review Requirements

- **Constitution Compliance**: All PRs MUST verify adherence to these principles
  - Reviewers MUST check performance implications
  - Reviewers MUST verify accessibility and SEO considerations
  - Reviewers MUST ensure security best practices
- **Complexity Justification**: Any deviation from simplicity principles MUST be documented
  - "Why is this complexity necessary?"
  - "What simpler alternative was considered and rejected?"
- **Performance Budget**: PRs MUST NOT degrade Core Web Vitals metrics
  - Run Lighthouse CI on every PR
  - Block merges that fail performance thresholds

### Dependency Management

- **Dependency Approval**: New dependencies MUST be justified
  - Consider bundle size impact
  - Evaluate maintenance status and security
  - Prefer lighter alternatives when available
- **Security Updates**: MUST be applied within 7 days of disclosure for critical vulnerabilities
  - Use Dependabot or Renovate for automated dependency updates
  - Review and test updates before merging
- **Version Pinning**: Use exact versions in `package.json` for reproducible builds

### Performance Monitoring

- **Continuous Monitoring**: MUST implement Real User Monitoring (RUM)
  - Use Vercel Analytics or similar for Core Web Vitals tracking
  - Set up alerts for performance degradation
- **Regular Audits**: Monthly Lighthouse audits of production site
  - Document trends and address regressions
  - Review and optimize based on real user data

### Development Workflow

- **Branch Strategy**: Feature branches from `main`, squash merge on completion
- **Commit Messages**: Use conventional commits (feat, fix, docs, style, refactor, test, chore)
- **Documentation**: Update relevant docs with code changes
  - Component props documentation
  - API endpoint documentation
  - README updates for new features

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-08
