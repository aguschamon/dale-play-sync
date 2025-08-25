#!/bin/bash

# Script para restaurar páginas de API después del build estático

echo "🔄 Restaurando páginas de API..."

# Restaurar páginas de API
if [ -d ".temp-api-backup/api" ]; then
    echo "📁 Restaurando páginas de API..."
    mv .temp-api-backup/api src/app/
fi

# Restaurar páginas dinámicas
if [ -d ".temp-api-backup/[id]" ]; then
    echo "📄 Restaurando páginas dinámicas..."
    mv .temp-api-backup/[id] "src/app/(auth)/opportunities/"
fi

# Limpiar directorio temporal
rm -rf .temp-api-backup

echo "✅ Páginas de API restauradas"
echo "💡 La aplicación está lista para desarrollo con APIs"
