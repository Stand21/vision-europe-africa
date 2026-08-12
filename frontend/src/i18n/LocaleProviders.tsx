'use client'
import type { ReactNode } from 'react'
import { LanguageProvider } from './LanguageProvider'
import { CurrencyProvider } from './CurrencyProvider'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * La mise en forme des montants dépend de la langue (séparateurs de milliers,
 * position du symbole). Ce pont transmet la langue courante au fournisseur de
 * devise, qui doit donc se trouver à l'intérieur du fournisseur de langue.
 */
function CurrencyWithLocale({ children }: { children: ReactNode }) {
  const { language } = useTranslation()
  return <CurrencyProvider locale={language}>{children}</CurrencyProvider>
}

export function LocaleProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyWithLocale>{children}</CurrencyWithLocale>
    </LanguageProvider>
  )
}
