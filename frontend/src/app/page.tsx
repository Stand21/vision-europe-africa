'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight, Star, CheckCircle, Clock, Shield,
  ChevronDown, GraduationCap, Briefcase, Plane,
  MapPin, Users, Award, ChevronRight, TrendingUp,
  Rocket, Globe, Code, Stethoscope, BarChart3,
  Truck, Building2, Megaphone, Brain, Wallet,
  Car, Wrench, Warehouse, Factory, Lock,
  Settings, HardHat, Mail, Phone, MapPin as MapPinIcon,
  Send, Plane as PlaneIcon, BookOpen, Briefcase as BriefcaseIcon,
  Users as UsersIcon, Home, Heart, Landmark, Ship,
  PlaneTakeoff, Luggage, Camera, Music, Utensils,
  ShoppingBag, Dumbbell, Palette, Gamepad2, BookMarked,
  Calculator, FlaskConical, Atom, Dna, Microscope,
  Palette as PaletteIcon, PenTool, Search
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="loading-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-12 h-12 rounded-xl bg-[#635bff] flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div className="text-lg font-semibold text-[#0a2540]">
          Vision <span className="text-[#635bff]">Europe</span> Africa
        </div>
        <div className="text-sm text-[#697386] mt-1">Your Gateway to Europe</div>
        <div className="loading-bar mt-6">
          <div className="loading-bar-fill" />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  const stats = [
    { value: 5000, suffix: '+', label: t('hero.stats.applicants'), icon: Users },
    { value: 30,   suffix: '+', label: t('hero.stats.countries'),  icon: MapPin },
    { value: 8,    suffix: '',  label: t('hero.stats.years'),      icon: Award },
    { value: 97,   suffix: '%', label: t('hero.stats.satisfaction'), icon: Star },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background image - centered */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-center bg-cover opacity-50"></div>
      <div className="relative z-10 container-custom pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6f9fc] dark:bg-[#1c1c1e] border border-[#e3e8ee] dark:border-[#38383a] text-sm text-[#635bff] font-medium mb-6">
              <Shield className="w-4 h-4" />
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a2540] dark:text-white leading-tight mb-5">
              {t('hero.title')}
              <br />
              <span className="text-[#635bff]">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-8 max-w-xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.href = '/apply'}
                className="text-base"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '4px',
                  background: '#635bff',
                  color: '#ffffff',
                  border: 'none',
                  textDecoration: 'none',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  letterSpacing: 0,
                  boxShadow: '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4b45c6'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(99, 91, 255, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#635bff'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
              >
                {t('hero.cta_primary')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '4px',
                  background: '#ffffff',
                  color: '#0a2540',
                  border: '1px solid #e3e8ee',
                  textDecoration: 'none',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  letterSpacing: 0,
                  boxShadow: '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f6f9fc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(60, 66, 87, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = '#e3e8ee'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
              >
                {t('hero.cta_secondary')}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Trust flags */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {[UsersIcon, Globe, Globe, Globe, Globe].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1c1c1e] bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#635bff]" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#425466] dark:text-[#ebebf5]">
                <span className="font-semibold text-[#0a2540] dark:text-white">5,000+</span> candidats de 30+ pays africains
              </p>
            </div>
          </div>

          {/* Right — destination cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Germany card */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-6 h-6 text-[#635bff]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[#0a2540] dark:text-white">Germany</div>
                      <div className="text-right">
                        <div className="font-semibold text-[#635bff] text-sm">€45k+</div>
                        <div className="text-xs text-[#697386] dark:text-[#8e8e93]">avg salary/yr</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#425466] dark:text-[#ebebf5] mt-0.5">Excellence & Opportunity</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Work Visa','Student','Opportunity Card'].map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#425466] dark:text-[#ebebf5] border border-[#e3e8ee] dark:border-[#38383a]">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Portugal card */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center flex-shrink-0">
                    <Ship className="w-6 h-6 text-[#0d9488]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[#0a2540] dark:text-white">Portugal</div>
                      <div className="text-right">
                        <div className="font-semibold text-[#0d9488] text-sm">D7 Visa</div>
                        <div className="text-xs text-[#697386] dark:text-[#8e8e93]">affordable entry</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#425466] dark:text-[#ebebf5] mt-0.5">Your First Step in EU</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Student Visa','D7','NHR Tax','EU Path'].map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-[#f6f9fc] dark:bg-[#2c2c2e] text-[#425466] dark:text-[#ebebf5] border border-[#e3e8ee] dark:border-[#38383a]">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-[#0a2540] dark:text-white">97%</div>
                  <div className="text-xs text-[#697386] dark:text-[#8e8e93] mt-1">Success Rate</div>
                </div>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-[#0a2540] dark:text-white">48h</div>
                  <div className="text-xs text-[#697386] dark:text-[#8e8e93] mt-1">Response Time</div>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {stats.map(({ value, suffix, label, icon: Icon }, i) => (
            <div key={i} className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] p-5 text-center shadow-sm">
              <Icon className="w-5 h-5 text-[#635bff] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#0a2540] dark:text-white">
                {inView ? <CountUp end={value} duration={2} delay={i * 0.1} /> : '0'}{suffix}
              </div>
              <div className="text-sm text-[#697386] dark:text-[#8e8e93] mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Trust Bar ──────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: Shield, label: 'Accompagnement certifié' },
    { icon: CheckCircle, label: 'Dossiers complets' },
    { icon: Clock, label: 'Réponse sous 48h' },
    { icon: Send, label: 'Suivi Telegram' },
    { icon: Globe, label: '100% en ligne' },
  ]
  return (
    <div className="bg-[#f6f9fc] dark:bg-[#1c1c1e] py-6 border-y border-[#e3e8ee] dark:border-[#38383a]">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
              <item.icon className="w-4 h-4 text-[#635bff]" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Profiles / Services ────────────────────────────────────────────────────────
function ProfileSection() {
  const { t } = useTranslation()

  const profiles = [
    {
      key: 'student', image: '/images/student.jpg',
      title: t('profiles.student.title'),
      description: t('profiles.student.description'),
      badge: t('profiles.student.badge'),
      href: '/apply?profile=student',
      features: ['Universités gratuites (Allemagne)', 'Visa étudiant D', 'Compte bloqué', 'Bourse DAAD'],
    },
    {
      key: 'worker', image: '/images/worker.jpg',
      title: t('profiles.worker.title'),
      description: t('profiles.worker.description'),
      badge: t('profiles.worker.badge'),
      href: '/apply?profile=worker',
      features: ['Offres d\'emploi vérifiées', 'Validation de diplômes', 'Visa travailleur', 'Formation linguistique'],
    },
    {
      key: 'visitor', image: '/images/visitor.jpg',
      title: t('profiles.visitor.title'),
      description: t('profiles.visitor.description'),
      badge: t('profiles.visitor.badge'),
      href: '/apply?profile=visitor',
      features: ['Visa Schengen type C', 'Dossier optimisé', 'Simulation consulaire', 'Assurance voyage'],
    },
  ]

  return (
    <section id="services" className="section-padding bg-white dark:bg-black">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
            Nos services
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            {t('profiles.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto">{t('profiles.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {profiles.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                href={p.href}
                className="block bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-6 shadow-sm hover:shadow-md hover:border-[#cbd5e1] dark:hover:border-[#48484a] transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center">
                    <Image src={p.image} width={40} height={40} alt={p.title} className="w-10 h-10 object-cover" />
                  </div>
                  <span className="badge badge-primary">{p.badge}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#0a2540] dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-4">{p.description}</p>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
                      <CheckCircle className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1 text-sm font-medium text-[#635bff]">
                  Postuler <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
function DestinationsSection() {
  const { t } = useTranslation()

  const destinations = [
    {
      icon: <Landmark className="w-10 h-10 text-[#635bff]" />, code: 'DE',
      name: t('destinations.germany.name'),
      tagline: t('destinations.germany.tagline'),
      description: t('destinations.germany.description'),
      highlights: t('destinations.germany.highlights') as unknown as string[],
      cta: '/apply?profile=student&destination=germany',
      statLabel: '€45,000', statSub: 'Salaire moyen/an',
    },
    {
      icon: <Ship className="w-10 h-10 text-[#0d9488]" />, code: 'PT',
      name: t('destinations.portugal.name'),
      tagline: t('destinations.portugal.tagline'),
      description: t('destinations.portugal.description'),
      highlights: t('destinations.portugal.highlights') as unknown as string[],
      cta: '/apply?profile=student&destination=portugal',
      statLabel: 'D7 Visa', statSub: 'Entrée accessible',
    },
  ]

  return (
    <section id="destinations" className="section-padding relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/images/destinations-bg.jpg')] bg-center bg-cover opacity-50"></div>
      <div className="relative z-10 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow" style={{ display: 'flex', justifyContent: 'center' }}>
            <MapPin className="w-4 h-4" />
            {t('destinations.title')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            Premier <span className="text-[#635bff]">Destinations</span>
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center">
                  {dest.icon}
                </div>
                <span className="badge badge-primary">Premium Destination</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0a2540] dark:text-white mb-1">{dest.name}</h3>
              <p className="text-sm text-[#635bff] font-medium mb-3">{dest.tagline}</p>
              <p className="text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-5">{dest.description}</p>
              <ul className="space-y-2 mb-6">
                {(Array.isArray(dest.highlights) ? dest.highlights : []).map((h: string) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
                    <CheckCircle className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-4 border-t border-[#e3e8ee] dark:border-[#38383a]">
                <Link
                  href={dest.cta}
                  className="inline-flex items-center gap-2 font-medium text-[#635bff] hover:text-[#4b45c6] transition-colors text-sm"
                >
                  Postuler maintenant <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-right">
                  <div className="font-semibold text-[#0a2540] dark:text-white">{dest.statLabel}</div>
                  <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{dest.statSub}</div>
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
  const { t } = useTranslation()
  const steps = t('process.steps') as unknown as { title: string; desc: string }[]

  const stepIcons = [
    Users, BookOpen, Search, CheckCircle, PlaneTakeoff,
  ]

  return (
    <section className="section-padding bg-white dark:bg-black">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow" style={{ display: 'flex', justifyContent: 'center' }}>
            Comment ça marche
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            {t('process.title')}
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5]">{t('process.subtitle')}</p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="space-y-4">
            {(Array.isArray(steps) ? steps : []).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f6f9fc] dark:bg-[#2c2c2e] border border-[#e3e8ee] dark:border-[#38383a] flex items-center justify-center">
                  {stepIcons[i] && React.createElement(stepIcons[i], { className: 'w-5 h-5 text-[#635bff]' })}
                </div>
                <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] p-5 shadow-sm">
                  <div className="text-xs font-semibold text-[#635bff] uppercase tracking-wider mb-1">Étape {i + 1}</div>
                  <h4 className="font-semibold text-[#0a2540] dark:text-white mb-1">{step.title}</h4>
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
          className="text-center mt-10"
        >
          <button
            onClick={() => window.location.href = '/apply'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '4px',
              background: '#635bff',
              color: '#ffffff',
              border: 'none',
              textDecoration: 'none',
              lineHeight: 1.5,
              fontFamily: 'inherit',
              letterSpacing: 0,
              boxShadow: '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4b45c6'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(99, 91, 255, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#635bff'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
            }}
          >
            Commencer ma demande <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const { t } = useTranslation()

  const testimonials = [
    {
      name: 'Amara Diallo', country: 'Kinshasa, RD Congo', destination: 'Berlin',
      role: 'Software Engineer',
      text: 'Vision Europe Africa a changé ma vie. L\'équipe m\'a guidé étape par étape pour le visa travail allemand. Je gagne maintenant €55,000/an à Berlin !',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=70',
    },
    {
      name: 'Marie-Claire Nkosi', country: 'Cameroun', destination: 'Lisbonne',
      role: 'Étudiante en Médecine',
      text: 'J\'ai obtenu mon visa étudiant pour Lisbonne en 3 mois. L\'équipe est très professionnelle et disponible. Je recommande fortement !',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=70',
    },
    {
      name: 'Jean-Baptiste Kabila', country: 'Kinshasa, RD Congo', destination: 'Hambourg',
      role: 'Logisticien',
      text: 'Professionnel, transparent et efficace. Ils ont géré tous mes documents et j\'ai reçu mon permis de travail allemand plus vite que prévu.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=70',
    },
    {
      name: 'Fatou Sow', country: 'Sénégal', destination: 'Porto',
      role: 'Étudiante en Commerce',
      text: 'Le processus était clair et sans surprise. Vision Europe Africa m\'a accompagnée du premier contact jusqu\'à mon arrivée à Porto.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&q=70',
    },
    {
      name: 'Christian Mbeki', country: 'Côte d\'Ivoire', destination: 'Munich',
      role: 'Spécialiste IT',
      text: 'J\'étais sceptique, mais l\'équipe s\'est montrée extrêmement compétente. Mon dossier Opportunity Card a été accepté du premier coup !',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=70',
    },
    {
      name: 'Adaeze Okafor', country: 'Nigeria', destination: 'Lisbonne',
      role: 'Infirmière',
      text: 'Ils m\'ont trouvé un poste d\'infirmière à Lisbonne avec prise en charge du visa. En 4 mois j\'étais déjà en train de travailler au Portugal !',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=70',
    },
  ]

  return (
    <section id="testimonials" className="section-padding bg-[#f6f9fc] dark:bg-[#1c1c1e]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow" style={{ display: 'flex', justifyContent: 'center' }}>
            <Users className="w-4 h-4" />
            {t('testimonials.title')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            Ils ont réussi <span className="text-[#635bff]">leur projet</span>
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] p-5 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: item.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                ))}
              </div>
              <p className="text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed mb-4">&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#e3e8ee] dark:border-[#38383a]"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-medium text-sm text-[#0a2540] dark:text-white">{item.name}</div>
                    <div className="text-xs text-[#697386] dark:text-[#8e8e93]">{item.role} · {item.country}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-[#635bff]">{item.destination}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: 'Quels documents sont nécessaires pour un visa allemand ?', a: 'Passeport valide, casier judiciaire, justificatif de ressources, contrat de travail ou lettre d\'admission, assurance santé et preuve d\'hébergement. Notre équipe vous guide dans la préparation de chaque document.' },
    { q: 'Combien de temps dure le processus d\'immigration ?', a: 'Visa étudiant : 2–4 mois. Visa travailleur : 3–6 mois. Visa visiteur : 4–8 semaines. Notre équipe vous donne une estimation précise lors de la consultation initiale.' },
    { q: 'Quels sont vos frais de service ?', a: 'Nos frais varient selon la complexité du dossier. Nous offrons une consultation initiale gratuite. Contactez-nous pour un devis personnalisé.' },
    { q: 'Puis-je travailler en Allemagne sans parler allemand ?', a: 'Oui, dans l\'IT, la santé et l\'ingénierie, l\'anglais est souvent suffisant. Nous recommandons cependant d\'atteindre le niveau B1 pour maximiser vos chances d\'intégration.' },
    { q: 'Le Portugal est-il plus facile d\'accès que l\'Allemagne ?', a: 'Oui, le Portugal est généralement plus accessible grâce au visa D7 et au programme étudiant. Le coût de vie y est aussi plus abordable, avec une culture accueillante pour les Africains francophones.' },
    { q: 'Quelle est votre garantie de succès ?', a: 'Nous avons un taux de 97%. Nous ne garantissons pas l\'approbation du visa (c\'est la décision de l\'ambassade), mais nous maximisons vos chances avec un dossier irréprochable.' },
  ]

  return (
    <section id="faq" className="section-padding bg-white dark:bg-black">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow" style={{ display: 'flex', justifyContent: 'center' }}>
            <Shield className="w-4 h-4" />
            {t('faq.title')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] dark:text-white mb-3">
            Questions <span className="text-[#635bff]">fréquentes</span>
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
              className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] overflow-hidden shadow-sm"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-medium text-sm text-[#0a2540] dark:text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#635bff] flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-sm text-[#425466] dark:text-[#ebebf5] leading-relaxed border-t border-[#e3e8ee] dark:border-[#38383a] pt-4">
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
  return (
    <section className="section-padding bg-[#f6f9fc] dark:bg-[#1c1c1e]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-8 md:p-12 text-center shadow-sm"
        >
          <div className="w-14 h-14 rounded-xl bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center mx-auto mb-5">
            <Rocket className="w-7 h-7 text-[#635bff]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0a2540] dark:text-white mb-3">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="text-[#425466] dark:text-[#ebebf5] max-w-xl mx-auto mb-6">
            Des milliers d'Africains ont réalisé leur rêve européen grâce à nous. Soumettez votre candidature en moins de 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/apply'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '4px',
                background: '#635bff',
                color: '#ffffff',
                border: 'none',
                textDecoration: 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                letterSpacing: 0,
                boxShadow: '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4b45c6'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(99, 91, 255, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#635bff'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
              }}
            >
              Commencer maintenant <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://t.me/visioneuropeafrica"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '4px',
                background: '#ffffff',
                color: '#0a2540',
                border: '1px solid #e3e8ee',
                textDecoration: 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                letterSpacing: 0,
                boxShadow: '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f6f9fc'
                e.currentTarget.style.borderColor = '#cbd5e1'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(60, 66, 87, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#e3e8ee'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(60, 66, 87, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Send className="w-4 h-4" />
              Contacter sur Telegram
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[#425466] dark:text-[#ebebf5] flex-wrap">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#635bff]" /> 100% Légal
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#635bff]" /> Réponse en 48h
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#f59e0b]" /> 97% de succès
            </span>
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
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-sm bg-[#25D366] hover:bg-[#20bd5a] transition-colors"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2.5, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
    >
      <Send className="w-5 h-5 text-white" />
    </motion.a>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
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
      )}
    </>
  )
}
