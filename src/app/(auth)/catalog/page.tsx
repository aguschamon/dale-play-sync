'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Music, Disc, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Obra, Fonograma } from '@/types'
import ObraForm from '@/components/catalog/ObraForm'
import FonogramaForm from '@/components/catalog/FonogramaForm'

type SortField = 'nombre' | 'porcentaje_share_dp' | 'porcentaje_control_dp' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'obras' | 'fonogramas'>('obras')
  const [obras, setObras] = useState<Obra[]>([])
  const [fonogramas, setFonogramas] = useState<Fonograma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showObraForm, setShowObraForm] = useState(false)
  const [showFonogramaForm, setShowFonogramaForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'nombre',
    direction: 'asc'
  })

  useEffect(() => {
    fetchCatalogData()
  }, [])

  const fetchCatalogData = async () => {
    try {
      setIsLoading(true)
      const [obrasRes, fonogramasRes] = await Promise.all([
        fetch('/api/catalog/obras'),
        fetch('/api/catalog/fonogramas')
      ])

      if (obrasRes.ok && fonogramasRes.ok) {
        const obrasData = await obrasRes.json()
        const fonogramasData = await fonogramasRes.json()
        setObras(obrasData)
        setFonogramas(fonogramasData)
      }
    } catch (error) {
      console.error('Error fetching catalog data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortData = <T extends Record<string, any>>(data: T[], field: SortField, direction: SortDirection): T[] => {
    return [...data].sort((a, b) => {
      let aValue = a[field]
      let bValue = b[field]

      // Manejar fechas
      if (field === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Manejar strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredObras = obras.filter(obra =>
    obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (obra.iswc && obra.iswc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (obra.compositores && JSON.stringify(obra.compositores).toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredFonogramas = fonogramas.filter(fonograma =>
    fonograma.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fonograma.isrc && fonograma.isrc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (fonograma.artista_principal && fonograma.artista_principal.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedObras = sortData(filteredObras, sortConfig.field, sortConfig.direction)
  const sortedFonogramas = sortData(filteredFonogramas, 'nombre', 'asc')

  const handleObraSubmit = async (data: Partial<Obra>) => {
    try {
      const response = await fetch('/api/catalog/obras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const newObra = await response.json()
        setObras([...obras, newObra])
        setShowObraForm(false)
      }
    } catch (error) {
      console.error('Error creating obra:', error)
    }
  }

  const handleFonogramaSubmit = async (data: Partial<Fonograma>) => {
    try {
      const response = await fetch('/api/catalog/fonogramas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const newFonograma = await response.json()
        setFonogramas([...fonogramas, newFonograma])
        setShowFonogramaForm(false)
      }
    } catch (error) {
      console.error('Error creating fonograma:', error)
    }
  }

  const handleDeleteObra = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta obra?')) {
      try {
        const response = await fetch(`/api/catalog/obras/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setObras(obras.filter(obra => obra.id !== id))
        }
      } catch (error) {
        console.error('Error deleting obra:', error)
      }
    }
  }

  const handleDeleteFonograma = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este fonograma?')) {
      try {
        const response = await fetch(`/api/catalog/fonogramas/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setFonogramas(fonogramas.filter(fonograma => fonograma.id !== id))
        }
      } catch (error) {
        console.error('Error deleting fonograma:', error)
      }
    }
  }

  const formatCompositores = (compositores: any) => {
    if (!compositores) return 'N/A'
    
    try {
      const parsed = typeof compositores === 'string' ? JSON.parse(compositores) : compositores
      if (Array.isArray(parsed)) {
        return parsed.map((c: any) => `${c.nombre} (${c.porcentaje}%)`).join(', ')
      }
      return 'N/A'
    } catch {
      return 'N/A'
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-dale-purple" />
      : <ChevronDown className="w-4 h-4 text-dale-purple" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Catálogo Musical</h1>
            <p className="text-gray-400 mt-2">Gestiona obras y fonogramas de Dale Play</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowObraForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Obra</span>
            </button>
            <button
              onClick={() => setShowFonogramaForm(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Fonograma</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar obras, fonogramas, compositores, artistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dale-navy-light border border-dale-navy-lighter rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dale-purple focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-dale-navy-light p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('obras')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'obras'
                ? 'bg-dale-purple text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-dale-navy-lighter'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Obras ({obras.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fonogramas')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'fonogramas'
                ? 'bg-dale-purple text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-dale-navy-lighter'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Fonogramas ({fonogramas.length})</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'obras' ? (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dale-navy-lighter">
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <button
                        onClick={() => handleSort('nombre')}
                        className="flex items-center space-x-2 hover:text-white transition-colors"
                      >
                        <span>Obra</span>
                        {getSortIcon('nombre')}
                      </button>
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">ISWC</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Compositores</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Control DP</th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <button
                        onClick={() => handleSort('porcentaje_share_dp')}
                        className="flex items-center space-x-2 hover:text-white transition-colors"
                      >
                        <span>Share DP</span>
                        {getSortIcon('porcentaje_share_dp')}
                      </button>
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">Territorio</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Creada</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedObras.map((obra) => (
                    <tr key={obra.id} className="border-b border-dale-navy-lighter hover:bg-dale-navy-lighter transition-colors duration-200">
                      <td className="p-4">
                        <div className="font-medium text-white">{obra.nombre}</div>
                      </td>
                      <td className="p-4 text-gray-300 font-mono">{obra.iswc || 'N/A'}</td>
                      <td className="p-4 text-gray-300 max-w-xs">
                        <div className="text-sm leading-relaxed">
                          {formatCompositores(obra.compositores)}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{obra.porcentaje_control_dp}%</td>
                      <td className="p-4 text-gray-300">{obra.porcentaje_share_dp}%</td>
                      <td className="p-4 text-gray-300">{obra.territorio}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(obra.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* TODO: Implementar edición */}}
                            className="p-2 text-dale-blue hover:bg-dale-navy-lighter rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteObra(obra.id)}
                            className="p-2 text-dale-red hover:bg-dale-navy-lighter rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedObras.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron obras</p>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dale-navy-lighter">
                    <th className="text-left p-4 text-gray-300 font-medium">Fonograma</th>
                    <th className="text-left p-4 text-gray-300 font-medium">ISRC</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Artista Principal</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Sello</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Control DP</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Año</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Creado</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFonogramas.map((fonograma) => (
                    <tr key={fonograma.id} className="border-b border-dale-navy-lighter hover:bg-dale-navy-lighter transition-colors duration-200">
                      <td className="p-4">
                        <div className="font-medium text-white">{fonograma.nombre}</div>
                      </td>
                      <td className="p-4 text-gray-300 font-mono">{fonograma.isrc || 'N/A'}</td>
                      <td className="p-4 text-gray-300">{fonograma.artista_principal}</td>
                      <td className="p-4 text-gray-300">{fonograma.sello}</td>
                      <td className="p-4 text-gray-300">{fonograma.porcentaje_dp}%</td>
                      <td className="p-4 text-gray-300">{fonograma.año_lanzamiento}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(fonograma.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* TODO: Implementar edición */}}
                            className="p-2 text-dale-blue hover:bg-dale-navy-lighter rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFonograma(fonograma.id)}
                            className="p-2 text-dale-red hover:bg-dale-navy-lighter rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedFonogramas.length === 0 && (
              <div className="text-center py-12">
                <Disc className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron fonogramas</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forms */}
      {showObraForm && (
        <ObraForm
          onClose={() => setShowObraForm(false)}
          onSubmit={handleObraSubmit}
        />
      )}

      {showFonogramaForm && (
        <FonogramaForm
          obras={obras}
          onClose={() => setShowFonogramaForm(false)}
          onSubmit={handleFonogramaSubmit}
        />
      )}
    </>
  )
}
