"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookMarked, BriefcaseBusiness, ChevronDown, Code2, FileText, GraduationCap, History, Link, Newspaper, Palette, Quote, Search, X } from "lucide-react";
import { gsap, SplitText } from "gsap/all";
import Lenis from "lenis";
import { scrubConfig } from "./scrubConfig";
import fetchedPreviews from "../data/linkPreviews.json";
import extraPreviews from "../data/linkPreviewsExtra.json";
import personBlurbs from "../data/personBlurbs.json";
// Fetched Open Graph previews, plus hand-written fallbacks for sites that block the fetch.
const linkPreviews: Record<string, { image?: string; description?: string; title?: string }> = Object.fromEntries(
  [...new Set([...Object.keys(extraPreviews), ...Object.keys(fetchedPreviews)])].map(url => [url, { ...(fetchedPreviews as Record<string, object>)[url], ...(extraPreviews as Record<string, object>)[url] }]),
);

gsap.registerPlugin(SplitText);

// Site-wide motion curve, matching --wiki-ease in globals.css: cubic-bezier(0.76, 0.019, 0.483, 0.989).
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const sample = (a: number, b: number, t: number) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
  const slope = (a: number, b: number, t: number) => 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sample(x1, x2, t) - x;
      const d = slope(x1, x2, t);
      if (Math.abs(error) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= error / d;
    }
    return sample(y1, y2, Math.min(1, Math.max(0, t)));
  };
}
// easeInOutQuart (easings.net), matching --wiki-ease in CSS.
export const wikiEase = cubicBezier(0.76, 0, 0.24, 1);
// Text reveal curve (owner's pick): fast start, long soft settle. Used on load and scroll.
// power2.out-like: quick start, short clean settle. The previous curve (0.3, 0.592, 0.011,
// 0.986) spent its last ~40% of the time creeping through the final pixel, which read as lag.
const revealEase = cubicBezier(0.33, 1, 0.68, 1);

const hoverPortraitFrames = [
  // Hover/press opens on the yearbook portrait, then cycles the work frames.
  "/me.png?v=yearbook-20261001",
  // Next frame is a product shot, not a face. Local 640px square crops: the originals are
  // up to 5000px and alias badly when scaled down ~20x into the portrait box.
  "/portrait/frame-01.webp",
  "/portrait/frame-02.webp",
  "/portrait/frame-03.webp",
  "/portrait/frame-04.webp",
  "/portrait/frame-05.webp",
  "/portrait/frame-06.webp",
  "/portrait/frame-07.webp",
  "/portrait/frame-08.webp",
  "/portrait/frame-09.webp",
  "/portrait/frame-10.webp",
  "/portrait/frame-11.webp",
  "/portrait/frame-12.webp",
  "/portrait/frame-13.webp",
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
  // Desktop dropdown is portaled to <body> and fixed under the input, so no header's stacking,
  // transforms or backdrop blur can clip or cover it. The mobile sheet keeps its in-place list.
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [inSheet, setInSheet] = useState(true);
  // Re-checked every render (cheap) so a fast refresh can't leave a stale value.
  useLayoutEffect(() => {
    const sheet = !!searchRef.current?.closest(".wiki-mobile-search-sheet");
    if (sheet !== inSheet) setInSheet(sheet);
  });

  useEffect(() => {
    if (!results.length && !showRecent) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      // Inside the mobile sheet (e.g. its drag handle) is not "outside" the search.
      const sheet = searchRef.current?.closest(".wiki-mobile-search-sheet-panel");
      if (searchRef.current?.contains(target) || sheet?.contains(target) || dropdownRef.current?.contains(target)) return;
      // The mobile sheet keeps its query and results when dismissed, so reopening shows them again.
      if (sheet || searchRef.current?.closest(".wiki-mobile-search-sheet")) return;
      setResults([]);
      setShowRecent(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [results.length, showRecent]);

  const dropdownOpen = !inSheet && (results.length > 0 || (showRecent && !query));
  useEffect(() => {
    if (!dropdownOpen) return;
    // Runs on the GSAP ticker after Lenis moves the page, writing styles directly (no React
    // re-render), so the list tracks its field in the same frame instead of lagging a frame behind.
    const place = () => {
      const dropdown = dropdownRef.current;
      const form = searchRef.current;
      const field = form?.querySelector<HTMLElement>(".wiki-search-input");
      if (!dropdown || !form || !field) return;
      const formBox = form.getBoundingClientRect();
      const fieldBox = field.getBoundingClientRect();
      // Follow the field's own visibility: fade with the header hand-off, and fade out as the
      // top bar search scrolls off, so the list leaves with its field instead of popping.
      let opacity = 1;
      for (let node: HTMLElement | null = form; node && opacity > 0.01; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      opacity *= Math.min(1, Math.max(0, fieldBox.bottom / Math.max(1, fieldBox.height)));
      dropdown.style.top = `${fieldBox.bottom}px`;
      dropdown.style.left = `${formBox.left}px`;
      dropdown.style.width = `${formBox.width}px`;
      dropdown.style.opacity = opacity.toFixed(3);
      dropdown.style.visibility = opacity < 0.02 ? "hidden" : "visible";
      dropdown.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
    };
    gsap.ticker.add(place);
    return () => gsap.ticker.remove(place);
  }, [dropdownOpen]);

  // The top bar and sticky header searches share one state: typing in either fills both,
  // so the list carries over when the header hands off on scroll.
  const broadcast = (detail: { query?: string; close?: boolean }) => {
    if (inSheet) return;
    window.dispatchEvent(new CustomEvent("alexpedia-search-sync", { detail: { source: inputId, ...detail } }));
  };
  const syncRef = useRef<(detail: { source: string; query?: string; close?: boolean }) => void>(() => undefined);
  syncRef.current = (detail) => {
    if (inSheet || detail.source === inputId) return;
    if (detail.close) { setShowRecent(false); setResults([]); return; }
    const value = detail.query ?? "";
    setQuery(value);
    setShowRecent(!value);
    updateResults(value);
  };
  useEffect(() => {
    const onSync = (event: Event) => syncRef.current((event as CustomEvent<{ source: string; query?: string; close?: boolean }>).detail);
    window.addEventListener("alexpedia-search-sync", onSync);
    return () => window.removeEventListener("alexpedia-search-sync", onSync);
  }, []);

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
        // innerText keeps the gaps between block elements (textContent ran "Fiveonefour" into the title).
        const text = (item.innerText || item.textContent || "").replace(/\s+/g, " ").trim();
        const matchingBlock = Array.from(item.querySelectorAll<HTMLElement>("p, li"))
          .map((block) => (block.textContent ?? "").replace(/\s+/g, " ").trim())
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
    if (!inSheet) setResults([]);
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

  const lists = (
    <>
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
                    broadcast({ query: term });
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
                <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => selectResult(result)}>
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
    </>
  );

  return (
    <form ref={searchRef} className="wiki-search" onSubmit={searchPage} role="search">
      <label className="sr-only" htmlFor={inputId}>Search this page</label>
      <div className="wiki-search-input">
        <input
          id={inputId}
          autoFocus={autoFocus}
          value={query}
          onFocus={() => { window.dispatchEvent(new CustomEvent("alexpedia-popover", { detail: "search" })); if (!query) setShowRecent(true); broadcast({ query }); }}
          // Desktop: leaving the field closes its dropdown, so a search whose header scrolled
          // away (or faded out) can't leave a list floating on the page.
          onBlur={() => {
            if (inSheet) return;
            window.setTimeout(() => {
              if (dropdownRef.current?.contains(document.activeElement)) return;
              // Scrolling hands focus nowhere, so this only fires on a real click-away.
              setShowRecent(false);
              setResults([]);
              broadcast({ close: true });
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowRecent(!event.target.value);
            updateResults(event.target.value);
            broadcast({ query: event.target.value });
          }}
          placeholder="Search"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            // Keep focus in the field: a blur here closed the list, then the click reopened it.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("");
              setShowRecent(true);
              broadcast({ query: "" });
              document.getElementById(inputId)?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
        {inSheet && lists}
      </div>
      <button type="submit" className="search-submit">Search</button>
      <span className="sr-only" aria-live="polite">{status}</span>
      {dropdownOpen && createPortal(
        <div ref={dropdownRef} className="wiki-search-dropdown" style={{ visibility: "hidden" }} data-lenis-prevent>
          {lists}
        </div>,
        document.body,
      )}
    </form>
  );
}

export function MobileSearchSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalRoot(document.querySelector<HTMLElement>(".wiki-shell") ?? document.body); }, []);

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
    // iOS Safari still rubber-bands the page under a fixed overlay while dragging the sheet.
    // Pinning the body in place (and restoring the scroll position after) stops it moving.
    const lockedY = window.scrollY;
    const body = document.body;
    const previousBody = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width };
    Object.assign(body.style, { position: "fixed", top: `-${lockedY}px`, left: "0", right: "0", width: "100%" });
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
      Object.assign(body.style, previousBody);
      window.scrollTo(0, lockedY);
      document.documentElement.classList.remove("wiki-sheet-open");
      window.dispatchEvent(new Event("alexpedia-scroll-unlock"));
      // Re-sync the scroll reveal after the sheet (and keyboard) close.
      [0, 250, 600].forEach(delay => window.setTimeout(() => window.dispatchEvent(new Event("alexpedia-reveal")), delay));
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
      {/* Rendered at the page root (not inside the top bar) so no header transform, filter or
          stacking can break the fixed sheet, which happened in iOS Safari. */}
      {portalRoot && createPortal(<div className={`wiki-mobile-search-sheet${isOpen ? " is-open" : ""}`} role="presentation" aria-hidden={!isOpen} data-lenis-prevent ref={sheetRef} onPointerDown={() => setIsOpen(false)}>
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
      </div>, portalRoot)}
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
  // Default: the sketching photo; the yearbook portrait is the first hover frame.
  const portraitSrc = "/profile-sketch.jpg";

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
        // Mirror of closing: animate only up to what will be visible (the section scrolls to
        // just under the header), then release to auto height when the transition ends.
        const header = document.querySelector<HTMLElement>(".wiki-article-header");
        const visibleRoom = window.innerHeight - (header ? header.getBoundingClientRect().height : 0);
        setSectionHeight(`${Math.min(body.scrollHeight, Math.max(visibleRoom, 1))}px`);
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

      // Collapse from the visible height: content below the screen is trimmed instantly
      // (invisible, so nothing jumps), and only what can be seen animates to zero. Otherwise
      // a tall section spends most of the animation shrinking off-screen and looks abrupt.
      const box = body.getBoundingClientRect();
      const fullHeight = box.height || body.scrollHeight;
      const visibleBottom = Math.max(0, window.innerHeight - box.top);
      const startHeight = box.top < window.innerHeight ? Math.min(fullHeight, visibleBottom) : fullHeight;
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
              window.dispatchEvent(new CustomEvent("alexpedia-accordion-reveal", { detail: id }));
              [50, 300, 620].forEach(delay => window.setTimeout(() => window.dispatchEvent(new Event("alexpedia-reveal")), delay));
              // Bring the opened section to the top, just under the sticky header, in step with
              // the accordion. Any open section above will collapse, so its height is subtracted
              // up front; the scroll then runs with the accordion's duration and easing.
              const section = document.getElementById(id);
              const header = document.querySelector<HTMLElement>(".wiki-article-header");
              if (section) {
                const collapsingAbove = Array.from(document.querySelectorAll<HTMLElement>(".wiki-section-body[aria-hidden='false']"))
                  .filter(other => !section.contains(other) && other.getBoundingClientRect().top < section.getBoundingClientRect().top)
                  .reduce((total, other) => total + other.getBoundingClientRect().height, 0);
                const offset = header ? header.getBoundingClientRect().height : 0;
                const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - collapsingAbove - offset + 1);
                window.dispatchEvent(new CustomEvent("alexpedia-scroll-to", { detail: { top, duration: 0.6 } }));
              }
            }
          }
        }}
      >
        <span className="wiki-section-chevron" aria-hidden="true"><ChevronDown size={24} strokeWidth={2} /></span>
        <h2><span className="wiki-wipe"><span className="wiki-wipe-content">{title}</span></span></h2>
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
      // Measure with the scroll hand-off at rest (label in place, not slid up), and with
      // transitions off; otherwise a page that loads scrolled bakes the slide into the offset.
      const handoff = articleHeader.style.getPropertyValue("--wiki-handoff");
      const wasRecentering = articleHeader.classList.contains("is-recentering");
      articleHeader.classList.add("is-recentering");
      articleHeader.style.setProperty("--wiki-handoff", "0");
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
      if (handoff) articleHeader.style.setProperty("--wiki-handoff", handoff);
      if (!wasRecentering) {
        void articleHeader.offsetHeight;
        requestAnimationFrame(() => articleHeader.classList.remove("is-recentering"));
      }

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
      const isScrolled = wasScrolled ? headerTop <= stickyTop + 8 : headerTop <= stickyTop + 1;
      const scrollProgress = Math.min(window.scrollY / 96, 1);
      const easedProgress = scrollProgress * scrollProgress * (3 - (2 * scrollProgress));
      topbar.classList.toggle("is-scrolled", isScrolled);
      articleHeader.classList.toggle("is-scrolled", isScrolled);
      contents.classList.toggle("is-scrolled", isScrolled);
      articleHeader.style.setProperty("--wiki-language-opacity", String(1 - easedProgress));
      // Scroll-linked hand-off (like persistent sticky headers): over the last 32px before the
      // header sticks, the icons push the language label up and out. 0 = label, 1 = icons.
      // Measured by scroll distance (the header's own position freezes once stuck), centred on
      // the sticking point: the label leaves over the 16px before it, the icons arrive over the
      // 16px after it.
      const article = articleHeader.parentElement;
      const naturalTop = article ? article.getBoundingClientRect().top + window.scrollY : headerTop + window.scrollY;
      const stickScroll = naturalTop - stickyTop;
      const handoff = Math.min(1, Math.max(0, (window.scrollY - stickScroll + 16) / 32));
      articleHeader.style.setProperty("--wiki-handoff", handoff.toFixed(3));
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
    // Switching Article/Talk swaps the visible title. Re-measure with transitions off so the
    // title and label land in place instead of sliding or re-fading.
    const recenterAfterView = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      articleHeader.classList.add("is-recentering");
      centerTitle();
      void articleHeader.offsetHeight;
      requestAnimationFrame(() => requestAnimationFrame(() => articleHeader.classList.remove("is-recentering")));
    }));
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
    // Every load starts fresh at the top: section hashes are dropped (#talk is kept because
    // it selects the Talk tab) and the scroll position is reset before the reveal is staged.
    if (window.location.hash && window.location.hash !== "#talk") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
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
    const REVEAL_AFTER_HANDOFF_MS = 0;
    const LOADER_FAILSAFE_MS = 12000;
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
    // The inline script (layout.tsx) owns the loader text: it types "Loading", holds it until the
    // page has loaded, then backspaces and types "Designer" (handing off to the logo,
    // which reads the same word). The loader finishes once that is typed and
    // this bundle's own assets are in (or the failsafe fires).
    const inlineWindow = window as Window & { __wikiDone?: boolean };
    let resolveLoader: () => void = () => {};
    const loaderDone = new Promise<void>(resolve => { resolveLoader = resolve; });
    let finishTimer = 0;
    let finished = false;
    const finishLoader = () => {
      if (finished) return;
      finished = true;
      gsap.ticker.remove(tickCounter);
      // Hand off: the logo (already "Designer" underneath the typed counter) is shown at once,
      // so the word stays on screen while the loader fades around it.
      window.dispatchEvent(new Event("alexpedia-loader-handoff"));
      // The typed word stays put and fades out with the loader layer, while the identical logo
      // (shown instantly underneath) emerges as that layer clears: the two copies sum to a
      // constant, so "Designer" never dips. Hiding the word at once left the logo still behind
      // the fading loader background, which read as the word flashing.
      // The top bar (which holds the logo) is hidden while loading; show it in that same frame
      // too. Its opacity transition made the logo fade up after the typed word vanished: a flash.
      const topbar = document.querySelector<HTMLElement>(".wiki-topbar");
      if (topbar) {
        topbar.style.transition = "none";
        requestAnimationFrame(() => requestAnimationFrame(() => { topbar.style.transition = ""; }));
      }
      shell?.classList.remove("is-loading");
      // Loader fades out, then a short pause before the page starts revealing.
      // The logo is already on screen, so the page starts revealing shortly after the handoff
      // while the loader finishes fading (no long wait for the full fade plus a buffer).
      finishTimer = window.setTimeout(resolveLoader, reducedMotion ? 0 : REVEAL_AFTER_HANDOFF_MS);
    };
    const tickCounter = () => {
      if (failsafeHit || (inlineWindow.__wikiDone && loadedCount >= assets.length)) finishLoader();
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
      // The rail's "Top" link joins the load reveal (it still only shows once scrolled).
      ".wiki-contents .contents-top",
      ".wiki-contents nav > a",
      // The Talk title is hidden until its tab is chosen; it should switch in instantly,
      // not run the page-load fade the first time it appears.
      ".wiki-title-row > *:not(.wiki-talk-title):not(.wiki-article-title)",
      ".wiki-tab-primary > *",
      ".wiki-tab-actions > *",
      ".wiki-mobile-tools > *",
      ".infobox-portrait",
      ".infobox .caption",
      ".infobox dt",
      ".infobox dd",
      ".article-toc > ol > li",
      ".wiki-section-content > ol > li",
      ".wiki-section-content .references > li",
      // List items reveal as whole items (bullet included), in sync with other lists.
      ".wiki-section-content .wiki-link-list > li",
      ".wiki-section-content > ul:not(.stack-tags) > li",
      // Stack tags reveal one by one with the rest of the stagger.
      ".wiki-section-content .stack-tags > li",
      // Case study rows: the thumbnail gets the media wipe, the text block fades.
      ".wiki-section-content .article-list-item > .article-list-image",
      ".wiki-section-content .work-links > li",
      ".wiki-section-content .medium-card",
      ".wiki-section-content .career-feature > figure",
      ".wiki-categories > *",
      ".wiki-talk-page > *",
      // Section headings reveal with a wipe (two blocks shrinking right), driven by the same
      // load sequence and scroll scrub as everything else via --wiki-wipe.
      ".wiki-wipe",
      // Accordion carets join the same stagger (fade) beside their headings.
      ".wiki-section-chevron"
    ].join(", ")))
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return aRect.top - bRect.top || aRect.left - bRect.left;
      });
    const context = gsap.context(() => {
      // The logo shows "Designer" as server-rendered; the preloader types that word and hands
      // off to it, so the logo has no typing cycle of its own.
      // Phones run every reveal slower (1.4x on top of the base timing), and scroll reveals play over a longer stretch of
      // scrolling: the same motion reads rushed on a small screen.
      const pace = window.matchMedia("(max-width: 768px)").matches ? 1.4 : 1;
      // Text runs at desktop speed on phones (1.4x felt too slow); images keep the slower pace.
      const textPace = 1;
      const fade = { duration: 0.8 * pace, stagger: 0.04 * pace, ease: wikiEase };
      // Scroll reveals are scrubbed: progress is tied to the scroll position.
      const SCRUB_RANGE = 120;
      const visualOrder = (elements: HTMLElement[]) => elements.sort((a, b) => {
        const first = a.getBoundingClientRect();
        const second = b.getBoundingClientRect();
        return first.top - second.top || first.left - second.left;
      });
      let textLines: HTMLElement[] = [];
      let queueReveal = () => {};
      const revealedLines = new Set<HTMLElement>();
      let revealReady = false;
      const scrubState = new Map<HTMLElement, { element: HTMLElement; top: number; hidden: boolean; media: boolean; wipe: boolean; current: number }>();
      // Keep punctuation that follows a link or reference on the same line as it: otherwise
      // SplitText treats ", and" as its own word and can wrap the comma to the next line.
      const gluePunctuation = (root: HTMLElement) => {
        root.querySelectorAll<HTMLElement>("a, sup").forEach(link => {
          // A link wrapped in a data-nosnippet span: glue the punctuation to the wrapper.
          let element: HTMLElement = link;
          while (!element.nextSibling && element.parentElement?.hasAttribute("data-nosnippet")) element = element.parentElement;
          const next = element.nextSibling;
          if (!next || next.nodeType !== Node.TEXT_NODE) return;
          const match = /^[,.;:!?)\]\u2019\u201d]+/.exec(next.textContent ?? "");
          if (!match || element.parentElement?.classList.contains("wiki-nowrap")) return;
          const glue = document.createElement("span");
          glue.className = "wiki-nowrap";
          element.replaceWith(glue);
          glue.append(element, match[0]);
          next.textContent = (next.textContent ?? "").slice(match[0].length);
        });
      };
      const textSplits = Array.from(document.querySelectorAll<HTMLElement>([
        ".wiki-article-body > p",
        ".wiki-section-content > p",
        ".wiki-section-content > h3",
        ".wiki-section-content .career-feature > p",
        // Case study rows: meta, title and line reveal like the body text.
        ".wiki-section-content .article-list-item > div > :is(p, h3)"

      ].join(", "))).map(target => {
        gluePunctuation(target);
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
            line.style.setProperty("--wiki-wipe", wasRevealed ? "1" : "0");
          });
          // Rewraps must not replay: lines already on or above screen start fully shown.
          if (revealReady) {
            const limit = window.innerHeight;
            previousLines.forEach(line => {
              if (revealedLines.has(line) || line.getBoundingClientRect().top > limit) return;
              scrubState.set(line, { element: line, top: 0, hidden: false, media: false, wipe: false, current: 1 });
              gsap.set(line, revealProperties(line, 1));
            });
          }
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
      // Every other piece of body text (lists, profile rows, Contents links, Talk, categories)
      // reveals exactly like the split paragraphs: fade, soft blur and a short rise.
      targets.forEach(target => {
        if (target.matches(".infobox :is(dt, dd), .article-toc > ol > li, .wiki-section-content > :is(ul, ol) > li, .wiki-section-content .references > li, .wiki-section-content .wiki-link-list > li, .wiki-section-content .work-links > li, .wiki-categories > *, .wiki-talk-page > *, .wiki-contents nav > a")) target.classList.add("wiki-reveal-block");
      });
      // Every image and video (Career, profile portrait, case studies) uses the same block wipe.
      targets.forEach(target => { if (target.matches(".career-feature > figure, .infobox-portrait, .article-list-image")) target.classList.add("wiki-wipe", "wiki-wipe-media"); });
      targets.forEach(target => {
        if (target !== rail && !dividers.has(target) && target.closest(".wiki-article-body, .wiki-talk-page, .wiki-categories") && !target.closest(".wiki-article-header")) {
          target.classList.add("wiki-slide");
        }
      });
      const revealProperties = (element: HTMLElement, opacity: number): gsap.TweenVars => {
        if (element === rail) return { "--rail-surface-opacity": opacity };
        if (element.classList.contains("wiki-wipe")) return { "--wiki-wipe": opacity };
        if (dividers.has(element)) return { "--wiki-divider-opacity": opacity };
        // Header controls whose opacity CSS also drives (scroll-linked hand-off): reveal through
        // a variable that CSS multiplies in, so the load fade and the hand-off combine.
        if (element.matches(".wiki-title-row > .wiki-title-action, .wiki-title-row > .wiki-scroll-actions, .wiki-contents .contents-top")) return { "--wiki-reveal": opacity };
        // Text lines reveal with the strip wipe: a page-colored cover retracts left to right.
        if (element.classList.contains("wiki-reveal-line") || element.classList.contains("wiki-reveal-block")) return { "--wiki-wipe": opacity };
        return { opacity };
      };
      // Per-frame writer for the scrub loop. gsap.set builds a tween per call, and each one
      // reads computed styles on init: hundreds of forced style recalcs per frame while
      // scrolling. Writing the same values straight to the inline style reads nothing.
      const applyReveal = (element: HTMLElement, value: number) => {
        const props = revealProperties(element, value);
        if (element === rail || dividers.has(element) || "--wiki-reveal" in props || "--wiki-wipe" in props) {
          const name = Object.keys(props)[0];
          element.style.setProperty(name, String(value));
          return;
        }
        element.style.opacity = String(value);
      };
      const stage = (elements: HTMLElement[]) => elements.forEach(element => {
        gsap.set(element, revealProperties(element, 0));
      });
      const fadeIn = (elements: HTMLElement[], delay = 0, ease: string | ((t: number) => number) = fade.ease) => {
        const timeline = gsap.timeline({ delay });
        // Up to 80ms between items, each a 0.6s expo.out fade, with the whole cascade held to
        // ~1.2s: per-line items made a fixed 80ms step crawl down a full screen of text.
        // Cascade top-down: a clear per-item step (cap ~2.2s total) with short line wipes, so rows
        // follow one another instead of all wiping left-to-right at once.
        // Line-by-line cadence: 50ms apart, the whole cascade capped at 1.5s so a full screen of
        // text never drags.
        const step = Math.min(0.04 * textPace, (1.2 * textPace) / Math.max(1, elements.length));
        visualOrder(elements).forEach((element, index) => {
          // fromTo with explicit start values: a plain `to` reads computed styles when each
          // staggered tween first renders, forcing a synchronous style recalc on most frames.
          const wipe = element.classList.contains("wiki-wipe");
          const media = element.classList.contains("wiki-wipe-media");
          // Every element starts in its own top-down slot. Lines rise/fade/un-blur via CSS from
          // --wiki-wipe; strips (headings 1.6s, images 1.8s) cover then uncover on a symmetric
          // curve, so they never run ahead of the text around them.
          timeline.fromTo(element, revealProperties(element, 0), {
            ...revealProperties(element, 1),
            duration: media ? 1.4 * pace : wipe ? 1.1 * pace : element.classList.contains("wiki-reveal-line") ? 0.55 * textPace : 0.4 * textPace,
            ease: media ? "power2.inOut" : wipe ? "power3.inOut" : ease
            // Strips trail their slot by 0.35s so the text has begun appearing first (the
            // headings are the topmost items, so in-slot they led the whole load).
          }, index * step);
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
      const startInitialReveal = () => {
        // Sample after the loader clears, when header and profile layout have settled.
        // Skip anything already shown (the logo is revealed at the loader hand-off): fading it
        // again from 0 made "Designer" flash out and back in right after typing finished.
        const initiallyVisible = targets.filter(target => !revealedTargets.has(target) && isInRevealArea(target));
        const initiallyVisibleLines = textLines.filter(isInRevealArea);
        initiallyVisible.forEach(target => revealedTargets.add(target));
        initiallyVisibleLines.forEach(line => revealedLines.add(line));
        // Opening reveal starts visibly at once (no slow start), so content flows in as the
        // loader's "Designer" lands; scroll reveals keep the site curve.
        // 0.6s fades 80ms apart (cascade capped ~1.2s) on power3.out: expo.out's long tail kept
        // the 10px rise creeping for the last few pixels, which read as lag.
        fadeIn([...initiallyVisible, ...initiallyVisibleLines], 0, revealEase);
        revealReady = true;
      };
      let revealCancelled = false;
      loaderDone.then(() => { if (!revealCancelled) startInitialReveal(); });
      // Scrubbed reveal: each element's target progress follows its distance from the viewport
      // bottom (power3.out), and a time-based damper eases opacity + slide toward it every frame,
      // so scroll/drag drives the cascade smoothly with one shared curve. Positions are cached
      // (re-measured on resize/accordion changes) so the per-frame loop does no layout reads.
      // Ease-out (cubic) for scroll-linked progress: an in-out curve here held content near
      // invisible, then snapped it in mid-scroll. Out-curves track the scroll smoothly.
      // Scroll progress follows the same curve as the load reveal, so a line's rise, fade and
      // blur have the same shape whether it appears on load or while scrolling.
      const scrubEase = revealEase;
      type ScrubItem = { element: HTMLElement; top: number; hidden: boolean; media: boolean; wipe: boolean; current: number };
      let scrubItems: ScrubItem[] = [];
      // Cached with positions: reading scrollHeight in the tick, right after the reveal tweens
      // wrote styles, forced a synchronous style recalc every frame of the opening reveal.
      let scrollHeight = 0;
      // window.scrollY flushes pending style + layout. Read in the scrub it ran right after the
      // reveal tweens wrote, forcing a full recalc every frame (the load lag and mid-scroll
      // stalls). Sampled first thing in the frame instead (after Lenis, before any writes).
      let frameScrollY = window.scrollY;
      const readScroll = () => { frameScrollY = window.scrollY; };
      gsap.ticker.add(readScroll, false, true);
      // Re-measure (also re-collects text lines, which SplitText recreates on rewrap).
      const measure = () => {
        const y = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        scrubItems = [...targets, ...textLines].map(element => {
          const item = scrubState.get(element) ?? { element, top: 0, hidden: false, media: element.matches("figure, .article-list-item, .article-list-image, .infobox"), wipe: element.classList.contains("wiki-wipe-media"), current: 0 };
          scrubState.set(element, item);
          item.top = element.getBoundingClientRect().top + y;
          item.hidden = !!element.closest(".wiki-section-body[aria-hidden='true']");
          return item;
        });
      };
      const scrubTick = (_time: number, deltaTime: number) => {
        if (!revealReady) return;
        const vh = window.innerHeight;
        const clampRange = (c: { frac: number; min: number; max: number }) => Math.min(c.max, Math.max(c.min, vh * c.frac)) * pace;
        const range = clampRange(scrubConfig.text);
        const mediaRange = clampRange(scrubConfig.media);
        const y = frameScrollY;
        const remaining = Math.max(0, scrollHeight - vh - y);
        // The inset clears the mobile browser toolbar; desktop reveals right at the viewport bottom.
        const edgeInset = window.innerWidth <= 768 ? scrubConfig.edgeInset : 0;
        const widen = Math.max(0, mediaRange + edgeInset - remaining);
        const bottom = y + vh - edgeInset + widen;
        const k = 1 - Math.exp(-deltaTime / 1000 * scrubConfig.damping / pace);
        // Images catch up ~0.2s slower than text, so a fast scroll can't snap them in.
        const kMedia = 1 - Math.exp(-deltaTime / 1000 / (pace / scrubConfig.damping + 0.2));
        for (const item of scrubItems) {
          const { element } = item;
          if (item.hidden || revealedTargets.has(element) || revealedLines.has(element)) continue;
          const r = item.media ? mediaRange : range;
          // The sticky Contents rail and the top bar never scrub out once shown.
          // Image strips spend their first half drawing the grey strip, so they start later than
          // text and land in step with the lines around them. Heading strips stay in sync with
          // their own text, which reveals as ordinary lines.
          const lag = item.wipe ? r * 0.45 : 0;
          const target = element.closest(".wiki-contents, .wiki-topbar") ? 1 : scrubEase(Math.min(1, Math.max(0, (bottom - item.top - lag) / r)));
          // One-way: scrolling back up never fades content out again.
          if (target <= item.current) continue;
          // Light time-based easing toward the scroll target gives the reveal its glide.
          let next = item.current + (target - item.current) * (item.media ? kMedia : k);
          if (Math.abs(target - next) < 0.002) next = target;
          item.current = next;
          applyReveal(element, next);
          if (element === rail && next === 1) revealedTargets.add(rail);
        }
      };
      const reveal = () => { measure(); };
      // Opening a mobile accordion: its first screenful staggers in at once (short, no scroll lag).
      const revealSection = (event: Event) => {
        const section = document.getElementById((event as CustomEvent<string>).detail);
        if (!section) return;
        // Opening a section replays its reveal: the first screenful staggers in like the page
        // load (same cadence and line reveal); everything below it is reset and handed to the
        // scroll reveal, which re-measures once the section has finished expanding.
        const inside = [...targets, ...textLines].filter(element => section.contains(element) && element !== section && !element.closest(".wiki-section-toggle"));
        const sectionTop = section.getBoundingClientRect().top;
        const firstScreen = (element: HTMLElement) => element.getBoundingClientRect().top - sectionTop < window.innerHeight;
        const pending: HTMLElement[] = [];
        inside.forEach(element => {
          gsap.killTweensOf(element);
          const sets = element.classList.contains("wiki-reveal-line") ? revealedLines : revealedTargets;
          const item = scrubState.get(element);
          if (firstScreen(element)) {
            sets.add(element);
            if (item) item.current = 1;
            pending.push(element);
          } else {
            sets.delete(element);
            if (item) item.current = 0;
            applyReveal(element, 0);
          }
        });
        fadeIn(pending, 0.04, revealEase);
        [120, 700].forEach(delay => window.setTimeout(() => queueReveal(), delay));
        // Positions below the section changed: refresh the scrub's cache.
        queueReveal();
      };

      let frame = 0;
      // Scrolling itself does no work here: the scrub ticker reads cached positions every frame.
      // Re-measuring on scroll forced layout on hundreds of nodes per frame and made it choppy.
      const onScroll = () => {};
      // Layout-affecting events (resize, accordion reveal, rewraps) re-measure once per frame.
      const onLayout = () => {
        if (!revealReady) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(reveal);
      };
      queueReveal = onLayout;
      // Any layout change (accordion height transitions, image loads, rewraps) re-measures the
      // cached positions every frame it changes, so nothing is left hidden at a stale offset.
      // Throttled: re-measuring every frame of an accordion height transition forces layout on
      // hundreds of nodes per frame and makes the expander stutter.
      let measureFrame = 0;
      const layoutObserver = new ResizeObserver(() => {
        window.clearTimeout(measureFrame);
        measureFrame = window.setTimeout(measure, 120);
      });
      layoutObserver.observe(document.body);
      loaderDone.then(() => { if (!revealCancelled) { measure(); gsap.ticker.add(scrubTick); } });
      window.addEventListener("resize", onLayout);
      window.addEventListener("alexpedia-reveal", onLayout);
      window.addEventListener("alexpedia-accordion-reveal", revealSection);
      // Tab switch: everything in the shown view appears at once, already revealed.
      const revealViewInstantly = (event: Event) => {
        const view = (event as CustomEvent<string>).detail;
        const root = document.querySelector<HTMLElement>(view === "talk" ? ".wiki-talk-page" : ".wiki-article-body");
        if (!root) return;
        targets.filter(target => root.contains(target) && !revealedTargets.has(target)).forEach(target => {
          revealedTargets.add(target);
          gsap.set(target, revealProperties(target, 1));
        });
        textLines.filter(line => root.contains(line) && !revealedLines.has(line)).forEach(line => {
          revealedLines.add(line);
          gsap.set(line, revealProperties(line, 1));
        });
      };
      window.addEventListener("alexpedia-view-instant", revealViewInstantly);
      // Translating: put paragraphs back as plain text (split lines would each be translated
      // on their own and break the sentences), fully shown.
      const unsplitForTranslation = () => {
        textSplits.forEach(split => split.revert());
        textLines = [];
        scrubItems = scrubItems.filter(item => !item.element.classList.contains("wiki-reveal-line"));
      };
      window.addEventListener("alexpedia-translate", unsplitForTranslation);
      if (/googtrans=\/en\/(?!en)/.test(document.cookie) || window.location.hostname.endsWith("translate.goog")) unsplitForTranslation();
      // Once Google has translated the page: show everything, stop the scroll reveal (Google's
      // text rewrites made it re-measure constantly, which lagged), and let Lenis re-measure the
      // new page height so the bottom is reachable.
      const onTranslated = () => {
        if (!document.documentElement.matches(".translated-ltr, .translated-rtl")) return;
        unsplitForTranslation();
        [...targets].forEach(element => { revealedTargets.add(element); applyReveal(element, 1); });
        gsap.ticker.remove(scrubTick);
        layoutObserver.disconnect();
        [100, 800, 2000].forEach(delay => window.setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
      };
      const translationWatcher = new MutationObserver(onTranslated);
      translationWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      onTranslated();
      const showBrandForHandoff = () => {
        // Both logo variants (brand link and wordmark) are shown at once and never re-faded.
        document.querySelectorAll<HTMLElement>(".wiki-topbar > .wiki-brand, .wiki-topbar > .wiki-wordmark").forEach(brand => {
          revealedTargets.add(brand);
          gsap.set(brand, { opacity: 1 });
        });
      };
      window.addEventListener("alexpedia-loader-handoff", showBrandForHandoff);
      return () => {
        gsap.ticker.remove(scrubTick);
        gsap.ticker.remove(readScroll);
        layoutObserver.disconnect();
        window.clearTimeout(measureFrame);
        window.removeEventListener("resize", onLayout);
        window.removeEventListener("alexpedia-reveal", onLayout);
        window.removeEventListener("alexpedia-accordion-reveal", revealSection);
        window.removeEventListener("alexpedia-view-instant", revealViewInstantly);
        window.removeEventListener("alexpedia-loader-handoff", showBrandForHandoff);
        translationWatcher.disconnect();
        queueReveal = () => {};
        revealCancelled = true;
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onLayout);
        textSplits.forEach(split => split.revert());
        dividers.forEach(divider => divider.classList.remove("wiki-reveal-divider"));
        targets.forEach(target => { target.classList.remove("wiki-slide", "wiki-wipe-media", "wiki-reveal-block"); if (target.matches("figure, .infobox-portrait, .article-list-image")) target.classList.remove("wiki-wipe"); });
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
  const previousViewRef = useRef<"article" | "talk" | null>(null);

  useEffect(() => {
    const syncView = () => setView(window.location.hash === "#talk" ? "talk" : "article");
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.articleView = view;
    // Newly shown content was staged at opacity 0; let the reveal pass pick it up.
    // Switching tabs shows the other view instantly (no fade); skipped on the initial mount.
    const isSwitch = previousViewRef.current !== null && previousViewRef.current !== view;
    previousViewRef.current = view;
    // Switching tabs opens the other view at its top (the article header sits just above it).
    if (isSwitch) {
      // 16px past the point where the article header sticks (the same point the header's
      // hand-off uses): exactly at it, the top bar and the scrolled-header controls are both
      // mid hand-off and fully faded; from here the scrolled header's search and icons show.
      const header = document.querySelector<HTMLElement>(".wiki-article-header");
      const article = header?.parentElement;
      const stickyTop = header ? Number.parseFloat(getComputedStyle(header).top) || 0 : 0;
      let top = article ? Math.max(0, article.getBoundingClientRect().top + window.scrollY - stickyTop + 16) : 0;
      // A short view (Talk) can't scroll that far; it would stop in the faded gap between the
      // top bar and the stuck header, so open it at the very top instead.
      if (document.documentElement.scrollHeight - window.innerHeight < top) top = 0;
      if (window.scrollY > top) {
        window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
        // Pin Lenis to the new position so its smooth scroll doesn't glide back.
        window.dispatchEvent(new Event("alexpedia-scroll-lock"));
        // An instant jump fires no smooth-scroll update, so refresh the header hand-off now.
        requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
      }
    }
    const frame = requestAnimationFrame(() => {
      if (isSwitch) window.dispatchEvent(new CustomEvent("alexpedia-view-instant", { detail: view }));
    });
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
    // Lenis runs on the GSAP ticker so scroll and the reveal scrub share one frame: with its own
    // rAF loop the scrub could read the previous frame's scroll and visibly hitch behind it.
    const tick = (time: number) => { lenis?.raf(time * 1000); };
    // Prioritized, so it scrolls before the reveal samples scrollY and before tweens render.
    if (lenis) gsap.ticker.add(tick, false, true);
    // The search sheet cancels any in-flight smooth-scroll glide by pinning Lenis's target to
    // the current position. (lenis.stop() is avoided: it animates back to a stale target.)
    const lockScroll = () => lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    const unlockScroll = () => undefined;
    // Accordions request a scroll timed to their own animation (same site-wide curve).
    // Driven frame by frame (not lenis.scrollTo): Lenis clamps to the page height at the start,
    // but the page grows while the section expands, so the target must stay reachable.
    let accordionScrollFrame: number | null = null;
    const scrollToRequest = (event: Event) => {
      const { top, duration } = (event as CustomEvent<{ top: number; duration: number }>).detail;
      if (accordionScrollFrame !== null) cancelAnimationFrame(accordionScrollFrame);
      const start = window.scrollY;
      // Cancel any smooth-scroll glide still in flight, or Lenis pulls the page back each frame.
      lenis?.scrollTo(start, { immediate: true, force: true });
      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / (duration * 1000));
        const y = start + (top - start) * easeInOutCubic(progress);
        // Scroll natively (the page grows while the section expands), then sync Lenis to the
        // same position with a fresh page height so it never fights the animation.
        window.scrollTo(0, y);
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(y, { immediate: true, force: true });
        }
        accordionScrollFrame = progress < 1 ? requestAnimationFrame(step) : null;
      };
      accordionScrollFrame = requestAnimationFrame(step);
    };
    window.addEventListener("alexpedia-scroll-to", scrollToRequest);
    window.addEventListener("alexpedia-scroll-lock", lockScroll);
    window.addEventListener("alexpedia-scroll-unlock", unlockScroll);

    const easeInOutCubic = wikiEase;

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
      gsap.ticker.remove(tick);
      window.removeEventListener("alexpedia-scroll-lock", lockScroll);
      window.removeEventListener("alexpedia-scroll-unlock", unlockScroll);
      window.removeEventListener("alexpedia-scroll-to", scrollToRequest);
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

// Hover cards (Wikipedia-style previews) for footnotes and links: references show their full
// entry, in-page links show the opening of that section, external links show their title and
// site. Desktop pointers only; no border, caret or dividers, just a soft fade and slide up.
type HoverCardData = {
  key: number;
  left: number;
  top: number;
  below: boolean;
  title?: string;
  text?: string;
  bodyHtml?: string;
  site?: string;
  person: boolean;
  href?: string;
  candidates: string[];
};
type HoverMedia = { key: number; status: "loading" | "ready" | "none"; src?: string; icon?: boolean };

// Page titles often end with the site name ("… | TechCrunch"); drop that suffix.
// Bot-check and error pages ("Attention Required!", "Just a moment...") aren't real titles.
const BLOCK_TITLE = /^(attention required|just a moment|access denied|security check|forbidden|403|404|page not found|are you a robot|forbes\.com)/i;
const cleanTitle = (title: string) => {
  const cleaned = title.replace(/\s+[|–—-]\s+[^|–—-]{2,30}$/, "").trim();
  return BLOCK_TITLE.test(cleaned) ? "" : cleaned;
};

// Try to load an image for up to `ms`; resolves true only for a real picture (not a pixel).
const tryImage = (src: string, ms: number, min = 40) => new Promise<boolean>(resolve => {
  const image = new window.Image();
  const done = (ok: boolean) => { window.clearTimeout(timer); image.onload = image.onerror = null; resolve(ok); };
  const timer = window.setTimeout(() => done(false), ms);
  image.referrerPolicy = "no-referrer";
  image.onload = () => {
    // A usable picture: big enough (favicons exempt via a small `min`) and not a thin banner.
    const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
    done(image.naturalWidth >= min && image.naturalHeight >= Math.min(min, 120) && ratio < 3.2 && ratio > 0.3);
  };
  image.onerror = () => done(false);
  image.src = src;
});

export function HoverCards() {
  const [card, setCard] = useState<HoverCardData | null>(null);
  const [visible, setVisible] = useState(false);
  // Moving straight from one link to the next: the card switches over in place instead of
  // hiding and waiting for the new picture.
  const [switching, setSwitching] = useState(false);
  const lastShown = useRef<ReactNode>(null);
  // Re-measure the description's line budget once the picture has its real height.
  const [, setImageLoads] = useState(0);
  const [media, setMedia] = useState<HoverMedia>({ key: 0, status: "none" });
  const [liveText, setLiveText] = useState<{ key: number; text: string } | null>(null);
  const [liveTitle, setLiveTitle] = useState<{ key: number; title: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  useEffect(() => {
    // Desktop only: no hover cards on touch devices or phone-width screens.
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)").matches) return;
    let showTimer = 0;
    let hideTimer = 0;
    let current: HTMLAnchorElement | null = null;
    let pending: Element | null = null;

    const build = (link: HTMLAnchorElement): Omit<HoverCardData, "key" | "left" | "top" | "below"> | null => {
      const href = link.getAttribute("href") ?? "";
      if (link.closest("sup.reference") && href.startsWith("#ref-")) {
        // Footnotes: the reference entry, text only.
        const entry = document.getElementById(href.slice(1))?.cloneNode(true) as HTMLElement | undefined;
        if (!entry) return null;
        entry.querySelectorAll(".reference-number, .reference-backlink").forEach(node => node.remove());
        return { bodyHtml: entry.innerHTML, person: false, candidates: [] };
      }
      if (href.startsWith("#") && href.length > 1) {
        const target = document.getElementById(href.slice(1));
        const paragraph = target?.querySelector<HTMLElement>(".wiki-section-content p, p");
        if (!target || !paragraph) return null;
        const title = (target.querySelector("h2, h3")?.textContent ?? link.textContent ?? "").trim();
        const text = (paragraph.innerText || paragraph.textContent || "").replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
        return { title, text: text.length > 260 ? text.slice(0, 260).replace(/\s+\S*$/, "") + "…" : text, person: false, candidates: [] };
      }
      if (/^https?:/.test(href)) {
        const person = !!link.closest("[data-nosnippet]");
        const saved = linkPreviews[href] ?? {};
        const youtube = href.match(/youtube\.com\/watch\?v=([\w-]+)/)?.[1];
        const shown = person ? href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : new URL(href).hostname.replace(/^www\./, "");
        const candidates = [saved.image, youtube && `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`].filter(Boolean) as string[];
        return {
          // Article/page title when known (link text is often just the site name).
          title: (!person && saved.title && cleanTitle(saved.title)) || (link.textContent ?? "").trim(),
          text: person ? (personBlurbs as Record<string, string>)[href] ?? saved.description : saved.description,
          site: shown,
          person,
          href,
          candidates,
        };
      }
      return null;
    };

    const place = (link: HTMLAnchorElement, data: Omit<HoverCardData, "key" | "left" | "top" | "below">) => {
      const box = link.getBoundingClientRect();
      const width = Math.min(data.href ? 440 : 320, window.innerWidth - 32);
      const left = Math.max(16, Math.min(box.left, window.innerWidth - width - 16));
      const below = box.top < 220;
      counter.current += 1;
      // Above the link: anchored by its bottom edge (no translateY(-100%)), so switching between
      // above/below never animates the card across its own height from far away.
      setCard({ ...data, key: counter.current, left, top: below ? box.bottom + 8 : window.innerHeight - box.top + 8, below });
      requestAnimationFrame(() => setVisible(true));
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (cardRef.current?.contains(target)) { window.clearTimeout(hideTimer); return; }
      const link = target.closest<HTMLAnchorElement>(".wiki-article-body a[href], .wiki-talk-page a[href]");
      if (!link || link === current || link.closest(".article-list-item, .wiki-tab, .article-toc, .reference-backlink")) return;
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
      pending = link;
      const switchOver = !!current;
      showTimer = window.setTimeout(() => {
        setSwitching(switchOver);
        pending = null;
        const data = build(link);
        if (!data) return;
        current = link;
        shownAtY = window.scrollY;
        place(link, data);
      }, switchOver ? 0 : 120);
    };
    const onOut = (event: MouseEvent) => {
      const from = event.target as HTMLElement;
      const to = event.relatedTarget as HTMLElement | null;
      // Only leaving the hovered/pending link or the card matters; mouseouts from everything
      // else on the page used to queue stray hide timers that killed the next card.
      const leaving = (current && current.contains(from)) || (pending && pending.contains(from)) || cardRef.current?.contains(from);
      if (!leaving) return;
      if (to && (cardRef.current?.contains(to) || (current && current.contains(to)) || (pending && pending.contains(to)))) return;
      window.clearTimeout(showTimer);
      pending = null;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => { setVisible(false); current = null; }, 160);
    };
    // Smooth scrolling keeps emitting tiny scroll events after the wheel stops, which hid the
    // card the moment it appeared. Only a real scroll (30px+ since it opened) hides it.
    let shownAtY = 0;
    const onScroll = () => { if (current && Math.abs(window.scrollY - shownAtY) > 30) { setVisible(false); current = null; } };

    document.addEventListener("mouseover", onOver);
    // A link that scrolled under a resting cursor (or whose card a scroll closed) never gets a
    // new mouseover; any movement over it shows the card.
    const onMove = (event: MouseEvent) => {
      if (current) return;
      const link = (event.target as HTMLElement).closest?.("a[href]");
      if (link && link !== pending) onOver(event);
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Resolve the card's picture: every source is tried at once (saved image, the page's live
  // share/first images, the site's favicon) and the best one that loads within 1.5s wins, in
  // that order of preference. The card is revealed only then, at its final size.
  useEffect(() => {
    if (!card) return;
    const key = card.key;
    if (!card.href) { setMedia({ key, status: "none" }); setVisible(true); return; }
    const href = card.href;
    let settled = false;
    setMedia({ key, status: "loading" });
    const load = (url: string, min: number) => {
      const list = url.startsWith("http:") ? [`/api/image?url=${encodeURIComponent(url)}`] : [url, `/api/image?url=${encodeURIComponent(url)}`];
      return Promise.all(list.map(src => tryImage(src, 1400, min))).then(ok => list.find((_, i) => ok[i]) ?? null);
    };
    const host = new URL(href).hostname;
    const saved = Promise.all(card.candidates.map(url => load(url, 120))).then(found => found.find(Boolean) ?? null);
    const live = fetch(`/api/preview?url=${encodeURIComponent(href)}`)
      .then(response => response.json() as Promise<{ images?: string[]; image?: string; description?: string; title?: string }>)
      .catch(() => ({} as { images?: string[]; image?: string; description?: string; title?: string }));
    live.then(data => {
      if (settled) return;
      if (data.description && !card.text) setLiveText({ key, text: data.description });
      if (!card.person && data.title && !linkPreviews[href]?.title && cleanTitle(data.title)) setLiveTitle({ key, title: cleanTitle(data.title) });
    });
    const liveImage = live.then(data => Promise.all((data.images ?? (data.image ? [data.image] : [])).slice(0, 4).map(url => load(url, 200)))).then(found => found.find(Boolean) ?? null);
    const icon = load(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent("https://" + host)}&size=256`, 32);
    const results: (string | null | undefined)[] = [undefined, undefined, undefined];
    const decide = (force: boolean) => {
      if (settled) return;
      // Take the best source once everything ranked above it has answered (or time is up).
      for (let i = 0; i < 3; i++) {
        if (results[i] === undefined && !force) return;
        if (results[i]) {
          settled = true;
          // A share image that is a logo (named logo/icon, or an SVG) shows inset like a site
          // icon; square cover art and photos keep the full picture column.
          const src = results[i] as string;
          const logo = !card.person && /logo|icon|\.svg(\?|$)/i.test(decodeURIComponent(src));
          setMedia({ key, status: "ready", src, icon: i === 2 || logo });
          setVisible(true);
          return;
        }
      }
      if (force || results.every(r => r !== undefined)) { settled = true; setMedia({ key, status: "none" }); setVisible(true); }
    };
    [saved, liveImage, icon].forEach((promise, i) => promise.then(found => { results[i] = found; decide(false); }));
    const timer = window.setTimeout(() => decide(true), 600);
    return () => { settled = true; window.clearTimeout(timer); };
  }, [card?.key]);

  // 5 lines in total: measure how many lines the title actually takes (1 or 2) and give the
  // description the rest, leaving one line for the URL.
  useLayoutEffect(() => {
    const element = cardRef.current;
    const title = element?.querySelector<HTMLElement>(".wiki-hovercard-title");
    if (!element) return;
    let titleLines = 0;
    if (title) {
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight) || 20;
      titleLines = Math.min(2, Math.max(1, Math.round(title.scrollHeight / lineHeight)));
    }
    const site = element.querySelector(".wiki-hovercard-site") ? 1 : 0;
    let lines = Math.max(1, 5 - titleLines - site);
    // Beside a tall picture, let the description run as many lines as fit its height.
    const image = element.querySelector<HTMLImageElement>(".wiki-hovercard-thumb:not(.is-icon) img");
    const description = element.querySelector<HTMLElement>(".wiki-hovercard-copy > .wiki-hovercard-text:not(.wiki-hovercard-site)");
    const copy = element.querySelector<HTMLElement>(".wiki-hovercard-copy");
    if (image && image.complete && image.offsetHeight && description && copy) {
      const lineHeight = parseFloat(getComputedStyle(description).lineHeight) || 20;
      // Space the rest of the copy needs (title, URL, padding); the column itself is stretched
      // to the picture's height, so it can't be measured directly.
      const copyBox = copy.getBoundingClientRect();
      const descBox = description.getBoundingClientRect();
      const last = copy.lastElementChild?.getBoundingClientRect() ?? descBox;
      const padBottom = parseFloat(getComputedStyle(copy).paddingBottom) || 0;
      const overhead = (descBox.top - copyBox.top) + (last.bottom - descBox.bottom) + padBottom;
      lines = Math.max(lines, Math.floor((image.offsetHeight - overhead) / lineHeight));
    }
    element.style.setProperty("--wiki-card-lines", String(lines));
  });

  if (!card) return null;
  const ready = !card.href || (media.key === card.key && media.status !== "loading");
  // Switching links: keep showing the previous card until the new one is fully resolved, then
  // swap in one step at its final width (no text-only frame that rewraps when the picture lands).
  if (switching && visible && !ready && lastShown.current) return lastShown.current;
  // The card opens text-only; if a picture loads, the card widens to expose it (no placeholder).
  const hasMedia = !!card.href && media.key === card.key && media.status === "ready";
  const rawText = card.text ?? (liveText?.key === card.key ? liveText.text : undefined);
  // Descriptions cut mid-sentence by the source get an ellipsis instead of ending abruptly.
  let text = rawText;
  if (rawText && !/[.!?…"”)]$/.test(rawText.trim())) {
    // Cut mid-sentence by the source: end on the last full sentence if there is one, else
    // drop the dangling little words and add an ellipsis.
    const sentence = rawText.match(/^([\s\S]*[.!?])\s/)?.[1];
    text = sentence && sentence.length > 60 ? sentence : rawText.trim().replace(/(\s+(?:a|an|the|of|to|and|or|in|on|for|with|by|is|at))+$/i, "") + "…";
  }
  const node = createPortal(
    <div
      ref={cardRef}
      // Visible only once the picture question is settled, so the card never shows at one
      // width and then jumps to another.
      // Never indexed or quoted by search engines (people's details live here).
      data-nosnippet=""
      className={`wiki-hovercard${visible && ready ? " is-visible" : ""}${card.below ? " is-below" : ""}${hasMedia ? " has-media" : ""}${hasMedia && media.icon ? " has-icon" : ""}${!text && !card.bodyHtml ? " is-compact" : ""}`}
      style={{ left: card.left, ...(card.below ? { top: card.top } : { bottom: card.top }) }}
    >
      <div className="wiki-hovercard-copy">
        {card.title && <strong className="wiki-hovercard-title">{liveTitle?.key === card.key ? liveTitle.title : card.title}</strong>}
        {card.bodyHtml && <div className="wiki-hovercard-text" dangerouslySetInnerHTML={{ __html: card.bodyHtml }} />}
        {text && <div className="wiki-hovercard-text">{text}</div>}
        {card.site && <div className="wiki-hovercard-text wiki-hovercard-site">{card.site}</div>}
      </div>
      {hasMedia && (
        <div className={`wiki-hovercard-thumb${media.icon ? " is-icon" : ""}`}>
          <img src={media.src} alt="" referrerPolicy="no-referrer" onLoad={() => setImageLoads(count => count + 1)} />
        </div>
      )}
    </div>,
    document.body,
  );
  lastShown.current = visible && ready ? node : null;
  return node;
}

const translateLanguages: [string, string][] = [
  ["en", "English"],
  ["es", "Español"], ["zh-CN", "中文"], ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"], ["vi", "Tiếng Việt"],
  ["af", "Afrikaans"], ["ar", "العربية"], ["az", "Azərbaycanca"], ["id", "Bahasa Indonesia"], ["ms", "Bahasa Melayu"], ["bn", "বাংলা"],
  ["bg", "Български"], ["ca", "Català"], ["cs", "Čeština"], ["cy", "Cymraeg"], ["da", "Dansk"], ["et", "Eesti"],
  ["el", "Ελληνικά"], ["eo", "Esperanto"], ["eu", "Euskara"], ["fa", "فارسی"], ["ga", "Gaeilge"], ["gl", "Galego"],
  ["ko", "한국어"], ["hy", "Հայերեն"], ["hi", "हिन्दी"], ["hr", "Hrvatski"], ["is", "Íslenska"], ["he", "עברית"],
  ["ka", "ქართული"], ["sw", "Kiswahili"], ["lv", "Latviešu"], ["lt", "Lietuvių"], ["hu", "Magyar"], ["mk", "Македонски"],
  ["nl", "Nederlands"], ["ja", "日本語"], ["no", "Norsk"], ["uz", "Oʻzbekcha"], ["pl", "Polski"], ["pt", "Português"],
  ["ro", "Română"], ["ru", "Русский"], ["sq", "Shqip"], ["sk", "Slovenčina"], ["sl", "Slovenščina"], ["sr", "Српски"],
  ["fi", "Suomi"], ["sv", "Svenska"], ["tl", "Tagalog"], ["ta", "தமிழ்"], ["th", "ไทย"], ["tr", "Türkçe"],
  ["uk", "Українська"], ["ur", "اردو"], ["zh-TW", "繁體中文"],
];

// Language names are shown in the page's current language (English names on the English
// page) and sorted alphabetically by that name.
const languageList = (display: string) => {
  let names: Intl.DisplayNames | null = null;
  try { names = new Intl.DisplayNames([display], { type: "language" }); } catch { /* fall back */ }
  return translateLanguages
    .map(([code, native]) => [code, (names?.of(code) ?? native).replace(/\s*\(.*\)$/, "")] as [string, string])
    .map(([code, name]) => [code, code === "zh-TW" ? `${name} (Traditional)` : code === "zh-CN" ? `${name} (Simplified)` : name] as [string, string])
    .map(([code, name]) => [code, name.charAt(0).toLocaleUpperCase(display) + name.slice(1)] as [string, string])
    // English is always labelled "English" (so it's easy to get back to) and sorts in its
    // alphabetical place like every other name.
    .map(([code, name]) => [code, code === "en" ? "English" : name] as [string, string])
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB, display, { sensitivity: "base" }));
};

// "So many languages": the title-row label (it keeps its scroll hand-off with the sticky
// icons) opens a borderless card of languages; picking one opens this page translated.
export function LanguageMenu({ icon }: { icon?: ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const [cardPos, setCardPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  // Current language: Google's translation cookie, or English.
  const [current, setCurrent] = useState("en");
  useEffect(() => { setCurrent(document.cookie.match(/googtrans=\/en\/([\w-]+)/)?.[1] ?? "en"); }, []);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);
  const openAt = (button: HTMLElement) => {
    window.clearTimeout(closeTimer.current);
    const box = button.getBoundingClientRect();
    setCardPos({ top: box.bottom + 10, right: Math.max(16, window.innerWidth - box.right) });
    // Only one menu open at a time: close the search list (it closes on blur) and other menus.
    if (document.activeElement instanceof HTMLElement && document.activeElement.closest(".wiki-search")) document.activeElement.blur();
    window.dispatchEvent(new CustomEvent("alexpedia-popover", { detail: rootRef.current }));
    setOpen(true);
  };
  const scheduleClose = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 220); };
  useEffect(() => {
    const onOther = (event: Event) => { if ((event as CustomEvent).detail !== rootRef.current) setOpen(false); };
    window.addEventListener("alexpedia-popover", onOther);
    return () => window.removeEventListener("alexpedia-popover", onOther);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node) && !cardRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    // Scrolling the page closes it (scrolling inside the card scrolls only the card). The
    // phone sheet stays open until a tap outside or a pick.
    // Smooth scrolling keeps firing small scroll events after a wheel stops, so only a real
    // scroll (40px+) closes it.
    const startY = window.scrollY;
    const onScroll = () => { if (!window.matchMedia("(max-width: 768px)").matches && Math.abs(window.scrollY - startY) > 40) setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); window.removeEventListener("scroll", onScroll); };
  }, [open]);
  // Translates the page in place with Google's Website Translator (no new tab). The widget is
  // loaded on first use and hidden; picking a language drives its language select.
  const translate = (code: string) => {
    setOpen(false);
    window.dispatchEvent(new Event("alexpedia-translate"));
    setCurrent(code);
    const w = window as Window & { google?: { translate?: { TranslateElement: new (options: object, id: string) => unknown } }; googleTranslateReady?: () => void };
    // Wait until Google has filled its language list, then pick the language (no reload).
    const apply = (tries = 0) => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      const target = code === "en" ? "" : code;
      const ready = select && (target === "" || [...select.options].some(option => option.value === target));
      if (!ready) { if (tries < 60) window.setTimeout(() => apply(tries + 1), 150); return; }
      if (code === "en") {
        // Back to the original in place: click Google's own "Show original" button inside its
        // (hidden) toolbar frame, or clear the language select. Clear the cookie too so a later
        // visit isn't translated. Reload only as a last resort if the page stays translated.
        const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        const host = window.location.hostname;
        const parent = host.split(".").slice(-2).join(".");
        for (const domain of ["", `; domain=${host}`, `; domain=.${host}`, `; domain=.${parent}`]) document.cookie = `googtrans=; ${expire}${domain}`;
        let restored = false;
        for (const frame of Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe"))) {
          try {
            const button = frame.contentDocument?.querySelector<HTMLElement>("[id$='.restore'], button[id*='restore']");
            if (button) { button.click(); restored = true; break; }
          } catch { /* cross-origin frame */ }
        }
        if (!restored) { select.value = ""; select.dispatchEvent(new Event("change")); }
        window.setTimeout(() => {
          if (document.documentElement.matches(".translated-ltr, .translated-rtl")) window.location.reload();
        }, 1500);
        return;
      }
      select.value = target;
      select.dispatchEvent(new Event("change"));
    };
    if (w.google?.translate) { apply(); return; }
    if (!document.getElementById("google-translate-host")) {
      const host = document.createElement("div");
      host.id = "google-translate-host";
      host.hidden = true;
      document.body.append(host);
      w.googleTranslateReady = () => { new w.google!.translate!.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google-translate-host"); apply(); };
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateReady";
      document.body.append(script);
    }
  };

  return (
    <div ref={rootRef} className={`wiki-language${icon ? " wiki-language-icon" : ""}${open ? " is-open" : ""}`}>
      <button type="button" className="wiki-language-button" aria-expanded={open} aria-label={icon ? "Languages" : undefined} title={icon ? "Languages" : undefined}
        // Hover already opened it on desktop, so a click must not toggle it shut; touch toggles.
        onClick={event => (open && !window.matchMedia("(hover: hover)").matches ? setOpen(false) : openAt(event.currentTarget))}
        // Desktop: opens on hover like the other cards.
        onMouseEnter={event => { if (window.matchMedia("(hover: hover)").matches) openAt(event.currentTarget); }}
        onMouseLeave={scheduleClose}>
        {icon ?? `${translateLanguages.length} languages`}
      </button>
      {open && createPortal(
        // Portaled to <body>: the header's transforms/opacity hand-off would otherwise hide or
        // misplace a fixed card inside it.
        <div ref={cardRef} className="wiki-language-card notranslate" translate="no" role="dialog" aria-label="Translate this page" data-lenis-prevent style={{ top: cardPos.top, right: cardPos.right }}
          onMouseEnter={() => window.clearTimeout(closeTimer.current)} onMouseLeave={scheduleClose}>
          <ul>
            {languageList(current).map(([code, name]) => (
              <li key={code}>
                <button type="button" className={code === current ? "is-current" : ""} aria-current={code === current ? "true" : undefined}
                  onClick={() => (code === current ? setOpen(false) : translate(code))}>{name}</button>
              </li>
            ))}
          </ul>
          {/* Back to the original (untranslated) page. */}
          {current !== "en" && <button type="button" className="wiki-language-reset" onClick={() => translate("en")}>Reset to default</button>}
        </div>,
        document.body,
      )}
    </div>
  );
}
