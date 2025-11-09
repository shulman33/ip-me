/**
 * MapError Component
 * Feature: 003-interactive-location-map
 *
 * Displays user-friendly error messages when map cannot be loaded
 */

import type { MapErrorProps } from '@/types/map';

export function MapError({ message, type, className }: MapErrorProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-border bg-card p-8 ${className || ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
