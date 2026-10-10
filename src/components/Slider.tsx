"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
const LOOP_SPEED_PX_PER_SECOND = 55;

export default function Slider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const setExpandedState = useCallback((next: boolean) => {
    if (next) {
      document.body.dataset.marqueeExpanded = "true";
    } else {
      delete document.body.dataset.marqueeExpanded;
    }
    setExpanded(next);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const close = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setExpandedState(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedState(false);
    };
    document.addEventListener("click", close, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      delete document.body.dataset.marqueeExpanded;
      document.removeEventListener("click", close, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, setExpandedState]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let tween: gsap.core.Tween | null = null;

    const startLoop = async () => {
      const trackImages = Array.from(track.querySelectorAll("img"));
      await Promise.all(
        trackImages.map((image) => {
          if (image.complete && image.naturalWidth) return Promise.resolve();
          return new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        })
      );

      const firstImage = trackImages[0];
      const duplicateFirstImage = trackImages[images.length];
      const duplicateStart =
        duplicateFirstImage.getBoundingClientRect().left -
        firstImage.getBoundingClientRect().left;
      if (!duplicateStart) return;

      gsap.set(track, { x: -duplicateStart, autoAlpha: 1 });
      tween = gsap.to(track, {
        x: `+=${duplicateStart}`,
        duration: duplicateStart / LOOP_SPEED_PX_PER_SECOND,
        ease: "none",
        repeat: -1,
        force3D: true,
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
      <div className="slider-wrap" role="button" tabIndex={0}
        aria-label="Enlarge image carousel" aria-expanded={expanded}
        onClick={() => setExpandedState(!expanded)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpandedState(!expanded);
          }
        }}>
        <div className="slider-inner">
          <div className="slider-track" ref={trackRef} style={{ visibility: "hidden" }}>
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
