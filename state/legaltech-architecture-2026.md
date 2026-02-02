# Legaltech Architecture & Agentic AI - Technical Reference

**Source:** Estado del Arte en Legaltech 2026 (Febrero)  
**Relevance:** Strategic planning, architecture decisions, tool selection

---

## 📊 Paradigm Shift: From Copilot to Agentic AI

```
2023-2024: Assistant Model          →  2025-2026: Agentic Model
────────────────────────────────────────────────────────────────
User: "Summarize this contract"     →  User: "Manage contract renewal"
AI: Generates summary               →  AI: Reads email → Compares terms 
                                                        → Negotiates changes 
                                                        → Prepares draft
                                                        → Requests human approval
```

**Key Implication:** We need orchestration frameworks, not just LLMs.

---

## 🏗️ Agent Orchestration Frameworks Comparison

| Framework | Paradigm | Best For | Our Fit |
|-----------|----------|----------|---------|
| **LangGraph** | Cyclic Graphs + State | Strict workflows, legal review cycles | ⭐ Relevant for Compliance |
| **CrewAI** | Role-based Teams | M&A Due Diligence, specialized teams | ⭐ Good for e-commerce ops |
| **AutoGen** | Conversational | Negotiation simulation, group debate | Lower priority |

### LangGraph for Legal Workflows

```
State = {
    "document": str,
    "risks": List[str],
    "changes": List[Dict],
    "human_approval": bool
}

Nodes:
├── Analyst (LLM extraction)
├── Critic (Hallucination check)  
├── Tool (RAG database search)
└── Router (Conditional: repeat or approve)
```

**Pattern for our automation:** We can apply this to our e-commerce workflows.

---

## 🤖 Model Strategy: Proprietary vs Open Source

| Category | Tools | Cost | Privacy | Use Case |
|----------|-------|------|---------|----------|
| **Proprietary** | Harvey, CoCounsel | High ($150K+/yr) | Cloud | High-stakes research |
| **Open Source** | Llama 3, SaulLM | Low (infrastructure) | High (local) | ⭐ Our choice: Processing |
| **Hybrid** | Route to specialist | Optimized | Balanced | ⭐ Our strategy |

### Recommended Stack for Polab

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID MODEL ROUTER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request → Triager (SaulLM - fast, cheap)                   │
│       ├── Simple task → Local Llama 3 (free)                │
│       └── Complex task → Anthropic API (quality)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tool Stack for Legal Engineering

### Document Automation

| Tool | Function | License | Integration |
|------|----------|---------|-------------|
| **Docassemble** | Guided interviews, document generation | Open Source (MIT) | Python/YAML |
| **OpenContracts** | Contract analysis, RAG, OCR | Apache 2.0 | Microservices |

### NLP & Extraction

| Tool | Function | Use Case |
|------|----------|----------|
| **SpaCy** | NER (Judges, Dates, Amounts) | Document parsing |
| **Eyecite** | Legal citation extraction | Citation cleanup |
| **LexNLP** | Fact extraction (money, dates) | Structured data |

### Compliance as Code

| Standard | Purpose | Format |
|----------|---------|--------|
| **OSCAL** (NIST) | Security controls documentation | JSON/XML/YAML |
| **RegScale** | Continuous compliance validation | CI/CD integration |

---

## 📋 Our Project Alignment

### Comenzar (Legal Services Landing)

| Document Insight | Our Implementation | Gap |
|-----------------|-------------------|-----|
| "Compliance as Code" | Not implemented | ⏳ Add OSCAL-inspired structure |
| "Hybrid Model Routing" | Single API (Anthropic) | ⏳ Add local Llama fallback |
| "Human-in-the-loop" | WhatsApp approval | ✅ Already implemented |

### E-commerce PyME (Future)

| Document Insight | Our Plan | Status |
|-----------------|----------|--------|
| "LangGraph workflows" | n8n automation | ✅ Aligned |
| "Role-based agents" | Different tools for roles | ⏳ Future |
| "Deterministic + AI hybrid" | Our architecture | ✅ Match |

### Ralph Loop System

| Document Pattern | Our Implementation |
|-----------------|-------------------|
| "Grafo cíclico con estado" | `ralph-progress.json` + `loop-runner.py` |
| "Bucles de reflexión" | Task retry mechanism |
| "Human-in-the-loop" | Manual approval for critical tasks |

---

## 🎯 Action Items Based on Document

### Immediate (This Week)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Evaluate SaulLM for local document processing | Privacy + cost savings |
| 2 | Add OSCAL-style compliance structure to project docs | Professional standards |
| 3 | Integrate SpaCy for NER in document processing | Better extraction |

### Short-term (This Month)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Implement hybrid model routing (local + cloud) | Cost optimization |
| 2 | Add structured logging (for audit trails) | Legal requirement |
| 3 | Create compliance checklist for e-commerce | Future-proofing |

### Long-term (Quarter)

| Priority | Action | Reason |
|----------|--------|--------|
| 1 | Evaluate LangGraph for complex workflows | Scaling needs |
| 2 | Implement OpenContracts for contract analysis | Feature expansion |
| 3 | Build "Ingeniero Legal" role documentation | Positioning |

---

## 💡 Key Insights from Document

### 1. "Compliance as Code" is Mandatory

> "The entry into force of the EU AI Law has transformed compliance into a software engineering problem."

**Our action:** Structure our documentation and processes to be machine-readable and auditable.

### 2. "Human-in-the-Lawyer" is Required

> "The lack of adequate supervision of an AI tool constitutes negligence per se."

**Our action:** Always maintain human approval gates for critical decisions.

### 3. "Engineering Legal" is a New Role

> "The ability to design the system that applies the law is as valuable as the knowledge of the law itself."

**Our action:** Document our architecture as "Legal Engineering" for positioning.

### 4. "Hybrid Model Routing" is Optimal

> "Optimize ROI and latency, reserving expensive resources for where they really add value."

**Our action:** Implement tiered model strategy (cheap local → expensive cloud).

---

## 🔗 Related Documents in Our Workspace

| Document | Relationship |
|----------|--------------|
| `legaltech-chile-2025-2030.md` | Market context |
| `estrategia-digital-inclusiva-chile.md` | Technology vision |
| `e-commerce-pyme-chile.md` | Implementation plan |
| `state/openclaw-architecture-reference.md` | Agent framework |
| `state/edge-ai-raspberry-pi-reference.md` | Hardware optimization |

---

## 📈 Metrics We Should Track

| Metric | Current | Target |
|--------|---------|--------|
| Local model usage % | 0% | 70% |
| Compliance documentation coverage | Partial | 100% |
| Human-in-the-loop interventions | Manual | Tracked |
| Document processing speed | Unknown | Benchmark |

---

**Document Reference:** Estado del Arte en Legaltech 2026  
**Last Updated:** 2026-02-02  
**Status:** Strategic Reference
