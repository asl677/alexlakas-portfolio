// Collects Open Graph previews (image, description) for every external link on the page and
// saves them to src/data/linkPreviews.json for the hover cards. Run: node scripts/fetch-link-previews.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const urls = [...new Set([...source.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]))];
const pick = (html, name) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, "i");
  const m = html.match(re);
  return m ? (m[1] || m[2]).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') : undefined;
};
// Keep earlier results for links that fail this run (sites rate-limit or time out).
const file = new URL("../src/data/linkPreviews.json", import.meta.url);
const out = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
for (const url of urls) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/124 Safari/537.36" }, redirect: "follow", signal: AbortSignal.timeout(10000) });
    const html = (await res.text()).slice(0, 400000);
    let image = pick(html, "og:image") || pick(html, "twitter:image");
    if (image && !/^https?:/.test(image)) image = new URL(image, res.url).href;
    const description = pick(html, "og:description") || pick(html, "description");
    const title = pick(html, "og:title") || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim();
    // Trim long descriptions at a word boundary and mark the cut.
    const short = description && description.length > 240 ? description.slice(0, 240).replace(/\s+\S*$/, "") + "…" : description;
    if (image || description || title) out[url] = { ...(out[url] || {}), ...(image ? { image } : {}), ...(short ? { description: short } : {}), ...(title ? { title } : {}) };
    console.log(res.status, image ? "img" : "-  ", url);
  } catch (error) {
    console.log("ERR", url, error.message);
  }
}
writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
console.log(Object.keys(out).length, "previews saved");
