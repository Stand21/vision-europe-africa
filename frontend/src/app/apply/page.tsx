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
import axios from 'axios'
import { useDestinations, type Destination } from '@/hooks/useDestinations'
import { useTranslation } from '@/hooks/useTranslation'
import { useCurrency } from '@/i18n/CurrencyProvider'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const DRAFT_KEY = 'vea_application_draft'

type Profile = 'student' | 'worker' | 'visitor'

// â”€â”€ Currencies (fallback; live list comes from /api/currencies) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FALLBACK_CURRENCIES = [
  { code: 'EUR', symbol: 'â‚¬', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: 'Â£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'XOF', symbol: 'CFA', label: 'West African CFA (BCEAO)' },
  { code: 'XAF', symbol: 'CFA', label: 'Central African CFA (BEAC)' },
  { code: 'GNF', symbol: 'GFr', label: 'Guinean Franc' },
  { code: 'NGN', symbol: 'â‚¦', label: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'â‚µ', label: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', label: 'Ugandan Shilling' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'CDF', symbol: 'FC', label: 'Congolese Franc' },
  { code: 'MAD', symbol: 'DH', label: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'DA', label: 'Algerian Dinar' },
  { code: 'EGP', symbol: 'EÂ£', label: 'Egyptian Pound' },
]

// â”€â”€ FiliÃ¨res d'Ã©tudes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Les montants sont en euros : ils sont convertis Ã  l'affichage dans la devise
// du visiteur. Les libellÃ©s viennent des traductions (form.study_fields.*).
const STUDY_FIELDS = [
  { id: 'cs',     icon: Code,       tuitionMin: 0,    tuitionMax: 500,  yearsMin: 3, yearsMax: 5, salary: 45000 },
  { id: 'cyber',  icon: Lock,       tuitionMin: 500,  tuitionMax: 1500, yearsMin: 3, yearsMax: 4, salary: 55000 },
  { id: 'med',    icon: Stethoscope,tuitionMin: 1000, tuitionMax: 5000, yearsMin: 6, yearsMax: 6, salary: 70000 },
  { id: 'biz',    icon: BarChart3,  tuitionMin: 0,    tuitionMax: 2000, yearsMin: 3, yearsMax: 3, salary: 40000 },
  { id: 'log',    icon: Truck,      tuitionMin: 0,    tuitionMax: 800,  yearsMin: 3, yearsMax: 3, salary: 42000 },
  { id: 'civil',  icon: Building2,  tuitionMin: 0,    tuitionMax: 600,  yearsMin: 4, yearsMax: 5, salary: 52000 },
  { id: 'mkt',    icon: Megaphone,  tuitionMin: 0,    tuitionMax: 1500, yearsMin: 3, yearsMax: 3, salary: 38000 },
  { id: 'ai',     icon: Brain,      tuitionMin: 0,    tuitionMax: 1000, yearsMin: 4, yearsMax: 4, salary: 65000 },
  { id: 'fin',    icon: Wallet,     tuitionMin: 500,  tuitionMax: 2000, yearsMin: 3, yearsMax: 4, salary: 48000 },
  { id: 'trade',  icon: Globe,      tuitionMin: 0,    tuitionMax: 1500, yearsMin: 3, yearsMax: 3, salary: 44000 },
]

// â”€â”€ MÃ©tiers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// salaryMin / salaryMax en euros bruts annuels ; demand est une clÃ© de traduction.
const PROFESSIONS = [
  { id: 'dev',          icon: Code,       salaryMin: 45000, salaryMax: 80000, demand: 'very_high', hoursMin: 40, hoursMax: 40 },
  { id: 'driver',       icon: Car,        salaryMin: 28000, salaryMax: 38000, demand: 'high',      hoursMin: 40, hoursMax: 50 },
  { id: 'welder',       icon: Wrench,     salaryMin: 30000, salaryMax: 45000, demand: 'high',      hoursMin: 40, hoursMax: 40 },
  { id: 'nurse',        icon: Stethoscope,salaryMin: 35000, salaryMax: 55000, demand: 'very_high', hoursMin: 38, hoursMax: 40 },
  { id: 'warehouse',    icon: Warehouse,  salaryMin: 25000, salaryMax: 35000, demand: 'high',      hoursMin: 40, hoursMax: 40 },
  { id: 'factory',      icon: Factory,    salaryMin: 24000, salaryMax: 36000, demand: 'high',      hoursMin: 40, hoursMax: 40 },
  { id: 'security',     icon: Lock,       salaryMin: 22000, salaryMax: 32000, demand: 'medium',    hoursMin: 40, hoursMax: 48 },
  { id: 'mechanic',     icon: Settings,   salaryMin: 28000, salaryMax: 45000, demand: 'high',      hoursMin: 40, hoursMax: 40 },
  { id: 'construction', icon: HardHat,    salaryMin: 26000, salaryMax: 40000, demand: 'very_high', hoursMin: 40, hoursMax: 50 },
  { id: 'delivery',     icon: Luggage,    salaryMin: 24000, salaryMax: 35000, demand: 'very_high', hoursMin: 40, hoursMax: 50 },
  { id: 'hospitality',  icon: Utensils,   salaryMin: 20000, salaryMax: 32000, demand: 'high',      hoursMin: 40, hoursMax: 40 },
]

// â”€â”€ CatÃ©gories de visite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Nom et description viennent des traductions (form.categories.*).
const VISITOR_CATEGORIES = [
  { id: 'tourism',    icon: Camera },
  { id: 'family',     icon: Heart },
  { id: 'business',   icon: Briefcase },
  { id: 'conference', icon: Mic },
  { id: 'discovery',  icon: Globe },
]

// â”€â”€ File Uploader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <p className="text-sm text-[#425466] dark:text-[#ebebf5]">{t('form.upload.drag')}</p>
        <p className="text-xs text-[#697386] dark:text-[#8e8e93] mt-1">{t('form.upload.hint')}</p>
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
              <button onClick={() => remove(i)} className="text-[#697386] dark:text-[#8e8e93] hover:text-[#d8a84e] transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// â”€â”€ Signature Pad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <label className="block text-sm font-medium text-[#425466] dark:text-[#ebebf5] mb-1.5">{t('form.signature.label')} *</label>
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
              <PenLine className="w-4 h-4" /> Signez ici
            </span>
          </div>
        )}
      </div>
      <button type="button" onClick={clear} className="text-xs text-[#697386] dark:text-[#8e8e93] hover:text-[#d8a84e] transition-colors">
        Effacer la signature
      </button>
    </div>
  )
}

// â”€â”€ Reusable form helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inputClass = "input"

// â”€â”€ Destination dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Options come from the admin-managed list; only destinations inside their
// availability period are returned by the API, so the list closes itself.
function DestinationSelect({
  register,
  destinations,
  loading,
  allowMultiple = false,
}: {
  register: any
  destinations: Destination[]
  loading: boolean
  allowMultiple?: boolean
}) {
  const { t } = useTranslation()

  return (
    <select {...register('destination', { required: true })} className={inputClass} disabled={loading}>
      <option value="">{loading ? t('form.placeholders.loading') : t('form.placeholders.select')}</option>
      {destinations.map(d => (
        <option key={d.code} value={d.code}>
          {(d.country_code || '').toUpperCase()}{d.country_code ? ' â€” ' : ''}{d.name}
        </option>
      ))}
      {allowMultiple && <option value="multiple">{t('form.options.multiple_countries')}</option>}
    </select>
  )
}
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
  const { t } = useTranslation()

  return (
    <Field label={label} required={required}>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="input w-24 sm:w-32 flex-shrink-0"
          aria-label={t('form.labels.currency')}
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

// â”€â”€ Selection grid (study fields / professions / categories) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Apply Page Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ApplyContent() {
  const { t, tList } = useTranslation()
  const { formatRange } = useCurrency()

  // Salaire et horaires d'un mÃ©tier, dans la devise et la langue du visiteur
  const professionSummary = (p: { salaryMin: number; salaryMax: number; hoursMin: number; hoursMax: number }) => {
    const hours = p.hoursMin === p.hoursMax ? `${p.hoursMin}` : `${p.hoursMin}â€“${p.hoursMax}`
    return `${formatRange(p.salaryMin, p.salaryMax, { compact: true })} Â· ${hours} ${t('form.field_info.per_week')}`
  }
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
  const { destinations, loading: destinationsLoading } = useDestinations()
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
        /* storage full â€” ignore */
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
    if (!profile) { toast.error(t('form.errors.no_profile')); return }
    if (profile === 'student' && !selectedField) { toast.error(t('form.errors.no_field')); return }
    if (profile === 'worker' && !selectedJob) { toast.error(t('form.errors.no_job')); return }
    if (profile === 'visitor' && !selectedCategory) { toast.error(t('form.errors.no_category')); return }
    if ((profile === 'student' || profile === 'worker') && !signature) {
      toast.error(t('form.errors.no_signature'))
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
      toast.success(t('form.success'))
      clearDraft()
    } catch (err: any) {
      const msg = err?.response?.data?.error || t('form.error')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const profiles = [
    { key: 'student' as Profile, icon: GraduationCap, label: t('profiles.student.title'), desc: t('profiles.student.description') },
    { key: 'worker' as Profile, icon: Briefcase, label: t('profiles.worker.title'), desc: t('profiles.worker.description') },
    { key: 'visitor' as Profile, icon: Plane, label: t('profiles.visitor.title'), desc: t('profiles.visitor.description') },
  ]

  const showSignature = profile === 'student' || profile === 'worker'

  return (
    <div className="application-page min-h-screen bg-white dark:bg-black pt-20 pb-16">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            {t('form.title')}
          </h1>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto">
            {t('form.autosave')}
          </p>
        </motion.div>

        <div className="application-progress" aria-label={t('form.progress')}>
          {[t('form.steps.profile'), t('form.steps.project'), t('form.steps.details'), t('form.steps.documents')].map((label, index) => (
            <div key={label} className={`application-progress-step ${index === 0 ? 'is-current' : ''}`}>
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1 â€” Profile */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white">1. {t('form.steps.profile')} <span className="text-[#d8a84e]">*</span></h2>
              {hasDraft && (
                <button type="button" onClick={clearDraft} className="text-xs flex items-center gap-1 text-[#697386] dark:text-[#8e8e93] hover:text-[#d8a84e] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> {t('form.clear_draft')}
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

          {/* STEP 2 â€” Field / Job / Category */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white mb-5">
                2. {profile === 'student' ? t('form.steps.field_step') : profile === 'worker' ? t('form.steps.job_step') : t('form.steps.category_step')} <span className="text-[#d8a84e]">*</span>
              </h2>
              {profile === 'student' && (
                <Field label={t('form.labels.field')} required>
                  <select value={selectedField} onChange={e => setSelectedField(e.target.value)} className={inputClass}>
                    <option value="">{t('form.placeholders.select_field')}</option>
                    {STUDY_FIELDS.map(f => (
                      <option key={f.id} value={f.id}>{t(`form.study_fields.${f.id}`)}</option>
                    ))}
                  </select>
                </Field>
              )}
              {profile === 'worker' && (
                <SelectCards
                  items={PROFESSIONS.map(p => ({ ...p, name: t(`form.professions.${p.id}`), sub: professionSummary(p) }))}
                  value={selectedJob}
                  onChange={setSelectedJob}
                />
              )}
              {profile === 'visitor' && (
                <SelectCards
                  items={VISITOR_CATEGORIES.map(c => ({ ...c, name: t(`form.categories.${c.id}.name`), sub: t(`form.categories.${c.id}.desc`) }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              )}
            </motion.div>
          )}

          {/* STEP 3 â€” Details */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white mb-5">3. {t('form.steps.details')}</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label={t('form.labels.full_name')} required>
                  <input {...register('fullName', { required: true })} className={inputClass} placeholder={t('form.placeholders.full_name')} />
                </Field>
                <Field label={t('form.labels.email')} required>
                  <input {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} type="email" className={inputClass} placeholder={t('form.placeholders.email')} />
                </Field>
                <Field label={t('form.labels.phone')} required>
                  <input {...register('phone', { required: true })} className={inputClass} placeholder={t('form.placeholders.phone')} />
                </Field>
                <Field label={t('form.labels.whatsapp')} required>
                  <input {...register('whatsapp', { required: true })} className={inputClass} placeholder={t('form.placeholders.phone')} />
                </Field>

                {profile === 'student' && (
                  <>
                    <Field label={t('form.labels.country')} required>
                      <input {...register('country', { required: true })} className={inputClass} placeholder={t('form.placeholders.country')} />
                    </Field>
                    <Field label={t('form.labels.city')} required>
                      <input {...register('city', { required: true })} className={inputClass} placeholder={t('form.placeholders.city')} />
                    </Field>
                    <Field label={t('form.labels.education_level')} required>
                      <select {...register('educationLevel', { required: true })} className={inputClass}>
                        <option value="">{t('form.placeholders.select')}</option>
                        {tList<string>('form.options.education_levels').map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label={t('form.labels.target_degree')} required>
                      <select {...register('targetDegree', { required: true })} className={inputClass}>
                        <option value="">{t('form.placeholders.select')}</option>
                        {tList<string>('form.options.degrees').map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label={t('form.labels.destination')} required>
                      <DestinationSelect register={register} destinations={destinations} loading={destinationsLoading} />
                    </Field>
                    <BudgetField label={t('form.labels.budget')} required register={register} name="budget" placeholder={t('form.placeholders.budget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('form.labels.id_number')} required>
                      <input {...register('idNumber', { required: true })} className={inputClass} placeholder={t('form.placeholders.id_number')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('form.labels.motivation')}>
                        <textarea {...register('motivationLetter')} rows={4} className={`${inputClass} resize-none`} placeholder={t('form.placeholders.motivation')} />
                      </Field>
                    </div>
                  </>
                )}

                {profile === 'worker' && (
                  <>
                    <Field label={t('form.labels.experience')} required>
                      <input {...register('experience', { required: true })} type="number" min="0" className={inputClass} placeholder={t('form.placeholders.experience')} />
                    </Field>
                    <Field label={t('form.labels.destination')} required>
                      <DestinationSelect register={register} destinations={destinations} loading={destinationsLoading} />
                    </Field>
                    <Field label={t('form.labels.work_hours')}>
                      <select {...register('workHours')} className={inputClass}>
                        {tList<string>('form.options.work_hours').map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <BudgetField label={t('form.labels.expected_salary')} register={register} name="expectedSalary" placeholder={t('form.placeholders.salary')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <BudgetField label={t('form.labels.immigration_budget')} required register={register} name="budget" placeholder={t('form.placeholders.budget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('form.labels.id_number')} required>
                      <input {...register('idNumber', { required: true })} className={inputClass} placeholder={t('form.placeholders.id_number')} />
                    </Field>
                  </>
                )}

                {profile === 'visitor' && (
                  <>
                    <Field label={t('form.labels.destination')} required>
                      <DestinationSelect register={register} destinations={destinations} loading={destinationsLoading} allowMultiple />
                    </Field>
                    <Field label={t('form.labels.duration')} required>
                      <select {...register('duration', { required: true })} className={inputClass}>
                        <option value="">{t('form.placeholders.select')}</option>
                        {tList<string>('form.options.durations').map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <BudgetField label={t('form.labels.budget')} register={register} name="budget" placeholder={t('form.placeholders.budget')} currencies={currencies} currency={currency} setCurrency={setCurrency} />
                    <Field label={t('form.labels.id_number')} required>
                      <input {...register('passportNumber', { required: true })} className={inputClass} placeholder={t('form.placeholders.id_number')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('form.labels.purpose')}>
                        <textarea {...register('purpose')} rows={3} className={`${inputClass} resize-none`} placeholder={t('form.placeholders.purpose')} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4 â€” Documents & signature */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8 space-y-6">
              <h2 className="font-semibold text-lg text-[#0a2540] dark:text-white">4. {t('form.steps.documents')}</h2>
              <FileUploader
                label={t('form.upload.label')}
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
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('form.submitting')}</> : <>{t('form.submit')} <CheckCircle className="w-4 h-4" /></>}
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
