'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  GraduationCap, Clock, MapPin, MessageCircle, ExternalLink, ArrowLeft,
  CheckCircle2, XCircle, HelpCircle, ShieldCheck, Building2,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguage } from '@/i18n/LanguageProvider'
import { useScholarship, usePublicSettings, scholarshipWhatsappLink } from '@/hooks/useScholarships'
import { deadlineTone } from '@/components/ScholarshipCard'

const LOCALES: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', pt: 'pt-PT', de: 'de-DE' }

const FUNDING_LABEL_KEY: Record<string, string> = {
  full: 'scholarships.fully_funded',
  partial: 'scholarships.partially_funded',
  varies: 'scholarships.funding_varies',
}

const STATUS_LABEL_KEY: Record<string, string> = {
  open: 'scholarships.status_open',
  unknown: 'scholarships.status_unknown',
  closed: 'scholarships.status_closed',
}

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { scholarship: s, loading, notFound } = useScholarship(id)
  const settings = usePublicSettings()

  const locale = LOCALES[language] || 'fr-FR'

  const formattedDeadline = s?.deadline
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(s.deadline))
    : null

  const formattedVerified = s?.lastVerifiedAt
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(s.lastVerifiedAt))
    : null

  const countdown = s == null ? null
    : s.daysRemaining == null ? null
    : s.daysRemaining < 0 ? t('scholarships.closed')
    : s.daysRemaining === 0 ? t('scholarships.last_day')
    : t('scholarships.days_left', { n: s.daysRemaining })

  const wa = s ? scholarshipWhatsappLink(settings, s) : null

  const covers = s ? [
    [s.covers.tuition, t('scholarships.c_tuition')],
    [s.covers.accommodation, t('scholarships.c_accommodation')],
    [s.covers.travel, t('scholarships.c_travel')],
    [s.covers.stipend, t('scholarships.c_stipend')],
  ] as [boolean, string][] : []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
        <div className="container-custom max-w-3xl">
          <Link
            href="/bourses"
            className="inline-flex items-center gap-1.5 text-sm text-[#697386] dark:text-[#8e8e93] hover:text-[#635bff] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('scholarships.back')}
          </Link>

          {loading ? (
            <div className="space-y-4">
              <div className="h-72 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse" />
              <div className="h-8 w-2/3 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
              <div className="h-4 w-1/3 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          ) : notFound || !s ? (
            <div className="text-center py-20">
              <GraduationCap className="w-12 h-12 text-[#635bff]/30 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-[#0a2540] dark:text-white mb-2">
                {t('scholarships.not_found_title')}
              </h1>
              <p className="text-sm text-[#697386] dark:text-[#8e8e93] mb-6">
                {t('scholarships.not_found_desc')}
              </p>
              <Link href="/bourses" className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex">
                {t('scholarships.back')}
              </Link>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-[#f6f9fc] dark:bg-[#2c2c2e] mb-6">
                {s.imageUrl
                  ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <GraduationCap className="w-16 h-16 text-[#635bff]/30 absolute inset-0 m-auto" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
                {s.fundingType && FUNDING_LABEL_KEY[s.fundingType] && (
                  <span className="absolute top-4 left-4 badge text-xs bg-[#22c55e] text-white">
                    {t(FUNDING_LABEL_KEY[s.fundingType])}
                  </span>
                )}
                {s.status && STATUS_LABEL_KEY[s.status] && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 badge text-xs bg-black/50 text-white backdrop-blur-sm">
                    {s.status === 'open' ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : s.status === 'closed' ? <XCircle className="w-3.5 h-3.5" />
                      : <HelpCircle className="w-3.5 h-3.5" />}
                    {t(STATUS_LABEL_KEY[s.status])}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] dark:text-white leading-snug mb-2">
                {s.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#425466] dark:text-[#ebebf5] mb-6">
                {s.provider && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#697386] dark:text-[#8e8e93]" />{s.provider}
                  </span>
                )}
                {s.university && <span>{s.university}</span>}
                {(s.country || s.city) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#697386] dark:text-[#8e8e93]" />
                    {[s.country, s.city].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>

              {s.levels.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {s.levels.map(l => (
                    <span key={l} className="text-xs px-3 py-1.5 rounded-full bg-[#635bff]/10 text-[#635bff] font-medium capitalize">{l}</span>
                  ))}
                </div>
              )}

              {s.fields.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {s.fields.map(f => (
                    <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[#425466] dark:text-[#ebebf5]">{f}</span>
                  ))}
                </div>
              )}

              {/* Deadline */}
              <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-4 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <div className="text-xs text-[#697386] dark:text-[#8e8e93] mb-0.5">{t('scholarships.deadline')}</div>
                  <div className="text-sm font-semibold text-[#0a2540] dark:text-white">
                    {formattedDeadline || t('scholarships.no_deadline')}
                  </div>
                </div>
                {countdown && (
                  <div className="inline-flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={deadlineTone(s.daysRemaining)}>{countdown}</span>
                  </div>
                )}
                {(s.amount || s.fundingType) && (
                  <div>
                    <div className="text-xs text-[#697386] dark:text-[#8e8e93] mb-0.5">{t('scholarships.amount')}</div>
                    <div className="text-sm font-semibold text-[#0a2540] dark:text-white">
                      {s.amount ? `${s.amount.toLocaleString(locale)} ${s.currency || ''}`.trim()
                        : s.fundingType && FUNDING_LABEL_KEY[s.fundingType] ? t(FUNDING_LABEL_KEY[s.fundingType])
                        : t('scholarships.country_unknown')}
                    </div>
                  </div>
                )}
              </div>

              {s.description && (
                <p className="text-sm leading-relaxed text-[#425466] dark:text-[#ebebf5] mb-8 whitespace-pre-line">
                  {s.description}
                </p>
              )}

              {/* Ce que la bourse couvre — toujours visible, y compris ce qui n'est pas inclus */}
              <div className="mb-8">
                <h2 className="font-semibold text-[#0a2540] dark:text-white mb-3 text-sm">{t('scholarships.covers')}</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {covers.map(([yes, label]) => (
                    <li key={label} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
                      {yes
                        ? <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-[#697386] dark:text-[#8e8e93] flex-shrink-0" />}
                      {label}{!yes && ` ${t('scholarships.not_included')}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Source officielle */}
              <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#38383a] p-4 mb-8">
                <h2 className="font-semibold text-[#0a2540] dark:text-white mb-1 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                  {t('scholarships.source_section')}
                </h2>
                <p className="text-sm text-[#425466] dark:text-[#ebebf5] mb-1">{s.sourceName || t('scholarships.country_unknown')}</p>
                {formattedVerified && (
                  <p className="text-xs text-[#697386] dark:text-[#8e8e93] mb-3">
                    {t('scholarships.verified_on', { date: formattedVerified })}
                  </p>
                )}
                {s.sourceUrl && (
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#635bff] hover:underline"
                  >
                    {t('scholarships.view_source')} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full btn-gradient px-5 py-3 text-sm font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('scholarships.apply_wa')}
                  </a>
                )}
                {s.applicationUrl && (
                  <a
                    href={s.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold border border-[#e3e8ee] dark:border-[#38383a] text-[#0a2540] dark:text-white hover:border-[#635bff] transition-colors"
                  >
                    {t('scholarships.official')} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
