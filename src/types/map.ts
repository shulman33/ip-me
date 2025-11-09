/**
 * Map Type Definitions
 * Feature: 003-interactive-location-map
 */

/**
 * Geographic coordinates for map positioning
 */
export interface MapCoordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/**
 * Map initialization configuration
 */
export interface MapConfig {
  center: [number, number];  // [longitude, latitude] - Mapbox convention
  zoom: number;              // 0-22, default 12 for city-level view
  style: string;             // Mapbox style URL
  accessToken: string;       // Mapbox public access token
}

/**
 * Map instance state
 */
export type MapLoadState = 'initializing' | 'loading' | 'loaded' | 'error';

/**
 * Map error types
 */
export interface MapError {
  type: 'coordinates' | 'webgl' | 'load' | 'token';
  message: string;           // User-friendly error message
  details?: unknown;         // Technical details for logging
}

/**
 * Custom marker configuration
 */
export interface MarkerConfig {
  coordinates: MapCoordinates;
  color: string;             // Hex color (e.g., '#00ff88')
  scale?: number;            // 0.5-2.0, default 1.2
  animated?: boolean;        // Whether to apply pulse animation
  draggable?: boolean;       // Whether marker can be dragged
}

/**
 * Marker element styling
 */
export interface MarkerStyle {
  width: string;             // CSS width (e.g., '32px')
  height: string;            // CSS height (e.g., '32px')
  backgroundColor: string;   // Hex color
  borderRadius: string;      // CSS border-radius (e.g., '50%')
  className?: string;        // Additional CSS classes
}

/**
 * Props for the main LocationMap component
 */
export interface LocationMapProps {
  /** Latitude coordinate (-90 to 90) */
  latitude: number;

  /** Longitude coordinate (-180 to 180) */
  longitude: number;

  /** Optional initial zoom level (0-22), defaults to 12 */
  zoom?: number;

  /** Optional custom marker color, defaults to --color-green (#00ff88) */
  markerColor?: string;

  /** Whether to animate the marker, defaults to true (respects prefers-reduced-motion) */
  animated?: boolean;

  /** Optional className for container styling */
  className?: string;

  /** Optional callback for map load success */
  onMapLoad?: () => void;

  /** Optional callback for map errors */
  onMapError?: (error: MapError) => void;
}

/**
 * Props for the MapError component
 */
export interface MapErrorProps {
  /** Error message to display */
  message: string;

  /** Optional error type for icon selection */
  type?: 'coordinates' | 'webgl' | 'load' | 'token';

  /** Optional className for styling */
  className?: string;
}

/**
 * Props for the MapSkeleton loading component
 */
export interface MapSkeletonProps {
  /** Optional className for styling */
  className?: string;

  /** Optional height override, defaults to responsive height */
  height?: string;
}
