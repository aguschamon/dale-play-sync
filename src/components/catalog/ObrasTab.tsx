'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { Obra } from '@/types'
import ObraForm from './ObraForm'
import ObraTable from './ObraTable'

export default function ObrasTab() {
  const [obras, setObras] = useState<Obra[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingObra, setEditingObra] = useState<Obra | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch obras on component mount
  useEffect(() => {
    fetchObras()
  }, [])

  const fetchObras = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/catalog/obras')
      if (response.ok) {
        const data = await response.json()
        setObras(data)
      }
    } catch (error) {
      console.error('Error fetching obras:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateObra = async (obraData: Partial<Obra>) => {
    try {
      const response = await fetch('/api/catalog/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obraData),
      })

      if (response.ok) {
        await fetchObras()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating obra:', error)
    }
  }

  const handleUpdateObra = async (id: string, obraData: Partial<Obra>) => {
    try {
      const response = await fetch(`/api/catalog/obras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obraData),
      })

      if (response.ok) {
        await fetchObras()
        setEditingObra(null)
      }
    } catch (error) {
      console.error('Error updating obra:', error)
    }
  }

  const handleDeleteObra = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta obra?')) return

    try {
      const response = await fetch(`/api/catalog/obras/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchObras()
      }
    } catch (error) {
      console.error('Error deleting obra:', error)
    }
  }

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra)
    setIsFormOpen(true)
  }

  const filteredObras = obras.filter(obra =>
    obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.iswc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.territorio?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar obras..."
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
            setEditingObra(null)
            setIsFormOpen(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Obra</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Total Obras</p>
            <p className="text-2xl font-bold text-white">{obras.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Con ISWC</p>
            <p className="text-2xl font-bold text-white">
              {obras.filter(o => o.iswc).length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Territorio Mundial</p>
            <p className="text-2xl font-bold text-white">
              {obras.filter(o => o.territorio === 'Mundial').length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Promedio Control DP</p>
            <p className="text-2xl font-bold text-white">
              {obras.length > 0 
                ? Math.round(obras.reduce((sum, o) => sum + o.porcentaje_control_dp, 0) / obras.length)
                : 0
              }%
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <ObraTable
        obras={filteredObras}
        onEdit={handleEdit}
        onDelete={handleDeleteObra}
        isLoading={isLoading}
      />

      {/* Form Modal */}
      {isFormOpen && (
        <ObraForm
          obra={editingObra}
          onSubmit={async (data: Partial<Obra>) => {
            if (editingObra) {
              await handleUpdateObra(editingObra.id, data)
            } else {
              await handleCreateObra(data)
            }
          }}
          onClose={() => {
            setIsFormOpen(false)
            setEditingObra(null)
          }}
        />
      )}
    </div>
  )
}
