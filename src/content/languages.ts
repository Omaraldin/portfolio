import raw from "@/data/languages.json";

export type Language = {
  name: string;
  /**
   * Free text rather than an enum. The conventional wordings — "Native",
   * "Professional working proficiency", "B2" — differ by region and by what a
   * given employer expects, so the phrasing stays the author's choice.
   */
  level: string;
};

export const languages: Language[] = (raw as unknown[])
  .map((value) => {
    if (typeof value !== "object" || value === null) return null;
    const l = value as Record<string, unknown>;

    const name = typeof l.name === "string" ? l.name.trim() : "";
    if (!name) return null;

    return {
      name,
      level: typeof l.level === "string" ? l.level.trim() : "",
    };
  })
  .filter((l): l is Language => l !== null);
