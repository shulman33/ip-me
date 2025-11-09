/**
 * LocationMap Component
 * Feature: 003-interactive-location-map
 *
 * Interactive map component displaying user's detected location with a glowing green marker.
 * Uses Mapbox GL JS v3.x with dark theme styling.
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { LocationMapProps, MapLoadState, MapError } from '@/types/map';
import {
  MAP_DEFAULTS,
  MAP_ERROR_MESSAGES,
  validateCoordinates,
  checkWebGLSupport,
  toMapboxCoordinates,
  getMapboxAccessToken,
  createMarkerElement,
} from '@/lib/utils/map-helpers';
import { MapError as MapErrorComponent } from './map-error';
import { MapSkeleton } from './map-skeleton';

export function LocationMap({
  latitude,
  longitude,
  zoom = MAP_DEFAULTS.ZOOM_LEVEL,
  markerColor = MAP_DEFAULTS.MARKER_COLOR,
  animated = true,
  className,
  onMapLoad,
  onMapError,
}: LocationMapProps) {
  // Refs for map and marker instances
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Component state
  const [loadState, setLoadState] = useState<MapLoadState>('initializing');
  const [error, setError] = useState<MapError | null>(null);
  const [isContainerReady, setIsContainerReady] = useState(false);

  // Track when container ref becomes available
  useEffect(() => {
    if (mapContainer.current && !isContainerReady) {
      console.log('[LocationMap] Container ref is now ready');
      setIsContainerReady(true);
    }
  });

  // Map initialization and lifecycle management
  useEffect(() => {
    console.log('[LocationMap] useEffect triggered', { latitude, longitude, zoom, isContainerReady });

    // Early return if container not ready
    if (!isContainerReady || !mapContainer.current) {
      console.log('[LocationMap] Container ref not ready');
      return;
    }

    // Prevent re-initialization if map already exists
    if (map.current) {
      console.log('[LocationMap] Map already initialized, skipping');
      return;
    }

    // T020: Validate coordinates
    const coordValidation = validateCoordinates(latitude, longitude);
    if (!coordValidation.valid) {
      console.error('[LocationMap] Coordinate validation failed:', coordValidation.error);
      setLoadState('error');
      setError(coordValidation.error!);
      onMapError?.(coordValidation.error!);
      return;
    }
    console.log('[LocationMap] Coordinates validated successfully');

    // T020: Check WebGL support
    const webglCheck = checkWebGLSupport();
    if (!webglCheck.supported) {
      console.error('[LocationMap] WebGL check failed:', webglCheck.error);
      setLoadState('error');
      setError(webglCheck.error!);
      onMapError?.(webglCheck.error!);
      return;
    }
    console.log('[LocationMap] WebGL support confirmed');

    // Update state to loading
    setLoadState('loading');
    console.log('[LocationMap] Starting map initialization...');

    try {
      // T021: Get access token
      const accessToken = getMapboxAccessToken();
      console.log('[LocationMap] Access token retrieved:', accessToken ? 'yes' : 'no');

      // T021: Create map instance with dark theme
      console.log('[LocationMap] Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_DEFAULTS.STYLE,
        center: toMapboxCoordinates({ latitude, longitude }),
        zoom,
        accessToken,
        minZoom: MAP_DEFAULTS.MIN_ZOOM,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM,
        attributionControl: true,
      });
      console.log('[LocationMap] Map instance created successfully');

      // T022, T023: Create custom marker element with animation
      console.log('[LocationMap] Creating marker...');
      const markerElement = createMarkerElement(markerColor, MAP_DEFAULTS.MARKER_SIZE, animated);

      // T024: Add marker to map
      marker.current = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(toMapboxCoordinates({ latitude, longitude }))
        .addTo(map.current);

      // T025: Add navigation control (zoom only, no compass)
      const nav = new mapboxgl.NavigationControl({
        showCompass: false,
        showZoom: true,
        visualizePitch: false,
      });
      map.current.addControl(nav, 'bottom-right');

      // T026: Map load event handler
      map.current.on('load', () => {
        console.log('[LocationMap] Map loaded successfully!');
        setLoadState('loaded');
        onMapLoad?.();
      });

      // Map error event handler
      map.current.on('error', (e) => {
        console.error('[LocationMap] Map error event:', e);
        const mapError: MapError = {
          type: 'load',
          message: MAP_ERROR_MESSAGES.LOAD_FAILED,
          details: e,
        };
        setLoadState('error');
        setError(mapError);
        onMapError?.(mapError);
      });

      // T027: Window resize handler
      const handleResize = () => {
        map.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      // T028: Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        marker.current?.remove();
        map.current?.remove();
        map.current = null;
        marker.current = null;
      };
    } catch (err) {
      console.error('[LocationMap] Map initialization error:', err);
      console.error('[LocationMap] Error type:', err instanceof Error ? err.name : typeof err);
      console.error('[LocationMap] Error message:', err instanceof Error ? err.message : String(err));
      const mapError: MapError = {
        type: 'token',
        message: MAP_ERROR_MESSAGES.TOKEN_INVALID,
        details: err,
      };
      setLoadState('error');
      setError(mapError);
      onMapError?.(mapError);
    }
  }, [isContainerReady, latitude, longitude, zoom, markerColor, animated, onMapLoad, onMapError]);

  // Render error state
  if (loadState === 'error' && error) {
    return <MapErrorComponent message={error.message} type={error.type} className={className} />;
  }

  // T029, T030: Render map container with responsive styling and ARIA labels
  // Always render the container so the ref can attach, show loading state as overlay
  return (
    <div
      className={`w-full h-[300px] sm:w-[60%] sm:h-[400px] sm:mx-auto rounded-lg overflow-hidden relative ${className || ''}`}
      role="region"
      aria-label={`Interactive map showing location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
    >
      <div ref={mapContainer} className="w-full h-full" />
      {(loadState === 'initializing' || loadState === 'loading') && (
        <div className="absolute inset-0">
          <MapSkeleton />
        </div>
      )}
    </div>
  );
}
