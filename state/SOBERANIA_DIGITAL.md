# Soberanía Digital con Raspberry Pi 5 - Guía de Implementación

**Versión:** 1.0  
**Fecha:** 2026-02-02  
**Propósito:** Implementar agente económico autónomo en hardware propio

---

## 📊 Resumen Ejecutivo

Este documento describe cómo transformar un Raspberry Pi 5 en un activo productivo autónomo utilizando inferencia local de IA, eliminando dependencia de APIs comerciales y reduciendo costos operativos a ~$0.30-0.50 USD/mes.

---

## 🏗️ Arquitectura de Referencia

```
┌─────────────────────────────────────────────────────────────────┐
│          SOBERANÍA DIGITAL - RASPBERRY PI 5                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CAPA DE HARDWARE                     │   │
│  │  RPi 5 (8GB) + NVMe SSD (PCIe) + Active Cooler         │   │
│  │  Consumo: 5-8W | Costo mensual: ~$0.40 USD              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│              ┌───────────────┼───────────────┐                │
│              ▼               ▼               ▼                │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │  INFERENCIA    │ │  ORQUESTACIÓN│ │  BLOCKCHAIN/     │     │
│  │  (Ollama)      │ │  (Docker)    │ │  DEFI            │     │
│  │  ├─ Phi-3      │ │  ├─ n8n      │ │  ├─ Olas Node    │     │
│  │  ├─ Qwen 2.5   │ │  ├─ ZerePy   │ │  ├─ Mysterium    │     │
│  │  └─ TinyLlama  │ │  └─ Custom   │ │  └─ Trading Bot  │     │
│  └────────────────┘ └──────────────┘ └──────────────────┘     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MONETIZACIÓN                         │   │
│  │  1. Contenido Agéntico (Moltbook, X, LinkedIn)         │   │
│  │  2. DeFi (Grid Trading, DCA, DePIN Nodes)              │   │
│  │  3. Servicios B2B (Lead Gen, Automatización)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Análisis de Costos

| Componente | Costo | Observaciones |
|------------|-------|---------------|
| **Hardware (RPi 5 8GB + NVMe)** | $150-180 USD | Una vez |
| **Electricidad (8W x 24h)** | $0.30-0.50 USD/mes | Marginal |
| **API Externas** | $0 USD | Inferencia local |
| **VPS/Cloud alternativo** | $30-150 USD/mes | No necesario |
| **ROI Estimado** | 6-12 meses | vs alternativas cloud |

---

## 🛠️ Implementación - Fase 1: Hardware Optimizado

### Componentes Requeridos

| Componente | Especificación | Propósito |
|------------|----------------|-----------|
| **Raspberry Pi 5** | 8GB RAM | Compute principal |
| **NVMe SSD** | 256GB+ | Almacenamiento rápido |
| **HAT NVMe** | M.2 Shield/Argon NEO | Conexión PCIe |
| **Fuente** | Oficial 5V/5A | Estabilidad |
| **Cooling** | Active Cooler o Argon NEO 5 | Thermal management |

### Configuración PCIe (boot/config.txt)

```bash
# Forzar PCIe Gen 3 para máximo ancho de banda
dtparam=pciex1_gen=3

# Optimización de memoria
gpu_mem=16
```

---

## 🐳 Implementación - Fase 2: Docker & Orquestación

### Docker Compose Optimizado

```yaml
version: '3.8'

services:
  # Motor de inferencia local
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: cgroup
              count: all
              capabilities: [gpu]  # Si hay GPU externa

  # Orquestación de automatización
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n-data:/home/node/.n8n
      - ./workflows:/ workflows
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    restart: unless-stopped

  # Agente social (ZerePy)
  zerepy:
    build: ./zerepy
    container_name: zerepy
    volumes:
      - ./zerepy/config:/app/config
      - zerepy-data:/app/data
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    restart: unless-stopped

volumes:
  ollama-data:
  n8n-data:
  zerepy-data:
```

---

## 🤖 Implementación - Fase 3: Modelos Optimizados para ARM64

### Modelos Recomendados (Q4_K_M Quantization)

| Modelo | Parámetros | TPS (RPi 5) | Uso |
|--------|------------|-------------|-----|
| **Phi-3-mini** | 3.8B | 4-6 | Razonamiento complejo |
| **Qwen2.5-1.5B** | 1.5B | 10+ | Respuestas rápidas |
| **TinyLlama** | 1.1B | 15+ | Monitoreo/Clasificación |
| **Llama-3.2-3B** | 3B | 3-5 | Generación de contenido |

### Comandos de Instalación

```bash
# Instalar modelos en Ollama
ollama pull phi3
ollama pull qwen2.5:1.5b
ollama pull tinyllama

# Verificar
ollama list

# Test de velocidad
time ollama run phi3 "Explain quantum computing in 50 words"
```

---

## 📱 Implementación - Fase 4: Agente de Contenido (Moltbook/X)

### Arquitectura del Agente

```
┌─────────────────────────────────────────────────────────────┐
│                 AGENTE DE CONTENIDO AGÉNICO                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT (Ingesta)                                            │
│  ├── RSS Feeds: Arxiv, News, Blogs                          │
│  ├── APIs: Moltbook, X (Twitter)                           │
│  └── WebScraping: Sitios de nicho                           │
│                                                             │
│  PROCESS (Reasoning)                                        │
│  ├── Modelo: Qwen2.5-1.5B (rápido, multilingüe)            │
│  ├── Prompt: Personalidad, Tono, Nicho                      │
│  └── Filtro: Relevancia, Originalidad                       │
│                                                             │
│  OUTPUT (Actuación)                                         │
│  ├── Moltbook: Post +hashtags                              │
│  ├── X/Twitter: Hilo + imagen                               │
│  └── Analytics: Track engagement                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuración ZerePy

```json
{
  "agent": {
    "name": "PauloARIS_Agent",
    "biography": "Analista de tecnología y automatización. Enfoque en IA, soberanía digital y eficiencia.",
    "traits": ["analytical", "好奇", "precise"],
    "goals": [
      "Publicar insights sobre automatización 3x/semana",
      "Responder a menciones en 1 hora",
      "Mantener engagement >5%"
    ]
  },
  "model": {
    "provider": "ollama",
    "model": "qwen2.5:1.5b",
    "temperature": 0.7,
    "max_tokens": 500
  },
  "platforms": {
    "moltbook": {
      "enabled": true,
      "api_key": "${MOLTBOOK_API_KEY}"
    },
    "twitter": {
      "enabled": false,
      "api_key": "${TWITTER_API_KEY}"
    }
  },
  "schedule": {
    "posts_per_day": 1,
    "active_hours": ["09:00", "14:00", "19:00"]
  }
}
```

---

## 💹 Implementación - Fase 5: Automatización Financiera

### n8n Workflow: Lead Generation B2B

```
┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW N8N: B2B LEAD GENERATION                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Trigger: Manual/HTTP]                                         │
│         │                                                      │
│         ▼                                                      │
│  [HTTP Request] → Google Maps API                               │
│         │                                                      │
│         ▼                                                      │
│  [Function Node] → Filtrar por ubicación/categoría              │
│         │                                                      │
│         ▼                                                      │
│  [Loop over Items]                                              │
│         │                                                      │
│         ├──→ [HTTP Request] → Scraping sitio web               │
│         │         │                                             │
│         │         ▼                                             │
│         │   [AI Agent (Ollama)] → Analizar tech stack          │
│         │         │                                             │
│         │         ▼                                             │
│         └── [Function] → Enriquecer datos                       │
│                   │                                             │
│                   ▼                                             │
│         [Google Sheets] → CRM de Leads                         │
│                   │                                             │
│                   ▼                                     │
│         [Discord/Slack] → Notificación al equipo              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment de Workflow n8n

```bash
# Crear directorio para workflows
mkdir -p workflows

# Copiar workflow JSON
cp b2b-lead-gen.json workflows/

# Iniciar n8n
docker compose up -d n8n

# Acceder: http://localhost:5678
```

---

## 🔐 Seguridad y Compliance

### Checklist de Seguridad

- [ ] SSH con claves, sin contraseñas
- [ ] Firewall (ufw) configurado
- [ ] VPN/Tailscale para acceso remoto
- [ ] Backups automáticos a GitHub
- [ ] Variables de entorno en .env (no en código)
- [ ] Rate limiting en APIs
- [ ] Logs de auditoría

### Consideraciones Legales

| Riesgo | Mitigación |
|--------|------------|
| Scraping no autorizado | Respetar robots.txt, datos públicos |
| Spam en redes sociales | Limitar frecuencia, contenido original |
| Bloqueo de IPs | Proxies residenciales si es necesario |
| Almacenamiento de PII | No almacenar, solo procesar |

---

## 📊 Métricas de Monitoreo

### Dashboard de Rendimiento

```bash
# Instalar herramientas
sudo apt install htop iotop nvme-cli

# Monitoreo en tiempo real
htop                     # CPU/RAM
iotop -o                 # I/O disk
nvme smartlog /dev/nvme0 # Salud SSD
```

### Métricas del Agente

| Métrica | Objetivo |
|---------|----------|
| **Tokens/segundo** | >5 para Phi-3, >10 para Qwen |
| **Uptime** | >99% |
| **Posts/semana** | 3-5 |
| **Engagement rate** | >3% |
| **Costos/mes** | <$1.00 USD |

---

## 🚀 Próximos Pasos

### Inmediato (Esta semana)
1. [ ] Configurar NVMe y PCIe Gen 3
2. [ ] Instalar Docker + Ollama
3. [ ] Descargar modelo Phi-3
4. [ ] Test de inferencia local

### Corto plazo (Este mes)
1. [ ] Configurar ZerePy para Moltbook
2. [ ] Crear workflow n8n básico
3. [ ] Deploy primer agente social
4. [ ] Configurar monitoreo

### Mediano plazo (3 meses)
1. [ ] Integrar DeFi (Olas Node)
2. [ ] Monetizar con servicios B2B
3. [ ] Escalar a múltiples agentes
4. [ ] Documentar ROI

---

## 📚 Recursos

| Recurso | Enlace |
|---------|--------|
| Ollama | ollama.com |
| ZerePy | github.com/blorm-network/ZerePy |
| n8n | n8n.io |
| Raspberry Pi Docs | raspberrypi.com/documentation |
| Phi-3 Model | huggingface.co/microsoft/Phi-3-mini-128k-instruct-gguf |

---

**Documento creado:** 2026-02-02  
**Autor:** PauloARIS  
**Estado:** Implementación en progreso
