"use client";

import { themes } from "@/data/themes";
import { themeMotifs, useTheme } from "@/hooks/use-theme";
import type { BibbleTheme } from "@/types/theme";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

function applyTheme(next: BibbleTheme) {
  if (typeof window === "undefined") return;
  document.documentElement.dataset.theme = next;
  window.localStorage.setItem("bibble-theme", next);
  window.dispatchEvent(new CustomEvent("bibble-theme-change", { detail: next }));
}

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const chooseTheme = (next: BibbleTheme) => {
    applyTheme(next);
    setOpen(false);
  };

  const currentOption = themes.find((t) => t.id === theme) ?? themes[0];

  if (compact) {
    return (
      <div className="theme-picker-compact-wrap">
        <button
          className="theme-picker-compact-btn"
          onClick={() => setOpen((v) => !v)}
          title={`Theme: ${currentOption.name}`}
          aria-expanded={open}
          aria-label={`Choose theme. Current theme: ${currentOption.name}`}
        >
          <Palette size={14} aria-hidden="true" />
          <span className="theme-name-tag">Theme</span>
        </button>

        {open && (
          <div className="theme-picker-dropdown">
            <div className="theme-dropdown-list">
              {themes.map((option) => (
                <button
                  key={option.id}
                  className={`theme-dropdown-item ${theme === option.id ? "active" : ""}`}
                  onClick={() => chooseTheme(option.id)}
                >
                  <span
                    className="theme-mark"
                    style={{ backgroundColor: option.swatches[2] }}
                    aria-hidden="true"
                  >
                    {themeMotifs[option.id].brandEmoji}
                  </span>
                  <div className="theme-item-text">
                    <strong>{option.name}</strong>
                  </div>
                  {theme === option.id && <Check size={14} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="theme-picker">
      <span className="theme-picker-label">
        <Palette size={14} /> Cozy Theme
      </span>
      <div className="theme-options" role="group" aria-label="Choose theme">
        {themes.map((option) => (
          <button
            key={option.id}
            className={`theme-option theme-option-${option.id} ${
              theme === option.id ? "theme-option-active" : ""
            }`}
            onClick={() => chooseTheme(option.id)}
            aria-label={`Use ${option.name} theme`}
            aria-pressed={theme === option.id}
          >
            <span className="theme-swatches">
              {option.swatches.map((color) => (
                <i key={color} style={{ backgroundColor: color }} />
              ))}
            </span>
            <span>
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

