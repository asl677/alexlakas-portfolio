// Link preview lookup for the hover cards: fetches a page's Open Graph image and description
// server-side (browsers can't read other sites' HTML) and caches the answer for a day.
import { NextResponse } from "next/server";

const BLOCKED_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;

const pick = (html: string, name: string) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, "i");
  const m = html.match(re);
  return m ? (m[1] || m[2]).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') : undefined;
};

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url") ?? "";
  let url: URL;
  try { url = new URL(target); } catch { return NextResponse.json({}, { status: 400 }); }
  if (url.protocol !== "https:" && url.protocol !== "http:") return NextResponse.json({}, { status: 400 });
  if (BLOCKED_HOST.test(url.hostname)) return NextResponse.json({}, { status: 400 });
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/124 Safari/537.36" },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });
    const html = (await res.text()).slice(0, 400000);
    // Candidates in order of preference: share images, then the page's own first pictures
    // (skipping icons, logos, SVGs and trackers), then the touch icon. The card tries each.
    const abs = (src: string) => { try { return new URL(src, res.url).href; } catch { return undefined; } };
    const images: string[] = [];
    for (const name of ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]) { const v = pick(html, name); if (v) images.push(v); }
    // Only pictures inside the page's main content (an ad banner or author avatar elsewhere
    // is worse than the favicon fallback).
    const mainHtml = html.match(/<(article|main)[\s>][\s\S]*?<\/\1>/i)?.[0] ?? "";
    for (const m of mainHtml.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi)) {
      if (/^data:|\.svg(\?|$)|pixel|spacer|tracking|logo|icon|avatar|sprite|\.gif/i.test(m[1])) continue;
      images.push(m[1]);
      if (images.length >= 6) break;
    }
    const touch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (touch) images.push(touch);
    const resolved = [...new Set(images.map(abs).filter(Boolean) as string[])];
    const image = resolved[0];
    const icon = false;
    const description = pick(html, "og:description") || pick(html, "description");
    const title = pick(html, "og:title") || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
    const short = description && description.length > 240 ? description.slice(0, 240).replace(/\s+\S*$/, "") + "…" : description;
    return NextResponse.json({ image, images: resolved, icon, title, description: short }, { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({}, { headers: { "cache-control": "public, s-maxage=3600" } });
  }
}
