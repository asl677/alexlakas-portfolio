# Alex Lakas Portfolio

High-performance, premium portfolio website built with Next.js 15, TypeScript, Tailwind CSS, GSAP 3, and Lenis smooth scrolling.

**Live**: https://alexlakas.vercel.app
**Prod**: https://alexlakas.com

## Quick Start

```bash
npm install
npm run dev        # localhost:3000 (or 3002 if 3000 is taken)
npm run build      # production build
```

## Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS
- **Animation**: GSAP 3 (ScrollTrigger, SplitText, Lenis)
- **Smooth Scroll**: Lenis 1.1.20
- **Font**: PP Neue Montreal (custom @font-face), Inconsolata (Google Fonts)

## Project Structure

- `src/app/` — Next.js app directory (page, layout, globals.css)
- `src/components/` — Reusable components (Nav, Slider, Bio, Press, Marquee)
- `public/` — Static assets (images, fonts)

## Development

See `CLAUDE.md` for:
- Font system & typography rules
- Architecture patterns (door animation, marquee, slider, cursor)
- Design system guidelines (color, motion, interaction, editorial)
- Component documentation
- Key learnings & best practices

## Deployment

Deployed on Vercel. Push to `main` branch to auto-deploy.
