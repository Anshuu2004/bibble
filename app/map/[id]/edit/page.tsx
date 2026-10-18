"use client";

import { LearningMapCanvas } from "@/components/map/learning-map";
import { getMapById } from "@/data/sample-maps";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LearningMap } from "@/types/map";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditMapPage() {
  const { id } = useParams<{ id: string }>();
  const [storedMaps] = useLocalStorage<LearningMap[]>("bibble-maps", []);
  const map = storedMaps.find((storedMap) => storedMap.id === id) ?? getMapById(id);
  if (!map) return <main className="empty-state"><h2>This map wandered off.</h2><Link href="/explore" className="text-link">Back to explore <ArrowLeft size={15} /></Link></main>;
  return <main className="map-page"><header className="map-page-header"><Link href="/" className="brand"><span className="brand-mark-emoji">🍓</span><span>Bibble</span></Link><div className="editor-title"><Link href={`/map/${map.id}`} className="back-link"><ArrowLeft size={15} /> Back to map</Link><h1>Editing {map.title}</h1></div></header><LearningMapCanvas initialMap={map} editable /></main>;
}
