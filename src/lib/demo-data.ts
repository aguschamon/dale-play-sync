// src/lib/demo-data.ts - Datos estáticos para DEMO en Vercel

export const demoObras = [
  {
    id: '1',
    nombre: 'Bzrp Music Sessions #52',
    iswc: 'T-345.678.901-2',
    porcentaje_control_dp: 50,
    porcentaje_share_dp: 12.5,
    compositores: { 'Bizarrap': 25, 'Quevedo': 25, 'Dale Play Publishing': 50 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Corazones Rotos',
    iswc: 'T-678.901.234-5',
    porcentaje_control_dp: 75,
    porcentaje_share_dp: 18.75,
    compositores: { 'Nicki Nicole': 25, 'Dale Play Publishing': 75 },
    territorio: 'LATAM',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    nombre: 'Nostalgia',
    iswc: 'T-789.012.345-6',
    porcentaje_control_dp: 100,
    porcentaje_share_dp: 25,
    compositores: { 'Duki': 75, 'Dale Play Publishing': 25 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    nombre: 'Arroba',
    iswc: 'T-890.123.456-7',
    porcentaje_control_dp: 60,
    porcentaje_share_dp: 15,
    compositores: { 'Tini': 40, 'Dale Play Publishing': 60 },
    territorio: 'LATAM',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    nombre: 'La Botella',
    iswc: 'T-901.234.567-8',
    porcentaje_control_dp: 80,
    porcentaje_share_dp: 20,
    compositores: { 'Mau y Ricky': 20, 'Dale Play Publishing': 80 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    nombre: 'Medusa',
    iswc: 'T-012.345.678-9',
    porcentaje_control_dp: 45,
    porcentaje_share_dp: 11.25,
    compositores: { 'Jhay Cortez': 55, 'Dale Play Publishing': 45 },
    territorio: 'LATAM',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    nombre: 'Gatúbela',
    iswc: 'T-123.456.789-0',
    porcentaje_control_dp: 70,
    porcentaje_share_dp: 17.5,
    compositores: { 'Karol G': 30, 'Maldy': 20, 'Dale Play Publishing': 50 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    nombre: '512',
    iswc: 'T-234.567.890-1',
    porcentaje_control_dp: 90,
    porcentaje_share_dp: 22.5,
    compositores: { 'Mora': 10, 'Dale Play Publishing': 90 },
    territorio: 'LATAM',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '9',
    nombre: 'Yandel 150',
    iswc: 'T-345.678.901-3',
    porcentaje_control_dp: 55,
    porcentaje_share_dp: 13.75,
    compositores: { 'Yandel': 30, 'Feid': 15, 'Dale Play Publishing': 55 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '10',
    nombre: 'La Canción',
    iswc: 'T-456.789.012-4',
    porcentaje_control_dp: 65,
    porcentaje_share_dp: 16.25,
    compositores: { 'Bad Bunny': 20, 'J Balvin': 15, 'Dale Play Publishing': 65 },
    territorio: 'LATAM',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '11',
    nombre: 'Despechá',
    iswc: 'T-567.890.123-5',
    porcentaje_control_dp: 85,
    porcentaje_share_dp: 21.25,
    compositores: { 'Rosalía': 15, 'Dale Play Publishing': 85 },
    territorio: 'Mundial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const demoFonogramas = [
  {
    id: '1',
    obraId: '1',
    nombre: 'Bzrp Music Sessions #52 (Single)',
    isrc: 'ES-XXX-24-00001',
    porcentaje_dp: 30,
    artista_principal: 'Bizarrap ft. Quevedo',
    featured_artists: { 'Quevedo': 'Featured Artist' },
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    obraId: '2',
    nombre: 'Corazones Rotos (Original Mix)',
    isrc: 'AR-XXX-24-00002',
    porcentaje_dp: 100,
    artista_principal: 'Nicki Nicole',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    obraId: '3',
    nombre: 'Nostalgia (Studio Version)',
    isrc: 'AR-XXX-24-00003',
    porcentaje_dp: 100,
    artista_principal: 'Duki',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    obraId: '4',
    nombre: 'Arroba (Radio Edit)',
    isrc: 'AR-XXX-24-00004',
    porcentaje_dp: 100,
    artista_principal: 'Tini',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    obraId: '5',
    nombre: 'La Botella (Extended Mix)',
    isrc: 'VE-XXX-24-00005',
    porcentaje_dp: 100,
    artista_principal: 'Mau y Ricky',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '6',
    obraId: '6',
    nombre: 'Medusa (Club Mix)',
    isrc: 'PR-XXX-24-00006',
    porcentaje_dp: 100,
    artista_principal: 'Jhay Cortez',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '7',
    obraId: '7',
    nombre: 'Gatúbela (Remix)',
    isrc: 'CO-XXX-24-00007',
    porcentaje_dp: 100,
    artista_principal: 'Karol G ft. Maldy',
    featured_artists: { 'Maldy': 'Featured Artist' },
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '8',
    obraId: '8',
    nombre: '512 (Original)',
    isrc: 'PR-XXX-24-00008',
    porcentaje_dp: 100,
    artista_principal: 'Mora',
    featured_artists: {},
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '9',
    obraId: '9',
    nombre: 'Yandel 150 (Extended)',
    isrc: 'PR-XXX-24-00009',
    porcentaje_dp: 100,
    artista_principal: 'Yandel ft. Feid',
    featured_artists: { 'Feid': 'Featured Artist' },
    sello: 'Dale Play Records',
    año_lanzamiento: 2024,
    createdAt: new Date('2024-01-01')
  }
];

export const demoOpportunities = [
  {
    id: '1',
    codigo: 'OPP-2025-0001',
    tipo_flow: 'INBOUND',
    estado: 'APPROVAL',
    clienteId: '1',
    cliente: { id: '1', nombre: 'Netflix' },
    proyecto: 'Stranger Things S5',
    tipo_proyecto: 'SERIE',
    territorio: 'Global',
    duracion_licencia: '2 años',
    budget: 30000,
    mfn: true,
    deadline: new Date('2025-01-20'),
    sync_manager_id: 'system',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    codigo: 'OPP-2025-0002',
    tipo_flow: 'OUTBOUND',
    estado: 'NEGOTIATION',
    clienteId: '2',
    cliente: { id: '2', nombre: 'Apple TV+' },
    proyecto: 'Ted Lasso S4',
    tipo_proyecto: 'SERIE',
    territorio: 'Global',
    duracion_licencia: '3 años',
    budget: 25000,
    mfn: false,
    deadline: new Date('2025-02-15'),
    sync_manager_id: 'system',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  },
  {
    id: '3',
    codigo: 'OPP-2025-0003',
    tipo_flow: 'OUTBOUND',
    estado: 'LEGAL',
    clienteId: '3',
    cliente: { id: '3', nombre: 'Disney+' },
    proyecto: 'Marvel: Secret Invasion',
    tipo_proyecto: 'SERIE',
    territorio: 'Global',
    duracion_licencia: '5 años',
    budget: 80000,
    mfn: true,
    deadline: new Date('2025-03-20'),
    sync_manager_id: 'system',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05')
  },
  {
    id: '4',
    codigo: 'OPP-2025-0004',
    tipo_flow: 'INBOUND',
    estado: 'SIGNED',
    clienteId: '4',
    cliente: { id: '4', nombre: 'HBO Max' },
    proyecto: 'The Last Dance Documentary',
    tipo_proyecto: 'DOCUMENTAL',
    territorio: 'Global',
    duracion_licencia: '10 años',
    budget: 50000,
    mfn: false,
    deadline: new Date('2025-04-25'),
    sync_manager_id: 'system',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: '5',
    codigo: 'OPP-2025-0005',
    tipo_flow: 'OUTBOUND',
    estado: 'PITCHING',
    clienteId: '5',
    cliente: { id: '5', nombre: 'Coca-Cola' },
    proyecto: 'Super Bowl 2025',
    tipo_proyecto: 'PUBLICIDAD',
    territorio: 'USA',
    duracion_licencia: '1 año',
    budget: 150000,
    mfn: true,
    deadline: new Date('2025-01-13'),
    sync_manager_id: 'system',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: '6',
    codigo: 'OPP-2025-0006',
    tipo_flow: 'OUTBOUND',
    estado: 'NEGOTIATION',
    clienteId: '6',
    cliente: { id: '6', nombre: 'Money Heist' },
    proyecto: 'La Casa de Papel: Berlin',
    tipo_proyecto: 'SERIE',
    territorio: 'Global',
    duracion_licencia: '2 años',
    budget: 45000,
    mfn: false,
    deadline: new Date('2025-01-22'),
    sync_manager_id: 'system',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08')
  }
];

export const demoClients = [
  { id: '1', nombre: 'Netflix', tipo: 'PLATAFORMA', contactos: { email: 'sync@netflix.com' } },
  { id: '2', nombre: 'Apple TV+', tipo: 'PLATAFORMA', contactos: { email: 'music@apple.com' } },
  { id: '3', nombre: 'Disney+', tipo: 'PLATAFORMA', contactos: { email: 'licensing@disney.com' } },
  { id: '4', nombre: 'HBO Max', tipo: 'PLATAFORMA', contactos: { email: 'sync@hbomax.com' } },
  { id: '5', nombre: 'Coca-Cola', tipo: 'MARCA', contactos: { email: 'ads@coca-cola.com' } },
  { id: '6', nombre: 'Money Heist', tipo: 'PRODUCTORA', contactos: { email: 'music@moneyheist.com' } }
];

export const demoStats = {
  revenueYTD: 1250000,
  activeSyncs: 6,
  conversionRate: 68.2,
  avgDealTime: 45,
  totalOpportunities: 6,
  opportunitiesByStatus: {
    PITCHING: 1,
    NEGOTIATION: 2,
    APPROVAL: 1,
    LEGAL: 1,
    SIGNED: 1,
    INVOICED: 0,
    PAID: 0,
    REJECTED: 0
  }
};

export const demoAlerts = [
  {
    id: '1',
    type: 'URGENT',
    title: 'Deadline Vencido',
    description: 'Coca-Cola - Super Bowl 2025 está vencido hace 2 días',
    opportunityId: '5',
    priority: 1,
    category: 'DEADLINE',
    daysOverdue: 2
  },
  {
    id: '2',
    type: 'WARNING',
    title: 'Deadline Próximo',
    description: 'Netflix - Stranger Things S5 vence en 3 días',
    opportunityId: '1',
    priority: 2,
    category: 'DEADLINE',
    daysUntilDeadline: 3
  },
  {
    id: '3',
    type: 'WARNING',
    title: 'Deadline Próximo',
    description: 'Money Heist - La Casa de Papel: Berlin vence en 7 días',
    opportunityId: '6',
    priority: 2,
    category: 'DEADLINE',
    daysUntilDeadline: 7
  },
  {
    id: '4',
    type: 'INFO',
    title: 'INBOUND Urgente',
    description: 'Netflix - Stranger Things S5 requiere aprobación inmediata',
    opportunityId: '1',
    priority: 1,
    category: 'INBOUND'
  },
  {
    id: '5',
    type: 'INFO',
    title: 'Legal Atascado',
    description: 'Disney+ - Marvel: Secret Invasion está en Legal hace 8 días',
    opportunityId: '3',
    priority: 2,
    category: 'LEGAL'
  }
];
