# ip-me Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-09

## Active Technologies
- TypeScript 5.x with Next.js 16.0.1 (App Router), React 19.2.0 (002-geolocation-display)
- shadcn/ui components (Card, Badge, Skeleton) with Tailwind CSS 4 for UI (002-geolocation-display)
- Upstash Redis (@upstash/redis 1.35.6) - serverless KV store with 5-minute TTL for response caching only, no persistent data (002-geolocation-display)
- IPstack API for geolocation data, Zod 3.25.76 for validation (002-geolocation-display)

- TypeScript 5.x with Next.js 15 (App Router) + Next.js 15, React 19, Zod 3.x, Tailwind CSS 4, shadcn/ui, IPstack API (001-auto-ip-detection)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with Next.js 15 (App Router): Follow standard conventions

## Recent Changes
- 002-geolocation-display: Added TypeScript 5.x with Next.js 16.0.1 (App Router), React 19.2.0, shadcn/ui components (Card, Badge, Skeleton), Upstash Redis caching (5-minute TTL), IPstack API integration, Zod 3.25.76 validation

- 001-auto-ip-detection: Added TypeScript 5.x with Next.js 15 (App Router) + Next.js 15, React 19, Zod 3.x, Tailwind CSS 4, shadcn/ui, IPstack API

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
