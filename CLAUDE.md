# Alex Lakas Portfolio - Development Notes

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
