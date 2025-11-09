/**
 * IP Detection Client Component
 *
 * Client-side wrapper for IP detection with retry logic and error handling
 * Used as fallback when server-side detection fails
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Timeout handling with user feedback
 * - Manual retry button after max failures
 * - Loading states and error messages
 *
 * Based on: specs/001-auto-ip-detection/tasks.md (T035, T036, T037, T038)
 */

'use client';

import { useEffect } from 'react';
import { useIPDetection } from '@/hooks/use-ip-detection';
import { formatIP } from '@/lib/utils/format-ip';
import { CopyButton } from './copy-button';
import { Button } from '@/components/ui/button';

/**
 * Props for IPDetectionClient component
 */
export interface IPDetectionClientProps {
  /**
   * Whether to automatically trigger detection on mount
   * @default true
   */
  autoDetect?: boolean;
}

/**
 * Client Component for IP detection with retry logic
 *
 * Automatically attempts to detect IP on mount and retries on failure
 * Shows appropriate UI for loading, success, and error states
 */
export function IPDetectionClient({
  autoDetect = true,
}: IPDetectionClientProps) {
  const {
    status,
    data,
    error,
    retryCount,
    isTimedOut,
    detect,
    retry,
    canRetry,
  } = useIPDetection();

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      detect();
    }
  }, [autoDetect, detect]);

  /**
   * Loading State
   */
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your IP Address
        </h1>

        <div className="rounded-lg bg-background border border-border px-8 py-6 shadow-lg min-w-[300px]">
          <div className="flex flex-col items-center gap-4">
            {/* Loading skeleton */}
            <div className="h-12 w-48 bg-muted animate-pulse rounded" />

            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            </div>

            <p className="text-sm text-muted-foreground">
              Detecting your IP address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Retrying State
   */
  if (status === 'retrying') {
    const retryDelay = retryCount > 0 ? Math.pow(2, retryCount - 1) : 1;

    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your IP Address
        </h1>

        <div className="rounded-lg bg-background border border-yellow-500/20 px-8 py-6 shadow-lg min-w-[300px]">
          <div className="flex flex-col items-center gap-4">
            {/* Retrying indicator */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />
              <p className="text-lg text-yellow-500 font-medium">
                Retrying...
              </p>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {isTimedOut
                ? 'Detection in progress... (Previous attempt timed out)'
                : `Attempt ${retryCount} of 3`}
            </p>

            {retryCount > 1 && (
              <p className="text-xs text-muted-foreground">
                Waiting {retryDelay}s before next attempt
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your IP Address
        </h1>

        <div className="rounded-lg bg-background border border-red-500/20 px-8 py-6 shadow-lg min-w-[300px]">
          <div className="flex flex-col items-center gap-4">
            {/* Error icon */}
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg text-red-500 font-medium">
                Detection Failed
              </p>
            </div>

            {/* Error message */}
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {isTimedOut
                ? 'Detection timed out after 5 seconds. Please check your network connection.'
                : error || 'Unable to detect IP address'}
            </p>

            {/* Retry count indicator */}
            {retryCount >= 3 && (
              <p className="text-xs text-red-500/70">
                Maximum retry attempts ({retryCount}) exceeded
              </p>
            )}

            {/* Manual retry button */}
            {canRetry && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <Button
                  onClick={() => retry()}
                  variant="outline"
                  className="border-green/50 text-green hover:bg-green/10"
                >
                  Try Again
                </Button>

                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  If the problem persists, try refreshing the page or checking your network settings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Success State
   */
  if (status === 'success' && data) {
    const formattedIP = formatIP(data.ip, data.version);

    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your IP Address
        </h1>

        {/* IP Display Card */}
        <div className="rounded-lg bg-background border border-border px-8 py-6 shadow-lg min-w-[300px]">
          <div className="flex flex-col items-center gap-4">
            {/* IP Address in monospace font */}
            <code className="text-3xl font-mono font-semibold text-foreground tracking-wide">
              {formattedIP}
            </code>

            {/* IP Version Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green/10 px-3 py-1 text-sm font-medium text-green">
                {data.version}
              </span>

              {/* Cached indicator */}
              {data.cached && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  Cached
                </span>
              )}
            </div>

            {/* Copy Button - Client Component for interactivity */}
            <CopyButton text={data.ip} />

            {/* Additional geolocation info (if available) */}
            {(data.city || data.country_name) && (
              <div className="text-sm text-muted-foreground text-center mt-2">
                {data.city && data.country_name && (
                  <p>
                    {data.city}, {data.country_name}
                  </p>
                )}
                {data.isp && (
                  <p className="text-xs mt-1">
                    {data.isp}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Your IP address is detected automatically for display purposes only.
          <br />
          We cache this information for 5 minutes to improve performance.
        </p>
      </div>
    );
  }

  // Fallback (should never reach here)
  return null;
}
