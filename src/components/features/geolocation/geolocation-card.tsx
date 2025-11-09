import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GeolocationData } from '@/types/ip';
import { GeolocationPrimaryInfo } from './geolocation-primary-info';
import { GeolocationSecondaryInfo } from './geolocation-secondary-info';

interface GeolocationCardProps {
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
 * GeolocationCard Component
 *
 * Server Component container that wraps geolocation information
 * in a styled Card component with appropriate badges and layout.
 *
 * Displays both primary location data (IP, country, city) and secondary
 * data (state, postal code, coordinates, ISP, timezone) in organized sections.
 *
 * @param props - Component properties
 * @returns Server Component with geolocation card layout
 */
export function GeolocationCard({ data, className = '' }: GeolocationCardProps) {
  return (
    <article className={`w-full ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Your Location</CardTitle>
            <div className="flex gap-2">
              {data.cached && (
                <Badge variant="outline" className="text-xs">
                  Cached
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {data.version}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary location information */}
          <GeolocationPrimaryInfo data={data} />

          {/* Divider line */}
          <div className="border-t border-border" />

          {/* Secondary location and network information */}
          <GeolocationSecondaryInfo data={data} />
        </CardContent>
      </Card>
    </article>
  );
}
