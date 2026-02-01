# Principios de Diseño - Guía para Foundry

## Basado en: Arquitectura de Sistemas Autónomos

### Principio 1: Localidad Primero
> "Al ejecutarse localmente, el agente puede acceder a claves privadas... sin enviar información sensible a servidores externos"

- **Aplicación**: Herramientas deben preferir datos locales
- **Evitar**: APIs externas para datos sensibles
- **acción**: Cache local antes que fetch remoto

### Principio 2: Monitoreo Proactivo
> "El mecanismo del 'latido' permite que la inteligencia artificial se active de forma autónoma"

- **Aplicación**: No esperar prompts para mejorar
- **acción**: Self-observe periódico aunque no se use

### Principio 3: Mínima Superficie de Ataque
> "Ejecutar con usuario no-root... capacidades limitadas"

- **Aplicación**: Herramientas con mínimos privilegios
- **acción**: Validar permisos antes de ejecutar

### Principio 4: Fallo Graceful
> "Reiniciar el servicio... en caso de errores de memoria"

- **Aplicación**: No crash completo ante errores
- **acción**: Try-catch con recovery en cada tool

### Principio 5: Documentación Técnica
> "Configuración detallada con justificación técnica"

- **Aplicación**: Cada herramienta con docs completos
- **acción**: README.md + comentarios en código

### Principio 6: Eficiencia Energética
> "Raspberry Pi opera con costo marginal de electricidad cercano a $5/año"

- **Aplicación**: Optimizar recursos computacionales
- **acción**: Benchmark regular para detectar waste

