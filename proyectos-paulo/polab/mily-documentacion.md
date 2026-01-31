# Mily - Documentación Técnica

## Visión General

Mily es una aplicación de control parental basada en inteligencia artificial, desarrollada por POLAB SpA.

**Eslogan:** "Entender es mejor que prohibir"

**Estado:** Beta abierta pronto

**URL:** milyapp.lat

---

## Arquitectura

### Zero-Knowledge Architecture

La arquitectura Zero-Knowledge significa que ni siquiera POLAB puede ver los datos de los usuarios. El procesamiento ocurre localmente en el dispositivo.

**Características:**
- Procesamiento On-device (IA local)
- Sin transferencia de datos a la nube
- Sin venta de datos a terceros
- Encriptación de grado militar

**Ventajas:**
- Privacidad total para los hijos
- Seguridad para los padres
- Cumplimiento con regulaciones de privacidad

---

## Características del Producto

### 1. Contexto vs. Espionaje

Mily NO muestra todo lo que escriben los hijos. En cambio:
- Analiza el sentimiento de las conversaciones
- Detecta ciberacoso
- Detecta señales de depresión
- Solo alerta cuando hay riesgo real

### 2. Bloqueo Inteligente

A diferencia del control parental tradicional:
- No bloquea "Juegos" ciegamente
- Aprende horarios de estudio y descanso
- Adapta límites dinámicamente
- Explica por qué bloquea algo

### 3. Puentes de Diálogo

Cuando Mily bloquea algo:
- Explica al niño por qué se bloqueó
- Da sugerencias al padre para hablar del tema
- La tecnología educa, no castiga

---

## Stack Tecnológico (Inferido)

### Frontend
- Framework móvil (Flutter, React Native, o nativo)
- UI/UX enfocada en padres y niños

### Backend
- API para sincronización de configuraciones
- Sistema de notificaciones push
- Servidores sin acceso a datos de usuarios

### IA/ML
- Procesamiento de lenguaje natural local
- Análisis de sentimiento
- Detección de patrones de riesgo
- On-device machine learning

### Seguridad
- Encriptación end-to-end
- Zero-knowledge architecture
- Sin bases de datos con información sensible

---

## Comparación con Competencia

| Feature | Mily | Control Parental Tradicional |
|---------|------|------------------------------|
| Lee chats | ❌ No | ✅ Sí |
| Alertas solo riesgos | ✅ Sí | ❌ No (muestra todo) |
| Bloqueo adaptativo | ✅ Sí | ❌ Fijo |
| Explica bloqueos | ✅ Sí | ❌ No |
| Datos en la nube | ❌ No | ✅ Sí |
| Venta de datos | ❌ No | 🤔 Depende |

---

## Propuesta de Valor

### Para Padres
- Paz mental sin invadir privacidad
- Herramienta educativa, no punitiva
- Contexto para dialogar con hijos

### Para Hijos
- Privacidad respetada
- Explicaciones claras
- Confianza, no sospecha

### Diferenciador Principal
Mily es el único control parental que:
1. No espía
2. Procesa localmente
3. Enseña en vez de castigar

---

## Casos de Uso

### Ciberacoso
Detecta conversaciones que indican acoso escolar o online y alerta a los padres.

### Depresión
Identifica patrones de lenguaje que sugieren tristeza o depresión en hijos.

### Tiempo de Pantalla
Aprende horarios de estudio y descanso, bloquea solo cuando corresponde.

### Contenido Inapropiado
Bloquea acceso a contenido no apropiado con explicación del por qué.

---

## Métricas (Objetivo)

| Métrica | Meta |
|---------|------|
| Usuarios beta | 1,000 |
| Reviews positivos | 4.5+ |
| Retention 30 días | 60% |
| Falsos positivos | <5% |

---

## Referencias

- Landing: https://milyapp.lat/
- Empresa: https://polab.lat/
- Contacto: info@polab.lat (asumiendo)

---

*Documentación: 2026-01-31*
