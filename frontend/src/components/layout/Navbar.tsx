'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Coins } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useCurrency } from '@/i18n/CurrencyProvider'
import type { Language } from '@/i18n/translations'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
]

export default function Navbar() {
  const { t, language, changeLanguage } = useTranslation()
  const { currency, setCurrency, availableCurrencies, autoDetected } = useCurrency()
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [langOpen,    setLangOpen]    = useState(false)
  const [active,      setActive]      = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['destinations', 'services', 'testimonials', 'faq', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
        setLangOpen(false)
        setCurrencyOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setLangOpen(false)
        setCurrencyOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setMobileOpen(false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const navLinks = [
    { href: '/#destinations', id: 'destinations', label: t('nav.destinations') },
    { href: '/bourses',       id: 'scholarships', label: t('nav.scholarships')  },
    { href: '/#services',     id: 'services',     label: t('nav.services')      },
    { href: '/#testimonials', id: 'testimonials', label: t('nav.testimonials')  },
    { href: '/#faq',          id: 'faq',          label: t('nav.faq')           },
  ]

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm'
          : 'bg-white/80 dark:bg-black/60 backdrop-blur-xl'
      }`}
    >
      <div className="container-custom flex items-center justify-between py-3 sm:py-1">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logo-transparent.png"
            alt="Vision Europe Africa"
            className="h-10 sm:h-12 w-auto object-contain invert dark:invert-0"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, id, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                active === id
                  ? 'text-[#635bff] dark:text-[#a5a3ff]'
                  : 'text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white'
              }`}
            >
              {label}
              {active === id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-md bg-[#635bff]/8 dark:bg-[#635bff]/20 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Currency switcher */}
          <div className="relative">
            <button
              onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false) }}
              aria-expanded={currencyOpen}
              aria-label={t('common.currency')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white transition-all"
            >
              <Coins className="w-4 h-4" />
              <span className="text-xs font-medium">{currency}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 max-h-72 overflow-y-auto bg-white dark:bg-[#1c1c1e] rounded-xl shadow-lg"
                >
                  {autoDetected && (
                    <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-[#697386] dark:text-[#8e8e93]">
                      {t('common.auto_detected')}
                    </div>
                  )}
                  {availableCurrencies.map(code => (
                    <button
                      key={code}
                      onClick={() => { setCurrency(code); setCurrencyOpen(false) }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e] ${
                        currency === code ? 'text-[#635bff] font-medium' : 'text-[#425466] dark:text-[#ebebf5]'
                      }`}
                    >
                      <span>{code}</span>
                      {currency === code && <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-expanded={langOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white transition-all"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#635bff]/10 text-[9px] font-bold text-[#635bff] dark:text-[#a5a3ff]">
                {(currentLang.code || '').toUpperCase()}
              </span>
              <span className="hidden sm:inline text-xs">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1c1c1e] rounded-xl overflow-hidden shadow-lg"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e] ${
                        language === lang.code ? 'text-[#635bff] font-medium' : 'text-[#425466] dark:text-[#ebebf5]'
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-[#635bff]/10 text-[9px] font-bold text-[#635bff] dark:text-[#a5a3ff]">
                      {lang.code.toUpperCase()}
                    </span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto text-[#635bff]">✓</span>
                    )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <Link
            href="/apply"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#635bff] text-white text-sm font-semibold hover:bg-[#4b45c6] transition-colors shadow-sm"
          >
            {t('nav.apply')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#425466] dark:text-[#ebebf5]"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-[#1c1c1e] max-h-[calc(100dvh-5rem)] overflow-y-auto"
          >
            <div className="container-custom py-5 flex flex-col gap-1">
              {navLinks.map(({ href, id, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between ${
                    active === id
                      ? 'text-[#635bff] dark:text-[#a5a3ff] bg-[#635bff]/8 font-medium'
                      : 'text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e]'
                  }`}
                >
                  {label}
                  {active === id && <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]" />}
                </Link>
              ))}
              <Link
                href="/apply"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#635bff] text-white text-sm font-semibold hover:bg-[#4b45c6] transition-colors"
              >
                {t('nav.apply')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
