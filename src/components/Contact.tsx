"use client";

import { useRef } from "react";

export default function Contact() {
  const emailRef = useRef<HTMLAnchorElement>(null);

  return (
    <section id="contact" className="px-6 py-32 max-w-5xl mx-auto">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          004
        </span>
        <span className="block flex-1 h-px bg-white/10" />
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          Contact
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div>
          <h2 className="text-[clamp(36px,6vw,80px)] font-space-grotesk font-bold leading-[0.95] tracking-tighter mb-6">
            <span className="block text-white">Let&apos;s make</span>
            <span className="block text-white/20 italic font-wagon">
              something great
            </span>
          </h2>
          <p className="text-sm font-space-mono text-white/30 max-w-sm">
            Open to select freelance projects, collaborations, and full-time
            opportunities. Based in Los Angeles.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a
            ref={emailRef}
            href="mailto:alex.lakas@gmail.com"
            className="group inline-flex items-center gap-3 border border-white/20 rounded-full px-8 py-4 text-sm font-space-mono tracking-widest uppercase hover:bg-[#ff1111] hover:border-[#ff1111] hover:text-black transition-all duration-300"
          >
            <span>Say Hello</span>
            <span className="group-hover:text-black text-[#ff1111] transition-colors">
              →
            </span>
          </a>

          <div className="flex items-center gap-4 justify-center">
            <a
              href="https://linkedin.com/in/latenights/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-space-mono text-white/30 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://dribbble.com/alex2pt0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-space-mono text-white/30 hover:text-white transition-colors"
            >
              Dribbble
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://medium.com/@alexslakas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-space-mono text-white/30 hover:text-white transition-colors"
            >
              Medium
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://twitter.com/axlakas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-space-mono text-white/30 hover:text-white transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
