'use client'
import { Trash2, Music, Disc3 } from 'lucide-react'
import { Oportunidad, OportunidadCancion } from '@/types'
import { formatCurrency, calculateNPS } from '@/lib/utils'

interface SongsTableProps {
  songs: OportunidadCancion[]
  opportunity: Oportunidad
  onDeleteSong: (songId: string) => void
}

export default function SongsTable({ songs, opportunity, onDeleteSong }: SongsTableProps) {
  const getNPSBreakdown = (song: OportunidadCancion) => {
    const budget = song.budget_cancion || (opportunity.budget || 0) / Math.max(songs.length, 1)
    
    const publishingNPS = (budget * 0.5) * ((song.obra?.porcentaje_share_dp || 0) / 100)
    const recordingNPS = (budget * 0.5) * ((song.fonograma?.porcentaje_dp || 0) / 100)
    
    const totalDP = publishingNPS + recordingNPS
    const percentage = (totalDP / budget) * 100
    
    return {
      publishingNPS,
      recordingNPS,
      totalDP,
      percentage
    }
  }

  const totalBudget = songs.reduce((sum, song) => 
    sum + (song.budget_cancion || (opportunity.budget || 0) / Math.max(songs.length, 1)), 0
  )
  
  const totalDalePlay = songs.reduce((sum, song) => {
    const nps = getNPSBreakdown(song)
    return sum + nps.totalDP
  }, 0)

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{songs.length}</div>
          <div className="text-sm text-gray-400">Canciones</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-white truncate max-w-[150px]">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-400">Budget Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-dale-green">{formatCurrency(totalDalePlay)}</div>
          <div className="text-sm text-gray-400">Total Dale Play</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {totalBudget > 0 ? ((totalDalePlay / totalBudget) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-sm text-gray-400">Porcentaje DP</div>
        </div>
      </div>

      {/* Songs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dale-gray-light">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Canción</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Budget</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Publishing NPS</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Recording NPS</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Total Dale Play</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const nps = getNPSBreakdown(song)
              const budget = song.budget_cancion || (opportunity.budget || 0) / Math.max(songs.length, 1)
              
              return (
                <tr key={song.id} className="border-b border-dale-gray-light hover:bg-dale-gray-light transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Music className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-medium text-white">{song.obra?.nombre}</div>
                          <div className="text-sm text-gray-400">
                            Control: {song.obra?.porcentaje_control_dp}% | Share: {song.obra?.porcentaje_share_dp}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {song.fonograma && (
                      <div className="flex items-center space-x-2 mt-2 ml-6">
                        <Disc3 className="w-4 h-4 text-green-400" />
                        <div className="text-sm text-gray-400">
                          {song.fonograma.nombre} • {song.fonograma.artista_principal} • {song.fonograma.porcentaje_dp}% DP
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-white font-medium truncate max-w-[100px]">{formatCurrency(budget)}</div>
                    {song.budget_cancion && (
                      <div className="text-xs text-gray-400">Específico</div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-blue-400 font-medium">{formatCurrency(nps.publishingNPS)}</div>
                    <div className="text-xs text-gray-400">
                      {song.obra?.porcentaje_share_dp}% del 50%
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {song.fonograma ? (
                      <>
                        <div className="text-green-400 font-medium">{formatCurrency(nps.recordingNPS)}</div>
                        <div className="text-xs text-gray-400">
                          {song.fonograma.porcentaje_dp}% del 50%
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm">Sin fonograma</div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-dale-green font-medium">{formatCurrency(nps.totalDP)}</div>
                    <div className="text-xs text-gray-400">{nps.percentage.toFixed(1)}% del budget</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <button
                      onClick={() => onDeleteSong(song.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Eliminar canción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Row */}
      <div className="mt-6 p-4 bg-dale-gray-light rounded-lg">
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div className="text-gray-400">Total:</div>
          <div className="text-white font-medium truncate max-w-[120px]">{formatCurrency(totalBudget)}</div>
          <div className="text-blue-400 font-medium">
            {formatCurrency(songs.reduce((sum, song) => {
              const budget = song.budget_cancion || (opportunity.budget || 0) / Math.max(songs.length, 1)
              return sum + ((budget * 0.5) * ((song.obra?.porcentaje_share_dp || 0) / 100))
            }, 0))}
          </div>
          <div className="text-green-400 font-medium">
            {formatCurrency(songs.reduce((sum, song) => {
              const budget = song.budget_cancion || (opportunity.budget || 0) / Math.max(songs.length, 1)
              return sum + ((budget * 0.5) * ((song.fonograma?.porcentaje_dp || 0) / 100))
            }, 0))}
          </div>
          <div className="text-dale-green font-medium">{formatCurrency(totalDalePlay)}</div>
        </div>
      </div>
    </div>
  )
}
