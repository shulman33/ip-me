import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GeolocationData } from '@/types/ip';
import { GeolocationPrimaryInfo } from './geolocation-primary-info';

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
 * Server Component container that wraps geolocation primary information
 * in a styled Card component with appropriate badges and layout.
 *
 * This is the Phase 3 (User Story 1) implementation, showing only primary
 * location data (IP, country, city). Secondary data will be added in Phase 4.
 *
 * @param props - Component properties
 * @returns Server Component with geolocation card layout
 */
export function GeolocationCard({ data, className = '' }: GeolocationCardProps) {
  return (
    <Card className={`w-full ${className}`}>
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
      <CardContent>
        <GeolocationPrimaryInfo data={data} />
      </CardContent>
    </Card>
  );
}
