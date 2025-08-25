'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Music, Disc3, DollarSign, Calendar, MapPin, Building, AlertTriangle } from 'lucide-react'
import { Oportunidad, Cliente, Obra, Fonograma, OportunidadCancion } from '@/types'
import { formatCurrency, formatDate, calculateNPS } from '@/lib/utils'
import AddSongModal from '@/components/opportunities/AddSongModal'
import SongsTable from '@/components/opportunities/SongsTable'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const opportunityId = params.id as string

  const [opportunity, setOpportunity] = useState<Oportunidad | null>(null)
  const [songs, setSongs] = useState<OportunidadCancion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false)

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunityData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId])

  const fetchOpportunityData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch opportunity data
      const opportunityResponse = await fetch(`/api/opportunities/${opportunityId}`)
      if (!opportunityResponse.ok) {
        throw new Error('Error fetching opportunity')
      }
      const opportunityData = await opportunityResponse.json()
      setOpportunity(opportunityData)

      // Fetch songs data
      const songsResponse = await fetch(`/api/opportunities/${opportunityId}/songs`)
      if (!songsResponse.ok) {
        throw new Error('Error fetching songs')
      }
      const songsData = await songsResponse.json()
      setSongs(songsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSong = async (songData: { obraId: string; fonogramaId?: string; budget_cancion?: number; }) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error adding song')
      }

      const newSong = await response.json()
      setSongs(prev => [...prev, newSong])
      setIsAddSongModalOpen(false)
      
      // Refresh data to get updated NPS calculations
      await fetchOpportunityData()
    } catch (error) {
      console.error('Error adding song:', error)
      alert(error instanceof Error ? error.message : 'Error adding song')
    }
  }

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
      return
    }

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/songs/${songId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error deleting song')
      }

      setSongs(prev => prev.filter(song => song.id !== songId))
      
      // Refresh data to get updated NPS calculations
      await fetchOpportunityData()
    } catch (error) {
      console.error('Error deleting song:', error)
      alert('Error deleting song')
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-green mx-auto mb-4"></div>
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
              <p className="font-medium text-white">{formatCurrency(totalBudget)}</p>
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
            <p className="text-sm text-gray-400 mb-1">Tipo de Uso</p>
            <p className="text-white font-medium">{opportunity.tipo_uso || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">MFN</p>
            <p className="text-white font-medium">{opportunity.mfn ? 'Sí' : 'No'}</p>
          </div>
        </div>
                 {opportunity.metadata && (
           <div className="mt-4 pt-4 border-t border-dale-gray-light">
             <p className="text-sm text-gray-400 mb-2">Notas Adicionales</p>
             <p className="text-white">
               {typeof opportunity.metadata === 'string' 
                 ? opportunity.metadata 
                 : JSON.stringify(opportunity.metadata)}
             </p>
           </div>
         )}
      </div>

      {/* Financial Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
            <p className="text-sm text-gray-400">Budget Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-dale-green">{formatCurrency(totalDalePlay)}</p>
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
