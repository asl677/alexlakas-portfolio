"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Drawer } from "vaul";
gsap.registerPlugin(SplitText, ScrollTrigger);

interface BioSheetProps {
  active: boolean;
  onClose: () => void;
}

const bioText = "I like weird stuff that works. With East Coast roots in illustration, animation, and interactive design, I've built products at Google and LinkedIn. I've collabed with teams and agencies, small and large - like UENO, Povio and a handful of startups across emerging markets, industries and platforms - bringing a focus on storytelling, craft, and humor, heavily inspired by Swiss principles, motion design, and details.";

function BioSheetLink({
  href,
  children,
  external,
}: {
  href: string;
  children: string;
  external?: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const strip = stripRef.current;
    if (!strip) return;

    gsap.fromTo(
      strip,
      { x: 0, xPercent: -105 },
      { x: 0, xPercent: 0, duration: 0.9, ease: "power2.inOut", overwrite: true }
    );
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const strip = stripRef.current;
    if (!strip) return;

    gsap.to(strip, {
      x: 0,
      xPercent: 105,
      duration: 0.9,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    gsap.set(strip, { x: 0, xPercent: 105 });
  }, []);

  return (
    <a
      ref={linkRef}
      href={href}
      className="link enabled bio-sheet-link"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p className="base">{children}</p>
      <div ref={stripRef} className="link-strip" />
    </a>
  );
}

export default function BioSheet({ active, onClose }: BioSheetProps) {
  const [drawerOpen, setDrawerOpen] = useState(active);
  const [portalMounted, setPortalMounted] = useState(active);
  const sheetRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const bioTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const revealTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const openRevealFrameRef = useRef<number | null>(null);
  const openRevealStartRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTransitionCleanupRef = useRef<(() => void) | null>(null);

  const clearCloseTimer = () => {
    closeTransitionCleanupRef.current?.();
    closeTransitionCleanupRef.current = null;
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const schedulePortalUnmount = () => {
    if (closeTimerRef.current) return;

    const wrapper = document.querySelector<HTMLElement>(".body-wrapper");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      wrapper?.removeEventListener("transitionend", handleTransitionEnd);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
      closeTransitionCleanupRef.current = null;
      setPortalMounted(false);
    };
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === wrapper && event.propertyName === "transform") finish();
    };

    wrapper?.addEventListener("transitionend", handleTransitionEnd);
    closeTransitionCleanupRef.current = () =>
      wrapper?.removeEventListener("transitionend", handleTransitionEnd);
    closeTimerRef.current = setTimeout(finish, 1800);
  };

  const cancelOpenRevealSync = () => {
    if (openRevealFrameRef.current === null) return;
    window.cancelAnimationFrame(openRevealFrameRef.current);
    openRevealFrameRef.current = null;
  };

  const getSheetOpenProgress = () => {
    const sheet = sheetRef.current;
    if (!sheet) return 0;

    const transform = window.getComputedStyle(sheet).transform;
    const values = transform.match(/matrix(3d)?\((.+)\)/)?.[2]
      ?.split(",")
      .map((value) => Number.parseFloat(value.trim()));
    const translateY = values ? (values.length === 16 ? values[13] : values[5]) || 0 : 0;
    const height = Math.min(sheet.getBoundingClientRect().height || window.innerHeight, window.innerHeight);

    return gsap.utils.clamp(0, 1, 1 - translateY / Math.max(1, height));
  };

  const syncRevealWithSheetMotion = (target: "open" | "close") => {
    const timeline = bioTimelineRef.current;
    if (!timeline) return;

    revealTweenRef.current?.kill();
    const tick = () => {
      const rawProgress = getSheetOpenProgress();
      const elapsed = performance.now() - openRevealStartRef.current;
      const progress = elapsed < 80 && rawProgress > 0.98 ? 0 : rawProgress;
      timeline.progress(progress).pause();

      if ((target === "open" && progress >= 0.995) || (target === "close" && progress <= 0.005)) {
        timeline.progress(target === "open" ? 1 : 0).pause();
        openRevealFrameRef.current = null;
        return;
      }

      openRevealFrameRef.current = window.requestAnimationFrame(tick);
    };

    cancelOpenRevealSync();
    tick();
  };

  const animateRevealTo = (progress: number) => {
    const timeline = bioTimelineRef.current;
    if (!timeline) return;

    revealTweenRef.current?.kill();
    revealTweenRef.current = gsap.to(timeline, {
      progress: gsap.utils.clamp(0, 1, progress),
      duration: 1.4 * Math.abs(progress - timeline.progress()),
      ease: "none",
      overwrite: true,
      onUpdate: () => {
        if (progress === 0 && timeline.progress() <= 0.65) {
          setDrawerOpen(false);
          schedulePortalUnmount();
        }
      },
      onComplete: () => {
        if (progress === 0) {
          setDrawerOpen(false);
          schedulePortalUnmount();
        }
      },
    });
  };

  const animateRevealOut = () => {
    cancelOpenRevealSync();
    animateRevealTo(0);
  };

  const prepareBioReveal = () => {
    const text = textRef.current;
    if (!text) return null;

    revealTweenRef.current?.kill();
    bioTimelineRef.current?.kill();
    splitRef.current?.revert();
    splitRef.current = new SplitText(text, { type: "lines" });

    const lines = splitRef.current.lines as HTMLElement[];
    lines.forEach((line, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "bio-line-mask";
      line.classList.add("bio-split-line");
      line.classList.toggle("bio-split-line-first", index === 0);
      line.classList.toggle("bio-split-line-last", index === lines.length - 1);
      line.parentNode?.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    const links = Array.from(
      textScrollRef.current?.querySelectorAll<HTMLElement>(
        ".bio-mark, .bio-projects > .bio-project, .bio-sheet-links > .bio-sheet-link"
      ) ?? []
    );

    gsap.set(text, { autoAlpha: 1 });
    const tl = gsap.timeline({ paused: true });
    tl.set(lines, { y: 5, opacity: 0 });
    tl.set(links, { y: 5, opacity: 0 });
    tl.to(
      [...lines, ...links],
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: { amount: 0.45, from: "end" },
        ease: "power2.inOut",
      },
      0.2
    );

    bioTimelineRef.current = tl;
    tl.progress(0).pause();
    ScrollTrigger.refresh();
    return tl;
  };

  // Both directions traverse the same timeline at the same rate.
  useEffect(() => {
    if (active) {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      document.documentElement.dataset.sheetOpen = "true";
      document.body.dataset.sheetOpen = "true";
      document
        .querySelector<HTMLMetaElement>("meta[name='theme-color']")
        ?.setAttribute("content", theme === "dark" ? "#000000" : "#f5f5f5");
    }

    if (!active) {
      cancelOpenRevealSync();
      animateRevealOut();
      clearCloseTimer();
      return;
    }

    clearCloseTimer();
    setPortalMounted(true);
    setDrawerOpen(true);
    openRevealStartRef.current = performance.now();
    if (textRef.current) gsap.set(textRef.current, { autoAlpha: 0 });
    let attempts = 0;
    const prepareWhenMounted = () => {
      attempts += 1;
      if (prepareBioReveal()) {
        animateRevealTo(1);
        return;
      }

      if (attempts < 6) {
        openRevealFrameRef.current = window.requestAnimationFrame(prepareWhenMounted);
      }
    };

    openRevealFrameRef.current = window.requestAnimationFrame(prepareWhenMounted);
    return () => {
      cancelOpenRevealSync();
      clearCloseTimer();
    };
    // The reveal sync reads refs/live Vaul transform state; rerunning it on helper identity changes restarts the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (portalMounted) return;

    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    delete document.documentElement.dataset.sheetOpen;
    delete document.body.dataset.sheetOpen;
    document
      .querySelector<HTMLMetaElement>("meta[name='theme-color']")
      ?.setAttribute("content", theme === "dark" ? "#000000" : "#f5f5f5");
  }, [portalMounted]);

  useEffect(() => {
    const textWrap = textWrapRef.current;
    if (!textWrap) return;

    textWrap.style.setProperty("--bio-scroll-y", "0vw");
    textWrap.style.setProperty("--bio-scroll-opacity", "1");
  }, [active]);

  // Rebuild the live split lines after a resize while the sheet is open.
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (active && prepareBioReveal()) animateRevealTo(1);
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
    // Rebuilding only follows active-state changes; helper identities are intentionally live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    return () => {
      cancelOpenRevealSync();
      clearCloseTimer();
      revealTweenRef.current?.kill();
      bioTimelineRef.current?.kill();
      splitRef.current?.revert();
    };
  }, []);

  return (
    <Drawer.Root
      open={drawerOpen}
      shouldScaleBackground
      onOpenChange={(open) => {
        if (open) {
          clearCloseTimer();
          setDrawerOpen(true);
          return;
        }

        onClose();
      }}
      onDrag={(_, percentageDragged) => {
        const timeline = bioTimelineRef.current;
        if (!timeline) return;

        cancelOpenRevealSync();
        revealTweenRef.current?.kill();
        timeline.progress(gsap.utils.clamp(0, 1, 1 - percentageDragged)).pause();
      }}
      onRelease={(_, open) => {
        if (open) {
          animateRevealTo(1);
          return;
        }

        animateRevealOut();
      }}
      closeThreshold={0.25}
      dismissible
    >
      {portalMounted && (
        <Drawer.Portal>
          <Drawer.Overlay className="sheet-overlay" />
          <Drawer.Content ref={sheetRef} className="sheet-inner" aria-label="Life">
            <Drawer.Handle className="sheet-handle" />
            <div ref={textWrapRef} className="bio-text-wrap" tabIndex={0}>
              <div ref={textScrollRef} className="bio-text-scroll">
              <div className="bio-intro">
                <Image
                  src="/me.png"
                  alt="Portrait of Alex Lakas as a child"
                  width={1254}
                  height={1254}
                  unoptimized
                  className="bio-mark"
                />
                <p ref={textRef} className="base white" style={{ visibility: "hidden" }}>
                  {bioText}
                </p>
              </div>
              <ul className="bio-projects" aria-label="Highlighted projects">
                <li className="bio-project"><span>2024</span><BioSheetLink href="https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html" external>F45, District Cannabis AI infra</BioSheetLink></li>
                <li className="bio-project"><span>2022</span><span>Stealth social network</span></li>
                <li className="bio-project"><span>2021</span><BioSheetLink href="https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension" external>Peanut travel app acquisition</BioSheetLink></li>
                <li className="bio-project"><span>2019</span><BioSheetLink href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" external>LinkedIn polls in under 30s</BioSheetLink></li>
                <li className="bio-project"><span>2017</span><BioSheetLink href="https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/" external>Book Mindbody, Resy on Google</BioSheetLink></li>
                <li className="bio-project"><span>2016</span><BioSheetLink href="https://www.youtube.com/watch?v=QIbPZgH1zRY" external>Google Live Popular Times</BioSheetLink></li>
                <li className="bio-project"><span>2013</span><span>Google+ Maps for business</span></li>
                <li className="bio-project"><span>2011</span><span>Ecommerce for Zippo, Journeys</span></li>
                <li className="bio-project"><span>2009</span><span>Social games, Converse, Nintendo</span></li>
              </ul>
              <div className="bio-sheet-links">
                <BioSheetLink href="https://dribbble.com/alex2pt0" external>Dribbble</BioSheetLink>
                <BioSheetLink href="https://www.linkedin.com/in/latenights/" external>Linkedin</BioSheetLink>
                <BioSheetLink href="https://x.com/axlakas" external>Twitter</BioSheetLink>
              </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      )}
    </Drawer.Root>
  );
}
