'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface Scholarship {
  id: string
  title: string
  provider?: string | null
  university?: string | null
  country?: string | null
  countryCode?: string | null
  city?: string | null
  levels: string[]
  fields: string[]
  fundingType?: string | null
  amount?: number | null
  currency?: string | null
  covers: { tuition: boolean; accommodation: boolean; travel: boolean; stipend: boolean }
  description?: string | null
  deadline?: string | null
  daysRemaining?: number | null
  isOpen?: boolean | null
  applicationUrl?: string | null
  imageUrl?: string | null
}

export interface ScholarshipFilters {
  country?: string
  level?: string
  q?: string
  limit?: number
  sort?: 'deadline' | 'newest' | 'title' | 'amount'
}

/**
 * Bourses d'études, servies par le backend qui relaie l'API Ma Bourse d'Études.
 *
 * `available` vaut false quand l'API amont n'est pas configurée ou ne répond
 * pas : la section se masque alors d'elle-même au lieu d'afficher un vide.
 */
export function useScholarships(filters: ScholarshipFilters = {}) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)

  const key = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    axios
      .get(`${API}/scholarships`, { params: { status: 'open', sort: 'deadline', ...filters } })
      .then(({ data }) => {
        if (cancelled) return
        setScholarships(Array.isArray(data?.data) ? data.data : [])
        setTotal(data?.pagination?.total ?? 0)
        setAvailable(data?.available !== false)
      })
      .catch(() => {
        if (cancelled) return
        setScholarships([])
        setAvailable(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { scholarships, total, loading, available }
}

/** Réglages publics du site : numéro WhatsApp, nom, délai de réponse. */
export function usePublicSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    axios.get(`${API}/settings`)
      .then(({ data }) => { if (!cancelled && data) setSettings(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return settings
}

/**
 * Lien WhatsApp avec message pré-rempli. Renvoie null si aucun numéro n'est réglé,
 * ce qui masque simplement le bouton.
 *
 * L'introduction du message vient des réglages (donc modifiable en admin) ; à
 * défaut, on utilise celle passée par l'appelant, traduite dans sa langue.
 */
export function whatsappLink(
  settings: Record<string, string>,
  scholarshipTitle?: string,
  defaultIntro = ''
): string | null {
  const number = (settings.whatsapp_number || '').replace(/[^\d]/g, '')
  if (!number) return null
  const intro = settings.whatsapp_message || defaultIntro
  const text = scholarshipTitle ? `${intro}${scholarshipTitle}` : intro.replace(/\s*:\s*$/, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
