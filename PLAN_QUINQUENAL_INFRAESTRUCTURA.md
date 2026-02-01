# 📋 PLAN QUINQUENAL DE INFRAESTRUCTURA DIGITAL
## "De Servidor a Cuartel Digital"

**Auditado:** 2026-02-01  
**Arquitecto:** Foundry (extensión de Paulo Saldívar)  
**Sistema:** Raspberry Pi 4 + OpenClaw + Ubuntu/Debian

---

## 📊 DIAGNÓSTICO ACTUAL

| Vector | Estado | Vulnerabilidad |
|--------|--------|----------------|
| **Seguridad** | 🟡 Parcial | Puerto 18789 público, SSH expuesto |
| **Dialéctica** | 🔴 Mecanicista | Archivos planos sin clasificación |
| **Eficiencia** | 🟢 Bueno | 20% RAM, 41% disco, load 0.07 |

---

## 1. 🔒 SEGURIDAD Y SOBERANÍA DE DATOS

### 1.1 Protocolo de Encriptación Negable (Kill Switch)

```bash
#!/bin/bash
# KILL_SWITCH.sh - En caso de confiscación física

echo "🚨 PROTOCOLO DE DESTRUCCIÓN SELECTIVA ACTIVADO"
read -p "Esta acción es IRREVERSIBLE. ¿Continuar? (escribe ELIMINAR): " confirm

if [ "$confirm" = "ELIMINAR" ]; then
    # Destruye solo datos sensibles, deja señuelo
    
    # 1. Borra memoria de Foundry (patrones aprendidos)
    rm -rf ~/.openclaw/foundry/
    
    # 2. Borra logs de actividad
    rm -rf ~/.openclaw/logs/*
    
    # 3. Encripta proyectos sensibles
    tar -czf - ~/.openclaw/workspace/projects/polab \
        | openssl enc -aes-256-cbc -salt -out ~/sensible-encrypted.tar.gz.enc -pass pass:${CLAVE}
    rm -rf ~/.openclaw/workspace/projects/polab
    
    # 4. Borra historial de bash
    shred -zu ~/.bash_history 2>/dev/null
    
    # 5. Crea señuelo
    echo "# documentación señuelo" > ~/.openclaw/README.md
    
    echo "✅ Protocolo completado."
fi
```

### 1.2 Protección Contra Vigilancia de Red

```bash
# Instalar Tor para scraping anónimo
sudo apt install tor

# Script anonymous-scrape.sh
export TOR_SOCKS_PORT=9050
torify curl -s --max-time 30 https://www.elsiglo.cl/feed/ > /tmp/elsiglo.xml
```

### 1.3 Hardening de Linux

```bash
#!/bin/bash
# hardening.sh - Endurecimiento del sistema

# 1. Desactivar servicios innecesarios
sudo systemctl disable avahi-daemon
sudo systemctl stop ModemManager

# 2. Firewall restrictivo
sudo ufw default deny incoming
sudo ufw allow from 192.168.1.0/24 to any port 18789
sudo ufw allow from 192.168.1.0/24 to any port 22
sudo ufw enable
```

---

## 2. ⚖️ ARQUITECTURA DE LA INFORMACIÓN DIALÉCTICA

### 2.1 Estructura Propuesta

```
~/dialectico/
├── categorias/
│   ├── lucha-clases/
│   ├── propiedad-medios/
│   ├── geopolitica/
│   └── economia-politica/
├── temporal/2026-02/
└── synthesis/
```

### 2.2 Base de Datos Dialéctica (SQLite)

```python
#!/usr/bin/env python3
# dialectic_db.py - Base de datos por contradicciones

import sqlite3
from datetime import datetime

class DialecticDB:
    def __init__(self, db_path='~/.openclaw/dialectico/noticias.db'):
        self.conn = sqlite3.connect(db_path.replace('~', os.path.expanduser('~')))
        self.create_schema()
    
    def create_schema(self):
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS articulos (
                id INTEGER PRIMARY KEY,
                titulo TEXT,
                fuente TEXT,
                fecha TIMESTAMP,
                contenido TEXT,
                categoria TEXT,
                polaridad INTEGER,  -- -1 (izquierda) a 1 (derecha)
                contradiccion_id INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contradicciones (
                id INTEGER PRIMARY KEY,
                tema TEXT,
                tesis_fuentes TEXT,
                antitesis_fuentes TEXT,
                sintesis TEXT
            )
        ''')
        self.conn.commit()
    
    def add_articulo(self, titulo, fuente, contenido, polaridad, categoria):
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT INTO articulos (titulo, fuente, fecha, contenido, polaridad, categoria)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (titulo, fuente, datetime.now(), contenido, polaridad, categoria))
        self.conn.commit()
    
    def find_contradiction(self, articulo_id):
        """Busca antítesis del artículo actual"""
        cursor = self.conn.cursor()
        articulo = cursor.execute(
            'SELECT * FROM articulos WHERE id = ?', (articulo_id,)
        ).fetchone()
        
        antitesis = cursor.execute('''
            SELECT * FROM articulos 
            WHERE categoria = ? AND polaridad < 0
            AND ABS(polaridad - ?) > 0.5
            ORDER BY fecha DESC LIMIT 5
        ''', (articulo[5], articulo[4])).fetchall()
        
        return antitesis
```

---

## 3. ⚡ EFICIENCIA EN LA ESCASEZ

### 3.1 Flujo Austero para La Unidad

```
MODO AUSTERNO - LA UNIDAD:

1. RECOLECTAR (06:00 - 06:15)
   • Solo 3 fuentes críticas
   • Sin JavaScript, solo XML

2. ANALIZAR (06:15 - 06:30)
   • Patrones simples (regex)
   • Sin embeddings

3. SINTETIZAR (06:30 - 06:45)
   • Solo si hay contradicciones reales

4. PUBLICAR (06:45 - 07:00)
   • HTML estático mínimo

TIEMPO TOTAL: 1 hora/día
RECURSOS: ~50MB RAM, ~5MB disco/día
```

### 3.2 Script de Austeridad

```bash
#!/bin/bash
# austerity.sh - Modo producción mínima

MAX_RAM_MB=100
INTERVALO_MIN=60

echo "⚡ MODO AUSTERO ACTIVADO"

while true; do
    RAM_USAGE=$(ps aux | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
    
    if (( $(echo "$RAM_USAGE > $MAX_RAM_MB" | bc -l) )); then
        echo "⚠️ RAM alto (${RAM_USAGE}MB)"
        pkill -9 -f "dashboard" 2>/dev/null
    fi
    
    cd ~/.openclaw/workspace/projects/polab/la-unidad/v3-informe
    node cli.js --fecha $(date +%Y-%m-%d) 2>/dev/null
    
    sleep $((INTERVALO_MIN * 60))
done
```

---

## 4. 📋 IMPLEMENTACIÓN INMEDIATA

### Día 1-2: Seguridad Crítica

```bash
# 1. Firewall
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw allow from 192.168.1.0/24 to any port 18789
sudo ufw allow from 192.168.1.0/24 to any port 22
sudo ufw enable

# 2. Kill Switch
mkdir -p ~/bin
cat > ~/bin/kill_switch.sh << 'EOF'
#!/bin/bash
echo "🚨 PROTOCOLO DE EMERGENCIA"
read -p "Escribe ELIMINAR: " c
if [ "$c" = "ELIMINAR" ]; then
    rm -rf ~/.openclaw/foundry/ ~/.openclaw/logs/*
    shred -zu ~/.bash_history 2>/dev/null
    echo "✅ Completado"
fi
EOF
chmod +x ~/bin/kill_switch.sh

# 3. Generar clave de encriptación
openssl rand -base64 32 > ~/emergency_key.txt
echo "Clave en ~/emergency_key.txt"
```

### Día 3-4: Arquitectura Dialéctica

```bash
# 1. Crear estructura
mkdir -p ~/dialectico/{categorias,temporal,synthesis}
mkdir -p ~/dialectico/categorias/{lucha-clases,propiedad-medios,geopolitica,economia}

# 2. Clasificador simple
cat > ~/bin/classify_news.py << 'EOF'
#!/usr/bin/env python3
import sys

CATEGORIES = {
    'lucha-clases': ['trabajador', 'patrón', 'huelga', 'salario', 'explotación'],
    'propiedad-medios': ['prensa', 'medios', 'copesa', 'mercurio'],
    'geopolitica': ['eeuu', 'china', 'rusia', 'imperialismo'],
    'economia': ['mercado', 'capital', 'inversión', 'banco']
}

def classify(text):
    text = text.lower()
    for cat, keywords in CATEGORIES.items():
        if any(kw in text for kw in keywords):
            return cat
    return 'general'

print(classify(sys.stdin.read()))
EOF
chmod +x ~/bin/classify_news.py
```

### Día 5-7: Eficiencia

```bash
# Script de austeridad
cat > ~/bin/austerity.sh << 'EOF'
#!/bin/bash
find ~/.openclaw/logs -name "*.log" -mtime +3 -delete
find ~/.openclaw -name "*.html" -mtime +7 -exec gzip {} \; 2>/dev/null
echo "✅ Austeridad: $(date)"
EOF
chmod +x ~/bin/austerity.sh

# Crontab
(crontab -l 2>/dev/null | grep -v austerity; echo "0 3 * * * ~/bin/austerity.sh") | crontab -
```

---

## 5. 🎯 RESUMEN

| Fase | Acción | Prioridad | Impacto |
|------|--------|-----------|---------|
| **Seguridad** | Firewall + Kill Switch | 🔴 ALTA | Protege datos |
| **Dialéctica** | Clasificador + BD | 🟡 MEDIA | Mejora análisis |
| **Eficiencia** | Austeridad | 🟢 CONTINUA | Reduce costos |

### Verificación

```bash
# Verificar seguridad
sudo ufw status
~/bin/kill_switch.sh  # Probar (cancelar)

# Verificar recursos
~/bin/check_resources.sh
```

---

**Plan creado. ¿Implementamos fase por fase?** 🚀
