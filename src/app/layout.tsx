import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "A story that must be told",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
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
            __html: `(() => { try { const saved = localStorage.getItem('alexpedia-theme'); const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; const theme = dark ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; } catch {} })();`,
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
