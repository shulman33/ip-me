'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GeolocationErrorProps {
  /**
   * Error message to display to the user
   */
  message?: string;
  /**
   * Error code for specific error type (e.g., 'INVALID_IP', 'SERVICE_UNAVAILABLE', 'TIMEOUT')
   */
  errorCode?: string;
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
 * User-friendly error messages for different error scenarios
 */
const ERROR_MESSAGES: Record<string, { title: string; message: string; showRetry: boolean }> = {
  INVALID_IP: {
    title: 'Invalid IP Address',
    message: 'The IP address format is invalid. Please check and try again.',
    showRetry: false,
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Temporarily Unavailable',
    message: 'Unable to fetch location data. The service may be temporarily down. Please try again in a moment.',
    showRetry: true,
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please check your connection and try again.',
    showRetry: true,
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect to the location service. Please check your internet connection.',
    showRetry: true,
  },
  RATE_LIMIT_EXCEEDED: {
    title: 'Too Many Requests',
    message: 'Rate limit exceeded. Please wait a moment before trying again.',
    showRetry: true,
  },
  VALIDATION_FAILED: {
    title: 'Data Validation Error',
    message: 'The location data received was invalid. Please try again.',
    showRetry: true,
  },
  NO_IP_PROVIDED: {
    title: 'No IP Address',
    message: 'Unable to detect your IP address. Please try again or provide a specific IP address.',
    showRetry: true,
  },
  DEFAULT: {
    title: 'Location Data Error',
    message: 'Unable to fetch location data. Please try again.',
    showRetry: true,
  },
};

/**
 * GeolocationError Component
 *
 * Client Component that displays user-friendly error messages when geolocation data fails to load.
 * Provides context-specific error messages based on error codes and a retry button for transient errors.
 *
 * @param props - Component properties
 * @returns Client Component with error state and retry functionality
 */
export function GeolocationError({
  message,
  errorCode,
  onRetry,
  className = '',
}: GeolocationErrorProps) {
  // Get error details based on error code, or use default
  const errorDetails = errorCode && ERROR_MESSAGES[errorCode]
    ? ERROR_MESSAGES[errorCode]
    : ERROR_MESSAGES.DEFAULT;

  // Use custom message if provided, otherwise use mapped message
  const displayMessage = message || errorDetails.message;
  const showRetryButton = errorDetails.showRetry && onRetry !== undefined;

  return (
    <Card className={`w-full border-destructive ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{errorDetails.title}</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{displayMessage}</p>

        {showRetryButton && (
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
