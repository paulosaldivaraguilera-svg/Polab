# WhatsApp Business API - Documentación Técnica

## 📋 Configuración Inicial

### 1. Crear App en Meta Developer Console

1. Ir a: https://developers.facebook.com/
2. Crear nueva app (Tipo: Business)
3. Agregar producto: WhatsApp
4. Obtener credentials:
   - **APP ID**
   - **APP SECRET**
   - **Phone Number ID**
   - **WhatsApp Business Account ID**

### 2. Configurar Webhooks

```json
Webhook URL: https://tu-dominio.cl/webhook/whatsapp
Verify Token: (token que definas)
```

### 3. Permisos Requeridos

| Permiso | Descripción |
|---------|-------------|
| `whatsapp_business_management` | Gestionar cuenta WhatsApp |
| `whatsapp_business_messaging` | Enviar/recibir mensajes |

---

## 🔗 Endpoints Principales

### Enviar Mensaje de Texto

```bash
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "56990000000",
  "type": "text",
  "text": {
    "body": "Hola! Tu pedido #12345 ha sido enviado."
  }
}
```

### Enviar Template Message

```bash
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "56990000000",
  "type": "template",
  "template": {
    "name": "pedido_enviado",
    "language": {
      "code": "es_CL"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "#12345"
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 Templates de Mensajes

### Template: `pedido_enviado`
```
Hola! Tu pedido {numero_pedido} ha sido enviado.
🚀 Seguimiento: {link_tracking}
```

### Template: `stock_bajo_alerta`
```
⚠️ Alerta de Stock Bajo

Producto: {nombre_producto}
Stock actual: {stock_actual}
Stock mínimo: {stock_minimo}

 Acción requerida.
```

### Template: `carrito_abandonado`
```
Hola! Notamos que dejaste productos en tu carrito.
🛒 {lista_productos}
💰 Total: {total_carrito}

¿Algo te dificultó la compra? Te ayudamos!
```

---

## 📨 Recibir Mensajes (Webhook)

### Payload de Entrada

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "1234567890",
          "phone_number_id": "1234567890"
        },
        "contacts": [{
          "profile": {
            "name": "Nombre Cliente"
          },
          "wa_id": "56990000000"
        }],
        "messages": [{
          "from": "56990000000",
          "id": "wamid.XXX...",
          "timestamp": "1234567890",
          "text": {
            "body": "/ventas hoy"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

---

## 🔐 Autenticación

### Generar Access Token (Temporal)

1. Ir a Meta Developer Console
2. Seleccionar App > WhatsApp > Configuration
3. En "Temporary access tokens", generar nuevo token
4. **Nota:** Token expira en ~24 horas

### Token de Larga Duración

```bash
# Exchange token por token largo
POST https://graph.facebook.com/v18.0/oauth/access_token
grant_type=fb_exchange_token
client_id={APP_ID}
client_secret={APP_SECRET}
fb_exchange_token={SHORT_TOKEN}
```

---

## 🛠️ n8n - Webhook Integration

### Workflow básico de recepción

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp",
        "options": {}
      }
    },
    {
      "name": "Parse JSON",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const data = $input.first().json;\nconst message = data.entry[0].changes[0].value.messages[0];\nreturn {\n  from: message.from,\n  text: message.text.body,\n  timestamp: message.timestamp\n};"
      }
    },
    {
      "name": "Process Command",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const commands = {\n  '/ventas': 'getVentas',\n  '/pedidos': 'getPedidos',\n  '/stock': 'getStock'\n};\n// ... lógica de parsing"
      }
    }
  ]
}
```

---

## 💰 Costos WhatsApp API

| Concepto | Costo |
|----------|-------|
| Conversaciones iniciadas por usuario | $0.00 USD |
| Conversaciones iniciadas por negocio | $0.0308 USD por conversación |
| **Costo mensual estimado (100 pedidos)** | **~$4 USD** |

---

## 📚 Recursos

- [Documentación Oficial](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/cloud-api/message-templates)
- [n8n WhatsApp Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/)

---

*Última actualización: 2026-02-02*
