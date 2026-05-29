import { useState, useEffect, useCallback } from 'react'
import { translations, Language } from '@/i18n/translations'
import Cookies from 'js-cookie'

const LANG_COOKIE = 'vea_language'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('fr') // Default French for African audience

  useEffect(() => {
    const saved = Cookies.get(LANG_COOKIE) as Language
    if (saved && translations[saved]) {
      setLanguage(saved)
    }
  }, [])

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    Cookies.set(LANG_COOKIE, lang, { expires: 365 })
  }, [])

  const t = useCallback(
    (path: string): string => {
      const keys = path.split('.')
      let value: unknown = translations[language]
      for (const key of keys) {
        if (value && typeof value === 'object' && key in (value as object)) {
          value = (value as Record<string, unknown>)[key]
        } else {
          // Fallback to English
          let fallback: unknown = translations.en
          for (const k of keys) {
            if (fallback && typeof fallback === 'object' && k in (fallback as object)) {
              fallback = (fallback as Record<string, unknown>)[k]
            } else return path
          }
          return typeof fallback === 'string' ? fallback : path
        }
      }
      return typeof value === 'string' ? value : path
    },
    [language]
  )

  return { t, language, changeLanguage }
}
