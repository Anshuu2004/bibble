"use client";

import { Pencil, Sparkles, Check, Save } from "lucide-react";
import Link from "next/link";
import { LearningMap } from "@/types/map";

interface MapHeaderProps {
  map: LearningMap;
  onSave?: () => void;
  saved?: boolean;
}

export function MapHeader({ map, onSave, saved }: MapHeaderProps) {
  return (
    <header className="map-page-header">
      <Link href="/explore" className="brand">
        <span className="brand-mark-emoji">🍓</span>
        <span>Bibble</span>
      </Link>
      <div className="map-page-title">
        <span className="eyebrow">
          {map.category} <Sparkles size={13} />
        </span>
        <h1>{map.title}</h1>
      </div>
      <div className="header-actions">
        {onSave && (
          <button
            className={`header-action-btn ${saved ? "saved" : ""}`}
            onClick={onSave}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? "Map saved" : "Save Map"}
          </button>
        )}
        <Link href={`/map/${map.id}/edit`} className="header-action">
          <Pencil size={15} /> Edit map
        </Link>
      </div>
    </header>
  );
}
