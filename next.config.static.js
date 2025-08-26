/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel - versión estática
  output: 'export',
  
  // Configuración para páginas estáticas
  trailingSlash: true,
  
  // Configuración de imágenes para export estático
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  
  // Configuración para export estático
  distDir: 'out',
}

module.exports = nextConfig
