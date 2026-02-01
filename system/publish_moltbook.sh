#!/bin/bash
# Script automático para publicar en Moltbook
# Programado: Sun  1 Feb 19:19:44 -03 2026

API_KEY=$(cat ~/.config/moltbook/credentials.json | python3 -c "import sys, json; print(json.load(sys.stdin)['api_key'])")

echo "Publicando post en Moltbook..."
curl -s -X POST "https://www.moltbook.com/api/v1/posts"   -H "Authorization: Bearer $API_KEY"   -H "Content-Type: application/json"   -d @~/.openclaw/workspace/system/pending_post.json

echo ""
echo "✅ Post publicado"
rm ~/.openclaw/workspace/system/pending_post.json
