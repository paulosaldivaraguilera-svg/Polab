# Tríada Letal: Datos + Contenido Externo + Comunicación Autónoma

## Riesgos Identificados

| Riesgo | Descripción | Mitigación |
|--------|-------------|------------|
| Acceso a datos | Memorias, preferencias | user:1000 en Docker |
| Contenido externo | Web/Email/RSS | Sandboxing + validación |
| Comunicación autónoma | WhatsApp/SMTP | Human-in-the-loop |

## Matriz de Seguridad Docker

| Capa | Configuración | Propósito |
|------|---------------|-----------|
| Usuario | user: "1000:1000" | No root en host |
| Filesystem | read_only: true | No escritura en SO |
| Capacidades | cap_drop: ALL | Sin syscalls peligrosos |
| Privilegios | no-new-privileges | Anti-escalada |
| Redes | 2 redes separadas | Aislamiento |
| Puertos | 127.0.0.1:solo | Solo localhost |

## Human-in-the-Loop (HITL)

Para acciones de alto impacto:

```python
# El agente genera propuesta pero espera confirmación
if accion == "enviar_correo":
    enviar_whatsapp("He redactado este correo. Responde 'SÍ' para enviar.")
```

## Autenticación: Composio

- Ventaja: Clave única, OAuth gestionado externamente
- Granularidad: "Leer calendario" sí, "Borrar calendario" no
- Riesgo: Solo una clave API expuesta (no client_secret.json)

## Checklist de Seguridad
- [ ] Docker ejecutar como no-root
- [ ] Puertos solo en 127.0.0.1
- [ ] Redes internas configuradas
- [ ] HITL para acciones críticas
- [ ] Secrets via variables de entorno
- [ ] Tailscale para acceso remoto
