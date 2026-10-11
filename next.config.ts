import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Talk tab "Latest update": the latest commit's subject and time. Vercel git builds expose the
// message; CLI deploys pass LAST_UPDATE_* (see deploy notes); locally, read git directly.
const git = (format: string) => { try { return execSync(`git log -1 --format=${format}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const lastUpdateTopic = process.env.LAST_UPDATE_TOPIC || process.env.VERCEL_GIT_COMMIT_MESSAGE?.split("\n")[0] || git("%s") || "Site updates";
const lastUpdateTime = process.env.LAST_UPDATE_TIME || (git("%ct") ? String(Number(git("%ct")) * 1000) : String(Date.now()));

const nextConfig: NextConfig = {
  // Build date for the Talk tab's "Latest update" line (inlined, so server and client match).
  env: {
    BUILD_TIME: lastUpdateTime,
    LAST_UPDATE_TOPIC: lastUpdateTopic,
  },
  images: {
    domains: ["uploads-ssl.webflow.com", "hello-alex-portfolio.webflow.io"],
    unoptimized: true,
  },
};

export default nextConfig;
