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
  Award, ChevronRight, Rocket, Globe, Send, PlaneTakeoff, Landmark,
  Ship, Play, X, Quote, Sparkles, BadgeCheck, BookOpen, Search,
  SlidersHorizontal, MessageCircle
} from 'lucide-react'
import axios from 'axios'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useDestinations, type Destination } from '@/hooks/useDestinations'
import { useCurrency } from '@/i18n/CurrencyProvider'
import { useScholarships, usePublicSettings, whatsappLink } from '@/hooks/useScholarships'

// ── Media (Unsplash) ───────────────────────────────────────────────────────────
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
  const { t } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const { destinations } = useDestinations()

  // Show the featured ones first, cap at 2 cards so the hero stays compact.
  const heroDestinations = [...destinations]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 2)
  const otherCount = Math.max(destinations.length - heroDestinations.length, 0)

  const stats = [
    { value: 5000, suffix: '+', label: t('hero.stats.applicants'), icon: Users },
    { value: 30,   suffix: '+', label: t('hero.stats.countries'),  icon: MapPin },
    { value: 8,    suffix: '',  label: t('hero.stats.years'),      icon: Award },
    { value: 97,   suffix: '%', label: t('hero.stats.satisfaction'), icon: Star },
  ]

  return (
    <section className="relative overflow-hidden bg-[#0a2540]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-50" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2540]/80 via-[#0a2540]/85 to-[#0a2540]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2540]/95 via-[#0a2540]/40 to-transparent" />
      </div>

      {/* Ambient glow */}
      <div className="aurora-blob w-96 h-96 bg-[#635bff]/40 -top-24 -left-24 animate-pulse-glow" />
      <div className="aurora-blob w-80 h-80 bg-[#22d3ee]/20 bottom-10 right-10 animate-pulse-glow" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10 container-custom pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">

          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-white font-medium mb-6"
            >
              <Shield className="w-4 h-4 text-[#a5a3ff]" />
              {t('hero.badge')}
              <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight"
            >
              {t('hero.title')}
              <br />
              <span className="gradient-text-animated">{t('hero.titleHighlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-[#c7c7cc] leading-relaxed mb-9 max-w-xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full btn-gradient text-sm font-semibold"
              >
                {t('hero.cta_primary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass text-sm font-semibold text-white hover:bg-white/15 transition-all"
              >
                {t('hero.cta_secondary')}
                <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Trust flags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 mt-10"
            >
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-[#0a2540] object-cover"
                    loading="lazy"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#0a2540] bg-brand-gradient flex items-center justify-center text-[10px] font-bold text-white">
                  +5k
                </div>
              </div>
              <p className="text-sm text-[#c7c7cc]">
                <span className="font-semibold text-white">5 000+</span> {t('hero.trust')}
              </p>
            </motion.div>
          </div>

          {/* Right — destination cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-brand-gradient opacity-20 blur-3xl rounded-full" />

            <div className="grid grid-cols-1 gap-5 relative">
              {/* Featured destinations — loaded from the admin-managed list */}
              {heroDestinations.map(dest => (
                <div key={dest.code} className="glass-card rounded-3xl p-5 sm:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow text-2xl"
                      style={{ background: `linear-gradient(135deg, ${dest.accent_color || '#635bff'}, #0a2540)` }}
                    >
                      {dest.flag || <Globe className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white truncate">{dest.name}</div>
                        <div className="text-xs text-white/50 flex-shrink-0">{dest.country_code}</div>
                      </div>
                      <div className="text-xs text-white/60 mt-0.5 truncate">{dest.tagline}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {dest.programs.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/15">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}

              {otherCount > 0 && (
                <button
                  onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
                  className="glass rounded-2xl p-4 text-sm text-white/80 hover:text-white transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  +{otherCount} {t('hero.more_destinations')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 mt-5 sm:mt-5">
                <div className="glass rounded-2xl p-4 sm:p-5 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">97%</div>
                  <div className="text-xs text-white/50 mt-0.5 sm:mt-1">{t('hero.mini.success')}</div>
                </div>
                <div className="glass rounded-2xl p-4 sm:p-5 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">48h</div>
                  <div className="text-xs text-white/50 mt-0.5 sm:mt-1">{t('hero.mini.response')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
             <motion.div
               ref={ref}
               initial={{ opacity: 0, y: 20 }}
               animate={inView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.5 }}
               className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-16"
             >
               {stats.map(({ value, suffix, label, icon: Icon }, i) => (
                 <div key={i} className="glass rounded-2xl p-3 sm:p-5 text-center">
                   <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#a5a3ff] mx-auto mb-1 sm:mb-2" />
                   <div className="text-xl sm:text-2xl font-extrabold text-white">
                     {inView ? <CountUp end={value} duration={2} delay={i * 0.1} /> : '0'}{suffix}
                   </div>
                   <div className="text-xs sm:text-sm text-white/50 mt-0.5 sm:mt-1">{label}</div>
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
    <div className="bg-white dark:bg-black py-6 border-y border-[#e3e8ee] dark:border-[#38383a] marquee-mask overflow-hidden">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8 whitespace-nowrap">
            <span className="w-9 h-9 rounded-xl bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-[#635bff]" />
            </span>
            <span className="text-sm font-medium text-[#425466] dark:text-[#ebebf5]">{item.label}</span>
          </div>
        ))}
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
      href: '/apply?profile=student',
      features: tList<string>('profiles.student.features'),
    },
    {
      key: 'worker', image: MEDIA.worker, chip: Briefcase,
      title: t('profiles.worker.title'),
      description: t('profiles.worker.description'),
      badge: t('profiles.worker.badge'),
      href: '/apply?profile=worker',
      features: tList<string>('profiles.worker.features'),
    },
    {
      key: 'visitor', image: MEDIA.visitor, chip: Plane,
      title: t('profiles.visitor.title'),
      description: t('profiles.visitor.description'),
      badge: t('profiles.visitor.badge'),
      href: '/apply?profile=visitor',
      features: tList<string>('profiles.visitor.features'),
    },
  ]

  return (
    <section id="services" className="section-padding bg-white dark:bg-black">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="section-kicker justify-center">{t('profiles.title')}</div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('profiles.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto">{t('profiles.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-7">
          {profiles.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={p.href}
                className="group block bg-white dark:bg-[#1c1c1e] rounded-3xl border border-[#e3e8ee] dark:border-[#38383a] overflow-hidden shadow-sm lift hover:border-[#635bff]/40 dark:hover:border-[#635bff]/40"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/70 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-primary backdrop-blur">{p.badge}</span>
                  </div>
                  <div className="absolute bottom-4 left-5 w-11 h-11 rounded-2xl bg-brand-gradient shadow-glow flex items-center justify-center">
                    <p.chip className="w-5 h-5 text-white" />
                  </div>
                </div>
                 <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#0a2540] dark:text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-4">{p.description}</p>
                  <ul className="space-y-2 mb-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
                        <span className="w-5 h-5 rounded-full bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-[#635bff]" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#635bff] group-hover:gap-2.5 transition-all">
                    Postuler <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Destinations ───────────────────────────────────────────────────────────────
// Number of days before a destination closes where we start warning visitors.
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

  // Les options de langue viennent des destinations réellement publiées.
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
    'w-full rounded-xl border border-[#e3e8ee] dark:border-[#38383a] bg-white dark:bg-[#2c2c2e] ' +
    'text-sm text-[#0a2540] dark:text-white px-3 py-2.5 focus:outline-none focus:border-[#635bff] transition-colors'

  return (
    <section id="destinations" className="section-padding relative bg-[#f6f9fc] dark:bg-[#1c1c1e] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/destinations-bg.jpg')] bg-center bg-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6f9fc]/70 via-transparent to-[#f6f9fc]/70 dark:from-[#1c1c1e]/70 dark:via-transparent dark:to-[#1c1c1e]/70" />
      <div className="aurora-blob w-96 h-96 bg-[#635bff]/10 top-10 -right-24" />

      <div className="relative z-10 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="section-kicker justify-center">
            <MapPin className="w-3.5 h-3.5" />
            {t('destinations.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('destinations.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
        </motion.div>

        {/* ── Barre de filtres ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur border border-[#e3e8ee] dark:border-[#38383a] p-4 sm:p-5 mb-8 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0a2540] dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-[#635bff]" />
              {t('destinations.filters.title')}
            </div>
            {activeFilters > 0 && (
              <button
                onClick={reset}
                className="text-xs font-medium text-[#635bff] hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> {t('destinations.filters.reset')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-[#697386] dark:text-[#8e8e93] mb-1.5">{t('destinations.filters.profile')}</label>
              <select value={profile} onChange={e => setProfile(e.target.value)} className={selectClass}>
                <option value="">{t('destinations.filters.all_profiles')}</option>
                <option value="student">{t('profiles.student.title')}</option>
                <option value="worker">{t('profiles.worker.title')}</option>
                <option value="visitor">{t('profiles.visitor.title')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#697386] dark:text-[#8e8e93] mb-1.5">{t('destinations.filters.budget')}</label>
              <select value={cost} onChange={e => setCost(e.target.value)} className={selectClass}>
                <option value="">{t('destinations.filters.all_budgets')}</option>
                <option value="low">{t('destinations.cost.low')}</option>
                <option value="medium">{t('destinations.cost.medium')}</option>
                <option value="high">{t('destinations.cost.high')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#697386] dark:text-[#8e8e93] mb-1.5">{t('destinations.filters.language')}</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
                <option value="">{t('destinations.filters.all_languages')}</option>
                {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#697386] dark:text-[#8e8e93] mb-1.5">{t('destinations.filters.visa')}</label>
              <select value={visa} onChange={e => setVisa(e.target.value)} className={selectClass}>
                <option value="">{t('destinations.filters.all_visas')}</option>
                <option value="fast">{t('destinations.filters.visa_fast')}</option>
                <option value="medium">{t('destinations.filters.visa_medium')}</option>
                <option value="slow">{t('destinations.filters.visa_slow')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#697386] dark:text-[#8e8e93] mb-1.5">{t('destinations.filters.sort')}</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className={selectClass}>
                <option value="default">{t('destinations.filters.sort_default')}</option>
                <option value="salary">{t('destinations.filters.sort_salary')}</option>
                <option value="visa">{t('destinations.filters.sort_visa')}</option>
                <option value="name">{t('destinations.filters.sort_name')}</option>
              </select>
            </div>
          </div>

          {!loading && (
            <div className="mt-4 text-xs text-[#697386] dark:text-[#8e8e93]">
              <span className="font-semibold text-[#0a2540] dark:text-white">{sorted.length}</span>{' '}
              {sorted.length > 1
                ? t('destinations.filters.results_many')
                : t('destinations.filters.results_one')}
            </div>
          )}
        </motion.div>

        {/* ── Résultats ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-3xl min-h-[380px] bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-[#e3e8ee] dark:border-[#38383a]">
            <Globe className="w-10 h-10 text-[#635bff]/40 mx-auto mb-4" />
            <p className="font-semibold text-[#0a2540] dark:text-white mb-1">{t('destinations.filters.empty_title')}</p>
            <p className="text-sm text-[#697386] dark:text-[#8e8e93] mb-5">{t('destinations.filters.empty_hint')}</p>
            <button onClick={reset} className="btn-gradient rounded-full px-5 py-2.5 text-sm font-semibold">
              {t('destinations.filters.reset')}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((dest, i) => {
              const remaining = daysUntil(dest.available_until)
              const closingSoon = remaining !== null && remaining <= CLOSING_SOON_DAYS
              const accent = dest.accent_color || '#635bff'

              return (
                <motion.div
                  key={dest.code}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.06 }}
                  className="group relative rounded-3xl overflow-hidden min-h-[380px] shadow-lg flex flex-col"
                >
                  {dest.image_url ? (
                    <Image
                      src={dest.image_url}
                      alt={dest.name}
                      fill
                      unoptimized={/^https?:\/\//.test(dest.image_url)}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(140deg, ${accent} 0%, #0a2540 85%)` }}
                    >
                      <span className="text-[7rem] opacity-25 select-none">{dest.flag || '🌍'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/70 to-[#0a2540]/20" />

                  <div className="relative z-10 flex flex-col justify-end h-full p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div
                        className="w-10 h-10 rounded-2xl shadow-glow flex items-center justify-center text-xl"
                        style={{ background: `linear-gradient(135deg, ${accent}, #0a2540)` }}
                      >
                        {dest.flag || <Globe className="w-5 h-5 text-white" />}
                      </div>
                      {dest.is_featured && (
                        <span className="badge glass text-white backdrop-blur text-[11px]">{t('destinations.card.featured')}</span>
                      )}
                      {closingSoon && (
                        <span className="badge bg-amber-500/90 text-white backdrop-blur inline-flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {remaining! > 0
                            ? t('destinations.card.closing_in', { n: remaining! })
                            : t('destinations.card.last_day')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-extrabold text-white">{dest.name}</h3>
                    <p className="text-sm text-[#a5a3ff] font-medium mb-3">{dest.tagline}</p>

                    {/* Chiffres clés */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-xl bg-white/10 backdrop-blur px-2 py-2 text-center">
                        <div className="text-[11px] text-white/50">{t('destinations.card.salary')}</div>
                        <div className="text-sm font-bold text-white">
                          {dest.avg_salary ? formatMoney(dest.avg_salary, { compact: true }) : '—'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/10 backdrop-blur px-2 py-2 text-center">
                        <div className="text-[11px] text-white/50">{t('destinations.cost.label')}</div>
                        <div className="text-sm font-bold text-white">
                          {dest.cost_level ? t(`destinations.cost.${dest.cost_level}`) : '—'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/10 backdrop-blur px-2 py-2 text-center">
                        <div className="text-[11px] text-white/50">{t('destinations.card.visa_delay')}</div>
                        <div className="text-sm font-bold text-white">
                          {dest.visa_weeks_min ? `${dest.visa_weeks_min}-${dest.visa_weeks_max ?? dest.visa_weeks_min}s` : '—'}
                        </div>
                      </div>
                    </div>

                    {(dest.languages || []).length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {dest.languages.slice(0, 3).map(l => (
                          <span key={l} className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-white/75 border border-white/15">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-white/15">
                      <Link
                        href={`/apply?destination=${dest.code}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full btn-gradient px-4 py-2 text-xs sm:text-sm font-semibold"
                      >
                        {t('destinations.card.apply')} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setOpenCode(dest.code)}
                        className="rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap"
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

      {/* ── Panneau détail ── */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpenCode(null)}
          >
            <div className="absolute inset-0 bg-[#0a2540]/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1c1c1e] shadow-2xl"
            >
              <div
                className="h-32 flex items-end p-6 relative"
                style={{ background: `linear-gradient(135deg, ${opened.accent_color || '#635bff'}, #0a2540)` }}
              >
                <span className="text-5xl mr-4">{opened.flag || '🌍'}</span>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{opened.name}</h3>
                  <p className="text-sm text-white/70">{opened.tagline}</p>
                </div>
                <button
                  onClick={() => setOpenCode(null)}
                  aria-label={t('destinations.detail.close')}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {opened.description && (
                  <p className="text-sm leading-relaxed text-[#425466] dark:text-[#ebebf5]">{opened.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] p-3 text-center">
                    <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{t('destinations.card.salary')}</div>
                    <div className="font-bold text-[#0a2540] dark:text-white">
                      {opened.avg_salary
                        ? (opened.salary_min && opened.salary_max
                            ? formatRange(opened.salary_min, opened.salary_max)
                            : formatMoney(opened.avg_salary))
                        : '—'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] p-3 text-center">
                    <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{t('destinations.cost.label')}</div>
                    <div className="font-bold text-[#0a2540] dark:text-white">
                      {opened.cost_level ? t(`destinations.cost.${opened.cost_level}`) : '—'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] p-3 text-center">
                    <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{t('destinations.card.visa_delay')}</div>
                    <div className="font-bold text-[#0a2540] dark:text-white">
                      {opened.visa_weeks_min
                        ? `${opened.visa_weeks_min}–${opened.visa_weeks_max ?? opened.visa_weeks_min} ${t('destinations.card.visa_unit')}`
                        : '—'}
                    </div>
                  </div>
                </div>

                {(opened.highlights || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-3">{t('destinations.detail.highlights')}</h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {opened.highlights.map(h => (
                        <li key={h} className="flex items-start gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
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
                        <span key={p} className="text-xs px-3 py-1.5 rounded-full bg-[#635bff]/10 text-[#635bff] font-medium">
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
                        <span key={l} className="text-xs px-3 py-1.5 rounded-full bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#425466] dark:text-[#ebebf5]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/apply?destination=${opened.code}`}
                  className="btn-gradient w-full rounded-full py-3 text-sm font-semibold inline-flex items-center justify-center gap-2"
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

// ── Bourses d'études ──────────────────────────────────────────────────────────
/** Couleur du compte à rebours : rouge sous 7 jours, orange sous 30. */
function deadlineTone(days?: number | null) {
  if (days == null) return 'text-[#697386] dark:text-[#8e8e93]'
  if (days <= 7) return 'text-[#ef4444] font-semibold'
  if (days <= 30) return 'text-[#f59e0b] font-semibold'
  return 'text-[#697386] dark:text-[#8e8e93]'
}

function ScholarshipsSection() {
  const { t } = useTranslation()
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const { scholarships, total, loading, available } = useScholarships({ country, level, limit: 6 })
  const settings = usePublicSettings()

  // L'API des bourses n'est pas configurée : la section n'a pas lieu d'être.
  if (!available && !loading) return null

  const countries = Array.from(new Set(scholarships.map(s => s.country).filter(Boolean))) as string[]

  return (
    <section id="scholarships" className="section-padding bg-white dark:bg-black relative overflow-hidden">
      <div className="aurora-blob w-80 h-80 bg-[#22d3ee]/10 top-10 -left-24" />

      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="section-kicker justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
            {t('scholarships.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('scholarships.title')} <span className="gradient-text">{t('scholarships.titleHighlight')}</span>
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('scholarships.subtitle')}</p>
        </motion.div>

        {/* Filtres */}
        {!loading && scholarships.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="rounded-xl border border-[#e3e8ee] dark:border-[#38383a] bg-white dark:bg-[#2c2c2e] text-sm text-[#0a2540] dark:text-white px-3 py-2.5 focus:outline-none focus:border-[#635bff]"
            >
              <option value="">{t('scholarships.all_countries')}</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="rounded-xl border border-[#e3e8ee] dark:border-[#38383a] bg-white dark:bg-[#2c2c2e] text-sm text-[#0a2540] dark:text-white px-3 py-2.5 focus:outline-none focus:border-[#635bff]"
            >
              <option value="">{t('scholarships.all_levels')}</option>
              <option value="licence">{t('scholarships.level_bachelor')}</option>
              <option value="master">{t('scholarships.level_master')}</option>
              <option value="doctorat">{t('scholarships.level_phd')}</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-3xl h-80 bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <p className="text-center text-[#697386] dark:text-[#8e8e93] py-12">
            {t('scholarships.empty')}
          </p>
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
                  transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.06 }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-[#1c1c1e] border border-[#e3e8ee] dark:border-[#38383a] shadow-sm hover:shadow-lg hover:border-[#635bff]/30 transition-all flex flex-col"
                >
                  {/* Visuel */}
                  <div className="relative h-44 bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center overflow-hidden">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap className="w-12 h-12 text-[#635bff]/30" />
                    )}
                    {s.fundingType === 'full' && (
                      <span className="absolute top-3 left-3 badge bg-[#22c55e] text-white text-[11px]">
                        {t('scholarships.fully_funded')}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#0a2540] dark:text-white leading-snug mb-1 line-clamp-2">
                      {s.title}
                    </h3>
                    {s.provider && (
                      <p className="text-xs text-[#697386] dark:text-[#8e8e93] mb-3 line-clamp-1">{s.provider}</p>
                    )}

                    {/* Niveaux */}
                    {s.levels.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {s.levels.slice(0, 3).map(l => (
                          <span key={l} className="text-[11px] px-2 py-1 rounded-full bg-[#635bff]/10 text-[#635bff] font-medium capitalize">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Échéance et pays */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-3 mt-auto border-t border-[#e3e8ee] dark:border-[#38383a]">
                      <span className={`inline-flex items-center gap-1.5 ${deadlineTone(s.daysRemaining)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {s.daysRemaining == null
                          ? t('scholarships.no_deadline')
                          : s.daysRemaining < 0
                            ? t('scholarships.closed')
                            : s.daysRemaining === 0
                              ? t('scholarships.last_day')
                              : t('scholarships.days_left', { n: s.daysRemaining })}
                      </span>
                      {s.country && (
                        <span className="inline-flex items-center gap-1.5 text-[#697386] dark:text-[#8e8e93]">
                          <MapPin className="w-3.5 h-3.5" />
                          {s.country}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {s.applicationUrl && (
                        <a
                          href={s.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full btn-gradient px-4 py-2.5 text-xs font-semibold"
                        >
                          {t('scholarships.apply')} <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('scholarships.whatsapp')}
                          title={t('scholarships.whatsapp')}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1da851] transition-colors whitespace-nowrap"
                        >
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
          <div className="text-center mt-10">
            <Link
              href="/bourses"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold text-[#0a2540] dark:text-white border border-[#e3e8ee] dark:border-[#38383a] hover:border-[#635bff] transition-colors"
            >
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

  const stepIcons = [
    Users, BookOpen, Search, CheckCircle, PlaneTakeoff,
  ]

  return (
    <section className="section-padding bg-white dark:bg-black relative overflow-hidden">
      <div className="aurora-blob w-80 h-80 bg-[#8b5cf6]/10 -bottom-24 -left-24" />
      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="section-kicker justify-center">{t('process.title')}</div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('process.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5]">{t('process.subtitle')}</p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-5 sm:left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-[#635bff] via-[#8b5cf6] to-[#22d3ee] opacity-40" />
          <div className="space-y-5">
            {(Array.isArray(steps) ? steps : []).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex gap-5 items-start pl-0"
              >
                 <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-gradient shadow-glow flex items-center justify-center">
                  {stepIcons[i] && React.createElement(stepIcons[i], { className: 'w-5 h-5 text-white' })}
                </div>
                 <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-[#635bff]/30 transition-all group">
                 <div className="flex items-center gap-2 sm:gap-3 mb-1">
                   <span className="text-xs font-bold text-[#635bff] uppercase tracking-widest">{t('process.step_label')} {i + 1}</span>
                   <span className="text-[#635bff]/30 font-bold text-sm transition-all group-hover:translate-x-1">→</span>
                 </div>
                  <h4 className="font-bold text-[#0a2540] dark:text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-[#425466] dark:text-[#ebebf5]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full btn-gradient text-sm font-semibold"
          >
            Commencer ma demande <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATIC_TESTIMONIALS = [
  {
    id: '1', name: 'Amara Diallo', country: 'Kinshasa, RD Congo', destination: 'Berlin',
    role: 'Software Engineer',
    text: 'Vision Europe Africa a changé ma vie. L\'équipe m\'a guidé étape par étape pour le visa travail allemand. Je gagne maintenant €55,000/an à Berlin !',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=70',
    videoUrl: null,
  },
  {
    id: '2', name: 'Marie-Claire Nkosi', country: 'Cameroun', destination: 'Lisbonne',
    role: 'Étudiante en Médecine',
    text: 'J\'ai obtenu mon visa étudiant pour Lisbonne en 3 mois. L\'équipe est très professionnelle et disponible. Je recommande fortement !',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=70',
    videoUrl: null,
  },
  {
    id: '3', name: 'Jean-Baptiste Kabila', country: 'Kinshasa, RD Congo', destination: 'Hambourg',
    role: 'Logisticien',
    text: 'Professionnel, transparent et efficace. Ils ont géré tous mes documents et j\'ai reçu mon permis de travail allemand plus vite que prévu.',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=70',
    videoUrl: null,
  },
  {
    id: '4', name: 'Fatou Sow', country: 'Sénégal', destination: 'Porto',
    role: 'Étudiante en Commerce',
    text: 'Le processus était clair et sans surprise. Vision Europe Africa m\'a accompagnée du premier contact jusqu\'à mon arrivée à Porto.',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=70',
    videoUrl: null,
  },
  {
    id: '5', name: 'Christian Mbeki', country: 'Côte d\'Ivoire', destination: 'Munich',
    role: 'Spécialiste IT',
    text: 'J\'étais sceptique, mais l\'équipe s\'est montrée extrêmement compétente. Mon dossier Opportunity Card a été accepté du premier coup !',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&q=70',
    videoUrl: null,
  },
  {
    id: '6', name: 'Adaeze Okafor', country: 'Nigeria', destination: 'Lisbonne',
    role: 'Infirmière',
    text: 'Ils m\'ont trouvé un poste d\'infirmière à Lisbonne avec prise en charge du visa. En 4 mois j\'étais déjà en train de travailler au Portugal !',
    rating: 5,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=70',
    videoUrl: null,
  },
]

function toEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  // YouTube
  const yt = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo
  const vm = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  // Raw .mp4
  if (/\.(mp4|webm|ogv)(\?.*)?$/.test(trimmed)) return trimmed
  return null
}

function TestimonialsSection() {
  const { t, language } = useTranslation()
  const [testimonials, setTestimonials] = useState(STATIC_TESTIMONIALS)
  const [video, setVideo] = useState<string | null>(null)

  // Le contenu des témoignages vit en base : on le redemande à chaque
  // changement de langue, l'API renvoie la traduction (repli français).
  useEffect(() => {
    let cancelled = false
    axios.get(`${API}/testimonials`, { params: { lang: language } })
      .then(r => {
        if (cancelled) return
        if (Array.isArray(r.data) && r.data.length) setTestimonials(r.data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [language])

  return (
    <section id="testimonials" className="section-padding bg-[#f6f9fc] dark:bg-[#1c1c1e]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="section-kicker justify-center">
            <Users className="w-3.5 h-3.5" />
            {t('testimonials.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('testimonials.title')} <span className="gradient-text">{t('testimonials.titleHighlight')}</span>
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
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
                 className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-[#e3e8ee] dark:border-[#38383a] p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-[#635bff]/20" />
                </div>
                <p className="text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-5 flex-1">&ldquo;{item.text}&rdquo;</p>

                {embedUrl && (
                  <button
                    onClick={() => setVideo(embedUrl)}
                    className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#635bff]/40 to-[#0a2540]/70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-[#635bff] ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-xs text-white/80 bg-gradient-to-t from-black/60 to-transparent">
                      {t('testimonials.video_cta')} ▶
                    </div>
                  </button>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#635bff]/30"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-[#0a2540] dark:text-white">{item.name}</div>
                      <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{item.role} · {item.country}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#635bff] bg-[#635bff]/10 px-3 py-1.5 rounded-full">{item.destination}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {video && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideo(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-3xl z-10"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setVideo(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1"
              >
                Fermer <X className="w-4 h-4" />
              </button>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  src={video}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={t('testimonials.video_cta')}
                />
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
    <section id="faq" className="section-padding bg-white dark:bg-black">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-kicker justify-center">
            <Shield className="w-3.5 h-3.5" />
            {t('faq.kicker')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('faq.title')} <span className="gradient-text">{t('faq.titleHighlight')}</span>
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5]">{t('faq.subtitle')}</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-[#1c1c1e] rounded-2xl border overflow-hidden transition-all ${
                open === i ? 'border-[#635bff]/40 shadow-glow' : 'border-[#e3e8ee] dark:border-[#38383a] shadow-sm'
              }`}
            >
               <button
                 className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3"
                 onClick={() => setOpen(open === i ? null : i)}
                 aria-expanded={open === i}
               >
                 <span className="flex items-center gap-2 sm:gap-3 font-medium text-sm text-[#0a2540] dark:text-white min-w-0">
                   <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    open === i ? 'bg-brand-gradient text-white' : 'bg-[#635bff]/10 text-[#635bff]'
                  }`}>
                     {i + 1}
                   </span>
                   <span className="truncate">{faq.q}</span>
                 </span>
                 <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                   open === i ? 'bg-brand-gradient rotate-180' : 'bg-[#635bff]/10'
                 }`}>
                   <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${open === i ? 'text-white' : 'text-[#635bff]'}`} />
                 </span>
               </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                     <div className="px-4 pb-4 pl-9 sm:pl-12 text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed">
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
    <section className="section-padding bg-[#f6f9fc] dark:bg-[#1c1c1e]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-[#0a2540] p-10 md:p-16 text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-brand-gradient opacity-25" />
          <div className="aurora-blob w-72 h-72 bg-[#8b5cf6]/50 -top-20 -right-16 animate-pulse-glow" />
          <div className="aurora-blob w-72 h-72 bg-[#22d3ee]/30 -bottom-20 -left-16 animate-pulse-glow" />
          <div className="absolute inset-0 grid-pattern opacity-30" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              {t('cta.title')} <span className="gradient-text-animated">{t('cta.titleHighlight')}</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#0a2540] text-sm font-bold hover:bg-[#f6f9fc] transition-all shadow-lg"
              >
                {t('cta.primary')} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://t.me/visioneuropeafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass text-white text-sm font-bold hover:bg-white/15 transition-all"
              >
                <Send className="w-4 h-4" />
                {t('cta.secondary')}
              </a>
            </div>
             <div className="flex items-center justify-center gap-4 sm:gap-6 mt-7 sm:mt-9 text-xs sm:text-sm text-white/70 flex-wrap">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#a5a3ff]" /> {t('footer.trust.legal')}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#a5a3ff]" /> {t('footer.trust.response')}
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#f59e0b]" /> 97 % {t('hero.mini.success')}
              </span>
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
      className="whatsapp-float fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-glow-lg bg-[#25D366] hover:bg-[#20bd5a] transition-colors"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2.5, type: 'spring' }}
      whileHover={{ scale: 1.08 }}
    >
      <Send className="w-6 h-6 text-white" />
    </motion.a>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
    </motion.div>
  )
}
