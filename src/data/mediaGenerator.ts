import { StoryEntry } from '../types';
import { SAMPLE_STORIES_RAW } from './sampleStories';

export async function hydrateEntries(): Promise<StoryEntry[]> {
  return SAMPLE_STORIES_RAW.map((raw) => ({
    ...raw,
    mediaBlob: null,
    mediaUrl: '',
  }));
}
