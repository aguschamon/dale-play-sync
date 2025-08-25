export interface User {
  id: string
  email: string
  nombre: string
  rol: 'SYNC_MANAGER' | 'LEGAL' | 'ADMIN' | 'EXECUTIVE'
  permisos?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Cliente {
  id: string
  nombre: string
  tipo: 'PLATAFORMA' | 'MARCA' | 'PRODUCTORA'
  contactos?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
}

export interface Obra {
  id: string
  nombre: string
  iswc?: string
  porcentaje_control_dp: number
  porcentaje_share_dp: number
  compositores?: Record<string, any>
  territorio?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Fonograma {
  id: string
  obraId: string
  nombre: string
  isrc?: string
  porcentaje_dp: number
  artista_principal: string
  featured_artists?: Record<string, any>
  sello?: string
  año_lanzamiento?: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Oportunidad {
  id: string
  codigo: string
  tipo_flow: 'OUTBOUND' | 'INBOUND'
  estado: 'PITCHING' | 'NEGOTIATION' | 'APPROVAL' | 'LEGAL' | 'SIGNED' | 'INVOICED' | 'PAID' | 'REJECTED'
  clienteId: string
  proyecto: string
  tipo_proyecto: 'SERIE' | 'PELICULA' | 'PUBLICIDAD' | 'VIDEOJUEGO'
  territorio?: string
  duracion_licencia?: string
  tipo_uso?: string
  budget?: number
  mfn: boolean
  deadline?: Date
  sync_manager_id: string
  legal_id?: string
  admin_id?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  
  // Relations
  cliente?: Cliente
  syncManager?: User
  legal?: User
  admin?: User
  canciones?: OportunidadCancion[]
  actividades?: Actividad[]
  documentos?: Documento[]
}

export interface OportunidadCancion {
  id: string
  oportunidadId: string
  obraId: string
  fonogramaId?: string
  budget_cancion?: number
  nps_publishing?: number
  nps_recording?: number
  nps_total?: number
  aprobaciones?: Record<string, any>
  createdAt: Date
  
  // Relations
  obra?: Obra
  fonograma?: Fonograma
}

export interface Actividad {
  id: string
  oportunidadId: string
  usuarioId: string
  tipo_actividad: string
  descripcion?: string
  metadata?: Record<string, any>
  createdAt: Date
  
  // Relations
  usuario?: User
}

export interface Documento {
  id: string
  oportunidadId: string
  tipo: 'CONTRATO' | 'FACTURA' | 'APROBACION' | 'ONE_SHEET'
  url?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface Notificacion {
  id: string
  usuarioId: string
  tipo: string
  titulo: string
  mensaje?: string
  leida: boolean
  metadata?: Record<string, any>
  createdAt: Date
}

export interface NPSResults {
  pubNPS: number
  recNPS: number
  totalDP: number
  publishing: {
    controlDP: number
    shareDP: number
  }
  recording: {
    controlDP: number
  }
}

export interface DashboardKPIs {
  revenueYTD: number
  activeSyncs: number
  conversionRate: number
  avgDealTime: number
  inboundVsOutbound: {
    inbound: number
    outbound: number
  }
}

export interface PipelineFilters {
  estado?: string[]
  cliente?: string[]
  tipo?: string[]
  flow?: string[]
  manager?: string[]
  fechaDesde?: Date
  fechaHasta?: Date
}

export interface CatalogFilters {
  territorio?: string
  año?: number
  artista?: string
  sello?: string
  tipo?: string
}

