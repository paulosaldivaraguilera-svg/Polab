# CRM Notion - Documentación Técnica

*Creado: 2026-01-31*

## Configuración

| Componente | Valor |
|------------|-------|
| Integración | Digimon |
| API Key | En `~/.config/notion/api_key` (protegido) |
| Database ID | En `~/.config/notion/database_id` (protegido) |

## Estructura del Database

| Campo | Tipo | Opciones |
|-------|------|----------|
| Name | title | - |
| Teléfono | rich_text | - |
| Materia | select | Laboral, Familia, Civil, Penal, Otro |
| Estado | select | Nuevo, Contactado, Cotización, Cerrado |
| Fecha | date | - |
| Fuente | rich_text | - |

## Uso desde Código

```python
import os

NOTION_KEY = open(os.path.expanduser("~/.config/notion/api_key")).read().strip()
DB_ID = open(os.path.expanduser("~/.config/notion/database_id")).read().strip()

# Crear lead
def crear_lead(nombre, telefono, materia, fuente):
    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {NOTION_KEY}",
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json"
    }
    data = {
        "parent": {"data_source_id": DB_ID},
        "properties": {
            "Name": {"title": [{"text": {"content": nombre}}]},
            "Teléfono": {"rich_text": [{"text": {"content": telefono}}]},
            "Materia": {"select": {"name": materia}},
            "Estado": {"select": {"name": "Nuevo"}},
            "Fecha": {"date": {"start": "2026-01-31"}},
            "Fuente": {"rich_text": [{"text": {"content": fuente}}]}
        }
    }
    # ... POST request
```

## Flujo de WhatsApp → Notion

1. Recibir mensaje de lead potencial
2. Extraer: nombre, teléfono, tema
3. Clasificar materia (Laboral/Familia/Civil/Penal/Otro)
4. Crear entrada en Notion con estado "Nuevo"
5. Notificar al usuario humano

## Notas

- API key nunca debe exponerse en código público
- Usar variable de entorno en producción
- Rate limit: ~3 requests/segundo
