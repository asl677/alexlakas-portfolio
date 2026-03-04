# Alex Lakas Portfolio — Claude Code & Design Guidelines

**Stack**: Next.js 15, TypeScript, Tailwind CSS, GSAP 3, Lenis 1.1.20
**Deployed**: https://vercel.com/asl677s-projects/alexlakas-portfolio
**Webflow Reference**: https://hello-alex-portfolio.webflow.io

## Documentation Navigation

| Document | Purpose |
|----------|---------|
| **[GSAP Best Practices](../GSAP-BEST-PRACTICES.md)** | **REQUIRED reading** — ScrollTrigger, SplitText, Lenis patterns |
| **[Base CLAUDE.md](../CLAUDE.md)** | General Claude Code settings & workflow |
| **[Alfa Design System](../alfa-design-system/)** | Color, typography, spacing, motion reference |
| **README.md** | Quick start & project overview |

> **⚠️ CRITICAL**: All GSAP animations in this project MUST follow the patterns in `GSAP-BEST-PRACTICES.md`. Inconsistencies stem from deviating from these rules (especially resize handling, ScrollTrigger recreation, SplitText revert).

---

## Font System

- **Primary font**: `'Ppneuemontreal Book'` — PP Neue Montreal Book, normal weight, 0.05rem letter-spacing
- **Source**: Webflow CDN `@font-face`: `https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/66fca63395527313c6d5eaa2_PPNeueMontreal-Book.otf`
- **Body CSS**: `font-family: 'Ppneuemontreal Book', 'Ppneuemontreal', sans-serif; letter-spacing: 0.05rem`
- **Inconsolata**: imported via `next/font/google` for bio text + marquee only
- **NO Space Grotesk** — removed entirely
- **`.base`**: inherits body font — NO `font-family` override on `.base`

---

## Key Architecture Rules

### Door Animation (Life Button)

**NEVER animate the CSS `perspective` property on `.body-wrapper` via GSAP** — it corrupts the element.

- `.body-wrapper` has NO `perspective` CSS — all 3D managed by GSAP transformPerspective on `.upper-wrap`
- **Open**: `{ transformPerspective: 80, rotationY: 0.4, duration: 0.8, ease: "power3.out" }`
- **Close**: `{ transformPerspective: 1200, rotationY: 0, duration: 0.8, ease: "power3.out" }` (same timing)
- **Initial**: `gsap.set(".upper-wrap", { transformPerspective: 1200 })` in revealAll
- 80px perspective is extreme — even 0.4° rotation creates dramatic door-swing visual

### Marquee

**Inside `.upper-wrap`, not viewport-fixed:**
- CSS: `position: absolute; top: 0; left: 0; right: 0` (not `position: fixed`)
- Lives inside `.upper-wrap` so it rotates with the door and scrolls away with the page
- Placed in JSX inside `.upper-wrap` div (before NavLeft and Slider)

### Cursor

`cursor: default` on `*, *::before, *::after` — no hand pointers anywhere on the site

### Red Strip (`.link-strip`)

Starts at `transform: translateX(-110%)`, CSS hover goes to `0%`.
On load GSAP sweeps `xPercent: -110 → 110` staggered, then `clearProps` restores CSS hover.

### Slider Loop (GSAP)

`gsap.to(track, { x: -halfWidth, ease: "none", repeat: -1 })`. Duration ~50s (user preference).
Measure `halfWidth = scrollWidth / 2` on `window.load`.

### Lenis Smooth Scroll

Pinned `1.1.20`. Always cleanup: `gsap.ticker.remove(onTick); lenis.destroy()`

---

## Press Section Behavior (Webflow Reference)

**IMPORTANT**: The press section at https://hello-alex-portfolio.webflow.io has **NO parallax animation**.

### What Creates the "Parallax" Illusion:
1. **Lenis Smooth Scrolling** (`lerp: 0.1-0.14`) - Creates buttery momentum
2. **Text Shadow Depth** - `text-shadow: 0 2.5vw currentColor` creates layered appearance
3. **Natural Flow** - Section just scrolls normally with page

### Exact Implementation:

#### CSS:
```css
.press-section {
  z-index: -4;
  background-color: var(--black-100);
  flex: 1;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  position: relative;
}

.press-features {
  z-index: -8;
  opacity: 1;
  position: relative;
  /* NO fixed positioning, NO parallax transforms */
}

.link[data-split="letters"] {
  text-shadow: 0 2.5vw currentColor; /* Depth illusion */
}
```

#### JavaScript:
- **NO ScrollTrigger animations** on press section
- Only animation: Character hover effect (moves up 1.2em on mouseenter)
- Lenis handles all smooth scrolling automatically

### CUSTOM IMPLEMENTATION (Not in Webflow):
**Added 25vw parallax effect on press features (tightly tied to scroll, no delay):**
```javascript
// IMPORTANT: scrub: 0 removes delay and ties directly to scroll speed
// This makes parallax feel instant and coupled to scroll
gsap.fromTo(".press-features", 
  { y: "0vw" },
  {
    y: "25vw",
    ease: "none",
    scrollTrigger: {
      trigger: ".press-section",
      start: "top bottom",    // When section enters viewport
      end: "bottom top",      // When section exits viewport
      scrub: 0,               // No delay - immediate scroll coupling
    },
  }
);
```

**Why scrub: 0?** `scrub: 1` adds a 1-second delay. `scrub: 0` removes smoothing, making it feel immediately tied to scroll speed.

### Typography (Wagon Font):
```css
.base.wagon {
  font-family: 'Wagon', Georgia, serif;
  font-size: var(--g-medium); /* 2vw */
  line-height: var(--g-medium);
  font-weight: 300;
  font-style: italic;
  -webkit-font-smoothing: antialiased;
}

@font-face {
  font-family: 'Wagon';
  src: url('https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/63bce9e077c37c4ab36de928_Wagon-ExtraLightItalic.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}
```

---

## Key Learnings:
- Sometimes the best "effect" is elegant simplicity
- Smooth scroll + clever styling = perceived parallax
- Don't over-engineer when native flow works beautifully
- **Parallax scrub timing:** `scrub: 0` = immediate/tight coupling, `scrub: 1` = 1-second delay

## Door Animation (Life Button)

### Structure:
- **Life button**: Lives OUTSIDE `upper-wrap` (position: fixed bottom-right) so it's always visible
- **Nav elements** (left/right/marquee): Inside `upper-wrap` (position: absolute), so they rotate WITH the door
- **Slider**: Counter-rotates to stay centered and undistorted during door swing

### Animation Details:

**Uses GSAP timeline.reverse() for perfect mirror animation:**
```javascript
// Create timeline once, store in ref
const tl = gsap.timeline({ paused: true });

// Black fade in IMMEDIATELY (duration: 0 at position 0)
tl.to(".sheet-inner", { opacity: 1, pointerEvents: "auto", duration: 0 }, 0);

// Door swings open (2s with power3.out easing - matches Webflow)
tl.to(".upper-wrap", {
  transformPerspective: 0.05,
  rotationY: 0.25,
  width: "50vw",
  duration: 2,
  ease: "power3.out",
}, 0);

// Slider counter-rotates to stay centered
tl.to(".slider-section", { rotationY: -0.25, duration: 2, ease: "power3.out" }, 0);

// Opening: tl.play()
// Closing: tl.reverse() - GSAP automatically reverses ALL animations perfectly
```

### Key Points:
- Duration: 2s (matches Webflow original)
- Rotation: 0.25 (reduced from 0.4 for less intense swing)
- **Uses timeline.reverse() for TRUE mirror effect** - GSAP handles all easing reversal automatically
- Black fade happens at start when opening, at end when closing (automatic via reverse)
- All animations perfectly synchronized via single timeline
- Bio text animates in after 0.5s delay with reduced rotation (-5°)
---

## Viewport Resize Best Practices (GSAP ScrollTrigger)

**IMPORTANT**: When viewport resizes, text can break unpredictably if ScrollTrigger animations aren't properly recreated.

### The Problem:
Simply calling `ScrollTrigger.refresh()` is insufficient. Old animation calculations remain stale, causing text to reflow and break in odd places during resize.

### The Solution:
```javascript
// Create initial tween
let tween = gsap.fromTo(".element", { y: "0vw" }, {
  y: "30vw",
  ease: "none",
  scrollTrigger: { trigger, start, end, scrub: 0 },
});

// On resize: KILL old tween and recreate fresh
const handleResize = () => {
  if (tween) tween.scrollTrigger?.kill();
  tween = gsap.fromTo(".element", { y: "0vw" }, {
    y: "30vw",
    ease: "none",
    scrollTrigger: { trigger, start, end, scrub: 0 },
  });
};

window.addEventListener("resize", debounce(handleResize, 250));
```

### Key Points:
- **KILL before recreating**: `tween.scrollTrigger?.kill()` removes old ScrollTrigger
- **Debounce**: 250ms prevents excessive recreation during rapid resizing
- **Fresh calculations**: New tween recalculates trigger points, distances, DOM measurements
- This preserves text breaks because layout is recalculated from scratch
- Reference: https://gsap.com/community/forums/topic/45016-unexpected-line-breaks-when-using-split-text/

---

## GSAP SplitText for Responsive Line Animations (Bio Sheet)

**CRITICAL**: Never manually split text into hardcoded arrays. Use GSAP's SplitText plugin to properly handle responsive text that preserves line breaks on resize.

### The Problem with Manual Splitting:
```javascript
// ❌ WRONG - Hardcoded lines don't adapt to viewport
const bioLines = ["Line 1", "Line 2", "Line 3"];
bioLines.map((line, i) => <span key={i}>{line}</span>)
// When viewport resizes, text reflows unpredictably
```

### The Correct Solution with SplitText:
```javascript
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

// Single string — SplitText handles line splitting
const bioText = "long text here...";

// Create fresh SplitText to preserve line breaks
if (splitRef.current) splitRef.current.revert();
splitRef.current = new SplitText(textRef.current, { type: "lines" });

// Animate the actual DOM lines
gsap.fromTo(
  splitRef.current.lines,
  { y: "5vw", opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: { each: 0.15, from: "end" },
    ease: "power3.out",
  }
);
```

### Resize Handling (Most Important):
```javascript
// On resize: REVERT old split, create fresh SplitText
const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (splitRef.current) {
      splitRef.current.revert();  // ← CRITICAL: Remove old DOM changes
      splitRef.current = new SplitText(textRef.current, { type: "lines" });  // ← Fresh split
      
      // Re-animate with updated line DOM
      gsap.fromTo(splitRef.current.lines, {...});
    }
  }, 250);
};

window.addEventListener("resize", handleResize);
```

### Essential Pattern:
1. **Register plugin**: `gsap.registerPlugin(SplitText)`
2. **Store ref**: `const splitRef = useRef<any>(null)`
3. **On activation**: `splitRef.current = new SplitText(el, { type: "lines" })`
4. **On resize**: `splitRef.current.revert()` → `new SplitText(el, { type: "lines" })`
5. **On unmount**: `splitRef.current.revert()` in cleanup

### Key Points:
- **ALWAYS revert before recreating** - `splitRef.revert()` removes SplitText's DOM modifications
- **Never hardcode text splits** - Let SplitText calculate actual rendered lines
- **Resize requires full recreation** - Not just `refresh()`, but complete `revert()` + `new SplitText()`
- **Debounce resize** - 250ms prevents excessive recreation
- **Use `type: "lines"`** - Splits by actual rendered lines (respects text wrapping)
- Bio lines naturally stagger with `from: "end"` for reverse reveal
- Reference: https://gsap.com/community/forums/topic/45016-unexpected-line-breaks-when-using-split-text/

---

## Design System: Universal Guidelines for Claude Web Projects

> **Note**: These principles are extracted from editorial, high-performance design patterns. The portfolio is a reference implementation. Apply these rules to all new web projects.

### VISUAL DESIGN RULES

**Color Philosophy:**
- **Restricted palette**: 3-5 colors maximum (primary, secondary, neutral, accent, border)
- **High contrast** for accessibility (WCAG AA minimum)
- **Single accent color** for interactive states (hover, focus, selection)
- **Neutral foundation** (black, white, grey) — Accent only highlights actions
- **Reference**: Portfolio uses black/white/grey + red accent exclusively
  - CSS variables: `--black-100: #000`, `--white-100: white`, `--grey-100: #888`, `--red-100: red`

**Typography System:**
- **1 primary font family** (geometric sans-serif preferred: PP Neue Montreal, Inter, etc.)
  - 2-3 weights max (400, 500/600, 700)
  - Single letter-spacing value applied globally (0.05rem recommended for tightness)
- **Optional secondary font** for editorial/display purposes (serif, italic, or distinctive)
  - Use sparingly (headlines, sections, not body copy)
- **Text sizing approach:**
  - **Desktop-first scalable**: Use `vw` units for fluid typography (1vw = 1% viewport width)
  - Fallback to `rem` for mobile to prevent oversizing
  - Example: `.base { font-size: 1vw }` at desktop, `3vw` at tablet, `4vw` at mobile
  - Avoid fixed `px` sizes (breaks responsiveness)
- **Line heights:**
  - Body copy: `1.3` to `1.6` (readability)
  - Headlines: `1.2` to `1.3` (tight)
  - Display: `1.0` to `1.2` (compressed for impact)

**Spacing System:**
- **Define a base unit and scale it** (recommend vw-based for fluidity)
  - `--base: 1vw` → then `--xsmall: 0.5vw`, `--small: 1vw`, `--medium: 2vw`, `--large: 5vw`, `--xlarge: 10vw`
  - **Or use rem**: `--base: 1rem` → scale accordingly
- **Consistent application**: Use variables everywhere (padding, margin, gap, border-radius)
- **Responsive scaling**: Adjust base unit in media queries, variables cascade automatically

**Layout Patterns:**
- **Full-viewport sections** (hero, sticky regions): `100vw × 100svh`
- **Scrollable content**: Standard `width: 100%`, `height: auto`, `position: relative`
- **Centering**: Use flexbox or grid (not absolute positioning unless fixed/sticky)
- **Sticky elements**: Common for navigation, headlines, CTAs
  - Apply `position: sticky; top: 0; z-index: X` to keep in viewport during scroll
- **Grid usage**: Multi-column layouts for dense information (nav columns, bio sheets)
  - Example: `grid-template-columns: 1fr 2fr 1fr` for balanced 3-column

**Cursor & Interaction Signals:**
- **Default cursor** on navigation elements (no "hand" pointer)
- **Cursor changes only for form inputs** (text fields, buttons with visible state change)
- **Visual feedback via color/filter** instead of cursor change
  - Hover state = color change, underline, or background shift

---

### MOTION DESIGN RULES

**GSAP Easing Library (Universal Easings):**
- `power3.out` — **Default reveal easing** (rich, natural deceleration)
  - Use for: Initial reveals, entry animations, section fades, timeline plays
  - Feels: Confident, premium, natural
- `power3.inOut` — **Symmetric animations** (same speed in and out)
  - Use for: Animations that reverse (doors, toggles, clipPath expands)
  - Feels: Balanced, controlled
- `power2.out` — **Snappy interactions** (faster recovery)
  - Use for: Hover states, quick micro-interactions
  - Feels: Responsive, lightweight
- `power2.in` — **Accelerating** (builds momentum)
  - Use for: Exit animations, hover leaves, dismissals
  - Feels: Quick, purposeful
- `none` — **Linear easing** (constant speed)
  - Use for: Scroll-driven animations (`scrub` tweens), infinite loops, marquees
  - Feels: Mechanical, tied to user action
- **Portfolio example**: `power3.out` for intro, `none` for scroll parallax

**Animation Duration Framework:**
- **0-0.2s**: Instant responses (state changes, opacity flips)
- **0.3-0.5s**: Quick interactions (hover, focus, micro-interactions)
- **0.6-1.2s**: Standard reveals (nav entry, text slides, section fades)
- **1.5-2s**: Substantial animations (modals, major transitions, door swings)
- **3s+**: Slow reveals, cinematic effects (use sparingly)
- **CSS loops**: 5-8s for marquees/spinners (feels eternal without being instant)
- **Portfolio examples**: 0.35s (hover), 1s (link sweep), 2s (door), 5s (marquee)

**Stagger Patterns (Sequential Reveals):**
- **Fast cascade**: `0.08s` between elements (snappy, premium feel)
- **Medium cascade**: `0.12-0.15s` between elements (balanced)
- **Slow cascade**: `0.2s+` between elements (cinematic, methodical)
- **Formula**: `stagger: { each: VALUE, from: "start" | "end" | "center" }`
- **Portfolio example**: `0.08s` stagger creates rapid-fire nav reveal

**Reveal Patterns:**
- **Opacity fade**: Simple, universal. `fromTo(el, { opacity: 0 }, { opacity: 1 })`
- **Slide + fade**: Directional entry. `fromTo(el, { x: -30, opacity: 0 }, { x: 0, opacity: 1 })`
- **Clip-path expand**: Content-first, grows inward. `inset(50% 50% 50% 0%)` → `inset(0%)`
- **Scale up**: Growth from center. `fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1 })`
- **Combo approach**: Clip-path + opacity for richest effect

**ScrollTrigger Scroll-Driven Animation Pattern:**
- **Key concept**: `scrub: N` ties animation speed to scroll speed
  - `scrub: 0` — Immediate coupling, feels mechanical (use for tight effects)
  - `scrub: 1` — 1-second lag, smoothed feel (use for parallax depth)
- **Basic template**:
  ```javascript
  gsap.fromTo(el, { y: "0" }, {
    y: "30vw",
    ease: "none",  // ← REQUIRED for scrub
    scrollTrigger: {
      trigger: ".section",
      start: "top bottom",
      end: "bottom top",
      scrub: 0,  // Adjust 0 vs 1 for feel
    },
  });
  ```
- **Use cases**: Parallax depth, section reveals on scroll, lazy loads
- **Portfolio example**: Press section parallax with `scrub: 0` (immediate, tight)

**Infinite Loop Pattern:**
- **GSAP loop**: `gsap.to(track, { x: -halfWidth, ease: "none", repeat: -1, duration: 50 })`
- **Key**: `repeat: -1` (infinite), `ease: "none"` (linear), measure `halfWidth` at runtime
- **Array doubling**: Double content array to hide seam on wrap (15 items → 30)
- **Portfolio example**: Seamless image slider loop

---

### INTERACTION DESIGN RULES

**Hover State Framework:**
- **Color/filter change** (preferred):
  - Example: `grayscale(1)` → `grayscale(0)` on hover (desaturate by default, full color on interact)
  - Example: `opacity: 0.6` → `opacity: 1` (subtle to prominent)
  - Duration: 0.3-0.6s with `power2.out` easing
- **Background reveal** (sliding bar/stripe):
  - Common for text links, buttons, nav items
  - Pattern: Colored div positioned off-screen, slides into view on hover
  - Duration: 0.35s, with text on top (higher z-index)
  - Technique: Measure element width at runtime, position stripe from left, return to right on exit
- **Transform (scale/translate)**:
  - Example: Scale 1 → 1.05 on hover (button grow)
  - Example: TranslateY -2px on hover (lift effect)
  - Duration: 0.3s with `power2.out`

**Navigation Interaction Patterns:**
- **Persistent nav** (always visible):
  - Use sticky positioning (`position: sticky; top: 0`)
  - Fade in on page load (opacity 0 → 1)
  - Each item: slide + fade entry with stagger (0.08s recommended)
- **Modal/Overlay nav**:
  - Fade background (30-50% opacity dark), slide in nav from edge
  - Close on backdrop click or explicit close button
  - Timeline: Background fade + nav slide synchronized
- **Vertical stack nav** (left/right columns):
  - Use flexbox `flex-direction: column`
  - Gap between items: `var(--g-small)` or similar
  - Entry: All items slide from left with cascading stagger
- **Portfolio example**: Left nav 3-column + right top nav, shared 0.08s stagger

**State Toggle Patterns:**
- **Modal open/close**:
  - Store timeline in ref, use `tl.play()` to open
  - Use `tl.reverse()` to close (automatic easing reversal)
  - Structure: Background fade + content slide in sync
  - Portfolio example: Bio sheet toggle (door animation with timeline reverse)
- **Accordion expand/collapse**:
  - Animate `height: 0` → `height: auto` (or max-height if height: auto unreliable)
  - Fade content opacity simultaneously
  - Use GSAP `autoAlpha` for opacity + visibility combo
- **Menu open/close**:
  - Common: Nav slides from off-screen, backdrop fades
  - Reverse pattern: Same timeline, opposite direction

**Button & CTA Interactions:**
- **Primary button hover**:
  - Background color shift (accent color)
  - Text color invert if needed for contrast
  - Duration: 0.3s
  - Optional: Slight scale (1 → 1.02)
- **Ghost button hover** (outlined, no fill):
  - Border color brighten or text color intensify
  - Fill background with subtle accent
  - Duration: 0.3s
- **Icon button hover**:
  - Rotate, scale, or color shift
  - Portfolio example: Life pill uses background color shift on hover

---

### EDITORIAL & UX DESIGN PRINCIPLES

**Color Strategy:**
- **Restricted palette** (3-5 colors max):
  - Primary: Black or dark grey (backgrounds, dominant text)
  - Secondary: White or light grey (contrast text, secondary elements)
  - Neutral: Mid-tone grey (borders, subtle elements)
  - Accent: Single color (interactions, highlights, CTAs) — Use sparingly
  - Optional: One secondary accent for error/success/warning states
- **High contrast enforcement**: Text > 4.5:1 WCAG AA compliance minimum
- **Accent usage**: Interactive states ONLY (hover, focus, active, selected)
- **Example**: Portfolio uses black/white/grey + red accent exclusively

**Typography as Visual Hierarchy:**
- **Single primary typeface** (1-2 weights for most projects)
  - Geometric sans-serif preferred (Inter, PP Neue Montreal, Montserrat)
  - Weights: 400 (body), 600-700 (headings)
- **Optional secondary typeface** for editorial/display only
  - Serif or distinctive style used sparingly (10-20% of content)
  - Never for body copy
- **Size hierarchy**: Use scale relationships (1:1.2, 1:1.5, golden ratio)
  - Example: Body 16px, heading 20px, display 28px
- **Letter spacing**: Consistent tight tracking (0.03-0.05rem) creates premium feel
- **Line height**: Body 1.5-1.6, headlines 1.2-1.3 (readability vs. impact)

**Whitespace & Density:**
- **Generous margins** between major sections (3-5% of viewport height)
- **Breathing room around images** — Don't crop or crowd
- **Minimal visual chrome** — No borders unless functional (input fields, separators)
- **Rule**: If it's not functional, remove it (no decorative elements)
- **Content density**: ~60-70% visual weight, 30-40% whitespace (luxury feel)

**Visual Design Philosophy:**
- **Content-first approach**: Images, text, interaction. Minimal decoration.
- **Images as primary**: Use photography/illustration at hero scale, high impact
- **Desaturate by default, saturate on interact**:
  - Example: Grayscale (1) with contrast (0.8) at rest, full color on hover
  - Creates perception of "awakening" content on interaction
- **Subtle depth cues**:
  - Text shadows (no hard drop shadows)
  - Parallax on scroll (tight, purposeful)
  - Layering via z-index (hero sticky over content)

**Motion Design Philosophy:**
- **Every animation must serve purpose**: No pure decoration
  - Reveals content (expand, slide, fade, clipPath)
  - Signals interaction (hover feedback, loading states)
  - Guides visual flow (staggered reveals, parallax)
- **Motion duration tied to importance**:
  - Quick (0.3s) = micro-interactions, hover
  - Standard (0.6-1.2s) = section reveals, nav entry
  - Slow (1.5-2s+) = major transitions, modals
- **Easing matches content**: `power3.out` for reveals (natural), `none` for scroll-driven (mechanical)
- **Stagger creates visual rhythm**: Fast cascades feel premium, slow cascades feel cinematic

**Responsive & Accessibility:**
- **Mobile-first typography**: Use `rem` or `vw` with viewport-relative scaling
  - Desktop: 1vw base / Tablet: 2vw / Mobile: 3-4vw
- **Ensure touch targets**: Minimum 44x44px for buttons (mobile)
- **Content reflows gracefully**: No horizontal scrolling
- **Animation respects `prefers-reduced-motion`**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
  }
  ```
- **Color not sole information carrier**: Add icons, text labels, patterns

**UX Patterns to Adopt:**
- **Sticky nav**: Persistent, always accessible for navigation
- **Hero section**: Full viewport, immediate impact, establishes brand/intent
- **Scroll-driven parallax**: Adds perceived depth without heavy animation
- **Progressive disclosure**: Hide complex content until needed (modals, accordions)
- **Clear CTAs**: High contrast, obvious interactive states, unambiguous purpose
- **Loading states**: Spinner or skeleton screen during async operations
- **Feedback loops**: Button press → visual change → action confirm

**Design Checklist Before Launch:**
- [ ] Color contrast: 4.5:1 minimum for body text
- [ ] Typography: Consistent hierarchy, 1-2 primary weights max
- [ ] Motion: All animations serve purpose, <2s standard duration
- [ ] Whitespace: 30-40% empty space, breathing room
- [ ] Mobile: Responsive fonts, touch-friendly buttons, no horizontal scroll
- [ ] Accessibility: Works with keyboard, respects `prefers-reduced-motion`
- [ ] Performance: Critical animations 60fps (no layout thrashing)

---

## Components & Architecture

### File Structure
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

---

## Commands

```bash
npm run dev    # local dev server (may use port 3002 if 3000 taken)
npm run build  # production build (verify before deploying)
```
