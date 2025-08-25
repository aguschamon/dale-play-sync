'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { generateOpportunityCode } from '@/lib/utils'

interface OpportunityFormProps {
  opportunity?: Oportunidad | null
  clients: Cliente[]
  onSubmit: (data: Partial<Oportunidad>) => void
  onClose: () => void
}

export default function OpportunityForm({ opportunity, clients, onSubmit, onClose }: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    tipo_flow: 'OUTBOUND',
    clienteId: '',
    proyecto: '',
    tipo_proyecto: 'SERIE',
    territorio: 'Mundial',
    duracion_licencia: '',
    tipo_uso: '',
    budget: 0,
    mfn: false,
    deadline: '',
    descripcion: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (opportunity) {
      setFormData({
        codigo: opportunity.codigo,
        tipo_flow: opportunity.tipo_flow,
        clienteId: opportunity.clienteId,
        proyecto: opportunity.proyecto,
        tipo_proyecto: opportunity.tipo_proyecto,
        territorio: opportunity.territorio || 'Mundial',
        duracion_licencia: opportunity.duracion_licencia || '',
        tipo_uso: opportunity.tipo_uso || '',
        budget: opportunity.budget || 0,
        mfn: opportunity.mfn || false,
        deadline: opportunity.deadline ? new Date(opportunity.deadline).toISOString().split('T')[0] : '',
        descripcion: ''
      })
    } else {
      // Generar código automático para nuevas oportunidades
      setFormData(prev => ({
        ...prev,
        codigo: generateOpportunityCode()
      }))
    }
  }, [opportunity])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debe seleccionar un cliente'
    }

    if (!formData.proyecto.trim()) {
      newErrors.proyecto = 'El nombre del proyecto es requerido'
    }

    if (formData.budget < 0) {
      newErrors.budget = 'El budget no puede ser negativo'
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      newErrors.deadline = 'El deadline no puede ser en el pasado'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Determinar estado inicial según el tipo de flow
    let estadoInicial = 'PITCHING'
    if (formData.tipo_flow === 'INBOUND') {
      estadoInicial = 'APPROVAL'
    }

    const opportunityData = {
      ...formData,
      estado: estadoInicial,
      budget: parseFloat(formData.budget.toString()) || 0,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      metadata: formData.descripcion ? JSON.stringify({ descripcion: formData.descripcion }) : null
    }

    if (opportunity) {
      onSubmit(opportunity.id, opportunityData)
    } else {
      onSubmit(opportunityData)
    }
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

  const tiposProyecto = [
    { value: 'SERIE', label: 'Serie' },
    { value: 'PELICULA', label: 'Película' },
    { value: 'PUBLICIDAD', label: 'Publicidad' },
    { value: 'VIDEOJUEGO', label: 'Videojuego' }
  ]

  const duracionesLicencia = [
    '1 año',
    '2 años',
    '3 años',
    '5 años',
    '10 años',
    'Perpetua',
    'Otro'
  ]

  const tiposUso = [
    'Opening/Closing',
    'Background',
    'Montage',
    'Trailer',
    'Promo',
    'Otro'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dale-gray rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                className="input-field w-full"
                placeholder="OPP-2025-0001"
                readOnly={!!opportunity}
              />
            </div>

            {/* Tipo de Flow */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Flow *
              </label>
              <select
                value={formData.tipo_flow}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_flow: e.target.value }))}
                className="input-field w-full"
              >
                <option value="OUTBOUND">Outbound (Proactivo)</option>
                <option value="INBOUND">Inbound (Solicitud Directa)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {formData.tipo_flow === 'INBOUND' ? 'Estado inicial: APPROVAL' : 'Estado inicial: PITCHING'}
              </p>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clienteId}
                onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                className={`input-field w-full ${errors.clienteId ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nombre}
                  </option>
                ))}
              </select>
              {errors.clienteId && (
                <p className="text-red-400 text-sm mt-1">{errors.clienteId}</p>
              )}
            </div>
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proyecto *
              </label>
              <input
                type="text"
                value={formData.proyecto}
                onChange={(e) => setFormData(prev => ({ ...prev, proyecto: e.target.value }))}
                className={`input-field w-full ${errors.proyecto ? 'border-red-500' : ''}`}
                placeholder="Ej: Stranger Things S5, Super Bowl 2025, FIFA 26"
              />
              {errors.proyecto && (
                <p className="text-red-400 text-sm mt-1">{errors.proyecto}</p>
              )}
            </div>

            {/* Tipo de Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Proyecto
              </label>
              <select
                value={formData.tipo_proyecto}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_proyecto: e.target.value }))}
                className="input-field w-full"
              >
                {tiposProyecto.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tercera fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Duración de Licencia */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duración de Licencia
              </label>
              <select
                value={formData.duracion_licencia}
                onChange={(e) => setFormData(prev => ({ ...prev, duracion_licencia: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Seleccionar duración</option>
                {duracionesLicencia.map(duracion => (
                  <option key={duracion} value={duracion}>
                    {duracion}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Uso */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Uso
              </label>
              <select
                value={formData.tipo_uso}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_uso: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Seleccionar tipo</option>
                {tiposUso.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuarta fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget (USD)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                className={`input-field w-full ${errors.budget ? 'border-red-500' : ''}`}
                placeholder="30000"
              />
              {errors.budget && (
                <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* MFN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                MFN (Most Favored Nation)
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mfn"
                    value="true"
                    checked={formData.mfn === true}
                    onChange={() => setFormData(prev => ({ ...prev, mfn: true }))}
                    className="mr-2 text-dale-green focus:ring-dale-green"
                  />
                  <span className="text-sm">Sí</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mfn"
                    value="false"
                    checked={formData.mfn === false}
                    onChange={() => setFormData(prev => ({ ...prev, mfn: false }))}
                    className="mr-2 text-dale-green focus:ring-dale-green"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className={`input-field w-full ${errors.deadline ? 'border-red-500' : ''}`}
              />
              {errors.deadline && (
                <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción Adicional
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Detalles adicionales del proyecto, contexto, notas especiales..."
            />
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
              {opportunity ? 'Actualizar' : 'Crear'} Oportunidad
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

