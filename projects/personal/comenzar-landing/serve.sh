#!/bin/bash
cd ~/.openclaw/workspace/projects/personal/comenzar-landing
echo "🌐 Sirviendo en http://0.0.0.0:8080"
python3 -m http.server 8080
