'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Clock, MapPin, MessageCircle, Info, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { scholarshipWhatsappLink, type Scholarship } from '@/hooks/useScholarships'

/** Couleur du compte à rebours — or pour urgence, gris sinon. */
export function deadlineTone(days?: number | null) {
  if (days == null) return 'text-[#697386] dark:text-[#8e8e93]'
  if (days <= 30) return 'text-[#d8a84e] font-semibold'
  return 'text-[#697386] dark:text-[#8e8e93]'
}

const FUNDING_BADGE: Record<string, { key: string; className: string }> = {
  full: { key: 'scholarships.fully_funded', className: 'bg-[#d8a84e] text-[#0a2540]' },
  partial: { key: 'scholarships.partially_funded', className: 'bg-[#635bff]/10 text-[#635bff]' },
  varies: { key: 'scholarships.funding_varies', className: 'bg-[#635bff] text-white' },
}

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
  const wa = scholarshipWhatsappLink(settings, s)

  const countdown =
    s.daysRemaining == null ? t('scholarships.no_deadline')
    : s.daysRemaining < 0 ? t('scholarships.closed')
    : s.daysRemaining === 0 ? t('scholarships.last_day')
    : t('scholarships.days_left', { n: s.daysRemaining })

  const fundingBadge = s.fundingType ? FUNDING_BADGE[s.fundingType] : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c1c1e] border border-[#e3e8ee] dark:border-[#38383a] shadow-sm hover:shadow-md hover:border-[#635bff]/20 transition-all flex flex-col"
    >
      <Link href={`/bourses/${s.id}`} className="relative h-48 block bg-[#f6f9fc] dark:bg-[#2c2c2e] overflow-hidden group">
        {s.imageUrl
          ? (
            <img
              src={s.imageUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
          : <GraduationCap className="w-12 h-12 text-[#635bff]/20 absolute inset-0 m-auto" />}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />

        {fundingBadge && (
          <span className={`absolute top-3 left-3 badge text-[11px] ${fundingBadge.className}`}>
            {t(fundingBadge.key)}
          </span>
        )}
        {s.status === 'unknown' && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 badge text-[11px] bg-black/50 text-white backdrop-blur-sm">
            <HelpCircle className="w-3 h-3" />
            {t('scholarships.status_unknown_short')}
          </span>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={`/bourses/${s.id}`}>
          <h3 className="font-bold text-[#0a2540] dark:text-white leading-snug mb-1 line-clamp-3 hover:text-[#635bff] dark:hover:text-[#8b5cf6] transition-colors">
            {s.title}
          </h3>
        </Link>
        {s.provider && (
          <p className="text-xs text-[#697386] dark:text-[#8e8e93] mb-3 line-clamp-1">{s.provider}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[#425466] dark:text-[#ebebf5] mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#697386] dark:text-[#8e8e93]" />
          <span className="line-clamp-1">{s.country || t('scholarships.country_unknown')}</span>
        </div>

        {s.levels.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {s.levels.slice(0, 3).map(l => (
              <span key={l} className="text-[11px] px-2 py-1 rounded-full bg-[#635bff]/8 text-[#635bff] font-medium capitalize">{l}</span>
            ))}
          </div>
        )}

        {s.description && (
          <p className="text-xs leading-relaxed text-[#697386] dark:text-[#8e8e93] line-clamp-2 mb-3">
            {s.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs pt-3 mt-auto border-t border-[#e3e8ee] dark:border-[#38383a]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={deadlineTone(s.daysRemaining)}>{countdown}</span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/bourses/${s.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold border border-[#e3e8ee] dark:border-[#38383a] text-[#0a2540] dark:text-white hover:border-[#635bff] transition-colors whitespace-nowrap"
          >
            <Info className="w-3.5 h-3.5" />
            {t('scholarships.details')}
          </Link>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4b45c6] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('scholarships.apply_wa')}
            </a>
          ) : (
            <span className="flex-1 text-[11px] text-[#697386] dark:text-[#8e8e93] text-center py-2.5">
              {t('scholarships.accompaniment')}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
