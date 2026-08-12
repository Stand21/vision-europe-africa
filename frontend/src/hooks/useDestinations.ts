'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useLanguage } from '@/i18n/LanguageProvider'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface Destination {
  code: string
  country_code: string
  name: string
  flag?: string | null
  tagline?: string | null
  description?: string | null
  highlights: string[]
  programs: string[]
  image_url?: string | null
  accent_color?: string | null
  is_featured?: boolean
  available_from?: string | null
  available_until?: string | null
  /** Critères de filtrage — alimentés par la migration 009 */
  languages: string[]
  profiles: string[]
  avg_salary?: number | null
  salary_min?: number | null
  salary_max?: number | null
  cost_level?: 'low' | 'medium' | 'high' | null
  visa_weeks_min?: number | null
  visa_weeks_max?: number | null
}

// Shown when the API is unreachable so the landing page is never empty.
export const FALLBACK_DESTINATIONS: Destination[] = [
  {
    code: 'germany', country_code: 'DE', name: 'Allemagne', flag: '🇩🇪',
    tagline: 'Excellence & Opportunité',
    description: "Première économie européenne, l'Allemagne recrute massivement dans la tech, la santé et l'ingénierie.",
    highlights: ['Salaire moyen 45 000 €/an', 'Universités publiques gratuites', 'Opportunity Card', "Marché de l'emploi solide"],
    programs: ['Visa Travail', 'Visa Étudiant', 'Opportunity Card', 'Carte Bleue Européenne'],
    image_url: '/images/germany.jpg', accent_color: '#635bff', is_featured: true,
    languages: ['Allemand', 'Anglais'], profiles: ['student', 'worker', 'visitor'],
    avg_salary: 45000, cost_level: 'high', visa_weeks_min: 8, visa_weeks_max: 12,
  },
  {
    code: 'portugal', country_code: 'PT', name: 'Portugal', flag: '🇵🇹',
    tagline: "Votre première porte vers l'Europe",
    description: "Le point d'entrée le plus accessible de l'espace Schengen : visa D7 et procédures souples.",
    highlights: ['Coût de la vie abordable', 'Visa D7', 'Accueil des étudiants', 'Voie vers la citoyenneté UE'],
    programs: ['Visa D7', 'Visa Étudiant', "Visa Recherche d'Emploi", 'Startup Visa'],
    image_url: '/images/portugal.jpg', accent_color: '#00a36c', is_featured: true,
    languages: ['Portugais', 'Anglais'], profiles: ['student', 'worker', 'visitor'],
    avg_salary: 22000, cost_level: 'low', visa_weeks_min: 6, visa_weeks_max: 10,
  },
]

function normalise(raw: any): Destination {
  const asArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String)
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v)
        return Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        return []
      }
    }
    return []
  }
  return {
    ...raw,
    highlights: asArray(raw?.highlights),
    programs: asArray(raw?.programs),
    languages: asArray(raw?.languages),
    profiles: asArray(raw?.profiles),
    avg_salary: raw?.avg_salary != null ? Number(raw.avg_salary) : null,
    salary_min: raw?.salary_min != null ? Number(raw.salary_min) : null,
    salary_max: raw?.salary_max != null ? Number(raw.salary_max) : null,
    visa_weeks_min: raw?.visa_weeks_min != null ? Number(raw.visa_weeks_min) : null,
    visa_weeks_max: raw?.visa_weeks_max != null ? Number(raw.visa_weeks_max) : null,
  }
}

// Un cache par langue : les composants d'une même page ne déclenchent qu'un
// seul appel, et changer de langue recharge le contenu traduit.
const cache = new Map<string, Promise<{ list: Destination[]; failed: boolean }>>()

function fetchDestinations(lang: string) {
  if (!cache.has(lang)) {
    cache.set(lang, axios
      .get(`${API}/destinations`, { params: { lang } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data.map(normalise) : []
        return { list: list.length ? list : FALLBACK_DESTINATIONS, failed: false }
      })
      .catch(() => {
        cache.delete(lang) // autorise une nouvelle tentative au prochain montage
        return { list: FALLBACK_DESTINATIONS, failed: true }
      }))
  }
  return cache.get(lang)!
}

/**
 * Loads the destinations currently open to applications.
 * The API already filters on is_active + availability period, so anything
 * returned here is safe to show and to submit an application for.
 */
export function useDestinations() {
  const { language } = useLanguage()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchDestinations(language).then(({ list, failed }) => {
      if (cancelled) return
      setDestinations(list)
      setError(failed)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [language])

  return { destinations, loading, error }
}
