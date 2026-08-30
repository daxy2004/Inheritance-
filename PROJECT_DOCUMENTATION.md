# Inheritance — Living Oral Family Memoir & Interactive Ancestral Archive

---

## 1. Project Overview
**Inheritance** is an AI-powered intergenerational oral history application designed to preserve, synthesize, and converse with ancestral family wisdom. It captures spoken audio recordings, selfie video reflections, vintage portraits, and heirloom recipes, converting them into a **searchable oral knowledge base and an interactive voice-cloned memoir**.

Descendants do not just read static text—they can **listen to stories synthesized in their grandparents' authentic cloned voice** and **ask open-ended questions directly to the family archive**, receiving grounded answers with exact audio citations across **Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Tamil (தமிழ்), and English**.

---

## 2. Problem We Solve
1. **Loss of Oral Lineage & Heritage**: Within 2 to 3 generations, over 90% of family struggles, cultural folklore, heirloom recipes, and life advice are permanently lost.
2. **Static Photos & Text Lack Soul**: Traditional photo galleries and WhatsApp chats treat family memories as unindexed flat files without emotional vocal timbre or context.
3. **The Vernacular Language Barrier**: Indian elders predominantly speak in regional vernaculars (**Kannada, Hindi, Tamil**). Most existing genealogy tools are English-only and fail to capture regional accents.
4. **Senior-Friendly Capture**: Elders struggle with complex apps. Inheritance offers a 1-tap phone recording studio with live prompts and visual feedback.

---

## 3. What We Do Differently (Competitive Advantage)

| Capability | StoryWorth | MyHeritage | HereAfter AI | **INHERITANCE (Our App)** |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Medium** | Printed Text Only | DNA / Static Trees | English Audio | **Multilingual Audio + Video + Interactive Tree** |
| **Regional Languages** | ❌ None | ❌ None | ❌ None | ✅ **Kannada, Hindi, Tamil, English** |
| **Voice Cloning** | ❌ No | ❌ Video Deepfake | ❌ Rigid / Complex | ✅ **Instant Multilingual Voice Clone** |
| **Conversational Search (RAG)** | ❌ No | ❌ No | ⚠️ Rigid Canned Trees | ✅ **Grounded Semantic Q&A with Audio Citations** |
| **Clickable Audio Citations** | ❌ No | ❌ No | ❌ No | ✅ **Streams exact source recording snippet** |
| **Data Ownership** | ❌ Proprietary Lock-in | ❌ Proprietary Lock-in | ❌ Cloud Only | ✅ **On-Device Local Vault + Personal Google Drive** |
| **Form Factor** | ❌ Web / Email | ❌ Desktop / Web | ⚠️ English Mobile | ✅ **Phone-First Native Android (Capacitor) + PWA** |

---

## 4. Local (On-Device) vs. Cloud Processing Breakdown

To ensure high speed, battery efficiency, and zero cloud lock-in, the system splits workloads between native on-device processing and cloud AI inference:

### A. What Runs 100% Locally (On-Device):
1. **Web Audio Signal Extraction & Downsampling**:
   - Uses native `AudioContext` and `OfflineAudioContext` directly on the device to extract pure audio tracks from video and audio streams.
   - Resamples audio on-the-fly into clean 16kHz mono WAV PCM buffers, reducing upload payload sizes by ~85%.
2. **Real-Time 64-Band FFT Audio Visualizer**:
   - Computes Fast Fourier Transform frequency bins in real time via `AnalyserNode` at 60 FPS directly on the phone's GPU canvas during recording.
3. **Encrypted Local Storage Vault**:
   - All audio clips, video blobs, vintage portraits, and JSON transcripts are stored locally inside **IndexedDB** (`idb-keyval`) and LocalStorage for 100% offline access.
4. **Kinship Graph & Lineage Engine**:
   - Generational depth calculation, parent-child-sibling relational mapping, and branch filtering are computed locally in pure TypeScript.
5. **Offline Keyword Search & Theme Classifier**:
   - Rule-based heuristic classifier automatically tags memories into categories (*Childhood, Family, Career, Values, Recipes*) across all supported languages offline.

### B. What Runs in the Cloud (API Invocations):
1. **Multimodal Speech-to-Text Transcription**:
   - Google Gemini 3.6 / 3.5 Flash & OpenRouter `google/gemini-2.5-flash` for high-precision vernacular transcription.
2. **Grounded RAG Ancestor Q&A ("Ask")**:
   - OpenRouter (`minimax/minimax-m3` & `deepseek/deepseek-v4-pro`) / Gemini Flash. Strictly grounded on stored transcripts with zero hallucination.
3. **Instant Multilingual Voice Cloning**:
   - ElevenLabs `eleven_multilingual_v2` for cross-lingual speech synthesis retaining the elder's authentic vocal timbre.
4. **Decentralized Cloud Backup**:
   - Google Drive API v3 (OAuth 2.0) allowing users to backup and restore their archive to their personal Google Drive.

> **Note on Local LLMs**: Heavy neural LLM weights (e.g. 7B/8B GGUF) are deliberately **not** executed on-device to prevent extreme battery drain, RAM crashes, and thermal throttling on mobile devices.

---

## 5. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Mobile Runtime** | Android Native (API 26+), Capacitor 6, Java 17, Gradle 8.14 |
| **Frontend Framework** | React 18, Vite 6, TypeScript 5 |
| **Styling & UI** | Custom Vanilla CSS, Tailwind CSS, Lucide Icons, Canvas API |
| **Audio Processing** | Web Audio API, `AudioContext`, `OfflineAudioContext`, `MediaRecorder` |
| **Local Storage** | IndexedDB (`idb-keyval`), LocalStorage, OPFS |
| **AI Transcription** | Google Gemini 3.6/3.5/3.7 Flash, OpenRouter Multimodal Flash |
| **Conversational RAG** | OpenRouter (`minimax/minimax-m3`, `deepseek/deepseek-v4-pro`), Gemini Flash |
| **Voice Cloning & TTS** | ElevenLabs Multilingual v2 (`eleven_multilingual_v2`) |
| **Cloud Backup** | Google Drive API v3, Google OAuth 2.0 (`@codetrix-studio/capacitor-google-auth`) |

---

## 6. Core Application Modules & Functions

### 1. Recording Studio (`src/components/CaptureBooth.tsx`)
- **`startRecording(type: 'audio' | 'video')`**: Captures native mic and camera stream, renders live 64-band canvas waveform, and streams to `MediaRecorder`.
- **`stopRecording()`**: Finalizes recording blob and triggers automatic client-side audio extraction and Gemini transcription.
- **`handleAiTranscribe(blob)`**: Converts speech in video/audio into verbatim text across Kannada, Hindi, Tamil, or English.
- **`saveStory()`**: Persists entry with title, theme, audio/video blob, and transcript into IndexedDB.

### 2. Voice Memorial & Tribute Studio (`src/components/VoiceMemorialStudio.tsx`)
- **`startLiveRecording()` / `handleAudioUpload()`**: Captures 5–30s reference voice sample of the elder.
- **`handleGenerateNarrative()`**: Generates a heartfelt, first-person oral monologue via Gemini/OpenRouter in the selected regional language.
- **`synthesizeNeuralVoice()`**: Calls ElevenLabs voice cloning API to create a custom voice model and synthesizes speech in the elder's cloned voice.
- **`handleTogglePlay()`**: Plays back cloned audio at natural 1.0x human cadence with synchronized word highlighting.

### 3. Ask the Archive — Grounded RAG (`src/components/AskArchive.tsx`)
- **`handleSubmit()`**: Sends user query along with all stored family transcripts to the RAG engine.
- **`directAskArchive()` ([`src/services/aiDirectService.ts`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/services/aiDirectService.ts))**: Queries OpenRouter / Gemini with strict zero-hallucination prompts.
- **`renderCitationPills()`**: Renders clickable audio chips linking directly to the specific recording that proves the answer.

### 4. Living Family Tree (`src/components/FamilyView.tsx`)
- **`buildKinshipTree()`**: Traverses stored family members into hierarchical generational layers (Grandparents $\rightarrow$ Parents $\rightarrow$ Children).
- **`MemberCard()`**: Displays member portrait, relation tag, and count of preserved stories with quick playback.

### 5. Heirloom Memoir Book (`src/components/HeirloomBook.tsx`)
- **`organizeChapters()`**: Automatically clusters recorded transcripts into thematic memoir chapters (*Childhood, Values, Career, Recipes*).
- **`SoundscapeController`**: Plays ambient warm crackle audio while reading the editorial digital book.

### 6. Personal Cloud Vault Sync (`src/components/GoogleDriveBackup.tsx`)
- **`signInWithGoogle()`**: Authenticates user via Google OAuth 2.0.
- **`syncAllEntriesToDrive()` ([`src/services/googleDriveService.ts`](file:///c:/Users/Dhruv/Downloads/inheritance%20%281%29/src/services/googleDriveService.ts))**: Exports all audio blobs, images, and JSON metadata into a user-owned Google Drive folder (`Living Family Archive`).

---

## 7. Project File Structure

```
inheritance/
├── android/                        # Capacitor Android native project & Gradle build scripts
├── public/                         # PWA manifest, service worker, app icons & branding assets
├── src/
│   ├── components/
│   │   ├── CaptureBooth.tsx        # Video & audio story recording studio with live FFT wave
│   │   ├── VoiceMemorialStudio.tsx # Instant voice cloning & multilingual monologue studio
│   │   ├── AskArchive.tsx          # Conversational grounded RAG search with audio citations
│   │   ├── FamilyView.tsx          # Interactive kinship tree & family member explorer
│   │   ├── HeirloomBook.tsx        # Auto-chaptered editorial memoir book with soundscapes
│   │   ├── GoogleDriveBackup.tsx   # Google Drive backup and vault synchronization
│   │   ├── MediaPlayer.tsx         # Universal audio/video player with waveform visualizer
│   │   └── LanguageSelector.tsx    # Dynamic language switcher (Kannada, Hindi, Tamil, English)
│   ├── services/
│   │   ├── aiDirectService.ts      # Direct API engine (Gemini, OpenRouter, ElevenLabs)
│   │   └── googleDriveService.ts   # Google Drive REST API v3 backup and restore engine
│   ├── storage/
│   │   └── db.ts                   # IndexedDB storage layer and cache management
│   ├── state/
│   │   └── AppContext.tsx          # Global reactive state for stories, family, and auth
│   ├── i18n/
│   │   └── translations.ts         # Full UI localization dictionary for 4 languages
│   ├── types.ts                    # Core TypeScript interfaces (StoryEntry, Member, QAMessage)
│   └── main.tsx                    # React application bootstrap and routing
├── PROJECT_DOCUMENTATION.md        # Comprehensive technical dossier
└── package.json                    # Dependencies and scripts
```
