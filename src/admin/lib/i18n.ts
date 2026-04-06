import { useMemo } from "react"
import ru from "./locales/ru.json"
import en from "./locales/en.json"

const locales: Record<string, Record<string, string>> = { ru, en }

function detectLang(): string {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem("i18nextLng")
  if (stored) {
    const short = stored.slice(0, 2).toLowerCase()
    if (locales[short]) return short
  }
  const htmlLang = document.documentElement?.lang?.slice(0, 2).toLowerCase()
  if (htmlLang && locales[htmlLang]) return htmlLang
  const nav = (window.navigator?.language || "en").slice(0, 2).toLowerCase()
  return locales[nav] ? nav : "en"
}

export function useT() {
  const dict = useMemo(() => {
    const lang = detectLang()
    return locales[lang] ?? locales.en
  }, [])

  return (key: string, fallback?: string): string =>
    dict[key] ?? fallback ?? key
}
