# Infraestrutura Computacional y Metodologías de Rigor Científico

**Referencia:** Documento técnico compartido el 2026-02-01

## 1. Verificación Formal

| Herramienta | Enfoque | Uso Principal |
|-------------|---------|---------------|
| **Frama-C** (Eva, WP) | Interpretación Abstracta, Lógica de Hoare | Verificación de seguridad y corrección en C |
| **SPARK Ada** | Correctness by Construction | Sistemas críticos, eliminación de runtime errors |
| **TLA+ / TLC** | Lógica Temporal | Especificación de protocolos distribuidos |
| **CompCert** | Semántica Formal | Compilación de C verificada |

## 2. Simulación Física

| Herramienta | Física | Aplicación |
|-------------|--------|------------|
| **SOFA Framework** | FEM, Mecánica de Medios Continuos | Simulación médica, robótica soft |
| **Project Chrono** | Dinámica Multicuerpo DVI | Vehículos, interacción sólido-fluido |
| **SPlisHSPlasH** | SPH incompresible | Fluidos de alta fidelidad |
| **Vega FEM** | FEM No Lineal + Reducción | Deformables en tiempo real |

## 3. Arquitecturas Cognitivas

| Sistema | Enfoque | Caso de Uso |
|---------|---------|-------------|
| **Soar** | Reglas + Chunking | Agentes con aprendizaje simbólico |
| **ACT-R** | Cognición híbrida humano-máquina | Simulación de comportamiento realista |
| **GVGAI/VGDL** | Descripción de juegos | IA general adaptable |
| **Ludii** | Ludemes | Análisis de juegos de estrategia |

## 4. Generación Procedimental (PCG)

| Técnica | Fundamento | Aplicación |
|---------|------------|------------|
| **WaveFunctionCollapse** | Satisfacción de restricciones | Niveles/topologías consistentes |
| **GraphSynth** | Gramáticas de Grafos | Diseño de misiones, estructuras |
| **Evolución Gramatical** | Algoritmos genéticos + BNF | Optimización de parámetros |

## 5. Ciencia de Datos

| Herramienta | Propósito |
|-------------|-----------|
| **OpenTelemetry** | Telemetría estandarizada |
| **Open Game Data** | Datos educativos/juegos |
| **Game Ontology Project** | Clasificación formal de mecánicas |

## Resumen para Desarrollo

Este documento establece estándares para:
- **Software crítico:** Usar Frama-C/SPARK
- **Física realista:** Usar SOFA/Chrono/SPlisHSPlasH  
- **IA avanzada:** Integrar Soar/ACT-R o marcos GVGAI
- **PCG riguroso:** Aplicar WFC/Gramáticas de Grafos
- **Validación empírica:** OpenTelemetry + Open Game Data

---
*Guardado para referencia futura en desarrollo de software y entornos virtuales.*
