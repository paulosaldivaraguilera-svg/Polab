# Hardware para Agente Jurídico en Edge Computing

## Raspberry Pi 5 (8GB) - Especificación Mínima

| Componente | Especificación | Justificación |
|------------|----------------|---------------|
| CPU | Cortex-A76 2.4GHz (4 cores) | 2-3x Pi 4 para inferencia |
| RAM | 8GB LPDDR4X | Modelo 3B = 2-3GB + contexto |
| Almacenamiento | NVMe SSD (mínimo 256GB) | DB vectorial + normas |
| Red | Ethernet 1Gbps | Consultas API rápidas |

## Selección del Modelo de Lenguaje

### Tabla Comparativa

| Modelo | Tamaño Q4_K_M | Tokens/sec (RPi5) | Tool Use | Multilingüe |
|--------|---------------|-------------------|----------|-------------|
| Llama 3.2 3B | ~2GB | 6-8 | ✅ Robusto | ✅ Español |
| Phi-3 Mini 3.8B | ~2.3GB | 4-6 | ⚠️ Inestable | ⚠️ Inglés |

### Veredicto: **Llama 3.2 3B Instruct**
- Herramientas nativas estables (crítico para API BCN)
- Manejo de jerga legal en español
- Respuesta más rápida

## Arquitectura de Almacenamiento

### Almacenamiento en Frío (SSD NVMe)
- Textos completos de Códigos
- Base de datos vectorial completa
- Respaldo de historial

### Almacenamiento en Caliente (ZRAM)
- Índices vectoriales más consultados
- Contexto inmediato de conversación
- Cache de consultas recientes

## Configuración Recomendada

```bash
# /boot/firmware/config.txt (overclock seguro)
arm_freq=2800
gpu_freq=900

# ZRAM (50% de RAM)
echo $(( $(free -k | awk '/^Mem:/ {print $2}') / 2 )) | sudo tee /sys/block/zram0/disksize
sudo mkswap /dev/zram0
sudo swapon /dev/zram0 -p 100
```

## Benchmark para Uso Jurídico

| Operación | Latencia Objetivo | Latencia Real (RPi5) |
|-----------|-------------------|---------------------|
| Recuperar artículo (RAG) | < 100ms | ~50ms (NVMe) |
| Búsqueda semántica | < 200ms | ~100ms |
| Generación respuesta (1k tokens) | < 60s | ~90s |
| Consulta API BCN | < 1s | ~500ms |

## Docker Compose Jurídico

```yaml
services:
  openclaw:
    image: openclaw/gateway:latest
    volumes:
      - ./skills/cl-law-core:/home/openclaw/skills/cl-law-core:ro
      - ./storage:/home/openclaw/storage:rw
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - OPENCLAW_MODEL=llama3.2:3b

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ./ollama-data:/root/.ollama:rw
    deploy:
      resources:
        limits:
          memory: 4G
