"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

const getSystemTheme = (media: MediaQueryList): Theme =>
  media.matches ? "dark" : "light";

const getThemeColor = (theme: Theme) =>
  theme === "dark" ? "#000000" : "#f5f5f5";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("dark");
  const manualTheme = useRef(false);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("portfolio-theme");
    } catch {}
    manualTheme.current = saved === "light" || saved === "dark";
    const applyTheme = (next: Theme) => {
      document.documentElement.dataset.theme = next;
      document
        .querySelector<HTMLMetaElement>("meta[name='theme-color']")
        ?.setAttribute("content", getThemeColor(next));
      setTheme(next);
    };
    applyTheme(manualTheme.current ? (saved as Theme) : getSystemTheme(systemTheme));
    const onSystemChange = () => {
      if (!manualTheme.current) applyTheme(getSystemTheme(systemTheme));
    };
    systemTheme.addEventListener("change", onSystemChange);
    return () => systemTheme.removeEventListener("change", onSystemChange);
  }, []);

  const selectTheme = (next: Theme) => {
    manualTheme.current = true;
    document.documentElement.dataset.theme = next;
    document
      .querySelector<HTMLMetaElement>("meta[name='theme-color']")
      ?.setAttribute("content", getThemeColor(next));
    setTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {}
  };

  return (
    <div className="theme-switch">
      <button
        type="button"
        className={`theme-dot theme-dot-${theme === "dark" ? "light" : "dark"}`}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={() => selectTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  );
}
