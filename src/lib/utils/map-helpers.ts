/**
 * Map Helper Functions and Constants
 * Feature: 003-interactive-location-map
 */

import mapboxgl from 'mapbox-gl';
import type { MapError, MapCoordinates } from '@/types/map';

/**
 * Default map configuration values
 */
export const MAP_DEFAULTS = {
  ZOOM_LEVEL: 12,                                    // City-level view
  STYLE: 'mapbox://styles/mapbox/dark-v11',         // Dark theme
  MARKER_COLOR: '#00ff88',                          // --color-green
  MARKER_SCALE: 1.2,                                // Slightly larger for visibility
  MARKER_SIZE: '32px',                              // CSS size
  MIN_ZOOM: 3,                                      // Prevent zooming out too far
  MAX_ZOOM: 18,                                     // Prevent zooming in too far
} as const;

/**
 * Error messages (user-facing)
 */
export const MAP_ERROR_MESSAGES = {
  COORDINATES_MISSING: 'Location coordinates unavailable',
  WEBGL_UNSUPPORTED: 'Your browser does not support interactive maps',
  LOAD_FAILED: 'Map temporarily unavailable',
  TOKEN_INVALID: 'Map temporarily unavailable',      // Don't expose security details
} as const;

/**
 * Responsive breakpoints (matches Tailwind)
 */
export const MAP_BREAKPOINTS = {
  MOBILE_MAX: 639,      // < 640px
  DESKTOP_MIN: 640,     // >= 640px
} as const;

/**
 * Map dimension constants
 */
export const MAP_DIMENSIONS = {
  HEIGHT_MOBILE: '300px',
  HEIGHT_DESKTOP: '400px',
  WIDTH_MOBILE: '100%',
  WIDTH_DESKTOP: '60%',
  BORDER_RADIUS: '0.5rem',  // 8px, matches card
} as const;

/**
 * Validates geographic coordinates
 */
export function validateCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): { valid: boolean; error?: MapError } {
  if (latitude === null || latitude === undefined ||
      longitude === null || longitude === undefined) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: MAP_ERROR_MESSAGES.COORDINATES_MISSING
      }
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Invalid latitude value',
        details: { latitude }
      }
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: {
        type: 'coordinates',
        message: 'Invalid longitude value',
        details: { longitude }
      }
    };
  }

  return { valid: true };
}

/**
 * Checks if browser supports WebGL (required for Mapbox GL JS)
 */
export function checkWebGLSupport(): { supported: boolean; error?: MapError } {
  if (!mapboxgl.supported()) {
    return {
      supported: false,
      error: {
        type: 'webgl',
        message: MAP_ERROR_MESSAGES.WEBGL_UNSUPPORTED
      }
    };
  }

  return { supported: true };
}

/**
 * Converts MapCoordinates to Mapbox [lng, lat] format
 */
export function toMapboxCoordinates(coords: MapCoordinates): [number, number] {
  return [coords.longitude, coords.latitude];
}

/**
 * Gets Mapbox access token from environment variables
 */
export function getMapboxAccessToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured');
  }
  return token;
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a custom marker HTML element
 */
export function createMarkerElement(
  color: string = MAP_DEFAULTS.MARKER_COLOR,
  size: string = MAP_DEFAULTS.MARKER_SIZE,
  animated: boolean = true
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.width = size;
  el.style.height = size;
  el.style.backgroundColor = color;
  el.style.borderRadius = '50%';

  // Add pulse animation if enabled and user allows
  if (animated && !prefersReducedMotion()) {
    el.classList.add('animate-glow-pulse');
  }

  return el;
}
