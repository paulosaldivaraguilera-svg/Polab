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

### 🎮 Classic Edition
- **Tecnología:** Three.js + Canvas 2D
- **Características:** Modo historia, dificultad progresiva

---

## 🚀 Cómo Jugar

### WebGPU (Navegadores modernos)
1. Abre `prototype_v2.1.html` en Chrome 113+
2. Espera carga de shaders WebGPU
3. ¡Juega con teclado o gamepad!

### Classic
1. Abre `index.html` o `prototype.html`
2. Controles: W/S o flechas arriba/abajo

---

## 🎯 Características

| Característica | Estado | Descripción |
|---------------|--------|-------------|
| WebGPU Renderer | ✅ | THREE.WebGPURenderer |
| Sistema Elemental | ✅ | Fuegos, hielos, venenos |
| Partículas 100K | ✅ | InstancedMesh |
| Audio Procedural | ✅ | Web Audio API |
| Modo Historia | ✅ | 3 niveles |
| Dificultad IA | ✅ | 3 niveles |
| Gamepad | ✅ | API estándar |

---

## 🛠️ Tecnologías

- **Three.js** - Render engine
- **WebGPU** - Next-gen graphics API
- **Web Audio API** - Sonido procedural
- **Gamepad API** - Controladores
- **ECS Pattern** - Arquitectura

---

## 📁 Estructura

```
elemental-pong/
├── index.html          # Landing page del juego
├── prototype.html      # Versión Classic
├── prototype_v2.1.html # Versión WebGPU
├── assets/
│   ├── audio/          # Sounds procedimentales
│   └── textures/       # Sprites y efectos
└── docs/
    └── ROADMAP_TECNICO.md
```

---

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| W / ↑ | Mover pala arriba |
| S / ↓ | Mover pala abajo |
| Space | Iniciar / Pausar |
| Esc | Menú |

---

## 🔜 Próximas Features

- [ ] Modo multijugador online
- [ ] Tabla de posiciones
- [ ] Logros y achievements
- [ ] skins y customización
- [ ] Mobile touch controls

---

**Desarrollado:** 2026-02-01  
**Estado:** ✅ En desarrollo activo
