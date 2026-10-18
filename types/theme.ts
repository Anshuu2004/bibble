export type BibbleTheme =
  | "strawberry-red"
  | "refreshing-green"
  | "strawberry-lemonade";

export interface ThemeOption {
  id: BibbleTheme;
  name: string;
  description: string;
  swatches: string[];
}


