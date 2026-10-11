// Image proxy for hover-card previews: many sites block hotlinking or serve http images,
// so the card loads them through here instead. Images only, size-capped, cached for a week.
import { NextResponse } from "next/server";

const BLOCKED_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;
const MAX_BYTES = 4 * 1024 * 1024;

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url") ?? "";
  let url: URL;
  try { url = new URL(target); } catch { return new NextResponse(null, { status: 400 }); }
  if (!/^https?:$/.test(url.protocol) || BLOCKED_HOST.test(url.hostname)) return new NextResponse(null, { status: 400 });
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/124 Safari/537.36", referer: url.origin + "/" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return new NextResponse(null, { status: 404 });
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) return new NextResponse(null, { status: 413 });
    return new NextResponse(bytes, { headers: { "content-type": type, "cache-control": "public, max-age=604800, s-maxage=604800, immutable" } });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
