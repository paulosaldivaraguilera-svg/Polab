#!/usr/bin/env python3
"""
SISTEMA DE MONITOREO COMPLETO - La Unidad v2.0
Monitoreo RSS + Búsqueda Web + Alertas + Integración HTML
"""

import feedparser
import requests
from datetime import datetime, timedelta
from collections import defaultdict
import json
import re
import html
import os
import subprocess

# ============================================
# CONFIGURACIÓN DE FUENTES RSS
# ============================================

RSS_FEEDS = {
    # CHILE
    "El Siglo (Chile)": {
        "url": "https://elsiglo.cl/feed",
        "pais": "Chile",
        "orientacion": "PCCh",
        "categoria": "nacional",
        "prioridad": 3
    },
    "Radio U. Chile": {
        "url": "https://radio.uchile.cl/feed/",
        "pais": "Chile",
        "orientacion": "progresista",
        "categoria": "nacional",
        "prioridad": 2
    },
    "El Mostrador": {
        "url": "https://www.elmostrador.cl/feed/",
        "pais": "Chile",
        "orientacion": "progresista",
        "categoria": "nacional",
        "prioridad": 2
    },
    
    # LATINOAMÉRICA
    "Agencia de Prensa Latina": {
        "url": "https://www.aplnews.com/feed",
        "pais": "Latinoamérica",
        "orientacion": "antiimperialista",
        "categoria": "internacional",
        "prioridad": 3
    },
    "Telesur English": {
        "url": "https://www.telesurenglish.net/rss/",
        "pais": "Venezuela",
        "orientacion": "bolivariana",
        "categoria": "internacional",
        "prioridad": 3
    },
    
    # GLOBAL SOUTH
    "CGTN": {
        "url": "https://www.cgtn.com/rss/",
        "pais": "China",
        "orientacion": "Global South",
        "categoria": "internacional",
        "prioridad": 2
    },
    
    # PARTIDOS COMUNISTAS
    "Mundo Obrero (PC UK)": {
        "url": "https://www.mundoobrero.es/feed",
        "pais": "Reino Unido",
        "orientacion": "comunista",
        "categoria": "internacional",
        "prioridad": 2
    },
    "L'Humanité": {
        "url": "https://www.humanite.fr/rss.xml",
        "pais": "Francia",
        "orientacion": "comunista",
        "categoria": "internacional",
        "prioridad": 2
    },
    "Workers World": {
        "url": "https://www.workers.org/feed/",
        "pais": "EE.UU.",
        "orientacion": "socialista",
        "categoria": "internacional",
        "prioridad": 1
    },
    "SolidNet (PC Internacional)": {
        "url": "https://www.solidnet.org/rss.xml",
        "pais": "Internacional",
        "orientacion": "comunista",
        "categoria": "internacional",
        "prioridad": 2
    },
}

# ============================================
# PALABRAS CLAVE PARA ANÁLISIS ML
# ============================================

KEYWORDS_URGENTES = [
    "golpe", "represión", "asesinato", "desaparecid", 
    "emergencia", "crisis", "conflicto armado", "guerra",
    "masacre", "tortura", "detención", "preso político"
]

KEYWORDS_CHILE = [
    "Chile", "santiago", "chileno", "valparaíso",
    "congreso", "senado", "diputado", "gobierno",
    "pueblo", "trabajador", "huelga", "protesta",
    "pension", "salud", "educación", "vivienda"
]

KEYWORDS_CLASES = [
    "imperialismo", "capitalismo", "neoliberal",
    "oligarquía", "burguesía", "proletario",
    "trabajo", "explotación", "plusvalía",
    "desigualdad", "pobreza", "riqueza"
]

KEYWORDS_POLITICA = [
    "partido", "izquierda", "derecha", "comunista",
    "socialista", "revolución", "reforma",
    "constitución", "democracia", "dictadura"
]

# ============================================
# CLASES DE ANÁLISIS
# ============================================

class MonitorCompleto:
    def __init__(self):
        self.noticias = []
        self.alertas = []
        self.estadisticas = {
            "total_noticias": 0,
            "por_pais": defaultdict(int),
            "por_orientacion": defaultdict(int),
            "por_categoria": defaultdict(int),
            "urgentes": 0
        }
    
    def fetch_feed(self, nombre, fuente):
        """Obtiene las noticias de un feed RSS"""
        try:
            print(f"📡 Conectando a {nombre}...")
            feed = feedparser.parse(fuente["url"])
            
            count = 0
            for entry in feed.entries[:15]:  # Últimas 15 noticias
                titulo = entry.get("title", "")
                resumen = entry.get("summary", "")[:800]
                publicado = entry.get("published", "")
                
                # Limpiar HTML del resumen
                resumen_limpio = re.sub('<[^<]+?>', '', resumen)
                resumen_limpio = html.unescape(resumen_limpio).strip()
                
                noticia = {
                    "fuente": nombre,
                    "pais": fuente["pais"],
                    "orientacion": fuente["orientacion"],
                    "categoria": fuente["categoria"],
                    "prioridad_base": fuente["prioridad"],
                    "titulo": titulo,
                    "link": entry.get("link", ""),
                    "publicado": publicado,
                    "resumen": resumen_limpio,
                    "timestamp": datetime.now().isoformat(),
                    "urgente": False,
                    "tags": []
                }
                
                self.noticias.append(noticia)
                count += 1
            
            print(f"   ✅ {count} noticias procesadas")
            return True
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def analizar_noticia(self, noticia):
        """Analiza una noticia desde perspectiva ML"""
        texto = (noticia["titulo"] + " " + noticia["resumen"]).lower()
        
        # Detectar urgencia
        for kw in KEYWORDS_URGENTES:
            if kw in texto:
                noticia["urgente"] = True
                noticia["tags"].append("URGENTE")
                break
        
        # Detectar Chile
        score_chile = sum(1 for kw in KEYWORDS_CHILE if kw in texto)
        if score_chile >= 2:
            noticia["tags"].append("CHILE")
        
        # Detectar análisis de clases
        if any(kw in texto for kw in KEYWORDS_CLASES):
            if "CLASES" not in noticia["tags"]:
                noticia["tags"].append("CLASES")
        
        # Detectar política
        if any(kw in texto for kw in KEYWORDS_POLITICA):
            if "POLITICA" not in noticia["tags"]:
                noticia["tags"].append("POLITICA")
        
        # Calcular prioridad final
        prioridad = noticia["prioridad_base"]
        if noticia["urgente"]:
            prioridad += 2
        if "CHILE" in noticia["tags"]:
            prioridad += 1
        if "CLASES" in noticia["tags"]:
            prioridad += 1
        
        noticia["prioridad_final"] = min(prioridad, 5)  # Máximo 5
        noticia["nivel"] = self.get_nivel(prioridad)
        
        return noticia
    
    def get_nivel(self, prioridad):
        if prioridad >= 4:
            return "urgente"
        elif prioridad >= 3:
            return "alta"
        elif prioridad >= 2:
            return "media"
        else:
            return "baja"
    
    def generar_reporte(self):
        """Genera reporte completo"""
        # Analizar todas las noticias
        for noticia in self.noticias:
            self.analizar_noticia(noticia)
        
        # Actualizar estadísticas
        self.estadisticas["total_noticias"] = len(self.noticias)
        for n in self.noticias:
            self.estadisticas["por_pais"][n["pais"]] += 1
            self.estadisticas["por_orientacion"][n["orientacion"]] += 1
            self.estadisticas["por_categoria"][n["categoria"]] += 1
            if n["urgente"]:
                self.estadisticas["urgentes"] += 1
        
        # Separar alertas urgentes
        self.alertas = [n for n in self.noticias if n["urgente"]]
        
        # Ordenar por prioridad
        self.noticias.sort(key=lambda x: (-x["prioridad_final"], -x["prioridad_base"]))
        
        return self.generar_html()
    
    def generar_html(self):
        """Genera HTML integrable"""
        fecha = datetime.now().strftime("%Y-%m-%d %H:%M")
        total = self.estadisticas["total_noticias"]
        urgentes = self.estadisticas["urgentes"]
        
        html_alertas = ""
        if self.alertas:
            html_alertas = f'''
            <div class="mb-8">
                <h3 class="text-red-600 font-bold text-xl mb-4 flex items-center gap-2">
                    <i data-lucide="alert-triangle" class="w-6 h-6"></i> ALERTAS URGENTES ({len(self.alertas)})
                </h3>
                <div class="grid grid-cols-1 gap-4">
            '''
            for n in self.alertas[:5]:
                html_alertas += f'''
                <div class="bg-red-900/30 border border-red-600 p-4 rounded-lg hover:bg-red-900/50 transition cursor-pointer" onclick="window.open('{n['link']}', '_blank')">
                    <div class="flex items-start justify-between">
                        <span class="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">{n['fuente']}</span>
                        <span class="text-xs text-gray-400">{n['pais']}</span>
                    </div>
                    <h4 class="font-bold text-white mt-2 hover:underline">{n['titulo']}</h4>
                    <p class="text-gray-300 text-sm mt-1 line-clamp-2">{n['resumen'][:150]}...</p>
                </div>
            '''
            html_alertas += "</div></div>"
        
        # Propuestas por nivel
        html_propuestas = ""
        for nivel, titulo in [("urgente", "🔥 URGENTE"), ("alta", "📰 ALTA PRIORIDAD"), ("media", "📋 MEDIA PRIORIDAD")]:
            filtradas = [n for n in self.noticias if n["nivel"] == nivel and not n["urgente"]]
            if filtradas:
                html_propuestas += f'''
                <div class="mb-6">
                    <h3 class="text-lg font-bold mb-3 flex items-center gap-2">{titulo}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                '''
                for n in filtradas[:6]:
                    tags = " ".join([f'<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">{t}</span>' for t in n["tags"][:3]])
                    html_propuestas += f'''
                    <div class="pauta-card bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer border-l-4 {'border-red-600' if nivel=='urgente' else 'border-yellow-500' if nivel=='alta' else 'border-blue-500'}" onclick="window.open('{n['link']}', '_blank')">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-cyan-400">{n['fuente']}</span>
                            <span class="text-xs text-gray-500">{n['pais']}</span>
                        </div>
                        <h4 class="font-bold text-white text-sm hover:underline">{n['titulo'][:80]}...</h4>
                        <div class="mt-2">{tags}</div>
                    </div>
                '''
                html_propuestas += "</div></div>"
        
        # Resumen por fuente
        html_fuentes = ""
        por_fuente = defaultdict(list)
        for n in self.noticias:
            por_fuente[n["fuente"]].append(n)
        
        html_fuentes = '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">'
        for fuente, noticias in sorted(por_fuente.items(), key=lambda x: -len(x[1])):
            html_fuentes += f'''
            <div class="bg-gray-800 p-3 rounded text-center">
                <div class="text-2xl font-bold text-cyan-400">{len(noticias)}</div>
                <div class="text-xs text-gray-400 truncate">{fuente}</div>
            </div>
            '''
        html_fuentes += "</div>"
        
        return f'''
<!-- REPORTE DE MONITOREO - La Unidad -->
<!-- Generado: {fecha} -->
<!-- Total noticias: {total} | Urgentes: {urgentes} -->

<div class="reporte-monitor">
    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-900 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-cyan-400">{total}</div>
            <div class="text-xs text-gray-400">Noticias procesadas</div>
        </div>
        <div class="bg-red-900/50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-red-500">{urgentes}</div>
            <div class="text-xs text-gray-400">Alertas urgentes</div>
        </div>
        <div class="bg-gray-900 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-green-400">{len(por_fuente)}</div>
            <div class="text-xs text-gray-400">Fuentes activas</div>
        </div>
        <div class="bg-gray-900 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-yellow-400">{len([n for n in self.noticias if 'CLASES' in n['tags']])}</div>
            <div class="text-xs text-gray-400">Análisis de clases</div>
        </div>
    </div>
    
    {html_alertas}
    
    <!-- Propuestas por nivel -->
    {html_propuestas}
    
    <!-- Resumen por fuente -->
    <div class="mt-8 pt-6 border-t border-gray-700">
        <h3 class="text-lg font-bold mb-4">📡 Noticias por Fuente</h3>
        {html_fuentes}
    </div>
</div>
'''
    
    def guardar_reporte(self):
        """Guarda el reporte en archivo"""
        html = self.generar_reporte()
        fecha = datetime.now().strftime("%Y-%m-%d")
        output_file = f"/home/pi/.openclaw/workspace/projects/polab/la-unidad/pauta/reporte_{fecha}.html"
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(html)
        
        print(f"\n💾 Reporte guardado: {output_file}")
        return output_file


def main():
    print("=" * 60)
    print("📰 SISTEMA DE MONITOREO COMPLETO - La Unidad v2.0")
    print("=" * 60)
    print(f"⏰ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()
    
    monitor = MonitorCompleto()
    
    # Fetch de todas las fuentes
    print("🔍 Monitoreando fuentes RSS...\n")
    for nombre, fuente in RSS_FEEDS.items():
        monitor.fetch_feed(nombre, fuente)
    
    # Generar y guardar reporte
    output = monitor.guardar_reporte()
    
    # Resumen
    print(f"\n✅ Total de noticias: {monitor.estadisticas['total_noticias']}")
    print(f"🚨 Alertas urgentes: {monitor.estadisticas['urgentes']}")
    print(f"📡 Fuentes activas: {len(set(n['fuente'] for n in monitor.noticias))}")
    
    # Top 5 urgentes
    print(f"\n🔥 TOP 5 PARA LA PAUTA:")
    for i, n in enumerate(monitor.noticias[:5], 1):
        print(f"   {i}. [{n['nivel'].upper()}] {n['titulo'][:60]}...")
    
    return monitor


if __name__ == "__main__":
    main()
