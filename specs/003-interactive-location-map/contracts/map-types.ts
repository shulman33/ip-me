/**
 * Type Contracts: Interactive Location Map
 *
 * This file defines the TypeScript interfaces and types for the map feature.
 * These contracts will be implemented in src/types/map.ts
 *
 * Feature: 003-interactive-location-map
 * Generated: 2025-11-09
 */

// ============================================================================
// Core Map Types
// ============================================================================

/**
 * Geographic coordinates for map positioning
 *
 * @example
 * const coords: MapCoordinates = { latitude: 40.7128, longitude: -74.0060 };
 */
export interface MapCoordinates {
  /** Latitude coordinate (-90 to 90) */
  latitude: number;

  /** Longitude coordinate (-180 to 180) */
  longitude: number;
}

/**
 * Map initialization configuration
 * Passed to mapboxgl.Map constructor
 *
 * @example
 * const config: MapConfig = {
 *   center: [-74.0060, 40.7128],
 *   zoom: 12,
 *   style: 'mapbox://styles/mapbox/dark-v11',
 *   accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!
 * };
 */
export interface MapConfig {
  /** Map center [longitude, latitude] - Mapbox convention */
  center: [number, number];

  /** Initial zoom level (0-22) */
  zoom: number;

  /** Mapbox style URL */
  style: string;

  /** Mapbox public access token */
  accessToken: string;
}

/**
 * Map instance lifecycle state
 * Used for loading indicators and error handling
 */
export type MapLoadState =
  | 'initializing'  // Component mounted, checking WebGL support
  | 'loading'       // Map instance created, loading tiles
  | 'loaded'        // Map fully rendered, interactive
  | 'error';        // Error occurred during any phase

/**
 * Map error classification
 * Determines error message and icon displayed to user
 */
export type MapErrorType =
  | 'coordinates'  // Missing or invalid lat/lng
  | 'webgl'        // Browser doesn't support WebGL
  | 'load'         // Map tiles failed to load
  | 'token';       // Invalid Mapbox access token

/**
 * Structured error information
 *
 * @example
 * const error: MapError = {
 *   type: 'coordinates',
 *   message: 'Location coordinates unavailable'
 * };
 */
export interface MapError {
  /** Error classification */
  type: MapErrorType;

  /** User-friendly error message */
  message: string;

  /** Technical details for logging (not shown to user) */
  details?: unknown;
}

// ============================================================================
// Marker Types
// ============================================================================

/**
 * Custom marker configuration
 * Used to create styled markers on the map
 *
 * @example
 * const markerConfig: MarkerConfig = {
 *   coordinates: { latitude: 40.7128, longitude: -74.0060 },
 *   color: '#00ff88',
 *   scale: 1.2,
 *   animated: true,
 *   draggable: false
 * };
 */
export interface MarkerConfig {
  /** Marker position */
  coordinates: MapCoordinates;

  /** Marker color (hex value) */
  color: string;

  /** Marker size multiplier (0.5-2.0), default 1.2 */
  scale?: number;

  /** Whether to apply pulse animation, default true */
  animated?: boolean;

  /** Whether marker can be dragged, default false */
  draggable?: boolean;
}

/**
 * Marker HTML element styling
 * Applied when creating custom marker elements
 */
export interface MarkerStyle {
  /** CSS width (e.g., '32px') */
  width: string;

  /** CSS height (e.g., '32px') */
  height: string;

  /** Marker background color (hex) */
  backgroundColor: string;

  /** CSS border-radius (e.g., '50%' for circle) */
  borderRadius: string;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of coordinate validation
 *
 * @example
 * const result = validateCoordinates(40.7128, -74.0060);
 * if (!result.valid) {
 *   console.error(result.error.message);
 * }
 */
export interface CoordinateValidationResult {
  /** Whether coordinates are valid */
  valid: boolean;

  /** Error details if invalid */
  error?: MapError;
}

/**
 * Result of WebGL support detection
 *
 * @example
 * const result = checkWebGLSupport();
 * if (!result.supported) {
 *   return <MapError message={result.error.message} />;
 * }
 */
export interface WebGLSupportResult {
  /** Whether browser supports WebGL */
  supported: boolean;

  /** Error details if unsupported */
  error?: MapError;
}
