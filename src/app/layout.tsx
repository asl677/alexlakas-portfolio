import type { Metadata } from "next";
import {
  Inconsolata,
  Inter,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alex Lakas — Product Designer",
  description:
    "Product Designer based in Los Angeles. Art Direction, Product Design, Prototyping, Systems Design, Identity, Gen AI.",
  openGraph: {
    title: "Alex Lakas — Product Designer",
    description:
      "Product Designer based in Los Angeles. Art Direction, Product Design, Prototyping, Systems Design, Identity, Gen AI.",
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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${inconsolata.variable} ${spaceGrotesk.variable} ${spaceMono.variable} bg-black text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
