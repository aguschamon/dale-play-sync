'use client'
import { useState, useEffect } from 'react'
import { X, Search, Music, Disc3, Plus } from 'lucide-react'
import { Oportunidad, Obra, Fonograma } from '@/types'
import { calculateNPS } from '@/lib/utils'

interface AddSongModalProps {
  opportunity: Oportunidad
  onAddSong: (songData: { obraId: string; fonogramaId?: string; budget_cancion?: number; }) => void
  onClose: () => void
}

interface SearchResult {
  obra: Obra
  fonogramas: Fonograma[]
}

export default function AddSongModal({ opportunity, onAddSong, onClose }: AddSongModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null)
  const [selectedFonograma, setSelectedFonograma] = useState<Fonograma | null>(null)
  const [songBudget, setSongBudget] = useState<number>(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        handleSearch(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Set initial song budget
  useEffect(() => {
    if (opportunity.budget && songBudget === 0) {
      setSongBudget(opportunity.budget)
    }
  }, [opportunity.budget, songBudget])

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) return

    try {
      setIsSearching(true)
      const response = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      } else {
        console.error('Error searching catalog')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching catalog:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectObra = (obra: Obra) => {
    setSelectedObra(obra)
    setSelectedFonograma(null)
    
    // Set song budget if not already set
    if (songBudget === 0 && opportunity.budget) {
      setSongBudget(opportunity.budget)
    }
  }

  const handleSelectFonograma = (fonograma: Fonograma) => {
    setSelectedFonograma(fonograma)
  }

  const handleAddSong = () => {
    if (!selectedObra) return

    onAddSong({
      obraId: selectedObra.id,
      fonogramaId: selectedFonograma?.id,
      budget_cancion: songBudget > 0 ? songBudget : undefined
    })
  }

  const getNPSBreakdown = () => {
    if (!selectedObra || songBudget <= 0) return null

    const publishingNPS = (songBudget * 0.5) * (selectedObra.porcentaje_share_dp / 100)
    let recordingNPS = 0

    if (selectedFonograma) {
      recordingNPS = (songBudget * 0.5) * (selectedFonograma.porcentaje_dp / 100)
    }

    const totalDP = publishingNPS + recordingNPS
    const percentage = (totalDP / songBudget) * 100

    return {
      publishingNPS,
      recordingNPS,
      totalDP,
      percentage
    }
  }

  const npsBreakdown = getNPSBreakdown()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dale-gray rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Agregar Canción del Catálogo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar canciones... (ej: 'biza 52', 'quevedo', 'iswc')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Busca por nombre de canción, artista, ISWC o ISRC
          </p>
        </div>

        {/* Search Results */}
        {searchTerm.trim().length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Resultados de búsqueda
              {isSearching && <span className="text-gray-400 ml-2">(buscando...)</span>}
            </h3>
            
            {searchResults.length === 0 && !isSearching && (
              <p className="text-gray-400 text-center py-8">
                No se encontraron canciones que coincidan con &quot;{searchTerm}&quot;
              </p>
            )}

            {searchResults.map((result) => (
              <div
                key={result.obra.id}
                className={`border rounded-lg p-4 mb-3 cursor-pointer transition-colors duration-200 ${
                  selectedObra?.id === result.obra.id
                    ? 'border-dale-green bg-dale-green bg-opacity-10'
                    : 'border-dale-gray-light hover:border-dale-green hover:bg-dale-gray-light'
                }`}
                onClick={() => handleSelectObra(result.obra)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">{result.obra.nombre}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">ISWC:</span>
                        <span className="text-white ml-2">{result.obra.iswc || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Control DP:</span>
                        <span className="text-blue-400 ml-2">{result.obra.porcentaje_control_dp}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Share DP:</span>
                        <span className="text-green-400 ml-2">{result.obra.porcentaje_share_dp}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Territorio:</span>
                        <span className="text-white ml-2">{result.obra.territorio || 'N/A'}</span>
                      </div>
                    </div>
                    
                                         {result.obra.compositores && (
                       <div className="mt-2">
                         <span className="text-gray-400 text-sm">Compositores:</span>
                         <span className="text-white text-sm ml-2">
                           {typeof result.obra.compositores === 'string' 
                             ? result.obra.compositores 
                             : JSON.stringify(result.obra.compositores)}
                         </span>
                       </div>
                     )}
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Fonogramas</span>
                      <div className="text-white font-medium">{result.fonogramas.length}</div>
                    </div>
                  </div>
                </div>

                {/* Fonogramas disponibles */}
                {result.fonogramas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dale-gray-light">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Fonogramas disponibles:</h5>
                    <div className="space-y-2">
                      {result.fonogramas.map((fonograma) => (
                        <div
                          key={fonograma.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-200 ${
                            selectedFonograma?.id === fonograma.id
                              ? 'bg-dale-green bg-opacity-20 border border-dale-green'
                              : 'hover:bg-dale-gray-light'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectFonograma(fonograma)
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Disc3 className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="text-sm font-medium text-white">{fonograma.nombre}</div>
                              <div className="text-xs text-gray-400">
                                {fonograma.artista_principal}
                                {fonograma.featured_artists && ` ft. ${fonograma.featured_artists}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white">{fonograma.porcentaje_dp}%</div>
                            <div className="text-xs text-gray-400">DP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Song Details */}
        {selectedObra && (
          <div className="border border-dale-green rounded-lg p-4 bg-dale-green bg-opacity-10">
            <h3 className="font-medium text-white mb-3">Canción Seleccionada</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white ml-2 font-medium">{selectedObra.nombre}</span>
              </div>
              <div>
                <span className="text-gray-400">ISWC:</span>
                <span className="text-white ml-2">{selectedObra.iswc || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Control DP:</span>
                <span className="text-blue-400 ml-2 font-medium">{selectedObra.porcentaje_control_dp}%</span>
              </div>
              <div>
                <span className="text-gray-400">Share DP:</span>
                <span className="text-green-400 ml-2 font-medium">{selectedObra.porcentaje_share_dp}%</span>
              </div>
            </div>

            {selectedFonograma && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-2">Fonograma Seleccionado</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nombre:</span>
                    <span className="text-white ml-2 font-medium">{selectedFonograma.nombre}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Artista:</span>
                    <span className="text-white ml-2">{selectedFonograma.artista_principal}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ISRC:</span>
                    <span className="text-white ml-2">{selectedFonograma.isrc || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">DP:</span>
                    <span className="text-blue-400 ml-2 font-medium">{selectedFonograma.porcentaje_dp}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Song Budget Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget de esta canción (opcional)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={songBudget}
                onChange={(e) => setSongBudget(parseFloat(e.target.value) || 0)}
                placeholder={`${opportunity.budget ? formatCurrency(opportunity.budget) : '0'}`}
                className="input-field w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si no se especifica, se usará el budget total de la oportunidad
              </p>
            </div>

            {/* NPS Calculation Preview */}
            {npsBreakdown && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-3">Cálculo de NPS</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Publishing NPS:</span>
                    <span className="text-blue-400 ml-2 font-medium truncate max-w-[120px]">{formatCurrency(npsBreakdown.publishingNPS)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Recording NPS:</span>
                    <span className="text-green-400 ml-2 font-medium truncate max-w-[120px]">{formatCurrency(npsBreakdown.recordingNPS)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Dale Play:</span>
                    <span className="text-dale-green ml-2 font-medium truncate max-w-[120px]">{formatCurrency(npsBreakdown.totalDP)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Porcentaje:</span>
                    <span className="text-dale-green ml-2 font-medium">{npsBreakdown.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-dale-gray-light">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddSong}
            disabled={!selectedObra}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Canción</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
