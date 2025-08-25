'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter, Disc3 } from 'lucide-react'
import { Fonograma, Obra } from '@/types'
import FonogramaForm from './FonogramaForm'
import FonogramaTable from './FonogramaTable'

export default function FonogramasTab() {
  const [fonogramas, setFonogramas] = useState<Fonograma[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFonograma, setEditingFonograma] = useState<Fonograma | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [fonogramasRes, obrasRes] = await Promise.all([
        fetch('/api/catalog/fonogramas'),
        fetch('/api/catalog/obras')
      ])

      if (fonogramasRes.ok) {
        const fonogramasData = await fonogramasRes.json()
        setFonogramas(fonogramasData)
      }

      if (obrasRes.ok) {
        const obrasData = await obrasRes.json()
        setObras(obrasData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFonograma = async (fonogramaData: Partial<Fonograma>) => {
    try {
      const response = await fetch('/api/catalog/fonogramas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fonogramaData),
      })

      if (response.ok) {
        await fetchData()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating fonograma:', error)
    }
  }

  const handleUpdateFonograma = async (id: string, fonogramaData: Partial<Fonograma>) => {
    try {
      const response = await fetch(`/api/catalog/fonogramas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fonogramaData),
      })

      if (response.ok) {
        await fetchData()
        setEditingFonograma(null)
      }
    } catch (error) {
      console.error('Error updating fonograma:', error)
    }
  }

  const handleDeleteFonograma = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este fonograma?')) return

    try {
      const response = await fetch(`/api/catalog/fonogramas/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting fonograma:', error)
    }
  }

  const handleEdit = (fonograma: Fonograma) => {
    setEditingFonograma(fonograma)
    setIsFormOpen(true)
  }

  const filteredFonogramas = fonogramas.filter(fonograma => {
    const obra = obras.find(o => o.id === fonograma.obraId)
    return (
      fonograma.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonograma.isrc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonograma.artista_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar fonogramas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dale-gray-light border border-dale-gray-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dale-green focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-dale-gray-light rounded-lg transition-colors duration-200">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
        
        <button
          onClick={() => {
            setEditingFonograma(null)
            setIsFormOpen(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Fonograma</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Total Fonogramas</p>
            <p className="text-2xl font-bold text-white">{fonogramas.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Con ISRC</p>
            <p className="text-2xl font-bold text-white">
              {fonogramas.filter(f => f.isrc).length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Dale Play Records</p>
            <p className="text-2xl font-bold text-white">
              {fonogramas.filter(f => f.sello === 'Dale Play Records').length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Promedio DP</p>
            <p className="text-2xl font-bold text-white">
              {fonogramas.length > 0 
                ? Math.round(fonogramas.reduce((sum, f) => sum + f.porcentaje_dp, 0) / fonogramas.length)
                : 0
              }%
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <FonogramaTable
        fonogramas={filteredFonogramas}
        obras={obras}
        onEdit={handleEdit}
        onDelete={handleDeleteFonograma}
        isLoading={isLoading}
      />

      {/* Form Modal */}
      {isFormOpen && (
        <FonogramaForm
          fonograma={editingFonograma}
          obras={obras}
          onSubmit={editingFonograma ? handleUpdateFonograma : handleCreateFonograma}
          onClose={() => {
            setIsFormOpen(false)
            setEditingFonograma(null)
          }}
        />
      )}
    </div>
  )
}

