"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoaderProps {
  onHide?: () => void;
}

export default function Loader({ onHide }: LoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const hide = () => {
      gsap.to(el, {
        opacity: 0,
        duration: 0.7,
        delay: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          el.style.display = "none";
          onHide?.();
        },
      });
    };

    // Hide on window.load, with a 3s fallback in case a resource stalls
    let triggered = false;
    const trigger = () => { if (!triggered) { triggered = true; hide(); } };
    const timer = setTimeout(trigger, 3000);

    if (document.readyState === "complete") {
      clearTimeout(timer);
      trigger();
    } else {
      window.addEventListener("load", trigger, { once: true });
    }

    return () => {
      triggered = true; // prevent any pending call
      clearTimeout(timer);
      window.removeEventListener("load", trigger);
    };
  }, [onHide]);

  return (
    <div ref={loaderRef} className="loader-wrap">
      <div className="cube-wrapper">
        <div className="cube">
          <div className="top" />
          <div className="right" />
          <div className="bottom" />
          <div className="left" />
          <div className="front" />
          <div className="back" />
        </div>
      </div>
    </div>
  );
}
