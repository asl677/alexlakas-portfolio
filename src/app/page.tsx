"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Loader from "@/components/Loader";
import LenisInit from "@/components/LenisInit";
import NavLeft from "@/components/NavLeft";
import NavRight from "@/components/NavRight";
import MarqueeTop from "@/components/MarqueeTop";
import Slider from "@/components/Slider";
import Press from "@/components/Press";
import BioSheet from "@/components/BioSheet";

export default function Home() {
  const [bioOpen, setBioOpen] = useState(false);
  const doorTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Called by Loader once it fades out
  const revealAll = useCallback(() => {
    gsap.set(".nav-left, .nav-right", { opacity: 1 });
    gsap.set(".nav-left .base, .nav-right .base", { x: -30, opacity: 0 });
    gsap.set(".nav-life", { y: 0, opacity: 0 });
    gsap.set(".link .link-strip", { xPercent: -110 });
    gsap.set(".slider-wrap", { opacity:0, clipPath: "inset(50% 50% 50% 0%)" });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".upper-wrap", { opacity: 1, duration: 0.6 }, 0);

    // Strip sweeps left→right
    tl.to(".link .link-strip", {
      xPercent: 110,
      duration: 1,
      ease: "power3.out",
      stagger: 0.08,
    }, 0.5);

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

    // Park strips off-screen right after intro
    tl.call(() => {
      gsap.set(".link .link-strip", { xPercent: 110 });
    }, [], ">");

    // Hook up hover — enters from LEFT, exits to RIGHT
    tl.call(() => {
      const links = document.querySelectorAll<HTMLElement>(".link.enabled");
      links.forEach((link) => {
        const strip = link.querySelector(".link-strip");
        if (!strip) return;
        link.addEventListener("mouseenter", () => {
          gsap.fromTo(strip,
            { xPercent: -110 },
            { xPercent: 0, duration: 0.35, ease: "power2.out" }
          );
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(strip, { xPercent: 110, duration: 0.35, ease: "power2.in" });
        });
      });
    }, [], ">");
  }, []);

  // Press features: Parallax on the text while container flows naturally
  useEffect(() => {
    const tween = gsap.fromTo(".press-features", 
      { y: "-10vw" },
      {
        y: "30vw",
        ease: "none",
        scrollTrigger: {
          trigger: ".press-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 0,
        },
      }
    );
    
    return () => {
      tween.scrollTrigger?.kill();
      gsap.set(".press-features", { y: "0vw" });
    };
  }, []);

  const handleLifeClick = () => {
    if (!bioOpen) {
      // Create timeline on first open
      if (!doorTimelineRef.current) {
        const tl = gsap.timeline({ paused: true });

        // Black fade in IMMEDIATELY
        tl.to(".sheet-inner", {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0,
        }, 0);

        // Door swings open (2s matching Webflow)
        tl.to(".upper-wrap", {
          transformPerspective: 0.05,
          rotationY: 0.25,
          width: "50vw",
          duration: 2,
          ease: "power3.inOut",
        }, 0);

        // Slider counter-rotates and shifts left to stay centered
        tl.to(".slider-section", {
          rotationY: -0.25,
          x: "-25vw",
          duration: 2,
          ease: "power3.inOut",
        }, 0);

        doorTimelineRef.current = tl;
      }

      // Play forward
      doorTimelineRef.current.play();
      setBioOpen(true);
    } else {
      // Reverse the timeline
      doorTimelineRef.current?.reverse();
      setBioOpen(false);
    }
  };

  return (
    <>
      <LenisInit />
      <Loader onHide={revealAll} />

      <BioSheet active={bioOpen} onClose={handleLifeClick} />

      <div className="body-wrapper">
        <div className="upper-wrap">
          {/* Marquee lives inside upper-wrap: rotates with door, scrolls with section */}
          <MarqueeTop />
          <NavLeft />
          <NavRight onLifeClick={handleLifeClick} />
          <Slider />
        </div>
        <Press />
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
