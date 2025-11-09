import type { GeolocationData } from '@/types/ip';
import { getCountryFlag } from '@/lib/utils/geolocation';

interface GeolocationPrimaryInfoProps {
  /**
   * Geolocation data to display
   */
  data: GeolocationData;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * GeolocationPrimaryInfo Component
 *
 * Server Component that displays primary geographic location information:
 * - IP address
 * - Country with flag emoji
 * - City
 *
 * Handles missing data gracefully with fallback messages.
 *
 * @param props - Component properties
 * @returns Server Component displaying primary location data
 */
export function GeolocationPrimaryInfo({
  data,
  className = '',
}: GeolocationPrimaryInfoProps) {
  // Get flag emoji (or globe if country code missing or null)
  const flag = getCountryFlag(data.country_code ?? undefined);

  // Handle missing country name (null or undefined)
  const countryName = data.country_name ?? 'Unknown Country';

  // Handle missing city (null or undefined)
  const cityDisplay = data.city ?? 'City unavailable';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* IP Address */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Your IP Address</p>
        <p className="text-2xl font-bold tracking-tight">{data.ip}</p>
      </div>

      {/* Country with flag */}
      <div className="flex items-center gap-2">
        <span
          className="text-3xl"
          role="img"
          aria-label={`Flag of ${countryName}`}
        >
          {flag}
        </span>
        <div className="space-y-0.5">
          <p className="text-xl font-semibold leading-none">{countryName}</p>
          {data.country_code && (
            <p className="text-xs text-muted-foreground uppercase">
              {data.country_code}
            </p>
          )}
        </div>
      </div>

      {/* City */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">City</p>
        <p
          className={`text-base font-medium ${
            !data.city ? 'text-muted-foreground italic' : ''
          }`}
        >
          {cityDisplay}
        </p>
      </div>
    </div>
  );
}
