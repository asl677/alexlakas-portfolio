"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

interface BioSheetProps {
  active: boolean;
  onClose: () => void;
}

const bioText = "Starting in illustration, animation, web dev, and interactive design before moving into Bay Area tech. Early work included social games and commerce for brands and etailers. In 2013, I joined Google, merging Google+ and Maps to form the first SMB ecosystem, spanning domestic and emerging markets. I've collaborated with world-class teams and agency partners like Method and UENO, modernized Local Search at Google, and led Content Experience at LinkedIn with products like the home feed, Polls, Live Popular Times, and Bookings. Recognized for strong storytelling and humor. Let's go.";

export default function BioSheet({ active, onClose }: BioSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const splitRef = useRef<any>(null);
  const bioTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Create/update SplitText and timeline on mount or text changes
  useEffect(() => {
    if (!textRef.current) return;

    if (splitRef.current) splitRef.current.revert();
    splitRef.current = new SplitText(textRef.current, { type: "lines" });

    // Wrap each line in overflow: hidden for masked reveal
    splitRef.current.lines.forEach((line: HTMLElement) => {
      const wrapper = document.createElement("div");
      wrapper.style.display = "block";
      wrapper.style.overflow = "hidden";
      line.parentNode?.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Kill old timeline if exists
    if (bioTimelineRef.current) bioTimelineRef.current.kill();

    // Create timeline once with paused: true
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      splitRef.current.lines,
      { y: "5vw", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: { each: 0.15, from: "end" },
        ease: "power3.out",
      },
      0.8
    );
    
    bioTimelineRef.current = tl;
  }, []);

  // Play/reverse timeline based on active state
  useEffect(() => {
    if (!bioTimelineRef.current) return;
    
    if (active) {
      bioTimelineRef.current.play();
    } else {
      bioTimelineRef.current.reverse();
    }
  }, [active]);

  // Handle resize: recreate SplitText to preserve line breaks
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (splitRef.current && textRef.current) {
          splitRef.current.revert();
          splitRef.current = new SplitText(textRef.current, { type: "lines" });
          
          // Wrap each line in overflow: hidden container for masked reveal
          splitRef.current.lines.forEach((line: HTMLElement) => {
            const wrapper = document.createElement("div");
            wrapper.style.display = "block";
            wrapper.style.overflow = "hidden";
            line.parentNode?.insertBefore(wrapper, line);
            wrapper.appendChild(line);
          });
          
          // Recreate timeline with new lines
          if (bioTimelineRef.current) {
            bioTimelineRef.current.kill();
          }
          
          const tl = gsap.timeline({ paused: true });
          tl.fromTo(
            splitRef.current.lines,
            { y: "5vw", opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 0.8,
              stagger: { each: 0.15, from: "end" },
              ease: "power3.out",
            },
            0
          );
          
          bioTimelineRef.current = tl;
          
          if (active) {
            bioTimelineRef.current.play();
          }
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [active]);

  useEffect(() => {
    return () => {
      if (splitRef.current) splitRef.current.revert();
    };
  }, []);

  return (
    <div ref={sheetRef} className="sheet-inner" onClick={onClose}>
      <p ref={textRef} className="base white" style={{ gridColumn: "2" }}>
        {bioText}
      </p>
    </div>
  );
}
