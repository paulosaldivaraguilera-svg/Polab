#!/usr/bin/env python3
"""
Social Media Manager - Gestión de Contenido Multiplataforma
=============================================================
Genera, adapta y programa contenido para redes sociales.

Uso:
    python3 social.py new "idea" -p twitter -t analisis
    python3 social.py generate "contenido" -a twitter,linkedin,youtube
    python3 social.py schedule "titulo" -d 2026-02-01
    python3 social.py calendar
"""

import sqlite3
import sys
import json
from datetime import datetime, timedelta

DB_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/db/leads.db'
SOCIAL_DB = '/home/pi/.openclaw/workspace/proyectos-paulo/social-media/social.db'

# Templates por plataforma
TEMPLATES = {
    'twitter': {
        'max_chars': 280,
        'hashtags': True,
        'formato': 'tweet_thread'
    },
    'linkedin': {
        'max_chars': 3000,
        'hashtags': True,
        'formato': 'articulo_largo'
    },
    'youtube': {
        'max_chars': 5000,
        'hashtags': False,
        'formato': 'video_script'
    },
    'instagram': {
        'max_chars': 2200,
        'hashtags': True,
        'formato': 'caption_imagen'
    },
    'telegram': {
        'max_chars': 4096,
        'hashtags': False,
        'formato': 'texto_libre'
    }
}

def init_social_db():
    """Inicializa base de datos para redes sociales"""
    conn = sqlite3.connect(SOCIAL_DB)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS contenido (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        contenido_original TEXT,
        plataforma TEXT,
        contenido_adaptado TEXT,
        estado TEXT DEFAULT 'borrador',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_programada DATE,
        fecha_publicada DATETIME
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS calendario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenido_id INTEGER,
        fecha DATE,
        hora TIME,
        plataforma TEXT,
        estado TEXT DEFAULT 'pendiente',
        FOREIGN KEY(contenido_id) REFERENCES contenido(id)
    )''')
    
    conn.commit()
    conn.close()

def adaptar_contenido(texto_original, plataforma):
    """Adapta contenido para una plataforma específica"""
    config = TEMPLATES.get(plataforma, TEMPLATES['twitter'])
    
    if plataforma == 'twitter':
        # Dividir en hilos si es muy largo
        palabras = texto_original.split()
        chunks = []
        chunk = ""
        for palabra in palabras:
            if len(chunk + palabra) < 260:
                chunk += palabra + " "
            else:
                chunks.append(chunk.strip())
                chunk = palabra + " "
        if chunk:
            chunks.append(chunk.strip())
        return chunks
    
    elif plataforma == 'linkedin':
        # Estructura con headers
        lineas = texto_original.split('\n')
        estructurado = ""
        for linea in lineas:
            if linea.startswith('#'):
                estructurado += f"\n📌 {linea[1:].strip()}\n"
            else:
                estructurado += linea + "\n"
        return estructurado
    
    elif plataforma == 'instagram':
        # Agregar call-to-action
        return f"{texto_original}\n\n👇 ¿Qué opinas? Comenta below.\n#PauloSaldivar #Abogado #AnálisisPolítico"
    
    elif plataforma == 'youtube':
        # Script de video
        return f"# SCRIPT DE VIDEO\n\n## Introducción\nHoy analizamos...\n\n## Desarrollo\n{texto_original}\n\n## Cierre\n¿Te resultó útil? Suscríbete."
    
    else:
        return texto_original

def guardar_contenido(titulo, contenido, plataforma, estado='borrador'):
    conn = sqlite3.connect(SOCIAL_DB)
    c = conn.cursor()
    
    contenido_adaptado = adaptar_contenido(contenido, plataforma)
    
    c.execute('INSERT INTO contenido (titulo, contenido_original, plataforma, contenido_adaptado, estado) VALUES (?,?,?,?,?)',
              (titulo, contenido, plataforma, json.dumps(contenido_adaptado), estado))
    
    conn.commit()
    contenido_id = c.lastrowid
    conn.close()
    
    return contenido_id

def listar_contenido(estado='borrador', limite=20):
    conn = sqlite3.connect(SOCIAL_DB)
    c = conn.cursor()
    
    c.execute('SELECT id, titulo, plataforma, estado, fecha_creacion FROM contenido WHERE estado=? ORDER BY fecha_creacion DESC LIMIT ?',
              (estado, limite))
    
    resultados = c.fetchall()
    conn.close()
    
    return resultados

def ver_calendario(dias=7):
    conn = sqlite3.connect(SOCIAL_DB)
    c = conn.cursor()
    
    hoy = datetime.now()
    limite = (hoy + timedelta(days=dias)).strftime('%Y-%m-%d')
    hoy_str = hoy.strftime('%Y-%m-%d')
    
    c.execute('SELECT c.fecha, c.hora, c.plataforma, co.titulo FROM calendario c JOIN contenido co ON c.contenido_id = co.id WHERE c.fecha BETWEEN ? AND ? ORDER BY c.fecha, c.hora',
              (hoy_str, limite))
    
    eventos = c.fetchall()
    conn.close()
    
    return eventos

def estadisticas():
    conn = sqlite3.connect(SOCIAL_DB)
    c = conn.cursor()
    
    total = c.execute('SELECT COUNT(*) FROM contenido').fetchone()[0]
    borrador = c.execute("SELECT COUNT(*) FROM contenido WHERE estado='borrador'").fetchone()[0]
    programado = c.execute("SELECT COUNT(*) FROM contenido WHERE estado='programado'").fetchone()[0]
    publicado = c.execute("SELECT COUNT(*) FROM contenido WHERE estado='publicado'").fetchone()[0]
    
    por_plataforma = c.execute('SELECT plataforma, COUNT(*) FROM contenido GROUP BY plataforma').fetchall()
    
    conn.close()
    
    return {
        'total': total,
        'borrador': borrador,
        'programado': programado,
        'publicado': publicado,
        'por_plataforma': dict(por_plataforma)
    }

if __name__ == '__main__':
    init_social_db()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'new':
            titulo = sys.argv[2] if len(sys.argv) > 2 else 'Sin título'
            # Leer contenido de stdin o siguiente argumento
            contenido = sys.argv[3] if len(sys.argv) > 3 else ''
            plataforma = sys.argv[4] if len(sys.argv) > 4 else 'twitter'
            
            cid = guardar_contenido(titulo, contenido, plataforma)
            print(f"✅ Contenido creado (ID: {cid})")
            print(f"📱 Plataforma: {plataforma}")
            
        elif cmd == 'list':
            print("📋 Contenido en borrador:")
            for c in listar_contenido('borrador'):
                print(f"  [{c[2][:3].upper()}] {c[1]} ({c[3][:10]})")
                
        elif cmd == 'calendar':
            print("📅 Calendario próximos 7 días:")
            for evento in ver_calendario(7):
                print(f"  {evento[0]} {evento[1] or ''} | {evento[2][:3]} | {evento[3][:50]}")
                
        elif cmd == 'stats':
            s = estadisticas()
            print("📊 Estadísticas Social Media:")
            print(f"  Total: {s['total']}")
            print(f"  Borrador: {s['borrador']}")
            print(f"  Programado: {s['programado']}")
            print(f" Publicado: {s['publicado']}")
            print(f"  Por plataforma: {s['por_plataforma']}")
            
        elif cmd == 'adapt':
            if len(sys.argv) > 3:
                texto = sys.argv[2]
                plataforma = sys.argv[3]
                adaptado = adaptar_contenido(texto, plataforma)
                print(f"📱 Adaptado para {plataforma}:")
                print("-" * 40)
                print(adaptado)
            else:
                print("Uso: python3 social.py adapt 'texto' twitter")
        else:
            print("Comandos: new, list, calendar, stats, adapt")
    else:
        print("Social Media Manager ARIS")
        print()
        print("Uso:")
        print("  python3 social.py new 'Título' 'contenido' -p twitter")
        print("  python3 social.py list")
        print("  python3 social.py calendar")
        print("  python3 social.py stats")
        print("  python3 social.py adapt 'texto' twitter")
