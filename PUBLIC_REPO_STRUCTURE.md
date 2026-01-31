# Estructura de Repositorios - polab/workspace

## Repositorios Públicos (github.com/paulosaldivaraguilera-svg/)

| Repo | Contenido | Acceso |
|------|-----------|--------|
| **polab** | Infraestructura principal, scripts de automatización | Público |
| **elemental-pong** | Juego arcade open source | Público |
| **paulosaldivar-web** | Web personal (pública) | Público |
| **comenzar-landing** | Landing page captación (pública) | Público |
| **dialectico-os** | Sistema jurídico (código) | Público |
| **plush-chile-patterns** | Patrones de peluches (generales) | Público |

## Repositorios Privados (solo local o acceso restringido)

| Contenido | Razón |
|-----------|-------|
| `memory/` | Notas diarias, datos sensibles |
| `docs/MEMORY.md` | Info personal, contactos, proyectos detallados |
| `docs/USER.md` | Datos del usuario |
| `docs/IDENTITY.md` | Identidad privada |
| `backups/` | Backups de memoria |
| `logs/` | Logs con datos de actividad |
| `projects/tools/aris/` | Automatizaciones internas |
| `projects/tools/campaign/` | Campañas con estrategia |
| `affiliate-polymarket.md` | Análisis de riesgo |
| `plan-negocio.md` | Estrategia comercial |
| `reunion-celula-*.md` | Reuniones políticas |

## Archivos a Eliminar/Excluir del Público

```bash
# Ejemplo .gitignore para repos público
memory/
backups/
logs/
*.log
.env
docs/MEMORY.md
docs/USER.md
docs/IDENTITY.md
*.local
agenda-*
notas-personales/
```
