"use client";

import { useEffect, useState } from "react";
import type { BibbleTheme } from "@/types/theme";

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

export function useTheme() {
  // Keep server and client markup identical. The saved choice is applied after
  // hydration, once localStorage and the document are available.
  const [theme, setTheme] = useState<BibbleTheme>("strawberry-red");

  useEffect(() => {
    const savedTheme = getCurrentTheme();
    const rafId = requestAnimationFrame(() => {
      setTheme((prev) => (prev !== savedTheme ? savedTheme : prev));
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

    window.addEventListener("bibble-theme-change", handleThemeChange);

    const observer = new MutationObserver(() => {
      const next = getCurrentTheme();
      setTheme((prev) => (prev !== next ? next : prev));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("bibble-theme-change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  return {
    theme,
    motif: themeMotifs[theme] || themeMotifs["strawberry-red"],
  };
}
