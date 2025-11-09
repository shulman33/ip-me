/**
 * MapSkeleton Component
 * Feature: 003-interactive-location-map
 *
 * Loading skeleton shown while map is being loaded
 * Prevents layout shift by reserving exact space
 */

import type { MapSkeletonProps } from '@/types/map';

export function MapSkeleton({ className, height }: MapSkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/20 ${className || ''}`}
      style={{
        height: height || '300px',
        width: '100%'
      }}
      aria-label="Loading map"
      role="status"
    >
      <span className="sr-only">Loading interactive map...</span>
    </div>
  );
}
