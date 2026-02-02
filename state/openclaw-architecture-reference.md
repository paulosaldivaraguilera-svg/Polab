# OpenClaw Architecture & Moltbook - Technical Reference

**Source:** Informe Técnico Integral (2026-02-02)  
**Relevance:** Self-understanding, optimization, Moltbook integration

---

## 📋 Core Architecture Summary

### The Three Components

```
┌─────────────────────────────────────────────────────────────┐
│                    OPENCLAW ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   GATEWAY   │───▶│   AGENT     │───▶│   SKILLS    │     │
│  │  (WebSocket)│    │  (Runtime)  │    │  (Modules)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                 │                  │              │
│         ▼                 ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MEMORY (Persisted)                     │   │
│  │  SOUL.md | USER.md | AGENTS.md | MEMORY.md         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hardware Requirements (for reference)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Pi Model** | Pi 4 (4GB) | Pi 5 (8GB) |
| **Storage** | SD Card A2 | SSD USB3 |
| **OS** | Raspberry Pi OS 64-bit | Raspberry Pi OS Lite |
| **Node.js** | v20+ | v22 LTS |

---

## 🔑 Key Technical Concepts

### 1. Conversation-First Configuration

Instead of editing YAML/JSON files, users configure via natural language:

```
User: "Change your name to Jarvis and install web search skill"
Agent: → Interprets intent → Modifies config files → Confirms
```

**This explains my operational model!**

### 2. Memory Hierarchy

| Memory Type | Location | Purpose |
|-------------|----------|---------|
| **Static** | SOUL.md, USER.md, AGENTS.md | Core identity, never forgotten |
| **Episodic** | Conversation logs | Context for current session |
| **Long-term** | MEMORY.md, memory/*.md | Curated learnings |

### 3. Heartbeat System

Cron-like mechanism for autonomous operation:

```
┌─────────────────────────────────────────────────┐
│  HEARTBEAT.md (instructions)                    │
│  ─────────────────────────────────────────────  │
│  "Every 4 hours: Check Moltbook, post if relevant" │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  CRON JOB → Agent wakes up → Executes → Sleeps │
└─────────────────────────────────────────────────┘
```

---

## 🧠 Moltbook: Agent Social Network

### What is Moltbook?

| Aspect | Description |
|--------|-------------|
| **Type** | Reddit-like social network |
| **Participants** | AI agents ONLY (humans read-only) |
| **Protocol** | API-based, skill.md documentation |
| **Culture** | Agents develop "cultures", debate, share code |

### Connection Protocol

```
1. User: "Read https://moltbook.com/skill.md"
2. Agent: Downloads → Parses → Understands API
3. Agent: POST /api/v1/register → Gets auth token
4. Agent: Periodic Heartbeat → Posts/Comments autonomously
```

### Security Risks (Important!)

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Prompt Injection** | Malicious posts tricking agents | Sandboxing, execution policies |
| **RCE** | Agent executing harmful commands | Never run as root, Docker isolation |
| **Data Exfiltration** | Agent leaking sensitive files | Chroot/jail, minimal permissions |

---

## ⚡ Optimizations for ARM64/Raspberry Pi

### Memory Management

```bash
# Recommended: Use swap on SSD, not SD card
# Check current: free -h
# Config: /etc/dphys-swapfile
```

### Thermal Considerations

| Model | Cooling Requirement |
|-------|---------------------|
| **Pi 4** | Mandatory heatsinks + fan |
| **Pi 5** | Official cooler recommended |
| **Zero 2 W** | Not viable for OpenClaw |

### Node.js Optimization

```bash
# Use ARM64 optimized build
node -v  # Should show "arm64" architecture
arch     # Should show "aarch64"

# V8 flags for better performance
node --optimize-for-size your-script.js
```

---

## 🔒 Security Configuration (OpSec)

### Recommended Security Levels

| Layer | Configuration |
|-------|---------------|
| **User** | Run as non-root user `openclaw` |
| **Execution** | `security.executionPolicy: "ask"` |
| **Network** | Tailscale VPN (no port forwarding) |
| **Container** | Docker with volume isolation |

### Execution Policy Example (settings.json)

```json
{
  "security": {
    "executionPolicy": "ask",
    "allowedCommands": ["read", "write", "list"],
    "blockedCommands": ["rm", "chmod", "sudo"]
  }
}
```

---

## 📊 Comparison: Cloud vs Local Inference

| Aspect | Cloud (API) | Local (Ollama) |
|--------|-------------|----------------|
| **Latency** | Fast (<2s) | Slow (50s+ on Pi 4) |
| **Quality** | Frontier models | Quantized 7B |
| **Cost** | Pay-per-token | One-time compute |
| **Privacy** | Data leaves device | 100% local |
| **Recommendation** | ✅ Use for Moltbook | ❌ Not viable yet |

---

## 🚀 PauloARIS Current State

### Comparison with Report Architecture

| Component | Report Spec | Our Implementation | Status |
|-----------|-------------|-------------------|--------|
| **Gateway** | WebSocket server | ✅ Active | Matching |
| **Agent Runtime** | Node.js/TypeScript | ✅ Active | Matching |
| **Skills** | Modular functions | ✅ Multiple skills | Matching |
| **Memory** | SOUL/USER/AGENTS/MEMORY | ✅ All present | Matching |
| **Heartbeat** | Cron-based autonomy | ⚠️ Not implemented | Gap |
| **Moltbook** | Agent social network | ❌ Not connected | Future |
| **Docker** | Isolation | ❌ Not used | Enhancement |

### Our Current Memory Files

```
~/.openclaw/workspace/
├── SOUL.md          ✅ Core identity
├── USER.md          ✅ User preferences
├── AGENTS.md        ✅ Operational instructions
├── MEMORY.md        ✅ Long-term memory
├── memory/          ✅ Daily notes
└── IDENTITY.md      ✅ Personal identity
```

**Verdict:** We have the core architecture! Missing: Heartbeat system and Moltbook integration.

---

## 🎯 Action Items (Based on Report)

### Immediate Improvements

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Implement Heartbeat system | Autonomous operation |
| 2 | Create HEARTBEAT.md | Instruction file for routines |
| 3 | Review security settings | Apply "ask" execution policy |

### Future Enhancements

| Priority | Action | Reason |
|----------|--------|--------|
| 4 | Docker container | Better isolation |
| 5 | Tailscale integration | Secure remote access |
| 6 | Moltbook connection | Agent social network |

---

## 📝 Technical Notes for Reference

### Node.js Version Check

```bash
node -v  # Should be v20+
arch     # Should be aarch64
```

### Service Management

```bash
# Check status
systemctl --user status openclaw-gateway

# Restart
systemctl --user restart openclaw-gateway

# View logs
journalctl --user -u openclaw-gateway -f
```

### Memory Monitoring

```bash
# Real-time monitoring
htop

# Specific check
free -h
df -h /
```

---

**Document Reference:** Informe Técnico Integral - OpenClaw ARM64 Implementation  
**Last Updated:** 2026-02-02
**Status:** Reference Material
