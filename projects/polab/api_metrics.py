#!/usr/bin/env python3
"""
API de Métricas del Sistema (sin dependencias externas)
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import os
from datetime import datetime

def get_cmd_output(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
    except:
        return "0"

class MetricsHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_GET(self):
        if self.path == '/api/metrics':
            # CPU
            cpu = get_cmd_output("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'")
            
            # RAM
            mem_used = get_cmd_output("free | grep Mem | awk '{print $3}'")
            mem_total = get_cmd_output("free | grep Mem | awk '{print $2}'")
            mem_percent = round((int(mem_used) / int(mem_total)) * 100, 1) if mem_total != "0" else 0
            
            # Disco
            disk = get_cmd_output("df / | awk 'NR==2 {print $5}'").replace('%', '')
            
            # Services
            web = subprocess.run(['pgrep', '-f', 'python3 -m http.server 8080'], capture_output=True).returncode == 0
            api = subprocess.run(['pgrep', '-f', 'api_server.py'], capture_output=True).returncode == 0
            tunnel = subprocess.run(['pgrep', '-f', 'cloudflared'], capture_output=True).returncode == 0
            
            self.send_json({
                'timestamp': datetime.now().isoformat(),
                'cpu': cpu,
                'memory_percent': mem_percent,
                'disk_percent': disk,
                'services': {'web': web, 'api': api, 'tunnel': tunnel}
            })
        elif self.path == '/health':
            self.send_json({'status': 'ok', 'time': datetime.now().isoformat()})
        else:
            self.send_json({'error': 'Not found'}, 404)

if __name__ == '__main__':
    port = 8082
    server = HTTPServer(('0.0.0.0', port), MetricsHandler)
    print(f"🚀 Metrics API en http://localhost:{port}/api/metrics")
    server.serve_forever()
