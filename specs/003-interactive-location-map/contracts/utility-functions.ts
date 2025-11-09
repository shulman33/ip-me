/**
 * Utility Functions Contract: Interactive Location Map
 *
 * This file defines the function signatures for map utility functions.
 * These functions will be implemented in src/lib/utils/map-helpers.ts
 *
 * Feature: 003-interactive-location-map
 * Generated: 2025-11-09
 */

import type {
  MapCoordinates,
  MapError,
  CoordinateValidationResult,
  WebGLSupportResult,
  MarkerConfig,
  MarkerStyle,
} from './map-types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates geographic coordinates for map positioning
 *
 * Checks:
 * - Coordinates are not null/undefined
 * - Latitude is between -90 and 90
 * - Longitude is between -180 and 180
 *
 * @param latitude - Latitude value to validate
 * @param longitude - Longitude value to validate
 * @returns Validation result with error details if invalid
 *
 * @example
 * const result = validateCoordinates(40.7128, -74.0060);
 * if (!result.valid) {
 *   console.error(result.error.message);
 *   return <MapError message={result.error.message} type={result.error.type} />;
 * }
 *
 * @example
 * // Invalid coordinates
 * const result = validateCoordinates(null, undefined);
 * // Returns: { valid: false, error: { type: 'coordinates', message: '...' } }
 */
export function validateCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): CoordinateValidationResult;

/**
 * Checks if the current browser supports WebGL (required for Mapbox GL JS)
 *
 * Uses mapboxgl.supported() internally to check for:
 * - WebGL context availability
 * - Required browser APIs
 * - Hardware acceleration
 *
 * @returns Support result with error details if unsupported
 *
 * @example
 * const result = checkWebGLSupport();
 * if (!result.supported) {
 *   return <MapError message={result.error.message} type="webgl" />;
 * }
 *
 * @example
 * // On older browsers
 * const result = checkWebGLSupport();
 * // Returns: { supported: false, error: { type: 'webgl', message: '...' } }
 */
export function checkWebGLSupport(): WebGLSupportResult;

/**
 * Validates a single coordinate value (latitude or longitude)
 *
 * Used internally by validateCoordinates
 *
 * @param value - Coordinate value to validate
 * @param type - 'latitude' or 'longitude' (for range checking)
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidCoordinate(40.7128, 'latitude')  // true
 * isValidCoordinate(200, 'latitude')      // false (out of range)
 * isValidCoordinate(-74.0060, 'longitude') // true
 */
export function isValidCoordinate(
  value: number | null | undefined,
  type: 'latitude' | 'longitude'
): boolean;

// ============================================================================
// Coordinate Transformation Functions
// ============================================================================

/**
 * Converts MapCoordinates to Mapbox [lng, lat] format
 *
 * Mapbox uses [longitude, latitude] order (opposite of standard [lat, lng])
 * This helper prevents confusion and bugs
 *
 * @param coords - Coordinates in {latitude, longitude} format
 * @returns Tuple in [longitude, latitude] format for Mapbox
 *
 * @example
 * const coords = { latitude: 40.7128, longitude: -74.0060 };
 * const mapboxCoords = toMapboxCoordinates(coords);
 * // Returns: [-74.0060, 40.7128]
 */
export function toMapboxCoordinates(
  coords: MapCoordinates
): [number, number];

/**
 * Converts Mapbox [lng, lat] format to MapCoordinates
 *
 * Inverse of toMapboxCoordinates, used when reading from map instance
 *
 * @param coords - Tuple in [longitude, latitude] format
 * @returns Coordinates in {latitude, longitude} format
 *
 * @example
 * const mapboxCoords: [number, number] = [-74.0060, 40.7128];
 * const coords = fromMapboxCoordinates(mapboxCoords);
 * // Returns: { latitude: 40.7128, longitude: -74.0060 }
 */
export function fromMapboxCoordinates(
  coords: [number, number]
): MapCoordinates;

// ============================================================================
// Marker Creation Functions
// ============================================================================

/**
 * Creates a custom HTML marker element with styling
 *
 * Generates a DOM element for use with new mapboxgl.Marker({ element })
 * Applies custom colors, size, and optional animation
 *
 * @param config - Marker configuration
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns HTML div element ready for Mapbox Marker
 *
 * @example
 * const markerElement = createMarkerElement(
 *   {
 *     coordinates: { latitude: 40.7128, longitude: -74.0060 },
 *     color: '#00ff88',
 *     scale: 1.2,
 *     animated: true
 *   },
 *   false // animation enabled
 * );
 * const marker = new mapboxgl.Marker({ element: markerElement })
 *   .setLngLat([-74.0060, 40.7128])
 *   .addTo(map);
 */
export function createMarkerElement(
  config: MarkerConfig,
  prefersReducedMotion: boolean
): HTMLDivElement;

/**
 * Generates inline styles for marker element
 *
 * Converts MarkerStyle config to CSS style object
 * Used internally by createMarkerElement
 *
 * @param style - Marker style configuration
 * @returns CSS properties object
 *
 * @example
 * const styles = getMarkerStyles({
 *   width: '32px',
 *   height: '32px',
 *   backgroundColor: '#00ff88',
 *   borderRadius: '50%'
 * });
 * Object.assign(element.style, styles);
 */
export function getMarkerStyles(
  style: MarkerStyle
): Partial<CSSStyleDeclaration>;

// ============================================================================
// Environment Functions
// ============================================================================

/**
 * Retrieves Mapbox access token from environment variables
 *
 * Validates token exists and is non-empty
 * Throws error in development if missing, returns empty string in production
 *
 * @returns Mapbox public access token
 * @throws Error if token is missing (development only)
 *
 * @example
 * const accessToken = getMapboxAccessToken();
 * const map = new mapboxgl.Map({
 *   container: mapContainer.current,
 *   accessToken,
 *   // ...other config
 * });
 */
export function getMapboxAccessToken(): string;

/**
 * Checks if Mapbox access token is configured
 *
 * Non-throwing version of getMapboxAccessToken
 * Useful for conditional rendering
 *
 * @returns True if token exists and is non-empty
 *
 * @example
 * if (!hasMapboxAccessToken()) {
 *   return <MapError
 *     message="Map configuration missing"
 *     type="token"
 *   />;
 * }
 */
export function hasMapboxAccessToken(): boolean;

// ============================================================================
// Responsive Utility Functions
// ============================================================================

/**
 * Determines if current viewport is mobile size
 *
 * Uses MAP_BREAKPOINTS.DESKTOP_MIN (640px) as threshold
 *
 * @returns True if viewport width < 640px
 *
 * @example
 * const height = isMobileViewport()
 *   ? MAP_DIMENSIONS.HEIGHT_MOBILE
 *   : MAP_DIMENSIONS.HEIGHT_DESKTOP;
 */
export function isMobileViewport(): boolean;

/**
 * Gets responsive map height based on viewport size
 *
 * Returns mobile or desktop height constant
 *
 * @returns CSS height value ('300px' or '400px')
 *
 * @example
 * const height = getResponsiveMapHeight();
 * mapContainer.style.height = height;
 */
export function getResponsiveMapHeight(): string;

/**
 * Gets responsive map width based on viewport size
 *
 * Returns mobile (100%) or desktop (60%) width constant
 *
 * @returns CSS width value ('100%' or '60%')
 *
 * @example
 * const width = getResponsiveMapWidth();
 * mapContainer.style.width = width;
 */
export function getResponsiveMapWidth(): string;

// ============================================================================
// Error Helper Functions
// ============================================================================

/**
 * Creates a standardized MapError object
 *
 * Ensures consistent error structure across the feature
 *
 * @param type - Error classification
 * @param message - User-friendly message
 * @param details - Optional technical details for logging
 * @returns Structured MapError object
 *
 * @example
 * const error = createMapError(
 *   'coordinates',
 *   'Location coordinates unavailable',
 *   { latitude: null, longitude: null }
 * );
 */
export function createMapError(
  type: MapError['type'],
  message: string,
  details?: unknown
): MapError;

/**
 * Logs map errors to console with structured formatting
 *
 * Logs user message + technical details for debugging
 * Only logs in development, silent in production
 *
 * @param error - Map error to log
 *
 * @example
 * const error = createMapError('load', 'Map temporarily unavailable', event);
 * logMapError(error);
 * // Console: [MapError:load] Map temporarily unavailable
 * //          Details: { ... }
 */
export function logMapError(error: MapError): void;

// ============================================================================
// Animation Helper Functions
// ============================================================================

/**
 * Checks if user prefers reduced motion
 *
 * Queries prefers-reduced-motion media query
 *
 * @returns True if user prefers reduced motion
 *
 * @example
 * const shouldAnimate = !prefersReducedMotion();
 * if (shouldAnimate) {
 *   markerElement.classList.add('animate-glow-pulse');
 * }
 */
export function prefersReducedMotion(): boolean;

/**
 * Applies glow pulse animation to an element
 *
 * Conditionally adds animation class based on user preference
 *
 * @param element - DOM element to animate
 * @param enabled - Whether animation should be enabled (before reduced motion check)
 *
 * @example
 * const markerEl = createMarkerElement(config, false);
 * applyGlowPulse(markerEl, props.animated ?? true);
 */
export function applyGlowPulse(
  element: HTMLElement,
  enabled: boolean
): void;

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Export function signatures as types for testing and documentation
 */
export type ValidateCoordinatesFn = typeof validateCoordinates;
export type CheckWebGLSupportFn = typeof checkWebGLSupport;
export type CreateMarkerElementFn = typeof createMarkerElement;
export type GetMapboxAccessTokenFn = typeof getMapboxAccessToken;
