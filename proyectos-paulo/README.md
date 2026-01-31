# Sistema ARIS - Infraestructura de Paulo

## Resumen

Sistema integral de herramientas para aumentar capacidad de intervención política, jurídica e intelectual, sin perder radicalidad ni caer en productivismo liberal.

## Estructura del Ecosistema

```
proyectos-paulo/
├── polab/
│   ├── captura.py              📝 Notas de voz → texto organizado
│   ├── writer.py               ✍️ Editor rápido de documentos
│   ├── calendar.py             📅 Gestor de tareas y deadlines
│   ├── watcher.py              👀 Detecta cambios + auto-commit
│   ├── deploy.sh               🚀 Publicar landing con 1 comando
│   ├── api_leads.py            🔗 Formulario → WhatsApp
│   ├── social.py               🎯 Social Media Manager
│   ├── db/
│   │   ├── leads.db            🗄️ SQLite (leads, notas, tareas)
│   │   └── schema.sql          📋 Estructura de BD
│   ├── db/leads.db
│   └── comenzar-landing/
│       ├── App.jsx             🎨 Landing page operativa
│       └── README.md
│
├── social-media/
│   ├── ecosistema-digital.md   🌐 Arquitectura de presencia digital
│   ├── perfiles.md             👤 Templates para cada plataforma
│   ├── contenido-batch-1.md    📝 Batch inicial de contenido
│   └── social.py               🎯 Herramienta de gestión
│
├── produccion/                 📚 Documentos en proceso
├── templates/                  📋 Estructuras para textos
├── web-personal/               🌐 Optimización paulosaldivar.cv
├── paulo-personal/             📁 Notas personales
└── backup.sh                   💾 Backup automático diario

elemental-pong.archivado/       🚫 Proyecto suspendido
diagnostico-politico-sujeto.md  📄 Análisis estratégico
metodologia-analisis-politico.md  📘 Marco teórico
estilo-aris.md                  ✍️ Estilo de escritura
```

## Herramientas Disponibles

### 1. Sistema de Captura Rápida

```bash
# Guardar nota simple
python3 polab/captura.py "nota importante" -p polab -t idea

# Ver notas de un proyecto
python3 polab/captura.py --ver -p polab

# Ver estadísticas
python3 polab/captura.py --stats
```

### 2. Editor de Documentos

```bash
# Crear nuevo documento
python3 polab/writer.py "mi-analisis.md" -t analisis

# Ver documentos en producción
python3 polab/writer.py --docs

# Listar templates disponibles
python3 polab/writer.py --list
```

### 3. Gestor de Tareas

```bash
# Agregar tarea con deadline
python3 polab/calendar.py add "Escribir artículo" -d 2026-02-15 -p alta

# Ver tareas para hoy
python3 polab/calendar.py today

# Ver pendientes por prioridad
python3 polab/calendar.py pending
```

### 4. Social Media Manager

```bash
# Crear contenido nuevo
python3 social.py new "Título" "contenido" -p twitter

# Listar contenido en borrador
python3 social.py list

# Adaptar contenido para otra plataforma
python3 social.py adapt "texto" linkedin

# Ver calendario de publicaciones
python3 social.py calendar
```

### 5. Base de Datos (SQLite)

Almacena:
- Leads de POLAB
- Notas capturadas
- Tareas
- Contenido de redes sociales

Ubicación: `proyectos-paulo/polab/db/leads.db`

### 6. Backup Automático

```bash
# Ejecutar manualmente
./backup.sh
```

Configurar cron para ejecución diaria:
```bash
crontab -e
# Agregar: 0 3 * * * /home/pi/.openclaw/workspace/backup.sh
```

## Acciones Inmediatas

| # | Tarea | Deadline |
|---|-------|----------|
| 1 | Integrar formulario Comenzar → WhatsApp | 48h |
| 2 | Decidir Elemental Pong (archivar/permanecer) | Esta semana |
| 3 | Implementar sistema de captura | Esta semana |
| 4 | Crear cuentas redes sociales prioritarias | Esta semana |
| 5 | Publicar primer batch de contenido | Próxima semana |

## Plataformas de Redes Sociales (Planificadas)

| Cuenta | Plataforma | Objetivo | Estado |
|--------|-----------|----------|--------|
| @PauloARIS | Twitter/X | Divulgación personal | Por crear |
| @PauloSaldivar | Twitter/X | Divulgación política/legal | Por crear |
| Paulo Saldivar | LinkedIn | Profesional/institucional | Por crear |
| @PauloSaldivar | YouTube | Contenido audiovisual | Por crear |
| POLAB SpA | Twitter/X | Legaltech empresarial | Por crear |
| POLAB SpA | LinkedIn | B2B empresarial | Por crear |

## Acceso

- **Dashboard:** http://192.168.1.31:8080/dashboard.html
- **Workspace:** /home/pi/.openclaw/workspace/
- **WhatsApp:** Canal principal configurado

## Tecnologías Usadas

- **Python 3** — Scripts, base de datos SQLite
- **HTML/Tailwind** — Dashboard
- **React** — Landing page
- **Git** — Control de versiones
- **OpenClaw** — Canal WhatsApp
- **SQLite** — Base de datos local

---

*Sistema ARIS v1.1 — 2026-01-30*
*Actualizado: Sección Social Media integrada*
