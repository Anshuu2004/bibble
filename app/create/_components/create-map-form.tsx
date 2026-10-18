import type { CreateLearningMapInput } from "@/lib/maps/create-learning-map";
import { useTheme } from "@/hooks/use-theme";
import { ArrowUpRight } from "lucide-react";
import { FormEvent } from "react";
import styles from "../create-page.module.css";

interface CreateMapFormProps {
  values: CreateLearningMapInput;
  onChange: (values: CreateLearningMapInput) => void;
  onCreate: (values: CreateLearningMapInput) => void;
}

export function CreateMapForm({ values, onChange, onCreate }: CreateMapFormProps) {
  const { motif } = useTheme();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeading}>
        <span aria-hidden="true">{motif.badgeEmoji}</span>
        <div>
          <h2>Name your world</h2>
          <p>Keep it simple — you can change everything later.</p>
        </div>
      </div>

      <label htmlFor="map-name">
        Map name
        <input
          id="map-name"
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
          placeholder="e.g. Ceramic painting"
          autoFocus
        />
      </label>

      <label htmlFor="map-description">
        Description <span className={styles.optional}>Optional</span>
        <textarea
          id="map-description"
          value={values.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          placeholder="What do you want this little world to help you grow?"
          rows={4}
        />
      </label>

      <label htmlFor="map-category">
        Category
        <input
          id="map-category"
          value={values.category}
          onChange={(event) => onChange({ ...values, category: event.target.value })}
          placeholder="e.g. Creative practice"
        />
      </label>

      <button className={`button-primary ${styles.submit}`} type="submit">
        Create map <ArrowUpRight size={17} />
      </button>
    </form>
  );
}
