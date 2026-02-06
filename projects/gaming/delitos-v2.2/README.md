# Delitos v2.2 - Delitos Urbanos Chile
# Raylib Integration - Cartelismo Social + Crítica Neoextractivismo

## 🎨 Estética Visual

### Inspiración: Gráfica de Resistencia Chilota
- **Alterna (Natalia Cáceres):** "No esperes tus vacaciones para preocuparte"
- **NachoNass (Ignacio Abarca):** "Somos Sur" - identidad regional
- **Gráfika Diablo Rojo:** Actitud del chilote en la resistencia

### Paleta de Colores (Neon + Contraste)
| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Chilote Negro** | #1A1A1A | 26,26,26 | Texto, UI principal |
| **Resistencia Rojo** | #FF2A2A | 255,42,42 | Enemigos, danger, acciones |
| **Esperanza Azul** | #2A5AFF | 42,90,255 | Jugador, items, positivos |
| **Protesta Amarillo** | #FFD32F | 255,211,47 | Alertas, warnings, destacados |
| **Sombra Morada** | #4A1B5E | 74,27,94 | Backgrounds, ambiente nocturno |
| **Grafito** | #2C2C2C | 44,44,44 | Estructuras, edificios, gráficos |

---

## 🎮 Game Mechanics v2.2

### 1. Mapa Procedural: Ciudad Neoextractivista
**Técnica:** Cellular Automata + Noise Layering

**Biomas Urbanos:**
- **Residencial (Barrio Popular):** Casas densas, tiendas, parques
- **Industrial (Fábrica Salmonera):** Chimeneas contaminantes, camiones
- **Comercial (Centro):** Rascacielos, edificios corporativos
- **Marginal (Periferia):** Asentamientos precarios, terreno baldío
- **Control (Estado):** Comisaría, cárcel, estadios

### 2. Sistema de Crimen
**Modelo:** Grand Theft Auto (GTA) 2D simplificado

**Categorías de Delitos:**
- **Hurto (Pickpocketing):** Ganancia baja, riesgo bajo
- **Robo (Ladrón Casero):** Ganancia media, riesgo medio
- **Asalto (Banco/Cajero):** Ganancia alta, riesgo alto
- **Narcotráfico (Venta Calle):** Ganancia muy alta, riesgo muy alto
- **Falsificación (Documentos):** Ganancia media, riesgo bajo
- **Protesta (Ocupación Calle):** No monetario, riesgo medio

### 3. Sistema de Notoriedad (Wanted System)
- **Nivel 1:** Policía patrulla (enfoque normal)
- **Nivel 2:** Detectives persiguen (enfoque agresivo)
- **Nivel 3:** Helióptero (fuga necesaria)
- **Nivel 4:** Mano dura (SWAT, disparan a vista)

---

## 🌃 Estructura del Proyecto

```
delitos-v2.2/
├── src/
│   ├── main.c                  # Entrada principal
│   ├── city_generator.c       # Generación procedural ciudad
│   ├── crime_system.c          # Sistema de delitos
│   ├── notoriedad.c             # Sistema wanted
│   ├── ai_police.c            # IA de persecución policial
│   └── economy.c               # Sistema de economía
├── resources/
│   ├── sprites/
│   │   ├── player/            # Sprites del jugador
│   │   ├── police/            # Sprites de policía
│   │   ├── civilians/         # Sprites de civiles
│   │   └── buildings/         # Sprites de edificios
│   ├── textures/
│   │   ├── city/              # Texturas ciudad
│   │   ├── ui/                # Texturas interfaz
│   │   └── wanted/            # Texturas nivel wanted
│   ├── sounds/
│   │   ├── ambience/          # Sonidos ambiente (sirenas, tránsito)
│   │   ├── actions/            # Sonidos acciones (tiros, gritos)
│   │   └── music/              # Música urbana (neon, lo-fi)
│   └── fonts/
│       ├── pixel/              # Fuente pixel art (principal)
│       ├── neon/               # Fuente estilo neón (UI)
│       └── protest/           # Fuente estilo grafiti (afiches)
├── include/
│   ├── raylib.h
│   ├── city_generator.h
│   ├── crime_system.h
│   ├── notoriedad.h
│   ├── ai_police.h
│   └── economy.h
└── CMakeLists.txt
```

---

## 💻 Código Principal (main.c)

```c
#include "raylib.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

// Estructuras
typedef enum { BIOMA_RESIDENCIAL, BIOMA_INDUSTRIAL, BIOMA_COMERCIAL, BIOMA_MARGINAL, BIOMA_CONTROL } Biom;

typedef struct {
    Biom biom;
    int edificio;
    int ocupado;
    int notoriedad; // 0-100
} Tile;

typedef struct {
    int x;
    int y;
    int velocidad;
    int dinero;
    int notoriedad; // 0-4 (wanted levels)
    int cooldown_delito;
} Player;

typedef struct {
    int x;
    int y;
    int tipo; // 0=peaton, 1=policia, 2=civil
    int notoriedad;
} NPC;

// Mapa
#define MAP_WIDTH 50
#define MAP_HEIGHT 50
#define TILE_SIZE 32
Tile mapa[MAP_HEIGHT][MAP_WIDTH];

// Jugador
Player jugador = {20, 20, 2, 1000, 0, 0};

// NPCs
#define MAX_NPCS 100
NPC npcs[MAX_NPCS];

// Colores
#define COLOR_CHILOTE_NEGRO   CLITERAL(0x1A, 0x1A, 0x1A, 0xFF)
#define COLOR_RESISTENCIA_ROJO CLITERAL(0xFF, 0x2A, 0x2A, 0xFF)
#define COLOR_ESPERANZA_AZUL  CLITERAL(0x2A, 0x5A, 0xFF, 0xFF)
#define COLOR_PROTESTA_AMARILLO CLITERAL(0xFF, 0xD3, 0x2F, 0xFF)
#define COLOR_SOMBRA_MORADA   CLITERAL(0x4A, 0x1B, 0x5E, 0xFF)
#define COLOR_GRAFITO         CLITERAL(0x2C, 0x2C, 0x2C, 0xFF)

// Funciones
void GenerarCiudadNeoextractivista() {
    srand(time(NULL));
    
    for (int y = 0; y < MAP_HEIGHT; y++) {
        for (int x = 0; x < MAP_WIDTH; x++) {
            int ruido = rand() % 100;
            
            // Generar biomas
            if (ruido < 40) {
                mapa[y][x].biom = BIOMA_RESIDENCIAL;
                mapa[y][x].edificio = rand() % 5; // Casas, tiendas
            } else if (ruido < 60) {
                mapa[y][x].biom = BIOMA_INDUSTRIAL;
                mapa[y][x].edificio = rand() % 3; // Fábricas, chimeneas
            } else if (ruido < 80) {
                mapa[y][x].biom = BIOMA_COMERCIAL;
                mapa[y][x].edificio = rand() % 4; // Rascacielos, bancos
            } else if (ruido < 90) {
                mapa[y][x].biom = BIOMA_MARGINAL;
                mapa[y][x].edificio = rand() % 2; // Chozas precarias, basura
            } else {
                mapa[y][x].biom = BIOMA_CONTROL;
                mapa[y][x].edificio = rand() % 3; // Comisaría, cárcel
            }
            
            mapa[y][x].notoriedad = 0;
        }
    }
    
    // Generar NPCs
    int num_npcs = 50 + rand() % 50;
    for (int i = 0; i < num_npcs; i++) {
        npcs[i].x = rand() % MAP_WIDTH;
        npcs[i].y = rand() % MAP_HEIGHT;
        npcs[i].tipo = rand() % 3; // Peaton, policía, civil
        npcs[i].notoriedad = rand() % 100;
    }
}

void DibujarCiudad() {
    int desplazamiento_x = -jugador.x * TILE_SIZE + GetScreenWidth() / 2;
    int desplazamiento_y = -jugador.y * TILE_SIZE + GetScreenHeight() / 2;
    
    for (int y = 0; y < MAP_HEIGHT; y++) {
        for (int x = 0; x < MAP_WIDTH; x++) {
            int screen_x = (x + desplazamiento_x) % (MAP_WIDTH * TILE_SIZE);
            int screen_y = (y + desplazamiento_y) % (MAP_HEIGHT * TILE_SIZE);
            
            Color color = COLOR_CHILOTE_NEGRO;
            
            // Colores según bioma
            switch (mapa[y][x].biom) {
                case BIOMA_RESIDENCIAL:
                    color = Fade(COLOR_SOMBRA_MORADA, COLOR_CHILOTE_NEGRO, 0.3f);
                    break;
                case BIOMA_INDUSTRIAL:
                    color = COLOR_GRAFITO;
                    break;
                case BIOMA_COMERCIAL:
                    color = Fade(COLOR_ESPERANZA_AZUL, COLOR_CHILOTE_NEGRO, 0.2f);
                    break;
                case BIOMA_MARGINAL:
                    color = COLOR_CHILOTE_NEGRO;
                    break;
                case BIOMA_CONTROL:
                    color = COLOR_RESISTENCIA_ROJO;
                    break;
            }
            
            DrawRectangle(screen_x, screen_y, TILE_SIZE, TILE_SIZE, color);
        }
    }
}

void SistemaDelitos() {
    // Delitos disponibles
    if (IsKeyPressed(KEY_ONE)) { // Hurto
        if (jugador.cooldown_delito == 0) {
            jugador.dinero += 50 + rand() % 50;
            jugador.notoriedad += 5;
            jugador.cooldown_delito = 60; // 1 segundo cooldown
        }
    }
    if (IsKeyPressed(KEY_TWO)) { // Robo
        if (jugador.cooldown_delito == 0) {
            jugador.dinero += 200 + rand() % 200;
            jugador.notoriedad += 15;
            jugador.cooldown_delito = 120;
        }
    }
    if (IsKeyPressed(KEY_THREE)) { // Asalto
        if (jugador.cooldown_delito == 0) {
            jugador.dinero += 1000 + rand() % 1000;
            jugador.notoriedad += 50;
            jugador.cooldown_delito = 180;
        }
    }
    if (IsKeyPressed(KEY_FOUR)) { // Narcotráfico
        if (jugador.cooldown_delito == 0) {
            jugador.dinero += 5000 + rand() % 5000;
            jugador.notoriedad += 100;
            jugador.cooldown_delito = 300;
        }
    }
    
    // Reducir cooldowns
    if (jugador.cooldown_delito > 0) {
        jugador.cooldown_delito--;
    }
    
    // Sistema wanted
    int wanted_level = jugador.notoriedad / 25; // 0-4
    if (IsKeyPressed(KEY_R)) {
        // Aumentar notoriedad manualmente (debug)
        jugador.notoriedad += 25;
    }
    
    // IA de Policía
    for (int i = 0; i < MAX_NPCS; i++) {
        if (npcs[i].tipo == 1) { // Policía
            float dx = npcs[i].x - jugador.x;
            float dy = npcs[i].y - jugador.y;
            float distancia = sqrtf(dx*dx + dy*dy);
            
            // Policía persigue si tienes notoriedad
            if (jugador.notoriedad > 0 && distancia < 10.0f) {
                if (dx > 0) npcs[i].x -= 0.05f;
                if (dx < 0) npcs[i].x += 0.05f;
                if (dy > 0) npcs[i].y -= 0.05f;
                if (dy < 0) npcs[i].y += 0.05f;
            }
        }
    }
}

void SistemaNotoriedad() {
    // Dibujar barra de wanted
    int wanted_level = jugador.notoriedad / 25; // 0-4
    
    for (int i = 0; i < 5; i++) {
        Color color = COLOR_SOMBRA_MORADA;
        if (i < wanted_level) {
            color = COLOR_RESISTENCIA_ROJO;
        }
        
        DrawRectangle(10 + i * 40, 10, 35, 10, color);
    }
    
    // Texto de nivel wanted
    const char* wanted_texts[] = {
        "CUIDADO - POCO VISIBLE",
        "BUSCADO - DETECTIVES EN ZONA",
        "PERSEGUIDO - POLICÍA ENFOQUE AGRESIVO",
        "ALERTA ROJO - HELICÓPTERO DESPLEGADO",
        "MANO DURA - SWAT DISPONIBLE"
    };
    
    if (wanted_level > 0) {
        DrawText(wanted_texts[wanted_level - 1], 10, 30, 20, COLOR_PROTESTA_AMARILLO);
    }
}

void UI() {
    // Panel semi-transparente
    DrawRectangle(10, 300, 300, 150, Fade(COLOR_CHILOTE_NEGRO, 0, 0.7f));
    
    // Estadísticas del jugador
    DrawText(TextFormat("DINERO: $%d", jugador.dinero), 20, 320, 20, COLOR_ESPERANZA_AZUL);
    DrawText(TextFormat("NOTORIEDAD: %d/100", jugador.notoriedad), 20, 350, 20, COLOR_RESISTENCIA_ROJO);
    DrawText(TextFormat("VELOCIDAD: %d", jugador.velocidad), 20, 380, 20, COLOR_CHILOTE_NEGRO);
    
    // Controles
    DrawText("1: HURTO | 2: ROBO | 3: ASALTO | 4: NARCOTRÁFICO", 20, 410, 14, COLOR_PROTESTA_AMARILLO);
    DrawText("WASD: MOVER | R: DEBUG NOTORIEDAD", 20, 430, 14, COLOR_CHILOTE_NEGRO);
    
    // Sistema wanted
    SistemaNotoriedad();
    
    // Mensaje de protesta
    DrawText("¡SOMOS SUR! NO AL NEOEXTRACTIVISMO!", 20, 450, 14, COLOR_ESPERANZA_AZUL);
}

int main(void) {
    InitWindow(1280, 720, "Delitos v2.2 - Ciudad Neoextractivista");
    SetTargetFPS(60);
    
    GenerarCiudadNeoextractivista();
    
    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(COLOR_CHILOTE_NEGRO);
        
        // Movimiento
        if (IsKeyDown(KEY_W)) jugador.y -= 0.1f;
        if (IsKeyDown(KEY_S)) jugador.y += 0.1f;
        if (IsKeyDown(KEY_A)) jugador.x -= 0.1f;
        if (IsKeyDown(KEY_D)) jugador.x += 0.1f;
        
        // Limites del mapa
        if (jugador.x < 0) jugador.x = 0;
        if (jugador.x >= MAP_WIDTH) jugador.x = MAP_WIDTH - 1;
        if (jugador.y < 0) jugador.y = 0;
        if (jugador.y >= MAP_HEIGHT) jugador.y = MAP_HEIGHT - 1;
        
        // Sistema de juego
        SistemaDelitos();
        
        // Dibujar ciudad
        DibujarCiudad();
        
        // Dibujar UI
        UI();
        
        EndDrawing();
    }
    
    CloseWindow();
    return 0;
}
```

---

## 🚀 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10)
project(Delitos)

# Buscar Raylib
find_package(raylib REQUIRED)

# Archivos fuentes
set(SOURCES
    src/main.c
    src/city_generator.c
    src/crime_system.c
    src/notoriedad.c
    src/ai_police.c
    src/economy.c
)

# Crear ejecutable
add_executable(delitos ${SOURCES})
target_link_libraries(delitos PRIVATE raylib)

# Instalación
install(TARGETS delitos DESTINATION bin)
```

---

## 🎯 Características v2.2

### 1. Ciudad Procedural Neoextractivista
- **Biomas:** 5 tipos (Residencial, Industrial, Comercial, Marginal, Control)
- **Generación:** Noise Layering + Cellular Automata
- **Crítica:** Fábricas salmoneras contaminantes, gentrificación, neoextractivismo

### 2. Sistema de Delitos (GTA 2D)
- **Hurto:** Pickpocketing (ganancia baja, riesgo bajo)
- **Robo:** Ladrón casero (ganancia media, riesgo medio)
- **Asalto:** Banco/Cajero (ganancia alta, riesgo alto)
- **Narcotráfico:** Venta calle (ganancia muy alta, riesgo muy alto)

### 3. Sistema de Notoriedad (Wanted)
- **Niveles:** 5 niveles (Cuidado → Mano Dura)
- **Persecución:** IA de policía persigue según notoriedad
- **Consecuencias:** Aumenta dificultad del juego

### 4. Estética de Protesta Social
- **Colores:** Rojo resistencia, azul esperanza, amarillo protesta
- **Afiches:** Inspiración en Alterna, NachoNass, Gráfika Diablo Rojo
- **Mensajes:** "¡SOMOS SUR! NO AL NEOEXTRACTIVISMO!"

### 5. NPCs con IA
- **Tipos:** Peatones, Policía, Civiles
- **Comportamiento:** Policía persigue al jugador con notoriedad
- **Notoriedad:** Cada NPC tiene nivel de notoriedad (0-100)

---

## 📊 Roadmap v2.3

### 1. World Model Integration
- **Genie 3:** Generar misiones procedurales dinámicas
- **Persistencia:** Guardar estado de la ciudad y progresión del jugador

### 2. Physics Diferenciable
- **NVIDIA Warp:** Colisiones realistas con edificios
- **Vehículos:** Física de autos y motocicletas

### 3. Multiplayer
- **Servidor:** Estado compartido de la ciudad
- **Competencia:** Quien gana más dinero en X tiempo
- **Cooperativo:** Robos en banda, división del botín

---

## 🔗 Enlaces

**Web Personal:** https://code-nut-paste-delays.trycloudflare.com
**Comenzar Landing:** https://belief-relax-alice-sir.trycloudflare.com

---

*Desarrollado por PauloARIS*
*Estética: Alterna + NachoNass + Gráfika Diablo Rojo*
*Licencia: zlib/libpng*
