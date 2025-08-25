'use client'

import { Edit, Trash2, Disc3, ExternalLink, Music } from 'lucide-react'
import { Fonograma, Obra } from '@/types'
import { formatDate } from '@/lib/utils'

interface FonogramaTableProps {
  fonogramas: Fonograma[]
  obras: Obra[]
  onEdit: (fonograma: Fonograma) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export default function FonogramaTable({ fonogramas, obras, onEdit, onDelete, isLoading }: FonogramaTableProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dale-gray-light rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-dale-gray-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (fonogramas.length === 0) {
    return (
      <div className="card text-center py-12">
        <Disc3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No hay fonogramas registrados</h3>
        <p className="text-gray-400">Comienza creando tu primer fonograma musical</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dale-gray-light">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Fonograma</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Obra</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">ISRC</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Artista</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">% DP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Sello</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Año</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dale-gray-light">
            {fonogramas.map((fonograma) => {
              const obra = obras.find(o => o.id === fonograma.obraId)
              const featuredArtists = fonograma.featured_artists ? JSON.parse(fonograma.featured_artists) : []
              
              return (
                <tr key={fonograma.id} className="hover:bg-dale-gray-light transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-white">{fonograma.nombre}</div>
                      <div className="text-sm text-gray-400">ID: {fonograma.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {obra ? (
                      <div className="flex items-center space-x-2">
                        <Music className="w-4 h-4 text-dale-green" />
                        <span className="text-sm text-white">{obra.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Obra no encontrada</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    {fonograma.isrc ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white font-mono">{fonograma.isrc}</span>
                        <button className="text-dale-green hover:text-dale-green-light">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin ISRC</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-white">
                        {fonograma.artista_principal}
                      </div>
                      {featuredArtists.length > 0 && (
                        <div className="text-xs text-gray-400">
                          + {featuredArtists.length} featured
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {fonograma.porcentaje_dp}%
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`text-sm ${
                      fonograma.sello === 'Dale Play Records' 
                        ? 'text-dale-green font-medium' 
                        : 'text-white'
                    }`}>
                      {fonograma.sello}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-400">
                      {fonograma.anio_lanzamiento}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(fonograma)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(fonograma.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-dale-gray-light">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Total: {fonogramas.length} fonogramas</span>
          <span>Mostrando {fonogramas.length} de {fonogramas.length} resultados</span>
        </div>
      </div>
    </div>
  )
}

