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

## Próximos Pasos
- [ ] Configurar Foundry para self-modification
- [ ] Instalar sentence-transformers en servidor x64
- [ ] Implementar RAG con chromadb + langchain
- [ ] Mejorar "Comenzar" según feedback
- [x] Mejorar juegos con ECS/RAG/Shaders (2026-02-02)
