# Algoritmos de Razonamiento Jurídico

## 1. Flujo ReAct para Derecho

```python
def razonamiento_juridico(query, fecha_referencia=None):
    """
    Patrón Reason + Act para consultas legales.
    """
    # Paso 1: Identificar intención
    intencion = clasificar_query(query)  # info, opinión, acción
    
    # Paso 2: Descomponer en conceptos
    conceptos = extraer_conceptos(query)  # NER legal
    
    # Paso 3: Consultar índice vectorial
    candidatos = busqueda_semantica(conceptos, top_k=5)
    
    # Paso 4: Para cada candidato, verificar vigencia
    for norma in candidatos:
        if fecha_referencia:
            vigencia = verificar_vigencia_temporal(norma.id, fecha_referencia)
        else:
            vigencia = verificar_vigencia_actual(norma.id)
        norma.metadata["vigencia"] = vigencia
    
    # Paso 5: Filtrar por vigencia
    vigentes = [n for n in candidatos if n.metadata["vigencia"] == "vigente"]
    
    # Paso 6: Recuperar texto completo con chunking jerárquico
    contexto = []
    for norma in vigentes[:3]:  # Top 3
        texto = recuperar_texto_jerarquico(norma.id)
        contexto.append(texto)
    
    # Paso 7: Generar respuesta
    respuesta = llm.generate(
        system="Eres un abogado constitucionalista chileno...",
        context="\n".join(contexto),
        query=query
    )
    
    # Paso 8: Validar citas (evitar alucinaciones)
    if citas := extraer_citas(respuesta):
        validadas = [c for c in citas if validar_cita(c)]
        respuesta += f"\n\nCitas validadas: {len(validadas)}/{len(citas)}"
    
    return respuesta
```

## 2. Manejo de Temporalidad (Línea de Tiempo)

```python
def consultar_version_historica(id_norma, fecha):
    """
    Recupera una norma como estaba vigente en una fecha específica.
    """
    # Consultar API BCN con parámetro de fecha
    url = f"https://www.leychile.cl/Consulta/obtxml?idNorma={id_norma}&fecha={fecha}"
    respuesta = requests.get(url)
    
    # El XML returned tiene el texto histórico
    texto_historico = parsear_xml(respuesta.content)
    
    return {
        "norma": id_norma,
        "consulta": fecha,
        "texto": texto_historico,
        "nota": f"Versión vigente según registros de {fecha}"
    }
```

## 3. Chunking Jerárquico

```python
def recuperar_texto_jerarquico(id_norma):
    """
    Recupera artículo + título/párrafo + referencias cruzadas.
    """
    # Obtener artículo específico
    articulo = obtener_articulo(id_norma)
    
    # Obtener padre (Título/Capítulo)
    padre = obtener_padre(articulo.id_padre)
    
    # Resolver referencias internas
    referencias = []
    for ref in articulo.referencias:
        texto_ref = obtener_texto_ref(ref)
        referencias.append(f"[{ref}]: {texto_ref[:200]}...")
    
    # Unir con chunking consciente
    return f"""
    --- CONTEXTO ({padre.titulo}) ---
    {padre.texto}
    
    --- NORMA CONSULTADA ---
    {articulo.texto}
    
    --- REFERENCIAS ---
    {"".join(referencias)}
    """
```

## 4. Algoritmo de Vigencia

```python
def verificar_vigencia(id_norma, fecha_consulta=None):
    """
    Determina el estado de vigencia de una norma.
    """
    fecha = fecha_consulta or date.today()
    
    metadata = obtener_metadatos_bcn(id_norma)
    
    # Caso 1: Norma futura
    if metadata.fecha_publicacion > fecha:
        return {
            "estado": "no_entrada_vigencia",
            "fecha_inicio": metadata.fecha_publicacion
        }
    
    # Caso 2: Norma derogada
    if metadata.fecha_derogacion and metadata.fecha_derogacion < fecha:
        return {
            "estado": "derogada",
            "fecha_derogacion": metadata.fecha_derogacion,
            "norma_derogadora": metadata.derogada_por
        }
    
    # Caso 3: Norma vigente con modificaciones
    if metadata.fecha_modificacion:
        return {
            "estado": "modificada",
            "fecha_ultima_modificacion": metadata.fecha_modificacion
        }
    
    # Caso 4: Vigente original
    return {"estado": "vigente", "desde": metadata.fecha_publicacion}
```

## 5. Búsqueda Semántica Multi-Capa

```python
def busqueda_juridica(consulta, filtros=None):
    """
    Búsqueda que maneja dispersión normativa.
    """
    # Capa 1: Búsqueda textual en índice
    resultados = indice_vectorial.search(consulta, top_k=20)
    
    # Capa 2: Expansión por ontología
    conceptos = extraer_conceptos(consulta)
    relacionados = ontologia.expandir(conceptos)  # Sinonimia legal
    
    for concepto in relacionados:
        adicionales = indice_vectorial.search(concepto, top_k=5)
        resultados.extend(adicionales)
    
    # Capa 3: Filtrar por vigencia
    if filtros.get("solo_vigente"):
        resultados = [r for r in resultados if r.vigente]
    
    # Capa 4: Deduplicación por norma
    unicos = {}
    for r in resultados:
        unicos[r.id_norma] = r
    
    return list(unicos.values())[:10]
```

## Conceptos Clave

1. **ReAct**: Reasoning + Acting + Observing
2. **Chunking Jerárquico**: Artículo + Padre + Referencias
3. **Validación Post-Generación**: Citar solo lo que existe
4. **Grafo de Citaciones**: Navegar modificaciones/derogaciones
5. **Búsqueda Multi-Capa**: Texto + Ontología + Filtros
