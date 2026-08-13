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
  sourceUrl?: string | null
  sourceName?: string | null
  imageUrl?: string | null
  status?: 'open' | 'closed' | 'unknown' | string
  lastVerifiedAt?: string | null
}

export interface ScholarshipFilters {
  country?: string
  level?: string
  funding?: string
  status?: string
  q?: string
  limit?: number
  sort?: 'deadline' | 'newest' | 'title' | 'amount'
}

/**
 * Bourses d'études, synchronisées depuis les sources officielles vers
 * PostgreSQL puis servies par le backend (voir scholarshipSyncService).
 *
 * `available` vaut false quand le backend ne répond pas : la section se
 * masque alors d'elle-même au lieu d'afficher un vide.
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
      .get(`${API}/scholarships`, { params: { sort: 'deadline', ...filters } })
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

/** Une bourse, pour la fiche détail /bourses/[id]. `notFound` distingue un 404 propre d'une panne réseau. */
export function useScholarship(id: string) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    axios
      .get(`${API}/scholarships/${encodeURIComponent(id)}`)
      .then(({ data }) => { if (!cancelled) setScholarship(data) })
      .catch(err => {
        if (cancelled) return
        if (err?.response?.status === 404) setNotFound(true)
        setScholarship(null)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { scholarship, loading, notFound }
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

const LEVEL_LABELS_FR: Record<string, string> = {
  bachelor: 'Licence',
  licence: 'Licence',
  master: 'Master',
  doctorat: 'Doctorat',
  phd: 'Doctorat',
  postdoctorat: 'Post-doctorat',
  research: 'Recherche',
  exchange: 'Échange', // i18n-ignore
}

const FUNDING_LABELS_FR: Record<string, string> = {
  full: 'Entièrement financée', // i18n-ignore
  partial: 'Partielle', // i18n-ignore
  varies: 'Variable', // i18n-ignore
}

function formatDeadlineFr(deadline?: string | null): string {
  if (!deadline) return 'Non communiquée' // i18n-ignore
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return 'Non communiquée' // i18n-ignore
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
}

/**
 * Gabarit par défaut du message WhatsApp — toujours en français : c'est le
 * message reçu par l'équipe Vision Europe Africa, pas un texte affiché au
 * visiteur, donc il ne suit pas la langue choisie sur le site.
 */
const DEFAULT_WHATSAPP_TEMPLATE = `Bonjour Vision Europe Africa,

Je suis intéressé(e) par cette bourse :

Bourse : {{title}}
Pays : {{country}}
Organisme : {{provider}}
Niveau : {{levels}}
Financement : {{fundingType}}
Date limite : {{deadline}}
Source : {{sourceName}}

Je souhaite recevoir plus d'informations sur :
- mon éligibilité
- les documents nécessaires
- les frais éventuels de procédure
- les étapes pour déposer ma candidature

Lien de la bourse :
{{applicationUrl}}

Merci.`

function scholarshipTemplateVars(s: Scholarship): Record<string, string> {
  return {
    title: s.title,
    country: s.country || 'Non communiqué', // i18n-ignore
    provider: s.provider || 'Non communiqué', // i18n-ignore
    levels: s.levels?.length ? s.levels.map(l => LEVEL_LABELS_FR[l] || l).join(' / ') : 'Non communiqué', // i18n-ignore
    fundingType: (s.fundingType && FUNDING_LABELS_FR[s.fundingType]) || 'Non communiqué', // i18n-ignore
    deadline: formatDeadlineFr(s.deadline),
    sourceName: s.sourceName || 'Non communiqué', // i18n-ignore
    applicationUrl: s.applicationUrl || s.sourceUrl || '',
  }
}

function fillTemplate(template: string, vars: Record<string, string>): string { // i18n-ignore
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? vars[key] : match))
}

/**
 * Lien WhatsApp pour une bourse précise, avec message enrichi (pays, niveau,
 * financement, deadline, source…). Si l'admin a personnalisé `whatsapp_message`
 * avec des variables `{{...}}`, on utilise son gabarit ; sinon un gabarit
 * complet par défaut. Un ancien réglage simple (texte sans variables) reste
 * pris en charge, par compatibilité, comme préfixe suivi du titre.
 */
export function scholarshipWhatsappLink(
  settings: Record<string, string>,
  scholarship: Scholarship
): string | null {
  const number = (settings.whatsapp_number || '').replace(/[^\d]/g, '')
  if (!number) return null

  const template = settings.whatsapp_message || ''
  const vars = scholarshipTemplateVars(scholarship)

  let text: string
  if (template.includes('{{')) {
    text = fillTemplate(template, vars)
  } else if (template.trim()) {
    text = `${template}${scholarship.title}`
  } else {
    text = fillTemplate(DEFAULT_WHATSAPP_TEMPLATE, vars)
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
