'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Clock, MapPin, ArrowUpRight, MessageCircle, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useScholarships, usePublicSettings, whatsappLink } from '@/hooks/useScholarships'

/** Couleur du compte à rebours : rouge sous 7 jours, orange sous 30. */
function deadlineTone(days?: number | null) {
  if (days == null) return 'text-[#697386] dark:text-[#8e8e93]'
  if (days <= 7) return 'text-[#ef4444] font-semibold'
  if (days <= 30) return 'text-[#f59e0b] font-semibold'
  return 'text-[#697386] dark:text-[#8e8e93]'
}

export default function ScholarshipsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')

  const { scholarships, total, loading, available } = useScholarships({ q: query, country, level, limit: 48 })
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
                <div key={i} className="rounded-3xl h-80 bg-black/5 dark:bg-white/5 animate-pulse" />
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
              {scholarships.map((s, i) => {
                const wa = whatsappLink(settings, s.title, t('scholarships.whatsapp_intro'))
                return (
                  <motion.article
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
                    className="rounded-3xl overflow-hidden bg-white dark:bg-[#1c1c1e] border border-[#e3e8ee] dark:border-[#38383a] shadow-sm hover:shadow-lg hover:border-[#635bff]/30 transition-all flex flex-col"
                  >
                    <div className="relative h-44 bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center overflow-hidden">
                      {s.imageUrl
                        ? <img src={s.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                        : <GraduationCap className="w-12 h-12 text-[#635bff]/30" />}
                      {s.fundingType === 'full' && (
                        <span className="absolute top-3 left-3 badge bg-[#22c55e] text-white text-[11px]">
                          {t('scholarships.fully_funded')}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-[#0a2540] dark:text-white leading-snug mb-1 line-clamp-2">{s.title}</h2>
                      {s.provider && (
                        <p className="text-xs text-[#697386] dark:text-[#8e8e93] mb-3 line-clamp-1">{s.provider}</p>
                      )}

                      {s.levels.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mb-4">
                          {s.levels.slice(0, 3).map(l => (
                            <span key={l} className="text-[11px] px-2 py-1 rounded-full bg-[#635bff]/10 text-[#635bff] font-medium capitalize">{l}</span>
                          ))}
                        </div>
                      )}

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
                            <MapPin className="w-3.5 h-3.5" />{s.country}
                          </span>
                        )}
                      </div>

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
        </div>
      </main>
      <Footer />
    </>
  )
}
