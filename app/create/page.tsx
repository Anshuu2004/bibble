"use client";

import { CreateMapForm } from "@/app/create/_components/create-map-form";
import { CreateMapHeader } from "@/app/create/_components/create-map-header";
import { CreateMapIntro } from "@/app/create/_components/create-map-intro";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  createLearningMap,
  type CreateLearningMapInput,
} from "@/lib/maps/create-learning-map";
import type { LearningMap } from "@/types/map";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./create-page.module.css";

export default function CreatePage() {
  const router = useRouter();
  const [, setMaps] = useLocalStorage<LearningMap[]>("bibble-maps", []);
  const [values, setValues] = useState<CreateLearningMapInput>({
    title: "",
    description: "",
    category: "Personal growth",
  });
  const previewMap = useMemo(
    () => createLearningMap({ ...values, title: values.title || "Your learning map" }, "map-preview"),
    [values],
  );

  function handleCreateMap(values: CreateLearningMapInput) {
    const newMap = createLearningMap(values);

    setMaps((currentMaps) => [...currentMaps, newMap]);
    router.push(`/map/${newMap.id}/edit`);
  }

  return (
    <main className={styles.page}>
      <CreateMapHeader />
      <div className={styles.layout}>
        <CreateMapIntro map={previewMap} />
        <CreateMapForm values={values} onChange={setValues} onCreate={handleCreateMap} />
      </div>
    </main>
  );
}
