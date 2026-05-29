import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vision Europe Africa — Your Gateway to Europe',
  description: 'Legal immigration pathways to Germany and Portugal for African students and workers. Professional, trusted, and secure.',
  keywords: 'immigration Europe, Germany visa, Portugal visa, student visa Africa, work permit Europe, immigration Kinshasa',
  openGraph: {
    title: 'Vision Europe Africa',
    description: 'Your Gateway to Europe — Legal immigration for African students and workers.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Vision Europe Africa',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
  themeColor: '#1a56db',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
