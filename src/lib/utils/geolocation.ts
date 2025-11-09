/**
 * Utility functions for geolocation data formatting and display
 * Based on data-model.md specification
 */

import type { TimezoneData } from '@/types/ip';

/**
 * Converts ISO 3166-1 alpha-2 country code to flag emoji
 *
 * @param countryCode - Two-letter country code (e.g., "US", "GB")
 * @returns Flag emoji or globe emoji if code invalid
 *
 * @example
 * getCountryFlag('US') → '🇺🇸'
 * getCountryFlag('GB') → '🇬🇧'
 * getCountryFlag('JP') → '🇯🇵'
 * getCountryFlag(undefined) → '🌍'
 */
export function getCountryFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'; // Globe emoji for unknown countries
  }

  // Convert ISO 3166-1 alpha-2 to regional indicator symbols
  // Regional indicator symbols start at U+1F1E6 (A) = 127462
  // Formula: codePoint = 127397 + charCode
  // Example: 'U' (85) → 127397 + 85 = 127482 (🇺)
  //          'S' (83) → 127397 + 83 = 127480 (🇸)
  //          Together: 🇺🇸
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

/**
 * Formats latitude and longitude coordinates to human-readable string
 *
 * @param latitude - Latitude (-90 to 90)
 * @param longitude - Longitude (-180 to 180)
 * @returns Formatted coordinates with cardinal directions (4 decimal places)
 *
 * @example
 * formatCoordinates(37.7749, -122.4194) → '37.7749°N, 122.4194°W'
 * formatCoordinates(-33.8688, 151.2093) → '33.8688°S, 151.2093°E'
 * formatCoordinates(0, 0) → '0.0000°N, 0.0000°E'
 * formatCoordinates(undefined, undefined) → 'Coordinates unavailable'
 */
export function formatCoordinates(
  latitude: number | undefined,
  longitude: number | undefined
): string {
  if (latitude === undefined || longitude === undefined) {
    return 'Coordinates unavailable';
  }

  // Determine cardinal directions
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';

  // Format to 4 decimal places (±11 meters precision)
  const latFormatted = Math.abs(latitude).toFixed(4);
  const lonFormatted = Math.abs(longitude).toFixed(4);

  return `${latFormatted}°${latDirection}, ${lonFormatted}°${lonDirection}`;
}

/**
 * Formats timezone data to human-readable string
 *
 * @param timezone - Timezone data object from IPstack
 * @returns Formatted timezone with IANA name and UTC offset
 *
 * @example
 * formatTimezone({ id: 'America/New_York', offset: -18000 }) → 'America/New_York (UTC-5)'
 * formatTimezone({ id: 'Europe/London', offset: 0 }) → 'Europe/London (UTC+0)'
 * formatTimezone({ id: 'Asia/Tokyo', gmt_offset: 9 }) → 'Asia/Tokyo (UTC+9)'
 * formatTimezone(undefined) → 'Timezone unavailable'
 */
export function formatTimezone(timezone: TimezoneData | undefined): string {
  if (!timezone || !timezone.id) {
    return 'Timezone unavailable';
  }

  let formatted = timezone.id;

  // Prefer offset (seconds) over gmt_offset (hours)
  if (timezone.offset !== undefined) {
    // Convert seconds to hours
    const offsetHours = timezone.offset / 3600;
    const sign = offsetHours >= 0 ? '+' : '';
    formatted += ` (UTC${sign}${offsetHours})`;
  } else if (timezone.gmt_offset !== undefined) {
    const sign = timezone.gmt_offset >= 0 ? '+' : '';
    formatted += ` (UTC${sign}${timezone.gmt_offset})`;
  }

  return formatted;
}
