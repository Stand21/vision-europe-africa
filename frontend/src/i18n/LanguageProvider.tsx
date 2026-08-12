'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import Cookies from 'js-cookie'
import { translations, type Language } from './translations'
import { detectLocale } from './geo'

const LANG_COOKIE = 'vea_language'
export const FALLBACK_LANGUAGE: Language = 'fr'

interface LanguageContextValue {
  language: Language
  changeLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Source unique de vérité pour la langue.
 *
 * Sans ce contexte, chaque appel de `useTranslation` créait son propre état :
 * changer de langue dans la barre de navigation ne mettait à jour que la barre,
 * laissant le reste de la page dans la langue précédente.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(FALLBACK_LANGUAGE)

  // Choix mémorisé s'il existe, sinon langue déduite du pays du visiteur
  // (fuseau horaire), sinon français. Le sélecteur reste toujours accessible.
  useEffect(() => {
    const saved = Cookies.get(LANG_COOKIE) as Language | undefined
    const next = saved && translations[saved] ? saved : detectLocale().language
    if (next && translations[next]) {
      setLanguage(next)
      document.documentElement.lang = next
    }
  }, [])

  const changeLanguage = useCallback((lang: Language) => {
    if (!translations[lang]) return
    setLanguage(lang)
    Cookies.set(LANG_COOKIE, lang, { expires: 365 })
    document.documentElement.lang = lang
  }, [])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage doit être utilisé à l\'intérieur de <LanguageProvider>')
  }
  return ctx
}
