"use client";

import { LearningMapCanvas } from "@/components/map/learning-map";
import { sampleMaps } from "@/data/sample-maps";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LearningMap } from "@/types/map";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export function MapPageClient() {
  const { id } = useParams<{ id: string }>();
  const [storedMaps, , storedHydrated] = useLocalStorage<LearningMap[]>("bibble-maps", []);
  const [deletedMapIds, , deletedHydrated] = useLocalStorage<string[]>("bibble-deleted-maps", []);
  const hydrated = storedHydrated && deletedHydrated;

  const map = useMemo(() => {
    if (deletedMapIds.includes(id)) return null;
    return storedMaps.find((storedMap) => storedMap.id === id)
      ?? sampleMaps.find((sampleMap) => sampleMap.id === id)
      ?? null;
  }, [storedMaps, deletedMapIds, id]);

  if (!hydrated) {
    return (
      <main className="empty-state">
        <h2>Loading map…</h2>
      </main>
    );
  }

  if (!map) {
    return (
      <main className="empty-state">
        <h2>This map wandered off.</h2>
        <Link href="/explore" className="text-link">
          Back to explore <ArrowLeft size={15} />
        </Link>
      </main>
    );
  }

  return <LearningMapCanvas initialMap={map} />;
}
