'use client'
import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  GraduationCap, Briefcase, Plane, Upload, X, CheckCircle,
  ArrowRight, ArrowLeft, FileText, User, Phone, Mail, Globe2,
  PenLine, Loader2, Code, Stethoscope, BarChart3, Truck,
  Building2, Megaphone, Brain, Wallet, Car, Wrench, Warehouse,
  Factory, Lock, Settings, HardHat, Globe, Ship, PlaneTakeoff,
  Luggage, Camera, Music, Utensils, ShoppingBag, Dumbbell,
  Palette, Gamepad2, BookMarked, Calculator, FlaskConical,
  Atom, Dna, Microscope, PenTool as PenToolIcon, Mic,
  DollarSign, Clock, TrendingUp, Heart
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import axios from 'axios'

type Profile = 'student' | 'worker' | 'visitor' | null

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

const STUDY_ICONS: Record<string, React.ElementType> = {
  cs: Code, cyber: Lock, med: Stethoscope, biz: BarChart3,
  log: Truck, civil: Building2, mkt: Megaphone, ai: Brain,
  fin: Wallet, trade: Globe,
}

const PROFESSION_ICONS: Record<string, React.ElementType> = {
  dev: Code, driver: Car, welder: Wrench, nurse: Stethoscope,
  warehouse: Warehouse, factory: Factory, security: Lock,
  mechanic: Settings, construction: HardHat, delivery: Luggage,
  hospitality: Utensils,
}

const VISITOR_ICONS: Record<string, React.ElementType> = {
  tourism: Camera, family: Heart, business: Briefcase,
  conference: Mic, discovery: Globe,
}

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
function FileUploader({ label, onFiles }: { label: string; onFiles: (f: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((accepted: File[]) => {
    const updated = [...files, ...accepted]
    setFiles(updated)
    onFiles(updated)
  }, [files, onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024,
  })

  const remove = (i: number) => {
    const updated = files.filter((_, idx) => idx !== i)
    setFiles(updated)
    onFiles(updated)
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
        <p className="text-sm text-[#425466] dark:text-[#ebebf5]">Drag & drop files here, or click to select</p>
        <p className="text-xs text-[#697386] dark:text-[#8e8e93] mt-1">PDF, JPG, PNG — max 10MB</p>
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
      <label className="block text-sm font-medium text-[#425466] dark:text-[#ebebf5] mb-1.5">Electronic Signature *</label>
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
              <PenLine className="w-4 h-4" /> Sign here
            </span>
          </div>
        )}
      </div>
      <button type="button" onClick={clear} className="text-xs text-[#697386] dark:text-[#8e8e93] hover:text-[#ef4444] transition-colors">
        Clear signature
      </button>
    </div>
  )
}

// ── Student Form ──────────────────────────────────────────────────────────────
function StudentForm({ selectedField }: { selectedField: string }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [files, setFiles] = useState<File[]>([])
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!signature) { toast.error('Please add your electronic signature'); return }
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
      formData.append('profile', 'student')
      formData.append('field', selectedField)
      formData.append('signature', signature)
      files.forEach(f => formData.append('documents', f))
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/applications`, formData)
      toast.success('Application submitted! We\'ll contact you within 48 hours.')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Full Name *</label>
          <input {...register('fullName', { required: true })} className="input" placeholder="Jean-Baptiste Kabila" />
          {errors.fullName && <span className="text-xs text-[#ef4444] mt-1">Required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Email *</label>
          <input {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} type="email" className="input" placeholder="jean@example.com" />
          {errors.email && <span className="text-xs text-[#ef4444] mt-1">Valid email required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Phone *</label>
          <input {...register('phone', { required: true })} className="input" placeholder="+243 000 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">WhatsApp *</label>
          <input {...register('whatsapp', { required: true })} className="input" placeholder="+243 000 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Country *</label>
          <input {...register('country', { required: true })} className="input" placeholder="DR Congo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">City *</label>
          <input {...register('city', { required: true })} className="input" placeholder="Kinshasa" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Current Education Level *</label>
          <select {...register('educationLevel', { required: true })} className="input">
            <option value="">Select level</option>
            <option>High School</option>
            <option>Bachelor's (ongoing)</option>
            <option>Bachelor's (completed)</option>
            <option>Master's</option>
            <option>PhD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Target Degree *</label>
          <select {...register('targetDegree', { required: true })} className="input">
            <option value="">Select degree</option>
            <option>Bachelor</option>
            <option>Master</option>
            <option>PhD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Destination Country *</label>
          <select {...register('destination', { required: true })} className="input">
            <option value="">Select destination</option>
            <option value="germany">Germany</option>
            <option value="portugal">Portugal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Available Budget (€) *</label>
          <input {...register('budget', { required: true })} className="input" placeholder="e.g. 5,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Passport/ID Number *</label>
          <input {...register('idNumber', { required: true })} className="input" placeholder="AB123456" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#425466] mb-1.5">Motivation Letter</label>
        <textarea {...register('motivationLetter')} rows={4} className="input resize-none" placeholder="Explain why you want to study in Europe and what your goals are..." />
      </div>

      <FileUploader label="Upload Documents (Passport, ID, Diplomas)" onFiles={setFiles} />
      <SignaturePad onSave={setSignature} />

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
      </button>
    </motion.form>
  )
}

// ── Worker Form ────────────────────────────────────────────────────────────────
function WorkerForm({ selectedJob }: { selectedJob: string }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [files, setFiles] = useState<File[]>([])
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!signature) { toast.error('Please add your signature'); return }
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
      formData.append('profile', 'worker')
      formData.append('profession', selectedJob)
      formData.append('signature', signature)
      files.forEach(f => formData.append('documents', f))
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/applications`, formData)
      toast.success('Application submitted! Our team will contact you within 48 hours.')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Full Name *</label>
          <input {...register('fullName', { required: true })} className="input" placeholder="Amara Diallo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Email *</label>
          <input {...register('email', { required: true })} type="email" className="input" placeholder="amara@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Phone *</label>
          <input {...register('phone', { required: true })} className="input" placeholder="+243 000 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">WhatsApp *</label>
          <input {...register('whatsapp', { required: true })} className="input" placeholder="+243 000 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Years of Experience *</label>
          <input {...register('experience', { required: true })} className="input" placeholder="5" type="number" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Destination *</label>
          <select {...register('destination', { required: true })} className="input">
            <option value="">Select destination</option>
            <option value="germany">Germany</option>
            <option value="portugal">Portugal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Preferred Work Hours</label>
          <select {...register('workHours')} className="input">
            <option>Full-time (40h/week)</option>
            <option>Part-time (20h/week)</option>
            <option>Flexible</option>
            <option>Shifts</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Expected Salary (€/year)</label>
          <input {...register('expectedSalary')} className="input" placeholder="e.g. 35,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Immigration Budget (€) *</label>
          <input {...register('budget', { required: true })} className="input" placeholder="e.g. 3,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Passport/ID Number *</label>
          <input {...register('idNumber', { required: true })} className="input" placeholder="AB123456" />
        </div>
      </div>

      <FileUploader label="Upload CV, Passport & Supporting Documents" onFiles={setFiles} />
      <SignaturePad onSave={setSignature} />

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
      </button>
    </motion.form>
  )
}

// ── Visitor Form ───────────────────────────────────────────────────────────────
function VisitorForm({ selectedCategory }: { selectedCategory: string }) {
  const { register, handleSubmit } = useForm()
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
      formData.append('profile', 'visitor')
      formData.append('category', selectedCategory)
      files.forEach(f => formData.append('documents', f))
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/applications`, formData)
      toast.success('Visitor application submitted! We\'ll contact you shortly.')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Full Name *</label>
          <input {...register('fullName', { required: true })} className="input" placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Email *</label>
          <input {...register('email', { required: true })} type="email" className="input" placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Destination Country *</label>
          <select {...register('destination', { required: true })} className="input">
            <option value="">Select</option>
            <option value="germany">Germany</option>
            <option value="portugal">Portugal</option>
            <option value="multiple">Multiple Countries</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Planned Duration *</label>
          <select {...register('duration', { required: true })} className="input">
            <option value="">Select</option>
            <option>Less than 2 weeks</option>
            <option>2–4 weeks</option>
            <option>1–3 months</option>
            <option>More than 3 months</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Estimated Budget (€)</label>
          <input {...register('budget')} className="input" placeholder="e.g. 2,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#425466] mb-1.5">Passport Number *</label>
          <input {...register('passportNumber', { required: true })} className="input" placeholder="AB123456" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#425466] mb-1.5">Purpose of Visit</label>
        <textarea {...register('purpose')} rows={3} className="input resize-none" placeholder="Describe the purpose of your visit..." />
      </div>
      <FileUploader label="Upload Passport" onFiles={setFiles} />

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
      </button>
    </motion.form>
  )
}

// ── Apply Page Content ────────────────────────────────────────────────────────
function ApplyContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile>(
    (searchParams.get('profile') as Profile) || null
  )
  const [selectedField, setSelectedField] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [step, setStep] = useState<'profile' | 'select' | 'form'>(
    searchParams.get('profile') ? 'select' : 'profile'
  )

  const profiles = [
    { key: 'student' as Profile, icon: GraduationCap, label: 'Student', desc: 'Study at top European universities' },
    { key: 'worker' as Profile, icon: Briefcase, label: 'Worker', desc: 'Access high-demand professions in Europe' },
    { key: 'visitor' as Profile, icon: Plane, label: 'Visitor', desc: 'Tourism, business or family visits' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-16">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            Start Your <span className="text-[#635bff]">Application</span>
          </h1>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto">
            Complete the form below. Our team will review your application and contact you within 48 hours.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['Profile', 'Choose', 'Apply'].map((s, i) => {
            const active = i === (['profile', 'select', 'form'] as const).indexOf(step)
            const done = i < (['profile', 'select', 'form'] as const).indexOf(step)
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                  done ? 'bg-[#635bff] text-white' : active ? 'bg-[#635bff] text-white' : 'bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#697386] dark:text-[#8e8e93] border border-[#e3e8ee] dark:border-[#38383a]'
                }`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-[#0a2540] dark:text-white' : 'text-[#697386] dark:text-[#8e8e93]'}`}>{s}</span>
                {i < 2 && <div className="w-8 h-px bg-[#e3e8ee] dark:bg-[#38383a]" />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Profile Selection */}
          {step === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid md:grid-cols-3 gap-4">
                {profiles.map(p => (
                  <button
                    key={p.key}
                    onClick={() => { setProfile(p.key); setStep('select') }}
                    className="card p-6 text-left hover:border-[#635bff] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center mb-4 group-hover:bg-[#635bff] group-hover:text-white transition-colors">
                      <p.icon className="w-5 h-5 text-[#635bff] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[#0a2540] dark:text-white mb-1">{p.label}</h3>
                    <p className="text-sm text-[#425466] dark:text-[#ebebf5]">{p.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Select Field/Job/Category */}
          {step === 'select' && profile === 'student' && (
            <motion.div key="student-select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('profile')} className="flex items-center gap-1 text-[#635bff] hover:text-[#4b45c6] text-sm font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-semibold text-[#0a2540] dark:text-white">Select your study field</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {STUDY_FIELDS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setSelectedField(f.name); setStep('form') }}
                    className="card p-5 text-left hover:border-[#635bff] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center mb-3">
                      {React.createElement(f.icon as React.ElementType, { className: 'w-5 h-5 text-[#635bff]' })}
                    </div>
                    <h4 className="font-medium text-sm text-[#0a2540] dark:text-white mb-2">{f.name}</h4>
                    <div className="space-y-1 text-xs text-[#697386] dark:text-[#8e8e93]">
                      <div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {f.tuition}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {f.duration}</div>
                      <div className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> {f.salary} avg</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'select' && profile === 'worker' && (
            <motion.div key="worker-select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('profile')} className="flex items-center gap-1 text-[#635bff] hover:text-[#4b45c6] text-sm font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-semibold text-[#0a2540] dark:text-white">Select your profession</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {PROFESSIONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedJob(p.name); setStep('form') }}
                    className="card p-5 text-left hover:border-[#635bff] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center mb-3">
                      {React.createElement(p.icon as React.ElementType, { className: 'w-5 h-5 text-[#635bff]' })}
                    </div>
                    <h4 className="font-medium text-sm text-[#0a2540] dark:text-white mb-2">{p.name}</h4>
                    <div className="space-y-1 text-xs text-[#697386] dark:text-[#8e8e93]">
                      <div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {p.salary}</div>
                      <div className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> Demand: <span className={p.demand === 'Very High' ? 'text-[#0d9488]' : 'text-[#f59e0b]'}>{p.demand}</span></div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {p.hours}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'select' && profile === 'visitor' && (
            <motion.div key="visitor-select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('profile')} className="flex items-center gap-1 text-[#635bff] hover:text-[#4b45c6] text-sm font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-semibold text-[#0a2540] dark:text-white">Select visit category</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {VISITOR_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.name); setStep('form') }}
                    className="card p-5 text-left hover:border-[#635bff] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center mb-3">
                      {React.createElement(c.icon as React.ElementType, { className: 'w-5 h-5 text-[#635bff]' })}
                    </div>
                    <h4 className="font-medium text-sm text-[#0a2540] dark:text-white mb-1">{c.name}</h4>
                    <p className="text-xs text-[#697386] dark:text-[#8e8e93]">{c.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Form */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('select')} className="flex items-center gap-1 text-[#635bff] hover:text-[#4b45c6] text-sm font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div>
                  <h2 className="font-semibold text-[#0a2540] dark:text-white">
                    {profile === 'student' && `Student Application — ${selectedField}`}
                    {profile === 'worker' && `Worker Application — ${selectedJob}`}
                    {profile === 'visitor' && `Visitor Application — ${selectedCategory}`}
                  </h2>
                  <p className="text-xs text-[#697386] dark:text-[#8e8e93]">Fill all required fields and upload your documents.</p>
                </div>
              </div>

              <div className="card p-6 md:p-8">
                {profile === 'student' && <StudentForm selectedField={selectedField} />}
                {profile === 'worker' && <WorkerForm selectedJob={selectedJob} />}
                {profile === 'visitor' && <VisitorForm selectedCategory={selectedCategory} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
