import type { GeolocationData } from '@/types/ip';
import { formatCoordinates, formatTimezone } from '@/lib/utils/geolocation';

interface GeolocationSecondaryInfoProps {
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
 * GeolocationSecondaryInfo Component
 *
 * Server Component that displays secondary geographic and network information:
 * - State/region
 * - Postal code
 * - Coordinates (formatted)
 * - ISP and organization
 * - Connection type
 * - Timezone (formatted)
 *
 * Handles missing data gracefully by hiding fields when unavailable.
 * Uses responsive grid: 1-column mobile, 2-column tablet, 3-column desktop.
 *
 * @param props - Component properties
 * @returns Server Component displaying secondary location and network data
 */
export function GeolocationSecondaryInfo({
  data,
  className = '',
}: GeolocationSecondaryInfoProps) {
  // Format data using utility functions
  const coordinates = formatCoordinates(data.latitude, data.longitude);
  const timezone = formatTimezone(data.timezone);

  // Only render fields that have data (filter out null and undefined)
  const fields = [
    // Geographic information
    (data.region_name !== null && data.region_name !== undefined) && {
      label: 'State / Region',
      value: data.region_name,
      showCode: data.region_code !== null && data.region_code !== undefined ? data.region_code : undefined,
    },
    (data.zip !== null && data.zip !== undefined) && {
      label: 'Postal Code',
      value: data.zip,
    },
    (data.latitude !== undefined && data.latitude !== null && data.longitude !== undefined && data.longitude !== null) && {
      label: 'Coordinates',
      value: coordinates,
    },
    // Network information
    (data.isp !== null && data.isp !== undefined) && {
      label: 'ISP',
      value: data.isp,
    },
    (data.organization !== null && data.organization !== undefined && data.organization !== data.isp) && {
      label: 'Organization',
      value: data.organization,
    },
    (data.connection_type !== null && data.connection_type !== undefined) && {
      label: 'Connection Type',
      value: data.connection_type,
    },
    // Timezone information
    (data.timezone !== null && data.timezone !== undefined) && {
      label: 'Timezone',
      value: timezone,
    },
  ].filter(Boolean);

  // If no secondary data available, show friendly message
  if (fields.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-muted-foreground italic">
          No additional location details available
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {fields.map((field, index) => {
        if (!field) return null;

        return (
          <div key={index} className="space-y-1">
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-base font-medium">{field.value}</p>
              {field.showCode && (
                <p className="text-xs text-muted-foreground uppercase">
                  {field.showCode}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
