/**
 * db.ts — On-device local storage engine for Inheritance
 *
 * Implements:
 * 1. IndexedDB schema for Story Entries:
 *    { id, type, filePath, transcript, theme, prompt, timestamp, durationSeconds, language, ... }
 * 2. On-device media storage (Origin Private File System / IndexedDB Blob Store)
 * 3. Local QA response cache keyed by (question + context fingerprint)
 *
 * Zero-network dependency guaranteed.
 */

import { StoryEntry, Theme, Language } from '../types';

const DB_NAME = 'InheritanceArchive_v2';
const DB_VERSION = 2; // Incremented for multilingual schema support
const ENTRIES_STORE = 'entries';
const MEDIA_STORE = 'media_blobs';
const QA_CACHE_STORE = 'qa_cache';

export interface StoredEntrySchema {
  id: string;
  type: 'audio' | 'video';
  filePath: string;
  transcript: string;
  theme: Theme;
  prompt: string;
  timestamp: string;
  durationSeconds: number;
  title: string;
  pullQuote: string;
  speaker: string;
  approxYear: string;
  tags: string[];
  isSample: boolean;
  language?: Language;
}

export interface CachedQASchema {
  cacheKey: string;
  question: string;
  contextHash: string;
  response: {
    answer: string;
    groundedInStoryIds: string[];
    isGrounded: boolean;
    relevantQuote?: string;
    suggestedFollowUp?: string;
  };
  cachedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE);
      }
      if (!db.objectStoreNames.contains(QA_CACHE_STORE)) {
        db.createObjectStore(QA_CACHE_STORE, { keyPath: 'cacheKey' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ─── OPFS / Local File System Handler ─── */
async function saveToOPFS(fileName: string, blob: Blob): Promise<string> {
  try {
    if (navigator.storage && navigator.storage.getDirectory) {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return `opfs://inheritance/media/${fileName}`;
    }
  } catch (err) {
    console.warn('[Storage] OPFS write note:', err);
  }
  return `indexeddb://media/${fileName}`;
}

export async function readFromOPFS(fileName: string): Promise<Blob | null> {
  try {
    if (navigator.storage && navigator.storage.getDirectory) {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return file;
    }
  } catch {
    // Return null if not in OPFS
  }
  return null;
}

/* ─── Entry CRUD ─── */

export async function saveStoryToStorage(entry: StoryEntry): Promise<void> {
  const db = await openDB();

  // 1. Store media blob in OPFS + IndexedDB media_blobs store
  let filePath = `media_${entry.id}.${entry.type === 'video' ? 'webm' : 'wav'}`;
  if (entry.mediaBlob) {
    filePath = await saveToOPFS(filePath, entry.mediaBlob);

    // Save in IndexedDB as reliable fallback
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE);
      const req = store.put(entry.mediaBlob, entry.id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // 2. Store metadata in entries store conforming to exact required schema
  const record: StoredEntrySchema = {
    id: entry.id,
    type: entry.type,
    filePath: filePath,
    transcript: entry.transcript,
    theme: entry.theme,
    prompt: entry.prompt,
    timestamp: entry.recordedAt,
    durationSeconds: entry.mediaDurationSec,
    title: entry.title,
    pullQuote: entry.pullQuote,
    speaker: entry.speaker,
    approxYear: entry.approxYear,
    tags: entry.tags,
    isSample: entry.isSample,
    language: entry.language || 'en',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, 'readwrite');
    const store = tx.objectStore(ENTRIES_STORE);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getMediaBlobFromStorage(entryId: string): Promise<Blob | null> {
  // Check OPFS first
  const opfsBlob = await readFromOPFS(`media_${entryId}.webm`) || await readFromOPFS(`media_${entryId}.wav`);
  if (opfsBlob) return opfsBlob;

  // Fallback to IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const store = tx.objectStore(MEDIA_STORE);
      const req = store.get(entryId);
      req.onsuccess = () => {
        const result = req.result as Blob | undefined;
        resolve(result instanceof Blob ? result : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllStoredEntries(): Promise<StoryEntry[]> {
  try {
    const db = await openDB();
    const records = await new Promise<StoredEntrySchema[]>((resolve, reject) => {
      const tx = db.transaction(ENTRIES_STORE, 'readonly');
      const store = tx.objectStore(ENTRIES_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const entries: StoryEntry[] = [];
    for (const rec of records) {
      const blob = await getMediaBlobFromStorage(rec.id);
      const mediaUrl = blob ? URL.createObjectURL(blob) : '';
      entries.push({
        id: rec.id,
        type: rec.type,
        title: rec.title,
        prompt: rec.prompt,
        transcript: rec.transcript,
        mediaBlob: blob,
        mediaUrl: mediaUrl,
        mediaDurationSec: rec.durationSeconds,
        recordedAt: rec.timestamp,
        approxYear: rec.approxYear,
        theme: rec.theme,
        pullQuote: rec.pullQuote,
        speaker: rec.speaker,
        tags: rec.tags || [],
        isSample: rec.isSample,
        language: rec.language || 'en',
      });
    }
    return entries;
  } catch (err) {
    console.warn('[Storage] Could not read from IndexedDB:', err);
    return [];
  }
}

export async function purgeSampleEntries(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([ENTRIES_STORE, MEDIA_STORE], 'readwrite');
    const entryStore = tx.objectStore(ENTRIES_STORE);
    const mediaStore = tx.objectStore(MEDIA_STORE);

    const getAllReq = entryStore.getAll();
    getAllReq.onsuccess = () => {
      const all = getAllReq.result as StoredEntrySchema[];
      for (const item of all) {
        if (item.isSample || item.id.startsWith('story-')) {
          entryStore.delete(item.id);
          mediaStore.delete(item.id);
        }
      }
    };
  } catch (err) {
    console.warn('[Storage] Could not purge sample entries:', err);
  }
}

/* ─── QA Cache ─── */

export function computeQACacheKey(question: string, contextIds: string[]): string {
  const sortedIds = [...contextIds].sort().join(',');
  const normalizedQ = question.trim().toLowerCase();
  return `${normalizedQ}__context:[${sortedIds}]`;
}

export async function getCachedQAResponse(cacheKey: string): Promise<CachedQASchema['response'] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(QA_CACHE_STORE, 'readonly');
      const store = tx.objectStore(QA_CACHE_STORE);
      const req = store.get(cacheKey);
      req.onsuccess = () => {
        const result = req.result as CachedQASchema | undefined;
        if (result && result.response) {
          resolve(result.response);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedQAResponse(
  cacheKey: string,
  question: string,
  contextHash: string,
  response: CachedQASchema['response'],
): Promise<void> {
  try {
    const db = await openDB();
    const record: CachedQASchema = {
      cacheKey,
      question,
      contextHash,
      response,
      cachedAt: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QA_CACHE_STORE, 'readwrite');
      const store = tx.objectStore(QA_CACHE_STORE);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Storage] Could not write to QA cache:', err);
  }
}
