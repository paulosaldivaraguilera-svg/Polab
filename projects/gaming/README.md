# 🎮 POLAB Games Collection

**Fecha:** 2026-02-01  
**Versión:** 2.6 (Final)

## 📋 Juegos Incluidos

### 1. Elemental Pong v2.5
**Archivo:** `elemental-pong/prototype_v2.2.html`

**Características:**
- 🎯 4 modos de juego (Classic, Time Attack, Survival, Tournament)
- ⚡ Sistema de power-ups (Bola de Fuego, Congelacion, Alarga Pala, Velocidad)
- 🏆 Leaderboard local con localStorage
- 👥 Multiplayer local (2 jugadores)
- 🎨 UI glassmorphism moderna
- 📊 Sistema de combo (xN multiplier)

**Controles:**
- Jugador 1: W/S
- Jugador 2: Flechas arriba/abajo

---

### 2. Recta Provincia v2.6
**Archivo:** `recta-provincia/prototype_v2.1.html`

**Características:**
- 🗺️ 7 locaciones explorables (Casa, Bosque, Pueblo, Templo, Cueva, Ruinas, Cascada)
- ⚔️ Sistema de combate tactico
- ✨ 5 rituales (Luz, Sombra, Curacion, Energia, Suprema)
- 🛒 Tienda de mejoras (espada, escudo, pocion, libro)
- 🏆 8 logros desbloqueables
- 🎯 Daily Challenge diario
- 📊 Sistema karma dual (Luz/Sombra)

**Mecanicas:**
- Explora locaciones para encontrar secretos
- Gana karma usando rituales
- Compra mejoras en la tienda
- Enfrenta enemigos y bosses

---

### 3. Delitos v2.6
**Archivo:** `polab/videojuegos/delitos/index.html`

**Características:**
- 🔍 5 casos de investigacion (Asesino, Fraude, Testigo Fantasma, Herencia Maldita)
- 🎯 Sistema de deducciones visual
- ⏱️ Timer con cuenta regresiva
- 👥 Modo cooperativo multiplayer (2 jugadores)
- 🔓 Modo investigacion libre
- 📊 Indicadores de progreso visual
- 🎯 Tracking de precision

**Casos:**
1. El Asesino de Plaza Italia
2. El Fraude Bancario
3. El Testigo Fantasma
4. La Herencia Maldita
5. Caso adicional

---

## 🚀 Como Jugar

Simplemente abre el archivo HTML en tu navegador:

```bash
# Elemental Pong
firefox elemental-pong/prototype_v2.2.html

# Recta Provincia  
firefox recta-provincia/prototype_v2.1.html

# Delitos
firefox polab/videojuegos/delitos/index.html
```

O usa el servidor web:

```bash
cd ~/.openclaw/workspace/projects/gaming
python3 -m http.server 8080
# Luego visita http://localhost:8080
```

---

## 📈 Progreso y Guardado

- **Elemental Pong:** High scores guardados en localStorage
- **Recta Provincia:** Progreso guardado en variables de sesion
- **Delitos:** Evidencia y progreso visual en tiempo real

---

## 🎨 Tecnologias

- HTML5 Canvas
- JavaScript vanilla
- CSS3 con gradientes y animaciones
- localStorage para persistencia
- Sin dependencias externas

---

## 🔧 Personalizacion

### Elemental Pong
Edita las variables al inicio del script:
```javascript
const WINNING_SCORE = 11;
const PADDLE_HEIGHT = 100;
const BALL_SPEED = 7;
```

### Recta Provincia
Edita los parametros de balance:
```javascript
const KARMA_BONUS = 10;
const COMBAT_DAMAGE = 20;
const SHOP_DISCOUNT = 0.9;
```

### Delitos
Edita la dificultad:
```javascript
const TIME_LIMIT = 300; // segundos
const EVIDENCE_NEEDED = 5;
```

---

## 📝 Notas

- Los juegos son 100% offline
- No requieren instalacion
- Compatible con navegadores modernos
- Rendimiento optimizado para Raspberry Pi

---

**Desarrollado por POLAB** 🦞💼
