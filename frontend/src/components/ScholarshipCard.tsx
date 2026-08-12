'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Clock, MapPin, MessageCircle, X, CheckCircle, ExternalLink, Info } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { whatsappLink, type Scholarship } from '@/hooks/useScholarships'

/** Couleur du compte à rebours : rouge sous 7 jours, orange sous 30. */
export function deadlineTone(days?: number | null) {
  if (days == null) return 'text-[#697386] dark:text-[#8e8e93]'
  if (days <= 7) return 'text-[#ef4444] font-semibold'
  if (days <= 30) return 'text-[#f59e0b] font-semibold'
  return 'text-[#697386] dark:text-[#8e8e93]'
}

/**
 * Carte de bourse.
 *
 * Le bouton principal ouvre WhatsApp avec le numéro du site : l'objectif est
 * que le candidat parle à quelqu'un, pas qu'il se retrouve seul sur le site
 * officiel. Ce dernier reste accessible, mais depuis la fiche détail.
 */
export function ScholarshipCard({
  scholarship: s,
  settings,
  index = 0,
}: {
  scholarship: Scholarship
  settings: Record<string, string>
  index?: number
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const wa = whatsappLink(settings, s.title, t('scholarships.whatsapp_intro'))

  const countdown =
    s.daysRemaining == null ? t('scholarships.no_deadline')
    : s.daysRemaining < 0 ? t('scholarships.closed')
    : s.daysRemaining === 0 ? t('scholarships.last_day')
    : t('scholarships.days_left', { n: s.daysRemaining })

  const covers = [
    [s.covers.tuition, t('scholarships.c_tuition')],
    [s.covers.accommodation, t('scholarships.c_accommodation')],
    [s.covers.travel, t('scholarships.c_travel')],
    [s.covers.stipend, t('scholarships.c_stipend')],
  ].filter(([yes]) => yes) as [boolean, string][]

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
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
          <h3 className="font-bold text-[#0a2540] dark:text-white leading-snug mb-1 line-clamp-2">{s.title}</h3>
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
              <Clock className="w-3.5 h-3.5" />{countdown}
            </span>
            {s.country && (
              <span className="inline-flex items-center gap-1.5 text-[#697386] dark:text-[#8e8e93]">
                <MapPin className="w-3.5 h-3.5" />{s.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            {/* Postuler = parler à un conseiller, pas partir sur un site tiers */}
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1da851] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t('scholarships.apply_wa')}
              </a>
            ) : (
              <span className="flex-1 text-[11px] text-[#697386] dark:text-[#8e8e93] text-center py-2.5">
                {t('scholarships.accompaniment')}
              </span>
            )}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold border border-[#e3e8ee] dark:border-[#38383a] text-[#0a2540] dark:text-white hover:border-[#635bff] transition-colors whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5" />
              {t('scholarships.details')}
            </button>
          </div>
        </div>
      </motion.article>

      {/* ── Fiche détail ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-[#0a2540]/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1c1c1e] shadow-2xl"
            >
              <div className="relative h-40 bg-[#f6f9fc] dark:bg-[#2c2c2e] flex items-center justify-center overflow-hidden">
                {s.imageUrl
                  ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <GraduationCap className="w-14 h-14 text-[#635bff]/30" />}
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t('destinations.detail.close')}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0a2540] dark:text-white leading-snug">{s.title}</h3>
                  {s.provider && <p className="text-sm text-[#697386] dark:text-[#8e8e93] mt-1">{s.provider}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${deadlineTone(s.daysRemaining)}`}>
                    <Clock className="w-3.5 h-3.5" />{countdown}
                  </span>
                  {s.country && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#697386] dark:text-[#8e8e93]">
                      <MapPin className="w-3.5 h-3.5" />{s.country}{s.city ? ` · ${s.city}` : ''}
                    </span>
                  )}
                </div>

                {s.description && (
                  <p className="text-sm leading-relaxed text-[#425466] dark:text-[#ebebf5]">{s.description}</p>
                )}

                {covers.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-2 text-sm">{t('scholarships.covers')}</h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {covers.map(([, label]) => (
                        <li key={label} className="flex items-center gap-2 text-sm text-[#425466] dark:text-[#ebebf5]">
                          <CheckCircle className="w-4 h-4 text-[#22c55e] flex-shrink-0" />{label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.levels.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#0a2540] dark:text-white mb-2 text-sm">{t('scholarships.levels')}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {s.levels.map(l => (
                        <span key={l} className="text-xs px-3 py-1.5 rounded-full bg-[#635bff]/10 text-[#635bff] font-medium capitalize">{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#697386] dark:text-[#8e8e93] bg-[#f6f9fc] dark:bg-[#2c2c2e] rounded-xl p-3">
                  {t('scholarships.accompaniment')}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#1da851] transition-colors"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
