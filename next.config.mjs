/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "development",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  /* config options here */
};

export default nextConfig;
