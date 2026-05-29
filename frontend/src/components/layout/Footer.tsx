'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-dark-100">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-xl">
                  Vision <span className="text-gold-gradient">Europe</span> Africa
                </div>
                <div className="text-xs text-gray-500 tracking-widest uppercase">{t('footer.tagline')}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mt-4">
              Nous aidons les étudiants et travailleurs africains à réaliser leur rêve européen grâce à des voies d'immigration légales et transparentes vers l'Allemagne et le Portugal.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { href: 'https://t.me/visioneuropeafrica', icon: Send, label: 'Telegram' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:border-gold-500/30 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {[
                { href: '/apply?profile=student', label: '🎓 Immigration Étudiante' },
                { href: '/apply?profile=worker', label: '👷 Immigration Travailleur' },
                { href: '/apply?profile=visitor', label: '✈️ Visa Visiteur' },
                { href: '/#destinations', label: '🇩🇪 Allemagne' },
                { href: '/#destinations', label: '🇵🇹 Portugal' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0" />
                <span>Kinshasa, RD Congo<br />& Europe</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href="mailto:contact@visioneuropeafrica.com" className="hover:text-white transition-colors">
                  contact@visioneuropeafrica.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href="tel:+243000000000" className="hover:text-white transition-colors">
                  +243 000 000 000
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Send className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href="https://t.me/visioneuropeafrica" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Telegram: @VisionEuropeAfrica
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {year} Vision Europe Africa. {t('footer.rights')} — {t('footer.legal')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
            <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Admin</Link>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-0.5 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
    </footer>
  )
}
