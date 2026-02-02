# E-Commerce PyME Chile - WooCommerce + n8n + WhatsApp

**Estado:** 📋 PLANIFICACIÓN | **Fecha:** 2026-02-02  
**Autores:** Pablo Luco, Javier Martínez, Paulo Saldivar

---

## 📋 Resumen Ejecutivo

Solución e-commerce para PyMEs chilenas basada en **WordPress + WooCommerce + n8n + WhatsApp Business API**, diseñada para administración 100% móvil desde WhatsApp.

## 🎯 Objetivos Clave

- Administración 100% móvil desde WhatsApp (sin apps adicionales)
- Bot personalizado para gestión completa del negocio
- Notificaciones inteligentes agrupadas (evita spam)
- Control total del código (n8n self-hosted)
- Costo predecible y bajo (infraestructura propia)

## 🎯 Propuesta de Valor

**Diferenciador principal:** El entrepreneur/chico pyme puede administrar TODO su negocio desde WhatsApp — el canal que ya usa todos los días.

**Vs. soluciones existentes:**
- Shopify/WooCommerce estándar: Panel web obligatorio
- Notiqoo Pro: Costo más alto + vendor lock-in
- Nuestra solución: WhatsApp como panel de control natural

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend:** WordPress + WooCommerce
- **Automatización:** n8n self-hosted (VPS)
- **Comunicación:** WhatsApp Business Cloud API (Meta)
- **Pagos:** MercadoPago + Khipu + Flow.cl
- **Logística:** Shipit Integration
- **Infraestructura:** VPS (Docker + PostgreSQL) + Hosting WordPress

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (WhatsApp)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              WhatsApp Business Cloud API                     │
│                    (Meta Developer Console)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Webhooks
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      n8n (Self-hosted)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │ Bot Comandos│  │ Notificaciones│  │ Automatizaciones │     │
│  └─────────────┘  └──────────────┘  └─────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              WordPress + WooCommerce                         │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐         │
│  │ Productos│  │ Pedidos   │  │ Inventario ATUM   │         │
│  └──────────┘  └───────────┘  └───────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ MercadoPago │    │   Khipu     │    │   Flow.cl   │
│ (Pagos)     │    │ (Pagos)     │    │  (Pagos)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📱 Comandos WhatsApp para el Dueño

### Consultas

| Comando | Descripción |
|---------|-------------|
| `/ventas hoy` | Ventas del día actual |
| `/ventas semana` | Ventas de los últimos 7 días |
| `/pedidos pendientes` | Lista de pedidos pendientes |
| `/stock Polera-Negra-M` | Stock de variante específica |
| `/stock bajo` | Productos con stock bajo umbral |

### Actualizaciones

| Comando | Descripción |
|---------|-------------|
| `/actualizar stock [producto] [cantidad]` | Actualiza stock |
| `/pedido [ID] enviar` | Cambia estado a "enviado" |
| `/pedido [ID] cancelar` | Cancela pedido |

## 🤖 Workflows n8n Implementados

### 1. Bot Comandos WhatsApp
- Parser de comandos desde webhooks WhatsApp
- Integración WooCommerce REST API
- Respuestas contextualizadas

### 2. Notificaciones Agrupadas
- Acumula pedidos nuevos en buffer
- Envía resumen cada 15 minutos
- Evita spam de notificaciones

### 3. Alertas Stock Bajo
- Scheduler cada 30 minutos
- Hash anti-duplicados para eficiencia
- Notificación inmediata al dueño

### 4. Confirmaciones Clientes
- Webhook `order.completed` de WooCommerce
- Integración Shipit para tracking
- Mensaje personalizado con número de seguimiento

### 5. Recuperación Carritos
- Detecta carritos abandonados (>24h)
- Envía recordatorio estratégico
- Incentivo opcional (descuento)

### 6. Monitoreo Errores
- Clasifica errores por severidad
- Notifica críticos inmediatamente
- Logs para debugging

## 💰 Costos Mensuales

### Fijos

| Concepto | Costo USD/mes |
|----------|---------------|
| Hosting WordPress | $30 |
| VPS n8n | $12-18 |
| Dominio .cl | $1.25 |
| Plugins premium | $16 |
| **Total Fijo** | **$59-66** |

### Variables (100 pedidos/mes)

| Concepto | Costo USD |
|----------|-----------|
| Gateways de pago (4.5%) | $135 |
| WhatsApp API (Meta) | $4 |
| Shipit envíos | $300-800 |
| **Total Variable** | **$439-939** |

### Resumen

> **💰 Total Mensual (100 pedidos): $498-1,004 USD**

## ⭐ Ventajas vs Notiqoo Pro

| Aspecto | Nuestra Solución | Notiqoo Pro |
|---------|------------------|-------------|
| Ahorro anual | $348-828 USD | — |
| Flexibilidad | Workflows personalizados ilimitados | Limitados |
| Control | Código 100% accesible | black-box |
| Escalabilidad | Sin límites de ejecuciones | Límites |
| Privacidad | Datos en VPS propio | Servidores terceros |
| Vendor Lock-in | Cero dependencia | Alta dependencia |

## 🚀 Plan de Implementación

**Duración total:** 9 semanas

### Semana 1-2: Infraestructura
- [ ] Contratar VPS ($12-18/mes - DigitalOcean/Vultr/Hetzner)
- [ ] Contratar hosting WordPress ($30/mes - SiteGround/Kinsta)
- [ ] Instalar Docker + Docker Compose en VPS
- [ ] Deploy n8n self-hosted
- [ ] Configurar dominio y SSL

### Semana 3: Pasarelas de Pago
- [ ] Registro MercadoPago (Developer Console)
- [ ] Registro Khipu (API credentials)
- [ ] Registro Flow.cl (API keys)
- [ ] Configurar webhooks de notificación

### Semana 4: WhatsApp Business API
- [ ] Obtener número WhatsApp Business
- [ ] Crear app en Meta Developer Console
- [ ] Configurar webhooks entrantes
- [ ] Testing de mensajes básicos

### Semana 5: Workflows n8n - Bot + Notificaciones
- [ ] Parser de comandos WhatsApp
- [ ] Integración WooCommerce REST API
- [ ] Sistema de notificaciones agrupadas
- [ ] Testing end-to-end

### Semana 6: Automatizaciones Clientes
- [ ] Webhook confirmaciones de pedido
- [ ] Integración Shipit tracking
- [ ] Detección carritos abandonados
- [ ] Workflow recuperación

### Semana 7: Shipit (Logística)
- [ ] Integración API Shipit
- [ ] Generación automática de guías
- [ ] Tracking público para clientes
- [ ] Webhook estados de envío

### Semana 8: Operaciones
- [ ] Plugin inventario ATUM
- [ ] Sincronización stock automática
- [ ] Facturación (integración contable)
- [ ] Reportes y dashboards

### Semana 9: Lanzamiento
- [ ] SEO y optimización
- [ ] Testing completo (QA)
- [ ] Documentación usuario
- [ ] **🚀 Lanzamiento**

## 📋 Casos de Éxito Objetivo (Validación)

### 1. Peluches de Joaquín
- [ ] Tienda online funcional
- [ ] Administración 100% WhatsApp
- [ ] Primeros 10 pedidos

### 2. Pajaritos (productos de Pablo)
- [ ] Tienda online funcional
- [ ] Administración 100% WhatsApp
- [ ] Primeros 10 pedidos

### 3. Productor externo (pendiente)
- [ ] Venta validada a PyME externa
- [ ] Caso de estudio documentado

## 🔗 Documentación Relacionada

- [WooCommerce REST API](https://woocommerce.github.io/woocommerce/rest-api/)
- [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [n8n Documentation](https://docs.n8n.io/)
- [Shipit API](https://docs.shipit.cl/)
- [MercadoPago Developers](https://developers.mercadopago.com/)

## 📝 Notas

- El path del documento Notion original: `/home/javi/.openclaw/workspace/pages/plan-woocommerce-n8n-whatsapp.md`
- Este documento es una versión local para el workspace de PauloARIS

---

**Última actualización:** 2026-02-02
