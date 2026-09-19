/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js", "satori"],
  },
};

export default nextConfig;
