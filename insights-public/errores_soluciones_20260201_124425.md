# Errores Conocidos y Soluciones

## Problemas de Infraestructura

### Latencia Alta
- **Síntoma**: RTT > 150ms hacia Polymarket
- **Causa**: Enrutamiento subóptimo
- **Solución**: 
  - Usar dRPC o QuickNode con PoP en LatAm
  - Suscripciones WebSocket en lugar de polling
  - CDN de Cloudflare

### Sobrecalentamiento
- **Síntoma**: Throttling activo, CPU a 80°C+
- **Causa**: Overclock sin cooling
- **Solución**:
  - Cooler activo de alto rendimiento
  - Thermal pads en VRM
  - Reducir frecuencia si > 75°C

### Pérdida de Conexión
- **Síntoma**: Gateway no responde
- **Causa**: Fallo de red o energía
- **Solución**:
  - UPS + backup 4G/5G
  - Auto-reinicio con systemd
  - Logs locales persistentes

## Problemas de Seguridad

### Inyección de Prompts
- **Riesgo**: Comandos no autorizados vía input
- **Solución**: Sandboxing + validación de inputs
- **acción**: Agregar sanitización a memory_autosave

### Filtración de Credenciales
- **Riesgo**: Claves en texto plano
- **Solución**: Directorio seguro 700 + .env cifrado
- **acción**: Implementar secrets vault

## Problemas de Trading

### Slippage en Entrada
- **Síntoma**: Precio worse que esperado
- **Causa**: Liquidez asimétrica
- **Solución**: Split + Sell strategy
- **acción**: Agregar lógica de slippage a trading tools

