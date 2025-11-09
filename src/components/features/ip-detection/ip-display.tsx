/**
 * IPDisplay Server Component
 * Displays visitor's IP address with version indicator and copy button
 * Server-rendered for optimal performance (no client-side API call)
 */

import { headers } from 'next/headers';
import { detectClientIP } from '@/lib/utils/ip-detection';
import { formatIP } from '@/lib/utils/format-ip';
import { CopyButton } from './copy-button';

/**
 * Server Component that detects and displays visitor's IP address
 * Automatically renders on page load without JavaScript
 */
export async function IPDisplay() {
  // Get request headers (must await in Next.js 15)
  const headersList = await headers();

  // Detect client IP from headers
  const ipAddress = detectClientIP(headersList);

  // Handle case where IP detection failed
  if (!ipAddress || !ipAddress.isValid) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your IP Address
        </h1>
        <div className="rounded-lg bg-background border border-red-500/20 px-8 py-6">
          <p className="text-lg text-red-500">
            Unable to detect IP address
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your network connection
          </p>
        </div>
      </div>
    );
  }

  // Format IP for display
  const formattedIP = formatIP(ipAddress.value, ipAddress.version);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Heading with semantic HTML */}
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Your IP Address
      </h1>

      {/* IP Display Card */}
      <div className="rounded-lg bg-background border border-border px-8 py-6 shadow-lg min-w-[300px]">
        <div className="flex flex-col items-center gap-4">
          {/* IP Address in monospace font */}
          <code className="text-3xl font-mono font-semibold text-foreground tracking-wide">
            {formattedIP}
          </code>

          {/* IP Version Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green/10 px-3 py-1 text-sm font-medium text-green">
              {ipAddress.version}
            </span>
          </div>

          {/* Copy Button - Client Component for interactivity */}
          <CopyButton text={ipAddress.value} />
        </div>
      </div>

      {/* Privacy Notice */}
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Your IP address is detected automatically for display purposes only.
        <br />
        We cache this information for 5 minutes to improve performance.
      </p>
    </div>
  );
}
