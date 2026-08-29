/**
 * AppContext.tsx — Application state management with multilingual & on-device storage
 *
 * Persists entries, transcripts, and media blobs to local IndexedDB / OPFS.
 * Supports English (en), Hindi (hi), Kannada (kn), and Tamil (ta).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StoryEntry, QAMessage, MemoirBook, Language } from '../types';
import { INITIAL_SPEAKER_NAME } from '../data/sampleStories';
import { tagTheme } from '../processing/onDevice';
import { askArchive as cloudAskArchive, generateMemoir as cloudGenerateMemoir } from '../processing/cloud';
import { getAllStoredEntries, saveStoryToStorage, purgeSampleEntries } from '../storage/db';
import { hydrateEntries } from '../data/mediaGenerator';
import { TRANSLATIONS, TranslationDictionary } from '../i18n/translations';
import { requestGoogleToken, fetchGoogleProfile, getOrCreateDriveFolder, uploadFileToDrive, syncAllEntriesToDrive } from '../services/googleDriveService';

export interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
  folderId?: string;
  folderUrl?: string;
}

interface AppState {
  entries: StoryEntry[];
  speakerName: string;
  qaHistory: QAMessage[];
  memoir: MemoirBook | null;
  isLoading: boolean;
  isAsking: boolean;
  isGeneratingMemoir: boolean;
  language: Language;
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
  addEntry: (entry: StoryEntry) => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  generateMemoir: () => void;
  reloadEntriesFromStorage: () => Promise<void>;
  googleUser: GoogleUserInfo | null;
  isSyncingDrive: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => void;
  syncAllToGoogleDrive: () => Promise<number>;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const LANG_PREF_KEY = 'inheritance_user_lang_pref';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<StoryEntry[]>([]);
  const [speakerName] = useState(INITIAL_SPEAKER_NAME);
  const [qaHistory, setQaHistory] = useState<QAMessage[]>([]);
  const [memoir, setMemoir] = useState<MemoirBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const [isGeneratingMemoir, setIsGeneratingMemoir] = useState(false);

  // Multilingual preference (defaults to English or saved preference)
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_PREF_KEY) as Language;
      if (saved && ['en', 'hi', 'kn', 'ta'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_PREF_KEY, lang);
    } catch {}
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Initialize storage on mount
  const initStorage = useCallback(async () => {
    try {
      const stored = await getAllStoredEntries();
      if (stored.length > 0) {
        setEntries(stored);
      } else {
        // Hydrate rich multilingual stories on fresh install
        const initial = await hydrateEntries();
        for (const entry of initial) {
          try {
            await saveStoryToStorage(entry);
          } catch {}
        }
        setEntries(initial);
      }
    } catch (err) {
      console.warn('[AppContext] Storage initialization note:', err);
      const fallback = await hydrateEntries();
      setEntries(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initStorage();
  }, [initStorage]);

  // Google Auth & Auto-Drive Sync State
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(() => {
    try {
      const saved = localStorage.getItem('inheritance_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);

  const syncAllToGoogleDrive = useCallback(async (): Promise<number> => {
    if (!googleUser?.accessToken || !googleUser?.folderId) return 0;
    setIsSyncingDrive(true);
    try {
      const count = await syncAllEntriesToDrive(
        googleUser.accessToken,
        googleUser.folderId,
        speakerName,
        entries
      );
      return count;
    } catch (err) {
      console.warn('[Sync all to Google Drive error]', err);
      return 0;
    } finally {
      setIsSyncingDrive(false);
    }
  }, [googleUser, speakerName, entries]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const token = await requestGoogleToken();
      const profile = await fetchGoogleProfile(token);
      const folderId = await getOrCreateDriveFolder(token, `${speakerName}'s Living Family Archive`);
      const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

      const userInfo: GoogleUserInfo = {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        accessToken: token,
        folderId,
        folderUrl,
      };

      setGoogleUser(userInfo);
      try {
        localStorage.setItem('inheritance_google_user', JSON.stringify(userInfo));
      } catch {}

      // Immediately sync all existing stored memories & Google Doc to Drive!
      setIsSyncingDrive(true);
      syncAllEntriesToDrive(token, folderId, speakerName, entries)
        .catch((e) => console.warn('[Initial Drive Sync note]', e))
        .finally(() => setIsSyncingDrive(false));
    } catch (err: any) {
      console.warn('[Google Sign-In error]', err);
      throw err;
    }
  }, [speakerName, entries]);

  const signOutGoogle = useCallback(() => {
    setGoogleUser(null);
    try {
      localStorage.removeItem('inheritance_google_user');
    } catch {}
  }, []);

  const addEntry = useCallback(async (entry: StoryEntry) => {
    // 1. Run multilingual on-device theme tagging
    const theme = entry.theme || tagTheme(entry.transcript, entry.language || language);
    const completeEntry: StoryEntry = {
      ...entry,
      theme,
      language: entry.language || language,
    };

    // 2. Persist to on-device storage (IndexedDB + OPFS)
    try {
      await saveStoryToStorage(completeEntry);
    } catch (err) {
      console.warn('[AppContext] Could not save entry to IndexedDB:', err);
    }

    const updatedList = [completeEntry, ...entries];
    setEntries(updatedList);

    // 3. Automatic Google Drive Background Sync if user is signed in
    if (googleUser?.accessToken && googleUser?.folderId) {
      setIsSyncingDrive(true);
      syncAllEntriesToDrive(
        googleUser.accessToken,
        googleUser.folderId,
        speakerName,
        updatedList
      )
        .catch((driveErr) => console.warn('[Auto Google Drive Upload failed]', driveErr))
        .finally(() => setIsSyncingDrive(false));
    }
  }, [language, googleUser, entries, speakerName]);

  const askQuestion = useCallback(async (question: string) => {
    const userMsg: QAMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      groundedInIds: [],
      timestamp: new Date().toISOString(),
      language,
    };
    setQaHistory((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const answer = await cloudAskArchive(question, entries, speakerName, language);
      setQaHistory((prev) => [...prev, answer]);
    } catch (err) {
      console.error('[AppContext] Ask question error:', err);
    } finally {
      setIsAsking(false);
    }
  }, [entries, speakerName, language]);

  const genMemoir = useCallback(() => {
    setIsGeneratingMemoir(true);
    const book = cloudGenerateMemoir(entries, speakerName, language);
    setMemoir(book);
    setIsGeneratingMemoir(false);
  }, [entries, speakerName, language]);

  return (
    <AppContext.Provider
      value={{
        entries,
        speakerName,
        qaHistory,
        memoir,
        isLoading,
        isAsking,
        isGeneratingMemoir,
        language,
        t,
        setLanguage,
        addEntry,
        askQuestion,
        generateMemoir: genMemoir,
        reloadEntriesFromStorage: initStorage,
        googleUser,
        isSyncingDrive,
        signInWithGoogle,
        signOutGoogle,
        syncAllToGoogleDrive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
