# IA Autónoma y Agentes "Jefe de Gabinete" en Borde

**Referencia:** Arquitectura completa para Raspberry Pi 5 (2026)
**Fuente:** Documento técnico extenso (~10,000 palabras)

---

## 1. Resumen Ejecutivo

**Objetivo:** Implementar agentes autónomos tipo "Chief of Staff" en hardware limitado (RPi 5, 8GB RAM).

**Componentes clave:**
- SLMs cuantizados (Phi-3 Mini, Qwen 2.5, Mistral)
- Bases de datos vectoriales embebidas (LanceDB, Mem0)
- Marcos de orquestación (Open Interpreter, Activepieces)
- Verificación formal (Z3 Prover)

---

## 2. Hardware: Raspberry Pi 5

| Componente | Especificación | Relevancia |
|------------|----------------|------------|
| CPU | Cortex-A76 (4 cores, 2.4GHz) | Inferencia ARM NEON |
| RAM | 8GB LPDDR4X | Modelos hasta 7B |
| Almacenamiento | NVMe SSD | Carga rápida de modelos |
| Refrigeración | Active Cooler obligatorio | throttling a 85°C |

**Benchmark esperado:**
- Phi-3 Mini (3.8B, Q4_K_M): 6-9 t/s
- Qwen 2.5 (0.5B): 30-45 t/s
- Mistral 7B: 2-4 t/s

---

## 3. Stack Tecnológico Recomendado

### 3.1 Capa de Inferencia

| Herramienta | Rol | Estado |
|-------------|-----|--------|
| Ollama | Servidor/Orquestador | ⭐ YA DISPONIBLE |
| llama.cpp | Inferencia bare-metal | ⭐ YA DISPONIBLE |

**Modelos recomendados:**

| Modelo | Tamaño | Rol | Velocidad RPi5 |
|--------|--------|-----|----------------|
| Qwen 2.5 | 0.5B / 1.5B | Router/Clasificador | 30-45 t/s |
| Phi-3 Mini | 3.8B | Razonador General | 6-9 t/s |
| DeepSeek Coder | 1.3B | Especialista código | Variable |
| Mistral 7B | 7B | Tareas complejas | 2-4 t/s |

### 3.2 Capa de Memoria

| Herramienta | Tipo | Estado | Notas |
|-------------|------|--------|-------|
| **LanceDB** | Vector DB embebido | ⬜ PENDIENTE | Serverless, disk-based |
| **Mem0** | Memoria agéntica | ⬜ PENDIENTE | Capa RAG inteligente |
| ChromaDB | Vector DB | ⚠️ ALTERNATIVA | Más pesado en RAM |

### 3.3 Capa de Orquestación/Acción

| Herramienta | Tipo | Estado | Notas |
|-------------|------|--------|-------|
| **Open Interpreter** | Ejecución código | ⬜ PENDIENTE | Control real del sistema |
| **Activepieces** | Low-code automation | ⬜ PENDIENTE | Alternativa ligera a n8n |
| n8n | Low-code automation | ⚠️ ALTERNATIVA | Más pesado |

### 3.4 Capa de Voz

| Función | Herramienta | Estado | Notas |
|---------|-------------|--------|-------|
| STT (voz→texto) | Whisper.cpp | ⭐ YA DISPONIBLE | Optimizado NEON |
| TTS (texto→voz) | Piper | ⬜ PENDIENTE | Voces neuronales ligeras |
| Hardware DSP | Mic USB con cancelación | ⬜ REQUIERE | Recomendado Jabra/Anker |

### 3.5 Capa de Verificación

| Herramienta | Propósito | Estado |
|-------------|-----------|--------|
| **Z3 Prover** | Verificación formal | ⬜ PENDIENTE |
| Hypothesis | Property-based testing | ⬜ PENDIENTE |
| CrossHair | Ejecución simbólica | ⬜ PENDIENTE |

---

## 4. Arquitectura de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                      ENTRADA SENSORIAL                       │
│           Micrófono USB con DSP → Whisper.cpp               │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLASIFICADOR (ROUTER)                     │
│              Qwen 2.5 0.5B (30-45 t/s)                       │
│         Clasifica: Comando simple / Memoria / Complejo      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 RECUPERACIÓN DE MEMORIA                      │
│              Mem0 + LanceDB (consulta RAG)                   │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               RAZONAMIENTO Y PLANIFICACIÓN                   │
│              Phi-3 Mini (3.8B, 6-9 t/s)                      │
│              Genera plan de acción estructurado              │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 VERIFICACIÓN (GUARDRAÍLES)                   │
│              Z3 Prover + Reglas Regex                        │
│           Previene: rm -rf, comandos peligrosos              │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       EJECUCIÓN                              │
│    ┌──────────────────┐    ┌──────────────────┐             │
│    │ Open Interpreter │    │   Activepieces   │             │
│    │  (Scripts local) │    │  (Webhooks/API)  │             │
│    └──────────────────┘    └──────────────────┘             │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      RESPUESTA                               │
│         Piper TTS → Audio + Memoria (Mem0)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Casos de Uso Identificados

### 5.1 Agente Personal "Chief of Staff"
- Gestión de calendario y tareas
- Respuesta a correos electrónicos
- Resumen de documentación

### 5.2 Agente de Testeo de Videojuegos
- Monitoreo de repositorio
- Ejecución headless de builds
- Detección y reporte de bugs

### 5.3 PCG Asistido (Generación Procedimental)
- Generación iterativa de mapas/niveles
- Evaluación automática con métricas
- Aprendizaje de parámetros óptimos

---

## 6. Próximos Pasos de Implementación

### Fase 1: Fundación
- [ ] Instalar LanceDB (embebido)
- [ ] Configurar Ollama con Phi-3 Mini y Qwen 2.5
- [ ] Probar inferencia local básica

### Fase 2: Memoria
- [ ] Implementar Mem0 para memoria persistente
- [ ] Configurar índices en LanceDB
- [ ] Testear RAG con documentos

### Fase 3: Acción
- [ ] Instalar Open Interpreter local
- [ ] Configurar Activepieces (Docker)
- [ ] Crear flujos básicos de automatización

### Fase 4: Voz
- [ ] Configurar Whisper.cpp streaming
- [ ] Instalar Piper TTS
- [ ] Integrar micrófono USB con DSP

### Fase 5: Verificación
- [ ] Integrar Z3 Prover para validación
- [ ] Crear reglas de seguridad
- [ ] Testear ciclo completo

---

## 7. Comparación de Alternativas

| Categoria | Recomendado RPi5 | Alternativa | Cuándo usar |
|-----------|------------------|-------------|-------------|
| Inference | Ollama | llama.cpp | Control total vs facilidad |
| Vector DB | LanceDB | ChromaDB | Serverless vs popularidad |
| Automation | Activepieces | n8n | Ligereza vs ecosistema |
| TTS | Piper | Mimic 3 | Calidad vs opensource |
| STT | Whisper.cpp | Faster-Whisper | CPU vs CPU+optimizaciones |

---

## 8. Referencias y Links

- Ollama: https://ollama.com
- Llama.cpp: https://github.com/ggerganov/llama.cpp
- LanceDB: https://lancedb.com
- Mem0: https://mem0.ai
- Open Interpreter: https://openinterpreter.com
- Activepieces: https://www.activepieces.com
- Whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Piper TTS: https://github.com/rhasspy/piper
- Z3 Prover: https://github.com/Z3Prover/z3
- Hypothesis: https://hypothesis.works

---

*Documento almacenado: 2026-02-01*
*Referencia principal para proyectos de IA autónoma en borde*
