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
  Ship, Play, X, Quote, Sparkles, BadgeCheck, BookOpen, Search
} from 'lucide-react'
import axios from 'axios'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'

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
  const { t, tList } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

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
                <span className="font-semibold text-white">5,000+</span> {t('hero.candidatesLabel')}
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
              {/* Germany card */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{t('destinations.germany.name')}</div>
                      <div className="text-right">
                        <div className="font-semibold text-[#a5a3ff] text-sm">€45k+</div>
                        <div className="text-xs text-white/50">{t('hero.avgSalary')}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{t('destinations.germany.tagline')}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tList('hero.germanyTags').map(tag => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/15">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Portugal card */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-[#0d9488] flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Ship className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{t('destinations.portugal.name')}</div>
                      <div className="text-right">
                        <div className="font-semibold text-[#22d3ee] text-sm">D7 Visa</div>
                        <div className="text-xs text-white/50">{t('destinations.portugal.statSub')}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{t('destinations.portugal.tagline')}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tList('hero.portugalTags').map(tag => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/15">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 mt-5 sm:mt-5">
                <div className="glass rounded-2xl p-4 sm:p-5 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">97%</div>
                  <div className="text-xs text-white/50 mt-0.5 sm:mt-1">{t('hero.successRate')}</div>
                </div>
                <div className="glass rounded-2xl p-4 sm:p-5 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">48h</div>
                  <div className="text-xs text-white/50 mt-0.5 sm:mt-1">{t('hero.responseTime')}</div>
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
  const { t, tList } = useTranslation()
  const items = tList('trust').map((label, i) => ({
    icon: [Shield, BadgeCheck, Clock, Send, Globe][i],
    label,
  }))

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
      features: tList('profiles.student.features'),
    },
    {
      key: 'worker', image: MEDIA.worker, chip: Briefcase,
      title: t('profiles.worker.title'),
      description: t('profiles.worker.description'),
      badge: t('profiles.worker.badge'),
      href: '/apply?profile=worker',
      features: tList('profiles.worker.features'),
    },
    {
      key: 'visitor', image: MEDIA.visitor, chip: Plane,
      title: t('profiles.visitor.title'),
      description: t('profiles.visitor.description'),
      badge: t('profiles.visitor.badge'),
      href: '/apply?profile=visitor',
      features: tList('profiles.visitor.features'),
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
          <div className="section-kicker justify-center">{t('profiles.kicker')}</div>
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
                    {t('profiles.apply')} <ArrowRight className="w-4 h-4" />
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
const FALLBACK_DESTINATIONS: {
  code: string
  image?: string
  icon: React.ReactNode
  name: string
  tagline: string
  description: string
  highlights: string[]
  cta: string
  statLabel: string
  statSub: string
}[] = [
  {
    image: MEDIA.germany, icon: <Landmark className="w-6 h-6 text-white" />,
    code: 'DE',
    name: 'Germany',
    tagline: 'Excellence & Opportunity',
    description: 'Europe\'s economic powerhouse offers world-class universities, high salaries, and an exceptional quality of life. The Opportunity Card makes it easier than ever to relocate.',
    highlights: ['Avg. salary €45,000/year', 'Free/low-cost universities', 'Strong job market', 'Excellent healthcare'],
    cta: '/apply?profile=student&destination=germany',
    statLabel: '€45,000', statSub: 'Avg. salary/year',
  },
  {
    image: MEDIA.portugal, icon: <Ship className="w-6 h-6 text-white" />,
    code: 'PT',
    name: 'Portugal',
    tagline: 'Your First Step Into Europe',
    description: 'The most accessible gateway to the EU. Affordable living, welcoming culture, growing tech scene, and a clear path to EU citizenship.',
    highlights: ['Affordable cost of living', 'D7 & Student visas', 'Portuguese-friendly for Africans', 'Path to EU citizenship'],
    cta: '/apply?profile=student&destination=portugal',
    statLabel: 'D7 Visa', statSub: 'Affordable entry',
  },
]

function DestinationsSection() {
  const { t } = useTranslation()
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS)

  useEffect(() => {
    axios.get(`${API}/destinations`)
      .then(r => {
        if (Array.isArray(r.data) && r.data.length) {
          setDestinations(r.data.map((d: any) => ({
            code: d.code,
            image: d.image || (d.code.toUpperCase() === 'DE' ? MEDIA.germany : MEDIA.portugal),
            icon: d.code.toUpperCase() === 'DE' ? <Landmark className="w-6 h-6 text-white" /> : <Ship className="w-6 h-6 text-white" />,
            name: d.name,
            tagline: d.tagline || '',
            description: d.description || '',
            highlights: Array.isArray(d.highlights) ? d.highlights : [],
            cta: `/apply?profile=student&destination=${d.code.toLowerCase()}`,
            statLabel: d.statLabel || '',
            statSub: d.statSub || '',
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section id="destinations" className="section-padding relative bg-[#f6f9fc] dark:bg-[#1c1c1e] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/images/destinations-bg.jpg')] bg-center bg-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6f9fc]/70 via-transparent to-[#f6f9fc]/70 dark:from-[#1c1c1e]/70 dark:via-transparent dark:to-[#1c1c1e]/70" />
      <div className="aurora-blob w-96 h-96 bg-[#635bff]/10 top-10 -right-24" />
      <div className="relative z-10 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="section-kicker justify-center">
            <MapPin className="w-3.5 h-3.5" />
            {t('destinations.title')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('destinations.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-7">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
               className="group relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[400px] md:min-h-[460px] shadow-lg"
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/55 to-[#0a2540]/10" />

               <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-brand-gradient shadow-glow flex items-center justify-center">
                    {dest.icon}
                  </div>
                  <span className="badge glass text-white backdrop-blur">{t('destinations.premium')}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-1">{dest.name}</h3>
                <p className="text-sm text-[#a5a3ff] font-medium mb-4">{dest.tagline}</p>
                <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-md">{dest.description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
                  {(Array.isArray(dest.highlights) ? dest.highlights : []).slice(0, 4).map((h: string) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-[#22d3ee]" />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-white/15">
                  <Link
                    href={dest.cta}
                    className="inline-flex items-center gap-2 rounded-full btn-gradient px-4 py-2 text-xs sm:text-sm font-semibold"
                  >
                    {t('destinations.cta')} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                  <div className="text-right">
                    <div className="font-bold text-white">{dest.statLabel}</div>
                    <div className="text-xs text-white/50">{dest.statSub}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Process ───────────────────────────────────────────────────────────────────
function ProcessSection() {
  const { t, tValue } = useTranslation()
  const steps = tValue<{ title: string; desc: string }[]>('process.steps') ?? []

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
          <div className="section-kicker justify-center">{t('process.kicker')}</div>
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
                   <span className="text-xs font-bold text-[#635bff] uppercase tracking-widest">{t('process.step')} {i + 1}</span>
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
            {t('process.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function buildStaticTestimonials(tList: (p: string) => string[], tValue: <T>(p: string) => T | undefined) {
  return (tValue<{ id: string; role: string; text: string }[]>('testimonials.static') ?? []).map((item, i) => ({
    id: String(i + 1),
    name: ['Amara Diallo', 'Marie-Claire Nkosi', 'Jean-Baptiste Kabila', 'Fatou Sow', 'Christian Mbeki', 'Adaeze Okafor'][i],
    country: ['Kinshasa, RD Congo', 'Cameroun', 'Kinshasa, RD Congo', 'Sénégal', 'Côte d\'Ivoire', 'Nigeria'][i],
    destination: ['Berlin', 'Lisbonne', 'Hambourg', 'Porto', 'Munich', 'Lisbonne'][i],
    role: item.role,
    text: item.text,
    rating: 5,
    photoUrl: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=70',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=70',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=70',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=70',
      'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&q=70',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=70',
    ][i],
    videoUrl: null,
  }))
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
  const { t, tList, tValue } = useTranslation()
  const [testimonials, setTestimonials] = useState(() => buildStaticTestimonials(tList, tValue))
  const [video, setVideo] = useState<string | null>(null)

  useEffect(() => {
    axios.get(`${API}/testimonials`)
      .then(r => { if (Array.isArray(r.data) && r.data.length) setTestimonials(r.data) })
      .catch(() => {})
  }, [])

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
            {t('testimonials.title')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('testimonials.heading')} <span className="gradient-text">{t('testimonials.headingHighlight')}</span>
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
                      {t('testimonials.watchVideo')}
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
                {t('testimonials.close')} <X className="w-4 h-4" />
              </button>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  src={video}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={t('testimonials.videoTitle')}
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
  const { t, tValue } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  const faqs = tValue<{ q: string; a: string }[]>('faq.items') ?? []

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
            {t('faq.title')}
          </div>
          <h2 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
            {t('faq.heading')} <span className="gradient-text">{t('faq.headingHighlight')}</span>
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
  const { t, tList } = useTranslation()
  const chips = tList('cta.chips')

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
              {chips.map((chip, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i === 0 ? <Shield className="w-4 h-4 text-[#a5a3ff]" /> : null}
                  {i === 1 ? <Clock className="w-4 h-4 text-[#a5a3ff]" /> : null}
                  {i === 2 ? <Star className="w-4 h-4 text-[#f59e0b]" /> : null}
                  {chip}
                </span>
              ))}
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
      aria-label="Chat WhatsApp"
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
