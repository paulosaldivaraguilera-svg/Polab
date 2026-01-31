# Dialéctico OS - Tests de Modelos
# =================================

import pytest
from datetime import date, datetime, timedelta
from src.models import (
    Cliente, Caso, Tarea, Plazo, Feriado, Configuracion,
    EstadoCliente, EstadoCaso, Prioridad, TipoPlazo,
    db, contar_clientes, contar_casos, plazos_criticos, tareas_pendientes
)
from src.app import app

# ============ FIXTURES ============

@pytest.fixture
def client():
    """Cliente de test para Flask"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def sample_cliente():
    """Cliente de prueba"""
    cliente = Cliente(
        nombre="Juan Pérez",
        rut="12345678-9",
        email="juan@test.cl",
        telefono="+56912345678",
        direccion="Calle 123, Temuco"
    )
    db.session.add(cliente)
    db.session.commit()
    return cliente

@pytest.fixture
def sample_caso(sample_cliente):
    """Caso de prueba"""
    caso = Caso(
        cliente_id=sample_cliente.id,
        materia="Civil",
        tipo_proceso="Juicio ejecutivo",
        tribunal="Juzgado de Temuco",
        numero_expediente="EXP-2026-001"
    )
    db.session.add(caso)
    db.session.commit()
    return caso

# ============ TESTS CLIENTE ============

class TestCliente:
    
    def test_crear_cliente(self, client, sample_cliente):
        """Test creación de cliente"""
        assert sample_cliente.id is not None
        assert sample_cliente.nombre == "Juan Pérez"
        assert sample_cliente.rut == "12345678-9"
        assert sample_cliente.estado == EstadoCliente.ACTIVO
    
    def test_cliente_to_dict(self, sample_cliente):
        """Test serialización a diccionario"""
        data = sample_cliente.to_dict()
        
        assert 'id' in data
        assert 'nombre' in data
        assert 'rut' in data
        assert data['estado'] == 'activo'
    
    def test_cliente_estados(self, client):
        """Test diferentes estados de cliente"""
        for estado in EstadoCliente:
            cliente = Cliente(
                nombre="Test",
                rut=f"{date.today().strftime('%Y%m%d')}-{estado.value[0]}",
                estado=estado
            )
            db.session.add(cliente)
            db.session.commit()
            
            assert cliente.estado == estado
            assert cliente.to_dict()['estado'] == estado.value
    
    def test_contar_clientes(self, client, sample_cliente):
        """Test contador de clientes"""
        assert contar_clientes() >= 1
        assert contar_clientes(estado='activo') >= 1
    
    def test_cliente_rut_unico(self, client, sample_cliente):
        """Test que RUT debe ser único"""
        cliente2 = Cliente(
            nombre="Otro",
            rut=sample_cliente.rut  # Mismo RUT
        )
        db.session.add(cliente2)
        
        # Debe fallar por integridad
        from sqlalchemy.exc import IntegrityError
        with pytest.raises(IntegrityError):
            db.session.commit()

# ============ TESTS CASO ============

class TestCaso:
    
    def test_crear_caso(self, client, sample_cliente, sample_caso):
        """Test creación de caso"""
        assert sample_caso.id is not None
        assert sample_caso.cliente_id == sample_cliente.id
        assert sample_caso.materia == "Civil"
        assert sample_caso.estado == EstadoCaso.ACTIVO
        assert sample_caso.prioridad == Prioridad.MEDIA
    
    def test_caso_to_dict(self, sample_caso):
        """Test serialización de caso"""
        data = sample_caso.to_dict()
        
        assert 'id' in data
        assert 'materia' in data
        assert 'cliente_id' in data
        assert 'estado' in data
        assert data['prioridad'] == 'media'
    
    def test_caso_con_plazos(self, client, sample_caso):
        """Test relación caso-plazos"""
        from src.deadlines import CalendarioChileno
        
        cal = CalendarioChileno()
        inicio = date.today()
        vencimiento = cal.calcular_vencimiento(inicio, 10, tipo='habil')
        
        plazo = Plazo(
            caso_id=sample_caso.id,
            titulo="Plazo de prueba",
            tipo=TipoPlazo.HABIL,
            dias=10,
            fecha_inicio=inicio,
            fecha_vencimiento=vencimiento
        )
        db.session.add(plazo)
        db.session.commit()
        
        # Verificar relación
        assert len(sample_caso.plazos) == 1
        assert sample_caso.plazos[0].titulo == "Plazo de prueba"
    
    def test_caso_con_tareas(self, client, sample_caso):
        """Test relación caso-tareas"""
        tarea = Tarea(
            caso_id=sample_caso.id,
            titulo="Tarea de prueba",
            prioridad=Prioridad.ALTA
        )
        db.session.add(tarea)
        db.session.commit()
        
        assert len(sample_caso.tareas) == 1
        assert sample_caso.tareas[0].titulo == "Tarea de prueba"

# ============ TESTS PLAZO ============

class TestPlazo:
    
    def test_crear_plazo(self, client, sample_caso):
        """Test creación de plazo"""
        inicio = date.today()
        vencimiento = inicio + timedelta(days=10)
        
        plazo = Plazo(
            caso_id=sample_caso.id,
            titulo="Plazo test",
            tipo=TipoPlazo.HABIL,
            dias=10,
            fecha_inicio=inicio,
            fecha_vencimiento=vencimiento
        )
        db.session.add(plazo)
        db.session.commit()
        
        assert plazo.id is not None
        assert plazo.dias == 10
        assert plazo.suspendido == False
    
    def test_dias_pendientes(self, client, sample_caso):
        """Test cálculo de días pendientes"""
        from dateutil.relativedelta import relativedelta
        
        # Plazo que vence en 5 días
        inicio = date.today()
        vencimiento = inicio + timedelta(days=5)
        
        plazo = Plazo(
            caso_id=sample_caso.id,
            titulo="Plazo 5 días",
            tipo=TipoPlazo.CORRIDO,
            dias=5,
            fecha_inicio=inicio,
            fecha_vencimiento=vencimiento
        )
        db.session.add(plazo)
        db.session.commit()
        
        assert plazo.dias_pendientes() == 5
    
    def test_estado_plazo(self, client, sample_caso):
        """Test estados de plazo"""
        casos = [
            (date.today() + timedelta(days=-1), 'vencido'),     # Ayer
            (date.today(), 'hoy'),                               # Hoy
            (date.today() + timedelta(days=2), 'critico'),      # 2 días
            (date.today() + timedelta(days=5), 'alerta'),       # 5 días
            (date.today() + timedelta(days=10), 'normal'),      # 10 días
        ]
        
        for fecha_venc, expected in casos:
            plazo = Plazo(
                caso_id=sample_caso.id,
                titulo=f"Plazo {expected}",
                tipo=TipoPlazo.CORRIDO,
                dias=10,
                fecha_inicio=date.today(),
                fecha_vencimiento=fecha_venc
            )
            db.session.add(plazo)
            db.session.commit()
            
            assert plazo.estado_plazo() == expected, f"Para {fecha_venc}: {plazo.estado_plazo()} != {expected}"
    
    def test_plazo_suspendido(self, client, sample_caso):
        """Test plazo suspendido"""
        inicio = date.today()
        vencimiento = inicio + timedelta(days=10)
        
        plazo = Plazo(
            caso_id=sample_caso.id,
            titulo="Plazo suspendido",
            tipo=TipoPlazo.HABIL,
            dias=10,
            fecha_inicio=inicio,
            fecha_vencimiento=vencimiento,
            suspendido=True,
            dias_suspension=5
        )
        db.session.add(plazo)
        db.session.commit()
        
        assert plazo.suspendido == True
        assert plazo.dias_suspension == 5
    
    def test_plazos_criticos(self, client, sample_caso):
        """Test query de plazos críticos"""
        # Plazo crítico (3 días)
        p1 = Plazo(
            caso_id=sample_caso.id,
            titulo="Critico",
            tipo=TipoPlazo.CORRIDO,
            dias=3,
            fecha_inicio=date.today(),
            fecha_vencimiento=date.today() + timedelta(days=3)
        )
        
        # Plazo normal (10 días)
        p2 = Plazo(
            caso_id=sample_caso.id,
            titulo="Normal",
            tipo=TipoPlazo.CORRIDO,
            dias=10,
            fecha_inicio=date.today(),
            fecha_vencimiento=date.today() + timedelta(days=10)
        )
        
        db.session.add_all([p1, p2])
        db.session.commit()
        
        criticos = plazos_criticos()
        assert len(criticos) >= 1

# ============ TESTS TAREA ============

class TestTarea:
    
    def test_crear_tarea(self, client, sample_caso):
        """Test creación de tarea"""
        tarea = Tarea(
            caso_id=sample_caso.id,
            titulo="Tarea de prueba",
            descripcion="Descripción",
            prioridad=Prioridad.ALTA,
            fecha_vencimiento=date.today() + timedelta(days=5)
        )
        db.session.add(tarea)
        db.session.commit()
        
        assert tarea.id is not None
        assert tarea.completado == False
        assert tarea.estado == 'pendiente'
    
    def test_completar_tarea(self, client, sample_caso):
        """Test completar tarea"""
        tarea = Tarea(
            caso_id=sample_caso.id,
            titulo="A completar"
        )
        db.session.add(tarea)
        db.session.commit()
        
        # Completar
        tarea.completado = True
        tarea.fecha_completado = date.today()
        db.session.commit()
        
        assert tarea.completado == True
        assert tarea.fecha_completado == date.today()
    
    def test_tareas_pendientes(self, client, sample_caso):
        """Test query de tareas pendientes"""
        # Pendiente
        t1 = Tarea(caso_id=sample_caso.id, titulo="Pendiente 1", completado=False)
        # Completada
        t2 = Tarea(caso_id=sample_caso.id, titulo="Completada", completado=True)
        
        db.session.add_all([t1, t2])
        db.session.commit()
        
        pendientes = tareas_pendientes()
        assert len(pendientes) >= 1
        # Solo debe haber pendientes
        for t in pendientes:
            assert t.completado == False

# ============ TESTS CONFIGURACIÓN ============

class TestConfiguracion:
    
    def test_set_get_config(self, client):
        """Test guardar y leer configuración"""
        Configuracion.set('test_key', 'test_value', 'Descripción de prueba')
        
        valor = Configuracion.get('test_key')
        assert valor == 'test_value'
    
    def test_get_default(self, client):
        """Test valor por defecto"""
        valor = Configuracion.get('no_existe', 'default_value')
        assert valor == 'default_value'
    
    def test_update_config(self, client):
        """Test actualizar configuración"""
        Configuracion.set('mi_key', 'valor1')
        Configuracion.set('mi_key', 'valor2')
        
        assert Configuracion.get('mi_key') == 'valor2'

# ============ TESTS FERIADOS ============

class TestFeriados:
    
    def test_crear_feriado(self, client):
        """Test crear feriado"""
        feriado = Feriado(
            fecha=date(2025, 12, 25),
            nombre="Navidad",
            tipo="nacional"
        )
        db.session.add(feriado)
        db.session.commit()
        
        assert feriado.id is not None
        assert feriado.activo == True
    
    def test_feriado_to_dict(self, client):
        """Test serialización de feriado"""
        feriado = Feriado(
            fecha=date(2025, 1, 1),
            nombre="Año Nuevo"
        )
        db.session.add(feriado)
        db.session.commit()
        
        data = feriado.to_dict()
        assert data['nombre'] == 'Año Nuevo'
        assert '2025' in data['fecha']

# ============ RUN TESTS ============

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
