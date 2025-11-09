/**
 * Type definitions for geolocation display feature
 * Based on data-model.md specification
 */

import type { GeolocationData, APIError } from './ip';

/**
 * UI state machine for geolocation data fetching and display
 */
export type DisplayStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error';

/**
 * Display state for geolocation components
 */
export interface DisplayState {
  status: DisplayStatus;
  data: GeolocationData | null;
  error: APIError | null;
}

/**
 * Props interface for GeolocationCard component
 */
export interface GeolocationCardProps {
  data: GeolocationData;
  showSkeleton?: boolean;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Props interface for GeolocationPrimaryInfo component
 */
export interface GeolocationPrimaryInfoProps {
  data: GeolocationData;
  className?: string;
}

/**
 * Props interface for GeolocationSecondaryInfo component
 */
export interface GeolocationSecondaryInfoProps {
  data: GeolocationData;
  className?: string;
}

/**
 * Props interface for GeolocationDataGrid component
 */
export interface GeolocationDataGridProps {
  data: GeolocationData;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Props interface for GeolocationSkeleton component
 */
export interface GeolocationSkeletonProps {
  className?: string;
}

/**
 * Props interface for GeolocationError component
 */
export interface GeolocationErrorProps {
  error: APIError;
  onRetry: () => void;
  className?: string;
}
