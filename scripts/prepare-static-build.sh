#!/bin/bash

# Script para preparar build estático moviendo páginas de API

echo "🚀 Preparando build estático..."

# Crear directorio temporal para páginas de API
mkdir -p .temp-api-backup

# Mover páginas de API temporalmente
echo "📁 Moviendo páginas de API..."
mv src/app/api .temp-api-backup/ 2>/dev/null || echo "No hay páginas de API para mover"

# Mover páginas dinámicas problemáticas
echo "📄 Moviendo páginas dinámicas..."
mv "src/app/(auth)/opportunities/[id]" .temp-api-backup/ 2>/dev/null || echo "No hay páginas dinámicas para mover"

echo "✅ Build estático preparado. Las páginas de API están en .temp-api-backup/"
echo "💡 Ejecuta 'npm run build' ahora"
echo "🔄 Para restaurar: ./scripts/restore-api.sh"
