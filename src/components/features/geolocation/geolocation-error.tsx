'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GeolocationErrorProps {
  /**
   * Error message to display to the user
   */
  message?: string;
  /**
   * Callback function for retry button click
   */
  onRetry?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * GeolocationError Component
 *
 * Client Component that displays user-friendly error messages when geolocation data fails to load.
 * Provides a retry button for transient errors.
 *
 * @param props - Component properties
 * @returns Client Component with error state and retry functionality
 */
export function GeolocationError({
  message = 'Unable to fetch location data. Please try again.',
  onRetry,
  className = '',
}: GeolocationErrorProps) {
  return (
    <Card className={`w-full border-destructive ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">Location Data Error</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Retry loading geolocation data"
          >
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  );
}
