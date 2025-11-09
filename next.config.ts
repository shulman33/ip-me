import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com", // unsafe-inline needed for Next.js, unsafe-eval for JSON-LD + Mapbox GL JS
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com", // unsafe-inline needed for Tailwind and shadcn/ui + Mapbox styles
              "img-src 'self' data: https: https://api.mapbox.com https://*.tiles.mapbox.com", // Mapbox map tiles
              "font-src 'self' data:",
              "connect-src 'self' https://api.ipstack.com https://api.mapbox.com https://events.mapbox.com", // IPstack API + Mapbox APIs
              "worker-src 'self' blob:", // Mapbox web workers
              "child-src blob:", // Mapbox WebGL context
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
