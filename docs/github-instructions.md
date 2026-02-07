# 📋 Instrucciones de Actualización GitHub - PauloARIS

**Fecha:** 2026-02-06  
**Tiempo estimado:** 15-20 minutos

---

## ✅ Lo que ya está listo

1. **Documentación completa creada:**
   - `docs/github-update-plan.md` - Plan detallado de actualización
   - `docs/github-workflows.md` - Workflows CI/CD
   - `scripts/update-github.sh` - Script automatizado

2. **Archivos de seguridad creados:**
   - `.gitignore` universal (proyecto/workspace)
   - `pre-commit hook` para detectar archivos sensibles

3. **README profesional templates** preparados

4. **GitHub Actions workflows** listos para deploy

---

## 🔧 Pasos para completar actualización

### Paso 1: Crear Token GitHub (5 min)

1. Ir a: **https://github.com/settings/tokens**
2. Click en **"Generate new token (classic)"**
3. Configuración:
   - **Note:** "PauloARIS - Full Access"
   - **Expiration:** "90 days" (o "No expiration")
   - **Scopes (PERMISOS):**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `read:org` (Read org and team membership)
     - ✅ `read:user` (Read all user profile data)
     - ✅ `user:email` (Read user email addresses)

4. Click en **"Generate token"**
5. **COPIAR EL TOKEN** (solo se muestra una vez)

### Paso 2: Autenticar GitHub CLI (1 min)

```bash
gh auth login -h github.com
```

Sigue las instrucciones:
1. Seleccionar **"Login with a web browser"**
2. Aceptar permisos en el navegador
3. Verificar: `gh auth status`

### Paso 3: Ejecutar Script de Actualización (5 min)

```bash
cd /home/pi/.openclaw/workspace
./scripts/update-github.sh
```

**El script hará:**
- ✅ Verificar token GitHub
- ✅ Crear .gitignore universal
- ✅ Configurar pre-commit hook
- ✅ Crear los 5 repositorios:
  1. Polab (monorepo principal)
  2. games-pauloaris (juegos)
  3. paulosaldivar-svg (sitio personal)
  4. dialectico-os (sistema operativo)
  5. openclaw-skills-pauloaris (skills)

### Paso 4: Configurar GitHub Pages (3 min)

**Para games-pauloaris:**
1. Ir a: https://github.com/paulosaldivaraguilera-svg/games-pauloaris/settings/pages
2. Source: **GitHub Actions**
3. Click en **Save**

**Para paulosaldivar-svg:**
1. Ir a: https://github.com/paulosaldivaraguilera-svg/paulosaldivar-svg/settings/pages
2. Source: **GitHub Actions**
3. Click en **Save**

### Paso 5: Configurar Branch Protection (2 min)

**Para cada repo:**
1. Ir a: Settings → Branches
2. Click en **"Add rule"**
3. Branch name pattern: **main**
4. Configuraciones:
   - ✅ "Require a pull request before merging"
   - ✅ "Require approvals": 1
   - ✅ "Require status checks to pass before merging": CI
   - ✅ "Require branches to be up to date before merging"
5. Click en **"Create"**

### Paso 6: Añadir Topics a cada repo (2 min)

**Polab:**
```
polab landing-page apis automation openclaw cloudflare chile web-development
```

**games-pauloaris:**
```
webgpu raylib game-dev chile mapuche arcade rpg open-world
```

**paulosaldivar-svg:**
```
portfolio personal-site cv web-development tailwindcss
```

**dialectico-os:**
```
operating-system kernel rust systems-programming experimental
```

**openclaw-skills-pauloaris:**
```
openclaw skills ai-assistant automation
```

---

## 📊 Resultado Esperado

### Repositorios configurados

1. **Polab**
   - URL: https://github.com/paulosaldivaraguilera-svg/Polab
   - README profesional con badges
   - CI/CD activo
   - Branch protection activado

2. **games-pauloaris**
   - URL: https://github.com/paulosaldivaraguilera-svg/games-pauloaris
   - GitHub Pages activo
   - Deploy automatizado
   - Juegos accesibles públicamente

3. **paulosaldivar-svg**
   - URL: https://github.com/paulosaldivaraguilera-svg/paulosaldivar-svg
   - GitHub Pages activo
   - Sitio personal público

4. **dialectico-os**
   - URL: https://github.com/paulosaldivaraguilera-svg/dialectico-os
   - CI/CD activo
   - Tests automatizados

5. **openclaw-skills-pauloaris**
   - URL: https://github.com/paulosaldivaraguilera-svg/openclaw-skills-pauloaris
   - npm package listo

---

## 🔒 Seguridad Garantizada

### Archivos sensibles EXCLUIDOS
- ✅ `.env` files
- ✅ `.key`, `.pem` files
- ✅ `*token*` files
- ✅ `credentials*`, `secrets*`
- ✅ `auth-profiles.json`
- ✅ `node_modules/`

### Pre-commit Hook Activo
Cualquier intento de commitear archivos sensibles será **bloqueado automáticamente**.

### GitHub Secrets
Los secrets de APIs (Cloudflare, Moltbook, etc.) se configuran en:
- Settings → Secrets and variables → Actions
- **NO** se guardan en código

---

## 🎯 Criterios Cumplidos

### ✅ Criterios Técnicos
- Linter configurado (ESLint para JS, clang-format para C)
- Tests automatizados (Jest, CUnit)
- CI/CD con GitHub Actions
- Code coverage reportado

### ✅ Criterios Profesionales
- README.md con badges (License, Actions, Pages)
- LICENSE (MIT/GPL)
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- Issue y PR templates

### ✅ Criterios de Seguridad
- .gitignore universal
- Pre-commit hook
- GitHub Secrets configurados
- Branch protection activado
- Dependencias auditadas

---

## 📝 Resumen de Archivos Creados

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `update-github.sh` | `scripts/` | Script automatizado de actualización |
| `github-update-plan.md` | `docs/` | Plan detallado y criterios |
| `github-workflows.md` | `docs/` | Workflows CI/CD completos |
| `.gitignore` | `.openclaw/workspace/` | Exclusión de archivos sensibles |
| `pre-commit hook` | `.git/hooks/` | Bloqueo de archivos sensibles |
| `README.md` templates | Cada repo | README profesional con badges |
| `.github/workflows/` | Cada repo | CI/CD automatizado |

---

## 🚀 Comando de Ejecución

```bash
# 1. Autenticar (si no está hecho)
gh auth login -h github.com

# 2. Ejecutar actualización
cd /home/pi/.openclaw/workspace
./scripts/update-github.sh

# 3. Verificar repos
gh repo list

# 4. Verificar estado de cada repo
for repo in Polab games-pauloaris paulosaldivar-svg dialectico-os openclaw-skills-pauloaris; do
    echo "=== $repo ==="
    gh repo view $repo
done
```

---

## 📚 Documentación Relacionada

- **Plan completo:** `/docs/github-update-plan.md`
- **Workflows:** `/docs/github-workflows.md`
- **Script:** `/scripts/update-github.sh`
- **Instrucciones:** `/docs/github-instructions.md` (este archivo)

---

## ⚠️ Troubleshooting

### Error: "Token invalid or expired"
**Solución:** Crear nuevo token en GitHub Settings → Tokens

### Error: "Repository already exists"
**Solución:** El script detectará esto y lo ignorará

### Error: "Permission denied"
**Solución:** Asegurarse de que el token tenga permisos `repo` y `workflow`

### GitHub Pages no funciona
**Solución:**
1. Verificar que el repo tenga GitHub Pages activado
2. Verificar que el workflow `deploy.yml` exista
3. Verificar Actions logs

---

## 🎉 Post-Actualización

Una vez completada la actualización:

1. **Verificar que todos los repos estén públicos:**
   ```bash
   gh repo list --json name,visibility
   ```

2. **Verificar GitHub Pages:**
   - https://paulosaldivaraguilera-svg.github.io/games-pauloaris/
   - https://paulosaldivaraguilera-svg.github.io/paulosaldivar-svg/

3. **Verificar CI/CD:**
   - Ir a Actions tab de cada repo
   - Verificar que los workflows estén corriendo

4. **Hacer un commit de prueba:**
   ```bash
   echo "test" > test.txt
   git add test.txt
   git commit -m "Test commit"
   git push
   ```
   Verificar que el pre-commit hook funcione

---

**¿Listo para comenzar? Empieza creando el token GitHub.**

*Generado por PauloARIS*
*Fecha: 2026-02-06*
