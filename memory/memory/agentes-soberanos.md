# Arquitectura de Agentes Autónomos Soberanos

**Referencia:** Convergencia de aprendizaje continuo, gobernanza y borde
**Fecha:** 2026-02-01
**Fuente:** Documento técnico extenso

---

## 1. Los 6 Ejes de la Arquitectura

| Eje | Enfoque | Tecnologías Clave |
|-----|---------|-------------------|
| **I. Aprendizaje Continuo** | Sin auto-deriva | RAG, GraphRAG, Dynamic Few-Shot, Self-Correction |
| **II. Memoria Jurídica** | Versionado y trazabilidad | LanceDB Time Travel, Agent Traces |
| **III. Autonomía Graduada** | Niveles L1-L5 | Certificados, ODD, Supervisión Jerárquica |
| **IV. Economía del Agente** | Micro-SaaS | FinOps, Arbitraje de Modelos |
| **V. Infraestructura Borde** | Raspberry Pi ARM64 | Ollama, Docker, LanceDB embebido |
| **VI. Autocontención** | Frenos internos | Guardrails AI, Outlines, Watchdogs |

---

## 2. EJE I: Aprendizaje Continuo sin Auto-Deriva

### 2.1 Fine-Tuning vs RAG

| Aspecto | Fine-Tuning | RAG |
|---------|-------------|-----|
| **Actualización** | Estática (requiere reentrenamiento) | Dinámica (DB actualizable) |
| **Alucinaciones** | Mayor riesgo | Menor riesgo (contexto verificable) |
| **Privacidad** | Datos "congelados" en pesos | Datos externos controlables |
| **Costo** | Alto (entrenamiento) | Bajo (consultas) |

**Conclusión:** RAG > Fine-tuning para agentes que necesitan datos actualizados.

### 2.2 GraphRAG: Memoria Relacional

**Problema del RAG vectorial:** No captura relaciones entre entidades distantes.

**Solución GraphRAG:**
1. Extraer grafo de conocimiento de documentos
2. Construir jerarquías comunitarias
3. Generar resúmenes por comunidad
4. Recorrer el grafo para razonar

### 2.3 Dynamic Few-Shot Prompting

```python
# Pseudocódigo
def get_few_shots(current_task):
    # Buscar tareas similares exitosas
    similar = vector_db.search(current_task, k=3)
    return [exp.output for exp in similar if exp.success]
```

### 2.4 Ciclos de Reflexión

| Patrón | Descripción |
|--------|-------------|
| **Self-RAG** | Genera tokens de reflexión sobre calidad |
| **Corrective RAG** | Re-búsqueda si baja confianza |
| **Productor-Crítico** | Dos sub-agentes: genera vs evalúa |

---

## 3. EJE II: Memoria como Sistema Jurídico

### 3.1 Time Travel con LanceDB

```python
# Consultar estado en T pasado
from lancedb import connect

db = connect("~/.agent_memory")
table = db.open_table("memories")

# Viaje en el tiempo
past_state = table.version(1706822400)  # Timestamp específico
```

### 3.2 Taxonomía de Memoria

| Tipo | Propósito | Persistencia |
|------|-----------|--------------|
| **Corto plazo** | Contexto activo LLM | RAM (ventana) |
| **Largo plazo** | Base de conocimiento | LanceDB versionado |
| **Episódica** | Experiencias exitosas | Vectorial indexada |
| **Forense** | Auditoría legal | Inmutable, firmada |

### 3.3 Migraciones de Esquema

```
Problema: Actualizar modelo de embedding rompe compatibilidad
Solución: 
- Reindexación controlada
- Múltiples índices por versión
- Registro de versiones agente-datos
```

---

## 4. EJE III: Autonomía Graduada (L1-L5)

| Nivel | Autonomía | Rol Humano | Ejemplo |
|-------|-----------|------------|---------|
| **L1: Operador** | herramienta pasiva | Control total | Script manual |
| **L2: Colaborador** | propone, ejecuta con aprobación | Supervisor activo | Asistente código |
| **L3: Consultor** | autónomo, escala excepciones | Pasivo (alertas) | Support tech |
| **L4: Aprobador** | dominio definido (ODD) | Auditoría post-hoc | Trading financiero |
| **L5: Observador** | autonomía total | Solo monitoreo | Sistema multi-agente |

### 4.1 ODD (Operational Design Domain)

```yaml
certificado_autonomia:
  nivel: L3
  odd:
    herramientas_permitidas: [read_file, search_web, write_code]
    presupuesto_tokens: 10000
    ventana_temporal: "09:00-18:00 CL"
    datos_accesibles: [docs_internos]
```

---

## 5. EJE IV: Economía del Agente

### 5.1 Modelos Micro-SaaS Viables

| Modelo | Descripción | Requisitos |
|--------|-------------|------------|
| **Curaduría de Contenido** | Newsletters automatizados | RAG + Generación |
| **Monitoreo Seguridad** | Sonda de red inteligente | Pi-hole + análisis |
| **Generación Activos** | Código, datasets sintéticos | Agente de código |

### 5.2 FinOps para Agentes

| Estrategia | Ahorro |
|------------|--------|
| **Optimización de Contexto** | Solo información necesaria |
| **Arbitraje de Modelos** | Loocal (gratis) vs Cloud (caro) |
| **Presupuestación** | Límites por acción |

---

## 6. EJE V: Infraestructura RPi

### 6.1 Stack Recomendado

| Componente | Herramiencia | Nota |
|------------|--------------|------|
| **Inference** | Ollama + llama.cpp | CPU ARM optimizado |
| **Vector DB** | LanceDB | Embebido, serverless |
| **Contenedores** | Docker Compose | Orquestación ligera |
| **Almacenamiento** | SSD USB 3.0 | E/S críticas |

### 6.2 Optimizaciones RPi

```bash
# Cuantización agresiva para RPi 5 (8GB)
ollama run phi3:mini --quantize Q4_K_M

# Gestión térmica
vcgencmd measure_temp
# Si > 85°C, reducir frecuencia o activar cooling
```

---

## 7. EJE VI: Autocontención

### 7.1 Guardrails Deterministas

```python
from guardrails import Guard

guard = Guard().use(
    # Bloquear PII
    PIIValidator,
    # Asegurar formato JSON
    JsonFormatter,
    # Verificar tono apropiado
    ToneValidator, tone="professional"
)

# Validar salida del agente
result = guard.validate(agent_output)
```

### 7.2 Generación Estructurada con Outlines

```python
from outlines import generate, regex

# Forzar esquema JSON
generator = generate.json(model, schema=AgentAction)
action = generator("Busca información sobre...")
```

### 7.3 Watchdogs

| Tipo | Implementación | Acción |
|------|----------------|--------|
| **Systemd Watchdog** | `WatchdogSec=30` en servicio | Reinicio automático |
| **Semantic Watchdog** | Detectar bucles de acciones | Forzar reflexión |
| **Thermal Watchdog** | Monitoreo de temperatura | Throttling gradual |

---

## 8. Conexión con Nuestro Stack

| Este Documento | Nuestro Stack | Estado |
|----------------|---------------|--------|
| **RAG + GraphRAG** | vector-memory | ⬜ Extender a GraphRAG |
| **Dynamic Few-Shot** | local-ai-orchestrator | ⬜ Implementar |
| **Self-Correction** | z3-verifier | ⬜ Related |
| **Autonomía Graduada** | - | ⬜ REQUIERE |
| **Guardrails AI** | z3-verifier | ⚠️ Base |
| **Time Travel** | vector-memory | ⬜ LanceDB feature |
| **Watchdogs** | - | ⬜ REQUIERE |

---

## 9. Nuevas Skills Potenciales

| Skill | Descripción | Prioridad |
|-------|-------------|-----------|
| **graph-rag** | Implementación de GraphRAG | Media |
| **autonomy-certificates** | Sistema de certificados ODD | Alta |
| **guardrails-core** | Guardrails AI + Outlines | Alta |
| **agent-watchdog** | Sistema de watchdogs | Media |

---

## 10. Referencias

- **AgentOps/LangSmith**: Trazabilidad de agentes
- **Guardrails AI**: https://github.com/guardrails-ai
- **Outlines**: https://github.com/outlines-dev/outlines
- **LanceDB Time Travel**: https://lancedb.com
- **Self-RAG**: https://github.com/AkariAsai/selfRAG

---

*Documento almacenado: 2026-02-01*
*Complementa: `memory/ia-autonoma-borde.md`, `memory/exo-cerebro-seguridad.md`*
