export type AppLanguage = "en" | "bn";

export const LANGUAGES: { code: AppLanguage; label: string; native: string }[] =
  [
    { code: "en", label: "English", native: "English" },
    { code: "bn", label: "Bangla", native: "বাংলা" },
  ];

export function normalizeLanguage(lang?: string | null): AppLanguage {
  if (lang === "bn" || lang === "bangla" || lang === "bd") return "bn";
  return "en";
}

export type I18nMap = Partial<Record<AppLanguage, string>>;

export function parseI18nMap(raw: string | null | undefined): I18nMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as I18nMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function serializeI18nMap(map: I18nMap): string {
  return JSON.stringify(map);
}
