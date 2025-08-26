import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dale Play Sync Center - Dashboard',
  description: 'Sistema de gestión de oportunidades de sincronización musical',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}



