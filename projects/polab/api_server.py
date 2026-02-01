#!/usr/bin/env python3
"""
API de Leads para Comenzar Landing Page
=========================================
Recibe leads del formulario y envía a WhatsApp

Endpoints:
- POST /api/lead - Recibe nuevo lead
- GET /api/leads - Lista leads (para dashboard)
- GET /api/stats - Estadísticas simples
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import sqlite3
import json
import urllib.request
from datetime import datetime
from pathlib import Path

# Configuración
DB_PATH = '/home/pi/.openclaw/workspace/projects/polab/db/leads.db'
WHATSAPP_TARGET = '+56974349077'  # Paulo

def get_leads():
    """Obtener todos los leads"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM leads ORDER BY fecha DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_lead(nombre, telefono, email, servicio, fuente='web'):
    """Guarda lead en DB"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO leads (nombre, telefono, email, servicio, fuente, estado)
                 VALUES (?,?,?,?,?,?)''',
              (nombre, telefono, email, servicio, fuente, 'nuevo'))
    conn.commit()
    lead_id = c.lastrowid
    conn.close()
    return lead_id

def send_to_whatsapp(lead):
    """Envía lead a WhatsApp de Paulo"""
    msg = f"""🎯 NUEVO LEAD - Comenzar

📋 Datos:
• Nombre: {lead['nombre']}
• Teléfono: {lead['telefono']}
• Email: {lead['email']}
• Servicio: {lead['servicio']}
• Fecha: {lead.get('fecha', datetime.now().isoformat())}

💬 Contactar ASAP"""
    
    # URL encode el mensaje
    msg_encoded = urllib.parse.quote(msg)
    wa_url = f"https://wa.me/{WHATSAPP_TARGET}?text={msg_encoded}"
    
    return wa_url

class LeadHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/leads':
            leads = get_leads()
            self.send_json({'success': True, 'count': len(leads), 'leads': leads})
        elif self.path == '/api/stats':
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) as total FROM leads")
            total = c.fetchone()[0]
            c.execute("SELECT COUNT(*) as nuevos FROM leads WHERE estado='nuevo'")
            nuevos = c.fetchone()[0]
            conn.close()
            self.send_json({'total': total, 'nuevos': nuevos})
        elif self.path == '/health':
            self.send_json({'status': 'ok', 'time': datetime.now().isoformat()})
        else:
            self.send_json({'error': 'Not found'}, 404)
    
    def do_POST(self):
        if self.path == '/api/lead':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                lead_id = save_lead(
                    data.get('nombre'),
                    data.get('telefono'),
                    data.get('email'),
                    data.get('servicio'),
                    'web'
                )
                wa_url = send_to_whatsapp(data)
                print(f"✅ Lead #{lead_id} guardado - WhatsApp: {wa_url}")
                self.send_json({
                    'success': True, 
                    'lead_id': lead_id,
                    'whatsapp_url': wa_url
                })
            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_json({'error': str(e)}, 500)
        else:
            self.send_json({'error': 'Not found'}, 404)

if __name__ == '__main__':
    port = 8081
    server = HTTPServer(('0.0.0.0', port), LeadHandler)
    print(f"🚀 API Leads ejecutándose en http://localhost:{port}")
    print(f"   Endpoints:")
    print(f"   - POST /api/lead")
    print(f"   - GET /api/leads")
    print(f"   - GET /api/stats")
    server.serve_forever()
