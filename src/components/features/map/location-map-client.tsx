/**
 * LocationMap Client Component Wrapper
 * Feature: 003-interactive-location-map
 *
 * Client Component wrapper that handles dynamic import of LocationMap
 * Allows Server Components to use the map without violating SSR constraints
 */

'use client';

import dynamic from 'next/dynamic';
import { MapSkeleton } from './map-skeleton';
import type { LocationMapProps } from '@/types/map';

// Dynamic import with SSR disabled (Client Component can use this)
const LocationMap = dynamic(
  () => import('./location-map')
    .then((mod) => {
      console.log('[LocationMapClient] Successfully loaded LocationMap module');
      return { default: mod.LocationMap };
    })
    .catch((error) => {
      console.error('[LocationMapClient] Failed to load LocationMap:', error);
      throw error;
    }),
  {
    ssr: false,
    loading: () => {
      console.log('[LocationMapClient] Showing loading skeleton');
      return <MapSkeleton />;
    },
  }
);

/**
 * Client wrapper component that can be imported by Server Components
 */
export function LocationMapClient(props: LocationMapProps) {
  console.log('[LocationMapClient] Rendering with props:', {
    latitude: props.latitude,
    longitude: props.longitude,
    zoom: props.zoom,
  });

  return <LocationMap {...props} />;
}
