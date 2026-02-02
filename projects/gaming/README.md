# Videojuegos Paulo Saldívar

**Colección de juegos indie desarrollados con tecnologías web modernas.**

## 🎮 Juegos

### ELEMENTAL PONG v2.2
**Género:** Arcade / Party Game  
**Tecnología:** HTML5 Canvas + WebGL Shaders + ECS Pattern

**Características:**
- Sistema de audio completo (Web Audio API)
- Partículas avanzadas batcheadas
- Power-ups (vida extra, ralentizar, paleta gigante)
- Modo 2 jugadores local
- Efectos visuales con shaders procedimentales CRT
- **NUEVO v2.2:** Headless mode para entrenamiento IA

**Engine:** `engine-v2.2.js` (ECS, RAG Memory, Shaders)

**Controls:**
- `← →` Mover paleta
- `SPACE` Cargar poder
- `C` Chrono Break
- `P` Pausa

**Demo:** [prototype_v2.1.html](prototype_v2.1.html)

---

### RECTA PROVINCIA v2.1
**Género:** RPG / Folk Horror  
**Ambientación:** Folklore chilote, siglo XIX  
**Tecnología:** Canvas + NPC Memory System + RAG

**Características:**
- Sistema de diálogos con árboles de decisiones
- **NUEVO v2.1:** NPCs con memoria RAG (recuerdan conversaciones)
- 2 NPCs (Brujo Anciando, La Pincoya)
- Sistema de quests con recompensas
- Karma dinámico según decisiones
- 3 transformaciones (Humano, Alcatraz, Chonchón)
- HUD completo con Quest Tracker
- Audio posicional 3D

**Engine:** `engine-v2.1.js` (NPCMemorySystem, QuestSystem)

**Controls:**
- `← → ↑ ↓` Mover
- `A` Transformar (según karma)
- `SPACE` Atacar
- `E` Interactuar
- `SHIFT` Correr

**Demo:** [prototype_v2.0.html](prototype_v2.0.html)

---

### DELITOS v2.1
**Género:** RPG de Investigación / Cyberpunk Thriller  
**Ambientación:** Santiago de Chile, 2024  
**Tecnología:** HTML5 + ECS Pattern + Cloud Sync

**Características:**
- **NUEVO v2.1:** 18 Casos Completos (C1-C18)
- Sistema ECS para gestión de personajes
- Sistema de selección de casos
- Panel de equipo/party
- Sistema de evidencias
- Guardado automático (localStorage + cloud sync simulado)
- Logros con estadísticas
- Diseño visual cyberpunk

**Engine:** `engine-v2.1.js` (EntityComponentSystem, CloudSync, AchievementSystem)

**Casos Incluidos:**
| Acto | Casos | Progreso |
|------|-------|----------|
| SOMBRAS | C1-C6 | ✅ Completo |
| CONSPIRACIÓN | C7-C12 | ✅ Completo |
| FILTRO | C13-C18 | ✅ Completo |

**Demo:** [index.html](index.html)

---

## 🛠️ Engines Mejorados (v2.1/v2.2)

| Archivo | Propósito |
|---------|----------|
| `elemental-pong/engine-v2.2.js` | ECS, Shaders, Headless AI |
| `recta-provincia/engine-v2.1.js` | RAG Memory, NPC dialogues |
| `polab/videojuegos/delitos/engine-v2.1.js` | ECS, Cloud Sync, Achievements |

---

## 🚀 Training IA

Los engines están diseñados para entrenamiento de agentes:

### Elemental Pong (Headless Mode)
```bash
prototype_v2.1.html?headless=true
# Modo sin render para máxima velocidad de entrenamiento
```

### Recta Provincia (NPC Training)
```javascript
const memory = new NPCMemorySystem();
memory.generateDialogue(npcId, systemPrompt, playerInput);
// Entrenar modelos de diálogo contextual
```

### Delitos (Case Solving RL)
```javascript
const caseManager = new CaseManager();
caseManager.startCase('C1');
// RL para optimización de investigación
```

---

## 📊 Estadísticas

| Juego | Estado | Complejidad |
|-------|--------|-------------|
| Elemental Pong | v2.2 | Media |
| Recta Provincia | v2.1 | Alta |
| Delitos | v2.1 | Muy Alta (18 casos) |

---

## 🧑‍💻 Autor

**Paulo Andrés Saldívar Aguilera**  
Desarrollador de videojuegos indie • IA Engineer

---

*Última actualización: 2026-02-02*
