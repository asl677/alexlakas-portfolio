import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "./overrides.css";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const enableGoogleAnalytics =
  process.env.VERCEL_ENV === "production" &&
  /^G-[A-Z0-9]+$/.test(gaMeasurementId ?? "");

export const metadata: Metadata = {
  metadataBase: new URL("https://alexlakas.com"),
  title: "Alex | Designer",
  description: "Alex Lakas, Los Angeles-based designer and art director. Product design, identity, systems, and creative work.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Alex | Designer",
    description: "Alex Lakas, Los Angeles-based designer and art director. Product design, identity, systems, and creative work.",
    url: "https://alexlakas.com",
    siteName: "Alex | Designer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alex | Designer",
    description: "Alex Lakas, Los Angeles-based designer and art director. Product design, identity, systems, and creative work.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            // Creates the single theme-color tag Safari uses to tint its toolbars. Created here (not in
            // JSX) so React hydration never duplicates it with a stale value.
            __html: `(() => { try { const phone = matchMedia('(max-width: 35rem)').matches; const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches; localStorage.removeItem('alexpedia-theme'); const saved = phone ? null : sessionStorage.getItem('alexpedia-theme'); const dark = saved ? saved === 'dark' : prefersDark; const theme = dark ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; let meta = document.querySelector('meta[name="theme-color"]'); if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); } meta.content = dark ? '#000000' : '#ffffff'; } catch {} })();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            // Loader counter from first paint: counts scripts, styles, images and video as they
            // finish, so the number reflects real loading. The client bundle takes over once hydrated.
            __html: `(() => { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; const done = new Set(); const finished = el => { const url = el.currentSrc || el.src || el.href; if (el.tagName === 'VIDEO') return el.readyState >= 2; if (el.tagName === 'IMG' && el.complete) return true; return !!url && performance.getEntriesByName(url).length > 0; }; let shown = 0; const tick = () => { const items = document.querySelectorAll('script[src]:not([nomodule]), link[rel="stylesheet"], img, video'); items.forEach(el => { if (!done.has(el) && finished(el)) done.add(el); }); const ready = document.readyState === 'complete' ? 1 : 0; const progress = ready ? 100 : Math.min(99, ((done.size + ready) / (items.length + 1)) * 100); window.__wikiProgress = progress; const counter = document.querySelector('.wiki-loader-counter'); const wordmark = document.querySelector('.wiki-wordmark-text'); if (counter && wordmark && counter.style.visibility !== 'visible') { const type = getComputedStyle(wordmark); const box = wordmark.getBoundingClientRect(); const frame = counter.parentElement.getBoundingClientRect(); counter.style.font = type.font; counter.style.letterSpacing = type.letterSpacing; counter.style.color = type.color; counter.style.left = (box.left - frame.left) + 'px'; counter.style.top = (box.top - frame.top) + 'px'; counter.style.height = box.height + 'px'; counter.style.visibility = 'visible'; requestAnimationFrame(() => { counter.style.opacity = '1'; }); } const now = performance.now(); const w = window; w.__wikiText = w.__wikiText ?? ''; w.__wikiOps = w.__wikiOps || []; w.__wikiMilestone = w.__wikiMilestone ?? 0; const milestones = ['Loading', 'Loading', 'Designer']; const jitter = (min, max) => { w.__wikiSeed = ((w.__wikiSeed || 7) * 9301 + 49297) % 233280; return min + (w.__wikiSeed / 233280) * (max - min); }; if (!w.__wikiOps.length && w.__wikiMilestone < milestones.length) { const next = milestones[w.__wikiMilestone]; const gate = next === 'Loading' ? 0 : 100; if (progress >= gate) { const old = w.__wikiText; const text = next; w.__wikiOps.push(['wait', w.__wikiMilestone === 0 ? jitter(180, 240) : jitter(260, 330)]); for (let i = old.length; i > 0; i--) w.__wikiOps.push(['del', i === old.length ? 0 : i === old.length - 1 ? jitter(160, 200) : jitter(45, 60)]); w.__wikiOps.push(['wait', jitter(60, 90)]); const pauseAfter = text === 'Loading' ? 4 : text === 'Designer' ? 3 : -1; const fast = text === 'Designer'; [...text].forEach((ch, i) => w.__wikiOps.push(['add', (fast ? jitter(80, 130) : jitter(110, 190)) + (i === pauseAfter ? (fast ? jitter(75, 130) : jitter(130, 230)) : 0), ch])); w.__wikiMilestone += 1; w.__wikiNextAt = now + w.__wikiOps[0][1]; } } if (w.__wikiOps.length && now >= (w.__wikiNextAt || 0)) { const op = w.__wikiOps.shift(); if (op[0] === 'del') w.__wikiText = w.__wikiText.slice(0, -1); if (op[0] === 'add') w.__wikiText += op[2]; const nextOp = w.__wikiOps[0]; w.__wikiNextAt = now + (nextOp ? nextOp[1] : 0); if (counter) counter.textContent = w.__wikiText; } w.__wikiDone = w.__wikiMilestone >= milestones.length && !w.__wikiOps.length && w.__wikiText === 'Designer'; if (!w.__wikiDone) requestAnimationFrame(tick); }; requestAnimationFrame(tick); })();`,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        {enableGoogleAnalytics && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
