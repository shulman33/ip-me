/**
 * Site metadata configuration
 * Centralized configuration for SEO, branding, and site information
 */

export const siteConfig = {
  name: "IP.ME",
  description: "Instantly discover your public IP address (IPv4/IPv6) with one click. Fast, private, and accurate IP detection with geolocation data.",
  url: "https://ip-me.vercel.app",
  ogImage: "https://ip-me.vercel.app/og-image.png",
  links: {
    github: "https://github.com/yourusername/ip-me",
  },
  creator: {
    name: "IP.ME",
    url: "https://ip-me.vercel.app",
  },
  keywords: [
    "IP address",
    "my IP",
    "IP detection",
    "IPv4",
    "IPv6",
    "geolocation",
    "what is my IP",
    "IP lookup",
    "public IP",
    "network tools",
  ],
  authors: [
    {
      name: "IP.ME",
      url: "https://ip-me.vercel.app",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
