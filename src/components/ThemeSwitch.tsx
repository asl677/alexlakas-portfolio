"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const storageKey = "alexpedia-theme";

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const syncTheme = () => setIsDark(document.documentElement.dataset.theme === "dark");
    syncTheme();
    window.addEventListener("alexpedia-theme-change", syncTheme);
    return () => window.removeEventListener("alexpedia-theme-change", syncTheme);
  }, []);

  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    // Pointer clicks should not leave a focus ring behind when the icon swaps.
    if (event.detail > 0) event.currentTarget.blur();
    const nextTheme = isDark ? "light" : "dark";
    // Swap every color in one frame; per-component transitions otherwise flash mismatched boxes.
    const root = document.documentElement;
    root.classList.add("theme-switching");
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event("alexpedia-theme-change"));
    void root.offsetHeight;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  }

  const button = (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={isDark ? "Use light theme" : "Use dark theme"} title={isDark ? "Use light theme" : "Use dark theme"}>
      {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
    </button>
  );

  return button;
}
