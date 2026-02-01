# 🎮 Proyectos de Videojuegos - Paulo Saldívar

## Resumen de Proyectos

Este workspace contiene 3 proyectos de videojuegos completos y un sistema filosófico.

---

## 🎮 JUEGOS

### 1. ELEMENTAL PONG v2.1
**Género:** Arcade / Party Game  
**Tecnologías:** HTML5 Canvas, Web Audio API

**Características:**
- ✅ Sistema de audio completo
- ✅ Partículas avanzadas
- ✅ Power-ups (vida extra, ralentizar, paleta gigante)
- ✅ Sistema de achievements
- ✅ Modo 2 jugadores local
- ✅ Efectos visuales (glow, gradient animado)

**Ubicación:** `projects/gaming/elemental-pong/prototype_v2.1.html`

**Controls:**
- `← →` Mover paleta
- `SPACE` Cargar poder
- `C` Chrono Break
- `P` Pausa

---

### 2. RECTA PROVINCIA v2.0
**Género:** RPG / Folk Horror  
**Ambientación:** Folklore chilote, siglo XIX  
**Tecnologías:** HTML5 Canvas, Vanilla JS

**Características:**
- ✅ Sistema de diálogos con árbol de decisiones
- ✅ 2 NPCs (Brujo Anciando, La Pincoya)
- ✅ Sistema de quests con recompensas
- ✅ Karma dinámico según decisiones
- ✅ 3 transformaciones (Humano, Alcatraz, Chonchón)
- ✅ HUD completo con Quest Tracker
- ✅ Sistema de audio básico

**Ubicación:** `projects/gaming/recta-provincia/prototype_v2.0.html`

**Controls:**
- `← → ↑ ↓` Mover
- `A` Transformar (según karma)
- `SPACE` Atacar
- `E` Interactuar
- `SHIFT` Correr

---

### 3. DELITOS v1.5
**Género:** RPG de Investigación / Cyberpunk Thriller  
**Ambientación:** Santiago de Chile, 2024  
**Tecnologías:** HTML5, Vanilla JS, LocalStorage

**Características:**
- ✅ **18 CASOS COMPLETOS** (Ato 1-3)
- ✅ Sistema de selección de casos
- ✅ Party system (3 personajes jugables)
- ✅ Sistema de evidencias
- ✅ Guardado automático (localStorage)
- ✅ Diseño visual cyberpunk

**Casos Incluidos:**

| Ato | Casos | Progreso |
|-----|-------|----------|
| SOMBRAS | C1-C6 | ✅ Completo |
| CONSPIRACIÓN | C7-C12 | ✅ Completo |
| FILTRO | C13-C18 | ✅ Completo |

**Ubicación:** `projects/polab/videojuegos/delitos/index_v1.5.html`

---

## 🧠 SISTEMA DIALÉCTICO v2.0

Marco de razonamiento filosófico que implementa tres paradigmas:

### Paradigmas
1. **Kantiano** - Categorías fijas, imperativo categórico
2. **Hegeliano** - Dialéctica, Aufhebung, proceso histórico
3. **Marxista** - Materialismo histórico, lucha de clases

### Uso

```python
from sistema_dialectico_v2 import SistemaDialecticoV2

sd = SistemaDialecticoV2()

# Análisis comparativo
resultado = sd.analizar("tu texto", modo="triadico")

# Comparación formateada
print(sd.comparar_perspectivas("texto"))

# Método dialéctico
resultado = sd.dialektika(tesis, antitesis)
```

### CLI
```bash
python3 ai_modules/sistema_dialectico_v2.py "tu texto" --comparar
```

**Documentación:** `ai_modules/GUIA_INTEGRACION.md`

---

## 📊 DASHBOARD CENTRAL

Panel de control unificado para acceder a todos los proyectos.

**Ubicación:** `DASHBOARD.html`

Incluye:
- Estadísticas de proyectos
- Links directos a los 3 juegos
- Estado del Sistema Dialéctico
- Documentación relevante

---

## 📁 Estructura del Workspace

```
workspace/
├── DASHBOARD.html              # Panel central
├── projects/
│   ├── gaming/
│   │   ├── elemental-pong/     # Pong arcade
│   │   └── recta-provincia/    # RPG folk horror
│   └── polab/
│       └── videojuegos/
│           └── delitos/         # 18 casos
├── ai_modules/
│   ├── sistema_dialectico_v2.py
│   └── GUIA_INTEGRACION.md
├── Polab/
│   └── dialectico-os/          # Sistema de gestión
├── memory/
│   └── 2026-02-01.md          # Memoria de sesión
├── PROYECTOS_MEJORAS.md        # Estado de proyectos
└── backup_proyectos.sh         # Script de backup
```

---

## 🚀 Inicio Rápido

### Probar los juegos
```bash
# Ver en navegador
firefox DASHBOARD.html
firefox projects/polab/videojuegos/delitos/index_v1.5.html
firefox projects/gaming/recta-provincia/prototype_v2.0.html
firefox projects/gaming/elemental-pong/prototype_v2.1.html
```

### Backup
```bash
chmod +x backup_proyectos.sh
./backup_proyectos.sh
```

### Sistema Dialéctico
```bash
python3 ai_modules/sistema_dialectico_v2.py "texto a analizar" --comparar
```

---

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Proyectos completados | 4/4 (100%) |
| Casos en DELITOS | 18/18 (100%) |
| Total archivos | 50+ |
| Tamaño workspace | ~6.5 MB |

---

## 📝 Notas

- Todos los juegos son HTML5 autosuficientes (sin dependencias externas)
- DELITOS incluye sistema de guardado en LocalStorage
- Sistema Dialéctico requiere Ollama para análisis avanzado
- Los juegos funcionan offline (excepto fuentes Google Fonts)

---

## 🧑‍💻 Autor

**Paulo Andrés Saldívar Aguilera**  
Creador de videojuegos indie • Desarrollador AI Stack

---

*Última actualización: 2026-02-01*
