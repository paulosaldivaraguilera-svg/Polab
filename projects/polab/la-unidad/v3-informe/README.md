# 📰 LA UNIDAD v3.0 — Refinería de Coyuntura

## Descripción

Sistema automatizado que transforma noticias RSS en **Informes de Coyuntura** con análisis desde perspectiva marxista y detección de oportunidades legislativas.

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   RSS FEED  │ ──→ │   OPENCLAW  │ ──→ │   ANÁLISIS  │ ──→ │   INFORME   │
│  (5 fonts)  │     │   AGENTES   │     │   MARXISTA  │     │   HTML/PDF  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Estructura

```
v3-informe/
├── template-informe.html   # Template del informe
├── cli.js                  # CLI para generación manual
├── workflow.json           # Configuración del workflow
├── rss-collector.js        # Agente recolector RSS
└── README.md               # Este archivo
```

## Uso

### CLI (generación manual)
```bash
# Generar informe de hoy
node cli.js

# Generar informe de fecha específica
node cli.js --fecha 2026-02-01

# Previsualizar (stdout)
node cli.js --preview
```

### OpenClaw Workflow
```bash
# Programar generación diaria a las 9:00
# El workflow se ejecuta automáticamente según schedule en workflow.json
```

## Salida

Genera: `informe-YYYY-MM-DD.html`

### Estructura del Informe

1. **Síntesis Ejecutiva** — 100 palabras
2. **Análisis de Patrones** — Temas + Contradicciones
3. **Mapa de Fuerzas** — Izquierda / Centro / Derecha
4. **Oportunidades Legislativas** — Proyectos y vacíos legales
5. **Análisis Marxista** — Lucha de clases + plusvalía
6. **Predicción 72h** — Tendencias
7. **Fuentes** — Conteo por fuente

## Configuración

Edita `cli.js` para modificar:
- Fuentes RSS
- Templates
- Límites de artículos

## Ejemplo de Output

Ver `informe-demo.html` para ejemplo completo.

---

**La unidad es la fuerza.** 💙🔴
