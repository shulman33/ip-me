'use client';

/**
 * Error Boundary for IP Detection Feature
 * Catches and displays errors during IP detection with retry functionality
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error component that displays when IP detection fails
 * Provides user-friendly error message and retry button
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('IP detection error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        {/* Error Icon */}
        <div className="rounded-full bg-red-500/10 p-4">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Something went wrong
        </h1>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">
            We encountered an error while detecting your IP address.
          </p>
          <p className="text-sm text-muted-foreground">
            This might be due to a network issue or an unexpected error.
          </p>
        </div>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-muted/20 border border-border px-4 py-3 text-left w-full">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Retry Button */}
        <Button
          variant="green"
          size="lg"
          onClick={reset}
          className="mt-4"
        >
          Try Again
        </Button>

        {/* Additional Help */}
        <p className="text-sm text-muted-foreground">
          If the problem persists, please{' '}
          <a
            href="https://github.com/your-repo/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-green transition-colors underline"
          >
            report this issue
          </a>
        </p>
      </div>
    </div>
  );
}
