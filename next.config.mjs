/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next 16 caches optimized images for 4 h by default (and can't invalidate them) — keep it short so a
    // replaced image in /public shows up within a minute. (The logo is imported, so it's hashed anyway.)
    minimumCacheTTL: 60,
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
