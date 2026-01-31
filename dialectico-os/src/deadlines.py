# Dialéctico OS - Motor de Plazos Chilenos
# =========================================

from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from typing import List, Optional, Tuple
import calendar

# ============ CONSTANTES ============

# Días месяца (para cálculos)
ENERO = 1
FEBRERO = 2
MARZO = 3
ABRIL = 4
MAYO = 5
JUNIO = 6
JULIO = 7
AGOSTO = 8
SEPTIEMBRE = 9
OCTUBRE = 10
NOVIEMBRE = 11
DICIEMBRE = 12

# ============ FERIADOS CHILENOS 2025-2026 ============

# Feriados legales actuales (Ley 19788)
FERIADOS_LEGALES = {
    # 2025
    date(2025, 1, 1): "Año Nuevo",
    date(2025, 4, 18): "Viernes Santo",
    date(2025, 4, 19): "Sábado Santo",
    date(2025, 5, 1): "Día del Trabajo",
    date(2025, 5, 21): "Glorias Navales",
    date(2025, 6, 8): "Asunción de la Virgen",
    date(2025, 6, 9): "Asunción de la Virgen (compensado)",
    date(2025, 7, 16): "Virgen del Carmen",
    date(2025, 8, 15): "Asunción de la Virgen",
    date(2025, 9, 18): "Fiestas Patrias",
    date(2025, 9, 19): "Glorias del Ejército",
    date(2025, 9, 20): "Feriado bancario",
    date(2025, 10, 31): "Día de las Iglesias Evangélicas",
    date(2025, 11, 1): "Todos los Santos",
    date(2025, 12, 8): "Inmaculada Concepción",
    date(2025, 12, 25): "Navidad",
    date(2025, 12, 31): "Feriado bancario",
    
    # 2026
    date(2026, 1, 1): "Año Nuevo",
    date(2026, 4, 3): "Viernes Santo",
    date(2026, 4, 4): "Sábado Santo",
    date(2026, 5, 1): "Día del Trabajo",
    date(2026, 5, 21): "Glorias Navales",
    date(2026, 6, 21): "Asunción de la Virgen",
    date(2026, 7, 16): "Virgen del Carmen",
    date(2026, 8, 15): "Asunción de la Virgen",
    date(2026, 9, 18): "Fiestas Patrias",
    date(2026, 9, 19): "Glorias del Ejército",
    date(2026, 10, 31): "Día de las Iglesias Evangélicas",
    date(2026, 11, 1): "Todos los Santos",
    date(2026, 12, 8): "Inmaculada Concepción",
    date(2026, 12, 25): "Navidad",
}

# Feriados con法律规定移动 (pactos administrativos)
FECHAS_MOVIBLES = [
    # Regla: Si cae martes, se anticipa al lunes
    # Si cae miércoles o jueves, se posterga al lunes siguiente
]

# ============ CLASE PRINCIPAL ============

class CalendarioChileno:
    """
    Manejador del calendario chileno para cálculo de plazos.
    
    Características:
    - Días corridos vs días hábiles
    - Feriados nacionales y regionales
    - Suspensión de plazos
    - Compensación de fines de semana
    """
    
    def __init__(self, feriados: dict = None, incluir_regionales: bool = True):
        """
        Inicializar calendario.
        
        Args:
            feriados: Dict de feriados {fecha: nombre}
            incluir_regionales: Incluir feriados regionales
        """
        self.feriados = feriados or FERIADOS_LEGALES.copy()
        self.incluir_regionales = incluir_regionales
    
    def es_feriado(self, fecha: date) -> bool:
        """Verificar si una fecha es feriado"""
        return fecha in self.feriados
    
    def es_fin_de_semana(self, fecha: date) -> bool:
        """Verificar si es sábado o domingo"""
        return fecha.weekday() >= 5  # 5=sábado, 6=domingo
    
    def es_habil(self, fecha: date) -> bool:
        """Verificar si es día hábil (no feriado ni fin de semana)"""
        return not self.es_feriado(fecha) and not self.es_fin_de_semana(fecha)
    
    def siguiente_dia_habil(self, fecha: date) -> date:
        """Obtener el siguiente día hábil"""
        siguiente = fecha + timedelta(days=1)
        while not self.es_habil(siguiente):
            siguiente += timedelta(days=1)
        return siguiente
    
    def anterior_dia_habil(self, fecha: date) -> date:
        """Obtener el día hábil anterior"""
        anterior = fecha - timedelta(days=1)
        while not self.es_habil(anterior):
            anterior -= timedelta(days=1)
        return anterior
    
    def dias_habiles_entre(self, inicio: date, fin: date) -> int:
        """
        Contar días hábiles entre dos fechas (inclusive).
        
        Args:
            inicio: Fecha de inicio
            fin: Fecha de fin
            
        Returns:
            Número de días hábiles
        """
        if inicio > fin:
            return 0
        
        dias = 0
        actual = inicio
        while actual <= fin:
            if self.es_habil(actual):
                dias += 1
            actual += timedelta(days=1)
        return dias
    
    def calcular_vencimiento(
        self,
        fecha_inicio: date,
        dias: int,
        tipo: str = 'habil',
        suspendido: bool = False,
        dias_suspension: int = 0
    ) -> date:
        """
        Calcular fecha de vencimiento de un plazo.
        
        Args:
            fecha_inicio: Fecha de inicio del plazo
            dias: Número de días del plazo
            tipo: 'corrido' | 'habil' | 'judicial'
            suspendido: Si el plazo está suspendido
            dias_suspension: Días de suspensión
            
        Returns:
            Fecha de vencimiento
        """
        if suspendido:
            dias += dias_suspension
        
        if tipo == 'corrido':
            # Días corridos: todos los días cuentan
            return fecha_inicio + timedelta(days=dias)
        
        elif tipo == 'habil':
            # Días hábiles: solo días no festivos ni fines de semana
            return self._calcular_dias_habiles(fecha_inicio, dias)
        
        elif tipo == 'judicial':
            # Días judiciales: como hábiles pero excluye más días
            return self._calcular_dias_judiciales(fecha_inicio, dias)
        
        else:
            raise ValueError(f"Tipo de plazo desconocido: {tipo}")
    
    def _calcular_dias_habiles(self, inicio: date, dias: int) -> date:
        """Calcular fecha sumando días hábiles"""
        actual = inicio
        dias_restantes = dias
        
        while dias_restantes > 0:
            actual += timedelta(days=1)
            if self.es_habil(actual):
                dias_restantes -= 1
        
        return actual
    
    def _calcular_dias_judiciales(self, inicio: date, dias: int) -> date:
        """
        Calcular fecha sumando días judiciales.
        Incluye sábados en algunos casos según legislación.
        """
        actual = inicio
        dias_restantes = dias
        
        while dias_restantes > 0:
            actual += timedelta(days=1)
            # Días judiciales excluyen domingos y feriados
            if actual.weekday() != 6 and not self.es_feriado(actual):
                dias_restantes -= 1
        
        return actual
    
    def agregar_feriado(self, fecha: date, nombre: str, tipo: str = 'nacional'):
        """Agregar un feriado personalizado"""
        self.feriados[fecha] = nombre
    
    def remover_feriado(self, fecha: date):
        """Remover un feriado"""
        if fecha in self.feriados:
            del self.feriados[fecha]
    
    def listar_feriados(self, año: int) -> List[Tuple[date, str]]:
        """Listar feriados de un año"""
        return [
            (f, n) for f, n in self.feriados.items()
            if f.year == año
        ]
    
    def proximo_feriado(self, desde: date = None) -> Optional[Tuple[date, str]]:
        """Obtener el próximo feriado"""
        desde = desde or date.today()
        feriados_futuros = [
            (f, n) for f, n in self.feriados.items()
            if f >= desde
        ]
        if feriados_futuros:
            return min(feriados_futuros, key=lambda x: x[0])
        return None
    
    def dias_hasta_feriado(self, nombre: str = None) -> Optional[int]:
        """Días hasta el próximo feriado o uno específico"""
        desde = date.today()
        if nombre:
            for f, n in self.feriados.items():
                if n == nombre and f >= desde:
                    return (f - desde).days
            return None
        proximo = self.proximo_feriado()
        if proximo:
            return (proximo[0] - desde).days
        return None


# ============ PLAZOS ESPECIALES ============

class PlazosEspeciales:
    """Plazos especiales del derecho chileno"""
    
    @staticmethod
    def plazo_demanda_familia(dias: int = None) -> int:
        """Plazo para interponer demanda de familia (art. 55 LPF)"""
        return dias or 30  # 30 días hábiles desde la notificación
    
    @staticmethod
    def plazo_apelacion_civil() -> int:
        """Plazo para apelación en proceso civil"""
        return 10  # 10 días hábiles
    
    @staticmethod
    def plazo_casacion() -> int:
        """Plazo para recurso de casación"""
        return 15  # 15 días hábiles
    
    @staticmethod
    def plazo_posesion_efectiva() -> int:
        """Plazo para tramitar posesión efectiva"""
        return None  # No hay plazo legal, pero hay práctica habitual
    
    @staticmethod
    def plazo_respuesta_civil() -> int:
        """Plazo para contestar demanda civil"""
        return 10  # 10 días hábiles
    
    @staticmethod
    def plazo_pension_alimentos() -> int:
        """Plazo para iniciar ejecución de pensión"""
        return None  # La deuda prescribe en 5 años


# ============ UTILIDADES ============

def dias_por_mes(año: int, mes: int) -> int:
    """Días de un mes específico"""
    return calendar.monthrange(año, mes)[1]

def primer_dia_mes(fecha: date) -> date:
    """Primer día del mes"""
    return fecha.replace(day=1)

def ultimo_dia_mes(fecha: date) -> date:
    """Último día del mes"""
    return date(fecha.year, fecha.month, calendar.monthrange(fecha.year, fecha.month)[1])

def meses_entre(inicio: date, fin: date) -> int:
    """Meses completos entre dos fechas"""
    return (fin.year - inicio.year) * 12 + fin.month - inicio.month

def trimestres_entre(inicio: date, fin: date) -> int:
    """Trimestres entre dos fechas"""
    return meses_entre(inicio, fin) // 3


# ============ EJEMPLO DE USO ============

if __name__ == '__main__':
    cal = CalendarioChileno()
    
    print("=== Calendario Chileno Demo ===\n")
    
    # Hoy
    hoy = date.today()
    print(f"Hoy: {hoy}")
    
    # Verificar si es hábil
    print(f"¿Es día hábil? {cal.es_habil(hoy)}")
    
    # Proximo feriado
    proximo = cal.proximo_feriado()
    if proximo:
        print(f"Próximo feriado: {proximo[1]} el {proximo[0]}")
        print(f"Días hasta entonces: {cal.dias_hasta_feriado()}")
    
    # Calcular vencimiento
    vencimiento = cal.calcular_vencimiento(hoy, 10, tipo='habil')
    print(f"\nPlazo de 10 días hábiles desde hoy:")
    print(f"Vence: {vencimiento}")
    
    # Comparar corridos vs hábiles
    corrido = cal.calcular_vencimiento(hoy, 10, tipo='corrido')
    print(f"\n10 días corridos: {corrido}")
    print(f"Diferencia: {(vencimiento - corrido).days} días")
