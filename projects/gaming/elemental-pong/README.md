# Elemental Pong: Chrono & Chaos

Juego de Pong arcade con sistema elemental y control del tiempo.

## 🎮 Versiones Disponibles

### 🌐 WebGPU Edition (Nueva - 2026-02-01)
**Estado:** ✅ Preview
- **Tecnología:** THREE.WebGPURenderer
- **Arquitectura:** ECS Pattern
- **Partículas:** InstancedMesh (100K capacidad)
- **Audio:** Web Audio API procedural
- **Características:** Compute shader-ready

**Para probar:**
```bash
# Requiere navegador con WebGPU (Chrome 113+)
open elemental-pong/webgpu-version.html
```

### 📦 Canvas 2D (Original)
**Versión:** 0.2.0 (Jugable)
- ✅ Pong funcional (Jugador vs CPU)
- ✅ Sistema Chrono-Break (tiempo lento)
- ✅ Controles keyboard (flechas/Shift/Espacio)
- ✅ Controles touch para mobile
- ✅ Partículas y efectos visuales
- ✅ Sistema de scoring

---

## 🎯 Cómo Jugar

### Controles (Desktop)
| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Mover paleta |
| `ESPACIO` | Activar elemento cargado |
| `SHIFT` | Activar Chrono-Break (tiempo lento) |

### Controles (Mobile)
| Gesture | Acción |
|---------|--------|
| Touch + Arrastrar | Mover paleta |
| Doble tap | Chrono-Break |

---

## 🎮 Mecánicas

### Chrono-Break
Barra de "Chrono" se llena con golpes precisos (centro de paleta).
- **Activación:** 100% Chrono + SHIFT
- **Efecto:** Tiempo se ralentiza (0.1x) por 2 segundos
- **Uso:** Reposicionar o salvar puntos imposibles

### Sistema Elemental
| Elemento | Efecto |
|----------|--------|
| 🔥 **Fuego** | Velocidad++ + rastro |
| ❄️ **Hielo** | Fricción-- + congelación |
| ⚡ **Rayo** | Movimiento zig-zag |
| 🌍 **Tierra** | Pesada + empuja paleta |

---

## 🛠️ Tech Stack (WebGPU)

| Capa | Tecnología |
|------|------------|
| Renderer | THREE.WebGPURenderer |
| Arquitectura | ECS Pattern |
| Partículas | InstancedMesh + Compute Shader ready |
| Audio | Web Audio API (procedural) |
| Lenguaje | JavaScript (ES2024) |

---

## 📁 Estructura

```
elemental-pong/
├── index.html              # Canvas 2D Original
├── webgpu-version.html     # 🌐 WebGPU Edition (Nueva)
├── prototype_v2.1.html     # Prototipo anterior
├── README.md               # Este archivo
└── docs/
    └── GDD.md              # Documento de diseño original
```

---

## 🚀 Roadmap Técnico

### Fase 1 - WebGPU Foundation ✅
- [x] THREE.WebGPURenderer setup
- [x] ECS Pattern implementation
- [x] InstancedMesh particles
- [x] Web Audio synthesis

### Fase 2 - Compute Shaders (Próximo)
- [ ] Physics en GPU
- [ ] Partículas 1M+ con Compute Shader
- [ ] Post-processing effects

### Fase 3 - Multijugador
- [ ] WebTransport integration
- [ ] Servidor de juego
- [ ] Matchmaking

---

## 📦 Dependencias

**WebGPU Edition:**
- Three.js 0.170.0 (cargado via CDN)
- Ninguna dependencia local

**Canvas 2D:**
- Solo Google Fonts (Orbitron, Rajdhani)

---

## 🔧 Desarrollo

```bash
# WebGPU (requiere Chrome 113+ / Edge)
cd projects/gaming/elemental-pong
python3 -m http.server 8080
# Abrir http://localhost:8080/webgpu-version.html

# Canvas 2D Original
open elemental-pong/index.html
```

---

*Creado: 2026-01-31*
*Actualizado: 2026-02-01 (WebGPU Edition)*
*Basado en GDD original de 2026-01-30*
