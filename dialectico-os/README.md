# Dialéctico OS - Sistema Operativo Profesional

Sistema operativo para trabajo profesional en entornos de alta complejidad normativa.

## Filosofía

- **El conocimiento es dinámico** — Las reglas cambian
- **Criterios configurables** — No imponer rigidez
- **Seguridad profesional** — Reducir ansiedad operativa
- **Trazabilidad** — Todo auditable
- **El humano decide** — La tecnología asiste

## Estructura

```
dialectico-os/
├── src/
│   ├── __init__.py
│   ├── app.py              # Aplicación principal
│   ├── models.py           # Modelos de datos
│   ├── deadlines.py        # Motor de plazos chilenos
│   ├── calendar.py         # Calendario configurable
│   ├── routes.py           # Rutas web
│   ├── utils.py            # Utilidades
│   └── templates/          # HTML templates
├── tests/
│   ├── test_deadlines.py
│   ├── test_calendar.py
│   └── test_models.py
├── docs/
│   ├── arquitectura.md
│   ├── plazos.md
│   └── uso.md
├── config/
│   └── settings.py
├── migrations/
├── scripts/
├── requirements.txt
└── run.py
```

## Instalación

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install flask flask-sqlalchemy flask-login python-dateutil

# Inicializar base de datos
python3 scripts/migrate.py

# Ejecutar
python3 run.py
```

## Características

### Gestión de Casos
- Clientes, casos, tareas
- Estados configurables
- Fechas límite con alertas

### Motor de Plazos
- Días corridos vs días hábiles
- Feriados chilenos configurables
- Suspensión de plazos
- Cálculo automático de vencimientos

### Dashboard
- Visión general del estado
- Plazos críticos
- Tareas pendientes
- Métricas operativas

## Uso

1. Acceder a `http://localhost:8080`
2. Login con credenciales
3. Ver dashboard principal
4. Gestionar casos desde el menú

## License

Paulo Saldivar - 2026
