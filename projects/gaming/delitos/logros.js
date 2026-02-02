/*
 * Delitos - Sistema de Logros v1.0
 */

const LOGROS_DELITOS = [
    {id: 'caso_1', nombre: "El Detective Novato", condicion: (s) => s.casos_resueltos >= 1, recompensa: {xp: 100}},
    {id: 'caso_5', nombre: "Investigador Experto", condicion: (s) => s.casos_resueltos >= 5, recompensa: {xp: 500}},
    {id: 'todos', nombre: "El Sherlock Chileno", condicion: (s) => s.casos_resueltos >= 6, recompensa: {xp: 1000}},
    {id: 'tiempo', nombre: "Rayo Mcqueen", condicion: (s) => s.tiempo_minimo <= 300, recompensa: {xp: 300}},
    {id: 'cooperativo', nombre: "Equipo Perfecto", condicion: (s) => s.ayudas >= 1, recompensa: {xp: 200}},
    {id: 'sin_pistas', nombre: "Ojo de Halcón", condicion: (s) => s.pistas_usadas === 0, recompensa: {xp: 400}},
    {id: 'racha', nombre: "En Racha", condicion: (s) => s.racha >= 3, recompensa: {xp: 350}},
    {id: 'deducciones', nombre: "Maestro Deducción", condicion: (s) => s.deducciones_correctas >= 10, recompensa: {xp: 600}}
];

class LogrosSystem {
    constructor() {
        this.logros = LOGROS_DELITOS;
        this.desbloqueados = JSON.parse(localStorage.getItem('logros_delitos') || '[]');
    }
    checkLogros(stats) {
        const nuevos = [];
        for (const l of this.logros) {
            if (!this.desbloqueados.includes(l.id) && l.condicion(stats)) {
                this.desbloqueados.push(l.id);
                nuevos.push(l);
            }
        }
        if (nuevos.length) localStorage.setItem('logros_delitos', JSON.stringify(this.desbloqueados));
        return nuevos;
    }
}
window.LogrosDelitos = LogrosSystem;
console.log("✅ Logros Delitos v1.0 cargado");
