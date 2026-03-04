# alexlakas-portfolio Design System

Portfolio-specific design rules, architecture patterns, and component guidelines.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, GSAP 3, Lenis 1.1.20
- Deployed: https://vercel.com/asl677s-projects/alexlakas-portfolio
- Webflow reference: https://hello-alex-portfolio.webflow.io

## Font System

- **Primary font**: `'Ppneuemontreal Book'` — PP Neue Montreal Book, normal weight, 0.05rem letter-spacing
- **Source**: Webflow CDN `@font-face`: `https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/66fca63395527313c6d5eaa2_PPNeueMontreal-Book.otf`
- **Body CSS**: `font-family: 'Ppneuemontreal Book', 'Ppneuemontreal', sans-serif; letter-spacing: 0.05rem`
- **Inconsolata**: imported via `next/font/google` for bio text + marquee only
- **NO Space Grotesk** — removed entirely
- **`.base`**: inherits body font — NO `font-family` override on `.base`

## Key Architecture Rules

**Door animation** (Life button) — use `transformPerspective` on `.upper-wrap`:
- NEVER animate the CSS `perspective` property on `.body-wrapper` via GSAP — it corrupts the element
- `.body-wrapper` has NO `perspective` CSS — all 3D managed by GSAP transformPerspective on `.upper-wrap`
- Open: `{ transformPerspective: 80, rotationY: 0.4, duration: 0.8, ease: "power3.out" }`
- Close: `{ transformPerspective: 1200, rotationY: 0, duration: 0.8, ease: "power3.out" }` (same timing)
- Initial: `gsap.set(".upper-wrap", { transformPerspective: 1200 })` in revealAll
- 80px perspective is extreme — even 0.4° rotation creates dramatic door-swing visual

**Marquee** — inside `.upper-wrap`, not viewport-fixed:
- CSS: `position: absolute; top: 0; left: 0; right: 0` (not `position: fixed`)
- Lives inside `.upper-wrap` so it rotates with the door and scrolls away with the page
- Placed in JSX inside `.upper-wrap` div (before NavLeft and Slider)

**Cursor**: `cursor: default` on `*, *::before, *::after` — no hand pointers anywhere on the site

**Red strip**: `.link-strip` starts at `transform: translateX(-110%)`, CSS hover goes to `0%`.
On load GSAP sweeps `xPercent: -110 → 110` staggered, then `clearProps` restores CSS hover.

**Slider loop** (GSAP): `gsap.to(track, { x: -halfWidth, ease: "none", repeat: -1 })`. Duration ~50s (user preference). Measure `halfWidth = scrollWidth / 2` on `window.load`.

**Lenis**: Pinned `1.1.20`. Always cleanup: `gsap.ticker.remove(onTick); lenis.destroy()`

## Components

- `src/app/page.tsx` — orchestrator: `revealAll()` on Loader complete, `handleLifeClick()` for door
- `src/app/globals.css` — all CSS including @font-face PP Neue Montreal, link-strip, pill, marquee
- `src/app/layout.tsx` — only imports Inconsolata from Google Fonts; PP Neue Montreal via @font-face in CSS
- `src/components/NavLeft.tsx` — fixed left nav, 3 columns (name/projects/skills)
- `src/components/NavRight.tsx` — "Let's Go" top-right + "Life" pill bottom-right
- `src/components/MarqueeTop.tsx` — top marquee, CSS 5s animation, inside upper-wrap
- `src/components/Slider.tsx` — GSAP seamless loop, 15 images doubled to 30
- `src/components/BioSheet.tsx` — full-screen bio overlay, text staggers in/out with GSAP
- `src/components/Press.tsx` — black section below upper-wrap
- `src/components/LenisInit.tsx` — smooth scroll, pinned lenis 1.1.20

## Commands

```bash
npm run dev    # local dev server (may use port 3002 if 3000 taken)
npm run build  # production build (verify before deploying)
```
