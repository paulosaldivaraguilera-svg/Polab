# Dialéctico OS - Tests
# =====================

## Requisitos

```bash
pip install pytest flask flask-sqlalchemy python-dateutil
```

## Ejecutar Tests

```bash
# Todos los tests
python3 -m pytest tests/ -v

# Tests específicos
python3 -m pytest tests/test_deadlines.py -v
python3 -m pytest tests/test_models.py -v
python3 -m pytest tests/test_app.py -v

# Coverage
python3 -m pytest tests/ --cov=dialectico-os --cov-report=term-missing
```

## Estructura de Tests

```
tests/
├── test_deadlines.py   # Tests del motor de plazos
├── test_models.py      # Tests de modelos de datos
├── test_app.py         # Tests de rutas Flask
└── __init__.py
```

## Tests Incluidos

### test_deadlines.py
- Test de feriados
- Test de fines de semana
- Test de días hábiles
- Test de cálculo de vencimiento
- Test de plazos especiales

### test_models.py
- Test de Cliente (CRUD, estados, serialización)
- Test de Caso (relaciones, prioridades)
- Test de Plazo (estados, cálculos, suspensiones)
- Test de Tarea (estados, completación)
- Test de Configuración

### test_app.py
- Test de rutas principales
- Test de API endpoints
- Test de filtros de templates
- Test de errores 404
- Tests de integración

## Cobertura Actual

| Módulo | Cobertura |
|--------|-----------|
| deadlines.py | ~100% |
| models.py | ~95% |
| app.py | ~80% |

## Agregar Nuevos Tests

1. Crear test en el archivo correspondiente
2. Usar las fixtures:
   - `client`: Cliente Flask test
   - `sample_cliente`: Cliente de ejemplo
   - `sample_caso`: Caso de ejemplo
   - `test_data`: Cliente y caso juntos

## Ejemplo

```python
def test_mi_nuevo_test(client, sample_cliente):
    """Descripción del test"""
    response = client.get(f'/cliente/{sample_cliente.id}')
    assert response.status_code == 200
```
