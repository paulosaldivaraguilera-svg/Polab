# Enlaces de Prototipos de Juegos

**Fecha:** 2026-02-06  
**Estado:** 🔄 Pendiente configuración GitHub Pages

---

## 🎮 Juegos Disponibles

### 1. Elemental Pong v2.2
**Tecnología:** Three.js + WebGPU  
**Características:** ECS pattern, 100K partículas, sistema elemental

**Archivos principales:**
- `prototype_v2.2.html` - Versión WebGPU completa
- `engine-v2.2.js` - Motor ECS
- `multiplayer.js` - Fundación multijugador

**Acceso:**
- **Local:** `projects/gaming/elemental-pong/prototype_v2.2.html`
- **GitHub:** (pendiente configuración)
- **GitHub Pages:** (pendiente)

**Controles:**
- W/S o Flechas: Mover pala
- Space: Iniciar/Pausar
- Esc: Menú

---

### 2. Recta Provincia v2.2
**Tecnología:** Raylib (C99)  
**Características:** Aventura Mapuche, mapa procedural, combate lanza bola

**Acceso:**
- **Fuente:** `projects/gaming/recta-provincia-v2.2/README.md`
- **GitHub:** (pendiente configuración)
- **GitHub Pages:** (pendiente)

**Características:**
- 5 biomas del Wallmapu
- Combate con lanza bola tradicional
- Quests Mapuche (recuperar relatos, proteger sitios)
- Enemigos: Espíritus Peñi, Soldados, Criaturas

---

### 3. Delitos v2.2
**Tecnología:** Raylib (C99)  
**Características:** GTA 2D chileno, notoriedad, economía

**Acceso:**
- **Fuente:** `projects/gaming/delitos-v2.2/README.md`
- **GitHub:** (pendiente configuración)
- **GitHub Pages:** (pendiente)

**Características:**
- 5 distritos urbanos procedurales
- 5 tipos de delitos
- Sistema notoriedad (5 niveles)
- IA policía perseguidora

---

## ⚙️ Configuración Pendiente

### GitHub Actions para Deploy Automático

Para activar GitHub Pages automático, necesito:

1. **Token GitHub válido** con permisos `repo` y `workflow`
2. **Crear repositorios:** 
   - `paulosaldivaraguilera-svg/elemental-pong-v2.2`
   - `paulosaldivaraguilera-svg/recta-provincia-v2.2`
   - `paulosaldivaraguilera-svg/delitos-v2.2`

3. **Configurar GitHub Pages**:
   - Source: GitHub Actions
   - Branch: main

4. **Crear workflow `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 🚀 Cómo Probar Localmente

### Elemental Pong (Web)
```bash
cd /home/pi/.openclaw/workspace/projects/gaming/elemental-pong
python3 -m http.server 8080
# Abre: http://localhost:8080/prototype_v2.2.html
```

### Recta Provincia (Raylib)
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 1. Recta Provincia v2.2
```

### Delitos (Raylib)
```bash
cd /home/pi/.openclaw/workspace/scripts
./build-raylib-games.sh
# Seleccionar: 2. Delitos v2.2
```

---

## 📝 Pendiente: Configurar Token GitHub

El token actual expiró o no tiene permisos suficientes.

**Para resolver:**

Opción 1: Usar GitHub CLI
```bash
gh auth login -h github.com
# Seguir instrucciones
gh repo create elemental-pong-v2.2 --public
```

Opción 2: Crear token manual
1. Ir a: https://github.com/settings/tokens
2. Crear nuevo token con permisos `repo` y `workflow`
3. Copiar token
4. Actualizar configuración

---

*Actualizado: 2026-02-06*
*Estado: 🔄 Esperando token GitHub*
