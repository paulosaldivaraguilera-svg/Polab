#!/bin/bash
# Build Script - Raylib Projects
# Compila y ejecuta proyectos de raylib

PROJECTS_DIR="/home/pi/.openclaw/workspace/projects/gaming"
BUILD_DIR="/home/pi/.openclaw/build"
SCREENSHOT_DIR="/home/pi/.openclaw/screenshots"

# Crear directorios
mkdir -p "$BUILD_DIR"
mkdir -p "$SCREENSHOT_DIR"

echo "🚀 Raylib Build System v1.0"
echo "📁 Projects: $PROJECTS_DIR"
echo "🔨 Build: $BUILD_DIR"
echo "📸 Screenshots: $SCREENSHOT_DIR"
echo ""

# Función: Compilar proyecto
BuildProject() {
    local project_name=$1
    local project_dir="$PROJECTS_DIR/$project_name"
    
    if [ ! -d "$project_dir" ]; then
        echo "❌ Proyecto no encontrado: $project_name"
        return 1
    fi
    
    echo ""
    echo "🔨 Compilando $project_name..."
    echo "=================================="
    
    # Detectar si tiene CMakeLists.txt
    if [ -f "$project_dir/CMakeLists.txt" ]; then
        echo "📦 Sistema de construcción: CMake"
        
        cd "$project_dir"
        cmake -B "$BUILD_DIR/$project_name" .
        cmake --build "$BUILD_DIR/$project_name" --config Release
        
        if [ $? -eq 0 ]; then
            echo "✅ Build exitoso: $BUILD_DIR/$project_name"
        else
            echo "❌ Build fallido"
            return 1
        fi
        
    elif [ -f "$project_dir/Makefile" ]; then
        echo "📦 Sistema de construcción: Makefile"
        
        cd "$project_dir"
        make clean
        make
        
        if [ $? -eq 0 ]; then
            echo "✅ Build exitoso"
        else
            echo "❌ Build fallido"
            return 1
        fi
        
    else
        echo "❌ No se encontró CMakeLists.txt ni Makefile en $project_dir"
        return 1
    fi
    
    echo ""
    echo "✅ Proyecto compilado y listo para ejecutar"
    echo "📂 Build artifacts: $BUILD_DIR/$project_name"
}

# Función: Ejecutar proyecto (headless o con Xvfb)
RunProject() {
    local project_name=$1
    local executable=""
    
    # Buscar ejecutable
    if [ -f "$BUILD_DIR/$project_name/$project_name" ]; then
        executable="$BUILD_DIR/$project_name/$project_name"
    elif [ -f "$project_dir/$project_name" ]; then
        executable="$project_dir/$project_name"
    fi
    
    if [ ! -f "$executable" ]; then
        echo "❌ Ejecutable no encontrado: $executable"
        return 1
    fi
    
    echo ""
    echo "🎮 Ejecutando $project_name..."
    echo "=================================="
    
    # Detectar si es headless
    if [ -z "$DISPLAY" ]; then
        echo "🖥️ Modo Headless detectado"
        echo "📸 Usando Xvfb para captura de pantalla"
        
        # Ejecutar con Xvfb y captura automática
        local timestamp=$(date +%Y%m%d_%H%M%S)
        local screenshot="$SCREENSHOT_DIR/${project_name}_$timestamp.png"
        
        xvfb-run --server-args="-screen 0 1280x1024x24" \
            "$executable" &
        local pid=$!
        
        # Esperar un poco
        sleep 3
        
        # Capturar pantalla
        xwd -display :0 -root -silent | convert - "$screenshot" 2>/dev/null
        
        # Matar proceso
        kill $pid 2>/dev/null
        
        echo "📸 Screenshot guardado: $screenshot"
        
    else
        echo "🖥️ Modo con DISPLAY detectado"
        
        # Ejecutar normal
        "$executable" &
        local pid=$!
        
        # Esperar input
        wait $pid
    fi
}

# Función: Capturar screenshot manual
Screenshot() {
    local project_name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local screenshot="$SCREENSHOT_DIR/${project_name}_manual_$timestamp.png"
    
    if [ ! -z "$DISPLAY" ]; then
        xwd -display :0 -root -silent | convert - "$screenshot"
        echo "📸 Screenshot guardado: $screenshot"
    else
        echo "❌ No se puede capturar en modo headless sin Xvfb"
    fi
}

# Menú Principal
ShowMenu() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║            🎮 Raylib Build System - Projects               ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ 1. Recta Provincia v2.2 - Mapuche                          ║"
    echo "║ 2. Delitos v2.2 - Urbanos Chile                            ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ 3. Build All Projects                                    ║"
    echo "║ 4. Screenshot Manual                                      ║"
    echo "║ 5. Ver Screenshots Guardados                              ║"
    echo "║ 0. Salir                                                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -n "🎯 Opción: "
}

# Loop Principal
while true; do
    ShowMenu
    read -p "" opcion
    
    case $opcion in
        1)
            BuildProject "recta-provincia-v2.2"
            RunProject "recta-provincia-v2.2"
            ;;
        2)
            BuildProject "delitos-v2.2"
            RunProject "delitos-v2.2"
            ;;
        3)
            echo "🔨 Compilando todos los proyectos..."
            BuildProject "recta-provincia-v2.2"
            BuildProject "delitos-v2.2"
            ;;
        4)
            Screenshot "recta-provincia-v2.2"
            Screenshot "delitos-v2.2"
            ;;
        5)
            echo "📸 Screenshots guardados en:"
            ls -la "$SCREENSHOT_DIR" 2>/dev/null | tail -20
            ;;
        0)
            echo "👋 Saliendo..."
            exit 0
            ;;
        *)
            echo "❌ Opción inválida"
            ;;
    esac
done

exit 0
