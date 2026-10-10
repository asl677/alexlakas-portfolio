"use client";

import { useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Loader from "@/components/Loader";
import LenisInit from "@/components/LenisInit";
import NavLeft from "@/components/NavLeft";
import NavRight from "@/components/NavRight";
import MarqueeTop from "@/components/MarqueeTop";
import Slider from "@/components/Slider";
import BioSheet from "@/components/BioSheet";

export default function Home() {
  const [bioOpen, setBioOpen] = useState(false);

  // Called by Loader once it fades out
  const revealAll = useCallback(() => {
    gsap.set(".nav-left, .nav-right", { opacity: 1 });
    gsap.set(".slider-wrap", { opacity:0, clipPath: "inset(50% 50% 50% 0%)" });

    // Measure link widths BEFORE applying transforms - strips will inherit these widths
    const links = document.querySelectorAll<HTMLElement>(
      ".upper-wrap .link, .nav-life .link"
    );
    const stripData: Array<{ strip: HTMLElement, width: number }> = [];
    
    links.forEach((link) => {
      const strip = link.querySelector<HTMLElement>(".link-strip");
      if (strip) {
        // Link is inline-block so it sizes to its text content
        const linkWidth = link.getBoundingClientRect().width;
        // Strip inherits width from link via CSS width: 100%
        stripData.push({ strip, width: linkWidth });
        gsap.set(strip, { x: -linkWidth });
      }
    });

    // NOW apply text transforms
    gsap.set(".nav-left .base, .nav-right .base", { x: -30, opacity: 0 });
    gsap.set(".nav-life", { y: 0, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".upper-wrap", { opacity: 1, duration: 0.6 }, 0);

    // Strip sweeps left→right using stored widths
    stripData.forEach((data, i) => {
      tl.to(data.strip, {
        x: data.width + 5, // Add 5px buffer to fully hide
        duration: 1,
        ease: "power3.out",
      }, 0.5 + (i * 0.08));
    });

    // Nav text slides in from left
    tl.to(".nav-left .base, .nav-right .base", {
      x: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 0.4,
    }, 0.7);

    tl.to(".nav-life", { y: 0, opacity: 1, duration: 0.5 }, 0.8);
    tl.to(".marquee-fixed", { opacity: 1, duration: 0.4 }, 0.8);

    // Reveal from center outward
    tl.to(".slider-wrap", {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.5,
      ease: "power3.inOut",
    }, 0.8);

    // Park strips off-screen right after intro using stored widths
    tl.call(() => {
      stripData.forEach((data) => {
        gsap.set(data.strip, { x: data.width + 5 }); // Add 5px buffer to fully hide
      });
    }, [], ">");

    // Hook up hover — enters from LEFT, exits to RIGHT
    tl.call(() => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const links = document.querySelectorAll<HTMLElement>(
        ".upper-wrap .link.enabled, .nav-life .link.enabled"
      );
      links.forEach((link) => {
        const strip = link.querySelector<HTMLElement>(".link-strip");
        if (!strip) return;
        
        // Get link width (strip inherits this via CSS)
        const linkWidth = link.getBoundingClientRect().width;
        
        link.addEventListener("mouseenter", () => {
          gsap.fromTo(strip,
            { x: -linkWidth },
            { x: 0, duration: 0.35, ease: "power2.out" }
          );
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(strip, { x: linkWidth + 5, duration: 0.35, ease: "power2.in" }); // Add 5px buffer
        });
      });
    }, [], ">");
  }, []);

  // Keep hover strips sized to their links after resizing.
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Recalculate link widths and reset strip positions
        const links = document.querySelectorAll<HTMLElement>(
          ".upper-wrap .link, .nav-life .link"
        );
        links.forEach((link) => {
          const strip = link.querySelector<HTMLElement>(".link-strip");
          if (strip) {
            const newWidth = link.getBoundingClientRect().width;
            gsap.set(strip, { x: newWidth + 5 }); // Park off-screen right
          }
        });
      }, 250);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const handleLifeClick = () => {
    setBioOpen((open) => !open);
  };

  return (
    <>
      <LenisInit />
      <Loader onHide={revealAll} />

      <BioSheet active={bioOpen} onClose={() => setBioOpen(false)} />

      <div className="body-wrapper" data-vaul-drawer-wrapper>
        <div className="upper-wrap">
          {/* Marquee lives inside upper-wrap: rotates with door, scrolls with section */}
          <MarqueeTop />
          <NavLeft />
          <NavRight onLifeClick={handleLifeClick} />
          <Slider />
        </div>
      </div>

      {/* Life button outside upper-wrap: always visible, not affected by door rotation */}
      <div className="nav-life">
        <button onClick={handleLifeClick} className="link enabled life-pill">
          <p className="base">Life</p>
          <div className="link-strip" />
        </button>
      </div>
    </>
  );
}
