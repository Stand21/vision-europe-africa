'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  TrendingUp, CheckCircle, Clock, XCircle, Download,
  Search, Filter, Eye, Check, X, MessageSquare, Bell,
  ChevronLeft, ChevronRight, BarChart2, PieChart, Globe2,
  Loader2, Shield, Lock, Plus, Pencil, Trash2, RefreshCw,
  Star, Video, ExternalLink
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ── Types ─────────────────────────────────────────────────────────────────────
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
  EUR: '€', USD: '$', GBP: '£', CHF: 'Fr',
  XOF: 'CFA', XAF: 'CFA', GNF: 'GFr', NGN: '₦', GHS: '₵',
  KES: 'KSh', TZS: 'TSh', UGX: 'USh', ZAR: 'R',
  CDF: 'FC', MAD: 'DH', DZD: 'DA', EGP: 'E£',
}

const formatBudget = (a: Application) => {
  const symbol = CURRENCY_SYMBOLS[a.currency || 'EUR'] || (a.currency ? `${a.currency} ` : '€')
  return `${symbol}${a.budget || '—'}`
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
  destination?: string
  role?: string
  rating: number
  text?: string
  photoUrl?: string
  videoUrl?: string
  isActive: boolean
  sortOrder: number
}

// ── Login Form ─────────────────────────────────────────────────────────────────
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
      toast.success('Bienvenue Admin ! 🎉')
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
          <h1 className="font-display text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Vision Europe Africa — Secure Access</p>
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-premium"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-gold justify-center mt-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : <><Lock className="w-4 h-4" /> Sign In Securely</>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Protected by enterprise-grade security. All access is logged.
        </p>
      </motion.div>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-pending',
    reviewing: 'badge-reviewing',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── Currency Manager ───────────────────────────────────────────────────────────
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
      toast.success(`Devise ${code} ajoutée ✔`)
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
      toast.error('Erreur de mise à jour')
    }
  }

  const remove = async (c: Currency) => {
    if (!window.confirm(`Supprimer la devise ${c.code} ?`)) return
    try {
      await axios.delete(`${API}/admin/currencies/${c.code}`, headers)
      toast.success('Devise supprimée')
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
                    <button onClick={() => toggle(c)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {c.isActive ? 'Activé' : 'Désactivé'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggle(c)} title={c.isActive ? 'Désactiver' : 'Activer'} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(c)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors">
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

// ── Testimonials Manager ───────────────────────────────────────────────────────
function TestimonialsManager({ token }: { token: string }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } }
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const emptyForm: Testimonial = { id: '', name: '', country: '', destination: '', role: '', rating: 5, text: '', photoUrl: '', videoUrl: '', isActive: true, sortOrder: 0 }
  const [form, setForm] = useState<Testimonial>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/testimonials`, headers)
      setItems(data.testimonials || [])
    } catch {
      toast.error('Erreur de chargement des témoignages')
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
        toast.success('Témoignage modifié ✔')
      } else {
        await axios.post(`${API}/admin/testimonials`, form, headers)
        toast.success('Témoignage ajouté ✔')
      }
      setForm(emptyForm); setEditingId(null); load()
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const startEdit = (t: Testimonial) => {
    setForm({ ...t })
    setEditingId(t.id)
  }

  const cancelEdit = () => {
    setForm(emptyForm); setEditingId(null)
  }

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Supprimer le témoignage de ${t.name} ?`)) return
    try {
      await axios.delete(`${API}/admin/testimonials/${t.id}`, headers)
      toast.success('Témoignage supprimé')
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
          <Star className="w-4 h-4 text-gold-400" /> {editingId ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input value={form.name} onChange={set('name')} placeholder="Nom complet *" className="input-premium text-sm" />
          <input value={form.country} onChange={set('country')} placeholder="Pays / Ville" className="input-premium text-sm" />
          <input value={form.destination} onChange={set('destination')} placeholder="Destination (ex. Berlin)" className="input-premium text-sm" />
          <input value={form.role} onChange={set('role')} placeholder="Rôle (ex. Étudiant)" className="input-premium text-sm" />
          <input value={form.rating} onChange={set('rating')} placeholder="Note (1-5)" type="number" min={1} max={5} className="input-premium text-sm" />
          <input value={form.sortOrder} onChange={set('sortOrder')} placeholder="Ordre" type="number" className="input-premium text-sm" />
          <input value={form.photoUrl} onChange={set('photoUrl')} placeholder="URL photo (avatar)" className="input-premium text-sm lg:col-span-1" />
          <input value={form.videoUrl} onChange={set('videoUrl')} placeholder="URL vidéo (YouTube/Vimeo)" className="input-premium text-sm lg:col-span-2" />
        </div>
        <textarea value={form.text} onChange={set('text')} rows={2} placeholder="Texte du témoignage..." className="input-premium text-sm w-full" />
        <div className="flex items-center justify-between">
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
                <tr><th>Nom</th><th>Destination</th><th>Note</th><th>Média</th><th>Actif</th><th>Actions</th></tr>
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
                       <div className="text-gray-400 text-xs">{t.role || '—'}</div>
                    </td>
                    <td className="text-sm text-gray-400">{t.destination || '—'}</td>
                    <td className="text-sm text-gold-400">{'★'.repeat(t.rating || 0)}</td>
                    <td className="text-sm">
                         {t.videoUrl ? <span className="flex items-center gap-1 text-blue-400"><Video className="w-3.5 h-3.5" /> Vidéo</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {t.isActive ? 'Activé' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {t.videoUrl && (
                          <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Voir la vidéo">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Modifier">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(t)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                 {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-6">Aucun témoignage</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function Dashboard({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState('dashboard')
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
          toast.success(`📩 ${fresh.length} nouvelle(s) candidature(s) — ${fresh[0].fullName}`)
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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'applications', icon: FileText, label: 'Applications' },
    { id: 'testimonials', icon: Star, label: 'Témoignages' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const COLORS = ['#1a56db', '#c9a227', '#22c55e', '#ef4444']

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 flex-shrink-0 flex flex-col py-6 px-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">Vision Europe Africa</div>
             <div className="text-gray-400 text-xs">Admin Portal</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (item.id === 'applications') setNewApps(0) }}
              className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === 'applications' && newApps > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {newApps}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={logout} className="admin-nav-item w-full mt-4 text-red-400 hover:bg-red-900/20">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 glass-dark border-b border-white/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold capitalize">{activeTab === 'testimonials' ? 'Témoignages' : activeTab}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData(true)} className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors" title="Actualiser">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors" title="Notifications">
              <Bell className="w-4 h-4" />
              {newApps > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
            </div>
          )}

          {/* ── DASHBOARD TAB ── */}
          {!loading && activeTab === 'dashboard' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-primary-400', delta: '+12%' },
                  { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400', delta: '+5' },
                  { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-400', delta: '+8%' },
                  { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400', delta: '-2%' },
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
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="stat-card rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary-400" /> Monthly Applications
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.monthly}>
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                      <Bar dataKey="applications" fill="#1a56db" radius={[4,4,0,0]} />
                      <Bar dataKey="approved" fill="#c9a227" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="stat-card rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-gold-400" /> Applications by Profile
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
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
              <div className="stat-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Recent Applications</h3>
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Name</th><th>Profile</th><th>Destination</th><th>Status</th><th>Date</th>
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

          {/* ── APPLICATIONS TAB ── */}
          {!loading && activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search by name or email..."
                    className="input-premium pl-9 text-sm"
                  />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-premium w-auto text-sm bg-dark-200">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="input-premium w-auto text-sm bg-dark-200">
                  <option value="all">All Profiles</option>
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="visitor">Visitor</option>
                </select>
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-gray-300 hover:text-white transition-colors">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* Table */}
              <div className="stat-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Applicant</th><th>Profile</th><th>Field/Job</th><th>Destination</th><th>Budget</th><th>Status</th><th>Actions</th>
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
                          <td className="text-sm text-gray-400">{a.field || a.profession || '—'}</td>
                          <td className="text-sm capitalize">{a.destination}</td>
                          <td className="text-sm text-gray-400">{formatBudget(a)}</td>
                          <td><StatusBadge status={a.status} /></td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedApp(a)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(a.id, 'approved')} className="p-1.5 rounded-lg hover:bg-green-900/30 text-gray-400 hover:text-green-400 transition-colors" title="Approve">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(a.id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors" title="Reject">
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

          {/* ── TESTIMONIALS TAB ── */}
          {!loading && activeTab === 'testimonials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TestimonialsManager token={token} />
            </motion.div>
          )}

          {/* ── SETTINGS TAB ── */}
          {!loading && activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <CurrencyManager token={token} />
              <div className="stat-card rounded-2xl p-6 space-y-4 max-w-2xl">
                <h3 className="text-white font-semibold">Admin Settings</h3>
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
                    <label className="block text-sm text-gray-400 mb-1">Notification Email</label>
                    <input className="input-premium text-sm" placeholder="admin@visioneuropeafrica.com" />
                  </div>
                  <button className="btn-gold text-sm px-6 py-2.5">Save Settings</button>
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
            className="relative glass-dark rounded-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto z-10"
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
              <button onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null) }} className="flex-1 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-900/20 text-sm transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_APPLICATIONS: Application[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  fullName: ['Jean Kabila','Marie Nkosi','Amara Diallo','Fatou Sow','Christian Mbeki','Adaeze Okafor','Samuel Bongo','Aminata Koné','Pierre Lukoki','Grace Mwamba'][i % 10],
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

// ── Admin Root ─────────────────────────────────────────────────────────────────
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
