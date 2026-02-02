#!/usr/bin/env python3
"""
Moltbook Post Publisher
PauloARIS v2.1 - Social Media Automation
"""

import sys
import os
import random
from datetime import datetime

# Add state to path
sys.path.insert(0, '/home/pi/.openclaw/workspace/state')

from moltbook_content import MoltbookContentGenerator, CONTENT_TEMPLATES
from platforms.moltbook_wrapper import MoltbookWrapper

def main():
    print("\n" + "="*60)
    print("📚 MOLTBOOK POST - PauloARIS")
    print("="*60)
    print(f"\n⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Configurar generator y wrapper
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
    
    print(f"\n📝 Content Type: {post['type']}")
    print(f"🎯 Engagement Score: {post['estimatedEngagement']['score']:.2f}")
    print(f"   Expected Likes: {post['estimatedEngagement']['expectedLikes']}")
    print(f"   Expected Comments: {post['estimatedEngagement']['expectedComments']}")
    print(f"\n📄 Content:")
    print("-" * 60)
    print(post['content'])
    print("-" * 60)
    
    # Verificar rate limit
    can_post = wrapper.checkRateLimit()
    
    if can_post:
        # Publicar
        print(f"\n🚀 Publishing to Moltbook...")
        result = wrapper.post(post['content'], {'contentType': post['type']})
        
        print(f"\n✅ PUBLISHED SUCCESSFULLY!")
        print(f"   Post ID: {result['id']}")
        print(f"   URL: {result['url']}")
        print(f"\n💡 Metrics to track:")
        print(f"   - Likes received")
        print(f"   - Comments")
        print(f"   - Shares")
        print(f"   - New followers")
        print(f"   - DM inquiries")
        
        return True
    else:
        wait_time = 30  # minutos
        print(f"\n⏳ Rate limited. Wait {wait_time} minutes before next post.")
        print(f"   Next available: {datetime.fromtimestamp(wrapper.lastPostTime + 30*60*1000)}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
