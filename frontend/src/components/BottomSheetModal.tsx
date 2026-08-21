'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, GraduationCap, FileCheck, Briefcase, Heart, MapPin, Star } from 'lucide-react'

const SLIDES = [
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.29.jpeg',
    title: 'Bienvenue en Europe',
    subtitle: 'Votre avenir commence ici',
    description: 'Vision Europe Africa vous ouvre les portes de l\'immigration légale vers l\'Europe. Études, travail ou installation — nous vous accompagnons à chaque étape.',
    icon: MapPin,
    accent: '#635bff',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.30.jpeg',
    title: 'Études en Allemagne',
    subtitle: 'Bourses et universités accessibles',
    description: 'Accédez aux meilleures universités allemandes avec nos partenaires. Bourses d\'études, inscriptions facilitées et accompagnement linguistique inclus.',
    icon: GraduationCap,
    accent: '#22d3ee',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.32.jpeg',
    title: 'Visa & Immigration',
    subtitle: 'Accompagnement complet',
    description: 'Dossier de visa préparé, suivi personnalisé et conseil juridique. Nous gérons les formalités administratives pour que vous puissiez voyager sereinement.',
    icon: FileCheck,
    accent: '#d8a84e',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.33.jpeg',
    title: 'Emploi qualifié',
    subtitle: 'Métiers en tension en Europe',
    description: 'Offres d\'emploi dans les secteurs en forte demande : santé, informatique, BTP et plus encore. Visa de travail et reconversion professionnelle facilités.',
    icon: Briefcase,
    accent: '#635bff',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.34.jpeg',
    title: 'Installation réussie',
    subtitle: 'De la candidature à l\'arrivée',
    description: 'De la préparation des documents jusqu\'à votre premier jour en Europe. Logement, ouverture de compte bancaire et démarches d\'installation.',
    icon: Heart,
    accent: '#22d3ee',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.46.36.jpeg',
    title: 'Communauté Vision',
    subtitle: '5000+ personnes accompagnées',
    description: 'Rejoignez une communauté grandissante de +5000 personnes installées en Europe grâce à Vision Europe Africa. Témoignages, conseils et réseau d\'entraide.',
    icon: Star,
    accent: '#d8a84e',
  },
  {
    image: '/images/imageModals/WhatsApp Image 2026-08-17 at 18.49.54.jpeg',
    title: 'Votre projet européen',
    subtitle: 'Faites le premier pas',
    description: 'Un projet d\'immigration ? Soumettez votre candidature dès maintenant et recevez un retour personnalisé sous 48 heures. Votre avenir commence ici.',
    icon: MapPin,
    accent: '#635bff',
  },
]

const SLIDE_INTERVAL = 3500 // 3.5s — rapide

// ═══ DIFFERENT ANIMATION SETS ═══
const ANIMATIONS = [
  // 0: Slide from right
  {
    enter: { x: '100%', opacity: 0, scale: 1.05 },
    center: { x: 0, opacity: 1, scale: 1 },
    exit: { x: '-40%', opacity: 0, scale: 0.95 },
    transition: { type: 'spring', damping: 28, stiffness: 180 },
  },
  // 1: Zoom fade (Ken Burns in)
  {
    enter: { scale: 1.3, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 0.85, opacity: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  // 2: Slide from bottom
  {
    enter: { y: '60%', opacity: 0, scale: 1.05 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: '-40%', opacity: 0, scale: 0.95 },
    transition: { type: 'spring', damping: 25, stiffness: 160 },
  },
  // 3: Slide from left
  {
    enter: { x: '-100%', opacity: 0, scale: 1.05 },
    center: { x: 0, opacity: 1, scale: 1 },
    exit: { x: '40%', opacity: 0, scale: 0.95 },
    transition: { type: 'spring', damping: 28, stiffness: 180 },
  },
  // 4: Cross-dissolve with zoom
  {
    enter: { scale: 1.15, opacity: 0, filter: 'blur(8px)' },
    center: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    exit: { scale: 0.9, opacity: 0, filter: 'blur(6px)' },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 5: Flip vertical
  {
    enter: { rotateX: 40, opacity: 0, y: 30, scale: 0.9 },
    center: { rotateX: 0, opacity: 1, y: 0, scale: 1 },
    exit: { rotateX: -40, opacity: 0, y: -30, scale: 0.9 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  // 6: Quick scale punch
  {
    enter: { scale: 0.6, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.4, opacity: 0 },
    transition: { type: 'spring', damping: 20, stiffness: 200 },
  },
]

// ═══ TEXT ANIMATION SETS (match image) ═══
const TEXT_ANIMATIONS = [
  { enter: { opacity: 0, y: 16 }, exit: { opacity: 0, y: -12 } },
  { enter: { opacity: 0, scale: 0.9 }, exit: { opacity: 0, scale: 1.05 } },
  { enter: { opacity: 0, y: 20 }, exit: { opacity: 0, y: -16 } },
  { enter: { opacity: 0, x: -20 }, exit: { opacity: 0, x: 20 } },
  { enter: { opacity: 0, y: 10, filter: 'blur(4px)' }, exit: { opacity: 0, y: -8, filter: 'blur(3px)' } },
  { enter: { opacity: 0, rotateX: 20 }, exit: { opacity: 0, rotateX: -20 } },
  { enter: { opacity: 0, scale: 0.7 }, exit: { opacity: 0, scale: 1.2 } },
]

export default function BottomSheetModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 250], [1, 0])
  const progressRef = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  // Show modal after 3 seconds
  useEffect(() => {
    if (typeof window === 'undefined') return
    const timer = setTimeout(() => setIsOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-advance with progress
  useEffect(() => {
    if (!isOpen || isPaused) {
      setProgress(0)
      return
    }

    setProgress(0)
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / SLIDE_INTERVAL) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        setCurrentSlide(prev => (prev + 1) % SLIDES.length)
        return
      }
      progressRef.current = requestAnimationFrame(tick)
    }

    progressRef.current = requestAnimationFrame(tick)
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [isOpen, isPaused, currentSlide])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    y.set(0)
  }, [y])

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide(idx)
  }, [])

  const goNext = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentSlide(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1))
  }, [])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current
    const deltaX = e.touches[0].clientX - touchStartX.current
    if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
      y.set(deltaY)
    }
  }

  const handleTouchEnd = () => {
    if (y.get() > 120) {
      handleClose()
    } else {
      animate(y, 0, { type: 'spring', damping: 25, stiffness: 300 })
    }
  }

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose, goNext, goPrev])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  // Pick animation set based on current slide index
  const anim = ANIMATIONS[currentSlide % ANIMATIONS.length]
  const textAnim = TEXT_ANIMATIONS[currentSlide % TEXT_ANIMATIONS.length]
  const slide = SLIDES[currentSlide]
  const Icon = slide.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 180, mass: 0.8 }}
            style={{ y, opacity, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-t-3xl overflow-hidden shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-4 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm active:scale-90"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ═══ IMAGE SLIDER WITH VARYING ANIMATIONS ═══ */}
            <div className="relative h-[40vh] sm:h-[45vh] overflow-hidden" style={{ perspective: '800px' }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentSlide}
                  initial={anim.enter}
                  animate={anim.center}
                  exit={anim.exit}
                  transition={anim.transition}
                  className="absolute inset-0"
                  style={{ transformOrigin: 'center center' }}
                >
                  <img
                    src={SLIDES[currentSlide].image}
                    alt={SLIDES[currentSlide].title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows — desktop */}
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center backdrop-blur-sm transition-all duration-200 active:scale-90 z-10"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center backdrop-blur-sm transition-all duration-200 active:scale-90 z-10"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Counter */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-medium z-10">
                {currentSlide + 1} / {SLIDES.length}
              </div>
            </div>

            {/* ═══ TEXT SECTION WITH MATCHING ANIMATION ═══ */}
            <div className="relative bg-white dark:bg-[#111827] px-5 pt-4 pb-2 sm:px-6" style={{ perspective: '600px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={textAnim.enter}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
                  exit={textAnim.exit}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Accent bar + icon row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <motion.div
                      key={`icon-${currentSlide}`}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.05 }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${slide.accent}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: slide.accent }} />
                    </motion.div>
                    <motion.div
                      key={`bar-${currentSlide}`}
                      initial={{ width: 0 }}
                      animate={{ width: 32 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      className="h-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: slide.accent }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#0a2540] dark:text-white leading-tight mb-0.5">
                    {SLIDES[currentSlide].title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs font-medium mb-2" style={{ color: slide.accent }}>
                    {SLIDES[currentSlide].subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[#425466] dark:text-[#94a3b8] leading-relaxed">
                    {SLIDES[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center items-center gap-2 py-3 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-[#1e293b]">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className="relative transition-all duration-300"
                  aria-label={`Slide ${i + 1}`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? 'w-7'
                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    style={
                      i === currentSlide
                        ? { background: `linear-gradient(90deg, ${SLIDES[currentSlide].accent}, ${SLIDES[(currentSlide + 1) % SLIDES.length].accent})` }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>

            {/* Safe area bottom */}
            <div className="h-[env(safe-area-inset-bottom, 0px)]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
