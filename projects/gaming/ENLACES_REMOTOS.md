# 🌐 Enlaces Remotos - PauloARIS
**Actualizado:** 2026-02-06  
**Acceso:** A través de túnel SSH desde computador de Camila

---

## 🎮 Juegos PauloARIS

### 📋 Índice de Juegos
**URL:** https://accepts-dayton-warranties-reply.trycloudflare.com/

Accede a la página principal con acceso a todos los juegos.

---

### ⚡ Elemental Pong v2.2
**URL:** https://accepts-dayton-warranties-reply.trycloudflare.com/elemental-pong/prototype_v2.2.html

**Estado:** ✅ Listo para jugar ahora

**Características:**
- WebGPU Renderer (THREE.WebGPURenderer)
- ECS Pattern para escalabilidad
- 100K partículas con InstancedMesh
- Sistema elemental (Fuego/Hielo/Veneno)
- Audio procedural (Web Audio API)

**Controles:**
- W/S o ↑/↓: Mover pala
- Space: Iniciar/Pausar
- Esc: Menú

---

### 🌲 Recta Provincia v2.2
**Estado:** ⏳ Requiere compilación local

Para compilar (en el Raspberry Pi):
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 1. Recta Provincia v2.2
```

**Características:**
- Mapa procedural Wallmapu (5 biomas)
- Combate lanza bola Mapuche
- Quests Mapuche (relatos, sitios sagrados)
- Enemigos: Espíritus Peñi, Soldados, Criaturas
- Estética Xilografía Santos Chávez

---

### 🏙️ Delitos v2.2
**Estado:** ⏳ Requiere compilación local

Para compilar (en el Raspberry Pi):
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 2. Delitos v2.2
```

**Características:**
- Mapa procedural ciudad (5 distritos)
- Sistema notoriedad (5 niveles estilo GTA)
- IA policía perseguidora
- 5 tipos de delitos (hurto, asalto, narcotráfico, falsificación, protesta)

---

## 🌐 Otros Servicios

### Comenzar Landing
**URL:** (verificar desde Raspberry Pi)
**Puerto:** 8080

### Web Personal
**URL:** (verificar desde Raspberry Pi)
**Estado:** Pendiente configuración

---

## 🔧 Notas Técnicas

### Túneles Cloudflare Activos
```bash
PID 3003 → localhost:8080 (Comenzar)
PID 48700 → localhost:8084 (Juegos)
```

### Servidores Python
```bash
PID 48042 → python3 -m http.server 8084 (Juegos)
```

### Logs
- Túnel juegos: `/home/pi/.openclaw/workspace/logs/games-tunnel.log`
- Logs servidor: `/home/pi/.openclaw/workspace/projects/gaming/logs/`

---

## ⚙️ Configuración

### Detener túnel de juegos
```bash
pkill -f "cloudflared.*8084"
```

### Reiniciar túnel de juegos
```bash
pkill -f "cloudflared.*8084"
sleep 2
nohup cloudflared tunnel --url http://localhost:8084 > logs/games-tunnel.log 2>&1 &
```

### Verificar estado de túneles
```bash
ps aux | grep cloudflared
```

### Ver logs de túnel
```bash
tail -f /home/pi/.openclaw/workspace/logs/games-tunnel.log
```

---

## 📝 Comentarios

- Los enlaces `192.168.1.31:xxxx` son locales y **NO** funcionan remotamente
- Los enlaces `trycloudflare.com` son públicos y accesibles desde cualquier lugar
- Los túneles son temporales sin cuenta Cloudflare (sin garantía de uptime)

---

## 🎯 Juegos Disponibles Remotamente

✅ **Elemental Pong v2.2** - Listo para jugar
⏳ **Recta Provincia v2.2** - Requiere compilación local
⏳ **Delitos v2.2** - Requiere compilación local

---

*Generado por PauloARIS*
*Fecha: 2026-02-06 11:38*
