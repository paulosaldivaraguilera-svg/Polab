#!/usr/bin/env python3
"""
API de Integración Formulario → WhatsApp
==========================================
Cuando alguien completa el formulario de Comenzar,
envía los datos a WhatsApp de Paulo y guarda en DB.

Usage: python3 api_leads.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import sqlite3
import json
import urllib.parse
from datetime import datetime

DB_PATH = '/home/pi/.openclaw/workspace/projects/polab/db/leads.db'
# Nota: El envío real a WhatsApp se hace a través de OpenClaw
WHATSAPP_TARGET = '+56974349077'  # Paulo

def guardar_lead(nombre, telefono, email, servicio, fuente='web'):
    """Guarda lead en la base de datos"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''INSERT INTO leads (nombre, telefono, email, servicio, fuente, estado)
                 VALUES (?,?,?,?,?,?)''',
              (nombre, telefono, email, servicio, fuente, 'nuevo'))
    
    conn.commit()
    lead_id = c.lastrowid
    conn.close()
    
    return lead_id

def formatear_mensaje_whatsapp(lead):
    """Genera mensaje para enviar a Paulo"""
    msg = f"""🎯 NUEVO LEAD - Comenzar

📋 Datos del cliente:
• Nombre: {lead['nombre']}
• Teléfono: {lead['telefono']}
• Email: {lead['email']}
• Servicio: {lead['servicio']}
• Fecha: {lead['fecha']}

💬 Acción: Contactar ASAP
"""
    return msg

class LeadHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if '/api/lead' in self.path:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Validar datos mínimos
                if not data.get('nombre') or not data.get('telefono'):
                    self.send_error(400, 'Faltan datos requeridos')
                    return
                
                # Guardar en DB
                lead_id = guardar_lead(
                    nombre=data['nombre'],
                    telefono=data['telefono'],
                    email=data.get('email', ''),
                    servicio=data.get('servicio', 'general'),
                    fuente='web'
                )
                
                # Preparar mensaje para WhatsApp
                lead_data = {
                    'nombre': data['nombre'],
                    'telefono': data['telefono'],
                    'email': data.get('email', ''),
                    'servicio': data.get('servicio', 'general'),
                    'fecha': datetime.now().strftime('%Y-%m-%d %H:%M')
                }
                
                mensaje = formatear_mensaje_whatsapp(lead_data)
                
                # Escribir mensaje en cola para envío WhatsApp
                cola_path = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/cola_whatsapp.txt'
                with open(cola_path, 'a') as f:
                    f.write(f"---LEAD {lead_id}---\n")
                    f.write(mensaje)
                    f.write("\n")
                
                response = {
                    'status': 'success',
                    'lead_id': lead_id,
                    'message': 'Lead guardado y notificado'
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
                print(f"✅ Lead guardado: {data['nombre']} - {data['servicio']}")
                
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)
    
    def do_GET(self):
        if self.path == '/api/stats':
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            
            total = c.execute('SELECT COUNT(*) FROM leads').fetchone()[0]
            nuevos = c.execute("SELECT COUNT(*) FROM leads WHERE estado='nuevo'").fetchone()[0]
            por_servicio = c.execute('SELECT servicio, COUNT(*) FROM leads GROUP BY servicio').fetchall()
            
            conn.close()
            
            stats = {
                'total_leads': total,
                'nuevos': nuevos,
                'por_servicio': dict(por_servicio)
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode())
        else:
            self.send_error(404)

if __name__ == '__main__':
    PORT = 8090
    server = HTTPServer(('0.0.0.0', PORT), LeadHandler)
    print(f"🚀 API de Leads activa en puerto {PORT}")
    print(f"📝 Endpoint: POST /api/lead")
    print(f"📊 Stats: GET /api/stats")
    server.serve_forever()
