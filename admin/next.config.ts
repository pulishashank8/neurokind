import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'https://*.replit.dev',
    'https://*.janeway.replit.dev',
    'https://*.kirk.replit.dev',
    'https://*.spock.replit.dev',
    '127.0.0.1',
    'localhost',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
