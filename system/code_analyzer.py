"""
Code Analyzer para PauloARIS
Analiza código propio y sugiere mejoras
"""

import ast
import re
from pathlib import Path
from datetime import datetime

class CodeAnalyzer:
    def __init__(self):
        self.workspace = Path("~/.openclaw/workspace").expanduser()
    
    def analyze_file(self, file_path: str) -> dict:
        """Analiza un archivo y devuelve métricas"""
        path = Path(file_path)
        if not path.exists():
            return {"error": "File not found"}
        
        content = path.read_text()
        
        # Contar líneas
        lines = content.count('\n') + 1
        blank_lines = content.count('\n\n')
        
        # Detectar lenguaje
        ext = path.suffix
        lang = self._detect_language(ext)
        
        # Buscar funciones
        functions = self._find_functions(content, lang)
        
        # Buscar clases
        classes = self._find_classes(content, lang)
        
        # Complejidad básica
        complexity = self._estimate_complexity(content, lang)
        
        return {
            "file": str(path),
            "lines": lines,
            "blank_lines": blank_lines,
            "language": lang,
            "functions": len(functions),
            "classes": len(classes),
            "estimated_complexity": complexity,
            "functions_list": functions[:5],
            "analyzed_at": datetime.now().isoformat()
        }
    
    def analyze_directory(self, dir_path: str) -> dict:
        """Analiza un directorio completo"""
        path = Path(dir_path)
        if not path.exists():
            return {"error": "Directory not found"}
        
        results = {
            "directory": str(path),
            "files": [],
            "total_lines": 0,
            "languages": {},
            "complexity_avg": 0,
            "analyzed_at": datetime.now().isoformat()
        }
        
        total_complexity = 0
        count = 0
        
        for file in path.rglob("*"):
            if file.is_file() and not file.name.startswith('.'):
                analysis = self.analyze_file(str(file))
                if "error" not in analysis:
                    results["files"].append({
                        "file": file.name,
                        "lines": analysis["lines"],
                        "complexity": analysis["estimated_complexity"]
                    })
                    results["total_lines"] += analysis["lines"]
                    
                    lang = analysis["language"]
                    results["languages"][lang] = results["languages"].get(lang, 0) + 1
                    
                    total_complexity += analysis["estimated_complexity"]
                    count += 1
        
        if count > 0:
            results["complexity_avg"] = total_complexity / count
        
        return results
    
    def _detect_language(self, ext: str) -> str:
        languages = {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.html': 'HTML',
            '.css': 'CSS',
            '.md': 'Markdown',
            '.json': 'JSON',
            '.sh': 'Shell',
            '.yaml': 'YAML',
            '.yml': 'YAML'
        }
        return languages.get(ext, 'Unknown')
    
    def _find_functions(self, content: str, lang: str) -> list:
        functions = []
        if lang == 'Python':
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        functions.append(node.name)
            except:
                pass
        elif lang in ['JavaScript', 'Unknown']:
            # Buscar patrones comunes
            patterns = [
                r'function\s+(\w+)',
                r'const\s+(\w+)\s*=\s*\(',
                r'(\w+)\s*=\s*\([^)]*\)\s*=>'
            ]
            for pattern in patterns:
                matches = re.findall(pattern, content)
                functions.extend(matches)
        return list(set(functions))[:10]
    
    def _find_classes(self, content: str, lang: str) -> list:
        classes = []
        if lang == 'Python':
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        classes.append(node.name)
            except:
                pass
        elif lang in ['JavaScript', 'Unknown']:
            matches = re.findall(r'class\s+(\w+)', content)
            classes.extend(matches)
        return list(set(classes))[:5]
    
    def _estimate_complexity(self, content: str, lang: str) -> int:
        """Estimación básica de complejidad"""
        score = 0
        
        # Contar estructuras de control
        score += content.count('if ')
        score += content.count('for ')
        score += content.count('while ')
        score += content.count('except ') * 2
        score += content.count('catch ') * 2
        
        return min(score, 100)

# Ejemplo de uso
if __name__ == "__main__":
    analyzer = CodeAnalyzer()
    
    print("📊 ANALIZANDO CÓDIGO DE POLAB")
    print("="*50)
    
    # Analizar sistema
    result = analyzer.analyze_directory("~/.openclaw/workspace/system")
    print(f"Directorio: {result['directory']}")
    print(f"Archivos: {len(result['files'])}")
    print(f"Líneas totales: {result['total_lines']}")
    print(f"Complejidad promedio: {result['complexity_avg']:.1f}")
    print(f"Lenguajes: {result['languages']}")
