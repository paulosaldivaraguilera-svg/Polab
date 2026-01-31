#!/usr/bin/env python3
"""
SEO Tracker para paulosaldivar.cv
==================================
Monitorea posicionamiento en Google para palabras clave jurídicas.

Uso:
    python3 seo_tracker.py track       # Verificar posiciones actuales
    python3 seo_tracker.py report      # Generar reporte de mejoras
    python3 seo_tracker.py keywords    # Ver palabras clave
"""

import sqlite3
import json
import time
from datetime import datetime, timedelta
import re

DB_PATH = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/db/leads.db'

# Palabras clave objetivo (para Chile)
KEYWORDS = {
    'alta_prioridad': [
        'abogado temuco',
        'abogado familia temuco',
        'abogado herencia chile',
        'abogado online chile',
        'derecho familia chile',
        'posesion efectiva temuco',
    ],
    'media_prioridad': [
        'abogado laboral',
        'abogado civil',
        'abogado divorce',
        'testamento chile',
        'pensiones alimentos',
        'asesoria legal online',
    ],
    'larga_cola': [
        'abogado economico temuco',
        'consulta juridica online',
        'como constituir empresa chile',
        'spa chile requisitos',
        'abogado marxista chile',
    ]
}

# Tu sitio
TARGET_SITE = 'paulosaldivar.cv'

def init_seo_db():
    """Inicializa tabla de SEO tracking"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS seo_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword TEXT,
        posicion INTEGER,
        fecha DATE,
        fuente TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS seo_auditorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE,
        page TEXT,
        issue TEXT,
        severity TEXT,
        status TEXT DEFAULT 'pending'
    )''')
    
    conn.commit()
    conn.close()

def generate_seo_audit():
    """Genera auditoria SEO de la página"""
    
    print("\n" + "="*60)
    print("🔍 AUDITORÍA SEO - paulosaldivar.cv")
    print("="*60 + "\n")
    
    issues = []
    
    # Verificar elementos básicos del HTML
    try:
        from urllib.request import urlopen
        from urllib.error import URLError
        
        response = urlopen(f'https://{TARGET_SITE}', timeout=10)
        html = response.read().decode('utf-8', errors='ignore')
        
        # Title tag
        title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
        if title_match:
            title = title_match.group(1)
            print(f"✅ Title: {title}")
            if len(title) < 30:
                issues.append(('Title muy corto', 'media', 'https://paulosaldivar.cv'))
            elif len(title) > 60:
                issues.append(('Title muy largo', 'media', 'https://paulosaldivar.cv'))
        else:
            print("❌ Sin title tag")
            issues.append(('Sin title tag', 'alta', 'https://paulosaldivar.cv'))
        
        # Meta description
        desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if desc_match:
            desc = desc_match.group(1)
            print(f"✅ Meta description: {desc[:60]}...")
            if len(desc) < 120:
                issues.append(('Meta description corta', 'media', 'https://paulosaldivar.cv'))
        else:
            print("❌ Sin meta description")
            issues.append(('Sin meta description', 'alta', 'https://paulosaldivar.cv'))
        
        # H1 tags
        h1_count = len(re.findall(r'<h1[^>]*>', html, re.IGNORECASE))
        print(f"✅ H1 tags: {h1_count}")
        if h1_count == 0:
            issues.append(('Sin H1', 'alta', 'https://paulosaldivar.cv'))
        elif h1_count > 1:
            issues.append(('Múltiples H1', 'media', 'https://paulosaldivar.cv'))
        
        # Verificar HTTPS
        if TARGET_SITE.startswith('https://'):
            print("✅ HTTPS habilitado")
        else:
            issues.append(('Sin HTTPS', 'critica', f'https://{TARGET_SITE}'))
        
        # Velocidad (simulada - no tenemos acceso real)
        print("⚠️  Velocidad: Requiere Lighthouse para medir")
        
    except URLError:
        print(f"❌ No se pudo acceder a {TARGET_SITE}")
        issues.append(('Sitio no accesible', 'critica', TARGET_SITE))
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Guardar issues en BD
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('DELETE FROM seo_auditorias WHERE status=\'pending\'')
    
    for issue, severity, page in issues:
        c.execute('INSERT INTO seo_auditorias (fecha, page, issue, severity) VALUES (?,?,?,?)',
                  (datetime.now().strftime('%Y-%m-%d'), page, issue, severity))
    
    conn.commit()
    conn.close()
    
    # Mostrar issues
    print("\n📋 ISSUES ENCONTRADOS:")
    print("-" * 40)
    
    for issue, severity, _ in issues:
        emoji = '🔴' if severity == 'critica' else ('🟡' if severity == 'alta' else '🟢')
        print(f"  {emoji} [{severity.upper()}] {issue}")
    
    if not issues:
        print("  🎉 ¡Sin issues críticos!")
    
    return issues

def show_keywords():
    """Muestra palabras clave objetivo"""
    print("\n🎯 PALABRAS CLAVE OBJETIVO")
    print("="*40)
    
    for priority, kws in KEYWORDS.items():
        print(f"\n{priority.upper()}:")
        for kw in kws:
            print(f"  • {kw}")
    
    print(f"\n📊 Total: {sum(len(v) for v in KEYWORDS.values())} keywords")

def track_rankings():
    """Simula tracking de rankings (requiere API externa para real)"""
    print("\n📈 RASTREO DE POSICIONES")
    print("="*40)
    print("""
⚠️  NOTA: El rastreo real de Google requiere API externa (SerpAPI, etc.)

Lo que PUEDO hacer ahora:
1. Generar metadata correcta para tu sitio
2. Crear sitemap.xml
3. Generar robots.txt optimizado
4. Sugerir mejoras de contenido

Lo que NECESITAS para tracking real:
- API key de SerpAPI ($50/mes) o similar
- O usar Google Search Console (gratis)
""")
    
    # Generar recomendaciones
    print("\n📋 RECOMENDACIONES INMEDIATAS:")
    print("-"*40)
    print("""
1. METADATA - Generar para cada página:
   - Title: "Abogado Temuco | Paulo Saldivar - Derecho Familia y Civil"
   - Description: "Abogado en Temuco con experiencia en familia, herencia y derecho civil. Atención presencial y online. Contacto: WhatsApp"

2. CONTENIDO - Agregar a paulosaldivar.cv:
   - Blog con artículos sobre temas jurídicos
   - FAQs con palabras clave
   - Páginas específicas por servicio

3. TÉCNICO:
   - Generar sitemap.xml
   - Submitir a Google Search Console
   - Mejorar velocidad de carga

4. BACKLINKS:
   - Directorios jurídicos chilenos
   - LinkedIn Company Page
   - Directorios locales Temuco
""")

def generate_sitemap():
    """Genera sitemap.xml básico"""
    sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://paulosaldivar.cv/</loc>
      <lastmod>2026-01-31</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://paulosaldivar.cv/#derecho-familia</loc>
      <lastmod>2026-01-31</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
   <url>
      <loc>https://paulosaldivar.cv/#herencias</loc>
      <lastmod>2026-01-31</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
   <url>
      <loc>https://paulosaldivar.cv/#contacto</loc>
      <lastmod>2026-01-31</lastmod>
      <changefreq>yearly</changefreq>
      <priority>0.5</priority>
   </url>
</urlset>'''
    
    with open('/home/pi/.openclaw/workspace/proyectos-paulo/web-personal/sitemap.xml', 'w') as f:
        f.write(sitemap)
    
    print("✅ Sitemap generado: proyectos-paulo/web-personal/sitemap.xml")

def generate_robots():
    """Genera robots.txt optimizado"""
    robots = '''User-agent: *
Allow: /

Sitemap: https://paulosaldivar.cv/sitemap.xml

# Bloquear páginas no necesarias
Disallow: /cgi-bin/
Disallow: /wp-admin/
Disallow: /wp-json/
Disallow: /xmlrpc.php

# Canonical
Host: paulosaldivar.cv
'''
    
    with open('/home/pi/.openclaw/workspace/proyectos-paulo/web-personal/robots.txt', 'w') as f:
        f.write(robots)
    
    print("✅ Robots.txt generado: proyectos-paulo/web-personal/robots.txt")

def generate_meta_tags():
    """Genera meta tags para páginas específicas"""
    
    meta_tags = '''<!-- Meta Tags Optimizadas para paulosaldivar.cv -->

<!-- Homepage -->
<title>Abogado Temuco | Paulo Saldivar - Derecho Familia, Herencias y Civil</title>
<meta name="description" content="Abogado en Temuco especializado en derecho de familia, herencias y civil. Atención presencial en La Araucanía y online a todo Chile. Contacto WhatsApp: +56974349077">
<meta name="keywords" content="abogado temuco, abogado familia temuco, herencia chile, derecho civil, posesion efectiva, abogado online chile">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://paulosaldivar.cv/">
<meta property="og:title" content="Abogado Temuco | Paulo Saldivar">
<meta property="og:description" content="Asesoría jurídica en familia, herencia y civil. Profesional con enfoque en derechos humanos.">
<meta property="og:image" content="https://paulosaldivar.cv/og-image.jpg">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://paulosaldivar.cv/">
<meta name="twitter:title" content="Abogado Temuco | Paulo Saldivar">
<meta name="twitter:description" content="Asesoría jurídica en familia, herencia y civil.">
<meta name="twitter:image" content="https://paulosaldivar.cv/og-image.jpg">

<!-- Schema.org para Lawyer -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Paulo Saldivar Abogado",
  "description": "Asesoría jurídica en derecho de familia, herencias y civil.",
  "url": "https://paulosaldivar.cv",
  "telephone": "+56974349077",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Temuco",
    "addressRegion": "Araucanía",
    "addressCountry": "CL"
  },
  "areaServed": "Chile",
  "priceRange": "$$"
}
</script>
'''
    
    with open('/home/pi/.openclaw/workspace/proyectos-paulo/web-personal/meta-tags.html', 'w') as f:
        f.write(meta_tags)
    
    print("✅ Meta tags generadas: proyectos-paulo/web-personal/meta-tags.html")

if __name__ == '__main__':
    import sys
    
    init_seo_db()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'track':
            track_rankings()
        elif cmd == 'audit':
            generate_seo_audit()
        elif cmd == 'keywords':
            show_keywords()
        elif cmd == 'sitemap':
            generate_sitemap()
        elif cmd == 'robots':
            generate_robots()
        elif cmd == 'meta':
            generate_meta_tags()
        elif cmd == 'all':
            generate_sitemap()
            generate_robots()
            generate_meta_tags()
            generate_seo_audit()
        else:
            print("Comandos: track, audit, keywords, sitemap, robots, meta, all")
    else:
        print("""
🔍 SEO Tracker para paulosaldivar.cv

Comandos:
  python3 seo_tracker.py audit    - Auditoría técnica
  python3 seo_tracker.py track    - Verificar posiciones
  python3 seo_tracker.py keywords - Ver palabras clave
  python3 seo_tracker.py sitemap - Generar sitemap.xml
  python3 seo_tracker.py robots  - Generar robots.txt
  python3 seo_tracker.py meta    - Generar meta tags
  python3 seo_tracker.py all     - Ejecutar todo
""")
