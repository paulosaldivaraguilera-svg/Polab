# API Leads - Documentación

## Endpoints

### POST /api/lead
Recibe un nuevo lead del formulario.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+56912345678",
  "email": "juan@email.com",
  "servicio": "pyme",
  "mensaje": "Necesito constituir mi empresa",
  "fuente": "comenzar-landing"
}
```

**Response:**
```json
{
  "success": true,
  "lead_id": 1,
  "whatsapp_url": "https://wa.me/56974349077?text=Nuevo+lead..."
}
```

### GET /api/leads
Lista todos los leads.

### GET /api/stats
Estadísticas del sistema.

---

## Base de Datos
- **Archivo:** `projects/polab/db/leads.db`
- **Tabla:** `leads`
- **Campos:** id, nombre, telefono, email, servicio, fuente, estado, fecha
