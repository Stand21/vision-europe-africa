'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  TrendingUp, CheckCircle, Clock, XCircle, Download,
  Search, Filter, Eye, Check, X, MessageSquare, Bell,
  ChevronLeft, ChevronRight, BarChart2, PieChart, Globe2,
  Loader2, Shield, Lock
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
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  createdAt: string
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
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Vision Europe Africa — Secure Access</p>
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

        <p className="text-center text-gray-600 text-xs mt-6">
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
  const PER_PAGE = 10

  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/applications`, authHeader),
        axios.get(`${API}/admin/stats`, authHeader),
      ])
      setApplications(appsRes.data.applications || [])
      setStats(statsRes.data)
    } catch {
      // Use mock data for demo
      setApplications(MOCK_APPLICATIONS)
      setStats(MOCK_STATS)
    } finally {
      setLoading(false)
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
            <div className="text-gray-500 text-xs">Admin Portal</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
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
        <div className="sticky top-0 z-10 glass-dark border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400" />
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
                      <span className="text-xs text-gray-500">{s.delta}</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display">{s.value.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm mt-1">{s.label}</div>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                            <div className="text-gray-500 text-xs">{a.email}</div>
                          </td>
                          <td><span className="capitalize text-sm">{a.profile}</span></td>
                          <td className="text-sm text-gray-400">{a.field || a.profession || '—'}</td>
                          <td className="text-sm capitalize">{a.destination}</td>
                          <td className="text-sm text-gray-400">€{a.budget}</td>
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
                  <span className="text-gray-500 text-xs">{filtered.length} results</span>
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

          {/* ── SETTINGS TAB ── */}
          {!loading && activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
              <div className="stat-card rounded-2xl p-6 space-y-4">
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
                ['Budget', `€${selectedApp.budget}`],
                ['Status', selectedApp.status],
                ['Applied', new Date(selectedApp.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
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
    const saved = Cookies.get('admin_token')
    if (saved) setToken(saved)
  }, [])

  if (!token) return <AdminLogin onLogin={setToken} />
  return <Dashboard token={token} />
}
