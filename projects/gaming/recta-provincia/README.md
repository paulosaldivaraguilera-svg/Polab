# RECTA PROVINCIA
## Simulador de Brujería - Game Design Document

*"Un camino de sombra o luz bajo la niebla de Chiloé"*

---

## 📋 RESUMEN EJECUTIVO

**Recta Provincia** es un RPG táctico isométrico ambientado en el archipiélago de Chiloé durante el siglo XIX. El jugador controla a un iniciado que busca unirse a la sociedad secreta de brujos conocida como "La Recta Provincia".

### Información del Proyecto
| Aspecto | Detalle |
|---------|---------|
| **Género** | Isometric RPG / Simulator |
| **Plataforma** | PC / Console |
| **Perspectiva** | Isométrica fija (45°) |
| **Estilo** | Dark Fantasy / Folk Horror |
| **Engine** | Unity (o HTML5 prototype) |

---

## 🎮 PROTOTYPE ACTUAL

**URL:** https://paulosaldivaraguilera-svg.github.io/recta-provincia/prototype.html

### Controles del Prototype
| Tecla | Acción |
|-------|--------|
| **← → ↑ ↓ / WASD** | Mover |
| **A** | Transformarse (requiere karma) |
| **ESPACIO** | Atacar |
| **SHIFT** | Correr |

### Mecánicas Implementadas
- ✅ Movimiento libre en mundo isométrico
- ✅ Sistema de karma (Luz/Sombra)
- ✅ 3 transformaciones: Humano, Alcatraz, Chonchón
- ✅ Enemigos: Weka, Piuchen, Trauco
- ✅ Sistema de experiencia y niveles
- ✅ Macuñ mejorable (Oveja → Caballo → Hombre)

---

## 🌑 ESTRUCTURA NARRATIVA

### Arco I: La Iniciación (El Renacer)
**Mecánica:** Descubrimiento y sacrificio

El jugador comienza como un forastero o paria que busca el consejo de la Recta Provincia. Las pruebas iniciales incluyen:
- Ayunos en el bosque de niebla
- El bautismo inverso en la cascada de Traiguén
- La obtención del **Macuñ** (chaleco de piel)

**Recompensas de nivel:**
- Nivel 1: Macuñ de Piel de Oveja
- Nivel 3: Macuñ de Piel de Caballo
- Nivel 5: Macuñ de Piel de Hombre

### Arco II: El Vuelo del Chonchón (La Ascensión)
**Mecánica:** Gestión de poder y transformaciones

Como brujo oficial, el jugador obtiene habilidades de transformación:
- **Alcatraz (Luz):** Vuelo, curación, protección
- **Chonchón (Sombra):** Vuelo nocturno, ataques letales, terror

### Arco III: El Trono de Quicaví (El Final)
**Mecánica:** Guerra mitológica y destino

La confrontación final por el liderazgo de la mítica Cueva de Quicaví.

---

## ⚖️ SISTEMA DE KARMA

### Barra de Karma (0-100)
| Rango | Fracción | Poder |
|-------|----------|-------|
| 70-100 | **Luz (El Machi)** | Curación, luz, protección |
| 30-70 | **Equilibrado** | Habilidades básicas |
| 0-30 | **Sombra (El Caleuche)** | Oscuridad, destrucción, control |

### Transformations por Karma
| Karma | Transformación | Habilidad |
|-------|---------------|-----------|
| >70 | **Alcatraz** | Vuelo + Curación |
| <40 | **Chonchón** | Vuelo + Ataque letal |
| Any | **Humano** | Estado base |

---

## 🗺️ MAPA DEL MUNDO

### Zonas del Prototype
| Zona | Descripción | Enemigos |
|------|-------------|----------|
| **Centro** | Área segura, rucas | Ninguno |
| **Bosque** | Árboles cipreses | Weka |
| **Costa** | Palafitos, agua | Trauco |
| **Colinas** | Cerros nebulosos | Piuchen |

### Elementos del Mundo
- **Palafitos:** Casas sobre agua (estilo chilote)
- **Rucas:** Viviendas tradicionales con techo de paja
- **Cipreses:** Árboles característicos de Chiloé
- **Cerros:** Con niebla volumétrica

---

## 👹 ENEMIGOS

| Enemy | Tipo | Salud | Daño | EXP | Karma |
|-------|------|-------|------|-----|-------|
| **Weka** | Terrestre | 30 | 10 | 20 | -5 (Malo) |
| **Trauco** | Agresivo | 40 | 15 | 30 | -5 (Malo) |
| **Piuchen** | Serpiente | 60 | 20 | 40 | +5 (Neutral) |

---

## 🎨 DIRECCIÓN DE ARTE

### Paleta de Colores
| Elemento | Color |
|----------|-------|
| Fondo | `#0a0b0d` (Negro azabache) |
| Acentos | `#c5a059` (Oro chilote) |
| Luz | `#63b3ed` (Azul celeste) |
| Sombra | `#f56565` (Rojo sangre) |

### Estética
- Inspirada en el grabado chileno decimonónico
- Niebla volumétrica
- Contraste alto entre luz y sombra
- Macuñ cambia de color según nivel

---

## 🔊 AUDIO

### Música
- **Dark Folk** con acordeón y bombo chilote
- Efectos de distorsión y reverberación
- Ambiente de niebla y misterio

---

## 📈 ESTADO DE DESARROLLO

### Prototype v1.0 (Completado)
- [x] Movimiento base
- [x] Sistema de Karma
- [x] Transformaciones
- [x] Enemigos básicos
- [x] EXP y Niveles
- [x] Mejora de Macuñ
- [x] Game Over según karma

### Próximos Pasos
- [ ] Añadir historia y diálogos
- [ ] Misiones principales
- [ ] NPCs y aliados
- [ ] Cuadros de brujo (habilidades)
- [ ] Audio y música
- [ ] Consola Unity completa

---

## 🔗 LINKS

- **Prototype:** https://paulosaldivaraguilera-svg.github.io/recta-provincia/prototype.html
- **Repo:** https://github.com/paulosaldivaraguilera-svg/recta-provincia

---

*"No existe el bien absoluto bajo la niebla. Existe el respeto a la tierra y el conocimiento prohibido."*
