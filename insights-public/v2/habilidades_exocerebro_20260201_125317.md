# Habilidades del Exo-Cerebro

## Habilidad: Informe Matutino Proactivo

### Trigger
```bash
# Cron en la Pi
0 7 * * * docker exec openclaw_core openclaw run "informe_matutino"
```

### Flujo
1. Consultar calendario (Composio API)
2. Escanear Gmail (emails no leídos)
3. Verificar estado sistema (disco, temp)
4. Consultar clima
5. Sintetizar con Claude
6. Enviar por WhatsApp

### Código Base (Python)
```python
class InformeMatutino:
    async def ejecutar(self):
        datos = await self.recolectar_datos()
        resumen = await self.sintetizar(datos)
        await self.enviar_whatsapp(resumen)
```

## Habilidad: Resumen Nocturno

- Consume: Notas del día desde memU
- Modelo: Qwen local (gratis, privado)
- Entrega: WhatsApp a las 21:00

## Habilidad: Monitoreo de Salud

- Verifica: Espacio disco, temperatura CPU, contenedores activos
- Alerta: Si temp > 75°C o disco < 10%
- Notificación: WhatsApp al usuario

## Composio para APIs

| API | Permiso | Uso |
|-----|---------|-----|
| Google Calendar | Lectura | Inicio del día |
| Gmail | Lectura | Prioridad emails |
| Slack | Lectura/Escritura | Notificaciones |

## Checklist de Habilidades
- [ ] Informe Matutino configurado
- [ ] Resumen Nocturno activo
- [ ] Monitoreo de Salud configurado
- [ ] Composio conectado
- [ ] Webhooks de WhatsApp funcionando
