import { useCallback, useEffect, useState } from 'react'
import { translations, Language } from '@/i18n/translations'
import Cookies from 'js-cookie'

const LANG_COOKIE = 'vea_language'

function resolve(keys: string[], lang: Language): unknown | undefined {
  let value: unknown = translations[lang]
  for (const key of keys) {
    if (value && typeof value === 'object' && key in (value as object)) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return value
}

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
    (path: string, fallback?: string): string => {
      const keys = path.split('.')
      const value = resolve(keys, language) ?? resolve(keys, 'en')
      return typeof value === 'string' ? value : (fallback ?? path)
    },
    [language]
  )

  const tList = useCallback(
    (path: string): string[] => {
      const keys = path.split('.')
      const value = resolve(keys, language) ?? resolve(keys, 'en')
      return Array.isArray(value) ? (value as string[]) : []
    },
    [language]
  )

  const tValue = useCallback(
    <T,>(path: string): T | undefined => {
      const keys = path.split('.')
      const value = resolve(keys, language) ?? resolve(keys, 'en')
      return value as T | undefined
    },
    [language]
  )

  return { t, tList, tValue, language, changeLanguage }
}