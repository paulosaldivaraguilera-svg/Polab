# Infraestructura Crítica: Colapso Sistémico

## Riesgos Principales

### Ransomware en Salud
- Ataques paralizan sistemas hospitalarios
- Efectos en cascada: ambulancias desviadas, saturación regional
- Estudios demuestran aumento de mortalidad

### Flash Crashes Financieros
- Algoritmos HFT interactúan de formas imprevistas
- Liquidez evapora instantáneamente
- Velocidad vs. Resiliencia

## Estrategias de Defensa

### Segmentación y Air-Gapping
```
┌─────────────────────────────────────────────────────────┐
│ REDES CRÍTICAS (VIDA/SEGURIDAD)                         │
│ - Sistemas médicos, grid eléctrico, agua                │
│ - FÍSICAMENTE separados de redes administrativas        │
│ - Operación manual degradada posible                    │
├─────────────────────────────────────────────────────────┤
│ REDES ADMINISTRATIVAS (CORREO, FACTURACIÓN)             │
│ - Accesibles desde internet                             │
│ - Proxy de egreso Zero Trust                            │
│ - Backup regular a almacenamiento frío                  │
└─────────────────────────────────────────────────────────┘
```

### Ingeniería de Confiabilidad (HRO)
- Circuit breakers en mercados financieros
- Procedimientos en papel (no solo digitales)
- Pruebas de estrés regulares

## Tabla de Comparación

| Aspecto | Modelo Tradicional | Modelo Resiliente |
|---------|-------------------|-------------------|
| Velocidad | Optimizada | Fricción intencional |
| Backup | Digital only | Análisis + frío |
| Respuesta | Reactiva | Proactiva (Red Teaming) |
| Confianza | Perimetral | Zero Trust |
