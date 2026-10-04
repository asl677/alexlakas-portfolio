"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BookMarked, BriefcaseBusiness, ChevronDown, Code2, FileText, GraduationCap, History, Link, Newspaper, Palette, Quote, Search, X } from "lucide-react";
import { gsap, SplitText } from "gsap/all";
import Lenis from "lenis";

gsap.registerPlugin(SplitText);

const hoverPortraitFrames = [
  // First frame is a product shot, not a face.
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/66aed54564c490241089592d_hand.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/692926ba1daaa6bd1d904499_shot3.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/665554b2f2ee046740dbbd4f_syd-cover.jpeg",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/648e113182964bd201887b14_alex-lakas-pCibATCkQxo-unsplash%20(3).webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/67700bb77f4bfa58786b7569_02%202.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/65c99f3f74651f26dc44e777_0225.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/67bb5c12c57a2790a896d2fe_man-red.avif",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/691d4a10a400d63fe056ed9f_220.avif",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/681309f43c2b0e7da6163320_logo.png",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/6813096813d071d057e17cab_man-stars.jpg",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/651d9b32904012a586063cc3_polls577_4x.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/665565a0acb1cccd12cf8ab0_macbook-book.webp",
  "https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/691d4816ea87196a56f06bd6_01.webp",
];

type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string | undefined;
  video: string | undefined;
};

function SearchResultIcon({ id }: { id: string }) {
  const Icon = {
    "early-life": GraduationCap,
    career: BriefcaseBusiness,
    style: Palette,
    media: Newspaper,
    publications: FileText,
    stack: Code2,
    references: Quote,
    "external-links": Link,
  }[id] || BookMarked;

  return <Icon size={22} />;
}

// Placeholder "recent searches" shown before the first keystroke; tapping one runs it.
const recentSearches = ["AI", "Product design", "Google"];

export function PageSearch({ inputId = "page-search", autoFocus = false, recentOnMount = false }: { inputId?: string; autoFocus?: boolean; recentOnMount?: boolean }) {
  const [query, setQuery] = useState("");
  const [showRecent, setShowRecent] = useState(recentOnMount);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsContentRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wrapper = resultsRef.current;
    const content = resultsContentRef.current;
    if (!wrapper || !content || results.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ wrapper, content, lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1 });
    let frame: number | null = null;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [results.length]);

  useEffect(() => {
    if (!results.length && !showRecent) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      // Inside the mobile sheet (e.g. its drag handle) is not "outside" the search.
      const sheet = searchRef.current?.closest(".wiki-mobile-search-sheet-panel");
      if (searchRef.current?.contains(target) || sheet?.contains(target)) return;
      setResults([]);
      if (!sheet) setShowRecent(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [results.length, showRecent]);

  const updateResults = (value: string) => {
    const term = value.trim();
    if (!term) {
      setResults([]);
      setStatus("");
      return;
    }

    if (term.length < 2) {
      setResults([]);
      setStatus("Keep typing to search.");
      return;
    }

    const normalizedTerm = term.toLocaleLowerCase();
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordMatch = term.length <= 3 ? new RegExp(`\\b${escapedTerm}\\b`, "i") : null;
    const matches = Array.from(document.querySelectorAll<HTMLElement>(".article-list-item, .career-feature, .wiki-section"))
      .map((item) => {
        const isPublication = item.classList.contains("article-list-item");
        const title = isPublication
          ? item.querySelector("h3")?.textContent?.trim() || "Publication"
          : item.classList.contains("career-feature")
            ? item.querySelector("h3")?.textContent?.trim() || "Career feature"
            : item.querySelector("h2")?.textContent?.trim() || "Section";
        const text = item.innerText.replace(/\s+/g, " ").trim();
        const matchingBlock = Array.from(item.querySelectorAll<HTMLElement>("p, li"))
          .map((block) => block.innerText.replace(/\s+/g, " ").trim())
          .find((block) => wordMatch ? wordMatch.test(block) : block.toLocaleLowerCase().includes(normalizedTerm));
        const resultText = matchingBlock || text;
        const matchIndex = wordMatch ? resultText.search(wordMatch) : resultText.toLocaleLowerCase().indexOf(normalizedTerm);
        if (matchIndex < 0 || !item.id) return null;
        if (item.classList.contains("wiki-section")) {
          const hasDirectMatch = Array.from(item.querySelectorAll<HTMLElement>(".article-list-item, .career-feature"))
            .some((child) => {
              const childText = child.textContent?.toLocaleLowerCase() || "";
              return wordMatch ? wordMatch.test(childText) : childText.includes(normalizedTerm);
            });
          if (hasDirectMatch) return null;
        }
        const video = item.querySelector<HTMLVideoElement>("video");
        return {
          id: item.id,
          title,
          excerpt: resultText,
          thumbnail: (isPublication || item.classList.contains("career-feature"))
            ? item.querySelector<HTMLImageElement>("img")?.currentSrc
              || video?.poster
              || undefined
            : undefined,
          video: video?.currentSrc || video?.querySelector("source")?.src || undefined,
        };
      })
      .filter((result): result is SearchResult => result !== null);

    const rankedMatches = matches
      .sort((a, b) => Number(b.title.toLocaleLowerCase().includes(normalizedTerm)) - Number(a.title.toLocaleLowerCase().includes(normalizedTerm)))
      .slice(0, 8);
    setResults(rankedMatches);
    setStatus(rankedMatches.length ? `${rankedMatches.length} result${rankedMatches.length === 1 ? "" : "s"} for ${term}.` : `No matches found for ${term}.`);
  };

  const searchPage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateResults(query);
  };

  const selectResult = (result: SearchResult) => {
    // Lets the mobile bottom sheet slide away once a result is chosen.
    window.dispatchEvent(new Event("alexpedia-search-selected"));
    const target = document.getElementById(result.id);
    const section = target?.closest<HTMLElement>(".wiki-section") || target;
    const toggle = section?.querySelector<HTMLButtonElement>(".wiki-section-toggle");
    if (toggle?.getAttribute("aria-expanded") === "false") toggle.click();
    window.history.replaceState(null, "", `#${result.id}`);
    const scrollTarget = target?.querySelector<HTMLElement>("h2, h3") || target;
    window.setTimeout(() => {
      if (!scrollTarget) return;
      const stickyElements = Array.from(document.querySelectorAll<HTMLElement>(".wiki-topbar, .wiki-article-header"));
      const stickyOffset = stickyElements.reduce((offset, element) => {
        const style = window.getComputedStyle(element);
        return style.position === "sticky" || style.position === "fixed" ? offset + element.getBoundingClientRect().height : offset;
      }, 0);
      const top = window.scrollY + scrollTarget.getBoundingClientRect().top - stickyOffset - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 0);
    setResults([]);
  };

  const highlightMatch = (text: string) => {
    const term = query.trim();
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
    return parts.map((part, index) =>
      part.toLocaleLowerCase() === term.toLocaleLowerCase()
        ? <mark className="wiki-search-match" key={index}>{part}</mark>
        : part,
    );
  };

  return (
    <form ref={searchRef} className="wiki-search" onSubmit={searchPage} role="search">
      <label className="sr-only" htmlFor={inputId}>Search this page</label>
      <span className="search-decoration" aria-hidden="true"><Search size={20} strokeWidth={2} /></span>
      <div className="wiki-search-input">
        <input
          id={inputId}
          autoFocus={autoFocus}
          value={query}
          onFocus={() => { if (!query) setShowRecent(true); }}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowRecent(!event.target.value);
            updateResults(event.target.value);
          }}
          placeholder="Search"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("");
              setShowRecent(true);
              document.getElementById(inputId)?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
        {showRecent && !query && results.length === 0 && (
          <div className="wiki-search-results wiki-search-recent" data-lenis-prevent>
          <ul aria-label="Recent searches">
            {recentSearches.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  // Keep focus in the input so the list does not close before the click lands.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(term);
                    setShowRecent(false);
                    updateResults(term);
                  }}
                >
                  <span className="wiki-search-result-icon" aria-hidden="true"><History size={20} strokeWidth={2} /></span>
                  <span className="wiki-search-result-copy">
                    <strong>{term}</strong>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          </div>
        )}
        {results.length > 0 && (
          <div ref={resultsRef} className="wiki-search-results" data-lenis-prevent>
          <ul ref={resultsContentRef} aria-label="Search results">
            {results.map((result) => (
              <li key={result.id}>
                <button type="button" onClick={() => selectResult(result)}>
                  {result.video ? (
                    <video className="wiki-search-result-video" src={result.video} poster={result.thumbnail} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                  ) : result.thumbnail ? <img src={result.thumbnail} alt="" /> : <span className="wiki-search-result-icon" aria-hidden="true"><SearchResultIcon id={result.id} /></span>}
                  <span className="wiki-search-result-copy">
                    <strong>{highlightMatch(result.title)}</strong>
                    <span>{highlightMatch(result.excerpt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          </div>
        )}
      </div>
      <button type="submit" className="search-submit">Search</button>
      <span className="sr-only" aria-live="polite">{status}</span>
    </form>
  );
}

export function MobileSearchSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const closeOnSelect = () => setIsOpen(false);

    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("alexpedia-search-selected", closeOnSelect);
    // Lock page scrolling while the sheet is open. The sheet covers the viewport, so a
    // non-passive touchmove guard on it is enough; the page itself is never moved.
    // Smooth scrolling (Lenis) is paused too, so an in-flight glide cannot carry the page.
    document.documentElement.classList.add("wiki-sheet-open");
    window.dispatchEvent(new Event("alexpedia-scroll-lock"));
    // React touch handlers are passive; this one must be able to cancel page scrolling.
    // Only the results list may scroll, and only while it has room to scroll.
    const sheet = sheetRef.current;
    let lastY = 0;
    const onTouchStart = (event: TouchEvent) => { lastY = event.touches[0]?.clientY ?? 0; };
    const onTouchMove = (event: TouchEvent) => {
      const list = (event.target as HTMLElement).closest<HTMLElement>(".wiki-search-results");
      const y = event.touches[0]?.clientY ?? 0;
      const deltaY = y - lastY;
      lastY = y;
      if (list) {
        const atTop = list.scrollTop <= 0 && deltaY > 0;
        const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1 && deltaY < 0;
        if (!atTop && !atBottom) return;
      }
      event.preventDefault();
    };
    sheet?.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet?.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      sheet?.removeEventListener("touchstart", onTouchStart);
      sheet?.removeEventListener("touchmove", onTouchMove);
      document.documentElement.classList.remove("wiki-sheet-open");
      window.dispatchEvent(new Event("alexpedia-scroll-unlock"));
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("alexpedia-search-selected", closeOnSelect);
    };
  }, [isOpen]);

  // Drag the handle down to dismiss: past 80px, or a quick downward flick, closes the sheet.
  const onHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startTime: performance.now() };
  };
  const onHandlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setDragOffset(Math.max(0, event.clientY - dragRef.current.startY));
  };
  const onHandlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const distance = Math.max(0, event.clientY - dragRef.current.startY);
    const velocity = distance / Math.max(1, performance.now() - dragRef.current.startTime);
    dragRef.current = null;
    setDragOffset(0);
    if (distance > 80 || velocity > 0.6) setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="wiki-icon-button wiki-nav-search" aria-label="Search" title="Search" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}><Search size={20} strokeWidth={2} /></button>
      <div className={`wiki-mobile-search-sheet${isOpen ? " is-open" : ""}`} role="presentation" aria-hidden={!isOpen} data-lenis-prevent ref={sheetRef} onPointerDown={() => setIsOpen(false)}>
        <section
          className={`wiki-mobile-search-sheet-panel${dragOffset ? " is-dragging" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Search this page"
          style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div
            className="wiki-mobile-search-sheet-handle"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
          >
            <span aria-hidden="true" />
          </div>
          <PageSearch inputId="mobile-sheet-search" recentOnMount />
        </section>
      </div>
    </>
  );
}

export function SeamlessVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const restartBeforeEnd = () => {
      if (!video.duration || video.currentTime < video.duration - 0.18) return;
      video.currentTime = 0;
      void video.play();
    };

    const restartAfterEnd = () => {
      video.currentTime = 0;
      void video.play();
    };

    video.addEventListener("timeupdate", restartBeforeEnd);
    video.addEventListener("ended", restartAfterEnd);
    return () => {
      video.removeEventListener("timeupdate", restartBeforeEnd);
      video.removeEventListener("ended", restartAfterEnd);
    };
  }, []);

  return (
    <video ref={videoRef} className="agents-video" poster="/agents.mp4.png" autoPlay muted playsInline preload="auto" controlsList="nodownload noplaybackrate noremoteplayback" disableRemotePlayback aria-label="AI agents data workflow animation" tabIndex={-1}>
      <source src="/agents.mp4" type="video/mp4" />
    </video>
  );
}

export function HoverPortrait() {
  const [isHovering, setIsHovering] = useState(false);
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const loadedFramesRef = useRef(new Set<string>());
  const longPressRef = useRef(0);

  useEffect(() => () => window.clearTimeout(longPressRef.current), []);

  useEffect(() => {
    hoverPortraitFrames.forEach(src => {
      const image = new window.Image();
      const markAvailable = () => {
        loadedFramesRef.current.add(src);
      };

      image.onload = markAvailable;
      image.onerror = () => undefined;
      image.src = src;
      void image.decode().then(markAvailable).catch(() => undefined);
    });
  }, []);

  useEffect(() => {
    if (!isHovering) {
      frameRef.current = 0;
      setFrame(0);
      return;
    }

    const interval = window.setInterval(() => {
      const frames = hoverPortraitFrames.filter(src => loadedFramesRef.current.has(src));
      if (frames.length > 0) {
        frameRef.current = (frameRef.current + 1) % frames.length;
        setFrame(frameRef.current);
      }
    }, 450);

    return () => window.clearInterval(interval);
  }, [isHovering]);

  const activeFrames = hoverPortraitFrames.filter(src => loadedFramesRef.current.has(src));
  const activeFrame = activeFrames[frame];
  const portraitSrc = "/me.png?v=yearbook-20261001";

  return (
    <div
      className="infobox-portrait"
      onPointerEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 56.3125rem)").matches) {
          setIsHovering(true);
        }
      }}
      onPointerLeave={() => setIsHovering(false)}
      // Touch: press and hold to play the frames; lifting or scrolling stops it.
      onPointerDown={event => {
        // Long-press wherever hover is not the trigger: touch, or any pointer on narrow screens.
        const hoverTrigger = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 56.3125rem)").matches;
        if (event.pointerType !== "touch" && hoverTrigger) return;
        window.clearTimeout(longPressRef.current);
        longPressRef.current = window.setTimeout(() => setIsHovering(true), 350);
      }}
      onPointerUp={() => {
        window.clearTimeout(longPressRef.current);
        if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 56.3125rem)").matches) return;
        setIsHovering(false);
      }}
      onPointerCancel={() => {
        window.clearTimeout(longPressRef.current);
        setIsHovering(false);
      }}
      onContextMenu={event => event.preventDefault()}
    >
      {/* The frame changes in place; the rail never moves or reflows. */}
      <img src={isHovering && activeFrame ? activeFrame : portraitSrc} alt="Alex" width={1254} height={1254} />
    </div>
  );
}

export function WikiSection({
  id,
  title,
  className = "",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const contentId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 560px)");
    const sync = () => {
      setIsMobile(media.matches);
      setOpen(!media.matches);
    };

    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const closeForAnotherSection = (event: Event) => {
      const { detail } = event as CustomEvent<string>;
      if (detail !== id) setOpen(false);
    };

    window.addEventListener("alexpedia-accordion-open", closeForAnotherSection);
    return () => window.removeEventListener("alexpedia-accordion-open", closeForAnotherSection);
  }, [id]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    const setSectionHeight = (value: string) => {
      body.style.setProperty("--wiki-section-height", value);
    };
    const setSectionTransition = (value: string) => {
      if (value) {
        body.style.setProperty("--wiki-section-transition", value);
      } else {
        body.style.removeProperty("--wiki-section-transition");
      }
    };

    if (!isMobile) {
      setSectionHeight("auto");
      setSectionTransition("");
      body.style.height = "";
      body.style.overflow = "";
      return;
    }

    let frame = 0;
    const finish = (event: TransitionEvent) => {
      if (event.target !== body || event.propertyName !== "height") return;
      if (open) {
        setSectionHeight("auto");
      }
    };

    body.addEventListener("transitionend", finish);
    body.style.overflow = "hidden";
    setSectionTransition("");

    if (open) {
      setSectionHeight("0px");
      frame = window.requestAnimationFrame(() => {
        setSectionHeight(`${body.scrollHeight}px`);
      });
    } else {
      if (!wasOpen) {
        setSectionTransition("none");
        setSectionHeight("0px");
        void body.offsetHeight;
        frame = window.requestAnimationFrame(() => {
          setSectionTransition("");
        });
        return () => {
          window.cancelAnimationFrame(frame);
          body.removeEventListener("transitionend", finish);
        };
      }

      const startHeight = body.getBoundingClientRect().height || body.scrollHeight;
      setSectionHeight(`${startHeight}px`);
      void body.offsetHeight;
      frame = window.requestAnimationFrame(() => {
        setSectionHeight("0px");
      });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      body.removeEventListener("transitionend", finish);
    };
  }, [isMobile, open]);

  return (
    <section id={id} className={("wiki-section " + (open ? "is-open " : "") + className).trim()}>
      <button
        type="button"
        className="wiki-section-toggle"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => {
          if (isMobile) {
            // Notify other sections from the event handler, never inside a state updater
            // (updaters run during render, so closing siblings there triggers a React error).
            const next = !open;
            setOpen(next);
            if (next) {
              window.dispatchEvent(new CustomEvent("alexpedia-accordion-open", { detail: id }));
              // The line reveal normally runs on scroll; run it as the section expands so the
              // new content staggers in wherever the page is, instead of staying hidden.
              [50, 300, 620].forEach(delay => window.setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
              // Bring the opened section to the top, just under the sticky header. A section
              // closing above shifts the page while it animates, so correct once it settles.
              const scrollToSection = (behavior: ScrollBehavior) => {
                const section = document.getElementById(id);
                const header = document.querySelector<HTMLElement>(".wiki-article-header");
                if (!section) return;
                const offset = header ? header.getBoundingClientRect().height : 0;
                const top = section.getBoundingClientRect().top + window.scrollY - offset + 1;
                if (Math.abs(top - window.scrollY) > 2) window.scrollTo({ top: Math.max(0, top), behavior });
              };
              window.setTimeout(() => scrollToSection("smooth"), 60);
              window.setTimeout(() => scrollToSection("smooth"), 640);
            }
          }
        }}
      >
        <span className="wiki-section-chevron" aria-hidden="true"><ChevronDown size={24} strokeWidth={2} /></span>
        <h2>{title}</h2>
      </button>
      <div id={contentId} ref={bodyRef} className="wiki-section-body" aria-hidden={!open}>
        <div className="wiki-section-content">
          {children}
        </div>
      </div>
    </section>
  );
}

export function IntroSequence() {
  useEffect(() => {
    const topbar = document.querySelector<HTMLElement>(".wiki-topbar");
    const articleHeader = document.querySelector<HTMLElement>(".wiki-article-header");
    const contents = document.querySelector<HTMLElement>(".wiki-contents");
    if (!topbar || !articleHeader || !contents) return;

    // Optical centering: the title's ink (not its text box) sits on the bar's middle, and the
    // label shares the title's baseline. Layout is identical in both header states, so this is
    // measured once (after fonts load) and on resize.
    const centerTitle = () => {
      const row = articleHeader.querySelector<HTMLElement>(".wiki-title-row");
      // Measure whichever title is showing (the article or the Talk view).
      const title = Array.from(articleHeader.querySelectorAll<HTMLElement>(".wiki-article-title, .wiki-talk-title"))
        .find(candidate => window.getComputedStyle(candidate).display !== "none");
      const label = articleHeader.querySelector<HTMLElement>(".wiki-language");
      const context = document.createElement("canvas").getContext("2d");
      if (!row || !title || !context) return;
      articleHeader.style.setProperty("--wiki-title-nudge", "0px");
      articleHeader.style.setProperty("--wiki-language-shift", "0px");
      const baselineOf = (element: HTMLElement) => {
        const marker = document.createElement("span");
        marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        element.appendChild(marker);
        const y = marker.getBoundingClientRect().top;
        marker.remove();
        return y;
      };
      const style = window.getComputedStyle(title);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const ink = context.measureText(title.textContent ?? "");
      const titleBaseline = baselineOf(title);
      const rowBox = row.getBoundingClientRect();
      const rowCenter = rowBox.top + row.clientTop + row.clientHeight / 2;
      const inkCenter = titleBaseline - (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2;
      articleHeader.style.setProperty("--wiki-title-nudge", `${(rowCenter - inkCenter).toFixed(2)}px`);
      if (label) articleHeader.style.setProperty("--wiki-language-shift", `${(titleBaseline - baselineOf(label)).toFixed(2)}px`);

      // Sticky search sits exactly midway between the title's right edge and the icons.
      const search = articleHeader.querySelector<HTMLElement>(".wiki-scroll-actions");
      const icons = articleHeader.querySelector<HTMLElement>(".wiki-sticky-actions");
      if (search && icons && window.getComputedStyle(search).display !== "none") {
        articleHeader.style.setProperty("--wiki-search-shift", "0px");
        const searchBox = search.getBoundingClientRect();
        const midpoint = (title.getBoundingClientRect().right + icons.getBoundingClientRect().left) / 2;
        const shift = midpoint - (searchBox.left + searchBox.width / 2);
        articleHeader.style.setProperty("--wiki-search-shift", `${shift.toFixed(2)}px`);
      }
    };
    const updateSearchVisibility = () => {
      // Match the visual handoff to the article header becoming sticky.
      const stickyTop = Number.parseFloat(window.getComputedStyle(articleHeader).top) || 0;
      // Hysteresis: smooth scrolling hovers around the threshold, so require a few pixels
      // of movement before un-sticking; otherwise the search fade restarts every frame.
      const headerTop = articleHeader.getBoundingClientRect().top;
      const wasScrolled = articleHeader.classList.contains("is-scrolled");
      const isScrolled = wasScrolled ? headerTop <= stickyTop + 24 : headerTop <= stickyTop + 1;
      const scrollProgress = Math.min(window.scrollY / 96, 1);
      const easedProgress = scrollProgress * scrollProgress * (3 - (2 * scrollProgress));
      topbar.classList.toggle("is-scrolled", isScrolled);
      articleHeader.classList.toggle("is-scrolled", isScrolled);
      contents.classList.toggle("is-scrolled", isScrolled);
      articleHeader.style.setProperty("--wiki-language-opacity", String(1 - easedProgress));
      // Section headings stick directly beneath the article header's real height.
      document.documentElement.style.setProperty("--wiki-article-header-height", `${articleHeader.getBoundingClientRect().height}px`);
      // Top bar contents fade to exactly 0 by the time the bar has scrolled out of view.
      const topbarFade = Math.max(0, 1 - window.scrollY / Math.max(1, topbar.offsetHeight));
      topbar.style.setProperty("--wiki-topbar-fade", topbarFade.toFixed(3));
    };

    centerTitle();
    document.fonts.ready.then(centerTitle);
    window.addEventListener("resize", centerTitle);
    // Switching Article/Talk swaps the visible title; measure after the view updates.
    const recenterAfterView = () => requestAnimationFrame(() => requestAnimationFrame(centerTitle));
    window.addEventListener("hashchange", recenterAfterView);

    updateSearchVisibility();
    window.addEventListener("scroll", updateSearchVisibility, { passive: true });
    window.addEventListener("resize", updateSearchVisibility);
    return () => {
      window.removeEventListener("scroll", updateSearchVisibility);
      window.removeEventListener("resize", updateSearchVisibility);
      window.removeEventListener("resize", centerTitle);
      window.removeEventListener("hashchange", recenterAfterView);
    };
  }, []);

  useLayoutEffect(() => {
    const shell = document.querySelector(".wiki-shell");
    const counter = document.querySelector<HTMLElement>(".wiki-loader-counter");
    const wordmark = document.querySelector<HTMLElement>(".wiki-wordmark-text");
    const alignCounter = () => {
      if (!counter || !wordmark) return;
      const typography = window.getComputedStyle(wordmark);
      const bounds = wordmark.getBoundingClientRect();
      const loaderBounds = counter.parentElement!.getBoundingClientRect();
      counter.style.font = typography.font;
      counter.style.fontFamily = typography.fontFamily;
      counter.style.fontSize = typography.fontSize;
      counter.style.fontWeight = typography.fontWeight;
      counter.style.fontStyle = typography.fontStyle;
      counter.style.fontVariant = typography.fontVariant;
      counter.style.letterSpacing = typography.letterSpacing;
      counter.style.lineHeight = typography.lineHeight;
      counter.style.color = typography.color;
      counter.style.fontFeatureSettings = typography.fontFeatureSettings;
      counter.style.fontVariationSettings = typography.fontVariationSettings;
      counter.style.fontKerning = typography.fontKerning;
      counter.style.textTransform = typography.textTransform;
      counter.style.left = `${bounds.left - loaderBounds.left}px`;
      counter.style.top = `${bounds.top - loaderBounds.top}px`;
      counter.style.height = `${bounds.height}px`;
      counter.style.visibility = "visible";
    };
    alignCounter();
    window.addEventListener("resize", alignCounter);
    document.fonts.addEventListener("loadingdone", alignCounter);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The counter reports real loading: fonts, every image and video, then window load.
    const LOADER_FADE_MS = 300;
    const REVEAL_BUFFER_MS = 300;
    const LOADER_FAILSAFE_MS = 8000;
    const assets: Promise<unknown>[] = [
      document.fonts.ready,
      document.readyState === "complete" ? Promise.resolve() : new Promise(resolve => window.addEventListener("load", resolve, { once: true })),
      ...Array.from(document.images).map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })),
      ...Array.from(document.querySelectorAll("video")).map(video => video.readyState >= 2 ? Promise.resolve() : new Promise(resolve => {
        video.addEventListener("loadeddata", resolve, { once: true });
        video.addEventListener("error", resolve, { once: true });
      }))
    ];
    let loadedCount = 0;
    assets.forEach(asset => asset.then(() => { loadedCount += 1; }));
    let failsafeHit = false;
    const failsafe = window.setTimeout(() => { failsafeHit = true; }, LOADER_FAILSAFE_MS);
    // Continue from the inline pre-hydration counter instead of restarting at 0.
    const inlineWindow = window as Window & { __wikiProgress?: number; __wikiShown?: number; __wikiCounterOwned?: boolean };
    inlineWindow.__wikiCounterOwned = true;
    const display = { value: inlineWindow.__wikiShown ?? 0 };
    let resolveLoader: () => void = () => {};
    const loaderDone = new Promise<void>(resolve => { resolveLoader = resolve; });
    let finishTimer = 0;
    const finishLoader = () => {
      gsap.ticker.remove(tickCounter);
      if (counter) counter.textContent = "100";
      shell?.classList.remove("is-loading");
      // Loader fades out, then a short pause before the page starts revealing.
      finishTimer = window.setTimeout(resolveLoader, reducedMotion ? 0 : LOADER_FADE_MS + REVEAL_BUFFER_MS);
    };
    const tickCounter = () => {
      const target = failsafeHit ? 100 : Math.min((loadedCount / assets.length) * 100, Math.max(inlineWindow.__wikiProgress ?? 0, display.value));
      // Ease toward real progress; keep moving at least slightly so it never stalls visually.
      const step = Math.max((target - display.value) * 0.08, target > display.value ? 0.35 : 0);
      display.value = Math.min(target, display.value + step);
      if (counter) counter.textContent = String(Math.floor(display.value));
      if (display.value >= 100) finishLoader();
    };
    if (reducedMotion) {
      Promise.all(assets).then(finishLoader);
    } else {
      gsap.ticker.add(tickCounter);
    }
    const targets = Array.from(document.querySelectorAll<HTMLElement>([
      ".wiki-topbar > .wiki-wordmark",
      ".wiki-topbar > .wiki-brand",
      ".wiki-topbar > .wiki-search",
      ".wiki-topbar nav > :not(.wiki-mobile-search-sheet)",
      ".wiki-contents summary",
      ".wiki-contents nav > a",
      ".wiki-title-row > *",
      ".wiki-tab-primary > *",
      ".wiki-tab-actions > *",
      ".wiki-mobile-tools > *",
      ".infobox h2",
      ".infobox-portrait",
      ".infobox .caption",
      ".infobox dt",
      ".infobox dd",
      ".article-toc > h2",
      ".article-toc > ol > li",
      ".wiki-section-toggle",
      ".wiki-section-content > ul > li",
      ".wiki-section-content > ol > li",
      ".wiki-section-content .article-list-item",
      ".wiki-section-content .references > li",
      ".wiki-section-content .wiki-link-list > li",
      ".wiki-section-content .work-links > li",
      ".wiki-section-content .medium-card",
      ".wiki-section-content .career-feature > figure",
      ".wiki-categories > *",
      ".wiki-talk-page > *"
    ].join(", ")))
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return aRect.top - bRect.top || aRect.left - bRect.left;
      });
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const text = document.querySelector<HTMLElement>(".wiki-wordmark-text");
        // Crawlers and automated browsers only ever see "Designer", so the animation's
        // placeholder names are never rendered into anything a search engine indexes.
        const isCrawler = navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent);
        if (text && !isCrawler) {
          let current = "Wikipidia";
          gsap.set(text, { textContent: current });
          // Typing starts from the real loader finishing, not a fixed timer.
          const typing = gsap.timeline({ paused: true });
          loaderDone.then(() => gsap.delayedCall(0.4, () => typing.play()));
          // Human rhythm: seeded jitter (same every load, never a visible loop), a key-repeat
          // delay before backspacing speeds up, and a hesitation before each new word.
          let seed = 7;
          const jitter = (min: number, max: number) => {
            seed = (seed * 9301 + 49297) % 233280;
            return min + (seed / 233280) * (max - min);
          };
          // Hold "Wikipidia" for 3s before the first delete.
          let time = 3;
          for (const next of ["Alexipidia", "Nah", "Designer"]) {
            for (let length = current.length - 1; length >= 0; length--) {
              const presses = current.length - 1 - length;
              // First press, then the OS key-repeat delay, then a steady repeat.
              time += presses === 0 ? 0 : presses === 1 ? jitter(0.36, 0.44) : jitter(0.085, 0.11);
              typing.set(text, { textContent: current.slice(0, length) }, time);
            }
            time += jitter(0.4, 0.5);
            for (let length = 1; length <= next.length; length++) {
              const afterCapital = length === 2 ? jitter(0.05, 0.09) : 0;
              time += jitter(0.14, 0.26) + afterCapital;
              typing.set(text, { textContent: next.slice(0, length) }, time);
            }
            time += next === "Nah" ? 1.1 : 1.6;
            current = next;
          }
        }
      }
      const fade = { duration: 1.4, stagger: 0.012, ease: "sine.out" };
      const visualOrder = (elements: HTMLElement[]) => elements.sort((a, b) => {
        const first = a.getBoundingClientRect();
        const second = b.getBoundingClientRect();
        return first.top - second.top || first.left - second.left;
      });
      let textLines: HTMLElement[] = [];
      let queueReveal = () => {};
      const revealedLines = new Set<HTMLElement>();
      const textSplits = Array.from(document.querySelectorAll<HTMLElement>([
        ".wiki-article-body > p",
        ".wiki-section-content > p",
        ".wiki-section-content > h3",
        ".wiki-section-content .career-feature > h3",
        ".wiki-section-content .career-feature > p"
      ].join(", "))).map(target => {
        let previousLines: HTMLElement[] = [];
        return new SplitText(target, {
        type: "lines",
        tag: "span",
        aria: "none",
        ignore: ".reference",
        wordsClass: "wiki-reveal-word",
        linesClass: "wiki-reveal-line",
        autoSplit: true,
        onSplit(split) {
          // Preserve revealed text ranges, not the whole paragraph, across rewraps.
          const textLength = (line: HTMLElement) => (line.textContent ?? "").replace(/\s/g, "").length;
          let previousOffset = 0;
          const revealedRanges = previousLines.flatMap(line => {
            const start = previousOffset;
            previousOffset += textLength(line);
            return revealedLines.has(line) ? [{ start, end: previousOffset }] : [];
          });
          gsap.killTweensOf(previousLines);
          textLines = textLines.filter(line => !previousLines.includes(line));
          previousLines.forEach(line => revealedLines.delete(line));
          // SplitText clears its own lines array during resize; retain our snapshot.
          previousLines = [...split.lines] as HTMLElement[];
          textLines.push(...previousLines);
          let nextOffset = 0;
          previousLines.forEach(line => {
            const start = nextOffset;
            nextOffset += textLength(line);
            const wasRevealed = revealedRanges.some(range => range.start < nextOffset && range.end > start);
            if (wasRevealed) revealedLines.add(line);
            gsap.set(line, { opacity: wasRevealed ? 1 : 0 });
          });
          queueReveal();
        }
      });
      });
      const rail = document.querySelector<HTMLElement>(".infobox");
      if (rail) targets.push(rail);
      const dividers = new Set(Array.from(document.querySelectorAll<HTMLElement>(
        ".wiki-title-row, .wiki-tabs, .wiki-mobile-tools, .article-toc, .wiki-section, .wiki-section-toggle h2, .wiki-categories"
      )));
      dividers.forEach(divider => {
        divider.classList.add("wiki-reveal-divider");
        targets.push(divider);
      });
      const revealProperties = (element: HTMLElement, opacity: number) => {
        if (element === rail) return { "--rail-surface-opacity": opacity };
        if (dividers.has(element)) return { "--wiki-divider-opacity": opacity };
        return { opacity };
      };
      const stage = (elements: HTMLElement[]) => elements.forEach(element => {
        gsap.set(element, revealProperties(element, 0));
      });
      const fadeIn = (elements: HTMLElement[], delay = 0) => {
        const timeline = gsap.timeline({ delay });
        visualOrder(elements).forEach((element, index) => {
          timeline.to(element, {
            ...revealProperties(element, 1),
            duration: fade.duration,
            ease: fade.ease
          }, index * fade.stagger);
        });
      };
      const isInRevealArea = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
        const inset = atPageEnd ? 0 : 30;
        return rect.bottom > 0 && rect.top <= window.innerHeight - inset;
      };
      // Fade each visible element once; fading its container too multiplies opacity.
      stage([...targets, ...textLines]);
      const revealedTargets = new Set<HTMLElement>();
      let revealReady = false;
      const startInitialReveal = () => {
        // Sample after the loader clears, when header and profile layout have settled.
        const initiallyVisible = targets.filter(isInRevealArea);
        const initiallyVisibleLines = textLines.filter(isInRevealArea);
        initiallyVisible.forEach(target => revealedTargets.add(target));
        initiallyVisibleLines.forEach(line => revealedLines.add(line));
        fadeIn([...initiallyVisible, ...initiallyVisibleLines]);
        revealReady = true;
      };
      let revealCancelled = false;
      loaderDone.then(() => { if (!revealCancelled) startInitialReveal(); });
      const reveal = () => {
        const visibleTargets = targets.filter(target => !revealedTargets.has(target) && isInRevealArea(target));
        const visibleLines = textLines.filter(line => !revealedLines.has(line) && isInRevealArea(line));

        visibleTargets.forEach(target => revealedTargets.add(target));
        visibleLines.forEach(line => revealedLines.add(line));
        fadeIn([...visibleTargets, ...visibleLines]);
      };

      let frame = 0;
      const onScroll = () => {
        if (!revealReady) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(reveal);
      };
      queueReveal = onScroll;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        queueReveal = () => {};
        revealCancelled = true;
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        textSplits.forEach(split => split.revert());
        dividers.forEach(divider => divider.classList.remove("wiki-reveal-divider"));
      };

    });

    return () => {
      window.removeEventListener("resize", alignCounter);
      document.fonts.removeEventListener("loadingdone", alignCounter);
      window.clearTimeout(failsafe);
      window.clearTimeout(finishTimer);
      gsap.ticker.remove(tickCounter);
      context.revert();
    };
  }, []);

  return null;
}

export function WikiSubsection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="wiki-subsection">
      <h3>{title}</h3>
      <div className="wiki-subsection-body">{children}</div>
    </section>
  );
}

// Pointer clicks on tabs must not leave a focus ring (keyboard focus still shows one).
const releasePointerFocus = (event: React.MouseEvent<HTMLElement>) => {
  if (event.detail > 0) event.currentTarget.blur();
};

export function ArticleTabs() {
  const [view, setView] = useState<"article" | "talk">("article");

  useEffect(() => {
    const syncView = () => setView(window.location.hash === "#talk" ? "talk" : "article");
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.articleView = view;
    // Newly shown content was staged at opacity 0; let the reveal pass pick it up.
    const frame = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    return () => {
      cancelAnimationFrame(frame);
      delete document.documentElement.dataset.articleView;
    };
  }, [view]);

  return (
    <div className="wiki-tabs">
      <div className="wiki-tab-primary" role="tablist" aria-label="Article views">
        <a href="#article" className={"wiki-tab " + (view === "article" ? "is-selected" : "")} role="tab" aria-selected={view === "article"} onClick={releasePointerFocus}>Article</a>
        <a href="#talk" className={"wiki-tab " + (view === "talk" ? "is-selected" : "")} role="tab" aria-selected={view === "talk"} onClick={releasePointerFocus}>Talk</a>
      </div>
      <div className="wiki-tab-actions">
        <span>Read</span>
      </div>
    </div>
  );
}

export function SmoothAnchorScroll() {
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lenis = reduceMotion.matches
      ? null
      : new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1 });
    let lenisFrame: number | null = null;
    const tick = (time: number) => {
      lenis?.raf(time);
      lenisFrame = requestAnimationFrame(tick);
    };
    if (lenis) lenisFrame = requestAnimationFrame(tick);
    // The search sheet cancels any in-flight smooth-scroll glide by pinning Lenis's target to
    // the current position. (lenis.stop() is avoided: it animates back to a stale target.)
    const lockScroll = () => lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    const unlockScroll = () => undefined;
    window.addEventListener("alexpedia-scroll-lock", lockScroll);
    window.addEventListener("alexpedia-scroll-unlock", unlockScroll);

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function handleClick(event: MouseEvent) {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : document.getElementById("top");
      if (!target) return;

      event.preventDefault();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const nextHash = link.hash || "#top";
      const section = target.closest<HTMLElement>(".wiki-section");
      const subsection = target.closest<HTMLElement>(".wiki-subsection");
      const toggles = [
        section?.querySelector<HTMLButtonElement>(".wiki-section-toggle"),
        subsection?.querySelector<HTMLButtonElement>(".wiki-subsection-toggle"),
      ];
      toggles.forEach(toggle => {
        if (toggle?.getAttribute("aria-expanded") === "false") toggle.click();
      });

      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = requestAnimationFrame(() => {
        const start = window.scrollY;
        const header = document.querySelector<HTMLElement>(".wiki-topbar");
        const headerOffset = header && getComputedStyle(header).position === "fixed"
          ? header.getBoundingClientRect().height + 8
          : 8;
        const destination = Math.max(0, target.getBoundingClientRect().top + start - headerOffset);
        const distance = destination - start;

        if (reduceMotion.matches || Math.abs(distance) < 2) {
          window.scrollTo(0, destination);
          history.pushState(null, "", nextHash);
          animationFrameRef.current = null;
          return;
        }

        const duration = Math.min(1000, Math.max(500, Math.abs(distance) * 0.3));
        const started = performance.now();
        function step(now: number) {
          const progress = Math.min((now - started) / duration, 1);
          window.scrollTo(0, start + distance * easeInOutCubic(progress));
          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(step);
          } else {
            history.pushState(null, "", nextHash);
            animationFrameRef.current = null;
          }
        }
        animationFrameRef.current = requestAnimationFrame(step);
        });
      });
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (lenisFrame !== null) cancelAnimationFrame(lenisFrame);
      window.removeEventListener("alexpedia-scroll-lock", lockScroll);
      window.removeEventListener("alexpedia-scroll-unlock", unlockScroll);
      lenis?.destroy();
    };
  }, []);

  return null;
}

export function ContentsScrollSpy() {
  useEffect(() => {
    const media = window.matchMedia("(min-width: 901px)");
    let frame: number | null = null;

    const update = () => {
      frame = null;
      if (!media.matches) return;

      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".wiki-contents a[href^='#']"));
      const headerHeight = document.querySelector<HTMLElement>(".wiki-topbar")?.getBoundingClientRect().height ?? 0;
      const marker = headerHeight + 28;
      let activeId = "top";

      for (const link of links) {
        const id = decodeURIComponent(link.hash.slice(1));
        const target = id === "top" ? document.getElementById("top") : document.getElementById(id);
        if (target && target.getBoundingClientRect().top <= marker) activeId = id;
      }

      links.forEach((link) => {
        const isActive = decodeURIComponent(link.hash.slice(1)) === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
