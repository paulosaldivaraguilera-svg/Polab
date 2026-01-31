# Dialéctico OS - Tests de Aplicación Flask
# ===========================================

import pytest
from datetime import date
from src.app import app, db
from src.models import Cliente, Caso, Tarea, Plazo, EstadoCliente, EstadoCaso, Prioridad, TipoPlazo

# ============ FIXTURE ============

@pytest.fixture
def client():
    """Cliente de test"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def test_data(client):
    """Datos de prueba"""
    with app.app_context():
        cliente = Cliente(
            nombre="Test Cliente",
            rut="11111111-1",
            email="test@test.cl"
        )
        db.session.add(cliente)
        db.session.commit()
        
        caso = Caso(
            cliente_id=cliente.id,
            materia="Civil",
            tribunal="Juzgado Test",
            prioridad=Prioridad.ALTA
        )
        db.session.add(caso)
        db.session.commit()
        
        return {'cliente': cliente, 'caso': caso}

# ============ TESTS RUTAS ============

class TestRutasIndex:
    
    def test_dashboard(self, client):
        """Test página principal"""
        response = client.get('/')
        assert response.status_code == 200
        assert b'Dial\xc3\xa9ctico OS' in response.data or b'Dashboard' in response.data

class TestRutasClientes:
    
    def test_listar_clientes(self, client, test_data):
        """Test lista de clientes"""
        response = client.get('/clientes')
        assert response.status_code == 200
        assert b'Test Cliente' in response.data
    
    def test_nuevo_cliente_get(self, client):
        """Test formulario nuevo = client.get('/cliente/nuevo cliente"""
        response')
        assert response.status_code == 200
        assert b'Nuevo Cliente' in response.data
    
    def test_nuevo_cliente_post(self, client):
        """Test crear cliente vía POST"""
        response = client.post('/cliente/nuevo', data={
            'nombre': 'Nuevo Cliente',
            'rut': '22222222-2',
            'email': 'nuevo@test.cl'
        }, follow_redirects=True)
        
        assert response.status_code == 200
        assert b'Nuevo Cliente' in response.data
    
    def test_editar_cliente(self, client, test_data):
        """Test editar cliente"""
        cliente_id = test_data['cliente'].id
        response = client.get(f'/cliente/{cliente_id}/editar')
        assert response.status_code == 200

class TestRutasCasos:
    
    def test_listar_casos(self, client, test_data):
        """Test lista de casos"""
        response = client.get('/casos')
        assert response.status_code == 200
        assert b'Civil' in response.data
    
    def test_nuevo_caso_get(self, client, test_data):
        """Test formulario nuevo caso"""
        response = client.get('/caso/nuevo')
        assert response.status_code == 200
    
    def test_nuevo_caso_post(self, client, test_data):
        """Test crear caso vía POST"""
        cliente_id = test_data['cliente'].id
        response = client.post('/caso/nuevo', data={
            'cliente_id': cliente_id,
            'materia': 'Laboral',
            'tribunal': 'Juzgado Laboral',
            'prioridad': 'alta'
        }, follow_redirects=True)
        
        assert response.status_code == 200
        assert b'Laboral' in response.data
    
    def test_ver_caso(self, client, test_data):
        """Test ver detalle de caso"""
        caso_id = test_data['caso'].id
        response = client.get(f'/caso/{caso_id}')
        assert response.status_code == 200
        assert b'Civil' in response.data

class TestRutasTareas:
    
    def test_listar_tareas(self, client, test_data):
        """Test lista de tareas"""
        response = client.get('/tareas')
        assert response.status_code == 200
    
    def test_completar_tarea(self, client, test_data):
        """Test completar tarea"""
        caso_id = test_data['caso'].id
        
        # Crear tarea
        tarea = Tarea(
            caso_id=caso_id,
            titulo="Tarea test"
        )
        db.session.add(tarea)
        db.session.commit()
        
        response = client.post(f'/tarea/{tarea.id}/completar', follow_redirects=True)
        assert response.status_code == 200

class TestRutasPlazos:
    
    def test_agregar_plazo(self, client, test_data):
        """Test agregar plazo a caso"""
        caso_id = test_data['caso'].id
        
        response = client.post(f'/caso/{caso_id}/plazo', data={
            'titulo': 'Plazo test',
            'descripcion': 'Descripción test',
            'fecha_inicio': date.today().isoformat(),
            'dias': '10',
            'tipo': 'habil'
        }, follow_redirects=True)
        
        assert response.status_code == 200

class TestRutasAPI:
    
    def test_api_plazos(self, client, test_data):
        """Test API de plazos"""
        caso_id = test_data['caso'].id
        
        # Agregar plazo
        plazo = Plazo(
            caso_id=caso_id,
            titulo='API Test',
            tipo=TipoPlazo.CORRIDO,
            dias=10,
            fecha_inicio=date.today(),
            fecha_vencimiento=date.today()
        )
        db.session.add(plazo)
        db.session.commit()
        
        response = client.get('/api/plazos')
        assert response.status_code == 200
        assert b'API Test' in response.data
    
    def test_api_feriados(self, client):
        """Test API de feriados"""
        response = client.get('/api/calendario/feriados?año=2025')
        assert response.status_code == 200

# ============ TESTS FILTROS ============

class TestFiltrosTemplate:
    
    def test_fecha_filter(self, client):
        """Test filtro de fecha"""
        with app.app_context():
            fecha = date(2025, 12, 25)
            
            @app.template_filter('test_fecha')
            def test_fecha(f):
                return f.strftime('%d/%m/%Y')
            
            with client.application.app_context():
                render = app.jinja_env.filters.get('fecha')
                assert render(fecha) == '25/12/2025'
    
    def test_dias_vencimiento_filter(self, client):
        """Test filtro de días"""
        with app.app_context():
            from dateutil.relativedelta import relativedelta
            
            @app.template_filter('test_dias')
            def test_dias(f):
                dias = (f - date.today()).days
                return f'{dias} días'
            
            with client.application.app_context():
                render = app.jinja_env.filters.get('dias_vencimiento')
                futuro = date.today() + timedelta(days=5)
                assert '5 días' in render(futuro)

# ============ TESTS ERRORES ============

class TestErrores:
    
    def test_404_cliente(self, client):
        """Test error 404 para cliente inexistente"""
        response = client.get('/cliente/99999')
        assert response.status_code == 404
    
    def test_404_caso(self, client):
        """Test error 404 para caso inexistente"""
        response = client.get('/caso/99999')
        assert response.status_code == 404

# ============ TESTS INTEGRACIÓN ============

class TestIntegracion:
    
    def test_flujo_completo_cliente(self, client):
        """Test flujo completo con cliente"""
        # 1. Crear cliente
        response = client.post('/cliente/nuevo', data={
            'nombre': 'Cliente Integ',
            'rut': '33333333-3',
            'email': 'integ@test.cl',
            'telefono': '+56933333333'
        }, follow_redirects=True)
        assert response.status_code == 200
        
        # 2. Crear caso
        # Obtener ID del cliente (buscar en response o BD)
        with app.app_context():
            cliente = Cliente.query.filter_by(rut='33333333-3').first()
            caso_id = cliente.id
        
        response = client.post('/caso/nuevo', data={
            'cliente_id': caso_id,
            'materia': 'Familia',
            'tribunal': 'Juzgado de Familia',
            'prioridad': 'urgente'
        }, follow_redirects=True)
        assert response.status_code == 200
        
        # 3. Ver caso
        with app.app_context():
            caso = Caso.query.filter_by(cliente_id=caso_id).first()
            caso_id = caso.id
        
        response = client.get(f'/caso/{caso_id}')
        assert response.status_code == 200
    
    def test_flujo_plazos_tareas(self, client, test_data):
        """Test flujo con plazos y tareas"""
        caso_id = test_data['caso'].id
        
        # Agregar plazo
        client.post(f'/caso/{caso_id}/plazo', data={
            'titulo': 'Plazo integral',
            'dias': '15',
            'tipo': 'habil',
            'fecha_inicio': date.today().isoformat()
        }, follow_redirects=True)
        
        # Verificar en dashboard
        response = client.get('/')
        assert response.status_code == 200

# ============ RUN ============

if __name__ == '__main__':
    pytest.main([__file__, '-v', '-x'])
