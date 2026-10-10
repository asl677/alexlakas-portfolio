import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build date for the Talk tab's "Latest update" line (inlined, so server and client match).
  env: {
    BUILD_TIME: String(Date.now()),
  },
  images: {
    domains: ["uploads-ssl.webflow.com", "hello-alex-portfolio.webflow.io"],
    unoptimized: true,
  },
};

export default nextConfig;
