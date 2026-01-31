#!/usr/bin/env python3
"""
Quick Writer - Editor de Texto en Terminal
============================================
Escribe artículos, análisis y documentos rápidamente.

Uso:
    python3 writer.py "nombre-del-archivo.md"

Atajos:
    Ctrl+O → Guardar
    Ctrl+X → Salir
"""

import sys
import os
from datetime import datetime

TEMPLATE_DIR = '/home/pi/.openclaw/workspace/proyectos-paulo/templates'
OUTPUT_DIR = '/home/pi/.openclaw/workspace/proyectos-paulo/produccion'

TEMPLATES = {
    'analisis': '''# Análisis Político

**Fecha:** {fecha}
**Tema:** 

## Contexto

## Sujetos en disputa

## Contradicción central

## Hipótesis

## Desarrollo

## Conclusiones

---

*Generado con Quick Writer*
''',

    'articulo': '''# Título del Artículo

**Fecha:** {fecha}
**Etiquetas:** 

## Introducción

## Desarrollo

## Conclusión

---

*Generado con Quick Writer*
''',

    'documento': '''# Título del Documento

**Fecha:** {fecha}
**Autor:** Paulo Saldivar

## Contenido

---

*Generado con Quick Writer*
''',

    'nota': '''# Nota: {titulo}

**Fecha:** {fecha}
**Contexto:** 

## Apunte

- 

## Referencias

---

*Generado con Quick Writer*
'''
}

def list_templates():
    print("📄 Templates disponibles:")
    for t in TEMPLATES:
        print(f"  • {t}")
    print()

def create_template(nombre, contenido):
    os.makedirs(TEMPLATE_DIR, exist_ok=True)
    path = os.path.join(TEMPLATE_DIR, f"{nombre}.md")
    with open(path, 'w') as f:
        f.write(contenido)
    return path

def new_document(filename, template_type='documento'):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    fecha = datetime.now().strftime('%Y-%m-%d')
    
    if template_type in TEMPLATES:
        contenido = TEMPLATES[template_type].format(fecha=fecha, titulo=filename)
    else:
        contenido = TEMPLATES['documento'].format(fecha=fecha)
    
    # Sanitizar filename
    safe_name = filename.replace(' ', '-').lower()
    if not safe_name.endswith('.md'):
        safe_name += '.md'
    
    path = os.path.join(OUTPUT_DIR, safe_name)
    
    with open(path, 'w') as f:
        f.write(contenido)
    
    return path

def list_documents():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    docs = sorted(os.listdir(OUTPUT_DIR), reverse=True)
    print(f"📚 Documentos en producción ({len(docs)}):")
    for d in docs[:10]:  # Últimos 10
        print(f"  • {d}")
    if len(docs) > 10:
        print(f"  ... y {len(docs) - 10} más")
    return docs

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--list':
            list_templates()
            list_documents()
        elif sys.argv[1] == '--templates':
            list_templates()
        elif sys.argv[1] == '--docs':
            list_documents()
        else:
            filename = sys.argv[1]
            template = sys.argv[2] if len(sys.argv) > 2 else 'documento'
            path = new_document(filename, template)
            print(f"✅ Documento creado: {path}")
            print(f"📝 Edita con: nano {path}")
    else:
        print("Quick Writer - Editor Rápido")
        print()
        print("Uso:")
        print("  python3 writer.py 'mi-analisis.md' -t analisis")
        print("  python3 writer.py 'nota-rapida.md' -t nota")
        print()
        print("Opciones:")
        print("  --list       Ver templates y documentos")
        print("  --templates  Ver solo templates")
        print("  --docs       Ver solo documentos")
