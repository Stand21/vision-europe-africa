'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, GraduationCap, Briefcase, Plane, Globe, Landmark, ArrowRight, ShieldCheck, Clock, Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="relative bg-[#0a2540] dark:bg-black text-white pt-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#635bff]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#22d3ee]/10 blur-[120px] pointer-events-none" />

      <div className="relative container-custom pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-brand-gradient shadow-glow flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg tracking-tight">
                  Vision <span className="gradient-text">Europe</span> Africa
                </div>
                <div className="text-[10px] text-[#8e8e93] tracking-[0.2em] uppercase">{t('footer.tagline')}</div>
              </div>
            </div>
            <p className="text-sm text-[#c7c7cc] leading-relaxed max-w-md mb-6">
              Nous aidons les étudiants et travailleurs africains à réaliser leur rêve européen grâce à des voies d'immigration légales et transparentes vers l'Allemagne et le Portugal.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://t.me/visioneuropeafrica', icon: Send, label: 'Telegram' },
                { href: 'mailto:contact@visioneuropeafrica.com', icon: Mail, label: 'Email' },
                { href: 'https://wa.me/237000000000', icon: Phone, label: 'WhatsApp' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-[#38383a] dark:border-[#48484a] flex items-center justify-center text-[#8e8e93] hover:text-white hover:border-[#635bff] hover:bg-[#635bff]/10 hover:-translate-y-0.5 transition-all"
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
                    <span className="w-7 h-7 rounded-lg bg-[#635bff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#635bff]/25 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-[#7b79ff] group-hover:text-[#a5a3ff] transition-colors" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-[#c7c7cc]">
                <span className="w-8 h-8 rounded-lg bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#7b79ff]" />
                </span>
                <span>Kinshasa, RD Congo<br />& Europe</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#c7c7cc]">
                <span className="w-8 h-8 rounded-lg bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#7b79ff]" />
                </span>
                <a href="mailto:contact@visioneuropeafrica.com" className="hover:text-white transition-colors">
                  contact@visioneuropeafrica.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#c7c7cc]">
                <span className="w-8 h-8 rounded-lg bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-[#7b79ff]" />
                </span>
                <a href="https://t.me/visioneuropeafrica" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Telegram: @VisionEuropeAfrica
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: '100% Légal & transparent' },
            { icon: Clock, label: 'Réponse garantie sous 48h' },
            { icon: Heart, label: 'Accompagnement humain' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <Icon className="w-5 h-5 text-[#7b79ff]" />
              <span className="text-sm text-[#c7c7cc]">{label}</span>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 rounded-3xl p-8 md:p-10 bg-brand-gradient relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Restez informé</h3>
              <p className="text-sm text-white/80">Recevez nos conseils et opportunités directement par email.</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 md:w-72 px-5 py-3 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white text-sm placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
              />
              <button className="px-6 py-3 rounded-full bg-white text-[#0a2540] text-sm font-semibold flex items-center gap-2 hover:bg-[#f6f9fc] transition-colors shadow-lg">
                S'inscrire <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8e8e93] text-center sm:text-left">
            © {year} Vision Europe Africa. {t('footer.rights')} — {t('footer.legal')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-[#8e8e93] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-[#8e8e93] hover:text-white transition-colors">Terms</Link>
            <Link href="/admin" className="text-sm text-[#8e8e93] hover:text-[#7b79ff] transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
