/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimized images are cached for 1 day so the server doesn't re-process them under traffic.
    // If you replace an image in /public, give it a new filename (or delete .next/cache/images) so the
    // new version shows up right away. (The logo is imported, so it's hashed anyway.)
    minimumCacheTTL: 86400,
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
