import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole app is session-driven and dynamic (feed, session, leaderboards),
  // so the Cache Components model brings no benefit here.
  cacheComponents: false,
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
