#!/bin/bash
# Raylib Game Launcher - Web Interface
# Servidor web para ver screenshots y ejecutar juegos

PROJECTS_DIR="/home/pi/.openclaw/workspace/projects/gaming"
BUILD_DIR="/home/pi/.openclaw/build"
SCREENSHOT_DIR="/home/pi/.openclaw/screenshots"
WEB_DIR="/home/pi/.openclaw/web-games"
PORT=9002

echo "🚀 Raylib Game Launcher v1.0"
echo "🌐 Web Interface - Screenshots + Launcher"
echo ""

# Crear directorio web
mkdir -p "$WEB_DIR"

# HTML de la página web
cat > "$WEB_DIR/index.html" << 'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raylib Games Launcher</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'JetBrains Mono', monospace; }
        .game-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .game-card { transition: all 0.3s ease; }
        .screenshot-thumb { border-radius: 8px; }
    .pixel-font { font-size: 12px; }
    .neon-text { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
    .neon-border { box-shadow: 0 0 15px rgba(255,42,127,0.3); }
    .blink { animation: blink 2s infinite; }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-slate-900 text-white min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-4 neon-text">
                🎮 Raylib Games Launcher <span class="blink">v1.0</span>
            </h1>
            <p class="text-slate-400 text-lg">
                Juegos hechos en Chile con Raylib + Estética Nacional
            </p>
        </header>

        <!-- Games Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8" id="games-container">
            <!-- Games se insertan aquí dinámicamente -->
        </div>

        <!-- Screenshots Gallery -->
        <section class="mt-16">
            <h2 class="text-3xl font-bold mb-6 text-blue-400">📸 Screenshots Recientes</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="screenshots-container">
                <!-- Screenshots se insertan aquí dinámicamente -->
            </div>
        </section>

        <!-- Controls -->
        <section class="mt-16 bg-slate-800 p-6 rounded-lg">
            <h2 class="text-2xl font-bold mb-4 text-purple-400">🎛️ Controles del Launcher</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="BuildAll()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition w-full">
                    🔨 Build All
                </button>
                <button onclick="RefreshScreenshots()" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition w-full">
                    📸 Refresh Screenshots
                </button>
            </div>
        </section>

        <!-- Terminal Output -->
        <section class="mt-16 bg-slate-800 p-6 rounded-lg font-mono text-sm">
            <h2 class="text-2xl font-bold mb-4 text-yellow-400">💻 Terminal Output</h2>
            <pre id="terminal-output" class="text-green-400 overflow-y-auto max-h-64 p-4 bg-black rounded">Esperando comandos...</pre>
        </section>

        <!-- Footer -->
        <footer class="mt-16 text-center text-slate-600">
            <p>Hecho con Raylib en Chile 🇨🇱</p>
            <p class="text-sm">Estética chilena: BRP + Santos Chávez + Alterna</p>
        </footer>
    </div>

    <script>
        // Games database
        const games = [
            {
                id: "recta-provincia-v2.2",
                name: "Recta Provincia v2.2",
                description: "Mapuche World + Lanza Bola",
                type: "RPG/Adventure",
                image: "https://via.placeholder.com/300x200?text=Recta+Provincia",
                color: "border-orange-500"
            },
            {
                id: "delitos-v2.2",
                name: "Delitos v2.2",
                description: "Urbanos Chile + Protesta Social",
                type: "Action/Open World",
                image: "https://via.placeholder.com/300x200?text=Delitos+v2.2",
                color: "border-red-500"
            }
        ];

        // Render games
        function RenderGames() {
            const container = document.getElementById('games-container');
            container.innerHTML = games.map(game => `
                <div class="game-card bg-slate-800 p-6 rounded-lg neon-border">
                    <div class="mb-4">
                        <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover rounded-lg screenshot-thumb">
                    </div>
                    <h3 class="text-2xl font-bold mb-2 text-white">${game.name}</h3>
                    <p class="text-slate-400 text-sm mb-4">${game.description}</p>
                    <div class="flex items-center gap-2 mb-4">
                        <span class="bg-slate-700 px-3 py-1 rounded-full text-xs pixel-font">
                            ${game.type}
                        </span>
                        <span class="text-slate-500 text-xs">
                            Estilo: BRP + Santos Chávez
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="BuildAndRun('${game.id}')" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center">
                            🎮 Build & Run
                        </button>
                        <button onclick="ViewCode('${game.id}')" class="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center">
                            📄 Ver Código
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Render screenshots
        function RenderScreenshots() {
            const container = document.getElementById('screenshots-container');
            container.innerHTML = '<div class="col-span-full text-center text-slate-500">Loading screenshots...</div>';
        }

        // Build and run game
        function BuildAndRun(gameId) {
            const terminal = document.getElementById('terminal-output');
            terminal.innerHTML += `\n🔨 Building ${gameId}...\n`;
            
            fetch('/build/' + gameId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                terminal.innerHTML += `✅ Build exitoso\n`;
                terminal.innerHTML += `📂 Artifacts: ${data.artifacts}\n`;
                
                // Ejecutar game
                terminal.innerHTML += `🎮 Ejecutando ${gameId}...\n`;
                fetch('/run/' + gameId, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    terminal.innerHTML += `✅ Game iniciado\n`;
                    terminal.innerHTML += `📸 Screenshot: ${data.screenshot}\n`;
                    
                    // Refresh screenshots
                    setTimeout(() => RefreshScreenshots(), 1000);
                })
                .catch(error => {
                    terminal.innerHTML += `❌ Error ejecutando: ${error.message}\n`;
                });
            })
            .catch(error => {
                terminal.innerHTML += `❌ Error building: ${error.message}\n`;
            });
        }

        // View code
        function ViewCode(gameId) {
            window.open('/code/' + gameId, '_blank');
        }

        // Build all
        function BuildAll() {
            const terminal = document.getElementById('terminal-output');
            terminal.innerHTML += `\n🔨 Building all games...\n`;
            
            fetch('/build-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                terminal.innerHTML += `✅ ${data.count} games built successfully\n`;
                Object.entries(data.games).forEach(([id, status]) => {
                    terminal.innerHTML += `  ${id}: ${status}\n`;
                });
            })
            .catch(error => {
                terminal.innerHTML += `❌ Error: ${error.message}\n`;
            });
        }

        // Refresh screenshots
        function RefreshScreenshots() {
            fetch('/screenshots', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('screenshots-container');
                
                if (data.screenshots.length === 0) {
                    container.innerHTML = '<div class="col-span-full text-center text-slate-500">No hay screenshots aún</div>';
                    return;
                }
                
                container.innerHTML = data.screenshots.map(screenshot => `
                    <div class="bg-slate-800 p-4 rounded-lg">
                        <img src="/screenshots/${screenshot.filename}" alt="${screenshot.game}" class="w-full h-auto object-cover rounded-lg screenshot-thumb">
                        <p class="text-white text-sm mt-2 pixel-font">${screenshot.game}</p>
                        <p class="text-slate-500 text-xs">${screenshot.timestamp}</p>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error refreshing screenshots:', error);
            });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            RenderGames();
            RenderScreenshots();
        });
    </script>
</body>
</html>
HTML
'

# Servidor Python simple
cat > "$WEB_DIR/server.py" << 'PYTHON'
#!/usr/bin/env python3
"""
Raylib Games Web Server
Launcher + Screenshots Gallery
"""

from flask import Flask, jsonify, send_from_directory
import os
import subprocess
from datetime import datetime

app = Flask(__name__)

# Configuración
GAMES_DIR = "/home/pi/.openclaw/workspace/projects/gaming"
BUILD_DIR = "/home/pi/.openclaw/build"
SCREENSHOT_DIR = "/home/pi/.openclaw/screenshots"

# Games database
GAMES = {
    "recta-provincia-v2.2": {
        "name": "Recta Provincia v2.2",
        "description": "Mapuche World + Lanza Bola",
        "type": "RPG/Adventure"
    },
    "delitos-v2.2": {
        "name": "Delitos v2.2",
        "description": "Urbanos Chile + Protesta Social",
        "type": "Action/Open World"
    }
}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/screenshots/<path:path>')
def screenshots(path):
    return send_from_directory(SCREENSHOT_DIR, path)

@app.route('/build/<game_id>')
def build_game(game_id):
    game_info = GAMES.get(game_id)
    if not game_info:
        return jsonify({"error": "Game not found"}), 404
    
    game_dir = os.path.join(GAMES_DIR, game_id)
    build_dir = os.path.join(BUILD_DIR, game_id)
    
    if not os.path.exists(game_dir):
        return jsonify({"error": "Game directory not found"}), 404
    
    try:
        # Detectar si usa CMake o Makefile
        if os.path.exists(os.path.join(game_dir, "CMakeLists.txt")):
            # Build con CMake
            os.makedirs(build_dir, exist_ok=True)
            subprocess.run(["cmake", "-B", build_dir, game_dir], check=True)
            subprocess.run(["cmake", "--build", build_dir, "--config", "Release"], check=True)
        else:
            # Build con Makefile
            subprocess.run(["make", "-C", game_dir], check=True)
        
        artifacts = os.listdir(build_dir) if os.path.exists(build_dir) else []
        
        return jsonify({
            "status": "success",
            "artifacts": artifacts,
            "build_dir": build_dir
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/run/<game_id>')
def run_game(game_id):
    game_info = GAMES.get(game_id)
    if not game_info:
        return jsonify({"error": "Game not found"}), 404
    
    # Buscar ejecutable
    possible_paths = [
        os.path.join(BUILD_DIR, game_id, game_id),
        os.path.join(GAMES_DIR, game_id, game_id)
        os.path.join(BUILD_DIR, game_id, game_id.replace("-", "_"))
    ]
    
    executable = None
    for path in possible_paths:
        if os.path.exists(path) and os.access(path, os.X_OK):
            executable = path
            break
    
    if not executable:
        return jsonify({"error": "Executable not found"}), 404
    
    # Tomar screenshot antes de ejecutar
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(SCREENSHOT_DIR, f"{game_id}_before_{timestamp}.png")
    
    # Ejecutar en headless con Xvfb
    try:
        process = subprocess.Popen(
            ["xvfb-run", "--server-args=-screen 0 1280x1024x24", executable],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Esperar un poco y tomar screenshot
        import time
        time.sleep(2)
        
        subprocess.run(["xwd", "-display", ":0", "-root", "-silent", "|", "convert", "-", screenshot_path])
        
        return jsonify({
            "status": "running",
            "screenshot": screenshot_path,
            "pid": process.pid
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/code/<game_id>')
def view_code(game_id):
    game_dir = os.path.join(GAMES_DIR, game_id)
    if not os.path.exists(game_dir):
        return "Game not found", 404
    
    code = ""
    sources = ["src/main.c", "src/combat.c", "src/map_generator.c"]
    
    for source_file in sources:
        source_path = os.path.join(game_dir, source_file)
        if os.path.exists(source_path):
            with open(source_path, 'r') as f:
                code += f"=== {source_file} ===\n"
                code += f.read()
                code += "\n\n"
    
    return f"<pre style='background: #1a1a1a; color: #e6e6e6; padding: 20px; font-family: monospace;'>{code}</pre>"

@app.route('/build-all')
def build_all():
    results = {}
    
    for game_id in GAMES.keys():
        try:
            result = build_game(game_id)
            results[game_id] = "success"
        except Exception as e:
            results[game_id] = str(e)
    
    return jsonify({
        "count": len(GAMES),
        "games": results
    })

@app.route('/screenshots')
def list_screenshots():
    screenshots = []
    
    if os.path.exists(SCREENSHOT_DIR):
        for filename in sorted(os.listdir(SCREENSHOT_DIR)):
            if filename.endswith('.png'):
                game_name = filename.rsplit('_', 1)[0]
                timestamp = filename.rsplit('_', 1)[1].split('.')[0]
                screenshot_path = os.path.join(SCREENSHOT_DIR, filename)
                mtime = os.path.getmtime(screenshot_path)
                screenshots.append({
                    "filename": filename,
                    "game": game_name,
                    "timestamp": timestamp,
                    "mtime": mtime
                })
    
    # Ordenar por fecha (más recientes primero)
    screenshots.sort(key=lambda x: x['mtime'], reverse=True)
    
    return jsonify({
        "screenshots": screenshots
    })

if __name__ == '__main__':
    # Detectar si hay Xvfb
    import shutil
    if not shutil.which('xvfb'):
        print("⚠️  xvfb no encontrado. Las capturas de pantalla no funcionarán.")
        print("   Instala con: sudo apt install xvfb")
    
    # Detectar si hay Xvfb y convert
    if not shutil.which('convert'):
        print("⚠️  convert (ImageMagick) no encontrado. Las capturas de pantalla no funcionarán.")
        print("   Instala con: sudo apt install imagemagick")
    
    # Iniciar servidor
    print(f"🚀 Iniciando servidor en puerto {PORT}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"📸 Screenshots: {SCREENSHOT_DIR}")
    print("")
    print("🎮 Raylib Games Launcher v1.0")
    print("📂 Games: {GAMES_DIR}")
    print("🔨 Build: {BUILD_DIR}")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
PYTHON
'

# Permisos
chmod +x "$WEB_DIR/server.py"

echo ""
echo "✅ Raylib Game Launcher configurado exitosamente"
echo ""
echo "🌐 Web Interface: http://localhost:$PORT"
echo "📂 Projects: $PROJECTS_DIR"
echo "🔨 Build: $BUILD_DIR"
echo "📸 Screenshots: $SCREENSHOT_DIR"
echo ""
echo "🎮 Para ejecutar un juego:"
echo "   1. Abre http://localhost:$PORT"
echo "   2. Click en 'Build & Run'"
echo "   3. El launcher compilará y ejecutará el juego en headless"
echo "   4. Las capturas de pantalla se mostrarán automáticamente"
echo ""
echo "📂 Para ver screenshots:"
echo "   1. Abre http://localhost:$PORT"
echo "   2. Ve la sección 'Screenshots Recientes'"
echo "   3. Click en las capturas para ver en tamaño completo"
echo ""
echo "🔨 Para compilar todos los juegos:"
echo "   1. Click en 'Build All' en la web"
echo "   2. El servidor compilará todos los proyectos"
echo "   3. Ver el output en la terminal"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   cd $WEB_DIR"
echo "   python3 server.py"
echo ""
echo "📌 Para detener el servidor:"
echo "   Ctrl+C"
echo ""
echo "📂 Para ver el código fuente:"
echo "   Click en 'Ver Código' en la tarjeta del juego"
echo ""
echo "🎯 Proyectos disponibles:"
for project_dir in "$PROJECTS_DIR"/*; do
    if [ -d "$project_dir" ]; then
        echo "   - $(basename $project_dir)"
    fi
done
