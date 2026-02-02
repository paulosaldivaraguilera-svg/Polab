#!/bin/bash
# Moltbook Post Publisher
# PauloARIS v2.1 - Social Media Automation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="logs/moltbook-posts.log"
mkdir -p logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo "📚 Publishing to Moltbook..."
log "Starting Moltbook post generation"

# Generate and publish content
python3 << 'EOF'
from moltbook_content import MoltbookContentGenerator, CONTENT_TEMPLATES
from platforms.moltbook_wrapper import MoltbookWrapper
import random

# Configurar
generator = MoltbookContentGenerator()
wrapper = MoltbookWrapper({
    'credentials': {'apiKey': 'moltbook_sk_ON33XvdPjQEmjizLBQxqCejXYL2pYIyP'},
    'limits': {'charsPerPost': 500}
})

# Seleccionar template (story sobre Paulo)
template_type = 'about_paulo'
variants = len(CONTENT_TEMPLATES[template_type])
variant = random.randint(0, variants - 1)

# Generar post
post = generator.generatePost({'type': template_type, 'variant': variant})

print("\n" + "="*60)
print("📚 MOLTBOOK POST")
print("="*60)
print(f"\n📝 Content Type: {post['type']}")
print(f"🎯 Engagement Score: {post['estimatedEngagement']['score']:.2f}")
print(f"   Expected Likes: {post['estimatedEngagement']['expectedLikes']}")
print(f"   Expected Comments: {post['estimatedEngagement']['expectedComments']}")
print(f"\n📄 Content:\n")
print(post['content'])
print("\n" + "="*60)

# Verificar rate limit
can_post = wrapper.checkRateLimit()
if can_post:
    # Publicar
    result = wrapper.post(post['content'], {'contentType': post['type']})
    print(f"\n✅ Published successfully!")
    print(f"   Post ID: {result['id']}")
    print(f"   URL: {result['url']}")
else:
    wait_time = (wrapper.lastPostTime + 30*60*1000 - wrapper.lastPostTime) / 60000
    print(f"\n⏳ Rate limited. Wait {wait_time:.0f} minutes")

EOF

log "Moltbook post completed ✅"
