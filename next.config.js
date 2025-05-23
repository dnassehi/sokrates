/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // expose only NEXT_PUBLIC_ vars automatically
  },
  // If you need rewrites or headers, add here
};

module.exports = nextConfig;
