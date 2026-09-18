// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Forces Webpack compilation engine
    turbopack: false,
  },
};

export default nextConfig;
