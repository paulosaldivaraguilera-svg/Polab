# Dialéctico OS - Arquitectura
# ============================

## Visión General

Dialéctico OS es un sistema operativo profesional diseñado para gestionar trabajo jurídico en entornos de alta complejidad normativa.

## Principios

1. **El conocimiento es dinámico** — Las normas cambian constantemente
2. **Criterios configurables** — El sistema no impone rigidez
3. **Seguridad profesional** — Reducir ansiedad operativa
4. **Trazabilidad** — Todo debe ser auditable
5. **El humano decide** — La tecnología asiste

## Stack Tecnológico

- **Backend:** Python 3 + Flask
- **Base de datos:** SQLite (migrable a PostgreSQL)
- **Frontend:** HTML + TailwindCSS (sin frameworks JS pesados)
- **Testing:** pytest

## Estructura de Archivos

```
dialectico-os/
├── src/
│   ├── __init__.py
│   ├── app.py              # Aplicación Flask
│   ├── models.py           # Modelos SQLAlchemy
│   ├── deadlines.py        # Motor de plazos
│   ├── calendar.py         # Calendario chileno
│   ├── routes.py           # Rutas (separado de app.py si crece)
│   └── templates/          # Jinja2 templates
├── tests/
│   ├── test_deadlines.py
│   ├── test_calendar.py
│   └── test_models.py
├── docs/
│   ├── arquitectura.md
│   ├── plazos.md
│   └── uso.md
├── migrations/
├── config/
├── db/
├── requirements.txt
└── run.py
```

## Modelos de Datos

### Cliente
- id, nombre, rut, email, telefono, direccion, notas
- estado: activo, inactivo, potencial, archivado
- relaciones: casos

### Caso
- id, numero_expediente, cliente_id, materia, tipo_proceso
- tribunal, estado, prioridad, fechas
- relaciones: tareas, plazos

### Tarea
- id, caso_id, titulo, descripcion, estado
- prioridad, fecha_vencimiento, completada

### Plazo
- id, caso_id, titulo, tipo (corrido/habil/judicial)
- dias, fecha_inicio, fecha_vencimiento
- suspendido, dias_suspension

## Motor de Plazos

### Tipos de Plazos

| Tipo | Descripción | Incluye fines de semana | Incluye feriados |
|------|-------------|------------------------|------------------|
| Corrido | Todos los días | Sí | Sí |
| Habil | Solo días laborales | No | No |
| Judicial | Días judiciales | No* | No |

*Los días judiciales pueden incluir sábados según el tribunal.

### Calendario Chileno

- Feriados nacionales según Ley 19788
- Feriados regionales (semana santa, regionales)
- Suspensión de plazos por feriado judicial

## API Endpoints

### Clientes
- GET /clientes — Lista
- GET /cliente/<id> — Ver
- POST /cliente/nuevo — Crear
- POST /cliente/<id>/editar — Editar

### Casos
- GET /casos — Lista
- GET /caso/<id> — Ver
- POST /caso/nuevo — Crear
- POST /caso/<id>/plazo — Agregar plazo

### Tareas
- GET /tareas — Lista
- POST /tarea/<id>/completar — Completar

### API JSON
- GET /api/plazos — Plazos próximos (JSON)
- GET /api/calendario/feriados — Feriados (JSON)

## Configuración

Variables de entorno:
- DB_PATH — Path a la base de datos
- SECRET_KEY — Clave para Flask
- PORT — Puerto del servidor
- DEBUG — Modo debug

## Deployment

### Desarrollo
```bash
python3 run.py --port 8080
```

### Producción
```bash
gunicorn -w 4 -b 0.0.0.0:8080 app:app
```

## Mantenimiento

### Respaldo
```bash
cp db/dialectico.db backups/dialectico_$(date +%Y%m%d).db
```

### Tests
```bash
pytest tests/ -v
```
