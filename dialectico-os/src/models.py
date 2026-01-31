# Dialéctico OS - Modelos de Datos
# ================================

from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

# ============ ENUMS ============

class EstadoCliente(Enum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    POTENCIAL = "potencial"
    ARCHIVADO = "archivado"

class EstadoCaso(Enum):
    ACTIVO = "activo"
    EN_CURSO = "en_curso"
    ESPERANDO = "esperando"
    PAUSADO = "pausado"
    TERMINADO = "terminado"
    ARCHIVADO = "archivado"

class Prioridad(Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"

class TipoPlazo(Enum):
    CORRIDO = "corrido"
    HABIL = "habil"
    JUDICIAL = "judicial"

# ============ MODELOS ============

class Cliente(db.Model):
    """Cliente del estudio jurídico"""
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    rut = db.Column(db.String(12), unique=True, nullable=False)
    email = db.Column(db.String(200))
    telefono = db.Column(db.String(20))
    direccion = db.Column(db.String(500))
    notas = db.Column(db.Text)
    estado = db.Column(db.Enum(EstadoCliente), default=EstadoCliente.ACTIVO)
    creado = db.Column(db.DateTime, default=datetime.now)
    actualizado = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relaciones
    casos = db.relationship('Caso', backref='cliente', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'rut': self.rut,
            'email': self.email,
            'telefono': self.telefono,
            'estado': self.estado.value,
            'creado': self.creado.isoformat()
        }

class Caso(db.Model):
    """Caso judicial o consulta"""
    id = db.Column(db.Integer, primary_key=True)
    numero_expediente = db.Column(db.String(100))
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    materia = db.Column(db.String(100), nullable=False)  # Familia, Civil, Laboral, etc.
    tipo_proceso = db.Column(db.String(100))  # Juicio, Recurso, Consulta, etc.
    tribunal = db.Column(db.String(200))
    estado = db.Column(db.Enum(EstadoCaso), default=EstadoCaso.ACTIVO)
    prioridad = db.Column(db.Enum(Prioridad), default=Prioridad.MEDIA)
    fecha_inicio = db.Column(db.Date, default=date.today)
    fecha_termino = db.Column(db.Date)
    observaciones = db.Column(db.Text)
    creado = db.Column(db.DateTime, default=datetime.now)
    actualizado = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relaciones
    tareas = db.relationship('Tarea', backref='caso', lazy=True)
    plazos = db.relationship('Plazo', backref='caso', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'numero_expediente': self.numero_expediente,
            'cliente_id': self.cliente_id,
            'materia': self.materia,
            'tribunal': self.tribunal,
            'estado': self.estado.value,
            'prioridad': self.prioridad.value,
            'fecha_inicio': self.fecha_inicio.isoformat()
        }

class Tarea(db.Model):
    """Tarea asociada a un caso"""
    id = db.Column(db.Integer, primary_key=True)
    caso_id = db.Column(db.Integer, db.ForeignKey('caso.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    estado = db.Column(db.String(50), default='pendiente')  # pendiente, en_progreso, completada
    prioridad = db.Column(db.Enum(Prioridad), default=Prioridad.MEDIA)
    fecha_vencimiento = db.Column(db.Date)
    completado = db.Column(db.Boolean, default=False)
    fecha_completado = db.Column(db.Date)
    creado = db.Column(db.DateTime, default=datetime.now)
    actualizado = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'caso_id': self.caso_id,
            'titulo': self.titulo,
            'estado': self.estado,
            'prioridad': self.prioridad.value,
            'vencimiento': self.fecha_vencimiento.isoformat() if self.fecha_vencimiento else None
        }

class Plazo(db.Model):
    """Plazo legal de un caso"""
    id = db.Column(db.Integer, primary_key=True)
    caso_id = db.Column(db.Integer, db.ForeignKey('caso.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    tipo = db.Column(db.Enum(TipoPlazo), default=TipoPlazo.HABIL)
    dias = db.Column(db.Integer, nullable=False)  # Duración del plazo
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    suspendido = db.Column(db.Boolean, default=False)
    dias_suspension = db.Column(db.Integer, default=0)
    observaciones = db.Column(db.Text)
    notificado = db.Column(db.Boolean, default=False)
    creado = db.Column(db.DateTime, default=datetime.now)
    actualizado = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def dias_pendientes(self):
        """Días restantes para el vencimiento"""
        from datetime import timedelta
        return (self.fecha_vencimiento - date.today()).days
    
    def estado_plazo(self):
        """Estado del plazo"""
        dias = self.dias_pendientes()
        if dias < 0:
            return 'vencido'
        elif dias == 0:
            return 'hoy'
        elif dias <= 3:
            return 'critico'
        elif dias <= 7:
            return 'alerta'
        else:
            return 'normal'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'tipo': self.tipo.value,
            'dias': self.dias,
            'inicio': self.fecha_inicio.isoformat(),
            'vencimiento': self.fecha_vencimiento.isoformat(),
            'pendientes': self.dias_pendientes(),
            'estado': self.estado_plazo()
        }

class Feriado(db.Model):
    """Feriados chilenos configurables"""
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(50), default='nacional')  # nacional, regional, religioso
    movable = db.Column(db.Boolean, default=True)  # Si se puede mover
    activo = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fecha': self.fecha.isoformat(),
            'nombre': self.nombre,
            'tipo': self.tipo
        }

class Configuracion(db.Model):
    """Configuración del sistema"""
    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(100), unique=True, nullable=False)
    valor = db.Column(db.Text, nullable=False)
    descripcion = db.Column(db.String(500))
    actualizado = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    @staticmethod
    def get(clave, default=None):
        config = Configuracion.query.filter_by(clave=clave).first()
        return config.valor if config else default
    
    @staticmethod
    def set(clave, valor, descripcion=None):
        config = Configuracion.query.filter_by(clave=clave).first()
        if config:
            config.valor = valor
        else:
            config = Configuracion(clave=clave, valor=valor, descripcion=descripcion)
            db.session.add(config)
        db.session.commit()

# ============ UTILIDADES ============

def contar_clientes(estado=None):
    """Contar clientes por estado"""
    query = Cliente.query
    if estado:
        query = query.filter_by(estado=estado)
    return query.count()

def contar_casos(estado=None):
    """Contar casos por estado"""
    query = Caso.query
    if estado:
        query = query.filter_by(estado=estado)
    return query.count()

def plazos_criticos():
    """Plazos que vencen en los próximos 7 días"""
    from datetime import timedelta
    limite = date.today() + timedelta(days=7)
    return Plazo.query.filter(
        Plazo.fecha_vencimiento <= limite,
        Plazo.fecha_vencimiento >= date.today(),
        Plazo.suspendido == False
    ).order_by(Plazo.fecha_vencimiento).all()

def tareas_pendientes():
    """Tareas pendientes ordenadas por prioridad"""
    return Tarea.query.filter(
        Tarea.completado == False
    ).order_by(
        Tarea.prioridad,
        Tarea.fecha_vencimiento
    ).all()
