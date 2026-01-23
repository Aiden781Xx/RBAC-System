/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable static optimization for pages that use client-side hooks
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig

