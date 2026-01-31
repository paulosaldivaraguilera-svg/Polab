# Repositorios ARIS - Estructura Final

## ✅ 5 Repositorios en GitHub

| Repo | URL | Descripción |
|------|-----|-------------|
| **Polab** | github.com/paulosaldivaraguilera-svg/Polab | Workspace principal |
| **elemental-pong** | github.com/paulosaldivaraguilera-svg/elemental-pong | Juego de Pong arcade |
| **paulosaldivar-web** | github.com/paulosaldivaraguilera-svg/paulosaldivar-web | Web personal |
| **comenzar-landing** | github.com/paulosaldivaraguilera-svg/comenzar-landing | Landing de captación |
| **dialectico-os** | github.com/paulosaldivaraguilera-svg/dialectico-os | Sistema operativo profesional |

## Estructura del Workspace

```
/home/pi/.openclaw/workspace/
├── Polab/                    # Repo principal
│   ├── ARIS/                 # Scripts de automatización
│   ├── proyectos-paulo/      # Docs y proyectos
│   ├── memory/               # Memorias
│   └── [config, logs, etc.]
│
├── elemental-pong/           # Repo separado
│   ├── index.html
│   ├── README.md
│   └── assets/
│
├── paulosaldivar-web/        # Repo separado
│   ├── src/
│   ├── assets/
│   └── [archivos web]
│
├── comenzar-landing/         # Repo separado
│   ├── App.jsx
│   └── README.md
│
└── dialectico-os/            # Repo separado
    ├── src/
    ├── tests/
    ├── docs/
    └── [código del sistema]
```

## Sincronización Automática

### Polab (Workspace Principal)
```bash
# Auto-sync cada hora (ya configurado)
python3 auto_sync.py status   # Ver estado
python3 auto_sync.py sync     # Forzar sync
```

### Repositorios Separados
Cada repo se migra manualmente cuando hay cambios significativos.

## Comandos Útiles

```bash
# Ver todos los repos
gh repo list paulosaldivaraguilera-svg

# Clonar todos los repos
gh repo clone paulosaldivaraguilera-svg/elemental-pong
gh repo clone paulosaldivaraguilera-svg/paulosaldivar-web
gh repo clone paulosaldivaraguilera-svg/comenzar-landing
gh repo clone paulosaldivaraguilera-svg/dialectico-os

# Ver estado de un repo
gh repo view paulosaldivaraguilera-svg/elemental-pong
```

## GitHub Token

- **Tipo:** Classic (ghp_)
- **Scopes:** repo, workflow, delete_repo, read:user, user:email
- **Almacenado en:** GitHub CLI (`gh auth login`)

---

*Actualizado: 2026-01-31*
