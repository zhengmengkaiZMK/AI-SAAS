export const i18n = {
  defaultLanguage: "en" as const,
  languages: ["en", "zh"] as const,
} as const

export type Locale = (typeof i18n.languages)[number]

export const localeConfig: Record<Locale, { name: string; label: string }> = {
  en: {
    name: "English",
    label: "EN",
  },
  zh: {
    name: "中文",
    label: "中文",
  },
}
