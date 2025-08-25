/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel - output standalone
  output: 'standalone',
  
  // Ignorar errores de ESLint y TypeScript para el demo
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
