'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Globe, Moon, Sun } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Language } from '@/i18n/translations'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
]

export default function Navbar() {
  const { t, language, changeLanguage } = useTranslation()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [langOpen,    setLangOpen]    = useState(false)
  const [darkMode,    setDarkMode]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  const navLinks = [
    { href: '/#destinations', label: t('nav.destinations') },
    { href: '/#services',     label: t('nav.services')      },
    { href: '/#testimonials', label: 'Témoignages'          },
    { href: '/#faq',          label: 'FAQ'                  },
    { href: '/#contact',      label: t('nav.contact')       },
  ]

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md border-b border-[#e3e8ee] dark:border-[#38383a] py-3'
          : 'bg-white dark:bg-[#000000] py-4'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#635bff] flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-semibold text-[#0a2540] dark:text-white text-base leading-none">
              Vision <span className="text-[#635bff]">Europe</span>
            </div>
            <div className="text-xs text-[#697386] dark:text-[#8e8e93] tracking-wider">Africa</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-[#e3e8ee] dark:border-[#38383a] text-[#425466] dark:text-[#ebebf5] hover:border-[#cbd5e1] dark:hover:border-[#48484a] hover:text-[#0a2540] dark:hover:text-white transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e3e8ee] dark:border-[#38383a] text-sm text-[#425466] dark:text-[#ebebf5] hover:border-[#cbd5e1] dark:hover:border-[#48484a] hover:text-[#0a2540] dark:hover:text-white transition-all"
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
                  className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#e3e8ee] dark:border-[#38383a] overflow-hidden shadow-sm dark:shadow-lg"
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
          <Link href="/apply" className="hidden sm:inline-flex btn-primary text-sm px-4 py-2 rounded-lg font-medium">
            {t('nav.apply')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg border border-[#e3e8ee] dark:border-[#38383a] text-[#425466] dark:text-[#ebebf5]"
            aria-label="Menu"
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
            className="lg:hidden bg-white dark:bg-[#1c1c1e] border-t border-[#e3e8ee] dark:border-[#38383a]"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-[#425466] dark:text-[#ebebf5] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#2c2c2e] rounded-lg transition-all"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/apply"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-3 justify-center"
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
