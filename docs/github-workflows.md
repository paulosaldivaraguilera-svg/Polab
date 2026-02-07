# GitHub Actions Workflows - PauloARIS
**Fecha:** 2026-02-06  
**Propósito:** Automatizar CI/CD y deploy para todos los repos

---

## 🚀 Workflow: Deploy to GitHub Pages

**Archivos:** `.github/workflows/deploy-pages.yml`

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

## 🧪 Workflow: CI / Test

**Archivos:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Test
        run: npm test
      
      - name: Coverage
        run: npm run coverage
```

---

## 🔨 Workflow: Build Raylib Games

**Archivos:** `.github/workflows/build-raylib.yml`

```yaml
name: Build Raylib Games

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        game: [recta-provincia, delitos]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Raylib dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libraylib-dev
      
      - name: Build game
        run: |
          cd ${{ matrix.game }}
          gcc -o bin/${{ matrix.game }} src/*.c -Iinclude -L/usr/local/lib -lraylib -lGL -lm -lpthread -ldl -lrt -lX11
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.game }}-linux
          path: ${{ matrix.game }}/bin/
```

---

## 📦 Workflow: Deploy to Cloudflare

**Archivos:** `.github/workflows/deploy-cloudflare.yml`

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./dist --project-name=polab-landing
```

---

## 📊 Workflow: Code Quality

**Archivos:** `.github/workflows/code-quality.yml`

```yaml
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Check for secrets
        uses: trufflesecurity/trufflehog-action@v0.14.0
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
  
  dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for outdated deps
        run: npm outdated || true
      
      - name: Check for vulnerabilities
        run: npm audit --production
```

---

## 🏷️ Topics por Repositorio

### Polab
```
polab
landing-page
apis
automation
openclaw
cloudflare
chile
web-development
```

### games-pauloaris
```
webgpu
raylib
game-dev
chile
mapuche
arcade
rpg
open-world
```

### paulosaldivar-svg
```
portfolio
personal-site
cv
web-development
tailwindcss
```

### dialectico-os
```
operating-system
kernel
rust
systems-programming
experimental
```

### openclaw-skills-pauloaris
```
openclaw
skills
ai-assistant
automation
```

---

## 🔒 GitHub Secrets

### Configuración de Secrets

```bash
# Usar gh CLI para agregar secrets
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set MOLTBOOK_API_KEY
gh secret set OTHER_API_KEY
```

### Secrets para Polab
- `CLOUDFLARE_API_TOKEN` - Deploy a Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID de cuenta Cloudflare
- `MOLTBOOK_API_KEY` - API de Moltbook

### Secrets para Games
- Ninguno necesario (open source)

---

## 📝 Pull Request Template

**Archivo:** `.github/pull_request_template.md`

```markdown
## 📖 Descripción

Breve descripción de los cambios.

## 🎯 Tipo de cambio

- [ ] Bug fix (corrección de error)
- [ ] New feature (nueva funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentation update (actualización de documentación)

## ✅ Cambios

Lista de cambios realizados:
- Cambio 1
- Cambio 2

## 🧪 Testing

- [ ] Tests escritos
- [ ] Tests pasando localmente
- [ ] Manualmente probado

## 📸 Screenshots

Si aplica, adjuntar screenshots de cambios visuales.

## 🔗 Issues relacionados

Closes #123, Fixes #456

## 📝 Notas adicionales

Cualquier información adicional relevante.
```

---

## 🐛 Issue Template

**Archivo:** `.github/issue_template.md`

```markdown
## 🐛 Bug Report

### Descripción

Descripción clara y concisa del bug.

### Pasos para reproducir

1. Ir a '...'
2. Click en '...'
3. Scroll down to '...'
4. Ver error

### Comportamiento esperado

Descripción de lo que debería pasar.

### Comportamiento actual

Descripción de lo que realmente pasa.

### Screenshots

Si aplica, adjuntar screenshots.

### Entorno

- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Node.js version: [e.g. 20.10.0]

### Contexto adicional

Cualquier información adicional relevante.
```

---

## 📐 CODE_OF_CONDUCT.md

```markdown
# Código de Conducta

## Nuestro Pledge

En el interés de fomentar un ambiente abierto y acogedor, nosotros como contribuidores y mantenedores nos comprometemos a hacer que la participación en nuestro proyecto y nuestra comunidad sea una experiencia libre de acoso para todos, sin importar edad, tamaño corporal, discapacidad, etnia, género identidad y expresión, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

## Nuestros Estándares

Ejemplos de comportamiento que contribuyen a crear un ambiente positivo incluyen:
* Usar lenguaje acogedor e inclusivo
* Ser respetuoso de diferentes puntos de vista y experiencias
* Aceptar críticas constructivas con elegancia
* Enfocarse en lo que es mejor para la comunidad
* Mostrar empatía hacia otros miembros de la comunidad

Ejemplos de comportamiento inaceptable por parte de los participantes incluyen:
* El uso de lenguaje o imágenes sexualizadas
* Comentarios despectivos o insultos, y ataques personales o políticos
* Acoso público o privado
* Publicación de información privada de otros sin permiso
* Cualquier otra conducta que pueda razonablemente considerarse inapropiada en un ambiente profesional

## Nuestra Responsabilidad

Los líderes del proyecto son responsables de aclarar y hacer cumplir los estándares de comportamiento aceptable y se espera que tomen acciones apropiadas y justas para corregir cualquier instancia de comportamiento inaceptable.

Los líderes del proyecto tienen derecho y responsabilidad de eliminar, editar o rechazar comentarios, commits, código, ediciones de wiki, issues y otras contribuciones que no estén alineadas con este Código de Conducta, y pueden prohibir temporal o permanentemente a cualquier contribuyente por comportamientos que consideren inapropiados, amenazantes, ofensivos o dañinos.

## Alcance

Este Código de Conducta aplica tanto dentro de espacios del proyecto como en espacios públicos cuando un individuo esté representando el proyecto o su comunidad.

## Ejecución

Los casos de comportamiento abusivo, acosador o inaceptable pueden ser reportados al equipo del proyecto. Quejas serán revisadas e investigadas y resultarán en una respuesta que se considere necesaria y apropiada a las circunstancias. El equipo del proyecto está obligado a mantener la confidencialidad con respecto al reportador de un incidente.

## Aplicación

Los proyectos adoptan este Código de Conducta adaptando el [Contributor Covenant][homepage], versión 1.4, disponible en https://www.contributor-covenant.org/version/1/4/code-of-conduct.html

[homepage]: https://www.contributor-covenant.org
```

---

## 📄 LICENSE Template

### MIT License

```markdown
MIT License

Copyright (c) 2026 Paulo Saldivar Aguilera

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📚 Documentación Adicional

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Branch Protection:** https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-mergeability-of-pull-requests/about-protected-branches
- **GitHub Pages:** https://docs.github.com/en/pages

---

*Generado por PauloARIS*
*Fecha: 2026-02-06*
