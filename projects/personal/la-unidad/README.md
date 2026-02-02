# LA UNIDAD - Agencia de Prensa Digital

## Concepto Real

**La Unidad** es un **medio de análisis y opinión** que curay repostea contenido de prensa, análisis político, y opinión ciudadana.

### Diferencia con Sistema SUR:
- **Sistema SUR**: Contenido educativo Marxist-Leninist (generado internamente)
- **La Unidad**: Agencia de prensa - curay repostea contenido periodístico existente

---

## Arquitectura

### Fuentes de Contenido
1. **APIs de News**: RSS feeds de medios aliados
2. **Prensa Nacional**: El Mercurio, La Tercera, CNN Chile, etc.
3. **Prensa Internacional**: NYT, WaPo, The Guardian, etc.
4. **Análisis Propio**: Editoriales y columnas de opinión
5. **Redes Sociales**: Tweets, posts relevantes

### Funcionalidades
- **Agregador**: Recoge noticias de múltiples fuentes
- **Curador**: Filtra por relevancia/tema
- **Editor**: Permite agregar análisis/contexto
- **Distribuidor**: Publica en redes sociales
- **Monetización**: Ads, suscripciones,Sponsored content

---

## Stack Técnico

### Frontend (el diseño del usuario)
```html
<!-- Ver: projects/personal/la-unidad/ -->
- HTML5 + Tailwind CSS
- Merriweather (serif) + Inter (sans)
- Mobile-first responsive
- Dark mode support
- SPA (Single Page Application)
```

### Backend
```python
# aggregator.py
- RSS feed parser
- NLP para categorización
- Sentiment analysis
- Trend detection
```

### Integraciones
- Twitter/X API (para compartir)
- Facebook/Instagram API
- WhatsApp Business (distribución)
- Email newsletters (Mailchimp)

---

## Dashboard

### Métricas
- Artículos curados hoy: X
- Engagement en redes: X
- Suscriptores: X
- Ingresos del día: X

---

## Estado del Proyecto

**PUERTO:** Por definir (no es 8083, que es SUR)

**ARCHIVOS:**
- `projects/personal/la-unidad/index.html` (diseño base)

**POR HACER:**
- [ ] Conectar backend de agregación
- [ ] Integrar APIs de redes sociales
- [ ] Configurar RSS feeds
- [ ] Implementar monetización
- [ ] Deploy a producción

---

**Referencia del diseño:** Ver HTML completo en el mensaje del usuario.
