#!/usr/bin/env python3
"""
Dialéctico OS - Ejecutor Principal
===================================
"""

import os
import sys

# Agregar src al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.app import app, init_db

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Dialéctico OS')
    parser.add_argument('--init', action='store_true', help='Inicializar base de datos')
    parser.add_argument('--port', type=int, default=8080, help='Puerto')
    parser.add_argument('--debug', action='store_true', help='Modo debug')
    
    args = parser.parse_args()
    
    if args.init:
        print("🔧 Inicializando base de datos...")
        init_db()
        print("✅ Base de datos lista")
    else:
        # Asegurar que existe el directorio
        os.makedirs(os.path.dirname(os.path.abspath(__file__)) + '/db', exist_ok=True)
        
        print(f"""
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   Dialéctico OS v1.0                                 ║
║   Sistema Operativo Profesional                      ║
║                                                      ║
║   Servidor iniciado en http://localhost:{args.port}  ║
║                                                      ║
║   Presiona Ctrl+C para detener                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
""")
        app.run(host='0.0.0.0', port=args.port, debug=args.debug)
