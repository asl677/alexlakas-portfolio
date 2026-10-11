import type { MetadataRoute } from "next";

// Crawl the page itself; never the preview/image proxy endpoints.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://alexlakas.com/sitemap.xml",
  };
}
