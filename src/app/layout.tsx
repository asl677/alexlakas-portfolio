import type { Metadata, Viewport } from "next";
import { Inconsolata } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import ThemeSwitch from "@/components/ThemeSwitch";

// Inconsolata: used for bio text (.base.white) and marquee
const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alexlakas.com"),
  title: "Alex Lakas (Designer)",
  description: "Art Direction, Product Design, Mentorship",
  icons: {
    icon: [
      { url: "/me.png", type: "image/png", sizes: "1254x1254" },
    ],
    shortcut: "/me.png",
    apple: [
      { url: "/me.png", type: "image/png", sizes: "1254x1254" },
    ],
  },
  openGraph: {
    title: "Alex Lakas (Designer)",
    description: "Art Direction, Product Design, Mentorship",
    url: "https://alexlakas.com",
    siteName: "Alex Lakas",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alex Lakas - Designer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@axlakas",
    images: ["/og-image.png"],
    title: "Alex Lakas (Designer)",
    description: "Art Direction, Product Design, Mentorship",
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
        <meta id="theme-color" name="theme-color" content="#000000" />
        <script dangerouslySetInnerHTML={{ __html: `(()=>{let theme;try{theme=localStorage.getItem('portfolio-theme')}catch{}theme=theme==='light'||theme==='dark'?theme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=theme;document.getElementById('theme-color')?.setAttribute('content',theme==='dark'?'#000000':'#f5f5f5')})()` }} />
      </head>
      <body className={`${inconsolata.variable}`}>
        {children}
        <ThemeSwitch />
        <Analytics />
      </body>
    </html>
  );
}
