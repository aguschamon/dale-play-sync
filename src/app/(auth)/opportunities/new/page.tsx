'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Music, Disc3, Calculator, Save, CheckCircle, XCircle } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  tipo: string
}

interface CatalogItem {
  type: 'obra' | 'fonograma'
  id: string
  nombre: string
  iswc?: string
  isrc?: string
  compositores?: string
  porcentaje_control_dp?: number
  porcentaje_share_dp?: number
  porcentaje_dp?: number
  artista_principal?: string
  featured_artists?: string
  sello?: string
  anio_lanzamiento?: number
  territorio?: string
  fonogramas?: any[]
  obra?: any
}

interface FormData {
  tipo_flow: 'INBOUND' | 'OUTBOUND'
  clienteId: string
  proyecto: string
  tipo_proyecto: 'SERIE' | 'PELICULA' | 'PUBLICIDAD' | 'VIDEOJUEGO'
  territorio: string
  duracion_licencia: string
  budget: number
  mfn: boolean
  deadline: string
  descripcion: string
}

interface NPSData {
  publishing: number
  recording: number
  total: number
  percentage: number
  budgetAllIn: number
  publishingBudget: number
  recordingBudget: number
}

interface Titular {
  id: string
  nombre: string
  email: string
  tipo: string
  porcentaje?: number
  rol?: string
}

export default function NewOpportunityPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([])
  const [selectedSong, setSelectedSong] = useState<CatalogItem | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [npsData, setNpsData] = useState<NPSData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titulares, setTitulares] = useState<Titular[]>([])
  const [selectedTitulares, setSelectedTitulares] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    tipo_flow: 'OUTBOUND',
    clienteId: '',
    proyecto: '',
    tipo_proyecto: 'SERIE',
    territorio: 'Mundial',
    duracion_licencia: '',
    budget: 0,
    mfn: false,
    deadline: '',
    descripcion: ''
  })

  // Cargar clientes y titulares al montar el componente
  useEffect(() => {
    fetchClientes()
    fetchTitulares()
  }, [])

  // Calcular NPS cuando cambie la canción seleccionada o el budget
  useEffect(() => {
    if (selectedSong && formData.budget > 0) {
      calculateNPS()
    } else {
      setNpsData(null)
    }
  }, [selectedSong, formData.budget, formData.mfn])

  // Pre-seleccionar todos los titulares si es INBOUND
  useEffect(() => {
    if (formData.tipo_flow === 'INBOUND' && titulares.length > 0) {
      setSelectedTitulares(titulares.map(t => t.id))
    } else if (formData.tipo_flow === 'OUTBOUND') {
      setSelectedTitulares([])
    }
  }, [formData.tipo_flow, titulares])

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchTitulares = async () => {
    try {
      const response = await fetch('/api/titulares')
      if (response.ok) {
        const data = await response.json()
        setTitulares(data)
      }
    } catch (error) {
      console.error('Error fetching titulares:', error)
    }
  }

  const searchCatalog = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching catalog:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (query.trim().length >= 2) {
      searchCatalog(query)
    } else {
      setSearchResults([])
    }
  }

  const selectSong = (item: CatalogItem) => {
    setSelectedSong(item)
    setSearchQuery('')
    setSearchResults([])
  }

  const calculateNPS = () => {
    if (!selectedSong || formData.budget <= 0) return

    let publishingNPS = 0
    let recordingNPS = 0
    let publishingBudget = 0
    let recordingBudget = 0

    // Calcular budgets según MFN
    if (formData.mfn) {
      // Con MFN: cada lado recibe el budget completo
      publishingBudget = formData.budget
      recordingBudget = formData.budget
    } else {
      // Sin MFN: budget se divide 50/50
      publishingBudget = formData.budget * 0.5
      recordingBudget = formData.budget * 0.5
    }

    if (selectedSong.type === 'obra') {
      // Si es una obra, usar sus porcentajes
      const shareDP = selectedSong.porcentaje_share_dp || 0
      
      publishingNPS = publishingBudget * (shareDP / 100)
      
      // Para recording, buscar en fonogramas asociados
      if (selectedSong.fonogramas && selectedSong.fonogramas.length > 0) {
        const fonograma = selectedSong.fonogramas[0]
        const recordingDP = fonograma.porcentaje_dp || 0
        recordingNPS = recordingBudget * (recordingDP / 100)
      }
    } else if (selectedSong.type === 'fonograma') {
      // Si es un fonograma, usar la obra asociada
      if (selectedSong.obra) {
        const shareDP = selectedSong.obra.porcentaje_share_dp || 0
        publishingNPS = publishingBudget * (shareDP / 100)
      }
      const recordingDP = selectedSong.porcentaje_dp || 0
      recordingNPS = recordingBudget * (recordingDP / 100)
    }

    const total = publishingNPS + recordingNPS
    const percentage = (total / formData.budget) * 100
    const budgetAllIn = formData.mfn ? formData.budget * 2 : formData.budget

    setNpsData({
      publishing: Math.round(publishingNPS * 100) / 100,
      recording: Math.round(recordingNPS * 100) / 100,
      total: Math.round(total * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      budgetAllIn,
      publishingBudget,
      recordingBudget
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSong) {
      alert('Debes seleccionar una canción del catálogo')
      return
    }

    setIsSubmitting(true)
    try {
      const opportunityData = {
        ...formData,
        metadata: JSON.stringify({
          descripcion: formData.descripcion,
          cancion_seleccionada: {
            id: selectedSong.id,
            nombre: selectedSong.nombre,
            tipo: selectedSong.type,
            iswc: selectedSong.iswc,
            isrc: selectedSong.isrc
          },
          nps_calculado: npsData
        })
      }

      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(opportunityData)
      })

      if (response.ok) {
        router.push('/opportunities')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating opportunity:', error)
      alert('Error al crear la oportunidad')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTitularToggle = (titularId: string) => {
    setSelectedTitulares(prev => 
      prev.includes(titularId) 
        ? prev.filter(id => id !== titularId)
        : [...prev, titularId]
    )
  }

  const handleSelectAllTitulares = () => {
    setSelectedTitulares(titulares.map(t => t.id))
  }

  const handleDeselectAllTitulares = () => {
    setSelectedTitulares([])
  }

  const getRightsControl = () => {
    if (!selectedSong) return null

    let publishingControl = null
    let recordingControl = null

    if (selectedSong.type === 'obra') {
      const shareDP = selectedSong.porcentaje_share_dp || 0
      publishingControl = {
        hasControl: shareDP > 0,
        percentage: shareDP,
        label: 'Share DP'
      }

      if (selectedSong.fonogramas && selectedSong.fonogramas.length > 0) {
        const fonograma = selectedSong.fonogramas[0]
        const recordingDP = fonograma.porcentaje_dp || 0
        recordingControl = {
          hasControl: recordingDP > 0,
          percentage: recordingDP,
          label: 'Control DP'
        }
      }
    } else if (selectedSong.type === 'fonograma') {
      if (selectedSong.obra) {
        const shareDP = selectedSong.obra.porcentaje_share_dp || 0
        publishingControl = {
          hasControl: shareDP > 0,
          percentage: shareDP,
          label: 'Share DP'
        }
      }
      
      const recordingDP = selectedSong.porcentaje_dp || 0
      recordingControl = {
        hasControl: recordingDP > 0,
        percentage: recordingDP,
        label: 'Control DP'
      }
    }

    return { publishingControl, recordingControl }
  }

  const rightsControl = getRightsControl()

  return (
    <div className="min-h-screen bg-dale-navy text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/opportunities')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Nueva Oportunidad</h1>
              <p className="text-gray-400 mt-2">Crea una nueva oportunidad de sincronización musical</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Flow *
                </label>
                <select
                  value={formData.tipo_flow}
                  onChange={(e) => handleInputChange('tipo_flow', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                >
                  <option value="OUTBOUND">OUTBOUND</option>
                  <option value="INBOUND">INBOUND</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} ({cliente.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proyecto *
                </label>
                <input
                  type="text"
                  value={formData.proyecto}
                  onChange={(e) => handleInputChange('proyecto', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="Ej: Stranger Things Season 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Proyecto
                </label>
                <select
                  value={formData.tipo_proyecto}
                  onChange={(e) => handleInputChange('tipo_proyecto', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                >
                  <option value="SERIE">Serie</option>
                  <option value="PELICULA">Película</option>
                  <option value="PUBLICIDAD">Publicidad</option>
                  <option value="VIDEOJUEGO">Videojuego</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Territorio
                </label>
                <input
                  type="text"
                  value={formData.territorio}
                  onChange={(e) => handleInputChange('territorio', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="Mundial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duración de Licencia
                </label>
                <input
                  type="text"
                  value={formData.duracion_licencia}
                  onChange={(e) => handleInputChange('duracion_licencia', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="Ej: 5 años"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget (USD) *
                </label>
                <input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="mfn"
                  checked={formData.mfn}
                  onChange={(e) => handleInputChange('mfn', e.target.checked)}
                  className="w-4 h-4 text-dale-purple bg-dale-navy-light border-dale-navy-lighter rounded focus:ring-dale-purple"
                />
                <label htmlFor="mfn" className="text-sm font-medium text-gray-300">
                  MFN (Most Favored Nation)
                </label>
              </div>
            </div>

            {/* Búsqueda de Canciones */}
            <div className="mt-8 pt-6 border-t border-dale-navy-lighter">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Music className="w-5 h-5 text-dale-purple" />
                <span>Seleccionar Canción del Catálogo</span>
              </h4>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                    placeholder="Buscar por nombre, artista, ISWC, ISRC..."
                  />
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg max-h-64 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectSong(item)}
                        className="p-4 border-b border-dale-navy-lighter last:border-b-0 hover:bg-dale-navy-lighter cursor-pointer transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          {item.type === 'obra' ? (
                            <Music className="w-5 h-5 text-dale-purple flex-shrink-0" />
                          ) : (
                            <Disc3 className="w-5 h-5 text-dale-emerald flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{item.nombre}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === 'obra' 
                                  ? 'bg-dale-purple text-white' 
                                  : 'bg-dale-emerald text-white'
                              }`}>
                                {item.type === 'obra' ? 'OBRA' : 'FONOGRAMA'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {item.type === 'obra' ? (
                                <>
                                  ISWC: {item.iswc} • Control DP: {item.porcentaje_control_dp}% • Share DP: {item.porcentaje_share_dp}%
                                </>
                              ) : (
                                <>
                                  ISRC: {item.isrc} • Artista: {item.artista_principal} • Sello: {item.sello}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Canción seleccionada */}
                {selectedSong && (
                  <div className="bg-dale-purple bg-opacity-20 border border-dale-purple rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {selectedSong.type === 'obra' ? (
                          <Music className="w-6 h-6 text-dale-purple" />
                        ) : (
                          <Disc3 className="w-6 h-6 text-dale-emerald" />
                        )}
                        <div>
                          <h4 className="font-semibold text-white">{selectedSong.nombre}</h4>
                          <p className="text-sm text-gray-300">
                            {selectedSong.type === 'obra' ? (
                              `ISWC: ${selectedSong.iswc} • Control DP: ${selectedSong.porcentaje_control_dp}% • Share DP: ${selectedSong.porcentaje_share_dp}%`
                            ) : (
                              `ISRC: ${selectedSong.isrc} • Artista: ${selectedSong.artista_principal}`
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSong(null)}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        ×
                      </button>
                    </div>

                    {/* Control de derechos */}
                    {rightsControl && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-dale-navy-light rounded-lg p-3">
                          <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                            <span>PUBLISHING</span>
                          </h5>
                          {rightsControl.publishingControl ? (
                            <div className="flex items-center space-x-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">
                                Dale Play controla {rightsControl.publishingControl.percentage}% - 
                                NPS: ${npsData ? npsData.publishing.toLocaleString() : '0'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-400">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Dale Play no controla</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-dale-navy-light rounded-lg p-3">
                          <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                            <span>RECORDING</span>
                          </h5>
                          {rightsControl.recordingControl ? (
                            <div className="flex items-center space-x-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">
                                Dale Play controla {rightsControl.recordingControl.percentage}% - 
                                NPS: ${npsData ? npsData.recording.toLocaleString() : '0'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-400">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Dale Play no controla</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cálculo de NPS */}
          {npsData && (
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-dale-emerald" />
                <span>Cálculo de NPS (Net Publisher Share)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dale-purple mb-2">
                    ${npsData.publishing.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Publishing NPS</div>
                  <div className="text-xs text-gray-500">
                    Budget: ${npsData.publishingBudget.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-dale-emerald mb-2">
                    ${npsData.recording.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Recording NPS</div>
                  <div className="text-xs text-gray-500">
                    Budget: ${npsData.recordingBudget.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    ${npsData.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Dale Play</div>
                  <div className="text-xs text-gray-500">
                    {npsData.percentage}% del budget
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-dale-amber mb-2">
                    ${npsData.budgetAllIn.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formData.mfn ? 'Budget All-in' : 'Budget Total'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.mfn ? 'MFN activado' : 'Sin MFN'}
                  </div>
                </div>
              </div>

              {formData.mfn && (
                <div className="p-4 bg-dale-amber bg-opacity-20 border border-dale-amber rounded-lg">
                  <p className="text-sm text-dale-amber">
                    <strong>MFN activado:</strong> Master y Publishing reciben el mismo monto. 
                    Budget all-in: ${npsData.budgetAllIn.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Descripción Adicional</h3>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
              rows={4}
              placeholder="Describe el proyecto, contexto de uso, notas especiales..."
            />
          </div>

          {/* Aprobaciones */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-dale-emerald" />
              <span>Gestión de Aprobaciones</span>
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-300 mb-2">
                    Selecciona los titulares que requieren aprobación para esta sincronización:
                  </p>
                  <p className="text-sm text-gray-400">
                    {formData.tipo_flow === 'INBOUND' && (
                      <span className="text-dale-red font-medium">
                        ⚠️ INBOUND: Se requieren aprobaciones urgentes
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTitulares}
                    className="px-3 py-2 bg-dale-emerald hover:bg-dale-emerald-dark rounded-lg text-white text-sm font-medium transition-colors duration-200"
                  >
                    Seleccionar Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllTitulares}
                    className="px-3 py-2 bg-dale-navy-lighter hover:bg-dale-navy-lighter border border-dale-navy-lighter rounded-lg text-white text-sm font-medium transition-colors duration-200"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>
            </div>

            {titulares.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay titulares registrados</p>
                <p className="text-sm">Primero debes crear titulares en la sección correspondiente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {titulares.map((titular) => (
                  <div
                    key={titular.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors duration-200 ${
                      selectedTitulares.includes(titular.id)
                        ? 'bg-dale-emerald bg-opacity-20 border-dale-emerald'
                        : 'bg-dale-navy-light border-dale-navy-lighter'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`titular-${titular.id}`}
                      checked={selectedTitulares.includes(titular.id)}
                      onChange={() => handleTitularToggle(titular.id)}
                      className="w-4 h-4 text-dale-emerald bg-dale-navy-light border-dale-navy-lighter rounded focus:ring-dale-emerald"
                    />
                    <label
                      htmlFor={`titular-${titular.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{titular.nombre}</div>
                          <div className="text-sm text-gray-400">
                            {titular.email} • {titular.tipo}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            {titular.porcentaje ? `${titular.porcentaje}%` : 'N/A'}
                          </div>
                          {titular.rol && (
                            <div className="text-xs text-gray-500">{titular.rol}</div>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedTitulares.length > 0 && (
              <div className="mt-6 p-4 bg-dale-emerald bg-opacity-20 border border-dale-emerald rounded-lg">
                <div className="flex items-center space-x-2 text-dale-emerald">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {selectedTitulares.length} titular{selectedTitulares.length !== 1 ? 'es' : ''} seleccionado{selectedTitulares.length !== 1 ? 's' : ''} para aprobación
                  </span>
                </div>
                <p className="text-sm text-dale-emerald mt-2">
                  Se enviarán emails de aprobación a todos los titulares seleccionados una vez que se cree la oportunidad.
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/opportunities')}
              className="px-6 py-3 bg-dale-navy-light border border-dale-navy-lighter rounded-lg text-white hover:bg-dale-navy-lighter transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedSong || isSubmitting}
              className="px-6 py-3 bg-dale-purple hover:bg-dale-purple-dark disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Oportunidad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
