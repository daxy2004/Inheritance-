# 🌳 Inheritance — The Living Oral Family Archive

> *"Because every grandmother's recipe, grandfather's struggle, and elder's bedtime tale deserves to live forever in their own authentic voice."*

<div align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Inheritance Logo" />
  <p><strong>A privacy-first, multilingual living oral history vault powered by grounded AI and automated Google Drive archival.</strong></p>

  [![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-7.0-119EFF.svg?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
  [![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20APK-green.svg?style=flat-square)]()
</div>

---

## 📖 About The Project

Generations of wisdom, family recipes, laughter, and heritage are lost simply because they were never recorded. Traditional family trees only store static names and dates—they cannot capture a grandmother's gentle laughter, the exact cadence of a grandfather's dialect, or the story of how a family migrated decades ago.

**Inheritance** bridges generations by turning smartphones into an **interactive oral memoir studio**. It captures raw spoken stories, transcribes them across multiple Indian and world languages, indexes them into a searchable voice archive, creates AI keepsake books, and syncs everything directly to the family's **private Google Drive**.

---

## ✨ Key Features

### 🎙️ 1. Multilingual Voice & Video Booth
* **Guided Prompts**: Curated prompts in **English, हिन्दी (Hindi), ಕನ್ನಡ (Kannada), and தமிழ் (Tamil)** covering childhood memories, recipes, marriage, migration, folklore, and life lessons.
* **Live 64-Band Canvas FFT Visualizer**: Real-time acoustic frequency visualization during recording.
* **On-Device Audio Extraction**: Web Audio API extracting 16kHz mono WAV PCM streams from video and audio containers for instant transcription.
* **Multimodal Transcription**: Speech-to-text powered by Gemini AI with automatic native script formatting and theme tagging.

### 🕊️ 2. Voice Memorial & Tribute Studio
* **Instant Voice Synthesis**: Neural voice cloning via ElevenLabs Multilingual v2 with tuned pitch, stability, and speed.
* **Memorial Portrait Framing**: Attach keepsake photos to voices for interactive remembrance.
* **Custom Persona Profiles**: Preserve distinct elder vocal personas (e.g. *Ajji / Dadi / Grandma*).

### 🌳 3. Kinship Tree & Living Family Archive
* **Interactive Kinship Graph**: Visual relationship tree connecting elders, parents, siblings, and descendants.
* **Filter by Theme & Decade**: Explore stories categorized by Childhood, Career, Wisdom, Romance, Recipes, and Heritage.
* **Embedded Media Player**: Listen to authentic recordings alongside highlighted pull-quotes and transcripts.

### 💬 4. "Ask the Archive" (Grounded Oral RAG)
Ask questions like *"How did Dadi make her signature rasam?"* or *"What did Grandpa do during the 1970s?"*:
* **Cloud Mode**: Contextually grounded reasoning powered by OpenRouter / Gemini Flash.
* **⚡ 100% On-Device Offline Mode**:
  * Multilingual stopword removal and keyword tokenization (English, Kannada, Hindi, Tamil).
  * On-device TF-IDF semantic scoring with 0ms network latency.
  * Extractive grounding that cites the exact sentence and presents a **playable audio citation pill** streaming directly from on-device IndexedDB.

### 📖 5. Heirloom Keepsake Book
* **AI Memoir Synthesis**: Synthesizes transcribed recordings into structured, narrative chapters with prologue, core stories, and words of wisdom.
* **Google Docs Integration**: Formatted for 1-click export to Google Docs and PDF printing.

### ☁️ 6. Automated Private Google Drive Sync
* **100% Personal Privacy**: Stories, audio files, transcripts, and books are stored in a dedicated folder in the user's **personal Google Drive**.
* **On-Device Local Vault**: Full offline support using IndexedDB + Origin Private File System (OPFS) with 1-tap local access.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Core** | React 18, TypeScript, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Google Fonts (*Newsreader, Plus Jakarta Sans, Outfit*) |
| **Mobile Runtime** | Capacitor 7 (Android native wrapper & APK build) |
| **Audio Processing** | Web Audio API (`AudioContext`, `OfflineAudioContext`), 64-band Canvas FFT |
| **Local Storage** | IndexedDB (`InheritanceArchive_v2`), Origin Private File System (OPFS) |
| **Cloud Storage** | Google Drive REST API v3, Google Identity Services (OAuth 2.0) |
| **AI Models (Cloud)** | Google Gemini 2.5 Flash, OpenRouter DeepSeek, ElevenLabs Multilingual v2 |
| **Offline RAG Engine** | On-Device Multilingual Tokenizer, Thematic Synonyms & TF-IDF Extractive Ranker |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [npm](https://www.npmjs.com/) (v9.0.0 or higher)
* *(Optional for Android APK build)*: [Android Studio](https://developer.android.com/studio) with Android SDK & Java 17+

### 1. Clone the Repository
```bash
git clone https://github.com/daxy2004/Inheritance-.git
cd Inheritance-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```
> **Note**: Inheritance runs **100% locally out-of-the-box** using on-device IndexedDB and local offline RAG. Cloud AI and Google Drive sync keys can be added to `.env` as needed:
```env
OPENROUTER_API_KEY="your_openrouter_api_key"
GEMINI_API_KEY="your_gemini_api_key"
ELEVENLABS_API_KEY="your_elevenlabs_api_key"
GOOGLE_CLIENT_ID="your_google_oauth_client_id.apps.googleusercontent.com"
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📱 Android APK Compilation

To build and compile the native Android APK:

```bash
# 1. Build web production bundle
npm run build

# 2. Sync web assets with Capacitor Android project
npx @capacitor/cli copy android

# 3. Compile Debug APK with Gradle
cd android
./gradlew assembleDebug
cd ..

# The output APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Privacy & Data Sovereignty

* **No Third-Party Database**: Inheritance has no centralized database holding user memories.
* **Client-to-Drive Architecture**: All recordings, photos, and transcripts travel directly from the user's phone to their **own private Google Drive** and local device storage.
* **Offline First**: All memories remain accessible even when in Airplane Mode or in remote villages without internet connectivity.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
