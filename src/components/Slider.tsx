"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BASE = "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/";

const images = [
  BASE + "67bb5c12c57a2790a896d2fe_man-red.avif",
  BASE + "692926ba1daaa6bd1d904499_shot3.webp",
  BASE + "66aed54564c490241089592d_hand.webp",
  BASE + "665554b2f2ee046740dbbd4f_syd-cover.jpeg",
  BASE + "64b4879631dc2962b56bc075_hatch-loop.gif",
  BASE + "648e113182964bd201887b14_alex-lakas-pCibATCkQxo-unsplash%20(3).webp",
  BASE + "67700bb77f4bfa58786b7569_02%202.webp",
  BASE + "65c99f3f74651f26dc44e777_0225.webp",
  BASE + "691d4a10a400d63fe056ed9f_220.avif",
  BASE + "681309f43c2b0e7da6163320_logo.png",
  BASE + "6923c262e55615c1cf95c200_phonespin.gif",
  BASE + "6813096813d071d057e17cab_man-stars.jpg",
  BASE + "651d9b32904012a586063cc3_polls577_4x.webp",
  BASE + "665565a0acb1cccd12cf8ab0_macbook-book.webp",
  BASE + "691d4816ea87196a56f06bd6_01.webp",
];

const looped = [...images, ...images];

export default function Slider() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let tween: gsap.core.Tween | null = null;

    const startLoop = () => {
      const halfWidth = track.scrollWidth / 2;
      if (!halfWidth) return;

      // Start at the midpoint (second set), animate back to 0 = rightward movement
      gsap.set(track, { x: -halfWidth });

      tween = gsap.to(track, {
        x: 0,
        duration: 50,
        ease: "none",
        repeat: -1,
      });
    };

    if (document.readyState === "complete") {
      startLoop();
    } else {
      window.addEventListener("load", startLoop, { once: true });
    }

    return () => {
      window.removeEventListener("load", startLoop);
      tween?.kill();
    };
  }, []);

  return (
    <div className="slider-section">
      <div className="slider-wrap">
        <div className="slider-inner">
          <div className="slider-track" ref={trackRef}>
            {looped.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className="img-slider"
                loading="eager"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}