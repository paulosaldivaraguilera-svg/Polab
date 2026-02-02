# ARQUITECTURA DE PROYECTOS - Clarificación

## ⚠️ ERROR CORREGIDO

**Antes:** Confundí La Unidad con Sistema SUR (contenido educativo)
**Ahora:** Diferenciados claramente como proyectos separados

---

## 🌐 SISTEMA SUR (Puerto 8083)

**Tipo:** Sistema Educativo - Contenido Propio
**Propósito:** Educación política Marxist-Leninist
**Contenido:** Artículos generados/curados internamente
**Categorías:** Marx, Lenin, Stalin, Gramsci, PC-Chile, Historia

### Características:
- [x] 62+ entradas educativas
- [x] Sistema de progreso por usuario
- [x] Quizzes de verificación
- [x] Enfoque pedagógico

**URL:** http://localhost:8083/

---

## 🎯 LA UNIDAD (Puerto 8084) - **CORREGIDO**

**Tipo:** Agencia de Prensa Digital - Curation/Repost
**Propósito:** Análisis y opinión - Repostear prensa
**Contenido:** Noticias curadas de RSS feeds externos + análisis propio
**Categorías:** Política, Derecho, Economía, Ciencia, Sociedad, Opinión

### Características del diseño (HTML del usuario):
- [x] Diseño periodístico profesional
- [x] Tipografía: Merriweather (serif) + Inter (sans)
- [x] Sistema SPA (Single Page Application)
- [x] Modo lectura (ajuste de fuente)
- [x] Editorial + Columnistas
- [x] Responsive mobile-first

**Fuente:** Ver HTML completo en `/projects/personal/la-unidad/index.html`

---

## 📊 COMPARACIÓN

| Aspecto | Sistema SUR | La Unidad |
|---------|-------------|-----------|
| **Tipo** | Educativo | Prensa Digital |
| **Puerto** | 8083 | 8084 (nuevo) |
| **Contenido** | Propio (generado) | Curado (RSS feeds) |
| **Propósito** | Enseñar | Informar/Opinar |
| **Diseño** | Simple/clean | Periodístico pro |
| **Frontend** | Estándar | Tailwind + Merriweather |
| **Backend** | Static + API | RSS Aggregator + NLP |

---

## 🔧 STACK TÉCNICO

### Sistema SUR
- Frontend: HTML + CSS vanilla
- Backend: Express.js
- Data: JSON files

### La Unidad (Corregido)
- Frontend: HTML + Tailwind + SPA (diseño del usuario)
- Backend: Node.js + RSS Parser + NLP
- Integraciones: Twitter/X, Facebook, WhatsApp

---

## 📋 ESTADO ACTUAL

### Sistema SUR ✅
- Puerto: 8083
- Contenido: 62+ entradas
- Estado: OPERATIVO

### La Unidad (Prensa) ⏳
- Puerto: 8084 (pendiente)
- Backend: News Aggregator listo
- Frontend: HTML del usuario listo
- Estado: Implementando

---

## 🎯 PRÓXIMOS PASOS

1. [ ] Deploy La Unidad en puerto 8084
2. [ ] Conectar RSS feeds reales
3. [ ] Integrar diseño HTML del usuario
4. [ ] Configurar distribución automática
5. [ ] Implementar monetización (Ads/Suscripciones)

---

**Actualizado:** 2026-02-02
**Versión:** 2.0 (Corregida)
