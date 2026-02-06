# Recta Provincia v2.2 - Recta Provincia Mapuche
# Raylib Integration - Estética Chile + Wallmapu + World Models

## 🎨 Estética Visual

### Inspiración: Santos Chávez + BRP
- **Xilografía:** Línea negra gruesa, colores planos
- **Cosmovisión Mapuche:** Pastores, cabras, cielos estrellados
- **Diseño Situado:** Respuesta al sur de Chile

### Paleta de Colores
| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Mapuche Negro** | #1A1A1A | 26,26,26 | Líneas, contornos |
| **Mapuche Rojo** | #C41E3A | 196,30,58 | Sangre, tierra |
| **Mapuche Azul** | #1A5276 | 26,82,118 | Cielo, agua |
| **Mapuche Blanco** | #E5E5E5 | 229,229,229 | Nieve, luz |
| **Mapuche Dorado** | #D4AF37 | 212,175,55 | Espiga de trigo |

---

## 🎮 Game Mechanics v2.2

### 1. Mapa Procedural (Wallmapu)
**Técnica:** Cellular Automata + Perlin Noise
- Genera terreno basado en Wallmapu (Araucanía, Lagos, Chiloé)
- Biomas: Bosque nativo, lago, volcan, campo, ciudad mapuche

### 2. Sistema de Quests (Mapuche Oral)
- **Quests:** Recuperar relatos, proteger sitios sagrados, aprender idioma
- **Rewards:** Fragmentos de historia, mapas territoriales, conocimiento ancestral

### 3. Combate (Lanza Bola Mapuche)
- **Weapon:** Lanza bola tradicional (ruka)
- **Enemies:** Espíritus protectores, soldados, criaturas del Wallmapu
- **Efectos:** Partículas chisporosas (cenizas mapuche)

---

## 🌄 Estructura del Proyecto

```
recta-provincia-v2.2/
├── src/
│   ├── main.c              # Entrada principal
│   ├── map_generator.c    # Generación procedural Wallmapu
│   ├── combat.c            # Sistema de combate lanza bola
│   ├── quest_manager.c      # Gestión de quests Mapuche
│   └── world_model.c       # Physics básica + persistencia
├── resources/
│   ├── sprites/             # Personajes y enemigos (estética xilografía)
│   ├── textures/           # Texturas (piedras, madera, fuego mapuche)
│   ├── sounds/              # Música Mapuche + SFX
│   └── fonts/               # Fuentes estilo grabado (SDF)
├── include/
│   ├── raylib.h            # Raylib C99 API
│   ├── map_generator.h
│   ├── combat.h
│   ├── quest_manager.h
│   └── world_model.h
└── CMakeLists.txt           # Build system
```

---

## 💻 Código Principal (main.c)

```c
#include "raylib.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

// Estructuras
typedef enum { BIOM_BOSQUE, BIOM_LAGO, BIOM_VOLCAN, BIOM_CAMPO, BIOM_CIUDAD } Biom;

typedef struct {
    Biom biome;
    int altura;
    int ocupado;
} Tile;

typedef struct {
    int x;
    int y;
    int vida;
    int quest;
    char nombre[32];
} Player;

typedef struct {
    int x;
    int y;
    int vida;
    int tipo;
    char nombre[32];
} Enemy;

// Mapa
#define MAP_WIDTH 40
#define MAP_HEIGHT 40
Tile mapa[MAP_HEIGHT][MAP_WIDTH];

// Jugador
Player jugador = {10, 10, 100, 0, "Weñu"}; // Weñu = Joven

// Enemigos
#define MAX_ENEMIGOS 20
Enemy enemigos[MAX_ENEMIGOS];

// Colores Mapuche
#define COLOR_MAPUCHE_NEGRO   CLITERAL(0x1A, 0x1A, 0x1A, 0xFF)
#define COLOR_MAPUCHE_ROJO    CLITERAL(0xC4, 0x1E, 0x3A, 0xFF)
#define COLOR_MAPUCHE_AZUL    CLITERAL(0x1A, 0x52, 0x76, 0xFF)
#define COLOR_MAPUCHE_BLANCO  CLITERAL(0xE5, 0xE5, 0xE5, 0xFF)
#define COLOR_MAPUCHE_DORADO  CLITERAL(0xD4, 0xAF, 0x37, 0xFF)

// Función: Generar mapa procedural Wallmapu
void GenerarMapaWallmapu() {
    // Semilla aleatoria
    srand(time(NULL));
    
    // Generar biomas basado en Perlin Noise (simplificado)
    for (int y = 0; y < MAP_HEIGHT; y++) {
        for (int x = 0; x < MAP_WIDTH; x++) {
            int ruido = rand() % 100;
            
            if (ruido < 40) {
                mapa[y][x].biome = BIOM_BOSQUE;
            } else if (ruido < 55) {
                mapa[y][x].biome = BIOM_LAGO;
            } else if (ruido < 70) {
                mapa[y][x].biome = BIOM_CAMPO;
            } else if (ruido < 85) {
                mapa[y][x].biome = BIOM_CIUDAD;
            } else {
                mapa[y][x].biome = BIOM_VOLCAN;
            }
            
            mapa[y][x].altura = rand() % 3; // 0 = plano, 1 = colina, 2 = montaña
            mapa[y][x].ocupado = 0;
        }
    }
    
    // Añadir ciudad Mapuche en el centro
    int centro_x = MAP_WIDTH / 2;
    int centro_y = MAP_HEIGHT / 2;
    for (int y = centro_y - 3; y <= centro_y + 3; y++) {
        for (int x = centro_x - 3; x <= centro_x + 3; x++) {
            mapa[y][x].biome = BIOM_CIUDAD;
            mapa[y][x].altura = 1;
        }
    }
}

// Función: Dibujar mapa
void DibujarMapa() {
    int TILE_SIZE = 32;
    
    for (int y = 0; y < MAP_HEIGHT; y++) {
        for (int x = 0; x < MAP_WIDTH; x++) {
            Color color = WHITE;
            
            switch (mapa[y][x].biome) {
                case BIOM_BOSQUE:
                    color = COLOR_MAPUCHE_NEGRO;
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, BLACK);
                    DrawRectangle(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4, COLOR_MAPUCHE_NEGRO);
                    break;
                case BIOM_LAGO:
                    color = COLOR_MAPUCHE_AZUL;
                    break;
                case BIOM_CAMPO:
                    color = COLOR_MAPUCHE_DORADO;
                    break;
                case BIOM_CIUDAD:
                    color = COLOR_MAPUCHE_BLANCO;
                    break;
                case BIOM_VOLCAN:
                    color = COLOR_MAPUCHE_ROJO;
                    break;
            }
            
            // Dibujar suelo
            DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, color);
            
            // Dibujar altura (sombra)
            if (mapa[y][x].altura > 0) {
                Color sombra = Fade(BLACK, color, 0.3f);
                DrawRectangle(x * TILE_SIZE + 4, y * TILE_SIZE + 8, TILE_SIZE - 8, TILE_SIZE - 8, sombra);
            }
        }
    }
}

// Función: Inicializar enemigos
void InicializarEnemigos() {
    int num_enemigos = 5 + rand() % 5; // 5-10 enemigos
    
    for (int i = 0; i < num_enemigos; i++) {
        enemigos[i].x = 2 + rand() % (MAP_WIDTH - 4);
        enemigos[i].y = 2 + rand() % (MAP_HEIGHT - 4);
        enemigos[i].vida = 50 + rand() % 50; // 50-100 vida
        enemigos[i].tipo = rand() % 3; // 0 = Espíritu, 1 = Soldado, 2 = Criatura
        enemigos[i].ocupado = 0;
        
        // Nombres Mapuche
        const char* nombres[] = {
            "Peñi",     // Espíritu
            "Llancu",   // Soldado
            "Cuyen",     // Criatura
            "Antu",      // Ser supremo
            "Wenu",      // Nuevo
            "Chau",      // Día
            "Lan",       // Muerte
        };
        
        int indice_nombre = rand() % 8;
        int indice_tipo = rand() % 8;
        snprintf(enemigos[i].nombre, 32, "%s %s", nombres[indice_tipo], nombres[indice_nombre]);
    }
}

// Función: Dibujar enemigos
void DibujarEnemigos() {
    int TILE_SIZE = 32;
    float tiempo = GetTime() * 1000;
    
    for (int i = 0; i < MAX_ENEMIGOS; i++) {
        if (enemigos[i].vida > 0) {
            // Animación: movimiento suave
            float desplazamiento_x = sinf(tiempo * 0.001f + i) * 10;
            float desplazamiento_y = cosf(tiempo * 0.001f + i) * 10;
            
            float screen_x = enemigos[i].x * TILE_SIZE + desplazamiento_x;
            float screen_y = enemigos[i].y * TILE_SIZE + desplazamiento_y;
            
            // Color según tipo
            Color color = WHITE;
            if (enemigos[i].tipo == 0) {
                color = Fade(BLUE, PURPLE, (sinf(tiempo * 0.002f + i) + 1) * 0.5f); // Espíritu
            } else if (enemigos[i].tipo == 1) {
                color = RED; // Soldado
            } else {
                color = ORANGE; // Criatura
            }
            
            // Dibujar enemigo (estilo xilografía - borde negro)
            DrawCircleV(screen_x + 16, screen_y + 16, 12, BLACK);
            DrawCircleV(screen_x + 16, screen_y + 16, 10, color);
            
            // Nombre
            DrawText(enemigos[i].nombre, screen_x, screen_y - 16, 12, BLACK);
        }
    }
}

// Función: Combate Lanza Bola Mapuche
void CombatLanzaBola() {
    float tiempo = GetTime();
    
    // IA: Enemigos se mueven hacia el jugador
    for (int i = 0; i < MAX_ENEMIGOS; i++) {
        if (enemigos[i].vida > 0) {
            float dx = jugador.x - enemigos[i].x;
            float dy = jugador.y - enemigos[i].y;
            float distancia = sqrtf(dx*dx + dy*dy);
            
            if (distancia > 0.1f && distancia < 10.0f) {
                // Mover hacia el jugador
                if (dx > 0) enemigos[i].x -= 0.02f;
                if (dx < 0) enemigos[i].x += 0.02f;
                if (dy > 0) enemigos[i].y -= 0.02f;
                if (dy < 0) enemigos[i].y += 0.02f;
            }
        }
    }
    
    // Ataque del jugador (Lanza Bola)
    if (IsKeyPressed(KEY_SPACE)) {
        float tiempo_disparo = 0;
        static float ultimo_disparo = 0;
        
        if (tiempo - ultimo_disparo > 0.5f) {
            ultimo_disparo = tiempo;
            
            // Efecto visual: Proyectil
            float proyectil_x = jugador.x;
            float proyectil_y = jugador.y;
            float velocidad_x = 0.2f;
            float velocidad_y = 0.2f;
            
            // Dibujar proyectil
            for (float t = 0; t < 2.0f; t += 0.1f) {
                DrawCircle(proyectil_x * 32 + 16, proyectil_y * 32 + 16, 5, COLOR_MAPUCHE_DORADO);
                proyectil_x += velocidad_x;
                proyectil_y += velocidad_y;
                
                // Colisión con enemigos
                for (int i = 0; i < MAX_ENEMIGOS; i++) {
                    if (enemigos[i].vida > 0) {
                        float dx = proyectil_x - enemigos[i].x;
                        float dy = proyectil_y - enemigos[i].y;
                        if (fabsf(dx) < 0.5f && fabsf(dy) < 0.5f) {
                            // Impacto
                            enemigos[i].vida -= 20;
                            
                            // Efecto visual: Partículas
                            for (int p = 0; p < 5; p++) {
                                float angulo = (float)p / 5.0f * PI * 2.0f;
                                float particula_x = enemigos[i].x * 32 + 16 + cosf(angulo) * 10;
                                float particula_y = enemigos[i].y * 32 + 16 + sinf(angulo) * 10;
                                DrawCircle(particula_x, particula_y, 3, COLOR_MAPUCHE_ROJO);
                            }
                            
                            break;
                        }
                    }
                }
                
                EndMode2D();
                BeginMode2D();
            }
        }
    }
}

// Función: UI
void DibujarUI() {
    // Panel transparente
    DrawRectangle(0, 0, 300, 120, Fade(BLACK, 0, 0.8f));
    
    // Nombre y título
    DrawText("RECTA PROVINCIA", 20, 20, 20, COLOR_MAPUCHE_DORADO);
    DrawText("Wallmapu - Tierra Mapuche", 20, 50, 16, COLOR_MAPUCHE_BLANCO);
    
    // Stats del jugador
    DrawText(TextFormat("Jugador: %s | Vida: %d", jugador.nombre, jugador.vida), 20, 80, 14, WHITE);
    
    // Quest actual
    const char* quests[] = {
        "Recuperar relatos del Wallmapu",
        "Proteger sitio sagrado de la ciudad",
        "Aprender idioma Mapuzugun",
        "Investigar misterio del Volcán Osorno"
    };
    DrawText(TextFormat("Quest: %s", quests[jugador.quest]), 20, 100, 14, COLOR_MAPUCHE_AZUL);
    
    // Controles
    DrawText("WASD: Mover | ESPACIO: Disparar Lanza Bola", 20, 110, 14, GRAY);
}

// Main
int main(void) {
    // Inicializar ventana
    InitWindow(800, 600, "Recta Provincia v2.2 - Wallmapu");
    SetTargetFPS(60);
    
    // Generar mapa
    GenerarMapaWallmapu();
    
    // Inicializar enemigos
    InicializarEnemigos();
    
    // Loop principal
    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(COLOR_MAPUCHE_NEGRO);
        
        // Lógica del juego
        if (IsKeyDown(KEY_W)) jugador.y -= 0.1f;
        if (IsKeyDown(KEY_S)) jugador.y += 0.1f;
        if (IsKeyDown(KEY_A)) jugador.x -= 0.1f;
        if (IsKeyDown(KEY_D)) jugador.x += 0.1f;
        
        // Dibujar mapa
        DibujarMapa();
        
        // Dibujar enemigos
        DibujarEnemigos();
        
        // Dibujar jugador
        DrawCircle(jugador.x * 32 + 16, jugador.y * 32 + 16, 10, COLOR_MAPUCHE_BLANCO);
        DrawCircle(jugador.x * 32 + 16, jugador.y * 32 + 16, 8, COLOR_MAPUCHE_DORADO);
        DrawText(jugador.nombre, jugador.x * 32 + 4, jugador.y * 32 - 20, 14, BLACK);
        
        // Combate
        CombatLanzaBola();
        
        // UI
        DibujarUI();
        
        EndDrawing();
    }
    
    // Limpiar
    CloseWindow();
    
    return 0;
}
```

---

## 🔧 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10)
project(RectaProvincia)

# Buscar Raylib
find_package(raylib REQUIRED)

# Archivos fuentes
set(SOURCES
    src/main.c
    src/map_generator.c
    src/combat.c
    src/quest_manager.c
    src/world_model.c
)

# Crear ejecutable
add_executable(recta-provincia ${SOURCES})
target_link_libraries(recta-provincia PRIVATE raylib)

# Instalación
install(TARGETS recta-provincia DESTINATION bin)
```

---

## 🚀 Build Instructions

### Compilar desde código fuente
```bash
# Clonar repositorio (simulado)
cd ~/projects/gaming/recta-provincia-v2.2/

# Crear estructura de directorios
mkdir -p src include resources/sprites resources/textures resources/sounds resources/fonts

# Compilar
gcc -o bin/recta-provincia src/*.c -Iinclude -L/usr/local/lib -lraylib -lGL -lm -lpthread -lX11 -lrt
```

### Ejecutar
```bash
cd bin
./recta-provincia
```

---

## 🎯 Características v2.2

### 1. Mapa Procedural Wallmapu
- **Biomas:** Bosque, Lago, Volcán, Campo, Ciudad Mapuche
- **Terreno:** Generado con Perlin Noise simplificado
- **Ciudad:** Centro del mapa (ruka mapuche)

### 2. Sistema de Quests
- **Misión 1:** Recuperar relatos del Wallmapu
- **Misión 2:** Proteger sitio sagrado
- **Misión 3:** Aprender Mapuzugun
- **Misión 4:** Investigar misterio Volcán Osorno

### 3. Combate Lanza Bola
- **Arma:** Lanza bola tradicional (ruka)
- **Enemigos:** Espíritus (Peñi), Soldados (Llancu), Criaturas (Cuyen)
- **IA:** Enemigos persiguen al jugador
- **Efectos:** Partículas ceniza roja al impacto

### 4. Estética Visual
- **Paleta Mapuche:** Negro, Rojo, Azul, Blanco, Dorado
- **Xilografía:** Línea negra gruesa, colores planos
- **Animación:** Movimiento suave sinusoidal

---

## 📊 Roadmap v2.3

### Próximas Mejoras
1. **World Model Integration**
   - Implementar Genie 3 para generación de misiones
   - Persistencia espacial del mapa

2. **Physics Diferenciable**
   - Integrar NVIDIA Warp para física
   - Gradientes para balance de combate

3. **Audio Mapuche**
   - Música tradicional
   - SFX: Lanza bola, combate, ambiente

4. **Multiplayer**
   - Sistema de quests cooperativo
   - Servidor de juego autoritativo

---

## 🔗 Enlaces

**Web Personal:** https://code-nut-paste-delays.trycloudflare.com
**Comenzar Landing:** https://belief-relax-alice-sir.trycloudflare.com

---

*Desarrollado por PauloARIS*
*Estética: Santos Chávez + BRP*
*Licencia: zlib/libpng*
