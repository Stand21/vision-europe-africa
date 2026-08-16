import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { LocaleProviders } from '@/i18n/LocaleProviders'
import './globals.css'

// Métadonnées SEO : Next.js les rend côté serveur, avant que la langue de
// l'utilisateur soit connue. On garde donc une version neutre en anglais.
export const metadata: Metadata = {
  title: 'Vision Europe Africa — Your Gateway to Europe',
  description: 'Legal immigration pathways to Europe for African students and workers. Professional, trusted, and secure.', // i18n-ignore
  keywords: 'immigration Europe, Europe visa, student visa Africa, work permit Europe, immigration Afrique Europe', // i18n-ignore
  openGraph: {
    title: 'Vision Europe Africa',
    description: 'Your Gateway to Europe — Legal immigration for African students and workers.', // i18n-ignore
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Vision Europe Africa',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#635bff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="antialiased">
        <LocaleProviders>{children}</LocaleProviders>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
