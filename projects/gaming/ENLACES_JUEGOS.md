# 🎮 ENLACES DE JUEGOS - PauloARIS

**Última actualización:** 2026-02-06

---

## 🌐 Juegos Disponibles

### 1. Elemental Pong v2.2 ⚡

**🚀 Cómo probar:**
```bash
cd /home/pi/.openclaw/workspace/projects/gaming/elemental-pong
python3 -m http.server 8083
```

**🔗 Abre en tu navegador:**
- Local: `http://192.168.1.31:8083/prototype_v2.2.html`

**🎯 Características:**
- ✅ WebGPU Renderer (THREE.WebGPURenderer)
- ✅ ECS Pattern para escalabilidad
- ✅ 100K partículas con InstancedMesh
- ✅ Sistema elemental (Fuego/Hielo/Veneno)
- ✅ Audio procedural (Web Audio API)
- ✅ Gamepad support

**🎮 Controles:**
- W/S o ↑/↓: Mover pala
- Space: Iniciar/Pausar
- Esc: Menú

---

### 2. Recta Provincia v2.2 🌲

**🚀 Cómo probar:**
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 1. Recta Provincia v2.2
```

**🎯 Características:**
- ✅ Mapa procedural Wallmapu (5 biomas)
- ✅ Combate con lanza bola Mapuche
- ✅ Quests Mapuche (relatos, sitios sagrados)
- ✅ Enemigos: Espíritus Peñi, Soldados, Criaturas
- ✅ Estética Xilografía Santos Chávez

**🎨 Biomas:**
- Bosque nativo
- Lago Mapuche
- Volcán activo
- Campo cultivado
- Ciudad Mapuche

---

### 3. Delitos v2.2 🏙️

**🚀 Cómo probar:**
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 2. Delitos v2.2
```

**🎯 Características:**
- ✅ Mapa procedural ciudad (5 distritos)
- ✅ Sistema notoriedad (5 niveles estilo GTA)
- ✅ IA policía perseguidora
- ✅ 5 tipos de delitos
- ✅ Economía criminal

**🎭 Distritos:**
- Residencial (barrio popular)
- Industrial (fábricas salmoneras)
- Comercial (corporaciones)
- Marginal (asentamientos)
- Control (comisaría/cárcel)

---

## 🔜 GitHub Pages (Pendiente)

**Estado:** 🔄 Esperando token GitHub válido

**Para configurar:**
1. Ir a: https://github.com/settings/tokens
2. Crear token con permisos `repo` y `workflow`
3. Ejecutar: `gh auth login -h github.com`
4. Crear repos: `gh repo create elemental-pong-v2.2 --public`

**Enlaces resultantes:**
- `https://paulosaldivaraguilera-svg.github.io/elemental-pong-v2.2/`
- `https://paulosaldivaraguilera-svg.github.io/recta-provincia-v2.2/`
- `https://paulosaldivaraguilera-svg.github.io/delitos-v2.2/`

---

## 📚 Documentación Completa

**Reporte técnico:** `/home/pi/.openclaw/workspace/memory/2026-02-06-juegos-raylib-mejorados.md`

**Documentos relacionados:**
- Arquitecturas de Simulación: `memory/arquitecturas-simulacion-ontologica.md`
- Ecosistema Latam: `memory/ecosistema-videojuegos-latam.md`
- Imaginario Gráfico Chile: `memory/genealogia-imaginario-grafico-chile.md`

---

## 💡 Tips

### Elemental Pong (Rápido)
El más fácil de probar - solo necesita servidor Python 3.
```bash
python3 -m http.server 8083
```

### Raylib Games (Completo)
Requieren compilación C, usan el script `build-raylib-games.sh`.

### GitHub Pages
Cuando esté configurado, los juegos serán accesibles públicamente sin necesidad de servidor local.

---

**¿Quieres que inicie el servidor de Elemental Pong ahora?** 🎮
