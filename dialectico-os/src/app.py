# Dialéctico OS - Aplicación Principal
# =====================================

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import date, datetime
import os

# Importar modelos y utilidades
from models import db, Cliente, Caso, Tarea, Plazo, Feriado, Configuracion
from deadlines import CalendarioChileno

# ============ CONFIGURACIÓN ============

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dialectico-os-2026')

# Base de datos
DB_PATH = os.environ.get('DB_PATH', '/home/pi/.openclaw/workspace/dialectico-os/db/dialectico.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar
db.init_app(app)

# Calendario chileno
calendario = CalendarioChileno()

# ============ RUTAS PRINCIPALES ============

@app.route('/')
def index():
    """Dashboard principal"""
    # Métricas
    total_clientes = Cliente.query.count()
    casos_activos = Caso.query.filter(Caso.estado != 'archivado').count()
    tareas_pendientes = Tarea.query.filter(Tarea.completado == False).count()
    
    # Plazos críticos (próximos 7 días)
    hoy = date.today()
    desde = hoy
    hasta = hoy + __import__('datetime').timedelta(days=7)
    plazos_criticos = Plazo.query.filter(
        Plazo.fecha_vencimiento >= desde,
        Plazo.fecha_vencimiento <= hasta,
        Plazo.suspendido == False
    ).order_by(Plazo.fecha_vencimiento).all()
    
    return render_template('dashboard.html',
        total_clientes=total_clientes,
        casos_activos=casos_activos,
        tareas_pendientes=tareas_pendientes,
        plazos_criticos=plazos_criticos,
        hoy=hoy
    )

@app.route('/clientes')
def clientes():
    """Lista de clientes"""
    estado = request.args.get('estado')
    query = Cliente.query
    if estado:
        query = query.filter_by(estado=estado)
    lista = query.order_by(Cliente.nombre).all()
    return render_template('clientes.html', clientes=lista)

@app.route('/cliente/nuevo', methods=['GET', 'POST'])
def nuevo_cliente():
    """Crear nuevo cliente"""
    if request.method == 'POST':
        cliente = Cliente(
            nombre=request.form['nombre'],
            rut=request.form['rut'],
            email=request.form.get('email'),
            telefono=request.form.get('telefono'),
            direccion=request.form.get('direccion'),
            notas=request.form.get('notas')
        )
        db.session.add(cliente)
        db.session.commit()
        flash('Cliente creado correctamente', 'success')
        return redirect(url_for('clientes'))
    return render_template('cliente_form.html', cliente=None)

@app.route('/cliente/<int:id>/editar', methods=['GET', 'POST'])
def editar_cliente(id):
    """Editar cliente"""
    cliente = Cliente.query.get_or_404(id)
    if request.method == 'POST':
        cliente.nombre = request.form['nombre']
        cliente.rut = request.form['rut']
        cliente.email = request.form.get('email')
        cliente.telefono = request.form.get('telefono')
        cliente.direccion = request.form.get('direccion')
        cliente.notas = request.form.get('notas')
        db.session.commit()
        flash('Cliente actualizado', 'success')
        return redirect(url_for('clientes'))
    return render_template('cliente_form.html', cliente=cliente)

@app.route('/casos')
def casos():
    """Lista de casos"""
    estado = request.args.get('estado')
    materia = request.args.get('materia')
    query = Caso.query
    if estado:
        query = query.filter_by(estado=estado)
    if materia:
        query = query.filter_by(materia=materia)
    lista = query.order_by(Caso.creado.desc()).all()
    return render_template('casos.html', casos=lista)

@app.route('/caso/nuevo', methods=['GET', 'POST'])
def nuevo_caso():
    """Crear nuevo caso"""
    clientes = Cliente.query.filter_by(estado='activo').all()
    if request.method == 'POST':
        caso = Caso(
            numero_expediente=request.form.get('numero_expediente'),
            cliente_id=request.form['cliente_id'],
            materia=request.form['materia'],
            tipo_proceso=request.form.get('tipo_proceso'),
            tribunal=request.form.get('tribunal'),
            prioridad=request.form.get('prioridad', 'media')
        )
        db.session.add(caso)
        db.session.commit()
        flash('Caso creado correctamente', 'success')
        return redirect(url_for('casos'))
    return render_template('caso_form.html', caso=None, clientes=clientes)

@app.route('/caso/<int:id>')
def ver_caso(id):
    """Ver detalle de un caso"""
    caso = Caso.query.get_or_404(id)
    return render_template('caso_detail.html', caso=caso)

@app.route('/caso/<int:id>/plazo', methods=['POST'])
def agregar_plazo(id):
    """Agregar plazo a un caso"""
    caso = Caso.query.get_or_404(id)
    
    fecha_inicio = datetime.strptime(request.form['fecha_inicio'], '%Y-%m-%d').date()
    dias = int(request.form['dias'])
    tipo = request.form.get('tipo', 'habil')
    
    vencimiento = calendario.calcular_vencimiento(fecha_inicio, dias, tipo)
    
    plazo = Plazo(
        caso_id=caso.id,
        titulo=request.form['titulo'],
        descripcion=request.form.get('descripcion'),
        tipo=tipo,
        dias=dias,
        fecha_inicio=fecha_inicio,
        fecha_vencimiento=vencimiento
    )
    db.session.add(plazo)
    db.session.commit()
    flash('Plazo agregado correctamente', 'success')
    return redirect(url_for('ver_caso', id=caso.id))

@app.route('/tareas')
def tareas():
    """Lista de tareas"""
    estado = request.args.get('estado', 'pendiente')
    query = Tarea.query
    if estado == 'pendiente':
        query = query.filter(Tarea.completado == False)
    elif estado == 'completada':
        query = query.filter(Tarea.completado == True)
    lista = query.order_by(Tarea.prioridad, Tarea.fecha_vencimiento).all()
    return render_template('tareas.html', tareas=lista, estado=estado)

@app.route('/tarea/<int:id>/completar', methods=['POST'])
def completar_tarea(id):
    """Marcar tarea como completada"""
    tarea = Tarea.query.get_or_404(id)
    tarea.completado = True
    tarea.fecha_completado = date.today()
    db.session.commit()
    return redirect(url_for('tareas'))

@app.route('/api/plazos')
def api_plazos():
    """API: plazos próximos"""
    hoy = date.today()
    semana = hoy + __import__('datetime').timedelta(days=7)
    plazos = Plazo.query.filter(
        Plazo.fecha_vencimiento <= semana,
        Plazo.fecha_vencimiento >= hoy
    ).all()
    return jsonify([p.to_dict() for p in plazos])

@app.route('/api/calendario/feriados')
def api_feriados():
    """API: feriados del año"""
    año = request.args.get('año', date.today().year)
    return jsonify(calendario.listar_feriados(int(año)))

# ============ UTILIDADES ============

@app.template_filter('fecha')
def formato_fecha(fecha):
    """Formatear fecha para display"""
    if isinstance(fecha, datetime):
        return fecha.strftime('%d/%m/%Y %H:%M')
    elif isinstance(fecha, date):
        return fecha.strftime('%d/%m/%Y')
    return str(fecha)

@app.template_filter('dias_vencimiento')
def dias_vencimiento(fecha):
    """Días hasta el vencimiento"""
    if isinstance(fecha, date):
        dias = (fecha - date.today()).days
        if dias < 0:
            return f'Vencido hace {abs(dias)} días'
        elif dias == 0:
            return 'Vence hoy'
        elif dias == 1:
            return '1 día'
        else:
            return f'{dias} días'
    return ''

# ============ INICIALIZACIÓN ============

def init_db():
    """Inicializar base de datos"""
    with app.app_context():
        db.create_all()
        
        # Crear configuración inicial
        Configuracion.set('app_name', 'Dialéctico OS', 'Nombre de la aplicación')
        Configuracion.set('timezone', 'America/Santiago', 'Zona horaria')
        Configuracion.set('dias_alerta_plazo', '7', 'Días antes para alertar plazos')
        
        print("✅ Base de datos inicializada")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Dialéctico OS')
    parser.add_argument('--init', action='store_true', help='Inicializar base de datos')
    parser.add_argument('--port', type=int, default=8080, help='Puerto')
    
    args = parser.parse_args()
    
    if args.init:
        init_db()
    else:
        # Asegurar que existe el directorio de la BD
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        app.run(host='0.0.0.0', port=args.port, debug=True)
