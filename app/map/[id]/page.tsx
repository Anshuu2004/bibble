import { LearningMapCanvas } from "@/components/map/learning-map";
import { getMapById } from "@/data/sample-maps";
import { notFound } from "next/navigation";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const map = getMapById(id);
  if (!map) notFound();
  return <LearningMapCanvas initialMap={map} />;
}
