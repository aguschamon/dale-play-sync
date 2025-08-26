'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Users, Music, Disc3, Plus, X } from 'lucide-react'

interface Obra {
  id: string
  nombre: string
  iswc?: string
  porcentaje_control_dp: number
  porcentaje_share_dp: number
}

interface Fonograma {
  id: string
  nombre: string
  isrc?: string
  artista_principal: string
  sello?: string
}

interface TitularObra {
  obraId: string
  porcentaje: number
  rol: string
}

interface TitularFonograma {
  fonogramaId: string
  porcentaje: number
  rol: string
}

interface FormData {
  nombre: string
  email: string
  telefono: string
  tipo: string
  notas: string
  obras: TitularObra[]
  fonogramas: TitularFonograma[]
}

export default function NewTitularPage() {
  const router = useRouter()
  const [obras, setObras] = useState<Obra[]>([])
  const [fonogramas, setFonogramas] = useState<Fonograma[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'AUTOR',
    notas: '',
    obras: [],
    fonogramas: []
  })

  useEffect(() => {
    fetchCatalogData()
  }, [])

  const fetchCatalogData = async () => {
    try {
      const [obrasResponse, fonogramasResponse] = await Promise.all([
        fetch('/api/catalog/obras'),
        fetch('/api/catalog/fonogramas')
      ])

      if (obrasResponse.ok) {
        const obrasData = await obrasResponse.json()
        setObras(obrasData)
      }

      if (fonogramasResponse.ok) {
        const fonogramasData = await fonogramasResponse.json()
        setFonogramas(fonogramasData)
      }
    } catch (error) {
      console.error('Error fetching catalog data:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addObra = () => {
    setFormData(prev => ({
      ...prev,
      obras: [...prev.obras, { obraId: '', porcentaje: 0, rol: 'COMPOSITOR' }]
    }))
  }

  const removeObra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      obras: prev.obras.filter((_, i) => i !== index)
    }))
  }

  const updateObra = (index: number, field: keyof TitularObra, value: any) => {
    setFormData(prev => ({
      ...prev,
      obras: prev.obras.map((obra, i) => 
        i === index ? { ...obra, [field]: value } : obra
      )
    }))
  }

  const addFonograma = () => {
    setFormData(prev => ({
      ...prev,
      fonogramas: [...prev.fonogramas, { fonogramaId: '', porcentaje: 0, rol: 'ARTISTA' }]
    }))
  }

  const removeFonograma = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fonogramas: prev.fonogramas.filter((_, i) => i !== index)
    }))
  }

  const updateFonograma = (index: number, field: keyof TitularFonograma, value: any) => {
    setFormData(prev => ({
      ...prev,
      fonogramas: prev.fonogramas.map((fonograma, i) => 
        i === index ? { ...fonograma, [field]: value } : fonograma
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.email || !formData.tipo) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/titulares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/titulares')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating titular:', error)
      alert('Error al crear el titular')
    } finally {
      setIsLoading(false)
    }
  }

  const tiposTitular = [
    { value: 'AUTOR', label: 'Autor' },
    { value: 'COMPOSITOR', label: 'Compositor' },
    { value: 'ARTISTA', label: 'Artista' },
    { value: 'PRODUCTOR', label: 'Productor' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'SELLO', label: 'Sello' }
  ]

  const rolesObra = [
    { value: 'COMPOSITOR', label: 'Compositor' },
    { value: 'AUTOR_LETRA', label: 'Autor de Letra' },
    { value: 'ARRANJADOR', label: 'Arreglista' }
  ]

  const rolesFonograma = [
    { value: 'ARTISTA', label: 'Artista Principal' },
    { value: 'FEATURED', label: 'Artista Invitado' },
    { value: 'PRODUCTOR', label: 'Productor' },
    { value: 'INGENIERO', label: 'Ingeniero de Sonido' }
  ]

  return (
    <div className="min-h-screen bg-dale-navy text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/titulares')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Nuevo Titular</h1>
              <p className="text-gray-400 mt-2">Crea un nuevo titular de derechos musicales</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-dale-purple" />
              <span>Información Básica</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="Nombre completo del titular"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  required
                >
                  {tiposTitular.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                  rows={3}
                  placeholder="Información adicional, contexto, notas especiales..."
                />
              </div>
            </div>
          </div>

          {/* Obras */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Music className="w-5 h-5 text-dale-purple" />
                <span>Obras Asociadas</span>
              </h3>
              <button
                type="button"
                onClick={addObra}
                className="px-4 py-2 bg-dale-purple hover:bg-dale-purple-dark rounded-lg text-white font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Obra</span>
              </button>
            </div>

            {formData.obras.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay obras asociadas</p>
                <p className="text-sm">Haz clic en "Agregar Obra" para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.obras.map((obra, index) => (
                  <div key={index} className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Obra
                        </label>
                        <select
                          value={obra.obraId}
                          onChange={(e) => updateObra(index, 'obraId', e.target.value)}
                          className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                          required
                        >
                          <option value="">Seleccionar obra</option>
                          {obras.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.nombre} {o.iswc && `(${o.iswc})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Porcentaje
                        </label>
                        <input
                          type="number"
                          value={obra.porcentaje}
                          onChange={(e) => updateObra(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                          className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rol
                          </label>
                          <select
                            value={obra.rol}
                            onChange={(e) => updateObra(index, 'rol', e.target.value)}
                            className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                            required
                          >
                            {rolesObra.map(rol => (
                              <option key={rol.value} value={rol.value}>
                                {rol.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeObra(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors duration-200"
                          title="Eliminar obra"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fonogramas */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Disc3 className="w-5 h-5 text-dale-emerald" />
                <span>Fonogramas Asociados</span>
              </h3>
              <button
                type="button"
                onClick={addFonograma}
                className="px-4 py-2 bg-dale-emerald hover:bg-dale-emerald-dark rounded-lg text-white font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Fonograma</span>
              </button>
            </div>

            {formData.fonogramas.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Disc3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay fonogramas asociados</p>
                <p className="text-sm">Haz clic en "Agregar Fonograma" para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fonogramas.map((fonograma, index) => (
                  <div key={index} className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Fonograma
                        </label>
                        <select
                          value={fonograma.fonogramaId}
                          onChange={(e) => updateFonograma(index, 'fonogramaId', e.target.value)}
                          className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                          required
                        >
                          <option value="">Seleccionar fonograma</option>
                          {fonogramas.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.nombre} - {f.artista_principal} {f.isrc && `(${f.isrc})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Porcentaje
                        </label>
                        <input
                          type="number"
                          value={fonograma.porcentaje}
                          onChange={(e) => updateFonograma(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                          className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rol
                          </label>
                          <select
                            value={fonograma.rol}
                            onChange={(e) => updateFonograma(index, 'rol', e.target.value)}
                            className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
                            required
                          >
                            {rolesFonograma.map(rol => (
                              <option key={rol.value} value={rol.value}>
                                {rol.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFonograma(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors duration-200"
                          title="Eliminar fonograma"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/titulares')}
              className="px-6 py-3 bg-dale-navy-light border border-dale-navy-lighter rounded-lg text-white hover:bg-dale-navy-lighter transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-dale-purple hover:bg-dale-purple-dark disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Creando...' : 'Crear Titular'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
