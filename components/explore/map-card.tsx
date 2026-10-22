import { MapPreview } from "@/components/map/map-preview";
import { getMapProgress } from "@/data/sample-maps";
import type { LearningMap } from "@/types/map";
import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";

export function MapCard({ map }: { map: LearningMap }) {
  const progress = getMapProgress(map);
  return <article className="map-card">
    <div className="map-card-preview"><MapPreview map={map} compact /><span className="map-card-count"><Star size={13} /> {map.bibbles.length} bibbles</span></div>
    <div className="map-card-body"><div className="map-card-meta"><span>{map.category}</span><span>{progress}% grown</span></div><h2>{map.title}</h2><p>{map.description}</p><div className="map-card-footer"><div className="tiny-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`${map.title} progress`}><span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div><Link href={`/map/${map.id}`} className="round-link" aria-label={`Explore ${map.title}`}><ArrowUpRight size={18} /></Link></div></div>
  </article>;
}
