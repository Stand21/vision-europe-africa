'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight, ArrowUpRight, Star, CheckCircle, Clock, Shield,
  ChevronDown, GraduationCap, Briefcase, Plane, MapPin, Users,
  Award, Globe, Send, PlaneTakeoff, Play, X, Quote, BadgeCheck, BookOpen, Search,
  SlidersHorizontal, MessageCircle
} from 'lucide-react'
import axios from 'axios'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useDestinations, type Destination } from '@/hooks/useDestinations'
import { useCurrency } from '@/i18n/CurrencyProvider'
import { useScholarships, usePublicSettings, whatsappLink } from '@/hooks/useScholarships'

const MEDIA = {
  germany: '/images/germany.jpg',
  portugal: '/images/portugal.jpg',
  student: '/images/student.jpg',
  worker: '/images/worker.jpg',
  visitor: '/images/visitor.jpg',
}

const AVATARS = [
  '/images/avatar-1.jpg',
  '/images/avatar-2.jpg',
  '/images/avatar-3.jpg',
  '/images/avatar-4.jpg',
]

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t, tList } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const { destinations } = useDestinations()

  const heroDestinations = [...destinations]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 3)

  const stats = [
    { value: 5000, suffix: '+', label: t('hero.stats.applicants'), icon: Users },
    { value: 30, suffix: '+', label: t('hero.stats.countries'), icon: MapPin },
    { value: 8, suffix: '', label: t('hero.stats.years'), icon: Award },
    { value: 97, suffix: '%', label: t('hero.stats.satisfaction'), icon: Star },
  ]

  return (
    <section className="relative overflow-hidden bg-[#0a2540]">
      {/* Layered gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(99,91,255,0.18),transparent),radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(99,91,255,0.12),transparent),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(216,168,78,0.08),transparent)]" />
      </div>
      <div className="absolute inset-0 opacity-15">
        <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover" loading="eager" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2540]/60 via-[#0a2540]/85 to-[#0a2540]" />

      <div className="relative z-10 container-custom pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-[#a5a3ff]" />
              {t('hero.badge')}
            </div>

            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white md:text-[3.75rem]">
              {t('hero.title')}
              <span className="mt-2 block bg-gradient-to-r from-[#c7c6ff] to-[#a5a3ff] bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[1.05rem] leading-[1.75] text-slate-300/90 md:text-lg">
              {t('hero.subtitle')}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#635bff] px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(99,91,255,0.35)] transition-all duration-300 hover:bg-[#5550e6] hover:shadow-[0_12px_40px_rgba(99,91,255,0.45)] hover:-translate-y-0.5"
              >
                {t('hero.cta_primary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2]"
              >
                {t('hero.cta_secondary')}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2.5">
              {[
                { label: 'Études', variant: 'primary' },
                { label: 'Travail', variant: 'default' },
                { label: 'Visas', variant: 'primary' },
                { label: '24/7', variant: 'gold' },
              ].map(({ label, variant }) => (
                <span
                  key={label}
                  className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium ${
                    variant === 'primary'
                      ? 'border-[#635bff]/25 bg-[#635bff]/10 text-[#c7c6ff]'
                      : variant === 'gold'
                        ? 'border-[#d8a84e]/25 bg-[#d8a84e]/10 text-[#e9c48a]'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-300'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-5">
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-11 w-11 rounded-full border-[2.5px] border-[#0a2540] object-cover"
                    loading="lazy"
                  />
                ))}
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-[#0a2540] bg-[#635bff] text-[10px] font-bold text-white">
                  +5k
                </div>
              </div>
              <div className="text-sm text-slate-300/80">
                <span className="font-semibold text-white">5 000+</span> {t('hero.trust')}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Subtle glow behind card */}
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(99,91,255,0.12),transparent_70%)] blur-2xl" />

            <div className="relative rounded-[20px] border border-white/[0.08] bg-[#0d1f36]/90 p-6 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#635bff] shadow-[0_4px_16px_rgba(99,91,255,0.4)]">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400/80">Europe</div>
                    <div className="text-[17px] font-semibold text-white">Vision Europe Africa</div>
                  </div>
                </div>
                <div className="rounded-full border border-[#635bff]/25 bg-[#635bff]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a5a3ff]">
                  Open
                </div>
              </div>

              {/* Destinations list */}
              <div className="mt-6 rounded-[14px] border border-white/[0.06] bg-[#0b172a]/80 p-4">
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Destinations</span>
                  <span className="rounded-full bg-[#635bff]/12 px-2.5 py-1 text-[10px] font-semibold text-[#c7c6ff]">3 pays</span>
                </div>

                <div className="space-y-2.5">
                  {heroDestinations.map((dest) => (
                    <div key={dest.code} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#635bff]/15 text-xs font-bold tracking-widest text-[#a5a3ff]">
                          {(dest.country_code || '').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{dest.name}</div>
                          <div className="text-xs text-slate-400/70">{dest.tagline}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500">Visa</div>
                        <div className="text-sm font-semibold text-[#a5a3ff]">{dest.visa_weeks_min || 4}–{dest.visa_weeks_max || dest.visa_weeks_min || 6}w</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Taux</div>
                  <div className="mt-2 text-[1.65rem] font-bold text-white leading-none">97%</div>
                  <div className="mt-1.5 text-xs text-slate-400/70">de réussite</div>
                </div>
                <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Réponse</div>
                  <div className="mt-2 text-[1.65rem] font-bold text-white leading-none">48h</div>
                  <div className="mt-1.5 text-xs text-slate-400/70">sur dossier</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(({ value, suffix, label, icon: Icon }, i) => (
            <div key={i} className="rounded-[16px] border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#635bff]/12 text-[#a5a3ff]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-white">
                {inView ? <CountUp end={value} duration={2} delay={i * 0.1} /> : '0'}
                {suffix}
              </div>
              <div className="mt-1 text-sm text-slate-300/80">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Trust Bar ──────────────────────────────────────────────────────────────────
function TrustBar() {
  const { tList } = useTranslation()
  const icons = [Shield, BadgeCheck, Clock, Send, Globe]
  const items = tList<string>('hero.trust_bar').map((label, i) => ({ icon: icons[i], label }))
  const doubled = [...items, ...items]

  return (
    <div className="border-y border-[#e3e8ee]/60 bg-white dark:border-[#38383a]/60 dark:bg-[#0a0a0a]">
      <div className="container-custom py-5">
        <div className="overflow-hidden">
          <div className="marquee-track gap-8 py-1 text-sm text-[#475569] dark:text-slate-200">
            {doubled.map((item, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border border-[#e3e8ee]/50 bg-[#f8fafc] px-5 py-2.5 dark:border-[#2c2c2e] dark:bg-[#111827]/80">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#635bff]/8 text-[#635bff] dark:text-[#a5a3ff]">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Profiles / Services ────────────────────────────────────────────────────────
function ProfileSection() {
  const { t, tList } = useTranslation()

  const profiles = [
    {
      key: 'student', image: MEDIA.student, chip: GraduationCap,
      title: t('profiles.student.title'),
      description: t('profiles.student.description'),
      badge: t('profiles.student.badge'),
      cta: t('profiles.student.cta'),
      href: '/apply?profile=student',
      features: tList<string>('profiles.student.features'),
    },
    {
      key: 'worker', image: MEDIA.worker, chip: Briefcase,
      title: t('profiles.worker.title'),
      description: t('profiles.worker.description'),
      badge: t('profiles.worker.badge'),
      cta: t('profiles.worker.cta'),
      href: '/apply?profile=worker',
      features: tList<string>('profiles.worker.features'),
    },
    {
      key: 'visitor', image: MEDIA.visitor, chip: Plane,
      title: t('profiles.visitor.title'),
      description: t('profiles.visitor.description'),
      badge: t('profiles.visitor.badge'),
      cta: t('profiles.visitor.cta'),
      href: '/apply?profile=visitor',
      features: tList<string>('profiles.visitor.features'),
    },
  ]

  return (
    <section id="services" className="py-24 bg-[#f8fafc] dark:bg-[#080808]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div className="section-kicker justify-center">{t('profiles.title')}</div>
          <h2 className="section-title mt-5 mb-4 text-[#0a2540] dark:text-white">
            {t('profiles.subtitle')}
          </h2>
          <p className="mx-auto max-w-2xl text-[1.05rem] leading-relaxed text-[#425466] dark:text-[#8e8e93]">
            {t('profiles.subtitle')}
          </p>
        </motion.div>

        <div className="grid gap-7 lg:grid-cols-3">
          {profiles.map((p, i) => {
            const Icon = p.chip
            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={p.href}
                  className="group block h-full rounded-[20px] border border-[#e3e8ee]/80 bg-white overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(15,23,42,0.12)] dark:border-[#2c2c2e] dark:bg-[#111827]"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/85 via-[#0a2540]/25 to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                      {p.badge}
                    </div>
                    <div className="absolute bottom-5 left-5 flex h-13 w-13 items-center justify-center rounded-[14px] bg-[#635bff] shadow-[0_8px_24px_rgba(99,91,255,0.4)]">
                      <Icon className="h-5.5 w-5.5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-[1.35rem] font-bold text-[#0a2540] dark:text-white">{p.title}</h3>
                    <p className="mt-3 text-[0.9rem] leading-[1.65] text-[#425466] dark:text-[#8e8e93]">{p.description}</p>

                    <ul className="mt-5 space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-[#425466] dark:text-[#9ca3af]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#635bff]/10 text-[#635bff]">
                            <CheckCircle className="h-3 w-3" />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#635bff]">
                      {p.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Destinations ───────────────────────────────────────────────────────────────
const CLOSING_SOON_DAYS = 45

function daysUntil(date?: string | null): number | null {
  if (!date) return null
  const diff = new Date(date + 'T23:59:59').getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function DestinationsSection() {
  const { t } = useTranslation()
  const { formatMoney, formatRange } = useCurrency()
  const { destinations, loading } = useDestinations()

  const [profile, setProfile] = useState('')
  const [cost, setCost] = useState('')
  const [language, setLanguage] = useState('')
  const [visa, setVisa] = useState('')
  const [sort, setSort] = useState('default')
  const [openCode, setOpenCode] = useState<string | null>(null)

  const languageOptions = Array.from(
    new Set(destinations.flatMap(d => d.languages || []))
  ).sort((a, b) => a.localeCompare(b))

  const matchesVisa = (d: Destination) => {
    if (!visa) return true
    const weeks = d.visa_weeks_max ?? d.visa_weeks_min
    if (weeks == null) return false
    if (visa === 'fast') return weeks < 8
    if (visa === 'medium') return weeks >= 8 && weeks <= 12
    return weeks > 12
  }

  const filtered = destinations
    .filter(d => !profile || (d.profiles || []).includes(profile))
    .filter(d => !cost || d.cost_level === cost)
    .filter(d => !language || (d.languages || []).includes(language))
    .filter(matchesVisa)

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'salary') return (b.avg_salary ?? 0) - (a.avg_salary ?? 0)
    if (sort === 'visa') return (a.visa_weeks_min ?? 99) - (b.visa_weeks_min ?? 99)
    if (sort === 'name') return a.name.localeCompare(b.name)
    return Number(b.is_featured) - Number(a.is_featured)
  })

  const activeFilters = [profile, cost, language, visa].filter(Boolean).length
  const reset = () => { setProfile(''); setCost(''); setLanguage(''); setVisa(''); setSort('default') }
  const opened = sorted.find(d => d.code === openCode) || null

  const selectClass =
    'w-full rounded-xl border border-[#e3e8ee] dark:border-[#2c2c2e] bg-white dark:bg-[#1c1c1e] ' +
    'text-sm text-[#0a2540] dark:text-white px-3.5 py-3 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 transition-all'

  return (
    <section id="destinations" className="py-24 relative bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="relative z-10 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-kicker justify-center">
            <MapPin className="w-3.5 h-3.5" />
            {t('destinations.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-5 mb-4">
            {t('destinations.title')}
          </h2>
          <p className="text-[1.05rem] text-[#425466] dark:text-[#8e8e93] max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[20px] bg-[#f8fafc] dark:bg-[#111827] border border-[#e3e8ee]/60 dark:border-[#1e293b] p-5 sm:p-6 mb-10"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0a2540] dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-[#635bff]" />
              {t('destinations.filters.title')}
            </div>
            {activeFilters > 0 && (
              <button onClick={reset} className="text-xs font-medium text-[#635bff] hover:underline inline-flex items-center gap-1">
                <X className="w-3 h-3" /> {t('destinations.filters.reset')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: t('destinations.filters.profile'), value: profile, onChange: setProfile, options: [
                { value: '', label: t('destinations.filters.all_profiles') },
                { value: 'student', label: t('profiles.student.title') },
                { value: 'worker', label: t('profiles.worker.title') },
                { value: 'visitor', label: t('profiles.visitor.title') },
              ]},
              { label: t('destinations.filters.budget'), value: cost, onChange: setCost, options: [
                { value: '', label: t('destinations.filters.all_budgets') },
                { value: 'low', label: t('destinations.cost.low') },
                { value: 'medium', label: t('destinations.cost.medium') },
                { value: 'high', label: t('destinations.cost.high') },
              ]},
              { label: t('destinations.filters.language'), value: language, onChange: setLanguage, options: [
                { value: '', label: t('destinations.filters.all_languages') },
                ...languageOptions.map(l => ({ value: l, label: l })),
              ]},
              { label: t('destinations.filters.visa'), value: visa, onChange: setVisa, options: [
                { value: '', label: t('destinations.filters.all_visas') },
                { value: 'fast', label: t('destinations.filters.visa_fast') },
                { value: 'medium', label: t('destinations.filters.visa_medium') },
                { value: 'slow', label: t('destinations.filters.visa_slow') },
              ]},
              { label: t('destinations.filters.sort'), value: sort, onChange: setSort, options: [
                { value: 'default', label: t('destinations.filters.sort_default') },
                { value: 'salary', label: t('destinations.filters.sort_salary') },
                { value: 'visa', label: t('destinations.filters.sort_visa') },
                { value: 'name', label: t('destinations.filters.sort_name') },
              ]},
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-[11px] font-medium text-[#697386] dark:text-[#8e8e93] mb-1.5 uppercase tracking-wider">{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)} className={selectClass}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          {!loading && (
            <div className="mt-4 text-xs text-[#697386] dark:text-[#8e8e93]">
              <span className="font-semibold text-[#0a2540] dark:text-white">{sorted.length}</span>{' '}
              {sorted.length > 1 ? t('destinations.filters.results_many') : t('destinations.filters.results_one')}
            </div>
          )}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-[20px] min-h-[400px] bg-[#f0f2f5] dark:bg-[#111827] animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 rounded-[20px] border border-dashed border-[#e3e8ee] dark:border-[#2c2c2e]">
            <Globe className="w-12 h-12 text-[#635bff]/25 mx-auto mb-5" />
            <p className="font-semibold text-[#0a2540] dark:text-white mb-1.5">{t('destinations.filters.empty_title')}</p>
            <p className="text-sm text-[#697386] dark:text-[#8e8e93] mb-6">{t('destinations.filters.empty_hint')}</p>
            <button onClick={reset} className="btn-gradient rounded-xl px-6 py-3 text-sm font-semibold">
              {t('destinations.filters.reset')}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((dest, i) => {
              const remaining = daysUntil(dest.available_until)
              const closingSoon = remaining !== null && remaining <= CLOSING_SOON_DAYS

              return (
                <motion.div
                  key={dest.code}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative rounded-[20px] overflow-hidden min-h-[420px] shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.15)] transition-all duration-400 flex flex-col"
                >
                  {dest.image_url ? (
                    <Image
                      src={dest.image_url}
                      alt={dest.name}
                      fill
                      unoptimized={/^https?:\/\//.test(dest.image_url)}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#635bff] to-[#0a2540]">
                      <Globe className="h-24 w-24 opacity-15 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/60 to-[#0a2540]/15" />

                  <div className="relative z-10 flex flex-col justify-end h-full p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="w-10 h-10 rounded-[10px] bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold tracking-widest text-white border border-white/10">
                        {(dest.country_code || '').toUpperCase().slice(0, 2)}
                      </div>
                      {dest.is_featured && (
                        <span className="badge bg-white/10 text-white backdrop-blur-md border border-white/10 text-[11px]">{t('destinations.card.featured')}</span>
                      )}
                      {closingSoon && (
                        <span className="badge bg-[#d8a84e] text-[#0a2540] inline-flex items-center gap-1 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" />
                          {remaining! > 0 ? t('destinations.card.closing_in', { n: remaining! }) : t('destinations.card.last_day')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[1.3rem] font-bold text-white leading-tight">{dest.name}</h3>
                    <p className="text-sm text-[#a5a3ff] font-medium mb-3.5">{dest.tagline}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: t('destinations.card.salary'), value: dest.avg_salary ? formatMoney(dest.avg_salary, { compact: true }) : '—' },
                        { label: t('destinations.cost.label'), value: dest.cost_level ? t(`destinations.cost.${dest.cost_level}`) : '—' },
                        { label: t('destinations.card.visa_delay'), value: dest.visa_weeks_min ? `${dest.visa_weeks_min}-${dest.visa_weeks_max ?? dest.visa_weeks_min}s` : '—' },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl bg-white/[0.06] backdrop-blur-md px-2.5 py-2.5 text-center border border-white/[0.06]">
                          <div className="text-[10px] text-white/45 uppercase tracking-wider">{item.label}</div>
                          <div className="text-sm font-bold text-white mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {(dest.languages || []).length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {dest.languages.slice(0, 3).map(l => (
                          <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.07] text-white/70 border border-white/[0.08]">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 pt-3.5 border-t border-white/[0.1]">
                      <Link
                        href={`/apply?destination=${dest.code}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#635bff] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#5550e6] transition-colors shadow-[0_4px_12px_rgba(99,91,255,0.3)]"
                      >
                        {t('destinations.card.apply')} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setOpenCode(dest.code)}
                        className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-white/90 border border-white/[0.15] hover:bg-white/[0.08] hover:border-white/[0.25] transition-all"
                      >
                        {t('destinations.card.details')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpenCode(null)}
          >
            <div className="absolute inset-0 bg-[#0a2540]/75 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[20px] bg-white dark:bg-[#111827] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.4)]"
            >
              <div className="h-36 flex items-end p-6 relative bg-gradient-to-br from-[#635bff] to-[#0a2540]">
                <div className="flex h-16 w-16 mr-4 items-center justify-center rounded-[14px] bg-white/15 text-xl font-bold tracking-widest text-white backdrop-blur-md border border-white/10">
                  {(opened.country_code || '').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{opened.name}</h3>
                  <p className="text-sm text-white/60">{opened.tagline}</p>
                </div>
                <button
                  onClick={() => setOpenCode(null)}
                  aria-label={t('destinations.detail.close')}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-7 space-y-6">
                {opened.description && (
                  <p className="text-sm leading-[1.7] text-[#425466] dark:text-[#9ca3af]">{opened.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t('destinations.card.salary'), value: opened.avg_salary ? (opened.salary_min && opened.salary_max ? formatRange(opened.salary_min, opened.salary_max) : formatMoney(opened.avg_salary)) : '—' },
                    { label: t('destinations.cost.label'), value: opened.cost_level ? t(`destinations.cost.${opened.cost_level}`) : '—' },
                    { label: t('destinations.card.visa_delay'), value: opened.visa_weeks_min ? `${opened.visa_weeks_min}–${opened.visa_weeks_max ?? opened.visa_weeks_min} ${t('destinations.card.visa_unit')}` : '—' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-[#f8fafc] dark:bg-[#1c1c1e] p-3.5 text-center">
                      <div className="text-[11px] text-[#697386] dark:text-[#8e8e93] uppercase tracking-wider">{item.label}</div>
                      <div className="font-bold text-[#0a2540] dark:text-white mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                {(opened.highlights || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-3">{t('destinations.detail.highlights')}</h4>
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {opened.highlights.map(h => (
                        <li key={h} className="flex items-start gap-2.5 text-sm text-[#425466] dark:text-[#9ca3af]">
                          <CheckCircle className="w-4 h-4 text-[#635bff] flex-shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(opened.programs || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-3">{t('destinations.detail.programs')}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {opened.programs.map(p => (
                        <span key={p} className="text-xs px-3.5 py-1.5 rounded-full bg-[#635bff]/8 text-[#635bff] font-medium border border-[#635bff]/10">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(opened.languages || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-3">{t('destinations.card.languages')}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {opened.languages.map(l => (
                        <span key={l} className="text-xs px-3.5 py-1.5 rounded-full bg-[#f8fafc] dark:bg-[#1c1c1e] text-[#425466] dark:text-[#9ca3af] border border-[#e3e8ee]/60 dark:border-[#2c2c2e]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/apply?destination=${opened.code}`}
                  className="btn-gradient w-full rounded-xl py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  {t('destinations.detail.apply_now')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Scholarships ──────────────────────────────────────────────────────────────
function deadlineTone(days?: number | null) {
  if (days == null) return 'text-[#697386] dark:text-[#8e8e93]'
  if (days <= 30) return 'text-[#d8a84e] font-semibold'
  return 'text-[#697386] dark:text-[#8e8e93]'
}

function ScholarshipsSection() {
  const { t } = useTranslation()
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const { scholarships, total, loading, available } = useScholarships({ country, level, limit: 6 })
  const settings = usePublicSettings()

  if (!available && !loading) return null

  const countries = Array.from(new Set(scholarships.map(s => s.country).filter(Boolean))) as string[]

  return (
    <section id="scholarships" className="py-24 bg-[#f8fafc] dark:bg-[#080808] relative overflow-hidden">
      <div className="container-custom relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="section-kicker justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
            {t('scholarships.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-5 mb-4">
            {t('scholarships.title')} <span className="gradient-text">{t('scholarships.titleHighlight')}</span>
          </h2>
          <p className="text-[1.05rem] text-[#425466] dark:text-[#8e8e93] max-w-2xl mx-auto">{t('scholarships.subtitle')}</p>
        </motion.div>

        {!loading && scholarships.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <select value={country} onChange={e => setCountry(e.target.value)} className="rounded-xl border border-[#e3e8ee] dark:border-[#2c2c2e] bg-white dark:bg-[#1c1c1e] text-sm text-[#0a2540] dark:text-white px-4 py-3 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 transition-all">
              <option value="">{t('scholarships.all_countries')}</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className="rounded-xl border border-[#e3e8ee] dark:border-[#2c2c2e] bg-white dark:bg-[#1c1c1e] text-sm text-[#0a2540] dark:text-white px-4 py-3 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 transition-all">
              <option value="">{t('scholarships.all_levels')}</option>
              <option value="licence">{t('scholarships.level_bachelor')}</option>
              <option value="master">{t('scholarships.level_master')}</option>
              <option value="doctorat">{t('scholarships.level_phd')}</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => <div key={i} className="rounded-[20px] h-80 bg-[#f0f2f5] dark:bg-[#111827] animate-pulse" />)}
          </div>
        ) : scholarships.length === 0 ? (
          <p className="text-center text-[#697386] dark:text-[#8e8e93] py-16">{t('scholarships.empty')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s, i) => {
              const wa = whatsappLink(settings, s.title, t('scholarships.whatsapp_intro'))
              return (
                <motion.article
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.06 }}
                  className="rounded-[20px] overflow-hidden bg-white dark:bg-[#111827] border border-[#e3e8ee]/60 dark:border-[#1e293b] shadow-sm hover:shadow-[0_16px_48px_-12px_rgba(15,23,42,0.1)] hover:border-[#635bff]/20 transition-all duration-400 flex flex-col"
                >
                  <div className="relative h-48 bg-[#f8fafc] dark:bg-[#1c1c1e] flex items-center justify-center overflow-hidden">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-12 h-12 text-[#635bff]/15" />
                    )}
                    {s.fundingType === 'full' && (
                      <span className="absolute top-3.5 left-3.5 badge bg-[#d8a84e] text-[#0a2540] text-[11px] font-semibold shadow-sm">
                        {t('scholarships.fully_funded')}
                      </span>
                    )}
                  </div>

                  <div className="p-5.5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#0a2540] dark:text-white leading-snug mb-1 line-clamp-2">
                      {s.title}
                    </h3>
                    {s.provider && (
                      <p className="text-xs text-[#697386] dark:text-[#8e8e93] mb-3 line-clamp-1">{s.provider}</p>
                    )}

                    {s.levels.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {s.levels.slice(0, 3).map(l => (
                          <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-[#635bff]/8 text-[#635bff] font-medium capitalize border border-[#635bff]/10">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 text-xs pt-3.5 mt-auto border-t border-[#e3e8ee]/50 dark:border-[#1e293b]">
                      <span className={`inline-flex items-center gap-1.5 ${deadlineTone(s.daysRemaining)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {s.daysRemaining == null ? t('scholarships.no_deadline') : s.daysRemaining < 0 ? t('scholarships.closed') : s.daysRemaining === 0 ? t('scholarships.last_day') : t('scholarships.days_left', { n: s.daysRemaining })}
                      </span>
                      {s.country && (
                        <span className="inline-flex items-center gap-1.5 text-[#697386] dark:text-[#8e8e93]">
                          <MapPin className="w-3.5 h-3.5" />
                          {s.country}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 mt-4">
                      {s.applicationUrl && (
                        <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#635bff] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#5550e6] transition-colors shadow-[0_4px_12px_rgba(99,91,255,0.25)]">
                          {t('scholarships.apply')} <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={t('scholarships.whatsapp')} title={t('scholarships.whatsapp')} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold border border-[#e3e8ee] dark:border-[#2c2c2e] text-[#0a2540] dark:text-white hover:border-[#635bff]/40 transition-colors whitespace-nowrap">
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('scholarships.whatsapp_short')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}

        {total > scholarships.length && (
          <div className="text-center mt-12">
            <Link href="/bourses" className="inline-flex items-center gap-2 rounded-xl border border-[#e3e8ee] dark:border-[#2c2c2e] px-7 py-3.5 text-sm font-semibold text-[#0a2540] dark:text-white hover:border-[#635bff] hover:shadow-sm transition-all">
              {t('scholarships.see_all', { n: total })} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Process ───────────────────────────────────────────────────────────────────
function ProcessSection() {
  const { t, tList } = useTranslation()
  const steps = tList<{ title: string; desc: string }>('process.steps')
  const stepIcons = [Users, BookOpen, Search, CheckCircle, PlaneTakeoff]

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="container-custom relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <div className="section-kicker justify-center">{t('process.title')}</div>
          <h2 className="section-title mt-5 mb-4 text-[#0a2540] dark:text-white">{t('process.subtitle')}</h2>
          <p className="mx-auto max-w-2xl text-[1.05rem] text-[#425466] dark:text-[#8e8e93]">{t('process.subtitle')}</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {(Array.isArray(steps) ? steps : []).map((step, i) => {
            const Icon = stepIcons[i] || Users
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group rounded-[18px] border border-[#e3e8ee]/60 bg-[#f8fafc] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] dark:border-[#1e293b] dark:bg-[#111827]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#635bff] text-white shadow-[0_4px_12px_rgba(99,91,255,0.3)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b] dark:text-slate-400">Étape {i + 1}</div>
                <h4 className="mb-3 text-[1.05rem] font-bold text-[#0a2540] dark:text-white">{step.title}</h4>
                <p className="text-sm leading-[1.65] text-[#425466] dark:text-[#8e8e93]">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-14 text-center">
          <Link href="/apply" className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0a2540] px-9 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#122d4d] hover:shadow-lg dark:bg-white dark:text-[#0a2540] dark:hover:bg-[#f0f0f0]">
            {t('cta.primary')} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATIC_TESTIMONIALS = [
  { id: '1', name: 'Amara Diallo', country: 'Kinshasa, RD Congo', destination: 'Berlin', role: 'Software Engineer', text: 'Vision Europe Africa a changé ma vie. L\'équipe m\'a guidé étape par étape pour le visa travail allemand. Je gagne maintenant €55,000/an à Berlin !', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=70', videoUrl: null },
  { id: '2', name: 'Marie-Claire Nkosi', country: 'Cameroun', destination: 'Lisbonne', role: 'Étudiante en Médecine', text: 'J\'ai obtenu mon visa étudiant pour Lisbonne en 3 mois. L\'équipe est très professionnelle et disponible. Je recommande fortement !', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=70', videoUrl: null },
  { id: '3', name: 'Jean-Baptiste Kabila', country: 'Kinshasa, RD Congo', destination: 'Hambourg', role: 'Logisticien', text: 'Professionnel, transparent et efficace. Ils ont géré tous mes documents et j\'ai reçu mon permis de travail allemand plus vite que prévu.', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=70', videoUrl: null },
  { id: '4', name: 'Fatou Sow', country: 'Sénégal', destination: 'Porto', role: 'Étudiante en Commerce', text: 'Le processus était clair et sans surprise. Vision Europe Africa m\'a accompagnée du premier contact jusqu\'à mon arrivée à Porto.', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=70', videoUrl: null },
  { id: '5', name: 'Christian Mbeki', country: 'Côte d\'Ivoire', destination: 'Munich', role: 'Spécialiste IT', text: 'J\'étais sceptique, mais l\'équipe s\'est montrée extrêmement compétente. Mon dossier Opportunity Card a été accepté du premier coup !', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&q=70', videoUrl: null },
  { id: '6', name: 'Adaeze Okafor', country: 'Nigeria', destination: 'Lisbonne', role: 'Infirmière', text: 'Ils m\'ont trouvé un poste d\'infirmière à Lisbonne avec prise en charge du visa. En 4 mois j\'étais déjà en train de travailler au Portugal !', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=70', videoUrl: null },
]

function toEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  const yt = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  if (/\.(mp4|webm|ogv)(\?.*)?$/.test(trimmed)) return trimmed
  return null
}

function TestimonialsSection() {
  const { t, language } = useTranslation()
  const [testimonials, setTestimonials] = useState(STATIC_TESTIMONIALS)
  const [video, setVideo] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    axios.get(`${API}/testimonials`, { params: { lang: language } })
      .then(r => { if (!cancelled && Array.isArray(r.data) && r.data.length) setTestimonials(r.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [language])

  return (
    <section id="testimonials" className="py-24 bg-[#f8fafc] dark:bg-[#080808]">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="section-kicker justify-center">
            <Users className="w-3.5 h-3.5" />
            {t('testimonials.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-5 mb-4">
            {t('testimonials.title')} <span className="gradient-text">{t('testimonials.titleHighlight')}</span>
          </h2>
          <p className="text-[1.05rem] text-[#425466] dark:text-[#8e8e93] max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => {
            const embedUrl = item.videoUrl ? toEmbedUrl(item.videoUrl) : null
            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="bg-white dark:bg-[#111827] rounded-[20px] border border-[#e3e8ee]/60 dark:border-[#1e293b] p-5 sm:p-7 shadow-sm hover:shadow-[0_16px_48px_-12px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-400 flex flex-col"
              >
                {/* Quote accent */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: item.rating }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-[#d8a84e] fill-[#d8a84e]" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-[#635bff]/10" />
                </div>

                <p className="text-[0.88rem] text-[#425466] dark:text-[#9ca3af] leading-[1.7] mb-6 flex-1">&ldquo;{item.text}&rdquo;</p>

                {embedUrl && (
                  <button onClick={() => setVideo(embedUrl)} className="relative w-full aspect-video rounded-[14px] overflow-hidden mb-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#635bff]/25 to-[#0a2540]/55" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-[#635bff] ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-xs text-white/75 bg-gradient-to-t from-black/50 to-transparent">
                      {t('testimonials.video_cta')}
                    </div>
                  </button>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#635bff]/15" loading="lazy" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#635bff] flex items-center justify-center text-white text-sm font-semibold">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-[#0a2540] dark:text-white">{item.name}</div>
                      <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{item.role} · {item.country}</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#635bff] bg-[#635bff]/8 px-3 py-1.5 rounded-full border border-[#635bff]/10">{item.destination}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {video && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVideo(null)}>
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div className="relative w-full max-w-3xl z-10" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setVideo(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1.5">
                {t('testimonials.close')} <X className="w-4 h-4" />
              </button>
              <div className="aspect-video rounded-[16px] overflow-hidden bg-black shadow-2xl">
                <iframe src={video} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={t('testimonials.video_cta')} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { t, tList } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)
  const faqs = tList<{ q: string; a: string }>('faq.items')

  return (
    <section id="faq" className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="container-custom max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="section-kicker justify-center">
            <Shield className="w-3.5 h-3.5" />
            {t('faq.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-5 mb-4">
            {t('faq.title')} <span className="gradient-text">{t('faq.titleHighlight')}</span>
          </h2>
          <p className="text-[1.05rem] text-[#425466] dark:text-[#8e8e93]">{t('faq.subtitle')}</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-[16px] border overflow-hidden transition-all duration-300 ${
                open === i ? 'border-[#635bff]/25 shadow-[0_8px_32px_-8px_rgba(99,91,255,0.12)]' : 'border-[#e3e8ee]/60 dark:border-[#1e293b] shadow-sm'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4 bg-white dark:bg-[#111827]"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="flex items-center gap-3 font-medium text-[0.9rem] text-[#0a2540] dark:text-white min-w-0">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                    open === i ? 'bg-[#635bff] text-white shadow-[0_4px_12px_rgba(99,91,255,0.3)]' : 'bg-[#635bff]/8 text-[#635bff]'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="truncate">{faq.q}</span>
                </span>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  open === i ? 'bg-[#635bff] rotate-180 shadow-[0_4px_12px_rgba(99,91,255,0.3)]' : 'bg-[#635bff]/8'
                }`}>
                  <ChevronDown className={`w-4 h-4 ${open === i ? 'text-white' : 'text-[#635bff]'}`} />
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="px-5 pb-5 pl-[4.5rem] sm:pl-[5rem] text-[0.88rem] text-[#425466] dark:text-[#9ca3af] leading-[1.7]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-[#f8fafc] dark:bg-[#080808]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[24px] bg-[#0a2540] p-8 md:p-14"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_0%_0%,rgba(99,91,255,0.15),transparent),radial-gradient(ellipse_40%_40%_at_100%_100%,rgba(216,168,78,0.08),transparent)]" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                <Send className="h-3.5 w-3.5 text-[#a5a3ff]" />
                Ready to move?
              </div>
              <h2 className="text-[2rem] font-bold tracking-tight text-white md:text-[3rem] leading-[1.1]">
                {t('cta.title')} <span className="bg-gradient-to-r from-[#c7c6ff] to-[#a5a3ff] bg-clip-text text-transparent">{t('cta.titleHighlight')}</span>
              </h2>
              <p className="mt-5 max-w-xl text-[1.05rem] text-slate-300/80 leading-relaxed md:text-lg">{t('cta.subtitle')}</p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link href="/apply" className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#0a2540] shadow-[0_8px_24px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.18)]">
                  {t('cta.primary')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="https://t.me/visioneuropeafrica" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2]">
                  <Send className="h-4 w-4" />
                  {t('cta.secondary')}
                </a>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between text-sm text-slate-200">
                <span className="font-medium">Plan de candidature</span>
                <span className="rounded-full bg-[#635bff]/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c7c6ff]">Live</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Profil', value: 'Étudiant', tone: 'bg-[#635bff]/12 text-[#c7c6ff] border border-[#635bff]/15' },
                  { label: 'Document', value: 'Dossier complet', tone: 'bg-[#d8a84e]/12 text-[#e9c48a] border border-[#d8a84e]/15' },
                  { label: 'Validation', value: 'Sous 48h', tone: 'bg-[#635bff]/8 text-[#a5a3ff] border border-[#635bff]/10' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[14px] border border-white/[0.06] bg-[#0b172a]/80 px-5 py-3.5">
                    <div className="text-sm text-slate-300/80">{item.label}</div>
                    <div className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── WhatsApp Float ─────────────────────────────────────────────────────────────
function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/237000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="whatsapp-float fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(99,91,255,0.35)] bg-[#635bff] hover:bg-[#5550e6] transition-colors"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2.5, type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.05 }}
    >
      <Send className="w-5.5 h-5.5 text-white" />
    </motion.a>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <ProfileSection />
        <DestinationsSection />
        <ScholarshipsSection />
        <ProcessSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
