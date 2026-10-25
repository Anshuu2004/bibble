"use client";

import { MapPreview } from "@/components/map/map-preview";
import { getMapProgress } from "@/data/sample-maps";
import type { LearningMap } from "@/types/map";
import { ArrowUpRight, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

interface MapCardProps {
  map: LearningMap;
  onDelete: (mapId: string) => void;
}

export function MapCard({ map, onDelete }: MapCardProps) {
  const progress = getMapProgress(map);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!showDeleteDialog) return;

    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowDeleteDialog(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteDialog]);

  const handleConfirmDelete = () => {
    onDelete(map.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <article className="map-card">
        <div className="map-card-preview">
          <MapPreview map={map} compact />
          <span className="map-card-count">
            <Star size={13} /> {map.bibbles.length} bibbles
          </span>
        </div>
        <div className="map-card-body">
          <div className="map-card-meta">
            <span>{map.category}</span>
            <span>{progress}% grown</span>
          </div>
          <h2>{map.title}</h2>
          <p>{map.description}</p>
          <div className="map-card-footer">
            <div className="tiny-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`${map.title} progress`}>
              <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
            <button
              type="button"
              className="map-delete-btn"
              onClick={() => setShowDeleteDialog(true)}
              aria-label={`Delete ${map.title}`}
              title="Delete this map"
            >
              <Trash2 size={16} />
            </button>
            <Link href={`/map/${map.id}`} className="round-link" aria-label={`Explore ${map.title}`}>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </article>

      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div
            className="dialog-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id={titleId}>Delete this map?</h3>
            <p>Are you sure you want to delete &quot;{map.title}&quot;? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button
                ref={cancelRef}
                type="button"
                className="dialog-cancel-btn"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dialog-delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
