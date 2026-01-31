# Elemental Pong: Chrono & Chaos

Juego de Pong arcade con sistema elemental y control del tiempo.

## 🎮 Estado Actual

**Versión:** 0.2.0 (Jugable)
- ✅ Pong funcional (Jugador vs CPU)
- ✅ Sistema Chrono-Break (tiempo lento)
- ✅ Controles keyboard (flechas/Shift/Espacio)
- ✅ Controles touch para mobile
- ✅ Partículas y efectos visuales
- ✅ Sistema de scoring

**En Desarrollo:**
- 🔄 Sistema de elementos completo (Fuego, Hielo, Rayo, Tierra)
- 🔄 Menú de selección de elementos
- 🔄 Dificultad progresiva
- 🔄 Modo historia

---

## 🎯 Cómo Jugar

### Controles (Desktop)
| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Mover paleta |
| `ESPACIO` | Activar elemento cargado |
| `SHIFT` | Activar Chrono-Break (tiempo lento) |

### Controles (Mobile)
| Gesture | Acción |
|---------|--------|
| Touch + Arrastrar | Mover paleta |
| Doble tap | Chrono-Break |

---

## 🎮 Mecánicas

### Chrono-Break
Barra de "Chrono" se llena con golpes precisos (centro de paleta). 
- **Activación:** 100% Chrono + SHIFT
- **Efecto:** Tiempo se ralentiza (0.1x) por 2 segundos
- **Uso:** Reposicionar o salvar puntos imposibles

### Sistema Elemental
| Elemento | Efecto |
|----------|--------|
| 🔥 **Fuego** | Velocidad++ + rastro |
| ❄️ **Hielo** | Fricción-- + congelación |
| ⚡ **Rayo** | Movimiento zig-zag |
| 🌍 **Tierra** | Pesada + empuja paleta |

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5 + Canvas + JavaScript |
| Estilos | CSS3 + Tailwind-inspired |
| Fonts | Orbitron, Rajdhani |
| Output | Web (multiplataforma) |

**Para producción:**
- Unity 2023+ → Exportar a Mobile/Switch
- C# para lógica de juego
- New Input System

---

## 📁 Estructura

```
elemental-pong/
├── index.html          # Juego principal
├── README.md           # Este archivo
└── docs/
    └── GDD.md          # Documento de diseño original
```

---

## 🚀 Próximos Pasos

### Fase 1 (Completa) - Este release
- [x] Pong básico funcional
- [x] Movimiento jugador
- [x] Rebotes físicos
- [x] Sistema de scoring

### Fase 2 - Chrono System
- [x] Barra de Chrono
- [x] Slow-motion
- [x] UI de Chrono

### Fase 3 - Sistema Elemental
- [ ] ScriptableObjects para elementos
- [ ] Efecto Fuego
- [ ] Efecto Hielo
- [ ] Efecto Rayo
- [ ] Efecto Tierra

### Fase 4 - UI & Polish
- [x] Menú de inicio
- [x] Game over screen
- [ ] Pantallas de carga
- [ ] Feedback visual

### Fase 5 - Escalamiento
- [ ] Migrar a Unity
- [ ] Exportar mobile (iOS/Android)
- [ ] Exportar Switch
- [ ] Multijugador online

---

## 🎨 Recursos Visuales

### Colores
```css
--neon-blue: #00f3ff;
--neon-red: #ff0055;
--neon-green: #00ff9d;
--neon-yellow: #ffcc00;
--neon-purple: #bc13fe;
```

### Fuentes
- **Headings:** Orbitron
- **Body:** Rajdhani

---

## 📦 Dependencias

El juego usa solo recursos CDN:
- Google Fonts (Orbitron, Rajdhani)
- Ninguna dependencia local requerida

---

## 🔧 Desarrollo

```bash
# Abrir en navegador
open elemental-pong/index.html

# O servir localmente
python3 -m http.server 8080
# Luego abrir http://localhost:8080
```

---

*Creado: 2026-01-31*
*Basado en GDD original de 2026-01-30*
