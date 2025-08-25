import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OPPORTUNITY_STATUSES, FLOW_TYPES, URGENCY_LEVELS } from '@/lib/constants'
import type { NPSResults, Oportunidad } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function calculateNPS(budget: number, mfn: boolean, publishing: { controlDP: number; shareDP: number }, recording: { controlDP: number }): NPSResults {
  // Publishing NPS: 50% del budget * shareDP%
  const pubNPS = (budget * 0.5) * (publishing.shareDP / 100)
  
  // Recording NPS: 50% del budget * controlDP%
  const recNPS = (budget * 0.5) * (recording.controlDP / 100)
  
  let totalDP = pubNPS + recNPS
  
  // Si MFN (Most Favored Nation), aplicar el mayor porcentaje a ambos lados
  if (mfn) {
    const maxControl = Math.max(publishing.controlDP, recording.controlDP)
    const pubNPSMFN = (budget * 0.5) * (maxControl / 100)
    const recNPSMFN = (budget * 0.5) * (maxControl / 100)
    totalDP = pubNPSMFN + recNPSMFN
    
    return {
      pubNPS: pubNPSMFN,
      recNPS: recNPSMFN,
      totalDP,
      publishing: { ...publishing, controlDP: maxControl },
      recording: { controlDP: maxControl }
    }
  }
  
  return {
    pubNPS,
    recNPS,
    totalDP,
    publishing,
    recording
  }
}

export function getUrgencyLevel(opportunity: Oportunidad): keyof typeof URGENCY_LEVELS {
  // INBOUND siempre es crítico
  if (opportunity.tipo_flow === FLOW_TYPES.INBOUND) {
    return 'CRITICAL'
  }
  
  // Si no hay deadline, es bajo
  if (!opportunity.deadline) {
    return 'LOW'
  }
  
  const now = new Date()
  const deadline = new Date(opportunity.deadline)
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (diffHours < 24) return 'CRITICAL'
  if (diffHours < 48) return 'HIGH'
  if (diffHours < 168) return 'MEDIUM' // 1 semana
  return 'LOW'
}

export function getDaysUntilDeadline(deadline: Date | string): number {
  const now = new Date()
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const diffTime = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function generateOpportunityCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `OPP-${year}-${random}`
}

export function calculateConversionRate(opportunities: Oportunidad[]): number {
  if (opportunities.length === 0) return 0
  
  const paid = opportunities.filter(opp => opp.estado === OPPORTUNITY_STATUSES.PAID).length
  return (paid / opportunities.length) * 100
}

export function calculateAverageDealTime(opportunities: Oportunidad[]): number {
  const paidOpportunities = opportunities.filter(opp => 
    opp.estado === OPPORTUNITY_STATUSES.PAID && opp.createdAt
  )
  
  if (paidOpportunities.length === 0) return 0
  
  const totalDays = paidOpportunities.reduce((total, opp) => {
    const created = new Date(opp.createdAt)
    const paid = new Date(opp.updatedAt)
    const diffTime = paid.getTime() - created.getTime()
    return total + (diffTime / (1000 * 60 * 60 * 24))
  }, 0)
  
  return totalDays / paidOpportunities.length
}

export function calculateRevenueYTD(opportunities: Oportunidad[]): number {
  const currentYear = new Date().getFullYear()
  
  return opportunities
    .filter(opp => 
      opp.estado === OPPORTUNITY_STATUSES.PAID && 
      new Date(opp.updatedAt).getFullYear() === currentYear
    )
    .reduce((total, opp) => {
      const songsRevenue = opp.canciones?.reduce((sum, song) => sum + (song.nps_total || 0), 0) || 0
      return total + songsRevenue
    }, 0)
}

export function getActiveSyncs(opportunities: Oportunidad[]): number {
  return opportunities.filter(opp => 
    opp.estado !== OPPORTUNITY_STATUSES.PAID && 
    opp.estado !== OPPORTUNITY_STATUSES.REJECTED
  ).length
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

