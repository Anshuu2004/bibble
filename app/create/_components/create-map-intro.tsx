import { MapPreview } from "@/components/map/map-preview";
import { useTheme } from "@/hooks/use-theme";
import type { LearningMap } from "@/types/map";
import { Sparkles } from "lucide-react";
import styles from "../create-page.module.css";

export function CreateMapIntro({ map }: { map: LearningMap }) {
  const { motif } = useTheme();

  return (
    <section className={styles.intro} aria-labelledby="create-title">
      <span className="eyebrow">
        <Sparkles size={14} /> A fresh little start
      </span>
      <h1 id="create-title">Create your learning map.</h1>
      <p>Start with one small idea. You can add its paths and details next.</p>
      <div className={styles.motif} aria-hidden="true">
        <span>{motif.fruitEmoji}</span>
        <span>{motif.secondaryFruitEmoji}</span>
        <span>{motif.fruitEmoji}</span>
      </div>
      <div className={styles.previewWrap}>
        <div className={styles.previewLabel}>
          <Sparkles size={13} /> Your starter roadmap
        </div>
        <MapPreview map={map} compact />
      </div>
    </section>
  );
}
