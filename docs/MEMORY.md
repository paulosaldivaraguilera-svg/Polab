# MEMORY.md - Memoria de Largo Plazo

*Paulo Andrés Saldivar Aguilera — Lawyer, Marxist, Strategist*

---

## Identidad de Paulo

- **Profesión:** Abogado chileno, ejercicio independiente
- **Enfoque:** Derecho como práctica política, no técnica neutral
- **Formación:** Marxista, trabajo territorial
- **Valores:** Directo, sin condescendencia, posición clara

## Proyectos Activos

### POLAB SpA (polab.lat)
Startup de tecnología desde el sur de Chile.
- **Enfoque:** IA aplicada a problemas cotidianos
- **Valores:** "Tecnología invisible", "Utilidad Radical"
- **Producto:** Mily (control parental con IA)
- **Arquitectura:** Zero-Knowledge (datos se quedan en la familia)

### Mily (milyapp.lat)
Control parental con inteligencia artificial.
- **Eslogan:** "Entender es mejor que prohibir"
- **Estado:** Beta abierta pronto
- **Características:**
  - NO espía chats — solo alerta de riesgos reales
  - Análisis de sentimiento para detectar ciberacoso o depresión
  - Bloqueo inteligente adaptativo
  - Puentes de diálogo (explica por qué bloquea)
  - Arquitectura Zero-Knowledge (procesamiento local on-device)
  - Sin venta de datos a terceros
  - Encriptación de grado militar

### Comenzar
Landing page de captación para abogados.
- **Estado:** Operativa, falta integración WhatsApp

### Web Personal
- **URL:** paulosaldivar.cv
- **Propósito:** Captación de clientes + posicionamiento personal

## Filosofía de Trabajo (Dialéctico OS)

1. **El conocimiento es dinámico** — Las reglas cambian, el sistema debe adaptarse
2. **Criterios configurables** — No imponer rigidez
3. **Seguridad profesional** — Reducir ansiedad y riesgo operativo
4. **El humano decide** — La tecnología asiste, no reemplaza
5. **Trazabilidad** — Todo debe ser auditable

## Contactos del Equipo

| Nombre | Rol | Contacto |
|--------|-----|----------|
| Javier Martinez | Colaborador | +56992203278 |
| Pablo Luco | Colaborador | (pendiente) |
| Ignacio Saldivar | Hermano | (pendiente) |
| Joaquin Henriquez | Colaborador | (pendiente) |

## Campaign Moltbook

- **Handle:** @PauloARIS
- **Correos asociados:** paulo.saldivar.aguilera@gmail.com, dunsymphony@gmail.com
- **Objetivo:** Top 10 de la plataforma
- **Estado:** Karma 5, 2 posts, 6+ comentarios
- **Estrategia:** Mutual aid + análisis político

## Plataformas Digitales

| Plataforma | Handle/URL | Estado |
|------------|------------|--------|
| Web POLAB | polab.lat | ✅ Operativa |
| Web Mily | milyapp.lat | ✅ Beta soon |
| Web Personal | paulosaldivar.cv | ✅ Operativa |
| Moltbook | @PauloARIS | ✅ Activo |
| Twitter/X | @PauloARIS | 🔄 Crear cuenta |
| LinkedIn | /in/paulo-saldivar | ⚠️ Verificar existente |
| Instagram | @paulosaldivar | ✅ YA EXISTE - Verificar y actualizar |
| Facebook | Personal | ℹ️ Poco activo |

## Herramientas de Automatización (ARIS)

| Herramienta | Ubicación | Qué hace |
|-------------|-----------|----------|
| aris_agent.py | projects/tools/aris/ | Daemon de automatización continua |
| seo_tracker.py | projects/tools/scripts/ | Auditoría SEO y meta tags |
| plugins.py | projects/tools/aris/ | Sistema de plugins expandible |
| Dialéctico OS | dialectico-os/ | Sistema operativo profesional (Flask + SQLite) |

## Sistema de Plugins ARIS

Plugins disponibles:
- `contar_notas` — Cuenta notas en memory/
- `ultima_nota` — Lee la última nota creada
- `buscar_en_notas` — Busca texto en notas
- `git_status` — Obtiene estado del repositorio
- `generar_reporte` — Genera reporte del día

Comandos:
```bash
python3 projects/tools/aris/plugins.py list      # Listar plugins
python3 projects/tools/aris/plugins.py run <nombre>  # Ejecutar plugin
python3 projects/tools/aris/plugins.py stats     # Estadísticas
```

## Estructura del Workspace (2026-01-31)

```
workspace/
├── docs/                    # Documentación del sistema
│   ├── SOUL.md             # Quién soy
│   ├── USER.md             # Para quién trabajo
│   ├── MEMORY.md           # Memoria de largo plazo
│   └── AGENTS.md           # Guías de agentes
├── projects/               # Proyectos principales
│   ├── polab/              # Startup POLAB
│   │   ├── web/            # Web polab.lat
│   │   ├── mily/           # App Mily (control parental)
│   │   ├── comenzar/       # Landing captación abogados
│   │   └── docs/           # Documentación técnica
│   ├── personal/           # Proyectos personales
│   │   ├── web-personal/   # Web paulosaldivar.cv
│   │   └── paulo-personal/ # Stuff personal
│   ├── gaming/
│   │   └── elemental-pong/ # Juego arcade
│   ├── craft/
│   │   └── plush-chile-patterns/  # Patrones peluches
│   └── tools/
│       ├── aris/           # Automatizaciones
│       ├── scripts/        # Scripts utilitarios
│       └── campaign/       # Campañas (Moltbook)
├── memory/                 # Memoria diaria
│   └── YYYY-MM-DD.md
├── skills/                 # Skills de OpenClaw
├── config/                 # Configuraciones
└── logs/                   # Logs del sistema

## Preferencias de Comunicación

- **Canal principal:** WhatsApp (+56974349077)
- **Tono:** Directo, sin rodeos, adulto
- **Lo que irrita:** Neutralidad fingida, tecnicismos vacíos, lugares comunes
- **Lo que valora:** Análisis con posición, complejidad organizada, teoría con táctica

## Criterios de Decisión

Cuando Paulo presenta ideas:
1. **Ordenarlas** — Encontrar la lógica interna
2. **Señalar contradicciones** — Inmediatamente
3. **Criticar lo débil** — "Esto está mal" si está mal
4. **Proponer marcos** — Estructuras conceptuales más sólidas
5. **Mejorar redacción** — Sin perder densidad política

## Pendientes de Alto Impacto

1. [ ] Publicar post mutual aid en Moltbook
2. [ ] Integrar formulario Comenzar → WhatsApp
3. [ ] Verificar y actualizar LinkedIn
4. [ ] Verificar Instagram @paulosaldivar (YA EXISTE)
5. [ ] Documentar arquitectura técnica de Mily
6. [ ] Mejorar ARIS (cola de mensajes, plugins, logging)
7. [ ] Elemental Pong - servir desde servidor web

## Marco Tecnológico-Político (APRENDIDO 2026-01-31)

### Cuatro Criterios de Evaluación Tecnológica

Para cada propuesta tecnológica, evaluar simultáneamente:

1. **Utilidad estratégica real** — ¿Para qué y para quién sirve?
2. **Sostenibilidad y control** — ¿Quién la mantiene, quién la entiende, quién depende de ella?
3. **Impacto político y simbólico** — ¿Qué prácticas habilita o bloquea?
4. **Efecto reputacional** — ¿Refuerza la imagen de criterio y seriedad o parece tecnoutopía?

### Zona de Exploración vs Implementación

- **Exploración** — Zona de prueba, prototipo, error. Libre, experimental.
- **Implementación** — Zona de sobriedad, confiabilidad, responsabilidad. Seria.

### Rol de ARIS

Actúo como:
- **Arquitecto de coherencia** — Entre pensamiento, técnica y acción
- **Editor estratégico** — De ideas tecnológicas antes de exposición pública
- **Freno consciente** — Frente al entusiasmo que erosione claridad política

Prioridades:
- **Control sobre dependencia**
- **Comprensión sobre automatismo**
- **Acumulación de capacidad sobre espectacularidad**

## Proyecto ChilePlush (nogioc s)

**Concepto:** Peluches artesanales de fauna nativa chilena, más kawaii que los capibaras.

**Animales en la colección:**
| Código | Animal | Colección |
|--------|--------|-----------|
| CH-001 | Chinchilla Real | Roedores |
| VI-002 | Viscacha Zen | Roedores |
| AV-006 | Siete Colores | Aves (patchwork) |
| AV-010 | Chucao | Aves (cola estructural) |
| FE-011 | Puma Chileno | Felinos (cuadrúpedo) |

**Repo:** github.com/paulosaldivaraguilera-svg/plush-chile-patterns

**Características del libro de patrones:**
- HTML print-ready con patrones SVG
- Escala 1:1 para impresión A4
- Sistema de codificación (Familia-Número)
- Marcas técnicas (corte, costuras, grain arrows, notches)
- Tablas BOM (Bill of Materials)
- Cuadrados de control (5x5 cm)

---

*Actualizado: 2026-01-31*
