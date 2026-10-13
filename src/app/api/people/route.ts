import people from "./people.json";
import blurbs from "./blurbs.json";

// People's names, links and hover-card blurbs. Kept out of the page HTML and the client bundle,
// and served from /api/ (disallowed in robots.txt) so crawlers never fetch or index them; the
// page fills them in for visitors.
export function GET() {
  return Response.json({ people, blurbs }, {
    headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "public, max-age=300, s-maxage=86400" },
  });
}
