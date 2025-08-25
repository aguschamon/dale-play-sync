# API de Alertas - Dale Play Sync Center

## Endpoint

```
GET /api/alerts
```

## Descripción

La API de alertas proporciona un sistema inteligente de notificaciones basado en el estado actual de las oportunidades de sincronización musical. Genera alertas automáticas basadas en reglas de negocio específicas.

## Funcionalidades

### 🚨 **Alertas URGENTES (Prioridad 1)**
- **INBOUND**: Todas las oportunidades INBOUND requieren atención inmediata
- **Deadline Vencido**: Oportunidades con fechas límite pasadas

### ⚠️ **Alertas WARNING (Prioridad 2)**
- **Deadline Próximo**: Vencen en 3 días o menos
- **Aprobación Pendiente**: Oportunidades en estado APPROVAL
- **Sin Canciones**: Oportunidades sin canciones asignadas (excepto PITCHING)
- **Budget Alto**: Oportunidades con budget > $50,000 sin canciones
- **Legal Atascado**: Oportunidades en LEGAL por más de 7 días

### ℹ️ **Alertas INFO (Prioridad 3)**
- **Deadline en 1 Semana**: Vencen en 4-7 días
- **Facturación Pendiente**: Oportunidades en estado INVOICED

## Estructura de Respuesta

### Respuesta Exitosa (200)

```json
{
  "alerts": [
    {
      "id": "inbound-abc123",
      "type": "URGENT",
      "title": "Oportunidad INBOUND Requiere Atención Inmediata",
      "description": "La oportunidad \"Stranger Things S5\" es INBOUND y requiere aprobación urgente.",
      "opportunityId": "abc123",
      "opportunity": { /* Datos completos de la oportunidad */ },
      "createdAt": "2025-01-20T10:00:00.000Z",
      "priority": 1,
      "category": "INBOUND"
    }
  ],
  "alertsByCategory": {
    "INBOUND": [ /* Alertas INBOUND */ ],
    "DEADLINE": [ /* Alertas de deadline */ ],
    "APPROVAL": [ /* Alertas de aprobación */ ],
    "CATALOG": [ /* Alertas de catálogo */ ],
    "BUDGET": [ /* Alertas de budget */ ],
    "LEGAL": [ /* Alertas de legal */ ],
    "INVOICING": [ /* Alertas de facturación */ ]
  },
  "summary": {
    "total": 11,
    "urgent": 3,
    "warning": 8,
    "info": 0,
    "byCategory": {
      "INBOUND": 2,
      "DEADLINE": 2,
      "BUDGET": 2,
      "CATALOG": 4,
      "APPROVAL": 1
    }
  },
  "lastUpdated": "2025-01-20T10:00:00.000Z"
}
```

### Respuesta de Error (500)

```json
{
  "error": "Error interno del servidor",
  "message": "No se pudieron obtener las alertas del sistema",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

## Tipos de Alertas

### 1. **INBOUND** 🚨
- **Prioridad**: 1 (URGENT)
- **Descripción**: Oportunidades que llegan directamente del cliente
- **Acción**: Requiere aprobación inmediata (máximo 48h)

### 2. **DEADLINE** ⏰
- **Prioridad**: 1-3 (según urgencia)
- **Tipos**:
  - **Vencido**: Prioridad 1, días vencidos
  - **Próximo**: Prioridad 2, ≤3 días
  - **1 Semana**: Prioridad 3, 4-7 días

### 3. **APPROVAL** ✅
- **Prioridad**: 2 (WARNING)
- **Descripción**: Oportunidades esperando aprobación legal
- **Acción**: Revisar y aprobar/rechazar

### 4. **CATALOG** 🎵
- **Prioridad**: 2 (WARNING)
- **Descripción**: Oportunidades sin canciones asignadas
- **Excepción**: Estado PITCHING (normal tener 0 canciones)

### 5. **BUDGET** 💰
- **Prioridad**: 2 (WARNING)
- **Descripción**: Budget alto sin canciones asignadas
- **Umbral**: > $50,000

### 6. **LEGAL** ⚖️
- **Prioridad**: 2 (WARNING)
- **Descripción**: Oportunidades atascadas en Legal
- **Umbral**: > 7 días en estado LEGAL

### 7. **INVOICING** 📄
- **Prioridad**: 3 (INFO)
- **Descripción**: Oportunidades facturadas esperando pago

## Reglas de Negocio

### **Filtrado de Oportunidades**
- Solo se consideran oportunidades **activas**
- Se excluyen estados: `PAID`, `REJECTED`
- Se incluyen relaciones: `cliente`, `canciones`, `obra`, `fonograma`

### **Priorización**
1. **Prioridad 1**: INBOUND, deadlines vencidos
2. **Prioridad 2**: Aprobaciones, warnings, sin canciones
3. **Prioridad 3**: Informativas, facturación

### **Ordenamiento**
1. Por prioridad (ascendente)
2. Por fecha de creación (descendente)

## Uso en Frontend

### **Dashboard**
```typescript
const { alerts, summary } = await fetch('/api/alerts').then(r => r.json())

// Mostrar contador de alertas urgentes
const urgentCount = summary.urgent

// Mostrar alertas por categoría
const inboundAlerts = alerts.filter(a => a.category === 'INBOUND')
```

### **Sidebar Navigation**
```typescript
// Badge con número de alertas urgentes
const urgentAlerts = summary.urgent + summary.warning
```

### **Página de Alertas**
```typescript
// Agrupar por tipo
const urgentAlerts = alerts.filter(a => a.type === 'URGENT')
const warningAlerts = alerts.filter(a => a.type === 'WARNING')
const infoAlerts = alerts.filter(a => a.type === 'INFO')
```

## Ejemplos de Uso

### **cURL**
```bash
# Obtener todas las alertas
curl -X GET "http://localhost:3000/api/alerts"

# Solo el resumen
curl -X GET "http://localhost:3000/api/alerts" | jq '.summary'

# Solo alertas urgentes
curl -X GET "http://localhost:3000/api/alerts" | jq '.alerts[] | select(.type == "URGENT")'
```

### **JavaScript/TypeScript**
```typescript
// Función para obtener alertas
async function fetchAlerts() {
  try {
    const response = await fetch('/api/alerts')
    if (!response.ok) {
      throw new Error('Error fetching alerts')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    return { alerts: [], summary: { total: 0, urgent: 0, warning: 0, info: 0 } }
  }
}

// Uso
const { alerts, summary } = await fetchAlerts()
console.log(`Total alertas: ${summary.total}`)
console.log(`Urgentes: ${summary.urgent}`)
```

## Consideraciones Técnicas

### **Performance**
- La API filtra oportunidades en la base de datos
- Solo incluye oportunidades activas (no PAID/REJECTED)
- Ordenamiento y agrupación en memoria para flexibilidad

### **Escalabilidad**
- Para grandes volúmenes, considerar paginación
- Implementar cache con Redis para alertas frecuentes
- Background jobs para generación de alertas

### **Mantenimiento**
- Las reglas de alertas están hardcodeadas en la API
- Para flexibilidad, considerar configuración en base de datos
- Logs detallados para debugging

## Estado de la API

- ✅ **Implementada**: GET /api/alerts
- 🔄 **Futuras**: POST (crear alertas manuales), PUT (marcar como leídas)
- 📊 **Métricas**: Contadores por tipo y categoría
- 🎯 **Integración**: Completamente integrada con el frontend

---

**Última actualización**: 20 de Enero, 2025  
**Versión**: 1.0.0  
**Estado**: Producción
