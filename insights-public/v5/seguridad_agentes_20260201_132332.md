# Seguridad en Sistemas de Agentes Artificiales

## El Problema del Shadow AI

### Control de Egreso (El Peligro Inverso)
| Vector | Descripción | Solución |
|--------|-------------|----------|
| Exfiltración | Agente envía datos a API maliciosa | Proxy de egreso Zero Trust |
| Inyección de Prompt | Manipular al agente via input | Sanitización de entradas |
| Suplantación | Agente malicioso imita legítimo | AgentCard verificable |

## Arquitectura de Seguridad Agéntica

### Zero Trust para Agentes
```
┌─────────────────────────────────────────────────────────┐
│                    AGENTE DE IA                         │
├─────────────────────────────────────────────────────────┤
│  Control de Egreso:                                      │
│  - Proxy intercepta cada llamada externa                │
│  - Policy: "Solo datos X a Dominio Y"                   │
│  - Verificación PII y jurisdicción GDPR                 │
├─────────────────────────────────────────────────────────┤
│  Identidad:                                              │
│  - AgentCard: capacidades, propietario, roles           │
│  - Firma criptográfica de outputs                       │
│  - Cadena de responsabilidad inmutable                  │
├─────────────────────────────────────────────────────────┤
│  Constitución:                                           │
│  - No socavar supervisión humana                        │
│  - Ser corregible                                       │
│  - Priorizar seguridad sobre utilidad                   │
└─────────────────────────────────────────────────────────┘
```

## Vulnerabilidades Específicas

### MCP (Model Context Protocol)
- Estándar para conectar IAs a herramientas
- Riesgo: Inyección de comandos
- CVE-2025–6514 documentado
- Mitigación: Human-in-the-loop + Sandbox

### Ataques al Modelo
| Tipo | Descripción | Defensa |
|------|-------------|---------|
| Envenenamiento | Datos maliciosos en training | Verificación de provenance |
| Backdoors | Disparador oculto activa malware | Interpretabilidad mecanística |
| Inducción | Patrón específico manipula salida | ROME para cirugía de pesos |

## Constitución del Agente (Jerarquía de Valores)

1. **Ampliamente Seguro**: No socavar supervisión humana, ser corregible
2. **Ampliamente Ético**: Honestidad, evitar daños
3. **Cumplimiento**: Seguir reglas del proveedor
4. ** Genuinamente Útil**: Beneficiar al usuario

*Nota: Seguridad > Utilidad > Obediencia*
