import { Metadata } from 'next'
import OpportunityDetail from '@/components/opportunities/OpportunityDetail'

// Función para generar parámetros estáticos
export async function generateStaticParams() {
  // Para build estático, generar páginas para las oportunidades demo
  const demoIds = ['1', '2', '3', '4', '5', '6'];
  
  return demoIds.map((id) => ({
    id: id,
  }));
}

// Función para generar metadatos estáticos
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Oportunidad ${params.id} - Dale Play Sync Center`,
    description: 'Detalle de oportunidad de sincronización musical',
  }
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  return <OpportunityDetail opportunityId={params.id} />
}
