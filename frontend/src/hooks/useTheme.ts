'use client'
import { useCallback, useEffect, useState } from 'react'

const DARK_COOKIE = 'vea_dark'

/**
 * Thème clair / sombre, partagé par toutes les pages publiques.
 *
 * Le script inline de `layout.tsx` pose déjà la classe `dark` sur <html> avant
 * le premier rendu, à partir du cookie ou de la préférence système. On initialise
 * donc l'état à partir de cette classe plutôt qu'à `false` : sans cela, le premier
 * effet retirait la classe avant que le cookie soit lu, d'où un flash blanc.
 */
function initialDark(): boolean {
  if (typeof document === 'undefined') return false // rendu serveur
  return document.documentElement.classList.contains('dark')
}

export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(initialDark)

  // `initialDark()` lit le DOM (déjà correct côté client grâce au script
  // inline), donc diffère volontairement du rendu serveur (toujours `false`) —
  // ça évite le flash de fond blanc/noir. Mais un composant qui affiche une
  // icône différente selon `darkMode` (Sun ≠ Moon) provoquerait une erreur
  // d'hydratation s'il se basait dessus avant le montage : `mounted` permet à
  // ce genre de composant d'attendre un rendu client pour bifurquer.
  const [mounted, setMounted] = useState(false)

  // Deux onglets ouverts : garder l'état aligné sur le DOM au montage.
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
    document.cookie = `${DARK_COOKIE}=${dark ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`
    setDarkMode(dark)
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(!document.documentElement.classList.contains('dark'))
  }, [applyTheme])

  return { darkMode, mounted, toggleTheme, applyTheme }
}
