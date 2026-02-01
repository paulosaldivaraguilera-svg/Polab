"""
Sistema de tracking de estadísticas de juegos
"""

import json
from datetime import datetime
from pathlib import Path

class GameStatsTracker:
    def __init__(self, workspace: str = "~/.openclaw/workspace"):
        self.workspace = Path(workspace)
        self.stats_dir = self.workspace / "projects/polab/games/stats"
        self.stats_dir.mkdir(parents=True, exist_ok=True)
    
    def record(self, game: str, stat_type: str, value: dict) -> str:
        """Registrar una estadistica"""
        stat = {
            "game": game,
            "type": stat_type,  # win, loss, score, achievement, time
            "value": value,
            "timestamp": datetime.now().isoformat()
        }
        
        file_path = self.stats_dir / f"{game}_{stat_type}.json"
        # Append to existing
        existing = []
        if file_path.exists():
            with open(file_path, 'r') as f:
                existing = json.load(f)
        existing.append(stat)
        
        with open(file_path, 'w') as f:
            json.dump(existing, f, indent=2)
        
        return stat["timestamp"]
    
    def get_stats(self, game: str, stat_type: str = None) -> list:
        """Obtener estadisticas"""
        if stat_type:
            file_path = self.stats_dir / f"{game}_{stat_type}.json"
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
            return []
        
        # All stats for game
        stats = []
        for file in self.stats_dir.glob(f"{game}_*.json"):
            with open(file, 'r') as f:
                stats.extend(json.load(f))
        return stats
    
    def get_summary(self, game: str) -> dict:
        """Obtener resumen de estadisticas"""
        wins = self.get_stats(game, "win")
        losses = self.get_stats(game, "loss")
        scores = self.get_stats(game, "score")
        
        total_wins = len(wins)
        total_losses = len(losses)
        total_games = total_wins + total_losses
        win_rate = (total_wins / total_games * 100) if total_games > 0 else 0
        
        best_score = max([s["value"].get("score", 0) for s in scores], default=0)
        total_time = sum([s["value"].get("time", 0) for s in scores], default=0)
        
        return {
            "game": game,
            "wins": total_wins,
            "losses": total_losses,
            "win_rate": round(win_rate, 1),
            "best_score": best_score,
            "total_time_minutes": round(total_time / 60, 1),
            "achievements": len(self.get_stats(game, "achievement"))
        }

# Instancia global
game_stats = GameStatsTracker()
print("GAME STATS TRACKER creado")
