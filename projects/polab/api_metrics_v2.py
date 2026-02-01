"""
API de metricas mejorada v2
"""

from flask import Flask, jsonify
from datetime import datetime
import psutil
import os

app = Flask(__name__)

@app.route('/metrics')
def metrics():
    return jsonify({
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "services": 7})

@app.route('/notifications')
def notifs():
    from notifications.system import notifications
    return jsonify({
        "unread": notifications.get_unread_count(),
        "notifications": notifications.get_all(unread_only=True)[:5]
    })

if __name__ == '__main__':
    print("API Metrics v2 iniciada en puerto 8082")
    app.run(host='0.0.0.0', port=8082)
