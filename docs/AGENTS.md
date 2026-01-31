# AGENTS.md - Workspace Structure

This folder contains workspace configuration and documentation.

## Directory Structure

```
workspace/
├── docs/                  # Documentation
├── projects/              # Projects organized by category
├── memory/                # Session notes (not committed publicly)
├── skills/                # OpenClaw skills
├── config/                # Configuration files
└── logs/                  # Logs (not committed publicly)
```

## Projects Organization

Projects are organized by category:

| Category | Description |
|----------|-------------|
| `projects/polab/` | POLAB startup infrastructure |
| `projects/personal/` | Personal projects |
| `projects/gaming/` | Games and entertainment |
| `projects/craft/` | Craft projects |
| `projects/tools/` | Tools and utilities |

## Configuration Files

| File | Purpose |
|------|---------|
| `README.md` | Workspace overview |
| `TOOLS.md` | Tool configuration notes |
| `AGENTS.md` | This file |

## OpenClaw Integration

OpenClaw runs in this workspace and uses:
- `memory/` for session context
- `skills/` for OpenClaw skills
- `docs/` for documentation

## Notes

- Do not commit sensitive data to public repositories
- Keep documentation updated when structure changes
- Use descriptive names for project directories
