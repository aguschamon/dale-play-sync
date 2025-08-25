'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Fonograma, Obra } from '@/types'

interface FeaturedArtist {
  nombre: string
  rol?: string
}

interface FonogramaFormProps {
  fonograma?: Fonograma | null
  obras: Obra[]
  onSubmit: (data: Partial<Fonograma>) => void
  onClose: () => void
}

export default function FonogramaForm({ fonograma, obras, onSubmit, onClose }: FonogramaFormProps) {
  const [formData, setFormData] = useState({
    obraId: '',
    nombre: '',
    isrc: '',
    porcentaje_dp: 0,
    artista_principal: '',
    featured_artists: [] as FeaturedArtist[],
    sello: 'Dale Play Records',
    anio_lanzamiento: new Date().getFullYear()
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (fonograma) {
      setFormData({
        obraId: fonograma.obraId,
        nombre: fonograma.nombre,
        isrc: fonograma.isrc || '',
        porcentaje_dp: fonograma.porcentaje_dp,
        artista_principal: fonograma.artista_principal,
        featured_artists: fonograma.featured_artists ? JSON.parse(fonograma.featured_artists) : [],
        sello: fonograma.sello || 'Dale Play Records',
        anio_lanzamiento: fonograma.anio_lanzamiento || new Date().getFullYear()
      })
    }
  }, [fonograma])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.obraId) {
      newErrors.obraId = 'Debe seleccionar una obra'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del fonograma es requerido'
    }

    if (formData.porcentaje_dp < 0 || formData.porcentaje_dp > 100) {
      newErrors.porcentaje_dp = 'El porcentaje debe estar entre 0 y 100'
    }

    if (!formData.artista_principal.trim()) {
      newErrors.artista_principal = 'El artista principal es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const fonogramaData = {
      ...formData,
      featured_artists: JSON.stringify(formData.featured_artists)
    }

    if (fonograma) {
      onSubmit(fonograma.id, fonogramaData)
    } else {
      onSubmit(fonogramaData)
    }
  }

  const addFeaturedArtist = () => {
    setFormData(prev => ({
      ...prev,
      featured_artists: [...prev.featured_artists, { nombre: '', rol: '' }]
    }))
  }

  const updateFeaturedArtist = (index: number, field: keyof FeaturedArtist, value: string) => {
    setFormData(prev => ({
      ...prev,
      featured_artists: prev.featured_artists.map((artist, i) =>
        i === index ? { ...artist, [field]: value } : artist
      )
    }))
  }

  const removeFeaturedArtist = (index: number) => {
    setFormData(prev => ({
      ...prev,
      featured_artists: prev.featured_artists.filter((_, i) => i !== index)
    }))
  }

  const sellos = [
    'Dale Play Records',
    'Universal Music',
    'Sony Music',
    'Warner Music',
    'EMI',
    'Independiente',
    'Otro'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dale-gray rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {fonograma ? 'Editar Fonograma' : 'Nuevo Fonograma'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Obra Asociada */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Obra Asociada *
            </label>
            <select
              value={formData.obraId}
              onChange={(e) => setFormData(prev => ({ ...prev, obraId: e.target.value }))}
              className={`input-field w-full ${errors.obraId ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar obra</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
            {errors.obraId && (
              <p className="text-red-400 text-sm mt-1">{errors.obraId}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Fonograma *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className={`input-field w-full ${errors.nombre ? 'border-red-500' : ''}`}
              placeholder="Ej: Bzrp Music Sessions #52 - Quevedo"
            />
            {errors.nombre && (
              <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* ISRC */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ISRC (opcional)
            </label>
            <input
              type="text"
              value={formData.isrc}
              onChange={(e) => setFormData(prev => ({ ...prev, isrc: e.target.value }))}
              className="input-field w-full"
              placeholder="Ej: ARF011234567"
            />
          </div>

          {/* Porcentaje DP */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Porcentaje Dale Play *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.porcentaje_dp}
              onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_dp: parseFloat(e.target.value) || 0 }))}
              className={`input-field w-full ${errors.porcentaje_dp ? 'border-red-500' : ''}`}
              placeholder="0-100"
            />
            {errors.porcentaje_dp && (
              <p className="text-red-400 text-sm mt-1">{errors.porcentaje_dp}</p>
            )}
          </div>

          {/* Artista Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artista Principal *
            </label>
            <input
              type="text"
              value={formData.artista_principal}
              onChange={(e) => setFormData(prev => ({ ...prev, artista_principal: e.target.value }))}
              className={`input-field w-full ${errors.artista_principal ? 'border-red-500' : ''}`}
              placeholder="Ej: Bizarrap"
            />
            {errors.artista_principal && (
              <p className="text-red-400 text-sm mt-1">{errors.artista_principal}</p>
            )}
          </div>

          {/* Featured Artists */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Featured Artists
              </label>
              <button
                type="button"
                onClick={addFeaturedArtist}
                className="text-dale-green hover:text-dale-green-light text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.featured_artists.map((artist, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={artist.nombre}
                    onChange={(e) => updateFeaturedArtist(index, 'nombre', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Nombre del artista"
                  />
                  <input
                    type="text"
                    value={artist.rol || ''}
                    onChange={(e) => updateFeaturedArtist(index, 'rol', e.target.value)}
                    className="input-field w-32"
                    placeholder="Rol (opcional)"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeaturedArtist(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sello y Año */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sello
              </label>
              <select
                value={formData.sello}
                onChange={(e) => setFormData(prev => ({ ...prev, sello: e.target.value }))}
                className="input-field w-full"
              >
                {sellos.map(sello => (
                  <option key={sello} value={sello}>
                    {sello}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Año de Lanzamiento
              </label>
              <select
                value={formData.anio_lanzamiento}
                onChange={(e) => setFormData(prev => ({ ...prev, anio_lanzamiento: parseInt(e.target.value) }))}
                className="input-field w-full"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dale-gray-light">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {fonograma ? 'Actualizar' : 'Crear'} Fonograma
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

