# LA UNIDAD - Agencia de Prensa Digital

## Concepto Real

**La Unidad** es un **medio de análisis y opinión** que curay repostea contenido de prensa internacional y latinoamericana con perspectiva editorial específica.

### Diferencia con Sistema SUR:
- **Sistema SUR**: Contenido educativo Marxist-Leninist (generado internamente) - Puerto 8083
- **La Unidad**: Agencia de prensa - curay repostea contenido de fuentes específicas - Puerto 8084

---

## Fuentes Configuradas (DEL USUARIO)

| # | Fuente | País | Categoría |
|---|--------|------|-----------|
| 1 | **CGTN Español** | 🇨🇳 China | Internacional |
| 2 | **El Siglo** | 🇨🇱 Chile | Política |
| 3 | **Radio Nuevo Mundo** | 🇨🇱 Chile | Cultura |
| 4 | **Granma** | 🇨🇺 Cuba | Internacional |
| 5 | **Telesur** | 🇻🇪 Venezuela | Internacional |
| 6 | **Prensa Latina** | 🇨🇺 Cuba | Internacional |

### Características de las fuentes:
- Perspectiva editorial progresista/alternativa
- Cobertura internacional con enfoque Sur-Sur
- Sin sesgo mediático tradicional occidental
- Contenido en español

---

## Arquitectura

### Frontend (Diseño del usuario)
- HTML + Tailwind CSS
- Merriweather (serif) + Inter (sans)
- SPA (Single Page Application)
- Mobile-first responsive

### Backend
```javascript
// state/la-unidad-aggregator.js
- RSS feed parser
- NLP para categorización
- Sentiment analysis
- Trend detection
- Auto-refresh cada 15 min
```

### Integraciones
- Twitter/X API (distribución)
- WhatsApp Business
- Email newsletters

---

## Dashboard

### Métricas
- Artículos agregados: X
- Por fuente: X
- Por categoría: X
- Trending topics: X

---

## Estado del Proyecto

**PUERTO:** 8084 (separado de SUR en 8083)

**ARCHIVOS:**
- `projects/personal/la-unidad/index.html` (diseño base)
- `state/la-unidad-aggregator.js` (backend con fuentes correctas)

**FUENTES CORREGIDAS:** ✅ CGTN, El Siglo, Radio Nuevo Mundo, Granma, Telesur, Prensa Latina

**POR HACER:**
- [ ] Deploy en puerto 8084
- [ ] Conectar frontend al backend
- [ ] Configurar distribución automática
- [ ] Implementar monetización

---

**Referencia del diseño:** Ver HTML completo en el mensaje del usuario.
**Actualizado:** 2026-02-02 - Fuentes corregidas según especificaciones del usuario.
