'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.29.jpeg',
    title: 'Bienvenue en Europe',
    subtitle: 'Votre avenir commence ici',
    accent: '#635bff',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.30.jpeg',
    title: 'Études en Allemagne',
    subtitle: 'Bourses et universités accessibles',
    accent: '#22d3ee',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.32.jpeg',
    title: 'Visa & Immigration',
    subtitle: 'Accompagnement complet',
    accent: '#d8a84e',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.33.jpeg',
    title: 'Emploi qualifié',
    subtitle: 'Métiers en tension en Europe',
    accent: '#635bff',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.34.jpeg',
    title: 'Installation réussie',
    subtitle: 'De la candidature à l\'arrivée',
    accent: '#22d3ee',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.36.jpeg',
    title: 'Communauté Vision',
    subtitle: '5000+ personnes accompagnées',
    accent: '#d8a84e',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.49.54.jpeg',
    title: 'Votre projet européen',
    subtitle: 'Faites le premier pas',
    accent: '#635bff',
  },
]

export default function HighlightsSlider() {
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // Touch support: pause on touch, resume after
  const handleTouchStart = () => setIsPaused(true)
  const handleTouchEnd = () => setTimeout(() => setIsPaused(false), 2000)

  return (
    <section className="relative py-8 md:py-12 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#0a2540] dark:text-white">
            Découvrez nos <span className="gradient-text">destinations</span>
          </h2>
          <p className="text-sm text-[#425466] dark:text-[#8e8e93] mt-1">
            Défilement automatique des opportunités
          </p>
        </motion.div>
      </div>

      {/* ═══ CONTINUOUS LINEAR SCROLL ═══ */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent z-10" />

        {/* Scrolling track — duplicated items for infinite loop */}
        <div
          ref={trackRef}
          className="flex gap-4 w-max"
          style={{
            animation: `marquee-scroll 30s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {/* First set */}
          {SLIDES.map((slide, i) => (
            <div
              key={`a-${i}`}
              className="shrink-0 w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[25vw]"
            >
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-[#111827]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/80 via-[#0a2540]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-white mb-0.5">
                    {slide.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/70">
                    {slide.subtitle}
                  </p>
                </div>
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)` }}
                />
              </div>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {SLIDES.map((slide, i) => (
            <div
              key={`b-${i}`}
              className="shrink-0 w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[25vw]"
            >
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-[#111827]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/80 via-[#0a2540]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-white mb-0.5">
                    {slide.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/70">
                    {slide.subtitle}
                  </p>
                </div>
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ KEYFRAMES ═══ */}
      <style jsx>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
