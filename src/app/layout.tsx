import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Inconsolata: used for bio text (.base.white) and marquee
const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alex Lakas (Designer)",
  description: "Art Direction, Product Design, Mentorship",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Alex Lakas (Designer)",
    description: "Art Direction, Product Design, Mentorship",
    url: "https://alexlakas.com",
    siteName: "Alex Lakas",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@axlakas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inconsolata.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
