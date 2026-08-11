'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Moon, Sun, Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Language } from '@/i18n/translations'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
]

const DARK_COOKIE = 'vea_dark'

export default function Navbar() {
  const { t, language, changeLanguage } = useTranslation()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [langOpen,    setLangOpen]    = useState(false)
  const [darkMode,    setDarkMode]    = useState(false)
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

  // Initial dark mode: cookie > system preference
  useEffect(() => {
    const saved = document.cookie.match(new RegExp(`${DARK_COOKIE}=([^;]*)`))
    if (saved) {
      setDarkMode(saved[1] === '1')
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  // Keep <html class="dark"> in sync and persist the preference
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', darkMode)
    document.cookie = `${DARK_COOKIE}=${darkMode ? '1' : '0'}; path=/; max-age=31536000`
  }, [darkMode])

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close menus on outside click
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
        setLangOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Close menus on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setLangOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the mobile menu when switching to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setMobileOpen(false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const navLinks = [
    { href: '/#destinations', id: 'destinations', label: t('nav.destinations') },
    { href: '/#services',     id: 'services',     label: t('nav.services')      },
    { href: '/#testimonials', id: 'testimonials', label: t('nav.testimonials')  },
    { href: '/#faq',          id: 'faq',          label: t('nav.faq')           },
    { href: '/#contact',      id: 'contact',      label: t('nav.contact')       },
  ]

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-strong py-3'
          : 'bg-white/60 dark:bg-black/40 backdrop-blur-md py-4'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo-transparent.png"
            alt="Vision Europe Africa"
            className="h-9 sm:h-11 w-auto object-contain invert dark:invert-0"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, id, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                active === id
                  ? 'text-[#635bff] dark:text-[#a5a3ff]'
                  : 'text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white'
              }`}
            >
              {label}
              {active === id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[#635bff]/10 dark:bg-[#635bff]/40 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-[#e3e8ee] dark:border-[#38383a] text-[#425466] dark:text-[#ebebf5] hover:border-[#cbd5e1] dark:hover:border-[#48484a] hover:text-[#0a2540] dark:hover:text-white transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#e3e8ee] dark:border-[#38383a] text-sm text-[#425466] dark:text-[#ebebf5] hover:border-[#cbd5e1] dark:hover:border-[#48484a] hover:text-[#0a2540] dark:hover:text-white transition-all"
            >
              <span className="text-base">{currentLang.flag}</span>
              <span className="hidden sm:inline text-xs">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-40 glass-strong rounded-2xl overflow-hidden"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e] ${
                        language === lang.code ? 'text-[#635bff] font-medium' : 'text-[#425466] dark:text-[#ebebf5]'
                      }`}
                    >
                      <span>{lang.flag}</span>
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
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full btn-gradient text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            {t('nav.apply')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-xl border border-[#e3e8ee] dark:border-[#38383a] text-[#425466] dark:text-[#ebebf5]"
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
            className="lg:hidden glass-strong border-t border-[#e3e8ee] dark:border-[#38383a] max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map(({ href, id, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm rounded-xl transition-all flex items-center justify-between ${
                    active === id
                      ? 'text-[#635bff] dark:text-[#a5a3ff] bg-[#635bff]/10 font-medium'
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
                className="btn-gradient mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                {t('nav.apply')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
