import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * GeolocationSkeleton Component
 *
 * Loading placeholder for geolocation data display.
 * Matches the final layout dimensions to prevent CLS (Cumulative Layout Shift).
 *
 * @returns Server Component that renders skeleton placeholders
 */
export function GeolocationSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-7 w-48" /> {/* Title skeleton */}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary location info skeletons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" /> {/* Flag emoji */}
            <Skeleton className="h-6 w-32" /> {/* Country name */}
          </div>
          <Skeleton className="h-5 w-40" /> {/* City name */}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Secondary data grid skeleton */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Data field 1 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-5 w-full" /> {/* Value */}
          </div>

          {/* Data field 2 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-5 w-full" /> {/* Value */}
          </div>

          {/* Data field 3 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-5 w-full" /> {/* Value */}
          </div>

          {/* Data field 4 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-5 w-full" /> {/* Value */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
