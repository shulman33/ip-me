/**
 * IPDisplay Server Component
 * Displays visitor's IP address with version indicator and copy button
 * Server-rendered for optimal performance (no client-side API call)
 *
 * Falls back to client-side detection if server-side detection fails
 */

import { headers } from 'next/headers';
import { detectClientIP } from '@/lib/utils/ip-detection';
import { formatIP } from '@/lib/utils/format-ip';
import { CopyButton } from './copy-button';
import { IPDetectionClient } from './ip-detection-client';

/**
 * Server Component that detects and displays visitor's IP address
 * Automatically renders on page load without JavaScript
 * Falls back to client-side detection (IPDetectionClient) on failure
 */
export async function IPDisplay() {
  // Get request headers (must await in Next.js 15)
  const headersList = await headers();

  // Detect client IP from headers
  const ipAddress = detectClientIP(headersList);

  // Fallback to client-side detection if server-side failed
  // This enables retry logic and error handling (User Story 3)
  if (!ipAddress || !ipAddress.isValid) {
    return <IPDetectionClient autoDetect={true} />;
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
      <div className="rounded-lg bg-card border border-border px-8 py-6 shadow-lg min-w-[300px]">
        <div className="flex flex-col items-center gap-4">
          {/* IP Address in monospace font */}
          <code className="text-3xl font-mono font-semibold text-card-foreground tracking-wide">
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
