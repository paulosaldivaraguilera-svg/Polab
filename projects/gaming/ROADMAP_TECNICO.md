# Roadmap Técnico: Videojuegos HTML5 (2026)

**Última actualización**: 2026-02-01  
**Basado en**: Arquitectura Vanguardia HTML5 2025-2026 (v6)

---

## 🎯 Visión

Transformar los proyectos de juegos actuales usando arquitecturas de vanguardia:
- **WebGPU** para gráficos de consola
- **ECS** para rendimiento masivo
- **WebTransport** para multijugador
- **WebLLM** para IA narrativa

---

## 📁 Proyectos y su Evolución

### elemental-pong

| Aspecto | Actual (Canvas) | Objetivo (WebGPU) |
|---------|-----------------|-------------------|
| Renderizado | Canvas 2D | Three.js WebGPU |
| Partículas | CPU limitado | Compute Shader (1M+) |
| Audio | HTML5 Audio | AudioWorklet + Síntesis |
| IA | Random | Minimax (Wasm) |

**Siguiente paso**: Three.js WebGPU Renderer

### recta-provincia

| Aspecto | Actual | Objetivo |
|---------|--------|----------|
| Física | Simple | Compute Shader |
| Multijugador | ❌ | WebTransport |
| Audio | Samples | HRTF 3D |
| IA | ❌ | WebLLM NPC |

**Siguiente paso**: Physics Compute Shader

### Santiago Filtro Sombras (GDD)

| Aspecto | Estado | Tecnología |
|---------|--------|------------|
| Narrativa | GDD existente | WebLLM emergent |
| Generación | Manual | PCG + IA |
| Combate | Draft | ECS Wasm |
| Mundo | Mapas | WebGPU Terrain |

**Siguiente paso**: Implementar ECS base

---

## 🛠️ Stack Tecnológico Objetivo

```
┌─────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN              │
│  Three.js WebGPU  │  Babylon.js  │  Phaser 3      │
├─────────────────────────────────────────────────────┤
│                   CAPA DE LÓGICA                    │
│  ECS (Structure of Arrays)  │  Wasm (Rust/Go)     │
├─────────────────────────────────────────────────────┤
│                   CAPA DE DATOS                     │
│  WebTransport  │  SharedArrayBuffer  │  IndexedDB │
├─────────────────────────────────────────────────────┤
│                   CAPA DE IA                        │
│  WebLLM (Phi-3/Llama)  │  Pathfinding A* Wasm    │
└─────────────────────────────────────────────────────┘
```

---

## 📚 Knowledge Base

| Insight | Archivo | Relevancia |
|---------|---------|------------|
| WebGPU Architecture | v6/arquitectura_html5_vanguardia_2026.md | Base técnica |
| Three.js WebGPURenderer | docs.openclaw.ai | Implementación |
| ECS Patterns | v2/arquitectura_polabcore.md | Rendimiento |
| WebAssembly SIMD | docs.molt.bot | Física acelerada |

---

## 🚀 Plan de Implementación

### Fase 1: WebGPU Foundation (Q1 2026)
- [ ] Setup Three.js WebGPU Renderer
- [ ] Convertir elemental-pong a WebGPU
- [ ] Implementar Compute Shader particles

### Fase 2: ECS Architecture (Q2 2026)
- [ ] Diseñar ECS schema para juegos
- [ ] Implementar System de física
- [ ] Migrar recta-provincia a ECS

### Fase 3: Multiplayer & IA (Q3-Q4 2026)
- [ ] WebTransport setup
- [ ] Santiago Filtro Sombras GDD
- [ ] WebLLM integration prototype

---

## 📦 Dependencias a Instalar

```bash
# Three.js con WebGPU
npm install three@next

# Wasm physics engine
npm install @dimforge/rapier3d-wasm

# ECS framework
npm install bitECS

# WebLLM
npm install @webllm/core

# Basis Universal (compresión)
npm install @basisUniversal/core
```

---

## 🎓 Recursos de Aprendizaje

1. **WebGPU Fundamentals**: gpuweb.github.io
2. **Three.js WebGPU**: threejs.org/docs/webgpu
3. **ECS Patterns**: bitECS.dev
4. **Wasm SIMD**: webassembly.org/features

---

*Documento generado automáticamente por Polab Core*
