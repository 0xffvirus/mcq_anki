/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // HTML pages — always revalidate, never serve stale
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Next.js static chunks — safe to cache long-term (content-hashed filenames)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig;
