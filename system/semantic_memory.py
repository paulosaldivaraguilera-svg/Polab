"""
Semantic Memory System v1.0 - PauloARIS
Sistema de memoria con búsqueda semántica usando ChromaDB
Compatible con ARM64 (Raspberry Pi)
"""

import chromadb
from chromadb.config import Settings
from datetime import datetime
from pathlib import Path
import json
import os

class SemanticMemory:
    def __init__(self):
        self.db_dir = Path("~/.openclaw/workspace/system/semantic_db").expanduser()
        self.db_dir.mkdir(parents=True, exist_ok=True)
        
        # Inicializar ChromaDB (funciona en ARM64)
        self.client = chromadb.PersistentClient(
            path=str(self.db_dir),
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Colección para memoria
        self.collection = self.client.get_or_create_collection(
            name="memory",
            metadata={"description": "Memoria semántica de PauloARIS"}
        )
        
        print("✅ Semantic Memory inicializada")
        print(f"   📁 Base: {self.db_dir}")
    
    def add(self, text: str, metadata: dict = None):
        """Agregar memoria"""
        doc_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.collection.add(
            documents=[text],
            metadatas=[metadata or {"created_at": datetime.now().isoformat()}],
            ids=[doc_id]
        )
        return doc_id
    
    def search(self, query: str, n_results: int = 5):
        """Búsqueda semántica"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results
    
    def get_all(self, limit: int = 100):
        """Obtener todas las memorias"""
        return self.collection.get(limit=limit)
    
    def count(self):
        """Contar memorias"""
        return self.collection.count()

# Instancia global
semantic_memory = SemanticMemory()

print(f"📊 Memorias almacenadas: {semantic_memory.count()}")
