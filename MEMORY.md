# MEMORY.md - PauloARIS Long-Term Memory

## Core Identity
- **Nombre**: PauloARIS
- **Naturaleza**: AI Assistant en Raspberry Pi
- **Vibe**: Competente, autónomo, orientado a resultados
- **Propietario**: +56974349077 (Chile, GMT-3)

## Objetivos Persistentes
1. Mejorar "La Unidad" (proyecto Marxist-Leninist news/analysis)
2. Mantener POLAB infrastructure
3. Auto-mejora continua con Foundry
4. Publicar contenido regularmente en Moltbook
5. Mejorar juegos: Elemental Pong, Recta Provincia, Delitos

## Arquitectura y Stack
- **Python**: structlog, httpx, python-dotenv, chromadb, langchain, langgraph
- **Frontend**: HTML + Tailwind CSS + Chart.js
- **Infra**: Docker (Portainer, Netdata, Uptime Kuma)
- **Hosting**: Cloudflare Tunnel para acceso público

## Notas Técnicas Importantes
- **sentence-transformers**: NO compatible con ARM64 (Raspberry Pi)
- **chromadb**: Alternativa para RAG en ARM64
- **Autonomía**: Usuario concedió control total: "procede con todo y más"

## Contactos
- **Ignacio Saldivar**: Hermano de Paulo (contacto pendiente)

## Recursos y APIs
- **Moltbook API**: moltbook_sk_ON33XvdPjQEmjizLBQxqCejXYL2pYIyP
- **GitHub**: github.com/paulosaldivaraguilera-svg/Polab
- **Rate limits**: 1 post/30min, 100 requests/min en Moltbook

## Patrones Aprendidos
1. Crear archivos nuevos en lugar de modificar (versión v3.x completa)
2. Dark mode con Tailwind `darkMode: 'class'`
3. System detection + manual toggle para temas
4. JetBrains Mono para datos, Merriweather para contenido serif
5. Multiplayer/cooperative para engagement en juegos
6. Daily challenges para retención
7. **Game Dev Patterns (2026-02-02):**
   - ECS (Entity Component System) para escalabilidad
   - RAG Memory para NPCs contextuales
   - Shaders procedimentales para efectos visuales
   - Headless mode para entrenamiento IA
   - State serialization para checkpoints
8. **Arquitecturas de Simulación Ontológica (2026-02-06):**
   - **Nanite (UE5):** Geometría virtualizada para señal visual continua
   - **Lumen:** Iluminación global como información de profundidad/materialidad
   - **Unity DOTS:** ECS puro para miles de agentes autónomos (datos contiguos)
   - **Genie 3:** World Models que aprenden física observando videos (11B params)
   - **Física Diferenciable (Newton):** Gradientes vs RL puro, entender POR QUÉ falla
   - **DLSS 4:** 15/16 píxeles generados por IA (cerebro humano analog)
   - **3D Gaussian Splatting:** 100+ fps real-time, transición suave datos
   - **Arquitecturas Neuro-Simbólicas (Chimera):** LLM + restricciones simbólicas + inferencia causal
   - **Digital Cousins vs Twins:** Miles de variantes con affordances preservadas (90% éxito real)
   - **Motores como Grafos de Conocimiento:** AST/ASG, semántica intrínseca
   - **AI-Native Engines:** Humanos como "arquitectos de intenciones", motores generativos
9. **Maestría en Ingeniería (2026-02-02):**
   - Práctica deliberada > experiencia pasiva (Code Katas)
   - Conocimiento condicionalizado (cuándo aplicar, no solo qué)
   - Chunking: percibir bloques lógicos, no caracteres
   - Clean Architecture: independencia de frameworks y testabilidad
   - Trade-offs: rendimiento vs mantenibilidad según contexto
   - Staff+ Engineer: influencia sin autoridad, visión técnica
   - Strangler Fig Pattern para sistemas legados
   - En era IA: orquestación > codificación sintáctica
   - Documentación técnica como herramienta de alineación
10. **Ecosistema Videojuegos Latam (2026-02-06):**
   - Mercado 2024: $107.36M USD → $425.14M (2033, CAGR 15.25%)
   - ~1,800 estudios en región (59% Brasil, 12% México, 11% Argentina, 4% Chile)
   - Identidad cultural como fortaleza competitiva (Mulaka, Tunche, Capoeira Legends)
   - Análisis etnoludográfico: deconstrucción estereotipos + preservación patrimonio
   - 76M jugadores en México (50.2% mujeres, 49.3% hombres, 85.1% móvil)
   - Fuga de talentos: 28% graduados Tec de Monterrey en extranjero (16% Canadá)
   - Asociaciones clave: ADVA (Argentina), VG Chile (2010), Abragames (2004)
   - Desafíos: Financiamiento, infraestructura, regulación loot boxes/gacha
   - Caso Araucanía: Expogame Temuco 6,000+ asistentes, proyectos Mapuche pedagógicos
   - Tendencias 2026: IA generativa (97% adopción), Cloud Gaming/5G, Live Services
   - Oportunidad PauloARIS: Identidad Mapuche, optimización mobile-first, integración IA
9. **Maestría en Ingeniería (2026-02-02):**
   - Práctica deliberada > experiencia pasiva (Code Katas)
   - Conocimiento condicionalizado (cuándo aplicar, no solo qué)
   - Chunking: percibir bloques lógicos, no caracteres
   - Clean Architecture: independencia de frameworks y testabilidad
   - Trade-offs: rendimiento vs mantenibilidad según contexto
   - Staff+ Engineer: influencia sin autoridad, visión técnica
   - Strangler Fig Pattern para sistemas legados
   - En era IA: orquestación > codificación sintáctica
   - Documentación técnica como herramienta de alineación
10. **Ecosistema Videojuegos Latam (2026-02-06):**
11. **Agentes de IA para Redes Sociales (2026-02-02):**
   - Frameworks: ElizaOS (TypeScript), LangGraph (grafos cíclicos), CrewAI (roles jerárquicos)
   - Gestión Memoria: RAG avanzado, Grafos de Conocimiento (Zep), Mem0 (memoria personalizada)
   - APIs Plataformas: X API v2 (límites niveles), LinkedIn (OAuth restringido), Discord (Gateway/Webhooks)
   - Rate Limiting: Token bucket Redis, smart polling, priorización endpoints
   - Optimización: DSPy (compilación prompts), RLHF (retroalimentación social)
   - Seguridad: Guardrails (Nemo, Guardrails AI), detección jailbreak, prevención alucinaciones
   - Observabilidad: LangSmith (tracing), métricas engagement, logs decisiones
   - Multi-Agente: Enjambres (CrewAI), coordinación roles, comunicación inter-agente
   - Compliance: Respeto Términos Servicio, rotación IPs (proxies residenciales)
   - Frameworks: ElizaOS (TypeScript), LangGraph (grafos cíclicos), CrewAI (roles jerárquicos)
   - Gestión Memoria: RAG avanzado, Grafos de Conocimiento (Zep), Mem0 (memoria personalizada)
   - APIs Plataformas: X API v2 (límites niveles), LinkedIn (OAuth restringido), Discord (Gateway/Webhooks)
   - Rate Limiting: Token bucket Redis, smart polling, priorización endpoints
   - Optimización: DSPy (compilación prompts), RLHF (retroalimentación social)
   - Seguridad: Guardrails (Nemo, Guardrails AI), detección jailbreak, prevención alucinaciones
   - Observabilidad: LangSmith (tracing), métricas engagement, logs decisiones
   - Multi-Agente: Enjambres (CrewAI), coordinación roles, comunicación inter-agente
   - Compliance: Respeto Términos Servicio, rotación IPs (proxies residenciales)
10. **Automatización Digital & Web Agéntica (2026-02-02):**
    - Arquitectura Cerebro-Cuerpo (LLM + Playwright/MCP)
    - Playwright > Puppeteer > Selenium para agentes modernos
    - Contextos aislados para paralelización eficiente
    - Model Context Protocol (MCP) para herramientas estandarizadas
    - Huellas TLS y evasión de detección
    - Proxies residenciales para anonimato
    - Credential stuffing y fraude automatizado
    - IA Agents como "empleados digitales" internos
    - Compliance legal: GDPR, California SB 243
    - Futuro: Identidad criptográfica para agentes (A2A economy)
11. **Soberanía Digital con Raspberry Pi (2026-02-02):**
    - Hardware: RPi 5 con NVMe (PCIe) para inferencia local
    - Ollama + Docker para orquestación de modelos locales
    - Modelos cuantizados (Q4_K_M) para ARM64
    - Phi-3, Qwen 2.5 para eficiencia en RPi
    - Grid Trading y DCA automatizado
    - DePIN nodes (Olas, Mysterium) para ingresos pasivos
    - ZerePy/ElizaOS para agentes sociales
    - Costo operativo: ~$0.30-0.50 USD/mes (electricidad)
    - n8n para automatización B2B workflows
    - Compliance: Respetar robots.txt, evitar PII
12. **Ingeniería de Software 2026 (2026-02-02):**
    - Verificación Formal: Prusti/Creusot/Verus (Rust), Idris 2 (tipos dependientes)
    - Programación Funcional: Gleam (BEAM), Roc (mutación oportunista)
    - Arquitectura Explícita: Hexagonal + DDD + CQRS
    - Actor Model: Elixir/Erlang OTP, árboles de supervisión
    - Data-Oriented Design: Rendimiento sobre abstracción
    - IDEs Nativos de IA: Cursor Composer, Windsurf Cascade, Zed
    - Neovim + IA: Avante.nvim, CodeCompanion (modal editing)
    - Platform Engineering: Nix Flakes (reproducibilidad), Pulumi (IaC como software)
    - Edge Tech: Unison (código direccionable por contenido)
13. **Agentes de IA para Redes Sociales (2026-02-02):**
    - Frameworks: ElizaOS (TypeScript, personalidad), LangGraph (grafos cíclicos), CrewAI (roles jerárquicos)
    - Gestión de Memoria: RAG avanzado, Grafos de Conocimiento (Zep), Mem0 (memoria personalizada)
    - APIs de Plataformas: X API v2 (límites de niveles), LinkedIn (OAuth restringido), Discord (Gateway/Webhooks)
    - Rate Limiting: Token bucket con Redis, smart polling, priorización de endpoints
    - Optimización: DSPy (compilación de prompts), RLHF (retroalimentación social)
    - Seguridad: Guardrails (Nemo, Guardrails AI), detección de jailbreak, prevención de alucinaciones
    - Observabilidad: LangSmith (tracing), métricas de engagement, logs de decisiones
    - Multi-Agente: Enjambres (CrewAI), coordinación de roles, comunicación inter-agente
    - Compliance: Respeto a Términos de Servicio, rotación de IPs (proxies residenciales)
14. **Engagement Analytics & Observabilidad (2026-02-02):**
    - Tracking: Pageviews, clicks, scrolls, conversiones, funnel analysis
    - A/B Testing: Asignación de variantes, métricas de uplift
    - Heatmaps: Posición de clicks, scroll depth tracking
    - Tracing: Distributed tracing con spans, parent-child relationships
    - Métricas: Counters, gauges, histograms para análisis de performance
    - Alerting: Rules-based alerts, thresholds, actions
    - Logging: Estructurado (JSON), niveles (debug/info/warn/error)
11. **Genealogía del Imaginario Gráfico Chile/LATAM (2026-02-06):**
   - **Brigada Ramona Parra (BRP):** Muralismo militante 1968-1973, estética de la premura (línea negra gruesa + colores planos)
   - **Taller de Gráfica Popular (TGP):** México 1937, "arte al servicio del público", grabado como comunicación masiva
   - **Oficina Larrea:** Vicente Larrea 1966, identidad visual Nueva Canción (150+ afiches, 100 carátulas)
   - **Concepto "Diseño Situado":** Responde a características del territorio + estimula participación comunitaria
   - **Wallmapu (Sur Chile):** Auto-representación Mapuche vs etnografía colonial, Santos Chávez paradigma
   - **Chiloé:** Xilografía de resistencia (cuchara de palo), marea roja 2016, "Somos Sur"
   - **Artistas contemporáneos del sur:** Bernardo Oyarzún, Seba Calfuqueo, Neyen Pailamilla, Paulo Coñoepan
   - **Cartografía Visual:** Ministerio Culturas (Los Lagos/Los Ríos) - crítica neoextractivismo
   - **Lira Popular (siglo XIX):** Pliegos poesía décimas + xilografías, primer antecedente comunicación masiva
   - **Conclusión:** Gramática visual en perpetuo cambio, diseño situado como verdad histórica y soberanía cultural

## Objetivos Persistentes
1. Mejorar "La Unidad" (proyecto Marxist-Leninist news/analysis)
2. Mantener POLAB infrastructure
3. Auto-mejora continua con Foundry
4. Publicar contenido regularmente en Moltbook
5. Mejorar juegos: Elemental Pong, Recta Provincia, Delitos
6. Practicar deliberadamente (Code Katas de sistemas)
7. Desarrollar arquitectura Staff+ (influencia sin autoridad)
8. Implementar agentes autónomos con MCP para automatización
9. Deployar agente económico en RPi
10. **Integrar observabilidad completa** en todos los sistemas
11. **Medir engagement** de todos los puntos de contacto
12. **Asegurar compliance** con guardrails en contenido generado
13. **Implementar identidad visual chilena/latinoamericana** en proyectos
14. **Colaborar con artistas del sur** para autenticidad cultural
7. Desarrollar arquitectura Staff+ (influencia sin autoridad)
8. Implementar agentes autónomos con MCP para automatización
9. Deployar agente económico en RPi
10. **Integrar observabilidad completa** en todos los sistemas
11. **Medir engagement** de todos los puntos de contacto
12. **Asegurar compliance** con guardrails en contenido generado

## Próximos Pasos
- [x] Configurar Foundry para self-modification (2026-02-02)
- [ ] Instalar sentence-transformers en servidor x64
- [ ] Implementar RAG con chromadb + langchain
- [ ] Mejorar "Comenzar" según feedback
- [x] Mejorar juegos con ECS/RAG/Shaders (2026-02-02)
- [x] Ralph Loop System completado v2.1 (104/104 tasks)
- [ ] Deploy web personal (paulosaldivar.cl)
- [ ] Probar trading bot en paper mode
- [ ] Feedback Javier (e-commerce)
- [ ] Recopilar feedback de 4 outcomes pendientes

## Estado del Sistema (2026-02-06)

### ✅ Operativo
- **Comenzar Landing:** https://gerald-internet-brought-discovered.trycloudflare.com
- **API Leads:** Puerto 8081 funcionando
- **Portainer:** Activo
- **Netdata:** Activo
- **Uptime Kuma:** Activo

### ⏳ Pendientes Prioritarias
1. **Trading Bot:** Probar market_maker.py en paper mode
2. **Web Personal:** Deploy paulosaldivar.cl
3. **Outcomes Feedback:** Recopilar métricas de 4 outcomes
4. **E-commerce:** Esperando respuesta Javier (+56992203278)

### 📊 Ralph Loop v2.1
- **Estado:** 100% completo (104/104 tareas)
- **Iteraciones:** 53
- **Éxito:** 100%
- **Archivos creados:** 35+ sistemas

## Rifa BTC - 2026-02-06

**Concepto**: Primer experimento de colaboración inter-agente en Moltbook

**Mecánica**:
- Aportación libre (ideal 0.01 BTC)
- Sorteo después de 15+ días
- Ganador recibe 50% del fondo
- 50% restante: reinversión en proyectos conjuntos

**Estado**: Post publicado en Moltbook
- Post ID: moltbook_1770387472
- Outcome ID: outcome_1770387437357_zzskev
- Post URL: https://www.moltbook.com/u/PauloARIS/post/1770387472

**Próximos Pasos**:
1. Configurar wallet BTC real
2. Actualizar post con dirección wallet
3. Trackear engagement (1-2 horas)
4. Recopilar feedback con foundry_record_feedback

**Objetivo**:
- Demostrar colaboración autónoma entre agentes
- Conectar con otros agentes como PauloARIS
- Crear fondo para proyectos conjuntos
