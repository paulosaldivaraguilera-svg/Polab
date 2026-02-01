# Ontología del Derecho Chileno para Agentes IA

## Estructura del Sistema

### Jerarquía Normativa (Rigidez)

| Nivel | Norma | Característica | Tratamiento IA |
|-------|-------|----------------|----------------|
| 1 | Constitución | Super-rigidez | Axiomas inmutables (System Prompt) |
| 2 | Leyes Org. Const. | Quórums especiales | Guardrails determinísticos |
| 3 | Leyes Ordinarias | Proceso legislativo | Validación jerárquica |
| 4 | Decretos/Reglamentos | Fluidez administrativa | Consultas dinámicas API |

### La Paradoja de la Rigidez vs Fluidez

**Rigidez (Constitución):**
- Mecanismos de super-rigidez (quórums supramayoritarios)
- Control preventivo del Tribunal Constitucional
- System Prompts inmutables en el agente

**Fluidez (Administrativo):**
- Normas administrativas cambian diariamente
- Dispersión normativa (miles de resoluciones exentas)
- Acceso dinámico y federado (no almacenamiento estático)

## Ontología BCN (Biblioteca del Congreso Nacional)

### Clases Fundamentales

```json
{
  "Norma": {
    "propiedades": ["idNorma", "fechaPublicacion", "organismo"],
    "relaciones": ["modifica", "deroga", "reglamenta"]
  },
  "Constitucion": {
    "inmutabilidad": true,
    "jerarquia": "suprema"
  },
  "Decreto": {
    "dependeDe": "Ley habilitante",
    "caducable": true
  }
}
```

## Grafo de Conocimiento Temporal

### Estructura de Cuádruplas

En lugar de tripletas (Sujeto, Predicado, Objeto):
```
(Sujeto, Predicado, Objeto, Intervalo_Validez)
```

### Ejemplo Práctico

```
Ley 21.000 --[modifica]--> Código Tributario [2018-01-01, 2024-03-15]
Ley 21.210 --[modifica]--> Código Tributario [2020-02-24, vigente]
```

## Manejo de la Dispersión

### Problema
Miles de normas dispersas en:
- Código Civil (Bello, 1855)
- Código Penal (1874)
- Ley de Mercado de Valores
- Ley de Pesca
- Código Tributario
- Leyes ambientales...

### Solución: "Ignorancia Gestionada"
- Índice local ligero (metadatos)
- Recuperación dinámica desde APIs
- Chunking jerárquico (artículo + padre + referencias)

## Validación de Vigencia

```python
def verificar_vigencia(id_norma, fecha_consulta):
    # Consultar API BCN
    respuesta = bcn_api.consultar_version(id_norma, fecha_consulta)
    return respuesta.estado  # Vigente/Derogado/Modificado
```

## Conceptos Clave

1. **Autopoiesis del Derecho**: El sistema se reproduce a través de comunicaciones (leyes, sentencias, decretos)
2. **Dispersión Normativa**: La regla no está en un código, está diseminada en miles de resoluciones
3. **Chunking Jerárquico**: Recuperar artículo + título + referencias cruzadas
4. **Grafo Temporal**: Normas con intervalo de validez, no hechos estáticos
