# DELITOS: Filtro de Sombras
## Game Design Document v1.0

*Investigative RPG Cyberpunk • Santiago de Chile*

---

## Sinopsis

Santiago, 2024. Eres el Inspector de una PDI especial que investiga crímenes que "no existen": redes de tráfico, corrupción política, experimentos ilegales.

**Tu especialidad:** Leer entre líneas. Encontrar lo que otros ignoran.

El caso inicial: "El Asesino de Plaza Italia". Un cuerpo encontrado con un símbolo extraño. Lo que parece un asesinatoisolado revela una red de conspiración que llega hasta el poder.

---

## Sistema de Juego

### Core Loop
1. **Recibir caso** → 2. **Investigar** → 3. **Recopilar pistas** → 4. **Descubrir verdad** → 5. **Resolver o fracasar**

### Investigación
- **Diálogos:** Elige preguntas. Cada investigador tiene especialidades (Intimidación, Empatía, Lógica).
- **Evidencias físicas:** Analizar crime scene, objetos, documentos.
- **Hacking:** Maya puede acceder a sistemas cerrados.
- **Combate:** Carlos puede resolver situaciones físicas.

### Sistema de Pistas (Clues)
- **Pistas requeridas:** Para avanzar a ciertas escenas, necesitas pistas específicas.
- **Pistas ocultas:** Algunas pistas solo aparecen si tienes al miembro correcto del equipo.
- **Pistas opcionales:** Dan bonificaciones de reputación.

---

## Party System (3 agentes estilo BG3)

| Personaje | Rol | HP | Habilidad | Specialty |
|-----------|-----|-----|-----------|-----------|
| **Tú (Líder)** | Investigador | 100 | Intuición | Leer mentiras, encontrar pistas ocultas |
| **Maya** | Hacker | 80 | Hackear | Acceso a sistemas, datos encriptados, vigilancia |
| **Carlos** | Ex-Militar | 100 | Combate | Intimidación, combate, entrada forzada |

---

## 18 Casos × 3 Actos

### ACTO 1: SOMBRAS (Casos 1-6)
Casos introductorios que establecen el tono y enseñan mecánicas.

| # | Caso | Descripción | Dificultad |
|---|------|-------------|------------|
| C1 | **El Asesino de Plaza Italia** | Cuerpo con símbolo oculto. Serial killer o mensaje político. | ★☆☆ |
| C2 | **La Red de Pedofilia** | Denuncia anónima. Datos encriptados necesitan descifrarse. | ★★☆ |
| C3 | **El Secuestro del Hijo del Senador** | Rescate en 48 horas. ¿Secuestro real o teatro político? | ★★☆ |
| C4 | **El Hacker que Desapareció** | Célebre cracker desaparecido. Dejó un mensaje: "Ellos están en todas partes". | ★☆☆ |
| C5 | **La Fábrica de Drogas Sintéticas** | Laboratorio clandestino en Maipú. El dueño tiene conex политика. | ★★☆ |
| C6 | **El Testigo que No Debía Existir** | Alguien vio todo. Pero oficialmente no estaba ahí. | ★★★ |

### ACTO 2: CONSPIRACIÓN (Casos 7-12)
Los casos se conectan. Una conspiración más grande emerge.

| # | Caso | Descripción | Dificultad |
|---|------|-------------|------------|
| C7 | **La Lista de los Desaparecidos** | Un HDD con nombres. Todos desaparecieron en los últimos 5 años. | ★★☆ |
| C8 | **El Fiscal Corrupto** | Evidencias de sobornos. El fiscal está muerto. | ★☆☆ |
| C9 | **Experimento LH-7** | Documentos de experimentos ilegales en civiles. ¿Quién financia? | ★★★ |
| C10 | **El Doble del Senator** | ¿El político es realmente él? Documentos indican un doble. | ★★☆ |
| C11 | **La Trampa** | El equipo es emboscado. Alguien filtró información. ¿Quién? | ★★★ |
| C12 | **El Silencio de los Cómplices** | Todos callan. Pero alguien tiene que hablar. | ★★★ |

### ACTO 3: FILTRO (Casos 13-18)
Confrontación final. El blanco no es un criminal. Es un sistema.

| # | Caso | Descripción | Dificultad |
|---|------|-------------|------------|
| C13 | **El Cuartel General** | Descubren la base de operaciones. Preparados para lo peor. | ★★★ |
| C14 | **Las Pruebas Definitivas** | Documentos que lo prueban todo. Pero están en la boca del lobo. | ★★★ |
| C15 | **El Interrogatorio** | Confrontar al líder. ¿Razones nobles o excusa para poder? | ★★★ |
| C16 | **La Huida** | Tienen 10 minutos para escapar antes de que todo se derrumbe. | ★★☆ |
| C17 | **El Juicio** | Las pruebas llegan a la justicia. Pero la justicia decide si publicarlas. | ★★★ |
| C18 | **Epílogo** | Las consecuencias de tus decisiones. ¿Valió la pena? | ★★☆ |

---

## Estructura de Cada Caso

```
CASO/
├── escenas/
│   ├── intro.md          (Recepción del caso)
│   ├── crime_scene.md    (Examinar lugar)
│   ├── dialogos/         ( NPCs y entrevistas)
│   └── clímax.md         (Confrontación final)
├── evidencias/           (Archivos, fotos, documentos)
├── pistas.yaml           (Pistas requeridas/opcionales)
└── resolution.md         (Resultado según decisiones)
```

---

## Mecánicas Técnicas

### Inventory System
```javascript
const inventory = [
    { id: 'badge', name: 'Placa PDI', icon: '🪪' },
    { id: 'linterna', name: 'Linterna UV', icon: '🔦' },
    { id: 'carnet', name: 'Carnet Fake', icon: '🪪' },
    { id: 'gps', name: 'GPS Tracker', icon: '📍' }
];
```

### Dialogue Tree
```javascript
const dialogs = {
    npc: {
        name: 'COMANDANTE',
        lines: [
            { text: 'Tienes un caso.', next: 'case_info' },
            { text: 'Ten cuidado.', next: 'warning' }
        ]
    }
};
```

### Clue System
```javascript
const clues = {
    'c1_symbol': {
        name: 'Símbolo del Triángulo',
        description: 'Triángulo invertido con un ojo. Similar a simbología ocultista.',
        required_for: ['c1_deeper'],
        solved: false
    }
};
```

---

## Visual Style

| Aspecto | Especificación |
|---------|----------------|
| **Paleta** | Negro (#0a0a0a), Cyan (#00f3ff), Rojo (#ff0055) |
| **UI** | Terminal retro, scanlines, glitch effects |
| **Tipografía** | 'Courier New' para texto, 'Orbitron' para headers |
| **Efectos** | Noise, VHS tracking, bloom sutil |

---

## Fases de Desarrollo

### Phase 1: Prototype (MVP)
- [x] HTML/JS engine básico
- [x] 1 caso completo (C1)
- [x] Sistema de diálogos
- [x] Party system (3 miembros)
- [ ] Inventory UI

### Phase 2: Expansión
- [ ] 5 casos adicionales
- [ ] Sistema de tiempo (días restantes)
- [ ] Reputación y consecuencias
- [ ] Branching paths

### Phase 3: Producción
- [ ] 18 casos completos
- [ ] Arte character portraits
- [ ] Música y sound design
- [ ] Localización (EN/ES)

---

## Tecnologías

- **Frontend:** HTML5 + Vanilla JS (portable, sin dependencias)
- **Backend (opcional):** Node.js para saved games cloud
- **Deploy:** GitHub Pages / Itch.io

---

## Links

- **Repo:** https://github.com/paulosaldivaraguilera-svg/delitos
- **Prototype:** /projects/polab/videojuegos/delitos/index.html

---

*Documento generado automáticamente*
