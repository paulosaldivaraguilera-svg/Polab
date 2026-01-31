#!/usr/bin/env python3
"""
WhatsApp Lead Notifier
======================
Monitorea la cola de leads y envía notificaciones a WhatsApp.

Usage: python3 whatsapp_notifier.py start  # Inicia daemon
       python3 whatsapp_notifier.py send   # Envía pendientes
       python3 whatsapp_notifier.py status # Ver estado
"""

import os
import time
import json
from datetime import datetime

COLA_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/cola_whatsapp.txt'
PROCESADOS_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/procesados_whatsapp.json'

def load_procesados():
    if os.path.exists(PROCESADOS_PATH):
        with open(PROCESADOS_PATH, 'r') as f:
            return json.load(f)
    return []

def save_procesados(procesados):
    with open(PROCESADOS_PATH, 'w') as f:
        json.dump(procesados, f)

def send_lead_via_openclaw(mensaje):
    """
    Envía lead a través de OpenClaw.
    Esto requiere que la sesión main esté activa.
    """
    # Método 1: Escribir a archivo de comandos
    cmd_path = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/pending_messages.json'
    
    messages = []
    if os.path.exists(cmd_path):
        with open(cmd_path, 'r') as f:
            messages = json.load(f)
    
    messages.append({
        'to': '+56974349077',
        'message': mensaje,
        'timestamp': datetime.now().isoformat()
    })
    
    with open(cmd_path, 'w') as f:
        json.dump(messages, f)
    
    print(f"📱 Mensaje encolado para envío: {mensaje[:50]}...")
    return True

def process_cola():
    """Procesa la cola de leads pendientes"""
    if not os.path.exists(COLA_PATH):
        return 0
    
    procesados = load_procesados()
    
    with open(COLA_PATH, 'r') as f:
        contenido = f.read()
    
    if not contenido.strip():
        return 0
    
    # Dividir por separadores
    bloques = contenido.split('---LEAD ')
    
    enviados = 0
    nuevo_contenido = ""
    
    for bloque in bloques:
        if not bloque.strip():
            continue
        
        if bloque.startswith('NUEVO LEAD'):
            # Extraer ID del lead
            lines = bloque.split('\n')
            lead_id_line = lines[0] if lines else ""
            lead_id = lead_id_line.replace('NUEVO LEAD', '').strip()
            
            if lead_id in procesados:
                # Ya procesado, omitir
                pass
            else:
                # Enviar mensaje
                mensaje_completo = f"---LEAD {lead_id}---\n{bloque}"
                send_lead_via_openclaw(mensaje_completo)
                procesados.append(lead_id)
                enviados += 1
        else:
            nuevo_contenido += f"---LEAD {bloque}"
    
    # Actualizar archivos
    if nuevo_contenido.strip():
        with open(COLA_PATH, 'w') as f:
            f.write(nuevo_contenido)
    else:
        os.remove(COLA_PATH) if os.path.exists(COLA_PATH) else None
    
    save_procesados(procesados)
    return enviados

def start_daemon(interval=10):
    """Inicia el daemon de monitoreo"""
    print("🚀 WhatsApp Notifier iniciado")
    print(f"📂 Monitoreando: {COLA_PATH}")
    print(f"⏱️ Intervalo: {interval}s")
    print()
    
    while True:
        try:
            enviados = process_cola()
            if enviados > 0:
                print(f"✅ {enviados} lead(s) notificados")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        time.sleep(interval)

def show_status():
    """Muestra estado del notificador"""
    cola_existe = os.path.exists(COLA_PATH)
    procesados = load_procesados()
    
    print("📱 WhatsApp Lead Notifier - Estado")
    print()
    print(f"  Cola activa: {'✅' if cola_existe else '❌'}")
    print(f"  Leads procesados: {len(procesados)}")
    
    if cola_existe:
        with open(COLA_PATH, 'r') as f:
            contenido = f.read()
        bloques = contenido.split('---LEAD ')
        pendientes = len([b for b in bloques if 'NUEVO LEAD' in b])
        print(f"  Pendientes de envío: {pendientes}")

def force_send():
    """Fuerza envío de todos los pendientes"""
    count = process_cola()
    print(f"📤 {count} lead(s) enviados a la cola de OpenClaw")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'start':
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            start_daemon(interval)
        elif cmd == 'status':
            show_status()
        elif cmd == 'send':
            force_send()
        elif cmd == 'test':
            # Enviar mensaje de prueba
            test_msg = "🎯 TEST - WhatsApp Notifier activo\n\nEste es un mensaje de prueba del sistema."
            send_lead_via_openclaw(test_msg)
            print("✅ Mensaje de prueba encolado")
        else:
            print("Comandos: start [intervalo], status, send, test")
    else:
        print("WhatsApp Lead Notifier ARIS")
        print()
        print("Uso:")
        print("  python3 whatsapp_notifier.py start [intervalo_segundos]")
        print("  python3 whatsapp_notifier.py status")
        print("  python3 whatsapp_notifier.py send")
        print("  python3 whatsapp_notifier.py test")
