import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "../create-page.module.css";

export function CreateMapHeader() {
  const { motif } = useTheme();

  return (
    <header className={styles.header}>
      <Link href="/" className="brand" aria-label="Bibble home">
        <span className="brand-mark" aria-hidden="true">
          {motif.brandEmoji}
        </span>
        <span>Bibble</span>
      </Link>
      <Link href="/explore" className={styles.browseLink}>
        <ArrowLeft size={15} /> Browse maps
      </Link>
    </header>
  );
}
