"use client";

import { themes } from "@/data/themes";
import { themeMotifs, useTheme } from "@/hooks/use-theme";
import type { BibbleTheme } from "@/types/theme";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { theme, mode, setTheme, setMode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const chooseTheme = (next: BibbleTheme) => {
    setTheme(next);
    setOpen(false);
  };

  const currentOption = themes.find((t) => t.id === theme) ?? themes[0];
  const currentMotif = themeMotifs[theme] || themeMotifs["strawberry-red"];

  if (compact) {
    return (
      <div className="theme-picker-compact-wrap" ref={dropdownRef}>
        {/* Single unified theme & appearance button */}
        <button
          type="button"
          className="theme-picker-compact-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Theme: ${currentOption.name}, ${mode === "dark" ? "Dark" : "Light"} mode. Click to change.`}
          title={`Theme: ${currentOption.name} (${mode === "dark" ? "Dark" : "Light"})`}
        >
          <span className="theme-compact-emoji" aria-hidden="true">
            {currentMotif.brandEmoji}
          </span>
          <span className="theme-name-tag">{currentOption.name}</span>
          <span className="theme-mode-pill-icon" aria-hidden="true">
            {mode === "dark" ? <Moon size={13} /> : <Sun size={13} />}
          </span>
        </button>

        {open && (
          <div className="theme-picker-dropdown" role="dialog" aria-label="Theme and appearance settings">
            {/* Appearance Mode Segmented Control */}
            <div className="theme-dropdown-section">
              <span className="theme-dropdown-section-title">
                Appearance
              </span>
              <div className="theme-mode-segmented-control" role="radiogroup" aria-label="Color appearance">
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === "light"}
                  className={`theme-mode-segment ${mode === "light" ? "active" : ""}`}
                  onClick={() => setMode("light")}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === "dark"}
                  className={`theme-mode-segment ${mode === "dark" ? "active" : ""}`}
                  onClick={() => setMode("dark")}
                >
                  <Moon size={14} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Themes List */}
            <div className="theme-dropdown-section">
              <span className="theme-dropdown-section-title">
                Color Palette
              </span>
              <div className="theme-dropdown-list" role="listbox" aria-label="Available themes">
                {themes.map((option) => {
                  const isSelected = theme === option.id;
                  const motif = themeMotifs[option.id];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`theme-dropdown-item ${isSelected ? "active" : ""}`}
                      onClick={() => chooseTheme(option.id)}
                    >
                      <span
                        className="theme-mark"
                        style={{ backgroundColor: option.swatches[2] }}
                        aria-hidden="true"
                      >
                        {motif.brandEmoji}
                      </span>
                      <div className="theme-item-text">
                        <strong>{option.name}</strong>
                        <span className="theme-item-swatches" aria-hidden="true">
                          {option.swatches.map((color) => (
                            <span
                              key={color}
                              className="theme-swatch-dot"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                      </div>
                      {isSelected && <Check size={16} className="theme-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="theme-picker">
      <div className="theme-picker-header-row">
        <span className="theme-picker-label">
          <Palette size={15} /> Cozy Themes
        </span>
        <button
          type="button"
          className="theme-mode-toggle-pill"
          onClick={toggleMode}
        >
          {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          <span>{mode === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      <div className="theme-options" role="radiogroup" aria-label="Choose theme">
        {themes.map((option) => {
          const isSelected = theme === option.id;
          const motif = themeMotifs[option.id];
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`theme-option theme-option-${option.id} ${
                isSelected ? "theme-option-active" : ""
              }`}
              onClick={() => chooseTheme(option.id)}
              aria-label={`Use ${option.name} theme`}
            >
              <div className="theme-option-top">
                <span className="theme-option-icon">{motif.brandEmoji}</span>
                <span className="theme-swatches">
                  {option.swatches.map((color) => (
                    <i key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
                {isSelected && <Check size={16} className="theme-check" />}
              </div>
              <div className="theme-option-body">
                <strong>{option.name}</strong>
                <small>{option.description}</small>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
