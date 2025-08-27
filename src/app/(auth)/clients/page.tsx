'use client'
import { useState, useEffect } from 'react'
import { Plus, Building, Users, DollarSign, Target, Calendar, Mail, Phone, Globe } from 'lucide-react'
import { Cliente, Oportunidad } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ClientWithStats extends Cliente {
  opportunities: Oportunidad[]
  totalBudget: number
  totalRevenue: number
  activeOpportunities: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      
      const [clientsRes, opportunitiesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/opportunities')
      ])

      if (!clientsRes.ok || !opportunitiesRes.ok) {
        throw new Error('Error fetching data')
      }

      const clientsData: Cliente[] = await clientsRes.json()
      const opportunities: Oportunidad[] = await opportunitiesRes.json()

      // Enriquecer clientes con estadísticas
      const enrichedClients: ClientWithStats[] = clientsData.map(client => {
        const clientOpportunities = opportunities.filter(opp => opp.clienteId === client.id)
        const totalBudget = clientOpportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0)
        const totalRevenue = clientOpportunities
          .filter(opp => opp.estado === 'PAID')
          .reduce((sum, opp) => sum + (opp.budget || 0), 0)
        const activeOpportunities = clientOpportunities.filter(opp => 
          opp.estado !== 'PAID' && opp.estado !== 'REJECTED'
        ).length

        return {
          ...client,
          opportunities: clientOpportunities,
          totalBudget,
          totalRevenue,
          activeOpportunities
        }
      })

      setClients(enrichedClients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'PLATAFORMA':
        return 'bg-blue-500/20 text-blue-400'
      case 'MARCA':
        return 'bg-green-500/20 text-green-400'
      case 'PRODUCTORA':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'PLATAFORMA':
        return 'Plataforma'
      case 'MARCA':
        return 'Marca'
      case 'PRODUCTORA':
        return 'Productora'
      default:
        return type
    }
  }

  // Función helper para manejar contactos de manera segura
  const renderContactos = (contactos: any) => {
    if (!contactos) {
      return <div className="text-sm text-gray-400">Sin contactos</div>
    }

    try {
      // Si es un string, intentar parsearlo como JSON
      if (typeof contactos === 'string') {
        const parsed = JSON.parse(contactos)
        if (parsed && typeof parsed === 'object') {
          // Es un JSON válido
          return (
            <>
              {parsed.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-xs">{parsed.email}</span>
                </div>
              )}
              {parsed.telefono && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-xs">{parsed.telefono}</span>
                </div>
              )}
            </>
          )
        } else {
          // Es un string simple (email directo)
          return (
            <div className="flex items-center space-x-2">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{contactos}</span>
            </div>
          )
        }
      } else if (typeof contactos === 'object') {
        // Ya es un objeto
        return (
          <>
            {contactos.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-xs">{contactos.email}</span>
              </div>
            )}
            {contactos.telefono && (
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-xs">{contactos.telefono}</span>
              </div>
            )}
          </>
        )
      }
    } catch (error) {
      // Si falla el parse, mostrar como string simple
      return (
        <div className="flex items-center space-x-2">
          <Mail className="w-3 h-3 text-gray-400" />
          <span className="text-xs">{contactos}</span>
        </div>
      )
    }
  }

  const filteredClients = clients.filter(client =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-green mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  const totalClients = clients.length
  const totalBudget = clients.reduce((sum, client) => sum + client.totalBudget, 0)
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0)
  const totalActiveOpportunities = clients.reduce((sum, client) => sum + client.activeOpportunities, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
          <p className="text-gray-400 mt-2">
            Administra la cartera de clientes y sus oportunidades
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Building className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalClients}</div>
          <div className="text-sm text-gray-400">Total Clientes</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalActiveOpportunities}</div>
          <div className="text-sm text-gray-400">Oportunidades Activas</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6 text-dale-green" />
          </div>
          <div className="text-2xl font-bold text-dale-green">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-400">Budget Total</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-400">Revenue Generado</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar clientes por nombre o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dale-gray-light border border-dale-gray-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dale-green focus:border-transparent"
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {filteredClients.length} de {totalClients} clientes
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dale-gray-light">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Contactos</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Oportunidades</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">ROI</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-dale-gray-light hover:bg-dale-gray-light transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-dale-green rounded-lg flex items-center justify-center">
                        <span className="text-dale-black font-bold text-lg">
                          {client.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{client.nombre}</div>
                        <div className="text-sm text-gray-400">
                          {client.opportunities.length} oportunidades
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClientTypeColor(client.tipo)}`}>
                      {getClientTypeLabel(client.tipo)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {renderContactos(client.contactos)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{client.opportunities.length}</div>
                      <div className="text-xs text-gray-400">
                        {client.activeOpportunities} activas
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-dale-green font-medium">
                      {formatCurrency(client.totalBudget)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-emerald-400 font-medium">
                      {formatCurrency(client.totalRevenue)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-blue-400 font-medium">
                      {client.totalBudget > 0 ? ((client.totalRevenue / client.totalBudget) * 100).toFixed(1) : '0'}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Opportunities Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen de Oportunidades por Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="p-4 bg-dale-gray-light rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{client.nombre}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClientTypeColor(client.tipo)}`}>
                  {getClientTypeLabel(client.tipo)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white">{client.opportunities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Activas:</span>
                  <span className="text-green-400">{client.activeOpportunities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget:</span>
                  <span className="text-dale-green">{formatCurrency(client.totalBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue:</span>
                  <span className="text-emerald-400">{formatCurrency(client.totalRevenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

