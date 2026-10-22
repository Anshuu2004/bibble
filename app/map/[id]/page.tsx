import { LearningMapCanvas } from "@/components/map/learning-map";
import { MapHeader } from "@/components/map/map-header";
import { getMapById, getMapProgress } from "@/data/sample-maps";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const map = getMapById(id);
  if (!map) notFound();

  return (
    <main className="map-page">
      <MapHeader
        title={map.title}
        category={map.category}
        mapId={map.id}
      />
      <div className="map-page-copy">
        <Link href="/explore" className="back-link">
          <ArrowLeft size={15} /> All maps
        </Link>
        <p>{map.description}</p>
        <span>{getMapProgress(map)}% grown · {map.bibbles.length} bibbles</span>
      </div>
      <LearningMapCanvas initialMap={map} />
    </main>
  );
}
