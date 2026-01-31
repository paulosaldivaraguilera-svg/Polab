-- Base de Datos POLAB - Leads y Clientes
-- SQLite

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    servicio TEXT,
    fuente TEXT,
    estado TEXT DEFAULT 'nuevo',
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proyectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'activo',
    prioridad INTEGER DEFAULT 3,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT NOT NULL,
    proyecto TEXT,
    tipo TEXT DEFAULT 'general',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    contenido TEXT,
    estado TEXT DEFAULT 'borrador',
    proyecto TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_publicado DATETIME
);

-- Insertar proyectos iniciales
INSERT INTO proyectos (nombre, descripcion, estado, prioridad) VALUES
    ('POLAB - Landing Comenzar', 'Legaltech para captación de clientes', 'desarrollo', 1),
    ('Web Personal - paulosaldivar.cv', 'Optimización de captación', 'optimizacion', 2),
    ('Producción Teórica', 'Escritura política y teórica', 'fragmentado', 2),
    ('Sistema de Captura', 'Notas de voz y organización', 'construccion', 1);

-- Índices para velocidad
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_servicio ON leads(servicio);
CREATE INDEX IF NOT EXISTS idx_notas_proyecto ON notas(proyecto);
