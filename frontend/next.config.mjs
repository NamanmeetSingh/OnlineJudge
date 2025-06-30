/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*`,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_COMPILER_URL: process.env.NEXT_PUBLIC_COMPILER_URL,
  },
};

export default nextConfig;
