'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Obra } from '@/types'

interface Composer {
  nombre: string
  porcentaje: number
}

interface ObraFormProps {
  obra?: Obra | null
  onSubmit: (data: Partial<Obra>) => void
  onClose: () => void
}

export default function ObraForm({ obra, onSubmit, onClose }: ObraFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    iswc: '',
    porcentaje_control_dp: 0,
    porcentaje_share_dp: 0,
    compositores: [] as Composer[],
    territorio: 'Mundial'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (obra) {
      setFormData({
        nombre: obra.nombre,
        iswc: obra.iswc || '',
        porcentaje_control_dp: obra.porcentaje_control_dp,
        porcentaje_share_dp: obra.porcentaje_share_dp,
        compositores: typeof obra.compositores === 'string' ? JSON.parse(obra.compositores) : (obra.compositores || []),
        territorio: obra.territorio || 'Mundial'
      })
    }
  }, [obra])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la obra es requerido'
    }

    if (formData.porcentaje_control_dp < 0 || formData.porcentaje_control_dp > 100) {
      newErrors.porcentaje_control_dp = 'El porcentaje debe estar entre 0 y 100'
    }

    if (formData.porcentaje_share_dp < 0 || formData.porcentaje_share_dp > 100) {
      newErrors.porcentaje_share_dp = 'El porcentaje debe estar entre 0 y 100'
    }

    if (formData.compositores.length === 0) {
      newErrors.compositores = 'Debe agregar al menos un compositor'
    }

    const totalComposerPercentage = formData.compositores.reduce((sum, c) => sum + c.porcentaje, 0)
    if (totalComposerPercentage !== 100) {
      newErrors.compositores = 'La suma de porcentajes de compositores debe ser 100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const obraData = {
      ...formData,
      compositores: formData.compositores
    }

    if (obra) {
      onSubmit({ ...obraData, id: obra.id })
    } else {
      onSubmit(obraData)
    }
  }

  const addComposer = () => {
    setFormData(prev => ({
      ...prev,
      compositores: [...prev.compositores, { nombre: '', porcentaje: 0 }]
    }))
  }

  const updateComposer = (index: number, field: keyof Composer, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      compositores: prev.compositores.map((composer, i) =>
        i === index ? { ...composer, [field]: value } : composer
      )
    }))
  }

  const removeComposer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      compositores: prev.compositores.filter((_, i) => i !== index)
    }))
  }

  const territorios = [
    'Mundial',
    'LATAM',
    'Estados Unidos',
    'Europa',
    'Asia',
    'África',
    'Oceanía'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dale-gray rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {obra ? 'Editar Obra' : 'Nueva Obra'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Obra *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className={`input-field w-full ${errors.nombre ? 'border-red-500' : ''}`}
              placeholder="Ej: Bzrp Music Sessions #52"
            />
            {errors.nombre && (
              <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* ISWC */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ISWC (opcional)
            </label>
            <input
              type="text"
              value={formData.iswc}
              onChange={(e) => setFormData(prev => ({ ...prev, iswc: e.target.value }))}
              className="input-field w-full"
              placeholder="Ej: T-123456789-0"
            />
          </div>

          {/* Porcentajes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Porcentaje Control Dale Play *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.porcentaje_control_dp}
                onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_control_dp: parseFloat(e.target.value) || 0 }))}
                className={`input-field w-full ${errors.porcentaje_control_dp ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.porcentaje_control_dp && (
                <p className="text-red-400 text-sm mt-1">{errors.porcentaje_control_dp}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Porcentaje Share Dale Play *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.porcentaje_share_dp}
                onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_share_dp: parseFloat(e.target.value) || 0 }))}
                className={`input-field w-full ${errors.porcentaje_share_dp ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.porcentaje_share_dp && (
                <p className="text-red-400 text-sm mt-1">{errors.porcentaje_share_dp}</p>
              )}
            </div>
          </div>

          {/* Territorio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Territorio
            </label>
            <select
              value={formData.territorio}
              onChange={(e) => setFormData(prev => ({ ...prev, territorio: e.target.value }))}
              className="input-field w-full"
            >
              {territorios.map(territorio => (
                <option key={territorio} value={territorio}>
                  {territorio}
                </option>
              ))}
            </select>
          </div>

          {/* Compositores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Compositores *
              </label>
              <button
                type="button"
                onClick={addComposer}
                className="text-dale-green hover:text-dale-green-light text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.compositores.map((composer, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={composer.nombre}
                    onChange={(e) => updateComposer(index, 'nombre', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Nombre del compositor"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={composer.porcentaje}
                    onChange={(e) => updateComposer(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                    className="input-field w-24"
                    placeholder="%"
                  />
                  <button
                    type="button"
                    onClick={() => removeComposer(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {errors.compositores && (
              <p className="text-red-400 text-sm mt-1">{errors.compositores}</p>
            )}

            {formData.compositores.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                Total: {formData.compositores.reduce((sum, c) => sum + c.porcentaje, 0)}%
              </div>
            )}
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
              {obra ? 'Actualizar' : 'Crear'} Obra
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

