#!/bin/bash
# Script de Actualización GitHub - PauloARIS
# Criterios: Técnicos, Profesionales, Seguridad

set -e  # Exit on error

echo "🚀 ACTUALIZACIÓN GITHUB - PAULOARIS"
echo "==================================="
echo ""
echo "📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Configuración
GITHUB_USER="paulosaldivaraguilera-svg"
WORKSPACE="/home/pi/.openclaw/workspace"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar token
check_token() {
    echo "🔐 Verificando token GitHub..."
    
    if gh auth status 2>&1 | grep -q "Logged in"; then
        success "Token GitHub válido"
    else
        error "Token GitHub no válido o expirado"
        echo ""
        echo "Para solucionar:"
        echo "1. Ir a: https://github.com/settings/tokens"
        echo "2. Crear nuevo token con permisos: repo, workflow, read:org"
        echo "3. Ejecutar: gh auth login -h github.com"
        exit 1
    fi
    echo ""
}

# Crear .gitignore universal
create_gitignore() {
    echo "📝 Creando .gitignore universal..."
    
    cat > "$WORKSPACE/.gitignore" << 'GITIGNORE'
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Credentials
*.key
*.pem
*token*
credentials*
secrets*
auth-profiles.json
api-keys.json
secrets.json

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# Dependencies
node_modules/

# Build artifacts
dist/
build/
bin/
*.exe
*.dll
*.so
*.dylib

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/

# Backup files
*.backup
*.bak
GITIGNORE

    success ".gitignore creado"
    echo ""
}

# Crear pre-commit hook
create_precommit_hook() {
    echo "🔒 Creando pre-commit hook..."
    
    cat > "$WORKSPACE/.git/hooks/pre-commit" << 'HOOK'
#!/bin/bash
# Pre-commit hook - Verificar archivos sensibles

SENSITIVE_PATTERNS=(
    "\.env"
    "\.key"
    "\.pem"
    "token"
    "credentials"
    "secrets"
    "auth-profiles"
    "api-keys"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached --name-only | grep -E "$pattern"; then
        echo "❌ Archivo sensible detectado: $pattern"
        echo "⚠️  Commit abortado"
        exit 1
    fi
done
HOOK

    chmod +x "$WORKSPACE/.git/hooks/pre-commit"
    success "Pre-commit hook creado"
    echo ""
}

# Crear README profesional
create_readme() {
    local repo_name=$1
    local description=$2
    local technologies=$3
    
    cat << README > "README.md"
# $repo_name

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Actions](https://github.com/$GITHUB_USER/$repo_name/workflows/CI/badge.svg)](https://github.com/$GITHUB_USER/$repo_name/actions)

## 📖 Descripción

$description

## 🚀 Características

- ✅ Característica 1
- ✅ Característica 2
- ✅ Característica 3

## 🛠️ Tecnologías

$technologies

## 📦 Instalación

\`\`\`bash
# Instalación
git clone https://github.com/$GITHUB_USER/$repo_name.git
cd $repo_name
\`\`\`

## 🎮 Uso

\`\`\`bash
# Ejemplo de uso
npm start
\`\`\`

## 🤝 Contribuir

Las contribuciones son bienvenidas.

## 📝 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Paulo Saldivar Aguilera**
- [GitHub](https://github.com/$GITHUB_USER)
- [Portfolio](https://$GITHUB_USER.github.io/)

README
}

# Crear repositorio
create_repo() {
    local repo_name=$1
    local description=$2
    local source_dir=$3
    
    echo "📦 Creando repositorio: $repo_name"
    echo "   Descripción: $description"
    
    # Verificar si repo ya existe
    if gh repo view "$GITHUB_USER/$repo_name" --json name --jq '.name' 2>/dev/null; then
        warning "Repositorio ya existe: $repo_name"
        echo ""
        return 1
    fi
    
    # Crear repo
    if gh repo create "$repo_name" \
        --public \
        --description "$description" \
        --source="$source_dir" \
        --remote=origin \
        --push 2>&1 | grep -q "Created"; then
        success "Repositorio creado: $repo_name"
    else
        warning "No se pudo crear (puede que ya exista)"
    fi
    
    echo ""
}

# Main execution
main() {
    # 1. Verificar token
    check_token
    
    # 2. Crear .gitignore
    create_gitignore
    
    # 3. Crear pre-commit hook
    create_precommit_hook
    
    # 4. Crear repositorios
    echo "📦 CREANDO REPOSITORIOS GITHUB"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Polab (monorepo principal)
    create_repo "Polab" "Monorepo principal de Polab - Landing pages, APIs, servicios" "$WORKSPACE"
    
    # Games
    create_repo "games-pauloaris" "Juegos web y Raylib con identidad cultural chilena" "$WORKSPACE/projects/gaming"
    
    # Personal website
    create_repo "paulosaldivar-svg" "Sitio personal y portfolio de Paulo Saldivar Aguilera" "$WORKSPACE/projects/personal"
    
    # Dialectico-OS
    create_repo "dialectico-os" "Sistema operativo experimental dialectico" "$WORKSPACE/dialectico-os"
    
    # OpenClaw Skills
    create_repo "openclaw-skills-pauloaris" "Skills personalizados de OpenClaw para PauloARIS" "$WORKSPACE/skills"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 5. Resumen
    echo "📊 RESUMEN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    success "Token GitHub configurado"
    success ".gitignore creado"
    success "Pre-commit hook activado"
    success "Repositorios creados (o ya existían)"
    echo ""
    echo "📁 URLs de repositorios:"
    echo "   - https://github.com/$GITHUB_USER/Polab"
    echo "   - https://github.com/$GITHUB_USER/games-pauloaris"
    echo "   - https://github.com/$GITHUB_USER/paulosaldivar-svg"
    echo "   - https://github.com/$GITHUB_USER/dialectico-os"
    echo "   - https://github.com/$GITHUB_USER/openclaw-skills-pauloaris"
    echo ""
    
    # 6. Próximos pasos
    echo "⏭️  PRÓXIMOS PASOS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Configurar GitHub Pages para:"
    echo "   - games-pauloaris (juegos web)"
    echo "   - paulosaldivar-svg (sitio personal)"
    echo ""
    echo "2. Configurar GitHub Actions:"
    echo "   - Crear .github/workflows/deploy.yml"
    echo "   - Configurar CI/CD"
    echo ""
    echo "3. Configurar branch protection:"
    echo "   - Protected branch: main"
    echo "   - Required reviews: 1"
    echo "   - Require status checks: CI"
    echo ""
    echo "4. Añadir topics:"
    echo "   - Polab: polab, landing-page, apis, automation"
    echo "   - games: webgpu, raylib, game-dev, chile"
    echo "   - others: openclaw, skills, portfolio"
    echo ""
    
    success "✨ Actualización GitHub completada"
}

# Ejecutar
main
