# Foundry - Self-Writing Extension

*Instalado: 2026-01-31*

## Estado

| Métrica | Valor |
|---------|-------|
| Herramientas | 23 disponibles |
| Patterns | 0 crystallized |
| Insights | 0 |
| Workflows | 0 |

## Herramientas Principales

| Herramienta | Descripción |
|-------------|-------------|
| `foundry_research` | Buscar mejores prácticas en docs |
| `foundry_implement` | Research + implementación |
| `foundry_write_extension` | Crear extensión OpenClaw |
| `foundry_write_skill` | Crear skill package |
| `foundry_extend_self` | Escribir herramientas en Foundry mismo |
| `foundry_restart` | Reiniciar gateway con contexto |
| `foundry_evolve` | Analizar y mejorar herramientas |
| `foundry_crystallize` | Convertir patrones en hooks |

## Outcome Learning

| Herramienta | Uso |
|-------------|-----|
| `foundry_track_outcome` | Registrar tarea para tracking |
| `foundry_record_feedback` | Grabar métricas de engagement |
| `foundry_get_insights` | Obtener recomendaciones aprendidas |

## Activación

```bash
openclaw plugins install @getfoundry/foundry-openclaw
openclaw gateway restart
```

## Configuración (en openclaw.json)

```json
{
  "plugins": {
    "entries": {
      "foundry": {
        "enabled": true,
        "config": {
          "autoLearn": true,
          "sources": {
            "docs": true,
            "experience": true,
            "arxiv": true,
            "github": true
          }
        }
      }
    }
  }
}
```

## Cómo Funciona

1. **Observa** - Cada workflow se registra
2. **Aprende** - Patrones con 5+ usos y 70% éxito se cristalizan
3. **Escribe** - Genera herramientas/hooks automáticamente
4. **Mejora** - El sistema se mejora a sí mismo

## Próximos Pasos

- Usar `foundry_research` para investigar APIs específicas
- Dejar que observe workflows reales para aprender
- Activar crystallization de patrones útiles
