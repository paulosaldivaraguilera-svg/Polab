# Edge AI & Raspberry Pi 5 - Technical Reference

**Source:** Convergencia Tecnológica en el Borde (2026-02-02)  
**Relevance:** Hardware optimization, local AI, industrial applications

---

## 📊 Raspberry Pi 5 as Edge AI Platform

### Hardware Specs (Critical for AI)

| Component | Specification | AI Relevance |
|-----------|---------------|--------------|
| **CPU** | Cortex-A76 64-bit quad-core @ 2.4GHz | NEON instructions for ML |
| **RAM** | 4GB / 8GB LPDDR4X | Model loading capacity |
| **Storage** | PCIe 2.0 x1 (Gen 3 capable) | SSD NVMe support |
| **OS** | Raspberry Pi OS 64-bit | ARM64 optimized packages |

### NPU Acceleration (Hailo)

| Chip | Performance | Use Case |
|------|-------------|----------|
| **Hailo-8L** | 13 TOPS | Vision YOLOv8, classification |
| **Hailo-8** | 26 TOPS | Multi-model parallel inference |

**Benchmark Results (from document):**

| Model | Task | FPS (Pi 5 + Hailo-8L) |
|-------|------|----------------------|
| YOLOv8s | Object Detection | 127.85 |
| YOLOv5n_seg | Segmentation | 103.57 |
| YOLOv8s_pose | Pose Estimation | 123.43 |
| SSD MobileNet | Fast Detection | 145.42 |
| EfficientNet | Classification | 242.92 |

---

## 🧠 Local LLMs on Raspberry Pi

### Model Selection Guide

| Model | Parameters | RAM Usage | Speed | Best For |
|-------|-----------|-----------|-------|----------|
| **Qwen 2.5** | 0.5B | <1GB | >20 tok/s | Fast classification, IoT |
| **TinyLlama** | 1.1B | ~1.2GB | ~15 tok/s | Basic voice assistant |
| **DeepSeek Coder** | 1.3B | ~1.5GB | ~12 tok/s | ⭐ **Code autocompletion** |
| **Phi-3 Mini** | 3.8B | ~3.5GB | 4-6 tok/s | Reasoning, summarization |
| **Llama 3 8B** | 8B (q4) | ~5.5GB | 2-3 tok/s | Batch processing (night) |

### Frameworks Comparison

| Framework | Architecture | Performance | Notes |
|-----------|--------------|-------------|-------|
| **Ollama** | Client-Server | Good | Easy API, more overhead |
| **Llamafile** | Single binary | ⭐ Better | 4x throughput, less energy |

### Recommended Setup for Pi 5 (8GB)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull optimized models
ollama pull qwen2.5:0.5b        # Fast tasks
ollama pull deepseek-coder:1.3b # Development
ollama pull phi3:3.8b           # Reasoning
```

---

## 🤖 Agent Orchestration Frameworks

### CrewAI (Multi-Agent Teams)

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                    CREWAI                            │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │  Agent   │──▶│  Agent   │──▶│  Agent   │        │
│  │  Planner │   │ Analyst  │   │ Coder    │        │
│  └──────────┘   └──────────┘   └──────────┘        │
│         │              │              │              │
│         └──────────────┼──────────────┘              │
│                        ▼                             │
│              ┌──────────────────┐                    │
│              │  Task Pipeline   │                    │
│              └──────────────────┘                    │
└─────────────────────────────────────────────────────┘
```

**Pi 5 Limitation:** Multiple concurrent agents need memory. 
**Recommendation:** Sequential execution or single-agent switching.

### LangGraph (State Machines)

For reliable autonomous agents with error correction loops:

```
State → Action → Check → [Loop if error] → Next State
```

**Use Case:** Code generation with self-correction before output.

---

## 🎤 Voice Pipeline: Whisper + TTS

### Local Speech Recognition

```bash
# Install faster-whisper (C++ optimized)
pip install faster-whisper

# Run locally (CPU, no GPU needed)
from faster_whisper import WhisperModel
model = WhisperModel("base", compute_type="int8")
segments, info = model.transcribe("audio.wav", beam_size=5)
```

### Text-to-Speech (Offline)

```bash
# Piper TTS (Lightweight, neural)
# Available in repos
sudo apt install piper-tts

# Usage
echo "Hola Chile" | piper --model es_MX之声mix_ledge-medium.onnx --output_file greet.wav
```

---

## 👨‍💻 Developer Setup on Pi 5

### VS Code Remote SSH

```bash
# On laptop, install Remote SSH extension
# Connect to Pi:
ssh pi@192.168.1.X

# Install code-server on Pi for browser-based dev
curl -fsSL https://code-server.dev/install.sh | sh
code-server --port 8080 --host 0.0.0.0
```

### Local AI Coding Assistant

```json
// .continue/config.json (Continue extension)
{
  "models": [
    {
      "model": "ollama/deepseek-coder",
      "api_base": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "model": "ollama/deepseek-coder",
    "api_base": "http://localhost:11434"
  }
}
```

**Benefit:** Code suggestions without data leaving local network.

### CI/CD with GitLab Runner

```bash
# Install GitLab Runner
curl -fsSL https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt install gitlab-runner

# Register runner
sudo gitlab-runner register --url https://gitlab.com --token $REGISTRATION_TOKEN
```

---

## 🇨🇱 Chilean Industrial Applications

| Industry | Use Case | Technology | Impact |
|----------|----------|------------|--------|
| **Mining** | PPE Detection | YOLOv8 + Hailo | Safety compliance |
| **Mining** | Belt monitoring | Vibration analysis | Predictive maintenance |
| **Agriculture** | Pest detection | Vision AI | Early warning |
| **Agriculture** | Frost prediction | Sensors + ML | Crop protection |
| **Salmon** | Fish classification | Computer vision | Quality control |
| **Salmon** | Water quality | Image analysis | Early bloom alert |
| **Forestry** | Fire detection | Smoke detection models | Rapid response |

---

## 🔗 Related Projects & Ecosystems

### Chilean Innovation Ecosystem

| Entity | Role | Contribution |
|--------|------|--------------|
| **Universidad de Chile (FCFM/CMM)** | Research | NLHPC, SCAI-Lab |
| **PUC** | Academia | Innovation center, ROS/robotics |
| **Universidad de Talca** | Agrotech | Smart irrigation, phenotyping |
| **Corfo** | Funding | Crea y Valida, Súmate a Innovar |

### Robotics Integration

| Framework | Purpose | Pi 5 Compatibility |
|-----------|---------|-------------------|
| **ROS 2 (Jazzy/Humble)** | Robot OS | ⭐ Full support |
| **OpenVLA** | Vision-Language-Action | Quantized models possible |
| **K3s** | Lightweight Kubernetes | Cluster deployment |

---

## 📋 PauloARIS Hardware Alignment

| Component | Document Spec | Our Current Setup | Gap |
|-----------|---------------|-------------------|-----|
| **Hardware** | Pi 5 (8GB recommended) | Pi running OpenClaw | ✅ Match |
| **Storage** | SSD over USB3 preferred | Unknown | Check |
| **Cooling** | Active cooler mandatory | Unknown | Check |
| **OS** | Raspberry Pi OS 64-bit | Likely | Verify |
| **Memory** | 4GB min, 8GB opt | Unknown | Check |

---

## 🎯 Action Items

### Immediate (This Session)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Verify hardware specs (`cat /proc/cpuinfo`) | Confirm Pi model |
| 2 | Check RAM (`free -h`) | Confirm memory |
| 3 | Check temperature (`vcgencmd measure_temp`) | Thermal status |

### Short-term (This Week)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Setup Ollama for local coding assistant | Privacy + productivity |
| 2 | Install faster-whisper for transcription | Voice pipeline |
| 3 | Document current Pi specs in TOOLS.md | Asset inventory |

### Medium-term (This Month)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Benchmark local LLM performance | Compare cloud vs local |
| 2 | Explore Hailo NPU integration | Vision AI acceleration |
| 3 | Prototype agent with LangGraph | Reliable autonomous workflows |

---

## 💡 Key Insights

1. **Pi 5 + NPU = Viable Edge AI:** YOLOv8 at 127 FPS is production-ready
2. **Local LLMs are viable for coding:** DeepSeek Coder 1.3B at 12 tok/s
3. **Voice pipeline is achievable:** Whisper + Piper run on CPU
4. **Chile has vertical opportunities:** Mining, agriculture, salmon farming
5. **Privacy-first development:** Local coding assistants protect IP

---

**Document Reference:** Convergencia Tecnológica en el Borde  
**Last Updated:** 2026-02-02  
**Status:** Technical Reference
