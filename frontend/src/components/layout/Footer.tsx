'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, GraduationCap, Briefcase, Plane, Globe, Landmark, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0a2540] dark:bg-black text-white py-10">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#635bff] flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-lg">
                  Vision <span className="text-[#7b79ff]">Europe</span> Africa
                </div>
                <div className="text-xs text-[#8e8e93] tracking-wider uppercase">{t('footer.tagline')}</div>
              </div>
            </div>
            <p className="text-sm text-[#c7c7cc] leading-relaxed max-w-md mb-6">
              Nous aidons les étudiants et travailleurs africains à réaliser leur rêve européen grâce à des voies d'immigration légales et transparentes vers l'Allemagne et le Portugal.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://t.me/visioneuropeafrica', icon: Send, label: 'Telegram' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-[#38383a] dark:border-[#48484a] flex items-center justify-center text-[#8e8e93] hover:text-white hover:border-[#635bff] transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {[
                { href: '/apply?profile=student', label: 'Immigration Étudiante', icon: GraduationCap },
                { href: '/apply?profile=worker', label: 'Immigration Travailleur', icon: Briefcase },
                { href: '/apply?profile=visitor', label: 'Visa Visiteur', icon: Plane },
                { href: '/#destinations', label: 'Allemagne', icon: Landmark },
                { href: '/#destinations', label: 'Portugal', icon: Globe },
              ].map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center gap-2.5 text-sm text-[#c7c7cc] hover:text-white transition-colors group">
                    <Icon className="w-4 h-4 text-[#635bff] group-hover:text-[#7b79ff] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#c7c7cc]">
                <MapPin className="w-4 h-4 mt-0.5 text-[#635bff] flex-shrink-0" />
                <span>Kinshasa, RD Congo<br />& Europe</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#c7c7cc]">
                <Mail className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                <a href="mailto:contact@visioneuropeafrica.com" className="hover:text-white transition-colors">
                  contact@visioneuropeafrica.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#c7c7cc]">
                <Phone className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                <a href="tel:+243000000000" className="hover:text-white transition-colors">
                  +243 000 000 000
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#c7c7cc]">
                <Send className="w-4 h-4 text-[#635bff] flex-shrink-0" />
                <a href="https://t.me/visioneuropeafrica" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Telegram: @VisionEuropeAfrica
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-14 pt-10 border-t border-[#38383a] dark:border-[#48484a]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Restez informé</h3>
              <p className="text-sm text-[#8e8e93]">Recevez nos conseils et opportunités directement par email.</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-[#1c1c1e] dark:bg-[#2c2c2e] border border-[#38383a] dark:border-[#48484a] text-white text-sm placeholder-[#8e8e93] focus:outline-none focus:border-[#635bff] transition-colors"
              />
              <button className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2">
                S'inscrire <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[#38383a] dark:border-[#48484a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8e8e93] text-center sm:text-left">
            © {year} Vision Europe Africa. {t('footer.rights')} — {t('footer.legal')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-[#8e8e93] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-[#8e8e93] hover:text-white transition-colors">Terms</Link>
            <Link href="/admin" className="text-sm text-[#8e8e93] hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
