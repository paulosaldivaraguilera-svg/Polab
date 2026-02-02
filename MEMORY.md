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

## Próximos Pasos
- [ ] Configurar Foundry para self-modification
- [ ] Instalar sentence-transformers en servidor x64
- [ ] Implementar RAG con chromadb + langchain
- [ ] Mejorar "Comenzar" según feedback
