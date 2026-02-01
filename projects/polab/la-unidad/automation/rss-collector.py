#!/usr/bin/env python3
"""
La Unidad - RSS Collector
Recolecta noticias de fuentes confiables
"""

import json
import os
from datetime import datetime
from urllib.request import urlopen
from xml.etree import ElementTree

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, 'data')

# Fuentes confiables (definidas en memoria)
FEEDS = {
    'granma': 'https://www.granma.cu/feed',
    'cgtn': 'https://www.cgtn.com/feeds/rss.xml',
    'elsiglo': 'https://www.elsiglo.cl/feed',
    'radionuevomundo': 'https://www.radionuevomundo.cl/feed',
    'pcchile': 'https://www.pcchile.org/feed'
}

def fetch_feed(name, url):
    """Extrae titulares de un feed RSS"""
    try:
        with urlopen(url, timeout=10) as response:
            content = response.read()
            root = ElementTree.fromstring(content)
            items = []
            for item in root.findall('.//item')[:5]:  # Últimos 5
                title = item.find('title')
                link = item.find('link')
                date = item.find('pubDate')
                items.append({
                    'title': title.text if title is not None else '',
                    'link': link.text if link is not None else '',
                    'date': date.text if date is not None else ''
                })
            return {'name': name, 'articles': items}
    except Exception as e:
        return {'name': name, 'error': str(e)}

def main():
    print(f"[RSS Collector] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    all_articles = []
    for name, url in FEEDS.items():
        print(f"  - {name}...", end=' ')
        result = fetch_feed(name, url)
        if 'articles' in result:
            print(f"{len(result['articles'])} artículos")
            all_articles.extend(result['articles'])
        else:
            print(f"Error: {result.get('error', 'Unknown')}")
    
    # Guardar datos
    output_file = os.path.join(DATA_DIR, f'news_{datetime.now().strftime("%Y%m%d")}.json')
    with open(output_file, 'w') as f:
        json.dump({
            'date': datetime.now().isoformat(),
            'articles': all_articles
        }, f, indent=2)
    
    print(f"[OK] Guardados {len(all_articles)} artículos en {output_file}")

if __name__ == '__main__':
    main()
