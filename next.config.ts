import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["uploads-ssl.webflow.com", "hello-alex-portfolio.webflow.io"],
    unoptimized: true,
  },
};

export default nextConfig;
