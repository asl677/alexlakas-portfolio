"use client";

import { useEffect, useRef } from "react";

function Cube() {
  return (
    <div className="scene">
      <div className="cube">
        <div className="cube__face cube__face--front">AL</div>
        <div className="cube__face cube__face--back">PD</div>
        <div className="cube__face cube__face--right">LA</div>
        <div className="cube__face cube__face--left">514</div>
        <div className="cube__face cube__face--top">UX</div>
        <div className="cube__face cube__face--bottom">AI</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const handleEnter = () => {
      el.style.backgroundColor = "#ff1111";
      el.style.color = "#000";
    };
    const handleLeave = () => {
      el.style.backgroundColor = "transparent";
      el.style.color = "#fff";
    };
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end pb-16 px-6 overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top-right cube */}
      <div className="absolute top-24 right-6 opacity-50">
        <Cube />
      </div>

      {/* Main hero content */}
      <div className="relative z-10 max-w-5xl">
        {/* Status badge */}
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 text-xs font-space-mono text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff1111] animate-pulse" />
            Available for select projects
          </span>
        </div>

        {/* Giant headline */}
        <h1 className="text-[clamp(56px,10vw,140px)] leading-[0.9] font-space-grotesk font-bold tracking-tighter mb-8">
          <span className="block text-white">Product</span>
          <span className="block text-white/20 italic font-wagon">
            Designer
          </span>
        </h1>

        {/* Sub line */}
        <p className="text-sm font-space-mono text-white/40 mb-12 tracking-wider uppercase">
          Los Angeles &nbsp;/&nbsp; Art Direction &nbsp;/&nbsp; Systems
          &nbsp;/&nbsp; Gen AI
        </p>

        {/* CTA */}
        <a
          ref={ctaRef}
          href="mailto:alex.lakas@gmail.com"
          className="inline-flex items-center gap-3 border border-white/20 rounded-full px-8 py-4 text-sm font-space-mono tracking-widest uppercase transition-all duration-300"
          style={{ backgroundColor: "transparent", color: "#fff" }}
        >
          <span>Let&apos;s Go</span>
          <span className="text-[#ff1111]">→</span>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-6 flex items-center gap-2 text-white/20 text-xs font-space-mono">
        <span>scroll</span>
        <span className="block w-8 h-px bg-white/20" />
      </div>
    </section>
  );
}
