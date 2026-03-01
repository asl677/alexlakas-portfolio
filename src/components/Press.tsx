"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const pressItems = [
  {
    text: "514 raises $17M",
    href: "https://www.phocuswire.com/insured-nomads-buys-travel-shopping-chrome-app-peanut",
  },
  {
    text: "Insured Nomads acquires Peanut",
    href: "https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension",
  },
  {
    text: "Do I need a covid test to travel on Forbes",
    href: "https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/",
  },
  {
    text: "LinkedIn adds polls and live video",
    href: "https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/",
  },
  {
    text: "Live Popular Times on The Tonight Show",
    href: "https://www.youtube.com/watch?v=QIbPZgH1zRY",
  },
  {
    text: "Google can tell you how busy places are",
    href: "https://techcrunch.com/2016/11/21/google-can-now-tell-you-how-busy-a-place-is-before-you-arrive-in-real-time/",
  },
  {
    text: "Google to add restaurant wait times",
    href: "https://techcrunch.com/2017/11/07/google-to-add-restaurant-wait-times-to-google-search-and-maps-followed-by-grocery-stores/",
  },
  {
    text: "Google adds bookings and salons to maps",
    href: "https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/",
  },
];

function SplitLink({ text, href }: { text: string; href: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Scope chars to this specific link's ref array
    const chars = charsRef.current.filter((c): c is HTMLSpanElement => c !== null);
    if (!chars.length) return;

    gsap.set(chars, { willChange: "transform" });

    const el = linkRef.current;
    if (!el) return;

    const onEnter = () => {
      gsap.to(chars, {
        y: "-1.2em",
        duration: 0.7,
        stagger: 0.005,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(chars, {
        y: 0,
        duration: 0.5,
        stagger: 0.006,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    // Original: .link.enabled.clean  — NO .link-strip inside
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link enabled clean"
      style={{ textShadow: "0 2.5vw currentColor" }}
    >
      <p className="base wagon">
        {text.split("").map((char, i) => (
          <span
            key={i}
            ref={(el) => { charsRef.current[i] = el; }}
            style={{ display: "inline-block", willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </p>
      {/* No .link-strip here — original press items don't have it */}
    </a>
  );
}

export default function Press() {
  return (
    <section className="press-section">
      <div className="press-features">
        {pressItems.map((item) => (
          <SplitLink key={item.text} text={item.text} href={item.href} />
        ))}
      </div>
    </section>
  );
}
