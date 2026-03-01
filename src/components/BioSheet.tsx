"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BioSheetProps {
  active: boolean;
  onClose: () => void;
}

const bioLines = [
  "Starting in illustration, animation, web dev, and interactive design before moving into Bay Area tech.",
  "Early work included social games and commerce for brands and etailers. I like grids and simplicity.",
  "In 2013, I joined Google, merging Google+ and Maps to form the first SMB ecosystem, spanning domestic and emerging markets. I've collaborated with world-class teams and agency partners like Method and UENO, modernized Local Search at Google, and led Content Experience at LinkedIn with products like the home feed, Polls, Live Popular Times, and Bookings, recognized for strong storytelling and humor. Let\u2019s go.",
];

export default function BioSheet({ active, onClose }: BioSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (active) {
      // Lines stagger in from below elegantly — last line first (from: "end")
      gsap.fromTo(
        linesRef.current,
        { y: "2vw", opacity: 0, rotation: 0 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 1,
          delay: 0.8,
          stagger: { each: 0.15, from: "end" },
          ease: "power3.out",
        }
      );
    } else {
      gsap.to(linesRef.current, {
        y: "2vw",
        opacity: 0,
        delay: 0.1,
        duration: 0.8,
        ease: "power3.in",
      });
    }
  }, [active]);

  return (
    <div ref={sheetRef} className="sheet-inner" onClick={onClose}>
      <p className="base white" style={{ gridColumn: "2" }}>
        {bioLines.map((line, i) => (
          // Outer span clips overflow — creates masked reveal (lines slide in from below)
          <span key={i} style={{ display: "block", overflow: "hidden" }}>
            <span
              ref={(el) => { if (el) linesRef.current[i] = el; }}
              style={{ display: "block" }}
            >
              {line}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
