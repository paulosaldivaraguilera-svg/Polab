# 📋 Estado del Sistema - polab

**Última actualización:** 2026-02-01 14:45 GMT-3

---

## 🐳 Docker Services

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| Portainer | 9000/9443 | http://localhost:9000 | ✅ |
| Uptime Kuma | 3001 | http://localhost:3001 | ✅ |
| Netdata | 19999 | http://localhost:19999 | ✅ |

---

## 🔑 SSH

```bash
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMOvklkM2xDnRfaHXSvfJuxWsw3A/n9waWl+tfA4v5sN pi@raspberry
```

- GitHub: ✅ Autenticado
- Repositorios: Listo para clonar/push

---

## 📁 Proyectos

| Proyecto | Estado | Notes |
|----------|--------|-------|
| `elemental-pong` | ✅ Completo | WebGPU |
| `la_unidad` | ✅ Automatizado | Script diario funcionando |
| `services` | ✅ Docker | 3 contenedores |

---

## 📚 Automatizaciones

- **La Unidad:** Script de informe diario
- **Docker:** Portainer + Netdata + Uptime Kuma

---

## ⚙️ Comandos Útiles

```bash
# Docker
cd ~/.openclaw/workspace/services && docker compose ps
docker compose logs -f

# SSH test
ssh -T git@github.com

# Verificar servicios
curl localhost:19999  # Netdata
curl localhost:3001    # Uptime Kuma
```
