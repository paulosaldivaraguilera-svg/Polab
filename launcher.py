#!/usr/bin/env python3
"""
La Unidad Launcher
==================
Genera túnel SSH automáticamente y abre el dashboard de OpenClaw.

Uso:
    python3 launcher.py          # Modo interactivo
    python3 launcher.py --auto   # Abre directamente sin preguntar
    python3 launcher.py --test   # Prueba el túnel sin abrir navegador
"""

import subprocess
import time
import sys
import os
import signal
from datetime import datetime

# Configuración
HOST = "pi@192.168.1.31"
LOCAL_PORT = 18789
REMOTE_PORT = 18789
BROWSER_PATH = "brave"  # O "firefox", "chrome", etc.

TUNNEL_PROCESS = None

def log(msg):
    """Log con timestamp."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}")

def check_tunnel():
    """Verifica si el túnel ya está activo."""
    try:
        result = subprocess.run(
            ["lsof", "-i", f":{LOCAL_PORT}"],
            capture_output=True, text=True, timeout=5
        )
        return f"ssh" in result.stdout
    except:
        return False

def create_tunnel():
    """Crea el túnel SSH."""
    global TUNNEL_PROCESS
    
    log("🔧 Generando túnel SSH...")
    
    # Verificar si ya existe
    if check_tunnel():
        log("✅ Túnel ya activo!")
        return True
    
    try:
        # Iniciar túnel en background
        TUNNEL_PROCESS = subprocess.Popen(
            ["ssh", "-N", "-L", f"{LOCAL_PORT}:127.0.0.1:{REMOTE_PORT}", HOST],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Esperar a que se establezca
        time.sleep(2)
        
        if TUNNEL_PROCESS.poll() is None:
            log("✅ Túnel establecido!")
            return True
        else:
            log("❌ Error al crear túnel")
            return False
            
    except Exception as e:
        log(f"❌ Error: {e}")
        return False

def open_dashboard():
    """Abre el dashboard en el navegador."""
    url = f"http://localhost:{LOCAL_PORT}/chat?session=agent%3Amain%3Amain"
    
    log(f"🌐 Abriendo dashboard: {url}")
    
    try:
        subprocess.Popen([BROWSER_PATH, url])
        log("✅ Dashboard abierto!")
        return True
    except FileNotFoundError:
        # Intentar con brave-browser
        try:
            subprocess.Popen(["brave-browser", url])
            log("✅ Dashboard abierto!")
            return True
        except:
            pass
        log(f"❌ Navegador no encontrado: {BROWSER_PATH}")
        return False
    except Exception as e:
        log(f"❌ Error al abrir navegador: {e}")
        return False

def cleanup():
    """Limpia el túnel al salir."""
    global TUNNEL_PROCESS
    if TUNNEL_PROCESS:
        log("🔧 Cerrando túnel SSH...")
        TUNNEL_PROCESS.terminate()
        TUNNEL_PROCESS.wait()
        log("✅ Túnel cerrado")

def main():
    """Función principal."""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🚀 LA UNIDAD LAUNCHER                                   ║
    ║                                                           ║
    ║   Conecta con OpenClaw y abre el dashboard automáticamente║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Registrar cleanup
    signal.signal(signal.SIGINT, lambda s, f: cleanup())
    signal.signal(signal.SIGTERM, lambda s, f: cleanup())
    
    # Verificar flags
    if "--test" in sys.argv:
        log("🧪 Modo prueba...")
        create_tunnel()
        return
    
    if "--auto" in sys.argv:
        # Modo automático
        if create_tunnel():
            open_dashboard()
            print("\n✅ ¡Listo! Presiona Ctrl+C para salir.\n")
            try:
                signal.pause()
            except:
                pass
    else:
        # Modo interactivo
        print("\nOpciones:")
        print("  1) Crear túnel y abrir dashboard")
        print("  2) Solo crear túnel")
        print("  3) Solo abrir dashboard")
        print("  4) Salir")
        
        opcion = input("\nSelecciona (1-4): ").strip()
        
        if opcion == "1":
            if create_tunnel():
                open_dashboard()
                print("\n✅ ¡Listo! Presiona Enter para salir.")
                input()
        elif opcion == "2":
            create_tunnel()
            print("\nTúnel activo. Presiona Ctrl+C para cerrar.")
            try:
                signal.pause()
            except:
                pass
        elif opcion == "3":
            open_dashboard()
        else:
            print("👋 Hasta luego!")
    
    cleanup()

if __name__ == "__main__":
    main()
