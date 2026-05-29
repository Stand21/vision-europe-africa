'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight, Star, CheckCircle, Clock, Shield, Globe2,
  ChevronDown, Play, GraduationCap, Briefcase, Plane,
  MapPin, TrendingUp, Users, Award, ChevronRight
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'

// ── Loading Screen ──────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="loading-screen"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="loading-logo flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center shadow-glow mb-4">
          <span className="text-white font-bold text-4xl font-display">V</span>
        </div>
        <div className="font-display text-2xl font-bold text-white">
          Vision <span className="text-gold-gradient">Europe</span> Africa
        </div>
        <div className="text-gray-400 text-sm tracking-widest uppercase mt-1">Your Gateway to Europe</div>
        <div className="loading-bar mt-8">
          <div className="loading-bar-fill" />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useTranslation()

  const stats = [
    { value: 5000, suffix: '+', label: t('hero.stats.applicants'), icon: Users },
    { value: 30,   suffix: '+', label: t('hero.stats.countries'),  icon: Globe2 },
    { value: 8,    suffix: '',  label: t('hero.stats.years'),      icon: Award },
    { value: 97,   suffix: '%', label: t('hero.stats.satisfaction'), icon: Star },
  ]

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section className="relative min-h-screen flex items-center bg-hero overflow-hidden">
      {/* Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            animationDuration: `${10 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * 10}s`,
            bottom: '-10px',
          }}
        />
      ))}

      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary-700/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-900/30 blur-3xl" />

      <div className="container-custom relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/30 text-gold-400 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="font-display text-5xl md:text-6xl xl:text-7xl font-bold leading-tight text-white mb-4"
            >
              {t('hero.title')}
              <br />
              <span className="text-gold-gradient">{t('hero.titleHighlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/apply" className="btn-gold text-base">
                {t('hero.cta_primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#destinations" className="btn-outline text-base">
                {t('hero.cta_secondary')}
                <ChevronDown className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-6 mt-10"
            >
              <div className="flex -space-x-2">
                {['🇨🇩','🇨🇲','🇸🇳','🇨🇮','🇹🇩'].map((flag, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-dark flex items-center justify-center bg-dark-200 text-sm">
                    {flag}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                <span className="text-white font-semibold">5,000+</span> applicants from 30+ African countries
              </p>
            </motion.div>
          </div>

          {/* Right — Destination Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-1 gap-6">
              {/* Germany Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-card rounded-2xl p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🇩🇪</span>
                    <div>
                      <div className="text-white font-bold text-lg">Germany</div>
                      <div className="text-gold-400 text-sm">Excellence & Opportunity</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">€45k+</div>
                    <div className="text-gray-400 text-xs">avg. salary</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Work Visa','Student','Opportunity Card'].map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-primary-800/50 text-primary-300 border border-primary-700/30">{tag}</span>
                  ))}
                </div>
              </motion.div>

              {/* Portugal Card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="glass-card rounded-2xl p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🇵🇹</span>
                    <div>
                      <div className="text-white font-bold text-lg">Portugal</div>
                      <div className="text-gold-400 text-sm">Your First Step in EU</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">D7 Visa</div>
                    <div className="text-gray-400 text-xs">affordable entry</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Student Visa','D7','NHR Tax','EU Path'].map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-green-900/30 text-green-400 border border-green-700/30">{tag}</span>
                  ))}
                </div>
              </motion.div>

              {/* Stats mini */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-gold-400 text-2xl font-bold">97%</div>
                  <div className="text-gray-400 text-xs mt-1">Success Rate</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-primary-400 text-2xl font-bold">48h</div>
                  <div className="text-gray-400 text-xs mt-1">Response Time</div>
                </div>
              </div>
            </div>

            {/* Decorative ring */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-gold-500/20 animate-spin-slow" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full border border-primary-500/20 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {stats.map(({ value, suffix, label, icon: Icon }, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center">
              <Icon className="w-6 h-6 text-gold-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white font-display">
                {inView ? <CountUp end={value} duration={2.5} delay={i * 0.1} /> : '0'}{suffix}
              </div>
              <div className="text-gray-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Destinations Section ────────────────────────────────────────────────────
function DestinationsSection() {
  const { t } = useTranslation()

  const destinations = [
    {
      flag: '🇩🇪', code: 'DE', name: t('destinations.germany.name'),
      tagline: t('destinations.germany.tagline'),
      description: t('destinations.germany.description'),
      highlights: t('destinations.germany.highlights') as unknown as string[],
      accent: 'from-yellow-600/20 to-black/20', border: 'border-yellow-600/30',
      badge: 'bg-yellow-600/20 text-yellow-400', badgeText: 'Premium Destination',
      cta: '/apply?profile=student&destination=germany',
    },
    {
      flag: '🇵🇹', code: 'PT', name: t('destinations.portugal.name'),
      tagline: t('destinations.portugal.tagline'),
      description: t('destinations.portugal.description'),
      highlights: t('destinations.portugal.highlights') as unknown as string[],
      accent: 'from-green-700/20 to-blue-900/20', border: 'border-green-600/30',
      badge: 'bg-green-600/20 text-green-400', badgeText: 'Beginner Friendly',
      cta: '/apply?profile=student&destination=portugal',
    },
  ]

  return (
    <section id="destinations" className="section-padding bg-section-alt">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/50 border border-primary-700/30 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin className="w-3 h-3" /> {t('destinations.title')}
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Premier <span className="text-gold-gradient">Destinations</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-3xl p-8 bg-gradient-to-br ${dest.accent} border ${dest.border} backdrop-blur-sm overflow-hidden group hover:shadow-premium transition-all duration-500`}
            >
              {/* BG Flag Watermark */}
              <div className="absolute top-4 right-6 text-8xl opacity-10 select-none">{dest.flag}</div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{dest.flag}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${dest.badge}`}>{dest.badgeText}</span>
                </div>

                <h3 className="font-display text-3xl font-bold text-white mb-1">{dest.name}</h3>
                <p className="text-gold-400 font-medium mb-4">{dest.tagline}</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{dest.description}</p>

                <ul className="space-y-2 mb-8">
                  {(Array.isArray(dest.highlights) ? dest.highlights : []).map((h: string) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-200">
                      <CheckCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  href={dest.cta}
                  className="inline-flex items-center gap-2 font-semibold text-white hover:text-gold-400 transition-colors"
                >
                  Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Profile Selection ───────────────────────────────────────────────────────
function ProfileSection() {
  const { t } = useTranslation()

  const profiles = [
    {
      key: 'student', icon: GraduationCap,
      title: t('profiles.student.title'),
      description: t('profiles.student.description'),
      badge: t('profiles.student.badge'),
      color: 'text-primary-400', border: 'hover:border-primary-500/60',
      bg: 'hover:bg-primary-900/20',
      href: '/apply?profile=student',
    },
    {
      key: 'worker', icon: Briefcase,
      title: t('profiles.worker.title'),
      description: t('profiles.worker.description'),
      badge: t('profiles.worker.badge'),
      color: 'text-gold-400', border: 'hover:border-gold-500/60',
      bg: 'hover:bg-gold-900/10',
      href: '/apply?profile=worker',
    },
    {
      key: 'visitor', icon: Plane,
      title: t('profiles.visitor.title'),
      description: t('profiles.visitor.description'),
      badge: t('profiles.visitor.badge'),
      color: 'text-green-400', border: 'hover:border-green-500/60',
      bg: 'hover:bg-green-900/10',
      href: '/apply?profile=visitor',
    },
  ]

  return (
    <section id="services" className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('profiles.title')}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">{t('profiles.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {profiles.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link
                href={p.href}
                className={`block glass-card rounded-2xl p-8 border border-white/10 ${p.border} ${p.bg} group transition-all duration-300`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-dark-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${p.color}`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-xl">{p.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/5 border border-white/10 ${p.color}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{p.description}</p>
                <div className={`flex items-center gap-1 text-sm font-semibold ${p.color}`}>
                  Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Process Timeline ────────────────────────────────────────────────────────
function ProcessSection() {
  const { t } = useTranslation()
  const steps = t('process.steps') as unknown as { title: string; desc: string }[]

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('process.title')}
          </h2>
          <p className="text-gray-400">{t('process.subtitle')}</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 via-gold-500 to-transparent hidden sm:block" />

          <div className="space-y-8">
            {(Array.isArray(steps) ? steps : []).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`flex gap-6 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} sm:w-[calc(50%-24px)] ${i % 2 === 0 ? 'sm:ml-0' : 'sm:ml-auto'}`}
              >
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center font-bold text-white text-lg border-2 border-gold-500/50 shadow-glow">
                  {i + 1}
                </div>
                <div className="glass-card rounded-2xl p-6 flex-1">
                  <h4 className="text-white font-bold mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/apply" className="btn-gold text-base">
            Start Your Application <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const { t } = useTranslation()

  const testimonials = [
    {
      name: 'Amara Diallo', country: '🇨🇩 Kinshasa', destination: '🇩🇪 Germany',
      role: 'Software Engineer',
      text: 'Vision Europe Africa changed my life. Their team guided me through the entire German Work Visa process step by step. I now earn €55,000/year in Berlin!',
      stars: 5,
    },
    {
      name: 'Marie-Claire Nkosi', country: '🇨🇲 Cameroon', destination: '🇵🇹 Portugal',
      role: 'Medical Student',
      text: 'J\'ai obtenu mon visa étudiant pour Lisbonne en 3 mois. L\'équipe est très professionnelle et disponible. Je recommande fortement!',
      stars: 5,
    },
    {
      name: 'Jean-Baptiste Kabila', country: '🇨🇩 Kinshasa', destination: '🇩🇪 Germany',
      role: 'Logistics Manager',
      text: 'Professional, transparent, and effective. They handled all my documents and I received my German work permit faster than expected. Excellent service!',
      stars: 5,
    },
    {
      name: 'Fatou Sow', country: '🇸🇳 Senegal', destination: '🇵🇹 Portugal',
      role: 'Business Student',
      text: 'Le processus était clair et sans surprise. Vision Europe Africa m\'a accompagnée du premier contact jusqu\'à mon arrivée à Porto. Merci infiniment!',
      stars: 5,
    },
    {
      name: 'Christian Mbeki', country: '🇨🇮 Côte d\'Ivoire', destination: '🇩🇪 Germany',
      role: 'IT Specialist',
      text: 'I was skeptical at first, but the team proved to be extremely competent. My Opportunity Card application was successful and I am now based in Munich!',
      stars: 5,
    },
    {
      name: 'Adaeze Okafor', country: '🇳🇬 Nigeria', destination: '🇵🇹 Portugal',
      role: 'Nurse',
      text: 'They found me a nursing position in Lisbon with full visa support. The process was smooth and within 4 months I was already living and working in Portugal!',
      stars: 5,
    },
  ]

  return (
    <section id="testimonials" className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: item.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{item.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-sm">{item.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{item.role}</div>
                  <div className="text-gray-500 text-xs">{item.country}</div>
                </div>
                <div className="text-right text-xs text-gold-400 font-semibold">{item.destination}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: 'Quels documents sont nécessaires pour un visa allemand ?', a: 'Les documents requis incluent : passeport valide, certificat de naissance, casier judiciaire, justificatif de ressources, contrat de travail ou lettre d\'admission universitaire, assurance santé, et preuve d\'hébergement. Notre équipe vous guidera dans la préparation de chaque document.' },
    { q: 'Combien de temps dure le processus d\'immigration ?', a: 'Le processus varie selon le type de visa. Pour un visa étudiant : 2-4 mois. Pour un visa travailleur : 3-6 mois. Pour un visa visiteur : 4-8 semaines. Notre équipe vous donne une estimation précise lors de la consultation initiale.' },
    { q: 'Quels sont vos frais de service ?', a: 'Nos frais varient selon la complexité du dossier et le pays de destination. Nous offrons une consultation initiale gratuite. Contactez-nous via le formulaire ou Telegram pour un devis personnalisé.' },
    { q: 'Puis-je travailler en Allemagne sans parler allemand ?', a: 'Oui, dans certains secteurs comme l\'IT, la santé et l\'ingénierie, l\'anglais est souvent suffisant pour démarrer. Cependant, apprendre l\'allemand améliore considérablement vos opportunités. Nous recommandons d\'atteindre le niveau B1 avant de postuler.' },
    { q: 'Le Portugal est-il plus facile d\'accès que l\'Allemagne ?', a: 'Oui, le Portugal est généralement considéré comme plus accessible. Le visa D7, le visa étudiant et le programme de startup offrent des voies d\'immigration plus flexibles, avec un coût de vie plus abordable et une culture très accueillante pour les Africains francophones.' },
    { q: 'Quelle est votre garantie de succès ?', a: 'Nous avons un taux de succès de 97%. Nous ne garantissons pas l\'approbation du visa car la décision finale appartient aux ambassades, mais nous maximisons vos chances en préparant un dossier irréprochable et en vous accompagnant à chaque étape.' },
  ]

  return (
    <section id="faq" className="section-padding bg-section-alt">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-gray-400">{t('faq.subtitle')}</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gold-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
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

// ── CTA Banner ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 50%, #0f1f4a 100%)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-400/10 blur-3xl" />

          <div className="relative z-10 p-12 md:p-16 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              Prêt à commencer votre voyage ?
            </h2>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto mb-8">
              Des milliers d'Africains ont déjà réalisé leur rêve européen. C'est votre tour. Soumettez votre candidature en moins de 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply" className="btn-gold">
                Commencer maintenant <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="https://t.me/visioneuropeafrica" target="_blank" rel="noopener noreferrer" className="btn-outline border-white/30">
                Contacter sur Telegram
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-primary-300 text-sm">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> 100% Légal</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Réponse en 48h</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-400" /> 97% de succès</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Navbar />
          <main>
            <HeroSection />
            <ProfileSection />
            <DestinationsSection />
            <ProcessSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  )
}
