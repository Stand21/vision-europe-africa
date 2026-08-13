'use client'
import { useCallback } from 'react'
import { translations, type Language } from '@/i18n/translations'
import { useLanguage, FALLBACK_LANGUAGE } from '@/i18n/LanguageProvider'

function resolve(lang: Language, path: string): unknown {
  let value: unknown = translations[lang]
  for (const key of path.split('.')) {
    if (value && typeof value === 'object' && key in (value as object)) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return value
}

/**
 * Traductions. La langue vient du contexte partagé : tous les composants de la
 * page changent ensemble, y compris ceux qui ne sont pas dans la barre de nav.
 */
export function useTranslation() {
  const { language, changeLanguage } = useLanguage()

  /**
   * Chaîne traduite. Retombe sur le français si la clé manque, puis sur le
   * chemin lui-même — jamais sur du vide.
   *
   * `vars` remplit les gabarits : t('destinations.card.closing_in', { n: 12 })
   */
  const t = useCallback(
    (path: string, vars?: Record<string, string | number>): string => {
      const value = resolve(language, path) ?? resolve(FALLBACK_LANGUAGE, path)
      if (typeof value !== 'string') return path
      if (!vars) return value
      return value.replace(/\{(\w+)\}/g, (match, key) =>
        key in vars ? String(vars[key]) : match
      )
    },
    [language]
  )

  /** Pour les tableaux du fichier de traductions (étapes, FAQ, listes…). */
  const tList = useCallback(
    <T,>(path: string): T[] => {
      const value = resolve(language, path) ?? resolve(FALLBACK_LANGUAGE, path)
      return Array.isArray(value) ? (value as T[]) : []
    },
    [language]
  )

  return { t, tList, language, changeLanguage }
}
