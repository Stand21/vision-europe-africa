'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  TrendingUp, CheckCircle, Clock, XCircle, Download,
  Search, Filter, Eye, Check, X, MessageSquare, Bell,
  ChevronLeft, ChevronRight, BarChart2, PieChart, Globe2,
  Loader2, Shield, Lock, Plus, Pencil, Trash2, RefreshCw,
  Star, Video, ExternalLink, Menu, GraduationCap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { ImageField } from '@/components/admin/ImageField'
import { scholarshipWhatsappLink } from '@/hooks/useScholarships'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  whatsapp: string
  profile: 'student' | 'worker' | 'visitor'
  field?: string
  profession?: string
  destination: string
  budget: string
  currency?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  createdAt: string
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: 'â‚¬', USD: '$', GBP: 'Â£', CHF: 'Fr',
  XOF: 'CFA', XAF: 'CFA', GNF: 'GFr', NGN: 'â‚¦', GHS: 'â‚µ',
  KES: 'KSh', TZS: 'TSh', UGX: 'USh', ZAR: 'R',
  CDF: 'FC', MAD: 'DH', DZD: 'DA', EGP: 'EÂ£',
}

const formatBudget = (a: Application) => {
  const symbol = CURRENCY_SYMBOLS[a.currency || 'EUR'] || (a.currency ? `${a.currency} ` : 'â‚¬')
  return `${symbol}${a.budget || 'â€”'}`
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  byProfile: { name: string; value: number }[]
  byDestination: { name: string; value: number }[]
  monthly: { month: string; applications: number; approved: number }[]
}

interface Currency {
  code: string
  symbol: string
  label: string
  isActive: boolean
  sortOrder: number
}

interface Testimonial {
  id: string
  name: string
  country?: string
  rating: number
  textI18n: Record<string, string>
  roleI18n: Record<string, string>
  destinationI18n: Record<string, string>
  missingTranslations?: string[]
  photoUrl?: string
  videoUrl?: string
  isActive: boolean
  sortOrder: number
  /** Aplati par l'API publique ; absent cÃ´tÃ© admin */
  text?: string
  role?: string
  destination?: string
}

interface AdminDestination {
  id: string
  code: string
  country_code: string
  name: string
  flag?: string | null
  name_i18n: Record<string, string>
  tagline_i18n: Record<string, string>
  description_i18n: Record<string, string>
  highlights_i18n: Record<string, string[]>
  programs_i18n: Record<string, string[]>
  missing_translations?: string[]
  image_url?: string | null
  accent_color?: string | null
  is_featured: boolean
  available_from?: string | null
  available_until?: string | null
  is_active: boolean
  sort_order: number
  languages: string[]
  profiles: string[]
  avg_salary?: number | string | null
  cost_level?: string | null
  visa_weeks_min?: number | string | null
  visa_weeks_max?: number | string | null
  /** calculÃ© cÃ´tÃ© serveur : active | scheduled | expired | disabled */
  status: string
}

// â”€â”€ Login Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password })
      Cookies.set('admin_token', data.token, { expires: 1 })
      onLogin(data.token)
      toast.success('Bienvenue Admin ! ðŸŽ‰')
    } catch {
      toast.error('Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#635bff]/30 blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold-400/20 blur-[110px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-10 w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Espace administrateur</h1>
          <p className="text-gray-400 text-sm mt-1">Vision Europe Africa â€” AccÃ¨s sÃ©curisÃ©</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-premium"
              placeholder="admin@visioneuropeafrica.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-premium"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-gold justify-center mt-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexionâ€¦</> : <><Lock className="w-4 h-4" /> Se connecter</>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          AccÃ¨s protÃ©gÃ© et journalisÃ©.
        </p>
      </motion.div>
    </div>
  )
}

// â”€â”€ Status Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  reviewing: 'En cours d\'examen',
  approved: 'ApprouvÃ©',
  rejected: 'RefusÃ©',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-pending',
    reviewing: 'badge-reviewing',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// â”€â”€ Currency Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CurrencyManager({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [symbol, setSymbol] = useState('')
  const [label, setLabel] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/currencies`, headers)
      setCurrencies(data.currencies || [])
    } catch {
      toast.error('Erreur de chargement des devises')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!code || !symbol || !label) { toast.error('Code, symbole et nom requis'); return }
    try {
      await axios.post(`${API}/admin/currencies`, { code, symbol, label, sort_order: sortOrder }, headers)
      toast.success(`Devise ${code} ajoutÃ©e âœ”`)
      setCode(''); setSymbol(''); setLabel(''); setSortOrder(0)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erreur lors de l\'ajout')
    }
  }

  const toggle = async (c: Currency) => {
    try {
      await axios.patch(`${API}/admin/currencies/${c.code}`, { is_active: !c.isActive }, headers)
      load()
    } catch {
      toast.error('Erreur de mise Ã  jour')
    }
  }

  const remove = async (c: Currency) => {
    if (!window.confirm(`Supprimer la devise ${c.code} ?`)) return
    try {
      await axios.delete(`${API}/admin/currencies/${c.code}`, headers)
      toast.success('Devise supprimÃ©e')
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erreur de suppression')
    }
  }

  return (
    <div className="stat-card rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Globe2 className="w-4 h-4 text-gold-400" /> Devises disponibles
      </h3>

      {/* Add form */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Code (ex. GNF)" className="input-premium text-sm" maxLength={10} />
        <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Symbole (ex. GFr)" className="input-premium text-sm" />
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nom (ex. Guinean Franc)" className="input-premium text-sm lg:col-span-2" />
        <button onClick={add} className="btn-gold text-sm px-4 py-2.5 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gold-400 animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr><th>Code</th><th>Symbole</th><th>Nom</th><th>Actif</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {currencies.map(c => (
                <tr key={c.code}>
                  <td className="font-mono text-white font-semibold">{c.code}</td>
                  <td className="text-gray-300">{c.symbol}</td>
                  <td className="text-gray-300">{c.label}</td>
                  <td>
                    <button onClick={() => toggle(c)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${c.isActive ? 'bg-[#635bff]/20 text-[#a5a3ff]' : 'bg-gray-500/20 text-gray-400'}`}>
                      {c.isActive ? 'ActivÃ©' : 'DÃ©sactivÃ©'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggle(c)} title={c.isActive ? 'DÃ©sactiver' : 'Activer'} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(c)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-black/30 text-gray-400 hover:text-[#8e8e93] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                 {currencies.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-6">Aucune devise</td></tr>
                )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">
        Les devises actives apparaissent automatiquement dans le formulaire de candidature.
      </p>
    </div>
  )
}

// â”€â”€ RÃ©glages WhatsApp et bourses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WhatsAppSettings({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get(`${API}/admin/settings`, headers)
      .then(({ data }) => {
        const map = Object.fromEntries((data.settings || []).map((s: any) => [s.key, s.value]))
        setNumber(map.whatsapp_number || '')
        setMessage(map.whatsapp_message || '')
      })
      .catch(() => toast.error('Erreur de chargement des rÃ©glages'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    const digits = number.replace(/[^\d]/g, '')
    if (digits && digits.length < 8) {
      toast.error('NumÃ©ro trop court â€” utilisez le format international sans + ni espaces')
      return
    }
    setSaving(true)
    try {
      await axios.patch(`${API}/admin/settings`, {
        whatsapp_number: digits,
        whatsapp_message: message,
      }, headers)
      setNumber(digits)
      toast.success('RÃ©glages enregistrÃ©s âœ”')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const previewScholarship = {
    id: '0',
    title: 'Global Korea Scholarship â€” Graduate Degree Program',
    provider: 'National Institute for International Education (NIIED)',
    country: 'CorÃ©e du Sud',
    levels: ['master', 'doctorat'],
    fields: [],
    fundingType: 'full',
    covers: { tuition: true, accommodation: false, travel: true, stipend: true },
    deadline: null,
    applicationUrl: 'https://www.studyinkorea.go.kr/â€¦',
    sourceUrl: 'https://www.studyinkorea.go.kr/â€¦',
    sourceName: 'Study in Korea / GKS â€” Official',
  } as unknown as Parameters<typeof scholarshipWhatsappLink>[1]

  const preview = scholarshipWhatsappLink({ whatsapp_number: number, whatsapp_message: message }, previewScholarship)

  return (
    <div className="stat-card rounded-2xl p-4 md:p-6 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gold-400" /> Contact WhatsApp
      </h3>
      <p className="text-xs text-gray-400">
        Ce numÃ©ro apparaÃ®t Ã  cÃ´tÃ© de chaque bourse. Laissez vide pour masquer le bouton.
      </p>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-gold-400 animate-spin" /></div>
      ) : (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">NumÃ©ro (format international, sans + ni espaces)</label>
            <input
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="243999000000"
              className="input-premium text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Gabarit du message prÃ©-rempli</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Laisser vide pour utiliser le gabarit par dÃ©faut du site"
              rows={5}
              className="input-premium text-sm w-full resize-y"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Variables disponibles : <code className="text-gold-400">{'{{title}} {{country}} {{provider}} {{levels}} {{fundingType}} {{deadline}} {{sourceName}} {{applicationUrl}}'}</code>.
              Laissez vide pour le gabarit complet par dÃ©faut du site.
            </p>
          </div>

          {preview && (
            <div className="text-xs text-gray-400 break-all">
              AperÃ§u (avec une bourse d&apos;exemple) :{' '}
              <a href={preview} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                {preview.slice(0, 90)}â€¦
              </a>
            </div>
          )}

          <button onClick={save} disabled={saving} className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Enregistrer
          </button>
        </>
      )}
    </div>
  )
}

// â”€â”€ Bourses d'Ã©tudes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AdminScholarship {
  id: string
  title: string
  provider?: string | null
  country?: string | null
  levels: string[]
  fundingType?: string | null
  daysRemaining?: number | null
  imageUrl?: string | null
  applicationUrl?: string | null
  override?: { image_url?: string | null; is_featured?: boolean; is_hidden?: boolean } | null
}

function ScholarshipsManager({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [items, setItems] = useState<AdminScholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)
  const [editing, setEditing] = useState<AdminScholarship | null>(null)
  const [image, setImage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/scholarships`, headers)
      setItems(data.data || [])
      setAvailable(data.available !== false)
    } catch {
      toast.error('Erreur de chargement des bourses')
      setAvailable(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const patch = async (s: AdminScholarship, body: Record<string, unknown>) => {
    try {
      await axios.patch(`${API}/admin/scholarships/${encodeURIComponent(s.id)}`,
        { title_snapshot: s.title, ...body }, headers)
      await load()
      return true
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
      return false
    }
  }

  const saveImage = async () => {
    if (!editing) return
    setSaving(true)
    const done = await patch(editing, { image_url: image })
    setSaving(false)
    if (done) {
      toast.success(image ? 'Visuel enregistrÃ© âœ”' : 'Visuel retirÃ©')
      setEditing(null)
    }
  }

  if (!loading && !available) {
    return (
      <div className="stat-card rounded-2xl p-6 space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gold-400" /> Bourses d&apos;Ã©tudes
        </h3>
        <p className="text-sm text-gray-400">
          Le service de bourses n&apos;est pas joignable. VÃ©rifiez que le backend tourne et que
          la base PostgreSQL contient des bourses synchronisÃ©es (voir
          <code className="text-gold-400"> backend/src/scripts/sync-scholarships.js</code>).
          La section Bourses reste masquÃ©e sur le site public.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="stat-card rounded-2xl p-4 md:p-6 space-y-2">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gold-400" /> Bourses d&apos;Ã©tudes
        </h3>
        <p className="text-xs text-gray-400">
          Les bourses sont synchronisÃ©es automatiquement depuis les sources officielles. Vous ne
          pouvez pas modifier leurs donnÃ©es ici, mais vous pouvez leur ajouter une affiche, les
          mettre en avant ou les masquer du site â€” ces rÃ©glages sont conservÃ©s chez nous.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gold-400 animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(s => {
            const custom = Boolean(s.override?.image_url)
            return (
              <div key={s.id} className={`stat-card rounded-2xl overflow-hidden flex flex-col ${s.override?.is_hidden ? 'opacity-50' : ''}`}>
                <div className="relative h-32 bg-dark-200 flex items-center justify-center overflow-hidden">
                  {s.imageUrl
                    ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <GraduationCap className="w-8 h-8 text-gold-400/30" />}
                  {custom && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold-400 text-black text-[10px] font-bold">
                      Visuel personnalisÃ©
                    </span>
                  )}
                  {s.override?.is_featured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-primary-600 text-white text-[10px] font-bold">
                      En avant
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="text-sm font-medium text-white leading-snug line-clamp-2">{s.title}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                    {s.country && <span>{s.country}</span>}
                    {s.daysRemaining != null && (
                      <span className={s.daysRemaining < 0 ? 'text-[#8e8e93]' : s.daysRemaining <= 7 ? 'text-[#e9c48a]' : ''}>
                        Â· {s.daysRemaining < 0 ? 'clÃ´turÃ©e' : `${s.daysRemaining} j`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-auto pt-2">
                    <button
                      onClick={() => { setEditing(s); setImage(s.override?.image_url || '') }}
                      className="flex-1 px-3 py-2 rounded-xl bg-gold-400 text-black text-xs font-semibold hover:bg-gold-300 transition-colors"
                    >
                      {custom ? 'Changer le visuel' : 'Ajouter un visuel'}
                    </button>
                    <button
                      onClick={() => patch(s, { is_featured: !s.override?.is_featured })}
                      title={s.override?.is_featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                      className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-gold-400 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${s.override?.is_featured ? 'fill-gold-400 text-gold-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => patch(s, { is_hidden: !s.override?.is_hidden })}
                      title={s.override?.is_hidden ? 'RÃ©afficher sur le site' : 'Masquer du site'}
                      className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      {s.override?.is_hidden ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-8 sm:col-span-2 lg:col-span-3">
              Aucune bourse pour le moment.
            </p>
          )}
        </div>
      )}

      {/* Panneau d'ajout de visuel */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className="relative glass-dark rounded-3xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-white font-semibold leading-snug">{editing.title}</h3>
            <ImageField
              value={image}
              onChange={setImage}
              token={token}
              label="Affiche de la bourse"
              hint="Format paysage conseillÃ© (1200 Ã— 630), comme les affiches de Ma Bourse d'Ã‰tudes."
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-white/20 text-gray-400 hover:text-white text-sm transition-colors">
                Annuler
              </button>
              <button onClick={saveImage} disabled={saving} className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ Destinations Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CONTENT_LANGUAGES: { code: string; label: string }[] = [
  { code: 'fr', label: 'FranÃ§ais' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'PortuguÃªs' },
  { code: 'de', label: 'Deutsch' },
]

const EMPTY_DESTINATION: AdminDestination = {
  id: '', code: '', country_code: '', name: '', flag: '',
  name_i18n: {}, tagline_i18n: {}, description_i18n: {}, highlights_i18n: {}, programs_i18n: {},
  image_url: '', accent_color: '#635bff',
  is_featured: false, available_from: '', available_until: '',
  is_active: true, sort_order: 0, status: 'active',
  languages: [], profiles: ['student', 'worker', 'visitor'],
  avg_salary: '', cost_level: '', visa_weeks_min: '', visa_weeks_max: '',
}

const PROFILE_LABELS: Record<string, string> = {
  student: 'Ã‰tudiant', worker: 'Travailleur', visitor: 'Visiteur',
}

const COST_LABELS: Record<string, string> = {
  low: 'Abordable', medium: 'ModÃ©rÃ©', high: 'Ã‰levÃ©',
}

const DESTINATION_STATUS: Record<string, { label: string; className: string }> = {
  active:    { label: 'En ligne',  className: 'bg-[#635bff]/20 text-[#a5a3ff]' },
  scheduled: { label: 'ProgrammÃ©', className: 'bg-[#635bff]/20 text-[#a5a3ff]' },
  expired:   { label: 'ExpirÃ©',    className: 'bg-[#d8a84e]/20 text-[#e9c48a]' },
  disabled:  { label: 'DÃ©sactivÃ©', className: 'bg-gray-500/20 text-gray-400' },
}

function DestinationsManager({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [items, setItems] = useState<AdminDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<AdminDestination>(EMPTY_DESTINATION)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [lang, setLang] = useState('fr')

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/destinations`, headers)
      setItems(data.destinations || [])
    } catch {
      toast.error('Erreur de chargement des destinations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k: keyof AdminDestination) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    setForm({ ...form, [k]: target.type === 'checkbox' ? target.checked : target.value })
  }

  // Les champs `languages` (langues parlÃ©es du pays) restent communs Ã  toutes
  // les langues d'interface : un Ã©lÃ©ment par ligne.
  const setList = (k: 'languages') => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value.split('\n') })

  // Champs traduisibles : on ne modifie que la langue actuellement sÃ©lectionnÃ©e.
  const i18nText = (k: 'name_i18n' | 'tagline_i18n' | 'description_i18n') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: { ...(form[k] || {}), [lang]: e.target.value } })

  const i18nList = (k: 'highlights_i18n' | 'programs_i18n') =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: { ...(form[k] || {}), [lang]: e.target.value.split('\n') } })

  // Une langue est Â« remplie Â» si le slogan et les programmes existent.
  const isFilled = (code: string) =>
    Boolean(form.name_i18n?.[code]?.trim())
    && Boolean(form.tagline_i18n?.[code]?.trim())
    && Boolean(form.programs_i18n?.[code]?.length)

  const toggleProfile = (profile: string) => {
    const current = form.profiles || []
    setForm({
      ...form,
      profiles: current.includes(profile)
        ? current.filter(p => p !== profile)
        : [...current, profile],
    })
  }

  const submit = async () => {
    if (!form.name || !form.country_code) {
      toast.error('Le nom et le code pays sont requis'); return
    }
    if (form.available_from && form.available_until && form.available_from > form.available_until) {
      toast.error('La date de dÃ©but doit prÃ©cÃ©der la date de fin'); return
    }

    if (!(form.profiles || []).length) {
      toast.error('SÃ©lectionnez au moins un profil'); return
    }
    const wmin = form.visa_weeks_min === '' ? null : Number(form.visa_weeks_min)
    const wmax = form.visa_weeks_max === '' ? null : Number(form.visa_weeks_max)
    if (wmin != null && wmax != null && wmin > wmax) {
      toast.error('Le dÃ©lai de visa minimum doit Ãªtre infÃ©rieur au maximum'); return
    }

    // On nettoie les lignes vides de chaque langue avant l'envoi
    const cleanLists = (obj: Record<string, string[]>) =>
      Object.fromEntries(Object.entries(obj || {})
        .map(([code, list]) => [code, (list || []).filter(Boolean)])
        .filter(([, list]) => (list as string[]).length))

    const cleanTexts = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => String(v || '').trim()))

    const payload = {
      ...form,
      name_i18n: cleanTexts(form.name_i18n),
      tagline_i18n: cleanTexts(form.tagline_i18n),
      description_i18n: cleanTexts(form.description_i18n),
      highlights_i18n: cleanLists(form.highlights_i18n),
      programs_i18n: cleanLists(form.programs_i18n),
      languages: (form.languages || []).filter(Boolean),
      // '' signifie Â« effacer la date Â» pour l'API
      available_from: form.available_from || null,
      available_until: form.available_until || null,
      sort_order: Number(form.sort_order) || 0,
      avg_salary: form.avg_salary === '' ? null : Number(form.avg_salary),
      cost_level: form.cost_level || null,
      visa_weeks_min: wmin,
      visa_weeks_max: wmax,
    }

    try {
      if (editingId) {
        await axios.patch(`${API}/admin/destinations/${editingId}`, payload, headers)
        toast.success('Destination modifiÃ©e âœ”')
      } else {
        await axios.post(`${API}/admin/destinations`, payload, headers)
        toast.success('Destination ajoutÃ©e âœ”')
      }
      setForm(EMPTY_DESTINATION); setEditingId(null); load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Erreur lors de l'enregistrement")
    }
  }

  const startEdit = (d: AdminDestination) => {
    setForm({
      ...d,
      name_i18n: d.name_i18n || {},
      tagline_i18n: d.tagline_i18n || {},
      description_i18n: d.description_i18n || {},
      highlights_i18n: d.highlights_i18n || {},
      programs_i18n: d.programs_i18n || {},
      languages: d.languages || [],
      profiles: d.profiles?.length ? d.profiles : ['student', 'worker', 'visitor'],
      available_from: d.available_from || '',
      available_until: d.available_until || '',
      avg_salary: d.avg_salary ?? '',
      cost_level: d.cost_level || '',
      visa_weeks_min: d.visa_weeks_min ?? '',
      visa_weeks_max: d.visa_weeks_max ?? '',
    })
    setEditingId(d.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => { setForm(EMPTY_DESTINATION); setEditingId(null); setLang('fr') }

  const toggle = async (d: AdminDestination) => {
    try {
      await axios.patch(`${API}/admin/destinations/${d.id}`, { is_active: !d.is_active }, headers)
      load()
    } catch {
      toast.error('Erreur de mise Ã  jour')
    }
  }

  const remove = async (d: AdminDestination) => {
    if (!window.confirm(`Supprimer dÃ©finitivement la destination Â« ${d.name} Â» ?`)) return
    try {
      await axios.delete(`${API}/admin/destinations/${d.id}`, headers)
      toast.success('Destination supprimÃ©e')
      if (editingId === d.id) cancelEdit()
      load()
    } catch {
      toast.error('Erreur de suppression')
    }
  }

  const expired = items.filter(d => d.status === 'expired')

  const purgeExpired = async () => {
    if (!window.confirm(`Supprimer les ${expired.length} destination(s) dont la pÃ©riode est terminÃ©e ?`)) return
    try {
      const { data } = await axios.post(`${API}/admin/destinations/purge-expired`, {}, headers)
      toast.success(`${data.deleted} destination(s) supprimÃ©e(s)`)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erreur lors du nettoyage')
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="stat-card rounded-2xl p-4 md:p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-gold-400" />
          {editingId ? `Modifier Â« ${form.name} Â»` : 'Ajouter une destination'}
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input value={form.name} onChange={set('name')} placeholder="Nom interne * (ex. France)" className="input-premium text-sm" />
          <input value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value.toUpperCase() })} placeholder="Code ISO * (ex. FR)" maxLength={5} className="input-premium text-sm" />
          <input value={form.flag || ''} onChange={set('flag')} placeholder="Drapeau (rÃ©servÃ©, inutilisÃ© en UI)" className="input-premium text-sm" />
          <input value={form.sort_order} onChange={set('sort_order')} type="number" placeholder="Ordre d'affichage" className="input-premium text-sm" />
          <input value={form.accent_color || ''} onChange={set('accent_color')} placeholder="Couleur (#635bff)" className="input-premium text-sm" />
        </div>

        <ImageField
          value={form.image_url || ''}
          onChange={url => setForm({ ...form, image_url: url })}
          token={token}
          label="Photo de la destination"
          hint="Format paysage conseillÃ© (1200 Ã— 800). Sans photo, un dÃ©gradÃ© avec le drapeau s'affiche."
        />

        {/* â”€â”€ Contenu traduisible â”€â”€ */}
        <div className="rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <Globe2 className="w-4 h-4 text-gold-400" /> Contenu affichÃ© sur le site
            </div>
            {/* Onglets de langue â€” la pastille signale une langue incomplÃ¨te */}
            <div className="flex gap-1 rounded-xl bg-black/25 p-1">
              {CONTENT_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    lang === l.code ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{l.code.toUpperCase()}</span>{l.label}
                  {!isFilled(l.code) && (
                    <span
                      title="Traduction incomplÃ¨te"
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#d8a84e]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Chaque langue a son propre texte. Une langue laissÃ©e vide affiche automatiquement
            le franÃ§ais sur le site â€” rien ne reste jamais blanc.
          </p>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Nom du pays</label>
            <input
              value={form.name_i18n?.[lang] || ''}
              onChange={i18nText('name_i18n')}
              placeholder={lang === 'fr' ? 'ex. Allemagne' : 'Laisser vide pour reprendre le franÃ§ais'}
              className="input-premium text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Slogan</label>
            <input
              value={form.tagline_i18n?.[lang] || ''}
              onChange={i18nText('tagline_i18n')}
              placeholder={lang === 'fr' ? 'ex. La destination francophone' : 'Laisser vide pour reprendre le franÃ§ais'}
              className="input-premium text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description_i18n?.[lang] || ''}
              onChange={i18nText('description_i18n')}
              rows={2}
              placeholder={lang === 'fr' ? 'Description affichÃ©e sur la carteâ€¦' : 'Laisser vide pour reprendre le franÃ§ais'}
              className="input-premium text-sm w-full"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points forts (un par ligne)</label>
              <textarea
                value={(form.highlights_i18n?.[lang] || []).join('\n')}
                onChange={i18nList('highlights_i18n')}
                rows={4}
                placeholder={'CoÃ»t de la vie abordable\nVisa D7\nâ€¦'}
                className="input-premium text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Programmes / visas (un par ligne)</label>
              <textarea
                value={(form.programs_i18n?.[lang] || []).join('\n')}
                onChange={i18nList('programs_i18n')}
                rows={4}
                placeholder={'Visa Ã‰tudiant\nVisa Travail\nâ€¦'}
                className="input-premium text-sm w-full"
              />
            </div>
          </div>
        </div>

        {/* CritÃ¨res de filtrage du site public */}
        <div className="rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-white font-medium">
            <Filter className="w-4 h-4 text-gold-400" /> CritÃ¨res de recherche
          </div>
          <p className="text-xs text-gray-400">
            Ces champs alimentent les filtres et le tri de la section Destinations sur la page d&apos;accueil.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Salaire moyen (â‚¬ / an)</label>
              <input value={form.avg_salary ?? ''} onChange={set('avg_salary')} type="number" min={0} placeholder="45000" className="input-premium text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">CoÃ»t de la vie</label>
              <select value={form.cost_level || ''} onChange={e => setForm({ ...form, cost_level: e.target.value })} className="input-premium text-sm w-full">
                <option value="">Non renseignÃ©</option>
                <option value="low">Abordable</option>
                <option value="medium">ModÃ©rÃ©</option>
                <option value="high">Ã‰levÃ©</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Visa : dÃ©lai min. (semaines)</label>
              <input value={form.visa_weeks_min ?? ''} onChange={set('visa_weeks_min')} type="number" min={0} placeholder="6" className="input-premium text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Visa : dÃ©lai max. (semaines)</label>
              <input value={form.visa_weeks_max ?? ''} onChange={set('visa_weeks_max')} type="number" min={0} placeholder="10" className="input-premium text-sm w-full" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Langues parlÃ©es (une par ligne)</label>
              <textarea value={(form.languages || []).join('\n')} onChange={setList('languages')} rows={3} placeholder={'FranÃ§ais\nAnglais'} className="input-premium text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Profils acceptÃ©s</label>
              <div className="flex flex-col gap-2 pt-1">
                {['student', 'worker', 'visitor'].map(profile => (
                  <label key={profile} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={(form.profiles || []).includes(profile)}
                      onChange={() => toggleProfile(profile)}
                      className="accent-gold-400"
                    />
                    {PROFILE_LABELS[profile]}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability period */}
        <div className="rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-white font-medium">
            <Clock className="w-4 h-4 text-gold-400" /> PÃ©riode de disponibilitÃ©
          </div>
          <p className="text-xs text-gray-400">
            Laissez vide pour une destination permanente. Une fois la date de fin passÃ©e, la destination
            disparaÃ®t automatiquement du site et du formulaire â€” elle reste ici et peut Ãªtre rÃ©activÃ©e.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ouverture (Ã  partir du)</label>
              <input value={form.available_from || ''} onChange={set('available_from')} type="date" className="input-premium text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">ClÃ´ture (jusqu&apos;au)</label>
              <input value={form.available_until || ''} onChange={set('available_until')} type="date" className="input-premium text-sm w-full" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="accent-gold-400" />
              Actif
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} className="accent-gold-400" />
              Mise en avant (page d&apos;accueil)
            </label>
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl border border-white/20 text-gray-400 hover:text-white text-sm transition-colors">
                Annuler
              </button>
            )}
            <button onClick={submit} className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>

      {/* Expired banner */}
      {expired.length > 0 && (
        <div className="stat-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#d8a84e]/30">
          <div className="text-sm text-[#e9c48a] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {expired.length} destination(s) ont dÃ©passÃ© leur date de clÃ´ture et ne sont plus visibles publiquement.
          </div>
          <button onClick={purgeExpired} className="text-sm px-4 py-2 rounded-xl bg-[#d8a84e]/20 text-[#e9c48a] hover:bg-[#d8a84e]/30 transition-colors flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer les expirÃ©es
          </button>
        </div>
      )}

      {/* List */}
      <div className="stat-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gold-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr><th>Destination</th><th>PÃ©riode</th><th>Statut</th><th>Ordre</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map(d => {
                  const badge = DESTINATION_STATUS[d.status] || DESTINATION_STATUS.active
                  return (
                    <tr key={d.id}>
                      <td>
                        <div className="font-medium text-white text-sm flex items-center gap-2">
                          <span className="text-xs font-bold tracking-widest bg-white/10 rounded-md px-1.5 py-1">{d.country_code || 'â€”'}</span>
                          {d.name}
                          {d.is_featured && <Star className="w-3 h-3 text-gold-400" />}
                        </div>
                        <div className="text-gray-400 text-xs">{d.country_code} Â· {d.code}</div>
                      </td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {d.available_from || d.available_until ? (
                          <>
                            {d.available_from || 'â€”'} â†’ {d.available_until || 'âˆž'}
                          </>
                        ) : (
                          <span className="text-gray-500">Permanente</span>
                        )}
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-sm text-gray-400">{d.sort_order}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggle(d)} title={d.is_active ? 'DÃ©sactiver' : 'Activer'} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            {d.is_active ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => startEdit(d)} title="Modifier" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(d)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-black/30 text-gray-400 hover:text-[#8e8e93] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-6">Aucune destination</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Les destinations actives et dans leur pÃ©riode apparaissent automatiquement sur la page d&apos;accueil
        et dans le formulaire de candidature.
      </p>
    </div>
  )
}

// â”€â”€ Testimonials Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TestimonialsManager({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const emptyForm: Testimonial = {
    id: '', name: '', country: '', rating: 5,
    textI18n: {}, roleI18n: {}, destinationI18n: {},
    photoUrl: '', videoUrl: '', isActive: true, sortOrder: 0,
  }
  const [form, setForm] = useState<Testimonial>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [lang, setLang] = useState('fr')

  // Champs traduisibles : on ne touche que la langue sÃ©lectionnÃ©e
  const setI18n = (k: 'textI18n' | 'roleI18n' | 'destinationI18n') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: { ...(form[k] || {}), [lang]: e.target.value } })

  const isFilled = (code: string) =>
    Boolean(form.textI18n?.[code]?.trim()) && Boolean(form.roleI18n?.[code]?.trim())

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/testimonials`, headers)
      setItems(data.testimonials || [])
    } catch {
      toast.error('Erreur de chargement des tÃ©moignages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k: keyof Testimonial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  const submit = async () => {
    if (!form.name) { toast.error('Le nom est requis'); return }
    try {
      if (editingId) {
        await axios.patch(`${API}/admin/testimonials/${editingId}`, form, headers)
        toast.success('TÃ©moignage modifiÃ© âœ”')
      } else {
        await axios.post(`${API}/admin/testimonials`, form, headers)
        toast.success('TÃ©moignage ajoutÃ© âœ”')
      }
      setForm(emptyForm); setEditingId(null); load()
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const startEdit = (t: Testimonial) => {
    setForm({
      ...t,
      textI18n: t.textI18n || {},
      roleI18n: t.roleI18n || {},
      destinationI18n: t.destinationI18n || {},
    })
    setEditingId(t.id)
  }

  const cancelEdit = () => {
    setForm(emptyForm); setEditingId(null); setLang('fr')
  }

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Supprimer le tÃ©moignage de ${t.name} ?`)) return
    try {
      await axios.delete(`${API}/admin/testimonials/${t.id}`, headers)
      toast.success('TÃ©moignage supprimÃ©')
      if (editingId === t.id) cancelEdit()
      load()
    } catch {
      toast.error('Erreur de suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="stat-card rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Star className="w-4 h-4 text-gold-400" /> {editingId ? 'Modifier le tÃ©moignage' : 'Ajouter un tÃ©moignage'}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input value={form.name} onChange={set('name')} placeholder="Nom complet *" className="input-premium text-sm" />
          <input value={form.country} onChange={set('country')} placeholder="Pays d'origine" className="input-premium text-sm" />
          <input value={form.rating} onChange={set('rating')} placeholder="Note (1-5)" type="number" min={1} max={5} className="input-premium text-sm" />
          <input value={form.sortOrder} onChange={set('sortOrder')} placeholder="Ordre" type="number" className="input-premium text-sm" />
          <input value={form.photoUrl} onChange={set('photoUrl')} placeholder="URL photo (avatar)" className="input-premium text-sm" />
          <input value={form.videoUrl} onChange={set('videoUrl')} placeholder="URL vidÃ©o (YouTube/Vimeo)" className="input-premium text-sm" />
        </div>

        {/* â”€â”€ Contenu traduisible â”€â”€ */}
        <div className="rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <Globe2 className="w-4 h-4 text-gold-400" /> Texte affichÃ© sur le site
            </div>
            <div className="flex gap-1 rounded-xl bg-black/25 p-1">
              {CONTENT_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    lang === l.code ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{l.code.toUpperCase()}</span>{l.label}
                  {!isFilled(l.code) && (
                    <span
                      title="Traduction incomplÃ¨te"
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#d8a84e]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Le nom et le pays d&apos;origine sont communs Ã  toutes les langues. Une langue laissÃ©e
            vide reprend automatiquement le franÃ§ais.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.roleI18n?.[lang] || ''}
              onChange={setI18n('roleI18n')}
              placeholder={lang === 'fr' ? 'MÃ©tier (ex. InfirmiÃ¨re)' : 'Laisser vide pour reprendre le franÃ§ais'}
              className="input-premium text-sm"
            />
            <input
              value={form.destinationI18n?.[lang] || ''}
              onChange={setI18n('destinationI18n')}
              placeholder={lang === 'fr' ? 'Ville (ex. Berlin)' : 'Laisser vide pour reprendre le franÃ§ais'}
              className="input-premium text-sm"
            />
          </div>

          <textarea
            value={form.textI18n?.[lang] || ''}
            onChange={setI18n('textI18n')}
            rows={3}
            placeholder={lang === 'fr' ? 'Texte du tÃ©moignageâ€¦' : 'Laisser vide pour reprendre le franÃ§ais'}
            className="input-premium text-sm w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="accent-gold-400" />
            Actif (visible sur le site)
          </label>
          <div className="flex gap-2">
            {editingId && (
               <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl border border-white/20 text-gray-400 hover:text-white text-sm transition-colors">
                Annuler
              </button>
            )}
            <button onClick={submit} className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="stat-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gold-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr><th>Nom</th><th>Destination</th><th>Note</th><th>MÃ©dia</th><th>Actif</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="font-medium text-white text-sm flex items-center gap-2">
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : null}
                        {t.name}
                      </div>
                       <div className="text-gray-400 text-xs flex items-center gap-2 flex-wrap">
                        <span>{t.roleI18n?.fr || 'â€”'}</span>
                        {(t.missingTranslations || []).length > 0 && (
                          <span
                            title={`Traduction incomplÃ¨te : ${(t.missingTranslations || []).join(', ').toUpperCase()}`}
                            className="px-1.5 py-0.5 rounded bg-[#d8a84e]/20 text-[#e9c48a] text-[10px] font-semibold"
                          >
                            {(t.missingTranslations || []).map(c => c.toUpperCase()).join(' ')} Ã  traduire
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-gray-400">{t.destinationI18n?.fr || 'â€”'}</td>
                    <td className="text-sm text-gold-400">{'â˜…'.repeat(t.rating || 0)}</td>
                    <td className="text-sm">
                         {t.videoUrl ? <span className="flex items-center gap-1 text-[#a5a3ff]"><Video className="w-3.5 h-3.5" /> VidÃ©o</span> : <span className="text-gray-400">â€”</span>}
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.isActive ? 'bg-[#635bff]/20 text-[#a5a3ff]' : 'bg-gray-500/20 text-gray-400'}`}>
                        {t.isActive ? 'ActivÃ©' : 'DÃ©sactivÃ©'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {t.videoUrl && (
                          <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Voir la vidÃ©o">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Modifier">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(t)} className="p-1.5 rounded-lg hover:bg-black/30 text-gray-400 hover:text-[#8e8e93] transition-colors" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                 {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-6">Aucun tÃ©moignage</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€ Dashboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Dashboard({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [newApps, setNewApps] = useState(0)
  const knownIds = useRef<Set<string>>(new Set())
  const PER_PAGE = 10

  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(false), 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/applications?limit=100`, authHeader),
        axios.get(`${API}/admin/stats`, authHeader),
      ])
      const apps = appsRes.data.applications || []
      setApplications(apps)
      setStats(statsRes.data)

      // Detect new applications arriving in real time
      if (!initial && knownIds.current.size > 0) {
        const fresh = apps.filter(a => !knownIds.current.has(a.id))
        if (fresh.length > 0) {
          setNewApps(n => n + fresh.length)
          toast.success(`ðŸ“© ${fresh.length} nouvelle(s) candidature(s) â€” ${fresh[0].fullName}`)
        }
      }
      apps.forEach(a => knownIds.current.add(a.id))
    } catch {
      if (initial) {
        setApplications(MOCK_APPLICATIONS)
        setStats(MOCK_STATS)
      }
    } finally {
      if (initial) setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API}/admin/applications/${id}/status`, { status }, authHeader)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as Application['status'] } : a))
      toast.success(`Application ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = applications.filter(a => {
    const matchSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        a.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchProfile = profileFilter === 'all' || a.profile === profileFilter
    return matchSearch && matchStatus && matchProfile
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const exportCSV = () => {
    const headers = ['Name','Email','Phone','Profile','Destination','Status','Date']
    const rows = filtered.map(a => [a.fullName,a.email,a.phone,a.profile,a.destination,a.status,a.createdAt])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'applications.csv'; a.click()
  }

  const logout = () => { Cookies.remove('admin_token'); window.location.reload() }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'applications', icon: FileText, label: 'Candidatures' },
    { id: 'destinations', icon: Globe2, label: 'Destinations' },
    { id: 'scholarships', icon: GraduationCap, label: 'Bourses' },
    { id: 'testimonials', icon: Star, label: 'TÃ©moignages' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'settings', icon: Settings, label: 'RÃ©glages' },
  ]

  const COLORS = ['#635bff', '#8b5cf6', '#a5a3ff', '#d8a84e']

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 mb-8 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <div className="text-white font-bold text-sm">Menu</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (item.id === 'applications') setNewApps(0); setSidebarOpen(false) }}
              className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === 'applications' && newApps > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[#d8a84e] text-white text-[10px] font-bold">
                  {newApps}
                </span>
              )}
            </button>
          ))}
        </nav>

        <Link href="/" onClick={() => setSidebarOpen(false)} className="admin-nav-item w-full mt-2 text-gray-300 hover:bg-white/10">
          <Globe2 className="w-4 h-4" /> Voir le site
        </Link>

        <button onClick={logout} className="admin-nav-item w-full mt-1 text-[#8e8e93] hover:bg-black/20">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-10 glass-dark border-b border-white/20 px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-white font-bold capitalize text-lg md:text-xl">{navItems.find(n => n.id === activeTab)?.label ?? activeTab}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg glass text-gray-400 hover:text-white transition-colors text-sm"
              title="Voir le site public"
            >
              <Globe2 className="w-4 h-4" /> Site
            </Link>
            <button onClick={() => fetchData(true)} className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors" title="Actualiser">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors hidden sm:flex" title="Notifications">
              <Bell className="w-4 h-4" />
              {newApps > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d8a84e]" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
            </div>
          )}

          {/* â”€â”€ DASHBOARD TAB â”€â”€ */}
          {!loading && activeTab === 'dashboard' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-primary-400', delta: '+12%' },
                  { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-[#e9c48a]', delta: '+5' },
                  { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-[#a5a3ff]', delta: '+8%' },
                  { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-[#8e8e93]', delta: '-2%' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                       <span className="text-xs text-gray-400">{s.delta}</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display">{s.value.toLocaleString()}</div>
                     <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>

               {/* Charts Row */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                 <div className="stat-card rounded-2xl p-4 md:p-6">
                   <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                     <BarChart2 className="w-4 h-4 text-primary-400" /> Monthly Applications
                   </h3>
                   <ResponsiveContainer width="100%" height={180}>
                     <BarChart data={stats.monthly}>
                       <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                       <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                       <Tooltip contentStyle={{ background: '#0f1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                       <Bar dataKey="applications" fill="#635bff" radius={[4,4,0,0]} />
                       <Bar dataKey="approved" fill="#d8a84e" radius={[4,4,0,0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>

                 <div className="stat-card rounded-2xl p-4 md:p-6">
                   <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                     <PieChart className="w-4 h-4 text-gold-400" /> Applications by Profile
                   </h3>
                   <ResponsiveContainer width="100%" height={180}>
                     <RePieChart>
                       <Pie data={stats.byProfile} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                         {stats.byProfile.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                       </Pie>
                       <Tooltip contentStyle={{ background: '#0f1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                       <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                     </RePieChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Recent Applications */}
               <div className="stat-card rounded-2xl p-4 md:p-6">
                <h3 className="text-white font-semibold mb-4">Candidatures rÃ©centes</h3>
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Nom</th><th>Profil</th><th>Destination</th><th>Statut</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(a => (
                        <tr key={a.id}>
                          <td className="font-medium text-white">{a.fullName}</td>
                          <td className="capitalize">{a.profile}</td>
                          <td><span className="capitalize">{a.destination}</span></td>
                          <td><StatusBadge status={a.status} /></td>
                          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* â”€â”€ APPLICATIONS TAB â”€â”€ */}
          {!loading && activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center">
                <div className="relative flex-1 min-w-0">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Rechercher par nom ou emailâ€¦"
                    className="input-premium pl-9 text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-premium w-auto text-sm bg-dark-200">
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="reviewing">En cours d'examen</option>
                    <option value="approved">ApprouvÃ©</option>
                    <option value="rejected">RefusÃ©</option>
                  </select>
                  <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="input-premium w-auto text-sm bg-dark-200">
                    <option value="all">Tous les profils</option>
                    <option value="student">Ã‰tudiant</option>
                    <option value="worker">Travailleur</option>
                    <option value="visitor">Visiteur</option>
                  </select>
                  <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-gray-300 hover:text-white transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="stat-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Applicant</th><th>Profil</th><th>Field/Job</th><th>Destination</th><th>Budget</th><th>Statut</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div className="font-medium text-white text-sm">{a.fullName}</div>
                             <div className="text-gray-400 text-xs">{a.email}</div>
                          </td>
                          <td><span className="capitalize text-sm">{a.profile}</span></td>
                          <td className="text-sm text-gray-400">{a.field || a.profession || 'â€”'}</td>
                          <td className="text-sm capitalize">{a.destination}</td>
                          <td className="text-sm text-gray-400">{formatBudget(a)}</td>
                          <td><StatusBadge status={a.status} /></td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedApp(a)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Consulter">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(a.id, 'approved')} className="p-1.5 rounded-lg hover:bg-black/30 text-gray-400 hover:text-[#a5a3ff] transition-colors" title="Approve">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(a.id, 'rejected')} className="p-1.5 rounded-lg hover:bg-black/30 text-gray-400 hover:text-[#8e8e93] transition-colors" title="Reject">
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <a href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-primary-900/30 text-gray-400 hover:text-primary-400 transition-colors" title="WhatsApp">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                   <span className="text-gray-400 text-xs">{filtered.length} results</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg glass disabled:opacity-30 hover:bg-white/10 transition-colors text-gray-400">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-gray-400 text-xs px-2">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg glass disabled:opacity-30 hover:bg-white/10 transition-colors text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* â”€â”€ DESTINATIONS TAB â”€â”€ */}
          {!loading && activeTab === 'destinations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DestinationsManager token={token} />
            </motion.div>
          )}

          {/* â”€â”€ BOURSES TAB â”€â”€ */}
          {!loading && activeTab === 'scholarships' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ScholarshipsManager token={token} />
            </motion.div>
          )}

          {/* â”€â”€ TESTIMONIALS TAB â”€â”€ */}
          {!loading && activeTab === 'testimonials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TestimonialsManager token={token} />
            </motion.div>
          )}

          {/* â”€â”€ SETTINGS TAB â”€â”€ */}
          {!loading && activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <WhatsAppSettings token={token} />
              <CurrencyManager token={token} />
              <div className="stat-card rounded-2xl p-4 md:p-6 space-y-4 max-w-2xl">
                <h3 className="text-white font-semibold">RÃ©glages administrateur</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Telegram Bot Token</label>
                    <input className="input-premium text-sm" placeholder="Your Telegram bot token" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Admin Chat ID</label>
                    <input className="input-premium text-sm" placeholder="-100XXXXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email de notification</label>
                    <input className="input-premium text-sm" placeholder="admin@visioneuropeafrica.com" />
                  </div>
                  <button className="btn-gold text-sm px-6 py-2.5">Enregistrer les rÃ©glages</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-dark rounded-2xl p-4 md:p-6 lg:p-8 w-full max-w-lg mx-4 max-h-[85vh] md:max-h-[80vh] overflow-y-auto z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">{selectedApp.fullName}</h3>
              <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-lg glass text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Email', selectedApp.email],
                ['Phone', selectedApp.phone],
                ['WhatsApp', selectedApp.whatsapp],
                ['Profile', selectedApp.profile],
                ['Field/Job', selectedApp.field || selectedApp.profession || 'N/A'],
                ['Destination', selectedApp.destination],
                ['Budget', formatBudget(selectedApp)],
                ['Status', selectedApp.status],
                ['Applied', new Date(selectedApp.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                   <span className="text-gray-400">{k}</span>
                  <span className="text-white font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { updateStatus(selectedApp.id, 'approved'); setSelectedApp(null) }} className="flex-1 btn-primary py-2.5 text-sm justify-center">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null) }} className="flex-1 px-4 py-2.5 rounded-xl border border-[#d8a84e]/30 text-[#e9c48a] hover:bg-black/20 text-sm transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_APPLICATIONS: Application[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  fullName: ['Jean Kabila','Marie Nkosi','Amara Diallo','Fatou Sow','Christian Mbeki','Adaeze Okafor','Samuel Bongo','Aminata KonÃ©','Pierre Lukoki','Grace Mwamba'][i % 10],
  email: `user${i + 1}@example.com`,
  phone: `+243${String(i + 1).padStart(9, '0')}`,
  whatsapp: `+243${String(i + 1).padStart(9, '0')}`,
  profile: (['student','worker','visitor'] as const)[i % 3],
  field: ['Computer Science','Medicine','AI','Finance'][i % 4],
  profession: ['Software Developer','Nurse','Mechanic'][i % 3],
  destination: i % 2 === 0 ? 'germany' : 'portugal',
  budget: String(2000 + i * 500),
  currency: (['EUR', 'USD', 'CDF', 'NGN'] as const)[i % 4],
  status: (['pending','reviewing','approved','rejected'] as const)[i % 4],
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}))

const MOCK_STATS: Stats = {
  total: 5247,
  pending: 143,
  approved: 4821,
  rejected: 283,
  byProfile: [
    { name: 'Student', value: 2800 },
    { name: 'Worker', value: 1900 },
    { name: 'Visitor', value: 547 },
  ],
  byDestination: [
    { name: 'Germany', value: 3200 },
    { name: 'Portugal', value: 2047 },
  ],
  monthly: [
    { month: 'Jan', applications: 320, approved: 298 },
    { month: 'Feb', applications: 380, approved: 355 },
    { month: 'Mar', applications: 450, approved: 420 },
    { month: 'Apr', applications: 510, approved: 480 },
    { month: 'May', applications: 490, approved: 460 },
    { month: 'Jun', applications: 580, approved: 545 },
  ],
}

// â”€â”€ Admin Root â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    if (!hadDark) root.classList.add('dark')
    return () => {
      if (!hadDark) root.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const saved = Cookies.get('admin_token')
    if (saved) setToken(saved)
  }, [])

  if (!token) return <AdminLogin onLogin={setToken} />
  return <Dashboard token={token} />
}
