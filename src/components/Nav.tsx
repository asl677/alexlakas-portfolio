"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const links = [
  { label: "Dribbble", href: "https://dribbble.com/alex2pt0", external: true },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/latenights/",
    external: true,
  },
  { label: "Cases", href: "#work", external: false },
  { label: "Los Angeles", href: "#", external: false },
];

function SplitLink({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external: boolean;
}) {
  const chars = label.split("");
  const content = (
    <span className="split-link text-xs font-space-mono tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity duration-200">
      {chars.map((c, i) => (
        <span
          key={i}
          className="char"
          style={{ transitionDelay: `${i * 15}ms` }}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <Link href={href}>{content}</Link>;
}

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      const y = window.scrollY;
      if (y > lastY && y > 80) {
        nav.style.transform = "translateY(-100%)";
      } else {
        nav.style.transform = "translateY(0)";
      }
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 transition-transform duration-300"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
    >
      <Link
        href="/"
        className="text-sm font-space-grotesk font-medium tracking-tight hover:text-[#ff1111] transition-colors duration-200"
      >
        Alex Lakas
      </Link>

      <ul className="flex items-center gap-6">
        {links.map((l) => (
          <li key={l.label}>
            <SplitLink {...l} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
