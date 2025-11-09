/**
 * Constants Contract: Interactive Location Map
 *
 * This file defines constant values used throughout the map feature.
 * These constants will be implemented in src/lib/utils/map-helpers.ts
 *
 * Feature: 003-interactive-location-map
 * Generated: 2025-11-09
 */

// ============================================================================
// Map Configuration Defaults
// ============================================================================

/**
 * Default map configuration values
 * Used when props are not provided
 *
 * @example
 * const zoom = props.zoom ?? MAP_DEFAULTS.ZOOM_LEVEL;
 */
export const MAP_DEFAULTS = {
  /** Default zoom level (city view) */
  ZOOM_LEVEL: 12,

  /** Mapbox dark style URL */
  STYLE: 'mapbox://styles/mapbox/dark-v11',

  /** Default marker color (--color-green) */
  MARKER_COLOR: '#00ff88',

  /** Default marker scale (slightly larger for visibility) */
  MARKER_SCALE: 1.2,

  /** Default marker size in pixels */
  MARKER_SIZE: '32px',

  /** Minimum allowed zoom level (prevent too far out) */
  MIN_ZOOM: 3,

  /** Maximum allowed zoom level (prevent too far in) */
  MAX_ZOOM: 18,
} as const;

// ============================================================================
// Error Messages (User-Facing)
// ============================================================================

/**
 * User-friendly error messages
 * Generic messages for security (don't expose technical details)
 *
 * @example
 * setError({ type: 'coordinates', message: MAP_ERROR_MESSAGES.COORDINATES_MISSING });
 */
export const MAP_ERROR_MESSAGES = {
  /** Displayed when latitude or longitude is null/undefined */
  COORDINATES_MISSING: 'Location coordinates unavailable',

  /** Displayed when browser doesn't support WebGL */
  WEBGL_UNSUPPORTED: 'Your browser does not support interactive maps',

  /** Displayed when map tiles fail to load */
  LOAD_FAILED: 'Map temporarily unavailable',

  /** Displayed when Mapbox access token is invalid (generic for security) */
  TOKEN_INVALID: 'Map temporarily unavailable',
} as const;

// ============================================================================
// Responsive Breakpoints
// ============================================================================

/**
 * Breakpoints for responsive map sizing
 * Matches Tailwind CSS default breakpoints
 *
 * @example
 * if (window.innerWidth < MAP_BREAKPOINTS.DESKTOP_MIN) {
 *   // Mobile layout
 * }
 */
export const MAP_BREAKPOINTS = {
  /** Maximum width for mobile layout (< 640px) */
  MOBILE_MAX: 639,

  /** Minimum width for desktop layout (>= 640px) */
  DESKTOP_MIN: 640,
} as const;

// ============================================================================
// Dimension Constants
// ============================================================================

/**
 * Map container dimensions
 * Used for responsive height calculation and CLS prevention
 */
export const MAP_DIMENSIONS = {
  /** Height on mobile viewports */
  HEIGHT_MOBILE: '300px',

  /** Height on desktop viewports */
  HEIGHT_DESKTOP: '400px',

  /** Width on mobile (full width) */
  WIDTH_MOBILE: '100%',

  /** Width on desktop (centered, 60% of container) */
  WIDTH_DESKTOP: '60%',

  /** Border radius (matches existing card style) */
  BORDER_RADIUS: '0.5rem', // 8px
} as const;

// ============================================================================
// Animation Constants
// ============================================================================

/**
 * Animation timing and behavior
 */
export const MAP_ANIMATIONS = {
  /** Duration of glow pulse animation (matches globals.css) */
  PULSE_DURATION: '2s',

  /** Easing function for pulse animation */
  PULSE_EASING: 'ease-in-out',

  /** Map resize debounce delay (ms) */
  RESIZE_DEBOUNCE: 150,

  /** Map load timeout (ms) */
  LOAD_TIMEOUT: 5000,
} as const;

// ============================================================================
// CSS Class Names
// ============================================================================

/**
 * CSS class names for styling
 * Ensures consistency across components
 */
export const MAP_CSS_CLASSES = {
  /** Main map container class */
  CONTAINER: 'map-container',

  /** Map div class */
  MAP: 'map',

  /** Custom marker class */
  MARKER: 'custom-marker',

  /** Pulse animation class (from globals.css) */
  PULSE_ANIMATION: 'animate-glow-pulse',

  /** Error container class */
  ERROR: 'map-error',

  /** Skeleton loader class */
  SKELETON: 'map-skeleton',
} as const;

// ============================================================================
// Environment Variables
// ============================================================================

/**
 * Environment variable keys
 * Used for accessing Mapbox configuration
 */
export const MAP_ENV_KEYS = {
  /** Mapbox public access token */
  ACCESS_TOKEN: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
} as const;

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Derive readonly types from constants
 * Allows type-safe usage in component code
 */
export type MapDefaultKey = keyof typeof MAP_DEFAULTS;
export type MapErrorMessageKey = keyof typeof MAP_ERROR_MESSAGES;
export type MapBreakpointKey = keyof typeof MAP_BREAKPOINTS;
export type MapDimensionKey = keyof typeof MAP_DIMENSIONS;
export type MapAnimationKey = keyof typeof MAP_ANIMATIONS;
export type MapCSSClassKey = keyof typeof MAP_CSS_CLASSES;
export type MapEnvKey = keyof typeof MAP_ENV_KEYS;
