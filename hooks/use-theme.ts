"use client";

import { useEffect, useState } from "react";
import type { BibbleTheme, ThemeMode } from "@/types/theme";

export interface ThemeMotifData {
  id: BibbleTheme;
  name: string;
  brandEmoji: string;
  badgeEmoji: string;
  fruitEmoji: string;
  secondaryFruitEmoji: string;
  treatName: string;
  treatEmoji: string;
  catAccessory: string;
  sipToast: string;
  floatingMotifs: string[];
}

export const themeMotifs: Record<BibbleTheme, ThemeMotifData> = {
  "strawberry-red": {
    id: "strawberry-red",
    name: "Strawberry Red",
    brandEmoji: "🍓",
    badgeEmoji: "🍓",
    fruitEmoji: "🍓",
    secondaryFruitEmoji: "🍰",
    treatName: "Iced Strawberry Milk",
    treatEmoji: "🍓",
    catAccessory: "🍓",
    sipToast: "Sipped delicious Iced Strawberry Milk 🍓 +10 cozy berry momentum!",
    floatingMotifs: ["🍓", "🍰", "🍓"],
  },
  "refreshing-green": {
    id: "refreshing-green",
    name: "Refreshing Green",
    brandEmoji: "🍏",
    badgeEmoji: "🍃",
    fruitEmoji: "🍏",
    secondaryFruitEmoji: "🌿",
    treatName: "Mint Green Apple Tea",
    treatEmoji: "🍏",
    catAccessory: "🌿",
    sipToast: "Sipped crisp Mint Green Apple Tea 🍏🌿 +10 refreshing focus momentum!",
    floatingMotifs: ["🍏", "🌿", "🍃"],
  },
  "strawberry-lemonade": {
    id: "strawberry-lemonade",
    name: "Strawberry Lemonade Beach",
    brandEmoji: "🌺",
    badgeEmoji: "🌺",
    fruitEmoji: "🌺",
    secondaryFruitEmoji: "🍹",
    treatName: "Exotic Flower Lemonade",
    treatEmoji: "🌺",
    catAccessory: "🕶️",
    sipToast: "Sipped Exotic Flower Lemonade 🌺🍹 +10 tropical beach momentum!",
    floatingMotifs: ["🌺", "🍹", "🌸"],
  },
};

function getCurrentTheme(): BibbleTheme {
  if (typeof document === "undefined") return "strawberry-red";
  const current = document.documentElement.dataset.theme as BibbleTheme;
  if (current && themeMotifs[current]) return current;
  const saved = localStorage.getItem("bibble-theme") as BibbleTheme;
  if (saved && themeMotifs[saved]) return saved;
  return "strawberry-red";
}

function getCurrentMode(): ThemeMode {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  const saved = localStorage.getItem("bibble-theme-mode") as ThemeMode;
  if (saved === "dark" || saved === "light") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function setAppTheme(next: BibbleTheme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.add("theme-transitioning");
  document.documentElement.dataset.theme = next;
  window.localStorage.setItem("bibble-theme", next);
  window.dispatchEvent(new CustomEvent("bibble-theme-change", { detail: next }));
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 400);
}

export function setAppMode(next: ThemeMode) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.add("theme-transitioning");
  if (next === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.themeMode = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.themeMode = "light";
  }
  window.localStorage.setItem("bibble-theme-mode", next);
  window.dispatchEvent(new CustomEvent("bibble-mode-change", { detail: next }));
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 400);
}

export function useTheme() {
  const [theme, setTheme] = useState<BibbleTheme>("strawberry-red");
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = getCurrentTheme();
    const savedMode = getCurrentMode();

    const rafId = requestAnimationFrame(() => {
      setTheme((prev) => (prev !== savedTheme ? savedTheme : prev));
      setMode((prev) => (prev !== savedMode ? savedMode : prev));
    });

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<BibbleTheme>;
      if (customEvent.detail && themeMotifs[customEvent.detail]) {
        setTheme(customEvent.detail);
      } else {
        const next = getCurrentTheme();
        setTheme((prev) => (prev !== next ? next : prev));
      }
    };

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setMode(customEvent.detail);
      } else {
        const next = getCurrentMode();
        setMode((prev) => (prev !== next ? next : prev));
      }
    };

    window.addEventListener("bibble-theme-change", handleThemeChange);
    window.addEventListener("bibble-mode-change", handleModeChange);

    const observer = new MutationObserver(() => {
      const nextTheme = getCurrentTheme();
      const nextMode = getCurrentMode();
      setTheme((prev) => (prev !== nextTheme ? nextTheme : prev));
      setMode((prev) => (prev !== nextMode ? nextMode : prev));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "data-theme-mode"],
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("bibble-theme-change", handleThemeChange);
      window.removeEventListener("bibble-mode-change", handleModeChange);
      observer.disconnect();
    };
  }, []);

  const toggleMode = () => {
    const nextMode = mode === "dark" ? "light" : "dark";
    setAppMode(nextMode);
  };

  return {
    theme,
    mode,
    setTheme: setAppTheme,
    setMode: setAppMode,
    toggleMode,
    isDark: mode === "dark",
    motif: themeMotifs[theme] || themeMotifs["strawberry-red"],
  };
}
