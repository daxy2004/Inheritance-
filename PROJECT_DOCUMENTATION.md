# PROJECT DOSSIER: INHERITANCE
## Living Oral Family Memoir & Interactive Ancestral Archive
**Event**: iQOO City Battles (Aug – Oct 2026) · Bengaluru Battleground  
**Track**: Track 09 — Open Innovation (Wildcard)  
**Team**: Dhruv Aruna Kumar (Solo Builder)  
**Submission Repository**: [github.com/daxy2004/Inheritance-](https://github.com/daxy2004/Inheritance-)  
**Build Target**: Android Phone-First Application (Capacitor Native APK + Progressive Web Engine)

---

## TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Cultural Urgency](#2-problem-statement--cultural-urgency)
3. [The Solution: Inheritance](#3-the-solution-inheritance)
4. [Core Features & System Modules](#4-core-features--system-modules)
5. [Technical Architecture & Data Pipeline](#5-technical-architecture--data-pipeline)
6. [Technology Stack](#6-technology-stack)
7. [Regional Language & Voice AI Strategy](#7-regional-language--voice-ai-strategy)
8. [Hardware & Phone-First Innovation (iQOO Alignment)](#8-hardware--phone-first-innovation-iqoo-alignment)
9. [Hackathon Scoring Alignment](#9-hackathon-scoring-alignment)
10. [Live 3-Minute Hackathon Demo Script](#10-live-3-minute-hackathon-demo-script)
11. [Future Roadmap](#11-future-roadmap)

---

## 1. EXECUTIVE SUMMARY

> *"Every time an elder passes away, a whole library burns to the ground."*

**Inheritance** is an AI-powered intergenerational oral history studio designed to preserve, synthesize, and converse with ancestral family wisdom. It converts unindexed voice recordings, vintage physical photographs, and handwritten heirloom recipes into a **living, searchable oral knowledge base and an interactive voice-cloned memoir**.

Unlike traditional photo albums or generic cloud storage, Inheritance brings memories to life: grandchildren can **listen to stories synthesized in their grandparents' authentic cloned voice** and **ask open-ended questions directly to the family archive**, receiving grounded answers with exact audio citations across **Kannada, Hindi, Tamil, and English**.

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           THE CORE PROMISE                             │
  │                                                                        │
  │   [Fragmented Voice & Photos]  ──▶  [AI Multimodal & Voice Engine]     │
  │                                                   │                    │
  │                                                   ▼                    │
  │   [Living Ancestral Archive]   ◀──  [Multilingual Interactive Memoir]  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PROBLEM STATEMENT & CULTURAL URGENCY

### The Problem
1. **Extinction of Oral Folklore & Lineage**: Within 2 to 3 generations, over 90% of family struggles, cultural folklore, recipes, and ancestral life lessons are forgotten due to the transition to nuclear families.
2. **Static Media Lacks Soul**: Current solutions (Google Photos, WhatsApp family groups) treat family memories as flat files—thousands of photos without context, emotions, or the authentic cadence of the storyteller's voice.
3. **The Vernacular Divide**: Elders in India predominantly speak in regional vernaculars (**ಕನ್ನಡ, हिन्दी, தமிழ்**). Most digital memoir tools are English-centric and fail at capturing nuances in regional accents.
4. **Senior Usability Barrier**: Complex cloud applications are inaccessible to elderly storytellers, requiring a zero-friction, phone-first capture experience.

---

## 3. THE SOLUTION: INHERITANCE

Inheritance bridges the generational gap by combining **conversational AI, zero-shot voice cloning, and a local-first encrypted archive**:

* **Capture**: Frictionless 1-tap audio capture with real-time waveform visualization and portrait attachment.
* **Preserve**: Automatic speech recognition, punctuation correction, sentiment tagging, and structured thematic chapters.
* **Resurrect**: Cross-lingual voice synthesis that speaks regional Indian languages using the storyteller's authentic acoustic signature.
* **Interact**: Grounded Retrieval-Augmented Generation (RAG) allowing any family member to query the archive as if conversing with the storyteller.

---

## 4. CORE FEATURES & SYSTEM MODULES

```
                           ┌───────────────────────────────────┐
                           │      INHERITANCE CORE SUITE       │
                           └─────────────────┬─────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
[Voice Memorial]   [Ask Archive RAG]  [Living Family Tree] [Heirloom Book]  [Cloud Vault Sync]
• Timbre Cloning   • Semantic Search  • Interactive Nodes  • Auto Chapters  • Google Drive OAuth
• Multilingual TTS • Audio Citations  • Generation Layers  • Keepsake Photo • Zero-Knowledge
• Keepsake Frame   • Minimax M3/V4    • Kinship Filter     • Ambient Sound  • Local-First Data
```

### Module 1: Multilingual Voice Memorial Studio
* **Timbre & Acoustic Cadence Cloning**: Extracts voice embeddings from short (30–60s) audio recordings using `eleven_multilingual_v2`.
* **Cross-Lingual Synthesis**: Generates oral narratives in Kannada, Hindi, Tamil, and English while retaining the original speaker's pitch, warmth, and emotion.
* **Commemorative Keepsake Framing**: Associates high-resolution captured portraits with voice profiles, displayed across all application views.

### Module 2: "Ask the Archive" (Ancestral Knowledge RAG)
* **Grounded Conversational Search**: Family members can ask natural questions (e.g., *"How did grandmother start her small business in 1974?"*).
* **Hallucination-Free Audio Citations**: Cites specific recorded memories with clickable interactive audio pills that immediately stream the exact original recording segment.
* **Fast Inference**: Powered by OpenRouter's high-speed reasoning models with low latency.

### Module 3: Heirloom Keepsake Memoir Book
* **Chapter Generation**: Automatically categorizes oral transcripts into rich biographical chapters (*Early Childhood, Love & Marriage, Heritage Recipes, Life Wisdom*).
* **Warm Editorial Aesthetic**: Custom typography, antique paper gradients (`#FAF7F2` and `#8B4513`), vintage framing, and ambient audio soundscapes.

### Module 4: Living Family Tree & Lineage Map
* **Node-Based Relationship Visualization**: Connects ancestors and living descendants with relationship tags (Grandparent, Parent, Sibling, Child).
* **Milestone Playback**: Tapping any node opens the ancestor's voice bio, attached stories, and commemorative photographs.

### Module 5: Google Drive Cloud Vault & Local-First Storage
* **Data Sovereignty**: All stories and audio recordings persist locally via IndexedDB and SQLite.
* **One-Tap Family Sync**: Direct integration with Google Drive API v3 to sync a complete portable `Inheritance_Vault.json` package across devices with zero vendor lock-in.

---

## 5. TECHNICAL ARCHITECTURE & DATA PIPELINE

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|   Capacitor Native Android Bridge · React 18 · TypeScript · Tailwind CSS · Lucide     |
+-------------------------------------------+-------------------------------------------+
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
 [Audio Capture Pipeline]          [Camera & Vision]                  [Storage Engine]
 • Web Audio API                   • Capacitor Camera API             • IndexedDB / Dexie
 • 44.1kHz PCM / MediaRecorder     • Base64 Image Frame Buffer        • Google Drive API v3
 • Canvas FFT Waveform             • Keepsake Aspect Ratios           • Local Encrypted State
        │                                   │                                   │
        └───────────────────────────────────┼───────────────────────────────────┘
                                            │
+-------------------------------------------v-------------------------------------------+
|                                  AI INFERENCE LAYER                                   |
+---------------------------------------------------------------------------------------+
|  1. Google Gemini 3.5 / 3.6 Flash  --> Audio transcription, narrative structuration    |
|  2. OpenRouter (Minimax M3 / V4)    --> Grounded semantic RAG for "Ask the Archive"   |
|  3. ElevenLabs Multilingual v2      --> Multilingual zero-shot voice cloning & TTS    |
|  4. On-Device Sentiment Analysis    --> Emotional classification & tone categorization |
+---------------------------------------------------------------------------------------+
```

### End-to-End Processing Workflow
1. **Audio Input**: User speaks into the iQOO microphone. The app captures real-time 44.1kHz audio with background noise suppression.
2. **Multimodal Analysis**: The audio stream is analyzed by Gemini Flash to extract verbatim transcripts, title, thematic tags, and emotional sentiment.
3. **Voice Cloning & Synthesis**: Voice features are extracted into a persistent voice ID. When regional synthesis is requested, the system compiles UTF-8 Indic strings and streams natural audio in real-time.
4. **Knowledge Indexing**: Story transcripts and metadata are vectorized and indexed into the local RAG engine for instant recall.

---

## 6. TECHNOLOGY STACK

| Layer | Component | Details / Rationale |
| :--- | :--- | :--- |
| **Mobile Core** | Android Native (API 26+) | Built with Java 17, Gradle 8.14, packaged via Capacitor 6 |
| **UI Framework** | React 18 + Vite 6 | Fast bundle execution, ultra-low memory footprint |
| **Language** | TypeScript 5 | End-to-end type safety across audio and AI payloads |
| **Styling** | Custom Vanilla CSS + Tailwind | Glassmorphic cards, antique gold accents (`#E2A63B`), espresso tones (`#200E05`) |
| **Audio Engine** | Web Audio API / MediaRecorder | Native microphone capture, FFT spectrum analysis, ambient crackle layering |
| **Multimodal LLM** | Google Gemini 3.5 / 3.6 Flash | Zero-latency audio transcription and story extraction |
| **RAG & Search** | OpenRouter (Minimax M3 / V4) | Grounded ancestor question-answering with strict source verification |
| **Voice Cloning** | ElevenLabs `eleven_multilingual_v2` | Zero-shot multilingual voice cloning with Indic script autodetection |
| **Cloud Backup** | Google Drive API v3 (OAuth 2.0) | User-owned decentralized cloud vault |
| **Branding / Icons** | Native GDI+ C# Pipeline | Custom high-DPI Android mipmaps and adaptive launcher icons |

---

## 7. REGIONAL LANGUAGE & VOICE AI STRATEGY

### The Challenge with Regional Languages
Most voice cloning models expect English text and either fail or apply Americanized accents when fed Kannada, Hindi, or Tamil phonemes.

### The Inheritance Solution
* **Script Autodetection Architecture**: By omitting restrictive ASCII language flags, `eleven_multilingual_v2` dynamically decodes native UTF-8 Unicode characters (Devanagari, Kannada, Tamil).
* **Benchmarked Synthesis Results**:
  - **Kannada (ಕನ್ನಡ)**: Natural cadence with accurate dental and retroflex consonants.
  - **Hindi (हिन्दी)**: Fluent northern and central dialect pacing.
  - **Tamil (தமிழ்)**: Accurate classical Dravidian prosody.
  - **English**: Natural Indian-English accent retention without artificial flattening.

---

## 8. HARDWARE & PHONE-FIRST INNOVATION (iQOO ALIGNMENT)

Inheritance was engineered from the ground up as a **phone-first application** optimized for the iQOO platform:

1. **Hardware-Accelerated Audio**: Leverages multi-mic hardware arrays for crisp voice isolation during family storytelling sessions.
2. **On-Device Local Intelligence**: Story indexing, transcript caching, and sentiment parsing run locally without requiring constant cloud round-trips.
3. **Office Kit Hybrid Workflow**: During development, the iQOO phone served as the dedicated real-time test and capture surface, while the paired laptop managed continuous compilation and Gradle packaging.
4. **Adaptive Display Hardware**: High-contrast, warm editorial interface styled specifically for high-refresh AMOLED screens, preserving battery life during extended storytelling sessions.

---

## 9. HACKATHON SCORING ALIGNMENT

| Judging Dimension | Weight | Project Delivery & Proof Points |
| :--- | :---: | :--- |
| **End Product Quality** | **30%** | Production-ready, fully functional Android APK with zero mock data. Responsive touch gestures, live audio playback, and rich visual feedback. |
| **Novelty & Impact** | **20%** | Reimagines family heritage from passive photo storage into an active, conversational voice legacy. High emotional and cultural value for Indian households. |
| **Creative Phone Use** | **15%** | Deep native hardware integration: microphone capture, camera portrait framing, FFT audio spectrum visualization, and custom Android launcher mipmaps. |
| **Technical Depth** | **15%** | Multi-model AI pipeline bridging Gemini Multimodal, OpenRouter Grounded RAG, and ElevenLabs Multilingual Voice Cloning into a seamless mobile workflow. |
| **Office Kit Usage** | **10%** | Real-time phone-first execution with seamless laptop synchronization for heavy build tasks and artifact management. |
| **Demo & Presentation** | **10%** | High-emotion narrative arc demonstrating real-time voice cloning in Kannada/Hindi and live interactive ancestor interrogation. |

---

## 10. LIVE 3-MINUTE HACKATHON DEMO SCRIPT

### [0:00 – 0:45] The Emotional Hook
* *"Judges, imagine if you could sit down today and have a conversation with your great-grandfather in his own voice, asking how he built your family home. Today, that wisdom is lost. Inheritance ensures it never happens again."*
* *(Hold up the iQOO device running Inheritance).*

### [0:45 – 1:45] Live Voice Cloning & Regional Synthesis
1. Open **Tribute Studio**.
2. Record a 20-second story of an elder and snap a quick portrait.
3. Tap **Generate Voice Memorial** — the AI extracts timbre and constructs the voice profile.
4. Tap **Kannada (ಕನ್ನಡ)** or **Hindi (हिन्दी)** and hit Play.
5. **Impact**: The phone plays synthesized audio in the elder's exact cloned voice and accent.

### [1:45 – 2:30] Grounded "Ask the Archive" (RAG)
1. Navigate to **Ask the Archive**.
2. Speak a prompt: *"What was grandfather's advice about handling difficult times?"*
3. The AI answers in real-time, displaying a **Grounded Audio Citation Pill**.
4. Tap the pill to play the raw historical clip recorded by the grandfather.

### [2:30 – 3:00] Keepsake Book & Conclusion
1. Show the **Heirloom Memoir Book** with formatted chapters and vintage portraits.
2. Demonstrate **Google Drive 1-Tap Backup**.
3. **Closing**: *"Inheritance turns ephemeral family memories into living, permanent heirlooms. Built phone-first for iQOO City Battles 2026. Thank you!"*

---

## 11. FUTURE ROADMAP

1. **Snapdragon NPU On-Device Voice Synthesis**: Running quantized local TTS models directly on the mobile NPU for 100% offline voice cloning.
2. **Generative Archival Video (Lip-Syncing Portraits)**: Animating vintage static portraits to match synthesized speech.
3. **NFC / QR Heirloom Audio Postcards**: Physical printable cards embedded with NFC chips that stream the ancestor's voice when scanned with any smartphone.

---
*Created for the iQOO City Battles Hackathon 2026 · Bengaluru, India*
