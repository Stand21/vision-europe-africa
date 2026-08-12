'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { detectLocale, ZERO_DECIMAL_CURRENCIES } from './geo'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const CURRENCY_COOKIE = 'vea_currency'

/** Taux de secours : le site reste utilisable même si l'API ne répond pas. */
const FALLBACK_RATES: Record<string, number> = {
  EUR: 1, USD: 1.1548, GBP: 0.8551, CHF: 0.9349,
  XOF: 655.957, XAF: 655.957, CDF: 2646.79, NGN: 1573.53,
  GHS: 13.5963, KES: 149.936, TZS: 3026.32, UGX: 4256.58,
  ZAR: 18.6873, GNF: 10143.42, MAD: 10.7559, DZD: 153.745,
  EGP: 57.6222, RWF: 1699.46, ETB: 187.747, ZMW: 21.773,
  MZN: 73.8524, AOA: 1104.16, CVE: 110.265, MUR: 54.3668,
  TND: 3.37698, PLN: 4.30067, CZK: 24.2513, SEK: 10.9614,
  NOK: 10.9687, DKK: 7.46384, CAD: 1.60976,
}

interface CurrencyContextValue {
  /** Devise active (code ISO 4217) */
  currency: string
  /** Pays détecté, ou null si indéterminé */
  country: string | null
  /** true tant que le visiteur n'a pas choisi lui-même sa devise */
  autoDetected: boolean
  /** Formate un montant en euros dans la devise active */
  formatMoney: (amountEur: number, options?: { compact?: boolean }) => string
  /** Formate une fourchette : « 45 000 – 80 000 € » */
  formatRange: (minEur: number, maxEur: number, options?: { compact?: boolean }) => string
  /** Convertit sans formater, pour les calculs */
  convert: (amountEur: number) => number
  setCurrency: (code: string) => void
  availableCurrencies: string[]
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children, locale = 'fr' }: { children: ReactNode; locale?: string }) {
  const [currency, setCurrencyState] = useState('EUR')
  const [country, setCountry] = useState<string | null>(null)
  const [autoDetected, setAutoDetected] = useState(true)
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES)

  // Détection au montage : choix mémorisé s'il existe, sinon fuseau horaire
  useEffect(() => {
    const saved = Cookies.get(CURRENCY_COOKIE)
    const detected = detectLocale()
    setCountry(detected.country)

    if (saved) {
      setCurrencyState(saved)
      setAutoDetected(false)
    } else {
      setCurrencyState(detected.currency)
      setAutoDetected(true)
    }
  }, [])

  // Taux réels : l'API les rafraîchit au plus une fois par jour côté serveur
  useEffect(() => {
    let cancelled = false
    axios.get(`${API}/rates`)
      .then(({ data }) => {
        if (cancelled || !data?.rates) return
        setRates(prev => ({ ...prev, ...data.rates }))
      })
      .catch(() => { /* on garde les taux de secours */ })
    return () => { cancelled = true }
  }, [])

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code)
    setAutoDetected(false)
    Cookies.set(CURRENCY_COOKIE, code, { expires: 365 })
  }, [])

  const convert = useCallback(
    (amountEur: number) => amountEur * (rates[currency] ?? 1),
    [rates, currency]
  )

  const formatMoney = useCallback(
    (amountEur: number, options?: { compact?: boolean }) => {
      if (!Number.isFinite(amountEur)) return '—'
      const value = amountEur * (rates[currency] ?? 1)
      const noDecimals = ZERO_DECIMAL_CURRENCIES.has(currency)

      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          notation: options?.compact ? 'compact' : 'standard',
          maximumFractionDigits: options?.compact ? 1 : noDecimals ? 0 : value >= 1000 ? 0 : 2,
          minimumFractionDigits: 0,
        }).format(value)
      } catch {
        // Devise inconnue d'Intl : on formate le nombre et on suffixe le code
        return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ${currency}`
      }
    },
    [rates, currency, locale]
  )

  const formatRange = useCallback(
    (minEur: number, maxEur: number, options?: { compact?: boolean }) => {
      if (!Number.isFinite(minEur) || !Number.isFinite(maxEur)) return '—'
      if (minEur === maxEur) return formatMoney(minEur, options)
      // Le symbole n'apparaît qu'une fois : « 45 000 – 80 000 € »
      const max = formatMoney(maxEur, options)
      const minValue = minEur * (rates[currency] ?? 1)
      const minNumber = new Intl.NumberFormat(locale, {
        notation: options?.compact ? 'compact' : 'standard',
        maximumFractionDigits: options?.compact ? 1 : 0,
      }).format(minValue)
      return `${minNumber} – ${max}`
    },
    [formatMoney, rates, currency, locale]
  )

  const availableCurrencies = useMemo(
    () => Object.keys(rates).sort((a, b) => (a === 'EUR' ? -1 : b === 'EUR' ? 1 : a.localeCompare(b))),
    [rates]
  )

  const value = useMemo(
    () => ({ currency, country, autoDetected, formatMoney, formatRange, convert, setCurrency, availableCurrencies }),
    [currency, country, autoDetected, formatMoney, formatRange, convert, setCurrency, availableCurrencies]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency doit être utilisé dans <CurrencyProvider>')
  return ctx
}
