#!/usr/bin/env python3
"""
Calendario de Tareas - Sistema ARIS
====================================
Gestiona fechas límite y tareas desde CLI.

Uso:
    python3 calendar.py add "Descripción" -d 2026-02-15 -p alta
    python3 calendar.py list
    python3 calendar.py today
    python3 calendar.py pending
"""

import sqlite3
import sys
from datetime import datetime, timedelta

DB_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/db/leads.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        fecha_limite DATE,
        prioridad TEXT DEFAULT 'media',
        estado TEXT DEFAULT 'pendiente',
        proyecto TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

def add_task(titulo, fecha=None, prioridad='media', proyecto=None, descripcion=None):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO tareas (titulo, descripcion, fecha_limite, prioridad, proyecto) VALUES (?,?,?,?,?)',
              (titulo, descripcion, fecha, prioridad, proyecto))
    conn.commit()
    task_id = c.lastrowid
    conn.close()
    return task_id

def list_tasks(estado='pendiente', limite=20):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    query = 'SELECT id, titulo, fecha_limite, prioridad, proyecto FROM tareas WHERE estado=? ORDER BY fecha_limite ASC LIMIT ?'
    c.execute(query, (estado, limite))
    
    tasks = c.fetchall()
    conn.close()
    return tasks

def complete_task(task_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE tareas SET estado='completada', fecha_limite=? WHERE id=?", 
              (datetime.now().strftime('%Y-%m-%d'), task_id))
    conn.commit()
    conn.close()

def today_tasks():
    hoy = datetime.now().strftime('%Y-%m-%d')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, titulo, prioridad, proyecto FROM tareas WHERE estado="pendiente" AND fecha_limite<=?', (hoy,))
    tasks = c.fetchall()
    conn.close()
    return tasks

def pending_by_priority():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''SELECT COUNT(*) FROM tareas WHERE estado="pendiente" AND prioridad="alta"''')
    alta = c.fetchone()[0]
    c.execute('''SELECT COUNT(*) FROM tareas WHERE estado="pendiente" AND prioridad="media"''')
    media = c.fetchone()[0]
    c.execute('''SELECT COUNT(*) FROM tareas WHERE estado="pendiente" AND prioridad="baja"''')
    baja = c.fetchone()[0]
    conn.close()
    return {'alta': alta, 'media': media, 'baja': baja}

# Colores ANSI
COLORS = {
    'alta': '\033[91m',   # Rojo
    'media': '\033[93m',  # Amarillo
    'baja': '\033[92m',   # Verde
    'reset': '\033[0m'
}

def print_task(t, show_id=True):
    cid = COLORS.get(t[3], COLORS['reset'])
    pid = f"[{t[4]}]" if t[4] else ""
    if show_id:
        print(f"  {cid}{t[0]}{COLORS['reset']}. {t[1]} {pid} | {t[2] or 'sin fecha'}")
    else:
        print(f"  {cid}•{COLORS['reset']} {t[1]} {pid} | {t[2] or 'sin fecha'}")

if __name__ == '__main__':
    init_db()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'add':
            titulo = sys.argv[2] if len(sys.argv) > 2 else 'Nueva tarea'
            fecha = None
            prioridad = 'media'
            proyecto = None
            
            # Parsear flags
            i = 3
            while i < len(sys.argv):
                if sys.argv[i] == '-d' and i < len(sys.argv) - 1:
                    fecha = sys.argv[i+1]
                elif sys.argv[i] == '-p' and i < len(sys.argv) - 1:
                    prioridad = sys.argv[i+1]
                elif sys.argv[i] == '-pr' and i < len(sys.argv) - 1:
                    proyecto = sys.argv[i+1]
                i += 1
            
            task_id = add_task(titulo, fecha, prioridad, proyecto)
            print(f"✅ Tarea #{task_id} creada")
            
        elif cmd == 'list':
            tasks = list_tasks()
            print(f"📋 Tareas pendientes ({len(tasks)}):")
            for t in tasks:
                print_task(t)
                
        elif cmd == 'today':
            tasks = today_tasks()
            if tasks:
                print("🔥 Tareas para hoy:")
                for t in tasks:
                    print_task(t)
            else:
                print("✅ No hay tareas urgentes para hoy")
                
        elif cmd == 'pending':
            stats = pending_by_priority()
            print("📊 Pendientes por prioridad:")
            print(f"  🔴 Alta: {stats['alta']}")
            print(f"  🟡 Media: {stats['media']}")
            print(f"  🟢 Baja: {stats['baja']}")
            
        elif cmd == 'done':
            if len(sys.argv) > 2:
                complete_task(sys.argv[2])
                print(f"✅ Tarea #{sys.argv[2]} completada")
            else:
                print("Uso: python3 calendar.py done ID")
                
        else:
            print("Comando no reconocido")
            
    else:
        print("Calendario de Tareas ARIS")
        print()
        print("Uso:")
        print("  python3 calendar.py add 'Tarea' -d 2026-02-15 -p alta -pr polab")
        print("  python3 calendar.py list")
        print("  python3 calendar.py today")
        print("  python3 calendar.py pending")
        print("  python3 calendar.py done ID")
