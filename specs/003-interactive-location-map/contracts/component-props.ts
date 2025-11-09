/**
 * Component Props Contracts: Interactive Location Map
 *
 * This file defines the React component props interfaces for the map feature.
 * These contracts will be implemented in respective component files.
 *
 * Feature: 003-interactive-location-map
 * Generated: 2025-11-09
 */

import type { MapError } from './map-types';

// ============================================================================
// LocationMap Component
// ============================================================================

/**
 * Props for the main LocationMap component
 *
 * This is a Client Component ('use client') that renders an interactive
 * Mapbox GL JS map with a custom marker at the specified coordinates.
 *
 * @component LocationMap
 * @file src/components/features/map/location-map.tsx
 *
 * @example
 * // Basic usage
 * <LocationMap latitude={40.7128} longitude={-74.0060} />
 *
 * @example
 * // With custom options
 * <LocationMap
 *   latitude={40.7128}
 *   longitude={-74.0060}
 *   zoom={14}
 *   markerColor="#ff0088"
 *   animated={false}
 *   onMapLoad={() => console.log('Map loaded')}
 *   onMapError={(error) => console.error(error)}
 * />
 */
export interface LocationMapProps {
  /**
   * Latitude coordinate (-90 to 90)
   * @required
   */
  latitude: number;

  /**
   * Longitude coordinate (-180 to 180)
   * @required
   */
  longitude: number;

  /**
   * Initial map zoom level (0-22)
   * @default 12
   * @optional
   *
   * Zoom levels:
   * - 0-2: World view
   * - 3-5: Continent view
   * - 6-10: Country/state view
   * - 11-14: City view (default)
   * - 15-18: Streets view
   * - 19-22: Building view
   */
  zoom?: number;

  /**
   * Custom marker color (hex value)
   * @default '#00ff88' (--color-green)
   * @optional
   */
  markerColor?: string;

  /**
   * Whether to animate the marker with pulse effect
   * @default true (respects prefers-reduced-motion)
   * @optional
   */
  animated?: boolean;

  /**
   * Additional CSS classes for the map container
   * @optional
   */
  className?: string;

  /**
   * Callback fired when map successfully loads
   * @optional
   */
  onMapLoad?: () => void;

  /**
   * Callback fired when map encounters an error
   * @optional
   */
  onMapError?: (error: MapError) => void;
}

// ============================================================================
// MapError Component
// ============================================================================

/**
 * Props for the MapError component
 *
 * Displays user-friendly error messages when the map cannot be shown.
 *
 * @component MapError
 * @file src/components/features/map/map-error.tsx
 *
 * @example
 * // Coordinates missing
 * <MapError
 *   message="Location coordinates unavailable"
 *   type="coordinates"
 * />
 *
 * @example
 * // WebGL unsupported
 * <MapError
 *   message="Your browser does not support interactive maps"
 *   type="webgl"
 * />
 */
export interface MapErrorProps {
  /**
   * User-friendly error message to display
   * @required
   */
  message: string;

  /**
   * Error type for icon selection
   * @optional
   *
   * Icon mapping:
   * - 'coordinates': Location pin with slash
   * - 'webgl': Browser compatibility icon
   * - 'load': Cloud with slash
   * - 'token': Key icon
   */
  type?: 'coordinates' | 'webgl' | 'load' | 'token';

  /**
   * Additional CSS classes for the error container
   * @optional
   */
  className?: string;
}

// ============================================================================
// MapSkeleton Component
// ============================================================================

/**
 * Props for the MapSkeleton loading component
 *
 * Displays a skeleton loader while the map is loading (lazy-loaded).
 *
 * @component MapSkeleton
 * @file src/components/features/map/map-skeleton.tsx
 *
 * @example
 * // Basic usage (default responsive height)
 * <MapSkeleton />
 *
 * @example
 * // Custom height
 * <MapSkeleton height="500px" />
 */
export interface MapSkeletonProps {
  /**
   * Additional CSS classes for the skeleton container
   * @optional
   */
  className?: string;

  /**
   * Optional height override
   * @default Responsive (300px mobile, 400px desktop)
   * @optional
   */
  height?: string;
}

// ============================================================================
// Component Barrel Export
// ============================================================================

/**
 * Re-export all component props for convenience
 * Allows: import { LocationMapProps, MapErrorProps } from './contracts/component-props'
 */
export type {
  LocationMapProps as LocationMap,
  MapErrorProps as MapError,
  MapSkeletonProps as MapSkeleton,
};
