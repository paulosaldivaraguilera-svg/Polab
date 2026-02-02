#!/bin/bash
# E-Commerce PyME Chile - Script de Setup Inicial
# Ejecutar en VPS nuevo (Ubuntu 22.04 LTS)
# Costo estimado: $12-18 USD/mes (VPS 2GB RAM)

set -e

echo "🚀 Setup E-Commerce PyME Chile - n8n + Docker"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar que es root o tiene sudo
if [[ $EUID -ne 0 ]]; then
   log_warn "Este script requiere sudo. Ejecutando con sudo..."
   exec sudo "$0" "$@"
fi

# Actualizar sistema
log_info "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar Docker
log_info "Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
log_info "Instalando Docker Compose..."
apt install docker-compose -y

# Instalar n8n (usando Docker)
log_info "Configurando n8n con Docker..."

mkdir -p /opt/n8n
cd /opt/n8n

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-change_this_password}
      - WEBHOOK_URL=https://tu-dominio.cl/
      - GENERIC_TIMEZONE=America/Santiago
      - TZ=America/Santiago
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local_files:/files
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge

volumes:
  n8n_data:
EOF

log_info "Creando archivo de entorno..."
cat > .env << 'EOF'
N8N_PASSWORD=tu_password_seguro_aqui
EOF

# Instalar Caddy como reverse proxy (SSL automático)
log_info "Configurando Caddy (reverse proxy con SSL)..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy -y

cat > /etc/caddy/Caddyfile << 'EOF'
tu-dominio.cl {
    reverse_proxy localhost:5678
    tls tu-email@tu-dominio.cl
}
EOF

log_info "Iniciando servicios..."
docker-compose up -d

# Configurar firewall
log_info "Configurando firewall (UFW)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5678/tcp
ufw --force enable

# Instalar Certbot para SSL
log_info "Instalando Certbot..."
apt install certbot python3-certbot-nginx -y

log_info "=============================================="
log_info "✅ Setup completado!"
log_info ""
log_info "Próximos pasos:"
log_info "1. Configurar dominio DNS pointing a esta IP"
log_info "2. Acceder a n8n: http://tu-dominio.cl:5678"
log_info "3. Crear workflows del proyecto e-commerce"
log_info "4. Configurar WhatsApp Business API"
log_info ""
log_info "Costos mensuales estimados:"
log_info "- VPS (2GB RAM): $12-18 USD"
log_info "- Dominio .cl: $1.25 USD"
log_info "=============================================="
