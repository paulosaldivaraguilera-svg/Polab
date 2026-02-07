# 🔗 ENLACES ACCESIBLES REMOTAMENTE
**Actualizado:** 2026-02-06

---

## 🎮 JUEGOS (Disponible Ahora)

### Elemental Pong v2.2
🔗 **JUGAR AHORA:**
https://accepts-dayton-warranties-reply.trycloudflare.com/elemental-pong/prototype_v2.2.html

**Controles:**
- W/S o ↑/↓: Mover pala
- Space: Iniciar/Pausar
- Esc: Menú

---

## 🌐 Servicios Web

### Comenzar Landing
🔗 Pendiente configuración remota

### Web Personal
🔗 Pendiente configuración remota

---

## 🔧 Gestión

### Ver estado de servicios
```bash
bash /home/pi/.openclaw/workspace/scripts/acceso-juegos.sh
```

### Ver túneles activos
```bash
ps aux | grep cloudflared
```

### Ver logs del túnel
```bash
tail -f /home/pi/.openclaw/workspace/logs/games-tunnel.log
```

---

**Nota:** Los enlaces con `192.168.1.31` NO funcionan remotamente.
Usa los enlaces `trycloudflare.com`.

---

*PauloARIS - 2026-02-06*
