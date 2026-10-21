"use client";

import { ThemePicker } from "@/components/ui/theme-picker";
import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";
import Link from "next/link";

interface MapHeaderProps {
  title: string;
  category: string;
  mapId: string;
  isEditing?: boolean;
}

export function MapHeader({ title, category, mapId, isEditing = false }: MapHeaderProps) {
  const { motif } = useTheme();

  return (
    <header className="map-page-header">
      <Link href="/explore" className="brand" aria-label="Bibble explore">
        <span className="brand-mark" aria-hidden="true">
          {motif.brandEmoji}
        </span>
        <span>Bibble</span>
      </Link>

      <div className="map-page-title">
        <span className="eyebrow">
          {category} <Sparkles size={13} />
        </span>
        <h1>{isEditing ? `Editing: ${title}` : title}</h1>
      </div>

      <div className="map-page-actions">
        <ThemePicker compact />
        {isEditing ? (
          <Link href={`/map/${mapId}`} className="header-action">
            <ArrowLeft size={15} /> Back to map
          </Link>
        ) : (
          <Link href={`/map/${mapId}/edit`} className="header-action">
            <Pencil size={15} /> Edit map
          </Link>
        )}
      </div>
    </header>
  );
}
