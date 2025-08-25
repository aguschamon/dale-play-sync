import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/shared/Header'
import Navigation from '@/components/shared/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dale Play Sync Center',
  description: 'Sistema de gestión de oportunidades de sincronización musical',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-dale-navy text-white`}>
        <div className="min-h-screen bg-dale-navy">
          <Navigation />
          <div className="ml-64">
            <Header />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
