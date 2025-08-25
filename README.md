# Dale Play Sync Center

Sistema de sincronización de música multiplataforma desarrollado con Next.js 14, TypeScript y Prisma.

## 🚀 Características

- **Dashboard Intuitivo**: Interfaz moderna y responsive para gestionar tu música
- **Sincronización Multiplataforma**: Conecta y sincroniza entre múltiples dispositivos
- **Gestión de Playlists**: Crea y organiza tus playlists personalizadas
- **Base de Datos Robusta**: Utiliza Prisma con SQLite para un rendimiento óptimo
- **Diseño Corporativo**: Colores y estilos personalizados de Dale Play

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS con colores corporativos personalizados
- **Base de Datos**: Prisma ORM con SQLite
- **Autenticación**: JWT con bcrypt
- **Validación**: Zod para validación de esquemas

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd dale-play-sync-center
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="tu-clave-secreta-jwt"
   NEXTAUTH_SECRET="tu-clave-secreta-nextauth"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema con roles y permisos
- **Device**: Dispositivos conectados para sincronización
- **Playlist**: Colecciones de música organizadas
- **Track**: Archivos de música individuales
- **SyncSession**: Registro de sesiones de sincronización

### Enums

- **Role**: USER, ADMIN, MODERATOR
- **DeviceType**: MOBILE, DESKTOP, TABLET, SMARTWATCH, OTHER
- **SyncStatus**: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED

## 🎨 Colores Corporativos

- **Negro Principal**: `#0A0A0A` (dale-black)
- **Verde Principal**: `#00FF88` (dale-green)
- **Verde Oscuro**: `#00CC6A` (dale-green-dark)
- **Verde Claro**: `#33FF99` (dale-green-light)
- **Grises**: Variaciones para elementos de interfaz

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 14
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página del dashboard
│   └── globals.css        # Estilos globales
├── components/             # Componentes reutilizables
│   ├── layout/            # Componentes de layout
│   │   ├── Header.tsx     # Header principal
│   │   └── Navigation.tsx # Navegación lateral
│   └── dashboard/         # Componentes del dashboard
│       ├── DashboardStats.tsx
│       ├── RecentSyncs.tsx
│       └── QuickActions.tsx
├── lib/                    # Utilidades y configuraciones
├── types/                  # Tipos de TypeScript
└── utils/                  # Funciones utilitarias
```

## 🚀 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificar código con ESLint
- `npm run db:generate` - Generar cliente de Prisma
- `npm run db:push` - Sincronizar esquema con la base de datos
- `npm run db:studio` - Abrir Prisma Studio

## 🔧 Comandos de Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar esquema
npx prisma db push

# Abrir Prisma Studio
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset
```

## 🌟 Próximas Características

- [ ] Autenticación de usuarios
- [ ] API REST para sincronización
- [ ] Sincronización en tiempo real
- [ ] Soporte para múltiples formatos de audio
- [ ] Estadísticas avanzadas de uso
- [ ] Modo offline para dispositivos móviles

## 📝 Licencia

Este proyecto es propiedad de Dale Play. Todos los derechos reservados.

## 🤝 Contribución

Para contribuir al proyecto, por favor contacta al equipo de desarrollo de Dale Play.

---

**Desarrollado con ❤️ por el equipo de Dale Play**

