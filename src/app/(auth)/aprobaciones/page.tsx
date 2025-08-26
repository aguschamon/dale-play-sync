'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Filter, Mail, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Aprobacion {
  id: string
  oportunidad_id: string
  titular_id: string
  estado: string
  token: string
  fecha_envio: string
  fecha_respuesta?: string
  comentarios?: string
  
  oportunidad: {
    codigo: string
    proyecto: string
    tipo_flow: string
    estado: string
    cliente: {
      nombre: string
    }
  }
  
  titular: {
    nombre: string
    email: string
    tipo: string
  }
}

export default function AprobacionesPage() {
  const router = useRouter()
  const [aprobaciones, setAprobaciones] = useState<Aprobacion[]>([])
  const [filteredAprobaciones, setFilteredAprobaciones] = useState<Aprobacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [filtroFlow, setFiltroFlow] = useState<string>('TODOS')

  useEffect(() => {
    fetchAprobaciones()
  }, [])

  useEffect(() => {
    filterAprobaciones()
  }, [filtroEstado, filtroFlow, aprobaciones])

  const fetchAprobaciones = async () => {
    try {
      const response = await fetch('/api/aprobaciones')
      if (response.ok) {
        const data = await response.json()
        setAprobaciones(data)
      }
    } catch (error) {
      console.error('Error fetching aprobaciones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAprobaciones = () => {
    let filtered = aprobaciones

    if (filtroEstado !== 'TODOS') {
      filtered = filtered.filter(a => a.estado === filtroEstado)
    }

    if (filtroFlow !== 'TODOS') {
      filtered = filtered.filter(a => a.oportunidad.tipo_flow === filtroFlow)
    }

    setFilteredAprobaciones(filtered)
  }

  const getEstadoColor = (estado: string) => {
    const colors: { [key: string]: string } = {
      'PENDIENTE': 'bg-dale-amber text-white',
      'APROBADO': 'bg-green-600 text-white',
      'RECHAZADO': 'bg-red-600 text-white'
    }
    return colors[estado] || 'bg-gray-600 text-white'
  }

  const getEstadoIcon = (estado: string) => {
    const icons: { [key: string]: any } = {
      'PENDIENTE': Clock,
      'APROBADO': CheckCircle,
      'RECHAZADO': XCircle
    }
    return icons[estado] || Clock
  }

  const getFlowColor = (flow: string) => {
    return flow === 'INBOUND' ? 'bg-dale-red text-white' : 'bg-dale-purple text-white'
  }

  const handleReenviarEmail = async (id: string) => {
    try {
      const response = await fetch(`/api/aprobaciones/${id}/reenviar`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Email reenviado exitosamente')
        fetchAprobaciones() // Recargar datos
      } else {
        alert('Error al reenviar el email')
      }
    } catch (error) {
      console.error('Error reenviando email:', error)
      alert('Error al reenviar el email')
    }
  }

  const getEstadisticas = () => {
    const total = aprobaciones.length
    const pendientes = aprobaciones.filter(a => a.estado === 'PENDIENTE').length
    const aprobadas = aprobaciones.filter(a => a.estado === 'APROBADO').length
    const rechazadas = aprobaciones.filter(a => a.estado === 'RECHAZADO').length
    const inbound = aprobaciones.filter(a => a.oportunidad.tipo_flow === 'INBOUND').length
    const outbound = aprobaciones.filter(a => a.oportunidad.tipo_flow === 'OUTBOUND').length

    return { total, pendientes, aprobadas, rechazadas, inbound, outbound }
  }

  const stats = getEstadisticas()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dale-navy text-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-dale-navy-light rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-dale-navy-light rounded w-full mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-dale-navy-light rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dale-navy text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <CheckSquare className="w-8 h-8 text-dale-emerald" />
            <div>
              <h1 className="text-3xl font-bold text-white">Aprobaciones</h1>
              <p className="text-gray-400 mt-2">Gestiona todas las aprobaciones de sincronización</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-emerald rounded-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-amber rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aprobadas</p>
                <p className="text-2xl font-bold text-white">{stats.aprobadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-600 rounded-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rechazadas</p>
                <p className="text-2xl font-bold text-white">{stats.rechazadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-red rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">INBOUND</p>
                <p className="text-2xl font-bold text-white">{stats.inbound}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-purple rounded-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">OUTBOUND</p>
                <p className="text-2xl font-bold text-white">{stats.outbound}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Filtros:</span>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-dale-navy-lighter border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobadas</option>
              <option value="RECHAZADO">Rechazadas</option>
            </select>
            
            <select
              value={filtroFlow}
              onChange={(e) => setFiltroFlow(e.target.value)}
              className="bg-dale-navy-lighter border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
            >
              <option value="TODOS">Todos los flows</option>
              <option value="INBOUND">INBOUND</option>
              <option value="OUTBOUND">OUTBOUND</option>
            </select>
          </div>
        </div>

        {/* Lista de Aprobaciones */}
        <div className="bg-dale-navy-light rounded-lg border border-dale-navy-lighter overflow-hidden">
          {filteredAprobaciones.length === 0 ? (
            <div className="p-8 text-center">
              <CheckSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {aprobaciones.length === 0 ? 'No hay aprobaciones registradas' : 'No se encontraron aprobaciones con los filtros aplicados'}
              </h3>
              <p className="text-gray-500">
                {aprobaciones.length === 0 ? 'Las aprobaciones aparecerán aquí cuando se creen oportunidades' : 'Intenta ajustar los filtros'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dale-navy-lighter">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Oportunidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Titular
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fecha Envío
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dale-navy-lighter">
                  {filteredAprobaciones.map((aprobacion) => {
                    const EstadoIcon = getEstadoIcon(aprobacion.estado)
                    return (
                      <tr key={aprobacion.id} className="hover:bg-dale-navy-lighter transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{aprobacion.oportunidad.proyecto}</div>
                            <div className="text-sm text-gray-400">
                              {aprobacion.oportunidad.codigo} • {aprobacion.oportunidad.cliente.nombre}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFlowColor(aprobacion.oportunidad.tipo_flow)}`}>
                                {aprobacion.oportunidad.tipo_flow}
                              </span>
                              <span className="text-xs text-gray-500">
                                {aprobacion.oportunidad.estado}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{aprobacion.titular.nombre}</div>
                            <div className="text-sm text-gray-400">{aprobacion.titular.email}</div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-600 text-white mt-1">
                              {aprobacion.titular.tipo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <EstadoIcon className="w-4 h-4" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(aprobacion.estado)}`}>
                              {aprobacion.estado}
                            </span>
                          </div>
                          {aprobacion.fecha_respuesta && (
                            <div className="text-xs text-gray-500 mt-1">
                              Respondido: {new Date(aprobacion.fecha_respuesta).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-400">
                            {new Date(aprobacion.fecha_envio).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(aprobacion.fecha_envio).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/aprobaciones/${aprobacion.id}`)}
                              className="text-dale-emerald hover:text-dale-emerald-light transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {aprobacion.estado === 'PENDIENTE' && (
                              <button
                                onClick={() => handleReenviarEmail(aprobacion.id)}
                                className="text-dale-purple hover:text-dale-purple-light transition-colors duration-200"
                                title="Reenviar email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
