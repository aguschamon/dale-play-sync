'use client'

import { Edit, Trash2, Music, ExternalLink } from 'lucide-react'
import { Obra } from '@/types'
import { formatDate } from '@/lib/utils'

interface ObraTableProps {
  obras: Obra[]
  onEdit: (obra: Obra) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export default function ObraTable({ obras, onEdit, onDelete, isLoading }: ObraTableProps) {
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

  if (obras.length === 0) {
    return (
      <div className="card text-center py-12">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No hay obras registradas</h3>
        <p className="text-gray-400">Comienza creando tu primera obra musical</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dale-gray-light">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Obra</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">ISWC</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Control DP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Share DP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Territorio</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Compositores</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Creada</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dale-gray-light">
            {obras.map((obra) => {
              const compositores = typeof obra.compositores === 'string' ? JSON.parse(obra.compositores) : (obra.compositores || [])
              
              return (
                <tr key={obra.id} className="hover:bg-dale-gray-light transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-white">{obra.nombre}</div>
                      <div className="text-sm text-gray-400">ID: {obra.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {obra.iswc ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white font-mono">{obra.iswc}</span>
                        <button className="text-dale-green hover:text-dale-green-light">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin ISWC</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {obra.porcentaje_control_dp}%
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {obra.porcentaje_share_dp}%
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-sm text-white">{obra.territorio || 'Mundial'}</span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {compositores.slice(0, 2).map((composer: any, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="text-white">{composer.nombre}</span>
                          <span className="text-gray-400 ml-2">{composer.porcentaje}%</span>
                        </div>
                      ))}
                      {compositores.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{compositores.length - 2} más
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-400">
                      {formatDate(obra.createdAt)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(obra)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(obra.id)}
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
          <span>Total: {obras.length} obras</span>
          <span>Mostrando {obras.length} de {obras.length} resultados</span>
        </div>
      </div>
    </div>
  )
}

