#!/usr/bin/env python3
"""
AI Agent Stack Setup and Management Script
==========================================
Setup completo para infraestructura de IA autónoma en Raspberry Pi

Usage:
    python3 setup_ai_stack.py --install       # Instalar todo
    python3 setup_ai_stack.py --status        # Ver estado
    python3 setup_ai_stack.py --download      # Descargar modelos
    python3 setup_ai_stack.py --test          # Probar sistema
    python3 setup_ai_stack.py --watchdog      # Iniciar watchdog
"""

import subprocess
import json
import os
import sys
import time
import urllib.request
import argparse
from pathlib import Path

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_status(msg, status="OK"):
    emoji = {"OK": "✅", "FAIL": "❌", "WARN": "⚠️", "INFO": "ℹ️"}.get(status, "ℹ️")
    color = {"OK": Colors.GREEN, "FAIL": Colors.FAIL, "WARN": Colors.WARNING, "INFO": Colors.BLUE}.get(status, Colors.ENDC)
    print(f"{color}{emoji} {msg}{Colors.ENDC}")

def run_cmd(cmd, capture=True):
    """Ejecuta comando shell."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=capture, text=True, timeout=120)
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Timeout"

def check_ollama():
    """Verifica estado de Ollama."""
    try:
        req = urllib.request.Request("http://localhost:11434/api/version")
        with urllib.request.urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read().decode())
            return True, data.get('version', 'unknown')
    except:
        return False, None

def check_ollama_models():
    """Lista modelos instalados."""
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return data.get('models', [])
    except:
        return []

def install_ollama():
    """Instala Ollama si no está."""
    print_status("Verificando Ollama...", "INFO")
    success, version = check_ollama()
    if success:
        print_status(f"Ollama ya instalado: v{version}", "OK")
        return True
    
    print_status("Instalando Ollama...", "WARN")
    cmd = "curl -fsSL https://ollama.ai/install.sh | sh"
    success, out, err = run_cmd(cmd, capture=False)
    if success:
        # Iniciar servicio
        run_cmd("nohup ollama serve > ~/.ollama/serve.log 2>&1 &", capture=True)
        time.sleep(3)
        success, _ = check_ollama()
        if success:
            print_status("Ollama instalado y corriendo", "OK")
            return True
    print_status("Error instalando Ollama", "FAIL")
    return False

def download_model(model="qwen2.5:0.5b"):
    """Descarga un modelo."""
    print_status(f"Descargando {model}...", "INFO")
    success, out, err = run_cmd(f"nohup ollama pull {model} > ~/.ollama/pull.log 2>&1 &", capture=True)
    if success:
        print_status(f"Descarga iniciada en background", "OK")
        return True
    return False

def install_dependencies():
    """Instala dependencias Python."""
    print_status("Instalando dependencias Python...", "INFO")
    
    deps = [
        "lancedb",      # Base de datos vectorial
        "z3-solver",    # Verificación formal
        "requests",     # HTTP client
    ]
    
    for dep in deps:
        success, _, _ = run_cmd(f"pip3 install {dep} -q")
        if success:
            print_status(f"  {dep} instalado", "OK")
        else:
            print_status(f"  {dep} error", "FAIL")
    
    return True

def create_agent_modules():
    """Crea módulos Python ejecutables."""
    print_status("Creando módulos de agente...", "INFO")
    
    modules_dir = Path("/home/pi/.openclaw/ai_modules")
    modules_dir.mkdir(exist_ok=True)
    
    # Módulo 1: Ollama Client
    ollama_client = modules_dir / "ollama_client.py"
    ollama_client.write_text('''#!/usr/bin/env python3
"""Ollama Local Client - Wrapper para inferencia local"""

import urllib.request
import json
from typing import List, Dict, Optional

class OllamaClient:
    """Cliente para Ollama local."""
    
    def __init__(self, host="http://localhost:11434"):
        self.host = host
        self.api_url = f"{host}/api"
    
    def is_available(self) -> bool:
        try:
            req = urllib.request.Request(f"{self.api_url}/version")
            with urllib.request.urlopen(req, timeout=2):
                return True
        except:
            return False
    
    def list_models(self) -> List[str]:
        try:
            req = urllib.request.Request(f"{self.api_url}/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                return [m['name'] for m in data.get('models', [])]
        except:
            return []
    
    def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 512
    ) -> Dict:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        if system:
            payload["system"] = system
        
        try:
            req = urllib.request.Request(
                f"{self.api_url}/generate",
                data=json.dumps(payload).encode(),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
                return {
                    'response': data.get('response', ''),
                    'tokens': data.get('eval_count', 0),
                    'duration_ms': data.get('total_duration', 0) // 1_000_000,
                    'model': model
                }
        except Exception as e:
            return {'error': str(e)}
    
    def chat(self, model: str, messages: List[Dict]) -> Dict:
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        try:
            req = urllib.request.Request(
                f"{self.api_url}/chat",
                data=json.dumps(payload).encode(),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
                return {
                    'response': data.get('message', {}).get('content', ''),
                    'tokens': data.get('eval_count', 0)
                }
        except Exception as e:
            return {'error': str(e)}

# Funciones de conveniencia
_client = None

def get_client() -> OllamaClient:
    global _client
    if _client is None:
        _client = OllamaClient()
    return _client

def ask(model: str, prompt: str, **kwargs) -> str:
    client = get_client()
    result = client.generate(model, prompt, **kwargs)
    return result.get('response', result.get('error', 'Sin respuesta'))

if __name__ == "__main__":
    client = OllamaClient()
    if client.is_available():
        print(f"✅ Ollama disponible")
        models = client.list_models()
        print(f"Modelos: {models}")
    else:
        print("❌ Ollama no disponible")
''')
    
    # Módulo 2: Vector Memory
    vector_memory = modules_dir / "vector_memory.py"
    vector_memory.write_text('''#!/usr/bin/env python3
"""Vector Memory - Sistema de memoria persistente para agentes"""

import os
import json
import uuid
import time
import hashlib
from typing import List, Dict, Optional, Tuple
from pathlib import Path

class SimpleVectorMemory:
    """Memoria vectorial simple basada en hashing."""
    
    def __init__(self, db_path: str = "~/.openclaw/agent_memory"):
        self.db_path = os.path.expanduser(db_path)
        Path(self.db_path).mkdir(exist_ok=True)
        self.data_file = Path(self.db_path) / "memories.json"
        self._load()
    
    def _load(self):
        if self.data_file.exists():
            with open(self.data_file) as f:
                self.memories = json.load(f)
        else:
            self.memories = []
    
    def _save(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def _simple_embedding(self, text: str) -> List[float]:
        """Embedding simple basado en hashing de palabras."""
        words = set(text.lower().split())
        embedding = [0.0] * 384
        for i, word in enumerate(list(words)[:384]):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16) % 10000
            embedding[i] = h / 10000.0
        return embedding
    
    def _cosine_sim(self, a: List[float], b: List[float]) -> float:
        """Similitud coseno."""
        import math
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(y * y for y in b))
        if norm_a * norm_b == 0:
            return 0
        return dot / (norm_a * norm_b)
    
    def add(self, content: str, metadata: Optional[Dict] = None) -> str:
        """Añade un recuerdo."""
        mem_id = str(uuid.uuid4())
        embedding = self._simple_embedding(content)
        
        memory = {
            'id': mem_id,
            'content': content,
            'embedding': embedding,
            'metadata': metadata or {},
            'created_at': time.time()
        }
        
        self.memories.append(memory)
        self._save()
        return mem_id
    
    def search(self, query: str, limit: int = 5) -> List[Dict]:
        """Busca recuerdos similares."""
        query_emb = self._simple_embedding(query)
        scored = []
        
        for mem in self.memories:
            score = self._cosine_sim(query_emb, mem['embedding'])
            scored.append((mem, score))
        
        scored.sort(key=lambda x: -x[1])
        return [
            {
                'id': m['id'],
                'content': m['content'],
                'metadata': m.get('metadata', {}),
                'score': s
            }
            for m, s in scored[:limit]
        ]
    
    def recall(self, query: str, limit: int = 3) -> List[str]:
        """Recupera contenidos."""
        results = self.search(query, limit=limit)
        return [r['content'] for r in results]
    
    def count(self) -> int:
        return len(self.memories)
    
    def clear(self):
        self.memories = []
        self._save()

if __name__ == "__main__":
    mem = SimpleVectorMemory()
    print(f"Memoria: {mem.count()} recuerdos")
    
    # Test
    mem.add("El usuario prefiere respuestas cortas", {"type": "preference"})
    mem.add("Usuario trabaja en proyectos de IA", {"type": "context"})
    
    results = mem.search("qué le gusta al usuario")
    for r in results:
        print(f"  - [{r['score']:.2f}] {r['content'][:50]}...")
''')
    
    # Módulo 3: Agent Orchestrator
    orchestrator = modules_dir / "orchestrator.py"
    orchestrator.write_text('''#!/usr/bin/env python3
"""Agent Orchestrator - Orquestación de modelos locales"""

import sys
import os
sys.path.insert(0, str(Path(__file__).parent))

from ollama_client import OllamaClient, get_client
from vector_memory import SimpleVectorMemory

class AgentOrchestrator:
    """Orquestador de agentes locales."""
    
    def __init__(self, name: str = "EdgeAgent"):
        self.name = name
        self.client = get_client()
        self.memory = SimpleVectorMemory()
        
        # Modelos por defecto
        self.router_model = "qwen2.5:0.5b"
        self.reasoner_model = "phi3:mini"
        
        # System prompts
        self.router_prompt = """Clasifica la petición en:
- SIMPLE: Respuesta directa
- COMPLEX: Requiere razonamiento
- ACTION: Requiere ejecutar algo
Responde solo la categoría."""
    
    def classify(self, user_input: str) -> str:
        """Clasifica la intención."""
        if self.client.is_available() and self.router_model in self.client.list_models():
            result = self.client.generate(self.router_model, user_input, self.router_prompt, temperature=0.3)
            intent = result.get('response', 'SIMPLE').strip().upper()
            for cat in ['SIMPLE', 'COMPLEX', 'ACTION']:
                if cat in intent:
                    return cat
        return 'COMPLEX'
    
    def run(self, user_input: str, max_tokens: int = 256) -> dict:
        """Ejecuta el pipeline completo."""
        # 1. Clasificar
        intent = self.classify(user_input)
        
        # 2. Recuperar contexto
        context = self.memory.recall(user_input, limit=2)
        full_prompt = user_input
        if context:
            full_prompt = f"Contexto relevante:\\n- {'\\n- '.join(context)}\\n\\nConsulta: {user # 3. Generar respuesta
        model_input}"
        
        = self.reasoner_model
        result = self.client.generate(model, full_prompt, max_tokens=max_tokens)
        
        # 4. Guardar en memoria
        self.memory.add(user_input)
        
        return {
            'response': result.get('response', 'Error'),
            'intent': intent,
            'model': model,
            'tokens': result.get('tokens', 0),
            'context_used': len(context) > 0
        }

def main():
    orchestrator = AgentOrchestrator()
    print(f"🤖 {orchestrator.name} - Orchestrador de IA Local")
    print("Escribe 'quit' para salir\\n")
    
    while True:
        try:
            user_input = input("> ")
            if user_input.lower() in ['quit', 'exit', 'salir']:
                break
            
            result = orchestrator.run(user_input)
            print(f"\\n[{result['intent']}] {result['model']}")
            print(result['response'][:500])
            print()
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
''')
    
    # Módulo 4: System Watchdog
    watchdog = modules_dir / "watchdog.py"
    watchdog.write_text('''#!/usr/bin/env python3
"""System Watchdog - Monitoreo y estabilidad del sistema"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path

class SystemWatchdog:
    """Watchdog para agentes de IA."""
    
    def __init__(self, heartbeat_interval: int = 30):
        self.heartbeat_interval = heartbeat_interval
        self.last_heartbeat = time.time()
        self.agents = []
        self.running = True
    
    def register_agent(self, name: str, pid: int):
        """Registra un agente para monitorear."""
        self.agents.append({'name': name, 'pid': pid})
        print(f"📝 Agente registrado: {name} (PID: {pid})")
    
    def check_agents(self):
        """Verifica que los agentes estén vivos."""
        dead = []
        for agent in self.agents:
            try:
                os.kill(agent['pid'], 0)  # Verifica si existe
            except ProcessLookupError:
                dead.append(agent)
        
        for agent in dead:
            print(f"⚠️ Agente muerto: {agent['name']}")
            self.agents.remove(agent)
    
    def check_ollama(self) -> bool:
        """Verifica que Ollama esté corriendo."""
        try:
            result = subprocess.run(
                ['curl', '-s', 'http://localhost:11434/api/version'],
                capture_output=True, timeout=5
            )
            return b'"version"' in result.stdout
        except:
            return False
    
    def restart_ollama(self):
        """Reinicia Ollama si es necesario."""
        print("🔄 Reiniciando Ollama...")
        # Matar proceso anterior
        subprocess.run(['pkill', '-f', 'ollama serve'], capture_output=True)
        time.sleep(2)
        # Iniciar nuevo
        subprocess.Popen(
            ['nohup', 'ollama', 'serve'],
            stdout=open('/tmp/ollama.log', 'w'),
            stderr=subprocess.STDOUT
        )
        time.sleep(5)
        return self.check_ollama()
    
    def check_memory(self) -> dict:
        """Verifica uso de memoria."""
        try:
            result = subprocess.run(['free', '-h'], capture_output=True, text=True)
            lines = result.stdout.strip().split('\\n')
            mem_line = [l for l in lines if l.startswith('Mem:')][0]
            parts = mem_line.split()
            return {
                'total': parts[1],
                'used': parts[2],
                'available': parts[6]
            }
        except:
            return {'error': 'No se pudo leer memoria'}
    
    def check_temperature(self) -> Optional[float]:
        """Verifica temperatura (Raspberry Pi)."""
        try:
            result = subprocess.run(
                ['vcgencmd', 'measure_temp'],
                capture_output=True, text=True
            )
            temp_str = result.stdout.strip()
            return float(temp_str.replace('temp=', '').replace("'C", ""))
        except:
            return None
    
    def heartbeat(self):
        """Actualiza heartbeat."""
        self.last_heartbeat = time.time()
    
    def run(self):
        """Ejecuta el loop de monitoreo."""
        print(f"🐕 System Watchdog iniciado")
        print(f"   Heartbeat cada {self.heartbeat_interval}s")
        print(f"   Agentes monitoreados: {len(self.agents)}")
        
        while self.running:
            now = time.time()
            
            # Verificar heartbeat
            if now - self.last_heartbeat > self.heartbeat_interval * 2:
                print("⚠️ Heartbeat perdido! Reiniciando...")
                self.restart_ollama()
                self.last_heartbeat = now
            
            # Verificar agentes
            self.check_agents()
            
            # Verificar Ollama
            if not self.check_ollama():
                print("⚠️ Ollama no responde")
                self.restart_ollama()
            
            # Verificar recursos
            mem = self.check_memory()
            temp = self.check_temperature()
            
            status = f"Mem: {mem.get('used', '?')} | "
            if temp:
                status += f"Temp: {temp:.1f}°C | "
            status += f"Agentes: {len(self.agents)}"
            print(f"\\r{status}", end="", flush=True)
            
            time.sleep(self.heartbeat_interval)
    
    def stop(self):
        self.running = False

def main():
    import argparse
    parser = argparse.ArgumentParser(description='AI System Watchdog')
    parser.add_argument('--interval', '-i', type=int, default=30, help='Intervalo de heartbeat')
    parser.add_argument('--daemon', '-d', action='store_true', help='Ejecutar como daemon')
    args = parser.parse_args()
    
    watchdog = SystemWatchdog(heartbeat_interval=args.interval)
    
    # Registrar Ollama si está corriendo
    try:
        result = subprocess.run(['pgrep', '-f', 'ollama serve'], capture_output=True, text=True)
        if result.stdout.strip():
            watchdog.register_agent('ollama', int(result.stdout.strip().split('\\n')[0]))
    except:
        pass
    
    if args.daemon:
        # Fork to background
        pid = os.fork()
        if pid == 0:
            watchdog.run()
        else:
            print(f"Watchdog corriendo en PID: {pid}")
    else:
        watchdog.run()

if __name__ == "__main__":
    main()
''')
    
    print_status(f"Módulos creados en {modules_dir}", "OK")
    print(f"  - ollama_client.py")
    print(f"  - vector_memory.py")
    print(f"  - orchestrator.py")
    print(f"  - watchdog.py")
    
    return True

def print_system_status():
    """Imprime estado completo del sistema."""
    print(f"\\n{Colors.HEADER}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}Estado del Sistema IA{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*50}{Colors.ENDC}\\n")
    
    # Ollama
    success, version = check_ollama()
    if success:
        print_status(f"Ollama v{version}", "OK")
        models = check_ollama_models()
        print(f"   Modelos: {len(models)}")
        for m in models:
            print(f"     - {m}")
    else:
        print_status("Ollama no disponible", "FAIL")
    
    # Memoria
    mem_info = subprocess.run(['free', '-h'], capture_output=True, text=True)
    if mem_info.returncode == 0:
        print(f"\\n{Colors.BLUE}Memoria:{Colors.ENDC}")
        print(mem_info.stdout.split('\\n')[1])
    
    # Temperatura (RPi)
    try:
        temp = subprocess.run(['vcgencmd', 'measure_temp'], capture_output=True, text=True)
        if temp.returncode == 0:
            print(f"{Colors.BLUE}Temperatura:{Colors.ENDC} {temp.stdout.strip()}")
    except:
        pass
    
    # Módulos
    modules_dir = Path("/home/pi/.openclaw/ai_modules")
    if modules_dir.exists():
        print(f"\\n{Colors.BLUE}Módulos:{Colors.ENDC}")
        for f in modules_dir.glob("*.py"):
            size = f.stat().st_size
            print(f"  - {f.name} ({size} bytes)")

def main():
    parser = argparse.ArgumentParser(description="AI Agent Stack Setup")
    parser.add_argument('--install', action='store_true', help='Instalar todo')
    parser.add_argument('--status', action='store_true', help='Ver estado')
    parser.add_argument('--download', action='store_true', help='Descargar modelos')
    parser.add_argument('--test', action='store_true', help='Probar sistema')
    parser.add_argument('--watchdog', action='store_true', help='Iniciar watchdog')
    parser.add_argument('--daemon', action='store_true', help='Modo daemon')
    
    args = parser.parse_args()
    
    if args.status:
        print_system_status()
    elif args.install:
        install_ollama()
        install_dependencies()
        create_agent_modules()
        download_model("qwen2.5:0.5b")
        print_system_status()
    elif args.download:
        download_model("qwen2.5:0.5b")
    elif args.test:
        print_system_status()
        print("\\n🧪 Prueba rápida:")
        client = OllamaClient()
        if client.is_available():
            result = client.generate("phi3:mini", "Hola, cómo estás?", max_tokens=50)
            print(f"   Respuesta: {result.get('response', 'Error')[:100]}...")
    elif args.watchdog:
        from watchdog import SystemWatchdog
        wd = SystemWatchdog()
        try:
            wd.run()
        except KeyboardInterrupt:
            wd.stop()
    else:
        print_system_status()
        print("\\nUsage: python3 setup_ai_stack.py --install")
        print("       python3 setup_ai_stack.py --status")
        print("       python3 setup_ai_stack.py --watchdog")

if __name__ == "__main__":
    main()
