#!/usr/bin/env python3
"""
Sistema de Captura Rápida
=========================
使用方法:
- Guardar nota: python3 captura.py "texto de la nota" -p proyecto -t tipo
- Ver notas: python3 captura.py --ver -p proyecto

Cuando Paulo envía nota de voz por WhatsApp,
se transcribe y guarda automáticamente.
"""

import sqlite3
import sys
import os
from datetime import datetime

DB_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/db/leads.db'

def agregar_nota(texto, proyecto='general', tipo='captura'):
    """Guarda una nota rápida"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('INSERT INTO notas (contenido, proyecto, tipo) VALUES (?,?,?)',
              (texto, proyecto, tipo))
    
    conn.commit()
    nota_id = c.lastrowid
    conn.close()
    
    return nota_id

def ver_notas(proyecto=None, limite=20):
    """Muestra notas recientes"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if proyecto:
        c.execute('SELECT id, contenido, proyecto, tipo, fecha FROM notas WHERE proyecto=? ORDER BY fecha DESC LIMIT ?', (proyecto, limite))
    else:
        c.execute('SELECT id, contenido, proyecto, tipo, fecha FROM notas ORDER BY fecha DESC LIMIT ?', (limite,))
    
    notas = c.fetchall()
    conn.close()
    
    return notas

def stat_notas():
    """Estadísticas de captura"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    total = c.execute('SELECT COUNT(*) FROM notas').fetchone()[0]
    por_proyecto = c.execute('SELECT proyecto, COUNT(*) FROM notas GROUP BY proyecto').fetchall()
    por_tipo = c.execute('SELECT tipo, COUNT(*) FROM notas GROUP BY tipo').fetchall()
    
    conn.close()
    
    return {'total': total, 'por_proyecto': por_proyecto, 'por_tipo': por_tipo}

# Uso por línea de comandos
if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--ver':
            proyecto = sys.argv[2] if len(sys.argv) > 2 else None
            notas = ver_notas(proyecto)
            for n in notas:
                print(f"[{n[4][:10]}] {n[2]}: {n[1][:80]}...")
        elif sys.argv[1] == '--stats':
            stats = stat_notas()
            print(f"📊 Total notas: {stats['total']}")
            for p, c in stats['por_proyecto']:
                print(f"  • {p}: {c}")
        else:
            texto = sys.argv[1]
            proyecto = 'general'
            tipo = 'captura'
            
            # Parsear flags
            for i, arg in enumerate(sys.argv[2:], 2):
                if arg == '-p' and i < len(sys.argv) - 1:
                    proyecto = sys.argv[i+1]
                elif arg == '-t' and i < len(sys.argv) - 1:
                    tipo = sys.argv[i+1]
            
            nota_id = agregar_nota(texto, proyecto, tipo)
            print(f"✅ Nota guardada (ID: {nota_id})")
    else:
        print("Uso: captura.py 'texto de la nota' -p proyecto -t tipo")
        print("     captura.py --ver -p proyecto")
        print("     captura.py --stats")
