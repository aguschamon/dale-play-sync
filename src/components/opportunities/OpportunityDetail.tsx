'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Music, Disc3, DollarSign, Calendar, MapPin, Building, AlertTriangle } from 'lucide-react'
import { Oportunidad, Cliente, Obra, Fonograma, OportunidadCancion } from '@/types'
import { formatCurrency, formatDate, calculateNPS } from '@/lib/utils'
import AddSongModal from './AddSongModal'
import SongsTable from './SongsTable'

interface OpportunityDetailProps {
  opportunityId: string
}

export default function OpportunityDetail({ opportunityId }: OpportunityDetailProps) {
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<Oportunidad | null>(null)
  const [songs, setSongs] = useState<OportunidadCancion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false)

  const fetchOpportunityData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch oportunidad desde la API
      const opportunityResponse = await fetch(`/api/opportunities/${opportunityId}`)
      if (!opportunityResponse.ok) {
        throw new Error('Oportunidad no encontrada')
      }
      
      const opportunityData = await opportunityResponse.json()
      setOpportunity(opportunityData)
      
      // TODO: Implementar API para canciones de oportunidad
      // Por ahora usamos datos simulados basados en la oportunidad
      const demoSongs: OportunidadCancion[] = [
        {
          id: '1',
          oportunidadId: opportunityId,
          obraId: '1',
          fonogramaId: '1',
          budget_cancion: opportunityData.budget * 0.6,
          nps_publishing: (opportunityData.budget * 0.6 * 0.5) * (12.5 / 100),
          nps_recording: (opportunityData.budget * 0.6 * 0.5) * (30 / 100),
          nps_total: 0,
          aprobaciones: { 'Bizarrap': { estado: 'aprobado', fecha: new Date().toISOString() } },
          createdAt: new Date()
        }
      ]
      
      // Calcular NPS total
      demoSongs.forEach(song => {
        song.nps_total = (song.nps_publishing || 0) + (song.nps_recording || 0)
      })
      
      setSongs(demoSongs)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [opportunityId])

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunityData()
    }
  }, [opportunityId, fetchOpportunityData])

  const handleAddSong = async (songData: { obraId: string; fonogramaId?: string; budget_cancion?: number; }) => {
    try {
      // TODO: Implementar API para agregar canciones
      // Por ahora solo agregamos al estado local
      if (!opportunity?.budget) throw new Error('Budget de oportunidad no disponible')
      
      const newSong: OportunidadCancion = {
        id: Date.now().toString(),
        oportunidadId: opportunityId,
        obraId: songData.obraId,
        fonogramaId: songData.fonogramaId || undefined,
        budget_cancion: songData.budget_cancion || opportunity.budget * 0.4,
        nps_publishing: (songData.budget_cancion || opportunity.budget * 0.4) * 0.5 * (12.5 / 100), // Default DP share
        nps_recording: (songData.budget_cancion || opportunity.budget * 0.4) * 0.5 * (30 / 100), // Default DP control
        nps_total: 0,
        aprobaciones: {},
        createdAt: new Date()
      }
      
      newSong.nps_total = (newSong.nps_publishing || 0) + (newSong.nps_recording || 0)
      
      setSongs(prev => [...prev, newSong])
      setIsAddSongModalOpen(false)
    } catch (error) {
      console.error('Error adding song:', error)
      alert(error instanceof Error ? error.message : 'Error adding song')
    }
  }

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
      return
    }

    setSongs(prev => prev.filter(song => song.id !== songId))
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PITCHING': 'bg-blue-500',
      'NEGOTIATION': 'bg-yellow-500',
      'APPROVAL': 'bg-orange-500',
      'LEGAL': 'bg-purple-500',
      'SIGNED': 'bg-green-500',
      'INVOICED': 'bg-indigo-500',
      'PAID': 'bg-emerald-500',
      'REJECTED': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PITCHING': 'Pitching',
      'NEGOTIATION': 'Negociación',
      'APPROVAL': 'Aprobación',
      'LEGAL': 'Legal',
      'SIGNED': 'Firmado',
      'INVOICED': 'Facturado',
      'PAID': 'Pagado',
      'REJECTED': 'Rechazado'
    }
    return labels[status] || status
  }

  const getUrgencyLevel = (opportunity: Oportunidad) => {
    if (opportunity.tipo_flow === 'INBOUND') return 'ALTA'
    if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) return 'CRÍTICA'
    if (opportunity.deadline && new Date(opportunity.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return 'MEDIA'
    return 'BAJA'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando oportunidad...</p>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oportunidad no encontrada</h2>
          <p className="text-gray-400 mb-6">La oportunidad que buscas no existe o ha sido eliminada</p>
          <button
            onClick={() => router.push('/opportunities')}
            className="btn-secondary"
          >
            Volver a Oportunidades
          </button>
        </div>
      </div>
    )
  }

  const urgencyLevel = getUrgencyLevel(opportunity)
  const totalBudget = opportunity.budget || 0
  const totalDalePlay = songs.reduce((sum, song) => sum + (song.nps_total || 0), 0)
  const dalePlayPercentage = totalBudget > 0 ? (totalDalePlay / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/opportunities')}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{opportunity.proyecto}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(opportunity.estado)}`}>
                {getStatusLabel(opportunity.estado)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                opportunity.tipo_flow === 'INBOUND' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {opportunity.tipo_flow}
              </span>
              {urgencyLevel === 'ALTA' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white animate-pulse">
                  URGENTE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Cliente</p>
              <p className="font-medium text-white">{opportunity.cliente?.nombre || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Budget</p>
              <p className="font-medium text-white truncate max-w-[150px]">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Territorio</p>
              <p className="font-medium text-white">{opportunity.territorio || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">Deadline</p>
              <p className="font-medium text-white">
                {opportunity.deadline ? formatDate(opportunity.deadline) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Detalles del Proyecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Tipo de Proyecto</p>
            <p className="text-white font-medium">{opportunity.tipo_proyecto}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Duración de Licencia</p>
            <p className="text-white font-medium">{opportunity.duracion_licencia || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">MFN</p>
            <p className="text-white font-medium">{opportunity.mfn ? 'Sí' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white truncate max-w-[200px]">{formatCurrency(totalBudget)}</p>
            <p className="text-sm text-gray-400">Budget Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-dale-purple">{formatCurrency(totalDalePlay)}</p>
            <p className="text-sm text-gray-400">Total Dale Play</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{dalePlayPercentage.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Porcentaje DP</p>
          </div>
        </div>
      </div>

      {/* Songs and Rights */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Canciones y Derechos</h3>
            <p className="text-gray-400 mt-1">
              Gestiona las canciones asociadas a esta oportunidad y calcula el NPS
            </p>
          </div>
          <button
            onClick={() => setIsAddSongModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Canción</span>
          </button>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No hay canciones agregadas
            </h3>
            <p className="text-gray-400">
              Agrega canciones del catálogo para calcular el NPS y gestionar los derechos
            </p>
          </div>
        ) : (
          <SongsTable
            songs={songs}
            opportunity={opportunity}
            onDeleteSong={handleDeleteSong}
          />
        )}
      </div>

      {/* Add Song Modal */}
      {isAddSongModalOpen && (
        <AddSongModal
          opportunity={opportunity}
          onAddSong={handleAddSong}
          onClose={() => setIsAddSongModalOpen(false)}
        />
      )}
    </div>
  )
}
