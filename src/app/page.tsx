import { Suspense } from 'react';
import { IPDisplay } from '@/components/features/ip-detection/ip-display';
import { siteConfig } from '@/config/site';

/**
 * JSON-LD structured data for WebSite schema
 * Improves SEO and enables rich search results
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: siteConfig.creator.name,
    url: siteConfig.creator.url,
  },
};

/**
 * Loading skeleton component for IP detection
 * Displayed while IPDisplay Server Component is rendering
 */
function IPLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Skeleton heading */}
      <div className="h-12 w-64 bg-muted/20 rounded-lg animate-pulse" />

      {/* Skeleton IP display card */}
      <div className="rounded-lg bg-background border border-border px-8 py-6 shadow-lg min-w-[300px]">
        <div className="flex flex-col items-center gap-3">
          {/* Skeleton IP address */}
          <div className="h-10 w-48 bg-muted/20 rounded-md animate-pulse" />

          {/* Skeleton version badge */}
          <div className="h-6 w-16 bg-muted/20 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Skeleton privacy notice */}
      <div className="space-y-2">
        <div className="h-4 w-80 bg-muted/20 rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted/20 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}

/**
 * Homepage - Automatic IP Detection
 * Server Component that displays visitor's IP address instantly on load
 */
export default function Home() {
  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <main className="flex w-full max-w-4xl flex-col items-center justify-center py-16">
          {/* IP Display with Suspense loading state */}
          <Suspense fallback={<IPLoadingSkeleton />}>
            <IPDisplay />
          </Suspense>

          {/* Footer attribution */}
          <footer className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Built with{' '}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-green transition-colors"
              >
                Next.js 15
              </a>
              {' '}and{' '}
              <a
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-green transition-colors"
              >
                shadcn/ui
              </a>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
