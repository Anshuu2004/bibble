"use client";

import { MapCard } from "@/components/explore/map-card";
import { SiteHeader } from "@/components/site-header";
import { categories } from "@/data/categories";
import { sampleMaps } from "@/data/sample-maps";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LearningMap } from "@/types/map";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All maps");
  // Read user-saved map overrides from localStorage
  const [storedMaps] = useLocalStorage<LearningMap[]>("bibble-maps", []);

  // Merge: storedMaps replace their matching sampleMap (same id); rest stay as-is
  const allMaps = useMemo(() => {
    return sampleMaps.map((sample) => {
      const saved = storedMaps.find((m) => m.id === sample.id);
      return saved ?? sample;
    });
  }, [storedMaps]);

  const maps = useMemo(
    () => allMaps.filter(
      (map) =>
        (category === "All maps" || map.category === category) &&
        `${map.title} ${map.description}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [allMaps, category, query],
  );

  return (
    <main className="app-page">
      <SiteHeader />
      <section className="page-intro">
        <div>
          <span className="eyebrow"><Star size={14} /> Small worlds of knowledge</span>
          <h1>Find a map that feels like yours.</h1>
          <p>Browse a few learning worlds made for wandering, connecting, and coming back to.</p>
        </div>
        <div className="explore-stats"><strong>{sampleMaps.length}</strong><span>sample maps<br />to explore</span></div>
      </section>
      <section className="explore-controls">
        <label className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search maps" aria-label="Search maps" />
        </label>
        <div className="category-row" role="group" aria-label="Filter by category">
          <SlidersHorizontal size={16} />
          {categories.map((item) => (
            <button key={item} className={category === item ? "category-active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
      </section>
      <section className="map-grid">
        {maps.map((map) => <MapCard key={map.id} map={map} />)}
      </section>
      {maps.length === 0 && (
        <div className="empty-state">
          <Star size={22} /><h2>No bibbles here yet.</h2><p>Try a different search or category.</p>
        </div>
      )}
    </main>
  );
}
