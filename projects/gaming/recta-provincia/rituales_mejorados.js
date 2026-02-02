/*
 * Reta Provincia - Rituales v2.0
 * Rituales expandidos con efectos especiales
 */

const RITUALES_V2 = [
    {
        nombre: "El Rosario del Campesino",
        costo: 50,
        efecto: "cura_tierra",
        descripcion: "Reza 3 avemarias por los caídos",
        recompensas: {xp: 25, fertilizante: 5}
    },
    {
        nombre: "El Pacto del Minero",
        costo: 100,
        efecto: "fortaleza_profundidad",
        descripcion: "Ofrece una piedra de carbón a la montaña",
        recompensas: {xp: 50, resistencia: 2}
    },
    {
        nombre: "La Sinfónica del Fábrica",
        costo: 200,
        efecto: "union_obrera",
        descripcion: "Canta La Internacional en voz alta",
        recompensas: {xp: 100, produccion: 10}
    },
    {
        nombre: "El Voto del Mapuche",
        costo: 150,
        efecto: "proteccion_ancestral",
        descripcion: "Honra a tus ancestros con tierra nueva",
        recompensas: {xp: 75, suerte: 3}
    },
    {
        nombre: "El Banquete del Pueblo",
        costo: 500,
        efecto: "abundancia_colectiva",
        descripcion: "Comparte tu cosecha con la comunidad",
        recompensas: {xp: 200, creditos: 100}
    }
];

class RitualSystem {
    constructor() {
        this.rituales = RITUALES_V2;
        this.rituales_desbloqueados = JSON.parse(localStorage.getItem('rituales_desbloqueados') || '[]');
    }
    
    desbloquear(ritualNombre) {
        if (!this.rituales_desbloqueados.includes(ritualNombre)) {
            this.rituales_desbloqueados.push(ritualNombre);
            localStorage.setItem('rituales_desbloqueados', JSON.stringify(this.rituales_desbloqueados));
            return true;
        }
        return false;
    }
    
    getRituales() {
        return this.rituales.filter(r => this.rituales_desbloqueados.includes(r.nombre) || r.costo === 0);
    }
    
    ejecutar(ritualNombre, jugador) {
        const ritual = this.rituales.find(r => r.nombre === ritualNombre);
        if (!ritual) return {success: false, mensaje: "Ritual no encontrado"};
        
        if (jugador.fertilizante < ritual.costo) {
            return {success: false, mensaje: "No tienes suficientes recursos"};
        }
        
        jugador.fertilizante -= ritual.costo;
        Object.assign(jugador, ritual.recompensas);
        
        return {success: true, mensaje: `¡Ritual ${ritual.nombre} completado!`, recompensas: ritual.recompensas};
    }
}

window.RitualSystem = RitualSystem;
console.log("✅ Rituales v2.0 cargados");
