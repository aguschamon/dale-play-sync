import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/aprobaciones/[id]/reenviar - Reenviar email de aprobación
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar que la aprobación existe
    const aprobacion = await prisma.aprobacion.findUnique({
      where: { id },
      include: {
        oportunidad: true,
        titular: true
      }
    })

    if (!aprobacion) {
      return NextResponse.json(
        { error: 'Aprobación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que esté pendiente
    if (aprobacion.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Solo se pueden reenviar emails de aprobaciones pendientes' },
        { status: 400 }
      )
    }

    // Por ahora, solo actualizar la fecha de envío
    // En el futuro, aquí se implementaría el envío real del email
    await prisma.aprobacion.update({
      where: { id },
      data: {
        fecha_envio: new Date()
      }
    })

    // TODO: Implementar envío real de email
    // const emailData = {
    //   to: aprobacion.titular.email,
    //   subject: `Aprobación requerida - ${aprobacion.oportunidad.proyecto}`,
    //   template: 'aprobacion',
    //   data: {
    //     titular: aprobacion.titular.nombre,
    //     proyecto: aprobacion.oportunidad.proyecto,
    //     token: aprobacion.token,
    //     link: `${process.env.NEXT_PUBLIC_APP_URL}/aprobar/${aprobacion.token}`
    //   }
    // }
    // await sendEmail(emailData)

    return NextResponse.json({
      message: 'Email reenviado exitosamente',
      aprobacion: {
        id: aprobacion.id,
        fecha_envio: new Date()
      }
    })
  } catch (error) {
    console.error('Error reenviando email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al reenviar email' },
      { status: 500 }
    )
  }
}
