'use client'

import { Target, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { Oportunidad } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface OpportunitiesStatsProps {
  opportunities: Oportunidad[]
}

export default function OpportunitiesStats({ opportunities }: OpportunitiesStatsProps) {
  const totalOpportunities = opportunities.length
  const activeOpportunities = opportunities.filter(opp => 
    opp.estado !== 'PAID' && opp.estado !== 'REJECTED'
  ).length
  
  const inboundOpportunities = opportunities.filter(opp => 
    opp.tipo_flow === 'INBOUND'
  ).length
  
  const outboundOpportunities = opportunities.filter(opp => 
    opp.tipo_flow === 'OUTBOUND'
  ).length

  const totalBudget = opportunities.reduce((sum, opp) => 
    sum + (opp.budget || 0), 0
  )

  const urgentOpportunities = opportunities.filter(opp => {
    if (opp.tipo_flow === 'INBOUND') return true
    if (!opp.deadline) return false
    
    const now = new Date()
    const deadline = new Date(opp.deadline)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }).length

  const conversionRate = totalOpportunities > 0 
    ? (opportunities.filter(opp => opp.estado === 'PAID').length / totalOpportunities) * 100
    : 0

  const stats = [
    {
      name: 'Total Oportunidades',
      value: totalOpportunities.toString(),
      change: `${activeOpportunities} activas`,
      changeType: 'info',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      name: 'Budget Total',
      value: formatCurrency(totalBudget),
      change: `${opportunities.filter(opp => opp.budget).length} con budget`,
      changeType: 'info',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      name: 'Tasa de Conversión',
      value: `${conversionRate.toFixed(1)}%`,
      change: `${opportunities.filter(opp => opp.estado === 'PAID').length} pagadas`,
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      name: 'INBOUND vs OUTBOUND',
      value: `${inboundOpportunities}:${outboundOpportunities}`,
      change: inboundOpportunities > outboundOpportunities ? 'INBOUND dominante' : 'OUTBOUND dominante',
      changeType: inboundOpportunities > outboundOpportunities ? 'urgent' : 'info',
      icon: AlertTriangle,
      color: inboundOpportunities > outboundOpportunities ? 'text-red-400' : 'text-orange-400'
    },
    {
      name: 'Oportunidades Urgentes',
      value: urgentOpportunities.toString(),
      change: urgentOpportunities > 0 ? 'Requieren atención' : 'Todo bajo control',
      changeType: urgentOpportunities > 0 ? 'urgent' : 'success',
      icon: Clock,
      color: urgentOpportunities > 0 ? 'text-red-400' : 'text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-400' :
                stat.changeType === 'urgent' ? 'text-red-400' :
                stat.changeType === 'success' ? 'text-green-400' :
                'text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

