# 🛠️ ENTORNO DE DESARROLLO - OpenClaw Raspberry Pi

## Resumen

Entorno de desarrollo completo configurado en Raspberry Pi 4 con todas las herramientas necesarias para desarrollo web, gestión de proyectos con Git, y automatización.

---

## 📦 Herramientas Instaladas

### Terminal y Shells
| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **zsh** | 5.9 | Shell principal con Oh My ZSH |
| **tmux** | 3.5a | Multiplexor de terminal |
| **neovim** | v0.10.4 | Editor de texto |

### Git y Control de Versiones
| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **lazygit** | v0.58.1 | UI de Git en terminal |
| **gh** | v2.67.0 | CLI de GitHub |

### Productividad
| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **fzf** | 0.60 | Fuzzy finder |
| **tldr** | v3.4.0 | Man pages simplificadas |
| **yq** | 3.4.3 | YAML processor (como jq) |
| **bat** | 0.25.0 | cat mejorado con sintaxis |
| **ripgrep** | 14.1.1 | grep mejorado |
| **jq** | 1.7 | JSON processor |
| **httpie** | 3.2.4 | curl alternativo |

### DevOps
| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **docker** | 29.2.0 | Contenedores |
| **docker-compose** | - | Orquestación |

---

## 🚀 Alias y Funciones

### Alias Git
```bash
gs      # git status
ga      # git add
gc      # git commit -m
gp      # git push
gpl     # git pull
gd      # git diff
gl      # git log --oneline -10
gco     # git checkout
```

### Alias Docker
```bash
dps     # docker ps
dpa     # docker ps -a
dc      # docker-compose
dcu     # docker-compose up -d
dcd     # docker-compose down
```

### Funciones Útiles
```bash
extract <archivo>   # Extraer cualquier archivo
mkcd <dir>          # Crear directorio y entrar
search <texto>      # Buscar en archivos
docker-clean        # Limpiar Docker
backup              # Backup del directorio actual
portcheck <puerto>  # Verificar si un puerto está libre
```

---

## 📁 Estructura de Archivos

```
~/.
├── .bashrc              # Alias y funciones bash
├── .zshrc              # Configuración zsh
├── .tmux.conf          # Configuración tmux
├── .config/nvim/       # Configuración neovim
│   └── init.vim
├── .ssh/               # Claves SSH
│   ├── id_ed25519
│   └── id_ed25519.pub
├── .oh-my-zsh/         # Oh My ZSH
├── backups/            # Backups automáticos
├── logs/               # Logs del sistema
├── NOTES.txt           # Notas rápidas
├── system-status.sh    # Script de status
├── backup-workspace.sh # Script de backup
└── .openclaw/workspace/
    ├── dashboard.html  # Dashboard web
    └── projects/       # Proyectos
```

---

## 🔧 Scripts Útiles

### system-status.sh
Muestra el estado del sistema:
```bash
~/system-status.sh
```

Incluye:
- Uptime
- CPU y Memoria
- Temperatura (Raspberry Pi)
- Estado de Docker
- Repositorios Git
- Servicios activos

### backup-workspace.sh
Crea backups del workspace:
```bash
~/backup-workspace.sh
```

- Guarda en `~/backups/`
- Mantiene solo los últimos 5 backups
- Excluye node_modules y .git

---

## 🐳 Servicios Docker (Opcionales)

### docker-compose.yml
Ubicación: `~/.openclaw/workspace/services/docker-compose.yml`

```bash
cd ~/.openclaw/workspace/services
docker-compose up -d
```

**Servicios disponibles:**

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Portainer | 9000 | Gestión de Docker |
| Netdata | 19999 | Monitoreo en tiempo real |
| Uptime Kuma | 3001 | Monitoring de uptime |

---

## ⏰ Cron Jobs Configurados

| Schedule | Script | Descripción |
|----------|--------|-------------|
| `0 */4 * * *` | `system-status.sh` | Log de status cada 4 horas |
| `0 3 * * *` | `backup-workspace.sh` | Backup diario a las 3 AM |
| `0 6 * * *` | `daily-run.sh` | Pauta de LA UNIDAD |
| `*/5 * * * *` | git tracking | Detectar nuevos archivos |

---

## 🔐 Seguridad

### SSH
- ✅ Solo autenticación con claves
- ✅ Clave Ed25519 generada
- ✅ Fail2ban activo (3 intentos, 1h ban)
- ✅ UFW activo (deny incoming)

### GitHub
- ✅ Token configurado en remotos
- ✅ Historial deshabilitado para passwords

---

## 📝 Comandos Rápidos

```bash
# Ver status del sistema
~/system-status.sh

# Crear backup
~/backup-workspace.sh

# Ver nuevos archivos
cat /tmp/new_files.txt

# Ver logs
cat ~/logs/status.log
cat ~/logs/backup.log

# Docker
docker ps
docker-compose -f ~/.openclaw/workspace/services/docker-compose.yml ps

# Editar con neovim
nvim archivo

# Git UI
lazygit

# Limpiar Docker
docker-clean
```

---

## 🎮 Proyectos Activos

| Proyecto | URL | Estado |
|----------|-----|--------|
| SISTEMA // SUR | paulosaldivaraguilera-svg.github.io/sistema-sur/ | ✅ v3.2 |
| ELEMENTAL PONG | paulosaldivaraguilera-svg.github.io/elemental-pong/ | ✅ v2.0 |
| DELITOS | paulosaldivaraguilera-svg/delitos | ✅ Prototype |
| LA UNIDAD | Cron 6AM | ✅ Configurado |

---

## 🔗 Links Útiles

- **GitHub:** https://github.com/paulosaldivaraguilera-svg
- **Dashboard:** `~/.openclaw/workspace/dashboard.html`
- **Documentación:** `~/.openclaw/workspace/docs/`

---

*Documentación generada automáticamente - 2026-02-01*
