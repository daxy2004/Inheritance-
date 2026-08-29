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
3. [Competitive Analysis: What Others Do vs. What We Do Differently](#3-competitive-analysis-what-others-do-vs-what-we-do-differently)
4. [The Solution: Inheritance](#4-the-solution-inheritance)
5. [Local & On-Device Processing Architecture](#5-local--on-device-processing-architecture)
6. [Core Features & System Modules](#6-core-features--system-modules)
7. [Comprehensive Tech Stack & Function Directory](#7-comprehensive-tech-stack--function-directory)
8. [AI Inference, Regional Voice Strategy & RAG Pipeline](#8-ai-inference-regional-voice-strategy--rag-pipeline)
9. [Hardware & Phone-First Innovation (iQOO Alignment)](#9-hardware--phone-first-innovation-iqoo-alignment)
10. [Hackathon Scoring Alignment](#10-hackathon-scoring-alignment)
11. [Live 3-Minute Hackathon Demo Script](#11-live-3-minute-hackathon-demo-script)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. EXECUTIVE SUMMARY

> *"Every time an elder passes away, a whole library burns to the ground."*

**Inheritance** is an AI-powered intergenerational oral history studio designed to capture, preserve, synthesize, and converse with ancestral family wisdom. It converts unindexed voice recordings, vintage physical photographs, and handwritten heirloom recipes into a **living, searchable oral knowledge base and an interactive voice-cloned memoir**.

Unlike traditional photo albums or generic cloud storage, Inheritance brings memories to life: grandchildren don’t just read about their ancestors—they can **listen to stories synthesized in their grandparents' authentic cloned voice** and **ask open-ended questions directly to the family archive**, receiving grounded answers with exact audio citations across **Kannada, Hindi, Tamil, and English**.

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

1. **Extinction of Oral Folklore & Lineage**: Within 2 to 3 generations, over 90% of family struggles, cultural folklore, recipes, and ancestral life lessons are forgotten due to the transition to nuclear families.
2. **Static Media Lacks Soul**: Current solutions (Google Photos, WhatsApp family groups) treat family memories as flat files—thousands of photos without context, emotions, or the authentic cadence of the storyteller's voice.
3. **The Vernacular Divide**: Elders in India predominantly speak in regional vernaculars (**ಕನ್ನಡ, हिन्दी, தமிழ்**). Most digital memoir tools are English-centric and fail at capturing nuances in regional accents.
4. **Senior Usability Barrier**: Complex cloud applications are inaccessible to elderly storytellers, requiring a zero-friction, phone-first capture experience.

---

## 3. COMPETITIVE ANALYSIS: WHAT OTHERS DO VS. WHAT WE DO DIFFERENTLY

Most existing genealogy and family recording tools fall short in voice authenticity, language inclusivity, conversational search, and local privacy:

```
┌───────────────────────────┬──────────────┬──────────────┬──────────────┬─────────────────────────┐
│ Feature / Capability      │ StoryWorth   │ MyHeritage   │ HereAfter AI │ INHERITANCE (Our App)   │
├───────────────────────────┼──────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Primary Medium            │ Written Text │ DNA / Trees  │ English Voice│ Multilingual Voice+Tree │
│ Regional Indian Languages │ ❌ No        │ ❌ No        │ ❌ No        │ ✅ Kannada, Hindi,      │
│ (Kannada, Hindi, Tamil)   │              │              │              │    Tamil, English       │
│ Zero-Shot Voice Cloning   │ ❌ No        │ ❌ Deepfake  │ ❌ Heavy Rec │ ✅ 30s Voice Clone      │
│ Conversational RAG Q&A    │ ❌ No        │ ❌ No        │ ⚠️ Rigid Qs  │ ✅ Grounded Semantic    │
│ Audio Source Citations    │ ❌ No        │ ❌ No        │ ❌ No        │ ✅ Clickable Audio Pills│
│ Interactive Lineage Tree  │ ❌ No        │ ✅ Static    │ ❌ No        │ ✅ Interactive Audio    │
│ On-Device Local Vault     │ ❌ Cloud Lock│ ❌ Cloud Lock│ ❌ Cloud Lock│ ✅ Local IndexedDB +    │
│                           │              │              │              │    Personal Google Drive│
│ Senior-First Mobile UX    │ ❌ Email/Web │ ❌ Complex UI│ ⚠️ English UI│ ✅ 1-Tap Phone Record   │
└───────────────────────────┴──────────────┴──────────────┴──────────────┴─────────────────────────┘
```

### Key Differentiators & Moats:
1. **Zero-Shot Regional Indian Voice Cloning**:
   - *Competitors*: Either do not support audio or only offer English synthesis requiring hours of studio training.
   - *Inheritance*: Clones authentic timbre, cadence, and warmth from a single 30-second audio clip and synthesizes speech natively in **ಕನ್ನಡ, हिन्दी, தமிழ், and English**.
2. **True Grounded "Ask the Archive" (Ancestral RAG)**:
   - *Competitors*: StoryWorth only prints a hardbound book; HereAfter AI relies on canned, pre-recorded prompt-answer trees.
   - *Inheritance*: Performs open-domain semantic retrieval across all family memories. When answering *"Why did Ajja move to Bengaluru in 1968?"*, it responds conversationally and renders **clickable audio citation pills** that stream the exact original recording segment.
3. **Decentralized Data Sovereignty (No Vendor Lock-In)**:
   - *Competitors*: Hold family memories hostage behind recurring subscription paywalls.
   - *Inheritance*: Operates on a **local-first encrypted architecture**. Users own all raw MP3s, portraits, and JSON transcripts in their personal storage with one-tap sync to **their own Google Drive**.
4. **Multimodal Keepsake Architecture**:
   - Combines oral voice history, vintage portrait frames, handwritten recipe extraction, structured memoir chapters, and ambient acoustic soundscapes into a single cohesive experience.

---

## 4. THE SOLUTION: INHERITANCE

Inheritance bridges the generational gap by combining **conversational AI, zero-shot voice cloning, and a local-first encrypted archive**:

* **Capture**: Frictionless 1-tap audio capture with real-time waveform visualization and portrait attachment.
* **Preserve**: Automatic speech recognition, punctuation correction, sentiment tagging, and structured thematic chapters.
* **Resurrect**: Cross-lingual voice synthesis that speaks regional Indian languages using the storyteller's authentic acoustic signature.
* **Interact**: Grounded Retrieval-Augmented Generation (RAG) allowing any family member to query the archive as if conversing with the storyteller.

---

## 5. LOCAL & ON-DEVICE PROCESSING ARCHITECTURE

To ensure high responsiveness, battery efficiency, and strict privacy, Inheritance offloads significant compute to the phone's native hardware rather than making cloud round-trips for every action:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 ON-DEVICE PROCESSING                                  │
├───────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Real-Time Audio Engine:                                                            │
│    • 44.1kHz PCM Audio sampling via Web Audio API & MediaRecorder.                   │
│    • Real-time Fast Fourier Transform (FFT) spectrogram & waveform rendering.        │
│    • Hardware-accelerated mic gain normalization and noise suppression.               │
│                                                                                       │
│ 2. Local-First Encrypted Database:                                                    │
│    • Zero-latency local storage using IndexedDB & LocalStorage.                       │
│    • Audio Blobs & Keepsake Portraits stored as local URIs / Base64 buffers.          │
│    • Complete offline playback for all previously generated memoirs and recordings.   │
│                                                                                       │
│ 3. On-Device Lineage & Graph Calculations:                                            │
│    • Kinship traversal algorithms (parent-child-sibling relationships).                │
│    • Dynamic generational tree rendering without external graphing dependencies.     │
│                                                                                       │
│ 4. On-Device Speech Recognition Bridge:                                               │
│    • Native Android SpeechRecognizer integration via Capacitor for offline prompts.   │
│                                                                                       │
│ 5. Local Acoustic Heuristics & Sentiment Tagging:                                     │
│    • Rule-based sentiment classification & mood badge assignment (Nostalgic, Joy).   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. CORE FEATURES & SYSTEM MODULES

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

### Module 1: Multilingual Voice Memorial Studio ([`VoiceMemorialStudio.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/VoiceMemorialStudio.tsx))
* **Timbre & Acoustic Cadence Cloning**: Extracts voice embeddings from short (30–60s) audio recordings using ElevenLabs.
* **Cross-Lingual Synthesis**: Generates oral narratives in Kannada, Hindi, Tamil, and English while retaining the original speaker's pitch, warmth, and emotion.
* **Commemorative Keepsake Framing**: Associates captured portraits (`memorialPhotoUrl`) with voice profiles, displayed across all application views.

### Module 2: "Ask the Archive" Grounded RAG ([`AskArchive.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/AskArchive.tsx))
* **Grounded Conversational Search**: Family members can ask natural questions (e.g., *"How did grandmother start her small business in 1974?"*).
* **Hallucination-Free Audio Citations**: Cites specific recorded memories with clickable interactive audio pills that immediately stream the exact original recording segment.
* **Fast Inference**: Powered by OpenRouter's high-speed reasoning models with low latency.

### Module 3: Heirloom Keepsake Memoir Book ([`HeirloomBook.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/HeirloomBook.tsx))
* **Chapter Generation**: Automatically categorizes oral transcripts into rich biographical chapters (*Early Childhood, Love & Marriage, Heritage Recipes, Life Wisdom*).
* **Warm Editorial Aesthetic**: Custom typography, antique paper gradients (`#FAF7F2` and `#8B4513`), vintage framing, and ambient audio soundscapes.

### Module 4: Living Family Tree & Lineage Map ([`FamilyView.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/FamilyView.tsx))
* **Node-Based Relationship Visualization**: Connects ancestors and living descendants with relationship tags (Grandparent, Parent, Sibling, Child).
* **Milestone Playback**: Tapping any node opens the ancestor's voice bio, attached stories, and commemorative photographs.

### Module 5: Google Drive Cloud Vault ([`GoogleDriveBackup.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/GoogleDriveBackup.tsx))
* **Data Sovereignty**: All stories and audio recordings persist locally via IndexedDB and SQLite.
* **One-Tap Family Sync**: Direct integration with Google Drive API v3 to sync a complete portable `Inheritance_Vault.json` package across devices with zero vendor lock-in.

---

## 7. COMPREHENSIVE TECH STACK & FUNCTION DIRECTORY

### System Technology Stack

| Layer | Component | Details / Rationale |
| :--- | :--- | :--- |
| **Mobile Runtime** | Android Native (API 26+) | Built with Java 17, Gradle 8.14, packaged via Capacitor 6 |
| **Frontend Framework** | React 18 + Vite 6 | Fast bundle execution, ultra-low memory footprint |
| **Language** | TypeScript 5 | End-to-end type safety across audio and AI payloads |
| **Styling** | Custom Vanilla CSS + Tailwind | Glassmorphic cards, antique gold accents (`#E2A63B`), espresso tones (`#200E05`) |
| **Audio Engine** | Web Audio API / MediaRecorder | Native microphone capture, FFT spectrum analysis, ambient crackle layering |
| **Multimodal LLM** | Google Gemini 3.5 / 3.6 Flash | Zero-latency audio transcription and story extraction |
| **RAG & Search** | OpenRouter (Minimax M3 / V4) | Grounded ancestor question-answering with strict source verification |
| **Voice Cloning** | ElevenLabs `eleven_multilingual_v2` | Zero-shot multilingual voice cloning with Indic script autodetection |
| **Cloud Backup** | Google Drive API v3 (OAuth 2.0) | User-owned decentralized cloud vault |
| **Branding / Icons** | Native GDI+ C# Pipeline | Custom high-DPI Android mipmaps and adaptive launcher icons |

### Key Functions & Code Architecture

| File / Component | Primary Functions & Hooks | Description |
| :--- | :--- | :--- |
| [`src/services/aiDirectService.ts`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/services/aiDirectService.ts) | `generateVoiceMemorialDirect()`, `askArchiveDirect()`, `transcribeAudioDirect()` | Central AI orchestration for Gemini Multimodal, OpenRouter RAG, and ElevenLabs regional voice synthesis. |
| [`src/components/VoiceMemorialStudio.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/VoiceMemorialStudio.tsx) | `handleStartRecording()`, `handleStopRecording()`, `handleSynthesize()`, `handleSaveToArchive()` | 3-step voice cloning workflow: live audio capture, voice embedding extraction, and multilingual audio synthesis. |
| [`src/components/AskArchive.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/AskArchive.tsx) | `handleAsk()`, `playStoryAudio()`, `renderCitationPills()` | Semantic search interface that parses user queries against story memories and streams grounded citations. |
| [`src/components/FamilyView.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/FamilyView.tsx) | `EntryCard()`, `filterEntriesByMember()`, `handleExpandStory()` | Renders living story cards with commemorative portrait avatars, voice player, and transcript badges. |
| [`src/components/HeirloomBook.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/HeirloomBook.tsx) | `organizeChapters()`, `renderStoryKeepsake()`, `toggleSoundscape()` | Editorial book reader with structured biographical chapters and vintage keepsake portrait frames. |
| [`src/components/GoogleDriveBackup.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/components/GoogleDriveBackup.tsx) | `handleConnectDrive()`, `handleBackupVault()`, `handleRestoreVault()` | OAuth 2.0 Google Drive bridge for exporting and restoring the entire `Inheritance_Vault.json`. |
| [`src/state/AppContext.tsx`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/state/AppContext.tsx) | `useApp()`, `addStoryEntry()`, `updateFamilyMembers()`, `setCurrentLanguage()` | Global reactive state container managing story entries, family tree nodes, and active user session. |

---

## 8. AI INFERENCE, REGIONAL VOICE STRATEGY & RAG PIPELINE

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                             MULTIMODAL AI & RAG PIPELINE                              │
├───────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Raw Audio Stream ──▶ Google Gemini 3.5/3.6 Flash                                   │
│    • Low-latency audio transcription into clean verbatim text.                        │
│    • Automatic extraction of Story Title, Thematic Chapter, and Emotional Tone.       │
│                                                                                       │
│ 2. Audio Sample ──▶ ElevenLabs Voice Cloning Engine                                   │
│    • Extracts 128-dimensional acoustic timbre & pitch embeddings.                     │
│    • Generates a persistent Instant Voice Model ID.                                   │
│                                                                                       │
│ 3. Vernacular Speech Synthesis ──▶ `eleven_multilingual_v2`                           │
│    • Omission of restrictive ASCII language flags for native Indic script detection.  │
│    • High-fidelity synthesis in Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Tamil (தமிழ்), English.│
│                                                                                       │
│ 4. Grounded RAG Query ──▶ OpenRouter (Minimax M3 / DeepSeek V4)                       │
│    • Injects all family memory transcripts into system context prompt.                │
│    • Enforces strict grounding rules: answers only using cited story IDs.             │
│    • Returns structured JSON with `answer` and `groundedStoryIds` array.              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. HARDWARE & PHONE-FIRST INNOVATION (iQOO ALIGNMENT)

Inheritance was engineered from the ground up as a **phone-first application** optimized for the iQOO platform:

1. **Hardware-Accelerated Audio**: Leverages multi-mic hardware arrays for crisp voice isolation during family storytelling sessions.
2. **On-Device Local Intelligence**: Story indexing, transcript caching, and sentiment parsing run locally without requiring constant cloud round-trips.
3. **Office Kit Hybrid Workflow**: During development, the iQOO phone served as the dedicated real-time test and capture surface, while the paired laptop managed continuous compilation and Gradle packaging.
4. **Adaptive Display Hardware**: High-contrast, warm editorial interface styled specifically for high-refresh AMOLED screens, preserving battery life during extended storytelling sessions.

---

## 10. HACKATHON SCORING ALIGNMENT

| Judging Dimension | Weight | Project Delivery & Proof Points |
| :--- | :---: | :--- |
| **End Product Quality** | **30%** | Production-ready, fully functional Android APK with zero mock data. Responsive touch gestures, live audio playback, and rich visual feedback. |
| **Novelty & Impact** | **20%** | Reimagines family heritage from passive photo storage into an active, conversational voice legacy. High emotional and cultural value for Indian households. |
| **Creative Phone Use** | **15%** | Deep native hardware integration: microphone capture, camera portrait framing, FFT audio spectrum visualization, and custom Android launcher mipmaps. |
| **Technical Depth** | **15%** | Multi-model AI pipeline bridging Gemini Multimodal, OpenRouter Grounded RAG, and ElevenLabs Multilingual Voice Cloning into a seamless mobile workflow. |
| **Office Kit Usage** | **10%** | Real-time phone-first execution with seamless laptop synchronization for heavy build tasks and artifact management. |
| **Demo & Presentation** | **10%** | High-emotion narrative arc demonstrating real-time voice cloning in Kannada/Hindi and live interactive ancestor interrogation. |

---

## 11. LIVE 3-MINUTE HACKATHON DEMO SCRIPT

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

## 12. FUTURE ROADMAP

1. **Snapdragon NPU On-Device Voice Synthesis**: Running quantized local TTS models directly on the mobile NPU for 100% offline voice cloning.
2. **Generative Archival Video (Lip-Syncing Portraits)**: Animating vintage static portraits to match synthesized speech.
3. **NFC / QR Heirloom Audio Postcards**: Physical printable cards embedded with NFC chips that stream the ancestor's voice when scanned with any smartphone.

---
*Created for the iQOO City Battles Hackathon 2026 · Bengaluru, India*
