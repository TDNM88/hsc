/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep only essential configuration
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  transpilePackages: ["@neondatabase/serverless"],
  experimental: {
    serverComponentsExternalPackages: ["@upstash/redis"],
  },
  
  // No webpack customization at all
};

module.exports = nextConfig;
