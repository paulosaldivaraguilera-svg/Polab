# Elemental Pong: Chrono & Chaos

Juego de Pong arcade con sistema elemental y control del tiempo.

## Documento de Diseño (GDD)

### Concepto Core
Minimalismo visual + Caos elemental + Control del tiempo

### Plataformas
- **Mobile** (Touch)
- **Nintendo Switch**

### Género
Arcade / Competitivo / Puzzle

---

## Sistema de Juegos

### Modo Historia (Campaign)
1. **El Vacío** — Tutorial puro (blanco/negro)
2. **El Despertar Ígneo** — Introduce Fuego (enemigo IA)
3. **Boss Glacier** — Primer boss de hielo

### Modo Arcade
- Partidas rápidas
- Seleccionar elementos
- Multijugador local (Switch)

### Modo Multijugador Online
- Rankings
- Partidas rankeadas

---

## Mecánicas Principales

### Chrono-Break (Control del Tiempo)
- Barra de "Chrono" se llena con golpes perfectos
- **Tap/Gatillo:** Ralentiza tiempo (0.1x) por 2 segundos
- **Uso:** Reposicionar o cargar tiro elemental

### Sistema Elemental (La pelota cambia)

| Elemento | Efecto | Contra-elemento |
|----------|--------|-----------------|
| **Fuego (Ignis)** | Velocidad++ + rastro | Hielo |
| **Hielo (Glacies)** | Fricción-- + congelación | Fuego |
| **Rayo (Fulgur)** | Movimiento zig-zag | Tierra |
| **Tierra (Terra)** | Pesada + empuja paleta | Rayo |
| **Aire (Ventus)** | Efecto curvo (Aftertouch) | ? |
| **Agua (Aqua)** | Rebotes erráticos + ondas | ? |

---

## Progresión

### Desbloqueo de Elementos
- Derrotar bosses elementales
- Completar desafíos específicos
- Comprar con moneda del juego

### Monetización
- **Free to play** básico
- ** battle pass** elemental
- **Cosméticos** para paletas/partículas
- **Desbloqueo rápido** de elementos

---

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Game Engine | Unity 2023+ |
| Lenguaje | C# |
| Input | New Input System |
| UI | Unity UI Toolkit |
| Audio | FMOD o Wwise |
| Red (online) | Mirror / Photon / Netcode |
| Persistencia | PlayerPrefs / SQLite |

---

## Arquitectura Unity

### Core Managers
- `GameManager.cs` — Singleton, estados
- `TimeManager.cs` — Control de tiempo
- `AudioManager.cs` — Sonido reactivo

### Gameplay
- `BallController.cs` — Física RigidBody2D
- `PaddleController.cs` — Movimiento
- `WallBounce.cs` — Rebotes

### Sistema Elemental (Strategy Pattern)
- `ElementData (SO)` — Datos configurables
- `ElementalEffectBase` — Clase abstracta
- `FireEffect`, `IceEffect`, etc. — Implementaciones

---

## Próximos Pasos

### Fase 1: Prototipo Core
- [ ] Pong básico funcional
- [ ] Movimiento jugador
- [ ] Rebotes físicos
- [ ] Score system

### Fase 2: Chrono System
- [ ] Barra de Chrono
- [ ] Slow-motion (Lerp suave)
- [ ] UI deChrono

### Fase 3: Sistema Elemental
- [ ] ScriptableObjects para elementos
- [ ] Efecto Fuego (demo)
- [ ] Efecto Hielo (demo)

### Fase 4: UI & Polish
- [ ] Menús
- [ ] Pantallas de carga
- [ ] Feedback visual

---

## Notas

- Usar **New Input System** de Unity para consistencia mobile/Switch
- Diseño **mobile-first** para controles táctiles
- **Localización** desde el inicio (ES/EN)
- **Analytics** integrado desde alpha

---

*Creado: 2026-01-30*
*Versión: 0.1.0 (Concept)*
