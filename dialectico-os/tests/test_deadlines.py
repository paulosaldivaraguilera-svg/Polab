# Dialéctico OS - Tests del Motor de Plazos
# ==========================================

import pytest
from datetime import date, timedelta
from src.deadlines import CalendarioChileno, PlazosEspeciales

@pytest.fixture
def calendario():
    """Calendario de prueba"""
    return CalendarioChileno()

class TestCalendarioChileno:
    
    def test_es_feriado(self, calendario):
        """Verificar detección de feriados"""
        assert calendario.es_feriado(date(2025, 1, 1)) == True  # Año Nuevo
        assert calendario.es_feriado(date(2025, 9, 18)) == True  # Fiestas Patrias
        assert calendario.es_feriado(date(2025, 6, 15)) == False
    
    def test_es_fin_de_semana(self, calendario):
        """Verificar detección de fines de semana"""
        assert calendario.es_fin_de_semana(date(2025, 1, 4)) == True  # Sábado
        assert calendario.es_fin_de_semana(date(2025, 1, 5)) == True  # Domingo
        assert calendario.es_fin_de_semana(date(2025, 1, 6)) == False  # Lunes
    
    def test_es_habil(self, calendario):
        """Verificar días hábiles"""
        # Lunes normal
        assert calendario.es_habil(date(2025, 1, 6)) == True
        # Sábado
        assert calendario.es_habil(date(2025, 1, 4)) == False
        # Feriado
        assert calendario.es_habil(date(2025, 1, 1)) == False
    
    def test_dias_habiles_entre(self, calendario):
        """Contar días hábiles entre fechas"""
        # Una semana completa (lunes a domingo)
        inicio = date(2025, 1, 6)  # Lunes
        fin = date(2025, 1, 12)    # Domingo
        
        dias = calendario.dias_habiles_entre(inicio, fin)
        assert dias == 5  # Lunes a viernes
        
        # Incluir un feriado
        inicio = date(2025, 9, 15)  # Lunes antes de Fiestas Patrias
        fin = date(2025, 9, 21)     # Domingo después
        
        dias = calendario.dias_habiles_entre(inicio, fin)
        # Debe descontar los feriados (18 y 19)
        assert dias < 7
    
    def test_calcular_vencimiento_corrido(self, calendario):
        """Calcular vencimiento en días corridos"""
        inicio = date(2025, 1, 1)
        
        # 10 días corridos
        vencimiento = calendario.calcular_vencimiento(inicio, 10, tipo='corrido')
        assert vencimiento == date(2025, 1, 11)
    
    def test_calcular_vencimiento_habil(self, calendario):
        """Calcular vencimiento en días hábiles"""
        inicio = date(2025, 1, 6)  # Lunes
        
        # 10 días hábiles
        vencimiento = calendario.calcular_vencimiento(inicio, 10, tipo='habil')
        
        # Debe caer aproximadamente 2 semanas después
        diferencia = (vencimiento - inicio).days
        assert diferencia > 10  # Más de 10 porque hay fines de semana
    
    def test_siguiente_dia_habil(self, calendario):
        """Encontrar siguiente día hábil"""
        # Sábado -> Lunes
        sabado = date(2025, 1, 4)
        assert calendario.siguiente_dia_habil(sabado) == date(2025, 1, 6)
        
        # Domingo -> Lunes
        domingo = date(2025, 1, 5)
        assert calendario.siguiente_dia_habil(domingo) == date(2025, 1, 6)
        
        # Feriado (Año Nuevo) -> Martes
        year_nuevo = date(2025, 1, 1)
        assert calendario.siguiente_dia_habil(year_nuevo) == date(2025, 1, 2)
    
    def test_proximo_feriado(self, calendario):
        """Encontrar próximo feriado"""
        desde = date(2025, 1, 2)
        proximo = calendario.proximo_feriado(desde)
        
        if proximo:
            fecha, nombre = proximo
            assert fecha >= desde
            assert nombre is not None
    
    def test_feriados_2025(self, calendario):
        """Verificar feriados del año"""
        feriados_2025 = calendario.listar_feriados(2025)
        
        # Debe haber varios feriados
        assert len(feriados_2025) >= 15
        
        # Verificar algunos específicos
        fechas = [f[0] for f in feriados_2025]
        assert date(2025, 1, 1) in fechas  # Año Nuevo
        assert date(2025, 9, 18) in fechas  # Fiestas Patrias
        assert date(2025, 12, 25) in fechas  # Navidad


class TestPlazosEspeciales:
    
    def test_plazo_apelacion_civil(self):
        """Plazo de apelación en civil"""
        assert PlazosEspeciales.plazo_apelacion_civil() == 10
    
    def test_plazo_respuesta_civil(self):
        """Plazo para contestar demanda civil"""
        assert PlazosEspeciales.plazo_respuesta_civil() == 10
    
    def test_plazo_casacion(self):
        """Plazo de casación"""
        assert PlazosEspeciales.plazo_casacion() == 15


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
