'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useScholarships, usePublicSettings } from '@/hooks/useScholarships'
import { ScholarshipCard } from '@/components/ScholarshipCard'

export default function ScholarshipsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const [funding, setFunding] = useState('')
  const [status, setStatus] = useState('')

  const { scholarships, total, loading, available } = useScholarships({
    q: query, country, level, funding, status, limit: 48,
  })
  const settings = usePublicSettings()

  const countries = Array.from(new Set(scholarships.map(s => s.country).filter(Boolean))) as string[]

  const selectClass =
    'rounded-xl border border-[#e3e8ee] dark:border-[#38383a] bg-white dark:bg-[#2c2c2e] ' +
    'text-sm text-[#0a2540] dark:text-white px-3 py-2.5 focus:outline-none focus:border-[#635bff]'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-black pt-28 pb-20">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="section-kicker justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
              {t('scholarships.kicker')}
            </div>
            <h1 className="section-title text-[#0a2540] dark:text-white mt-4 mb-3">
              {t('scholarships.title')} <span className="gradient-text">{t('scholarships.titleHighlight')}</span>
            </h1>
            <p className="text-[#425466] dark:text-[#ebebf5] max-w-2xl mx-auto">{t('scholarships.subtitle')}</p>
          </motion.div>

          {/* Recherche et filtres */}
          <form
            onSubmit={e => { e.preventDefault(); setQuery(search) }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mb-10"
          >
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697386]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('scholarships.search_placeholder')}
                className={`${selectClass} w-full pl-9`}
              />
            </div>
            <select value={country} onChange={e => setCountry(e.target.value)} className={selectClass}>
              <option value="">{t('scholarships.all_countries')}</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className={selectClass}>
              <option value="">{t('scholarships.all_levels')}</option>
              <option value="licence">{t('scholarships.level_bachelor')}</option>
              <option value="master">{t('scholarships.level_master')}</option>
              <option value="doctorat">{t('scholarships.level_phd')}</option>
            </select>
            <select value={funding} onChange={e => setFunding(e.target.value)} className={selectClass}>
              <option value="">{t('scholarships.all_funding')}</option>
              <option value="full">{t('scholarships.fully_funded')}</option>
              <option value="partial">{t('scholarships.partially_funded')}</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
              <option value="">{t('scholarships.all_statuses')}</option>
              <option value="open">{t('scholarships.status_open')}</option>
              <option value="unknown">{t('scholarships.status_unknown')}</option>
            </select>
            <button type="submit" className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold">
              {t('scholarships.search')}
            </button>
          </form>

          {!loading && (
            <p className="text-center text-sm text-[#697386] dark:text-[#8e8e93] mb-8">
              {t('scholarships.results', { n: total })}
            </p>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="rounded-3xl h-96 bg-black/5 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !available ? (
            <p className="text-center text-[#697386] dark:text-[#8e8e93] py-16">
              {t('scholarships.unavailable')}
            </p>
          ) : scholarships.length === 0 ? (
            <p className="text-center text-[#697386] dark:text-[#8e8e93] py-16">{t('scholarships.empty')}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} settings={settings} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
