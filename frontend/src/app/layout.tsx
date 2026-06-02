import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vision Europe Africa — Your Gateway to Europe',
  description: 'Legal immigration pathways to Germany and Portugal for African students and workers. Professional, trusted, and secure.',
  keywords: 'immigration Europe, Germany visa, Portugal visa, student visa Africa, work permit Europe',
  openGraph: {
    title: 'Vision Europe Africa',
    description: 'Your Gateway to Europe — Legal immigration for African students and workers.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Vision Europe Africa',
  },
  robots: { index: true, follow: true },
  themeColor: '#1a56db',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        {/* Iconify — loaded once for the whole app */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@iconify/iconify@3.1.1/dist/iconify.min.js"
          strategy="beforeInteractive"
        />
        {children}
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
