'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Users, Edit, Trash2, Eye, Music, Disc3 } from 'lucide-react'

interface Titular {
  id: string
  nombre: string
  email: string
  telefono?: string
  tipo: string
  notas?: string
  createdAt: string
  updatedAt: string
  _count: {
    obras: number
    fonogramas: number
    aprobaciones: number
  }
}

export default function TitularesPage() {
  const router = useRouter()
  const [titulares, setTitulares] = useState<Titular[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filteredTitulares, setFilteredTitulares] = useState<Titular[]>([])

  useEffect(() => {
    fetchTitulares()
  }, [])

  useEffect(() => {
    filterTitulares()
  }, [searchQuery, titulares])

  const fetchTitulares = async () => {
    try {
      const response = await fetch('/api/titulares')
      if (response.ok) {
        const data = await response.json()
        setTitulares(data)
      }
    } catch (error) {
      console.error('Error fetching titulares:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTitulares = () => {
    if (!searchQuery.trim()) {
      setFilteredTitulares(titulares)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = titulares.filter(titular =>
      titular.nombre.toLowerCase().includes(query) ||
      titular.email.toLowerCase().includes(query) ||
      titular.tipo.toLowerCase().includes(query)
    )
    setFilteredTitulares(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este titular?')) {
      return
    }

    try {
      const response = await fetch(`/api/titulares/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTitulares(prev => prev.filter(t => t.id !== id))
      } else {
        alert('Error al eliminar el titular')
      }
    } catch (error) {
      console.error('Error deleting titular:', error)
      alert('Error al eliminar el titular')
    }
  }

  const getTipoColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      'AUTOR': 'bg-blue-500',
      'COMPOSITOR': 'bg-green-500',
      'ARTISTA': 'bg-purple-500',
      'PRODUCTOR': 'bg-orange-500',
      'EDITOR': 'bg-red-500',
      'SELLO': 'bg-gray-500'
    }
    return colors[tipo] || 'bg-gray-500'
  }

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
            <Users className="w-8 h-8 text-dale-purple" />
            <div>
              <h1 className="text-3xl font-bold text-white">Titulares</h1>
              <p className="text-gray-400 mt-2">Gestiona todos los titulares de derechos musicales</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/titulares/new')}
            className="px-6 py-3 bg-dale-purple hover:bg-dale-purple-dark rounded-lg text-white font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Titular</span>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
              placeholder="Buscar por nombre, email o tipo..."
            />
          </div>
        </div>

        {/* Lista de Titulares */}
        <div className="bg-dale-navy-light rounded-lg border border-dale-navy-lighter overflow-hidden">
          {filteredTitulares.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {searchQuery ? 'No se encontraron titulares' : 'No hay titulares registrados'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Comienza creando el primer titular'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dale-navy-lighter">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Titular
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Derechos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Aprobaciones
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dale-navy-lighter">
                  {filteredTitulares.map((titular) => (
                    <tr key={titular.id} className="hover:bg-dale-navy-lighter transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{titular.nombre}</div>
                          {titular.notas && (
                            <div className="text-sm text-gray-400 mt-1">{titular.notas}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${getTipoColor(titular.tipo)}`}>
                          {titular.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">{titular.email}</div>
                          {titular.telefono && (
                            <div className="text-gray-400">{titular.telefono}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-dale-purple">
                            <Music className="w-4 h-4" />
                            <span>{titular._count.obras}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-dale-emerald">
                            <Disc3 className="w-4 h-4" />
                            <span>{titular._count.fonogramas}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            titular._count.aprobaciones > 0 
                              ? 'bg-dale-amber text-white' 
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {titular._count.aprobaciones} {titular._count.aprobaciones === 1 ? 'pendiente' : 'pendientes'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/titulares/${titular.id}`)}
                            className="text-dale-emerald hover:text-dale-emerald-light transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/titulares/${titular.id}/edit`)}
                            className="text-dale-purple hover:text-dale-purple-light transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(titular.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
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
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-purple rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Titulares</p>
                <p className="text-2xl font-bold text-white">{titulares.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-emerald rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Obras</p>
                <p className="text-2xl font-bold text-white">
                  {titulares.reduce((sum, t) => sum + t._count.obras, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-amber rounded-lg">
                <Disc3 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Fonogramas</p>
                <p className="text-2xl font-bold text-white">
                  {titulares.reduce((sum, t) => sum + t._count.fonogramas, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-dale-red rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aprobaciones Pendientes</p>
                <p className="text-2xl font-bold text-white">
                  {titulares.reduce((sum, t) => sum + t._count.aprobaciones, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
