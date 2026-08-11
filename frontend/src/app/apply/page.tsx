'use client'
import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  GraduationCap, Briefcase, Plane, Upload, X, CheckCircle,
  FileText, PenLine, Loader2, Code, Stethoscope, BarChart3,
  Truck, Building2, Megaphone, Brain, Wallet, Car, Wrench,
  Warehouse, Factory, Lock, Settings, HardHat, Globe,
  Camera, Heart, Mic, Trash2, Luggage, Utensils
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const DRAFT_KEY = 'vea_application_draft'

type Profile = 'student' | 'worker' | 'visitor'

// ── Currencies (fallback; live list comes from /api/currencies) ───────────────
const FALLBACK_CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'XOF', symbol: 'CFA', label: 'West African CFA (BCEAO)' },
  { code: 'XAF', symbol: 'CFA', label: 'Central African CFA (BEAC)' },
  { code: 'GNF', symbol: 'GFr', label: 'Guinean Franc' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵', label: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', label: 'Ugandan Shilling' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'CDF', symbol: 'FC', label: 'Congolese Franc' },
  { code: 'MAD', symbol: 'DH', label: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'DA', label: 'Algerian Dinar' },
  { code: 'EGP', symbol: 'E£', label: 'Egyptian Pound' },
]

// ── Study Fields ─────────────────────────────────────────────────────────────
const STUDY_FIELDS = [
  { id: 'cs', name: 'Computer Science', icon: Code, tuition: '€0–500/yr', duration: '3–5 yrs', salary: '€45,000/yr', countries: ['DE', 'PT'] },
  { id: 'cyber', name: 'Cybersecurity', icon: Lock, tuition: '€500–1500/yr', duration: '3–4 yrs', salary: '€55,000/yr', countries: ['DE', 'PT'] },
  { id: 'med', name: 'Medicine', icon: Stethoscope, tuition: '€1,000–5,000/yr', duration: '6 yrs', salary: '€70,000/yr', countries: ['DE', 'PT'] },
  { id: 'biz', name: 'Business Administration', icon: BarChart3, tuition: '€0–2,000/yr', duration: '3 yrs', salary: '€40,000/yr', countries: ['DE', 'PT'] },
  { id: 'log', name: 'Logistics', icon: Truck, tuition: '€0–800/yr', duration: '3 yrs', salary: '€42,000/yr', countries: ['DE'] },
  { id: 'civil', name: 'Civil Engineering', icon: Building2, tuition: '€0–600/yr', duration: '4–5 yrs', salary: '€52,000/yr', countries: ['DE', 'PT'] },
  { id: 'mkt', name: 'Marketing', icon: Megaphone, tuition: '€0–1,500/yr', duration: '3 yrs', salary: '€38,000/yr', countries: ['DE', 'PT'] },
  { id: 'ai', name: 'Artificial Intelligence', icon: Brain, tuition: '€0–1,000/yr', duration: '4 yrs', salary: '€65,000/yr', countries: ['DE'] },
  { id: 'fin', name: 'Finance', icon: Wallet, tuition: '€500–2,000/yr', duration: '3–4 yrs', salary: '€48,000/yr', countries: ['DE', 'PT'] },
  { id: 'trade', name: 'International Trade', icon: Globe, tuition: '€0–1,500/yr', duration: '3 yrs', salary: '€44,000/yr', countries: ['DE', 'PT'] },
]

// ── Professions ───────────────────────────────────────────────────────────────
const PROFESSIONS = [
  { id: 'dev', name: 'Software Developer', icon: Code, salary: '€45,000–80,000', demand: 'Very High', hours: '40h/week', countries: ['DE', 'PT'] },
  { id: 'driver', name: 'Driver', icon: Car, salary: '€28,000–38,000', demand: 'High', hours: '40–50h/week', countries: ['DE', 'PT'] },
  { id: 'welder', name: 'Welder', icon: Wrench, salary: '€30,000–45,000', demand: 'High', hours: '40h/week', countries: ['DE'] },
  { id: 'nurse', name: 'Nurse', icon: Stethoscope, salary: '€35,000–55,000', demand: 'Very High', hours: '38–40h/week', countries: ['DE', 'PT'] },
  { id: 'warehouse', name: 'Warehouse Worker', icon: Warehouse, salary: '€25,000–35,000', demand: 'High', hours: '40h/week', countries: ['DE', 'PT'] },
  { id: 'factory', name: 'Factory Worker', icon: Factory, salary: '€24,000–36,000', demand: 'High', hours: '40h/week', countries: ['DE'] },
  { id: 'security', name: 'Security Agent', icon: Lock, salary: '€22,000–32,000', demand: 'Medium', hours: '40–48h/week', countries: ['DE', 'PT'] },
  { id: 'mechanic', name: 'Mechanic', icon: Settings, salary: '€28,000–45,000', demand: 'High', hours: '40h/week', countries: ['DE', 'PT'] },
  { id: 'construction', name: 'Construction Worker', icon: HardHat, salary: '€26,000–40,000', demand: 'Very High', hours: '40–50h/week', countries: ['DE', 'PT'] },
  { id: 'delivery', name: 'Delivery Driver', icon: Luggage, salary: '€24,000–35,000', demand: 'Very High', hours: '40–50h/week', countries: ['DE', 'PT'] },
  { id: 'hospitality', name: 'Hospitality Worker', icon: Utensils, salary: '€20,000–32,000', demand: 'High', hours: '40h/week', countries: ['PT', 'DE'] },
]

// ── Visitor Categories ────────────────────────────────────────────────────────
const VISITOR_CATEGORIES = [
  { id: 'tourism', name: 'Tourism', icon: Camera, desc: 'Explore Europe\'s most beautiful cities and landmarks.' },
  { id: 'family', name: 'Family Visit', icon: Heart, desc: 'Visit family members residing in Europe.' },
  { id: 'business', name: 'Business Visit', icon: Briefcase, desc: 'Attend meetings, conferences or sign contracts.' },
  { id: 'conference', name: 'Conferences', icon: Mic, desc: 'Participate in academic or professional conferences.' },
  { id: 'discovery', name: 'European Discovery', icon: Globe, desc: 'Multi-country exploration tour of Europe.' },
]

// ── File Uploader ─────────────────────────────────────────────────────────────
function FileUploader({ label, files, onChange }: { label: string; files: File[]; onChange: (f: File[]) => void }) {
  const { t } = useTranslation()
  const onDrop = useCallback((accepted: File[]) => {
    onChange([...files, ...accepted])
  }, [files, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024,
  })

  const remove = (i: number) => {
    onChange(files.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#425466] dark:text-[#ebebf5] mb-1.5">{label}</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-[#635bff] bg-[#f6f9fc] dark:bg-[#2c2c2e]' : 'border-[#e3e8ee] dark:border-[#38383a] hover:border-[#cbd5e1] dark:hover:border-[#48484a] hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e]'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-[#697386] dark:text-[#8e8e93] mx-auto mb-2" />
        <p className="text-sm text-[#425466] dark:text-[#ebebf5]">{t('apply.dropzone')}</p>
        <p className="text-xs text-[#697386] dark:text-[#8e8e93] mt-1">{t('apply.fileTypes')}</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] text-sm border border-[#e3e8ee] dark:border-[#38383a]">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                <span className="text-[#0a2540] dark:text-white truncate">{f.name}</span>
                <span className="text-[#697386] dark:text-[#8e8e93] text-xs flex-shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
              </div>
              <button onClick={() => remove(i)} className="text-[#697386] dark:text-[#8e8e93] hover:text-[#ef4444] transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Signature Pad ─────────────────────────────────────────────────────────────
function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#635bff'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDraw = () => {
    drawing.current = false
    if (hasSignature) onSave(canvasRef.current!.toDataURL())
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSave('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#425466] dark:text-[#ebebf5] mb-1.5">{t('apply.signatureLabel')} *</label>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full rounded-xl border border-[#e3e8ee] dark:border-[#38383a] cursor-crosshair touch-none bg-white dark:bg-[#1c1c1e]"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-[#697386] dark:text-[#8e8e93] flex items-center gap-2">
              <PenLine className="w-4 h-4" /> {t('apply.signHere')}
            </span>
          </div>
        )}
      </div>
      <button type="button" onClick={clear} className="text-xs text-[#697386] dark:text-[#8e8e93] hover:text-[#ef4444] transition-colors">
        {t('apply.clearSignature')}
      </button>
    </div>
  )
}

// ── Reusable form helpers ──────────────────────────────────────────────────────
const inputClass = "input"
const labelClass = "block text-sm font-medium text-[#425466] dark:text-[#ebebf5] mb-1.5"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}{required ? ' *' : ''}</label>
      {children}
    </div>
  )
}

function BudgetField({ label, register, name, placeholder, required, currencies, currency, setCurrency }: {
  label: string
  register: any
  name: string
  placeholder?: string
  required?: boolean
  currencies: { code: string; symbol: string }[]
  currency: string
  setCurrency: (c: string) => void
}) {
  return (
    <Field label={label} required={required}>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="input w-24 sm:w-32 flex-shrink-0"
          aria-label="Currency"
        >
          {currencies.map(c => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
          ))}
        </select>
        <input {...register(name, { required })} className="input" placeholder={placeholder} />
      </div>
    </Field>
  )
}

// ── Selection grid (study fields / professions / categories) ──────────────────
function SelectCards({ items, value, onChange }: {
  items: { id: string; name: string; icon: React.ElementType; sub?: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(value === item.id ? '' : item.id)}
          className={`card p-4 text-left transition-all ${
            value === item.id ? 'border-[#635bff] ring-2 ring-[#635bff]/30' : 'hover:border-[#635bff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${value === item.id ? 'bg-[#635bff] text-white' : 'bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#635bff]'}`}>
              {React.createElement(item.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <div className="font-medium text-sm text-[#0a2540] dark:text-white">{item.name}</div>
              {item.sub && <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{item.sub}</div>}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Apply Page Content ────────────────────────────────────────────────────────
function ApplyContent() {
  const { t, tList, tValue } = useTranslation()
  const searchParams = useSearchParams()
  const urlProfile = (searchParams.get('profile') || '') as Profile
  const [profile, setProfile] = useState<Profile | null>(
    ['student', 'worker', 'visitor'].includes(urlProfile) ? urlProfile : null
  )
  const [selectedField, setSelectedField] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [signature, setSignature] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES)
  const [hasDraft, setHasDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const initialized = useRef(false)

  const { register, handleSubmit, reset, watch } = useForm<Record<string, any>>()
  const values = watch()

  // Load saved draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.profile) setProfile(d.profile)
        setSelectedField(d.selectedField || '')
        setSelectedJob(d.selectedJob || '')
        setSelectedCategory(d.selectedCategory || '')
        setSignature(d.signature || '')
        if (d.currency) setCurrency(d.currency)
        if (d.values) reset(d.values)
        setHasDraft(true)
      }
    } catch {
      /* ignore corrupted draft */
    }
    initialized.current = true
  }, [reset])

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!initialized.current) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          profile, selectedField, selectedJob, selectedCategory,
          signature, currency, values, savedAt: Date.now(),
        }))
      } catch {
        /* storage full — ignore */
      }
    }, 600)
    return () => clearTimeout(t)
  }, [profile, selectedField, selectedJob, selectedCategory, signature, currency, values])

  // Fetch live currency list
  useEffect(() => {
    axios.get(`${API}/currencies`)
      .then(r => { if (Array.isArray(r.data) && r.data.length) setCurrencies(r.data) })
      .catch(() => {})
  }, [])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    reset({})
    setProfile(null)
    setSelectedField('')
    setSelectedJob('')
    setSelectedCategory('')
    setFiles([])
    setSignature('')
    setCurrency('EUR')
  }

  const onSubmit = async (data: Record<string, any>) => {
    if (!profile) { toast.error(t('apply.errors.noProfile')); return }
    if (profile === 'student' && !selectedField) { toast.error(t('apply.errors.noField')); return }
    if (profile === 'worker' && !selectedJob) { toast.error(t('apply.errors.noJob')); return }
    if (profile === 'visitor' && !selectedCategory) { toast.error(t('apply.errors.noCategory')); return }
    if ((profile === 'student' || profile === 'worker') && !signature) {
      toast.error(t('apply.errors.noSignature'))
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') formData.append(k, String(v))
      })
      formData.append('profile', profile)
      if (profile === 'student') formData.append('field', selectedField)
      if (profile === 'worker') formData.append('profession', selectedJob)
      if (profile === 'visitor') formData.append('category', selectedCategory)
      formData.append('currency', currency)
      if (signature) formData.append('signature', signature)
      files.forEach(f => formData.append('documents', f))

      await axios.post(`${API}/applications`, formData)
      toast.success(t('apply.success'))
      clearDraft()
    } catch (err: any) {
      const msg = err?.response?.data?.error || t('apply.fail')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const profiles = [
    { key: 'student' as Profile, icon: GraduationCap, label: t('apply.profile.student.label'), desc: t('apply.profile.student.desc') },
    { key: 'worker' as Profile, icon: Briefcase, label: t('apply.profile.worker.label'), desc: t('apply.profile.worker.desc') },
    { key: 'visitor' as Profile, icon: Plane, label: t('apply.profile.visitor.label'), desc: t('apply.profile.visitor.desc') },
  ]

  const educationLevels = tList('apply.educationLevels')
  const targetDegrees = tList('apply.targetDegrees')
  const workHours = tList('apply.workHours')
  const durations = tList('apply.durations')

  const showSignature = profile === 'student' || profile === 'worker'

  return (
    <div className="application-page min-h-screen bg-white dark:bg-black pt-20 pb-16">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            {t('apply.title')} <span className="text-[#635bff]">{t('apply.titleHighlight')}</span>
          </h1>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto">
            {t('apply.subtitle')}
          </p>
        </motion.div>

        <div className="application-progress" aria-label={t('apply.progressAria')}>
          {tList('apply.progress').map((label, index) => (
            <div key={label} className={`application-progress-step ${index === 0 ? 'is-current' : ''}`}>
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1 — Profile */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white">1. {t('apply.step1Title')} <span className="text-[#ef4444]">*</span></h2>
              {hasDraft && (
                <button type="button" onClick={clearDraft} className="text-xs flex items-center gap-1 text-[#697386] dark:text-[#8e8e93] hover:text-[#ef4444] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> {t('apply.clearDraft')}
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {profiles.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setProfile(p.key)}
                  aria-pressed={profile === p.key}
                  className={`card p-6 text-left transition-all ${
                    profile === p.key ? 'border-[#635bff] ring-2 ring-[#635bff]/30' : 'hover:border-[#635bff]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                    profile === p.key ? 'bg-[#635bff] text-white' : 'bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#635bff]'
                  }`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#0a2540] dark:text-white mb-1">{p.label}</h3>
                  <p className="text-sm text-[#425466] dark:text-[#ebebf5]">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 — Field / Job / Category */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white mb-5">
                2. {profile === 'student' ? t('apply.studyFieldLabel') : profile === 'worker' ? t('apply.jobField') : t('apply.categoryField')} <span className="text-[#ef4444]">*</span>
              </h2>
              {profile === 'student' && (
                <Field label={t('apply.studyFieldLabel')} required>
                  <select value={selectedField} onChange={e => setSelectedField(e.target.value)} className={inputClass}>
                    <option value="">{t('apply.selectField')}</option>
                    {STUDY_FIELDS.map(f => (
                      <option key={f.id} value={f.id}>{t(`apply.studyFields.${f.id}`)}</option>
                    ))}
                  </select>
                </Field>
              )}
              {profile === 'worker' && (
                <SelectCards
                  items={PROFESSIONS.map(p => ({ ...p, name: t(`apply.professions.${p.id}`), sub: `${p.salary} · ${p.hours}` }))}
                  value={selectedJob}
                  onChange={setSelectedJob}
                />
              )}
              {profile === 'visitor' && (
                <SelectCards
                  items={VISITOR_CATEGORIES.map(c => ({ ...c, name: t(`apply.visitorCats.${c.id}.label`), sub: t(`apply.visitorCats.${c.id}.desc`) }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              )}
            </motion.div>
          )}

          {/* STEP 3 — Details */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white mb-5">3. {t('apply.step3Title')}</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label={t('apply.fields.fullName')} required>
                  <input {...register('fullName', { required: true })} className={inputClass} placeholder={t('apply.placeholders.fullName')} />
                </Field>
                <Field label={t('apply.fields.email')} required>
                  <input {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} type="email" className={inputClass} placeholder={t('apply.placeholders.email')} />
                </Field>
                <Field label={t('apply.fields.phone')} required>
                  <input {...register('phone', { required: true })} className={inputClass} placeholder={t('apply.placeholders.phone')} />
                </Field>
                <Field label={t('apply.fields.whatsapp')} required>
                  <input {...register('whatsapp', { required: true })} className={inputClass} placeholder={t('apply.placeholders.whatsapp')} />
                </Field>

                {profile === 'student' && (
                  <>
                    <Field label={t('apply.fields.country')} required>
                      <input {...register('country', { required: true })} className={inputClass} placeholder={t('apply.placeholders.country')} />
                    </Field>
                    <Field label={t('apply.fields.city')} required>
                      <input {...register('city', { required: true })} className={inputClass} placeholder={t('apply.placeholders.city')} />
                    </Field>
                    <Field label={t('apply.fields.educationLevel')} required>
                      <select {...register('educationLevel', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        {educationLevels.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label={t('apply.fields.targetDegree')} required>
                      <select {...register('targetDegree', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        {targetDegrees.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label={t('apply.fields.destination')} required>
                      <select {...register('destination', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        <option value="germany">{t('apply.destinations.germany')}</option>
                        <option value="portugal">{t('apply.destinations.portugal')}</option>
                      </select>
                    </Field>
                    <BudgetField label={t('apply.fields.budget')} required register={register} name="budget" placeholder={t('apply.placeholders.budget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('apply.fields.idNumber')} required>
                      <input {...register('idNumber', { required: true })} className={inputClass} placeholder={t('apply.placeholders.idNumber')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('apply.fields.motivationLetter')}>
                        <textarea {...register('motivationLetter')} rows={4} className={`${inputClass} resize-none`} placeholder={t('apply.placeholders.motivationLetter')} />
                      </Field>
                    </div>
                  </>
                )}

                {profile === 'worker' && (
                  <>
                    <Field label={t('apply.fields.experience')} required>
                      <input {...register('experience', { required: true })} type="number" min="0" className={inputClass} placeholder={t('apply.placeholders.experience')} />
                    </Field>
                    <Field label={t('apply.fields.destination')} required>
                      <select {...register('destination', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        <option value="germany">{t('apply.destinations.germany')}</option>
                        <option value="portugal">{t('apply.destinations.portugal')}</option>
                      </select>
                    </Field>
                    <Field label={t('apply.fields.workHours')}>
                      <select {...register('workHours')} className={inputClass}>
                        {workHours.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <BudgetField label={t('apply.fields.expectedSalary')} register={register} name="expectedSalary" placeholder={t('apply.placeholders.expectedSalary')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <BudgetField label={t('apply.fields.immigrationBudget')} required register={register} name="budget" placeholder={t('apply.placeholders.immigrationBudget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('apply.fields.idNumber')} required>
                      <input {...register('idNumber', { required: true })} className={inputClass} placeholder={t('apply.placeholders.idNumber')} />
                    </Field>
                  </>
                )}

                {profile === 'visitor' && (
                  <>
                    <Field label={t('apply.fields.destination')} required>
                      <select {...register('destination', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        <option value="germany">{t('apply.destinations.germany')}</option>
                        <option value="portugal">{t('apply.destinations.portugal')}</option>
                        <option value="multiple">{t('apply.destinations.multiple')}</option>
                      </select>
                    </Field>
                    <Field label={t('apply.fields.duration')} required>
                      <select {...register('duration', { required: true })} className={inputClass}>
                        <option value="">{t('apply.select')}</option>
                        {durations.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <BudgetField label={t('apply.fields.budget')} register={register} name="budget" placeholder={t('apply.placeholders.budget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('apply.fields.passportNumber')} required>
                      <input {...register('passportNumber', { required: true })} className={inputClass} placeholder={t('apply.placeholders.passportNumber')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('apply.fields.purpose')}>
                        <textarea {...register('purpose')} rows={3} className={`${inputClass} resize-none`} placeholder={t('apply.placeholders.purpose')} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Documents & signature */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8 space-y-6">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white">4. {t('apply.step4Title')}</h2>
              <FileUploader
                label={profile === 'visitor' ? t('apply.uploadPassport') : t('apply.uploadDocs')}
                files={files}
                onChange={setFiles}
              />
              {showSignature && <SignaturePad onSave={setSignature} />}
            </motion.div>
          )}

          {/* Submit */}
          {profile && (
            <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] bg-white/95 dark:bg-[#0b1020]/95 backdrop-blur px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:static md:mx-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <button type="submit" disabled={submitting} className="application-submit btn-primary w-full justify-center">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('apply.submitting')}</> : <>{t('apply.submit')} <CheckCircle className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-white pt-28 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#635bff] animate-spin" /></div>}>
        <ApplyContent />
      </Suspense>
      <Footer />
    </>
  )
}
