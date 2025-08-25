/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para build estático
  output: 'export',
  
  // Configuración para páginas estáticas
  trailingSlash: true,
  
  // Desactivar funcionalidades que requieren servidor
  experimental: {
    appDir: true,
  },
  
  // Configuración de imágenes para export estático
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  
  // Configuración para export estático
  distDir: 'out',
  
  // Desactivar API routes para build estático
  async rewrites() {
    return []
  },
  
  // Configuración para páginas estáticas
  async generateStaticParams() {
    return []
  }
}

module.exports = nextConfig
