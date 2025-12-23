/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // turbo option removed as it is invalid
    instrumentationHook: true,
  },
};

export default nextConfig;
