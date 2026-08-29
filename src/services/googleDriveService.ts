/**
 * googleDriveService.ts — Google Identity Services (OAuth 2.0) and Google Drive API v3 helpers
 */

import { getMediaBlobFromStorage } from '../storage/db';
import { StoryEntry } from '../types';

export const DEFAULT_CLIENT_ID = '249104411965-5sa7u1mojbjejsqnp5fkrma77hu01mkr.apps.googleusercontent.com';

/* ─── 1. Request Google Drive OAuth Token ─── */
export function requestGoogleToken(clientId = DEFAULT_CLIENT_ID): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&include_granted_scopes=true&prompt=consent`;

    // Try Google Identity Services first if available
    const initGsi = () => {
      try {
        const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token returned'));
            }
          },
        });
        if (client) {
          client.requestAccessToken();
          return;
        }
      } catch (e) {
        console.warn('[GSI error, falling back to direct OAuth]', e);
      }
      fallbackOAuth();
    };

    const fallbackOAuth = () => {
      try {
        const popup = window.open(authUrl, '_blank', 'width=500,height=650');
        if (!popup) {
          window.location.href = authUrl;
          return;
        }

        const interval = setInterval(() => {
          try {
            if (!popup || popup.closed) {
              clearInterval(interval);
              reject(new Error('Sign in window closed'));
              return;
            }
            if (popup.location && popup.location.hash && popup.location.hash.includes('access_token=')) {
              const hash = popup.location.hash.substring(1);
              const params = new URLSearchParams(hash);
              const token = params.get('access_token');
              clearInterval(interval);
              popup.close();
              if (token) resolve(token);
              else reject(new Error('No access token found'));
            }
          } catch (e) {
            // Expected cross-origin check while user is on google.com
          }
        }, 600);
      } catch (err) {
        window.location.href = authUrl;
      }
    };

    if (!(window as any).google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGsi();
      script.onerror = () => fallbackOAuth();
      document.body.appendChild(script);
    } else {
      initGsi();
    }
  });
}

/* ─── 2. Fetch User Profile ─── */
export async function fetchGoogleProfile(accessToken: string): Promise<{ email: string; name: string; picture: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        email: data.email || 'Google User',
        name: data.name || 'User',
        picture: data.picture || '',
      };
    }
  } catch (e) {
    console.warn('[Profile fetch]', e);
  }
  return { email: 'Google Drive Connected', name: 'User', picture: '' };
}

/* ─── 3. Create / Get Living Archive Folder ─── */
export async function getOrCreateDriveFolder(accessToken: string, folderName = 'Inheritance Living Family Archive'): Promise<string> {
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }
  } catch (err) {
    console.warn('[Folder search note]', err);
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Could not create Drive folder: ${errText}`);
  }
  const folderData = await createRes.json();
  return folderData.id;
}

/* ─── 4. Upload Audio or File to Google Drive ─── */
export async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBlob: Blob,
  convertToGoogleDoc = false,
): Promise<{ id: string }> {
  const metadata: any = {
    name: fileName,
    parents: [folderId],
  };

  if (convertToGoogleDoc) {
    metadata.mimeType = 'application/vnd.google-apps.document';
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
  );
  form.append('file', fileBlob, fileName);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName}: ${errText}`);
  }

  return res.json();
}

/* ─── 5. Sync All Stories and Memoir Book to Drive ─── */
export async function syncAllEntriesToDrive(
  accessToken: string,
  folderId: string,
  speakerName: string,
  entries: StoryEntry[],
  onProgress?: (text: string, percent: number) => void,
): Promise<number> {
  let uploadedCount = 0;
  if (!accessToken || !folderId || entries.length === 0) return 0;

  // 1. Upload/Update Archive Index JSON to Google Drive
  try {
    onProgress?.('Syncing archive database to Google Drive...', 5);
    const indexJson = JSON.stringify(
      entries.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        prompt: e.prompt,
        transcript: e.transcript,
        mediaDurationSec: e.mediaDurationSec,
        recordedAt: e.recordedAt,
        approxYear: e.approxYear,
        theme: e.theme,
        pullQuote: e.pullQuote,
        speaker: e.speaker,
        tags: e.tags,
        language: e.language,
      })),
      null,
      2,
    );
    await uploadFileToDrive(
      accessToken,
      folderId,
      'archive_index.json',
      'application/json',
      new Blob([indexJson], { type: 'application/json' }),
      false,
    );
  } catch (jsonErr) {
    console.warn('[Archive Index Sync Note]', jsonErr);
  }

  // 2. Upload/Update Formatted Memoir Book as Google Doc
  try {
    onProgress?.('Generating & syncing Memoir Book (Google Doc)...', 15);
    const memoirHtml = generateMemoirHtml(speakerName, entries);
    await uploadFileToDrive(
      accessToken,
      folderId,
      `Heirloom Memoir Book — ${speakerName}`,
      'text/html',
      new Blob([memoirHtml], { type: 'text/html;charset=utf-8' }),
      true, // Converts to native Google Doc!
    );
  } catch (memoirErr) {
    console.warn('[Memoir Google Doc Upload Error]', memoirErr);
  }

  // 3. Upload Each Audio and Video Recording
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const percent = 25 + Math.floor(((i + 1) / entries.length) * 75);
    onProgress?.(`Preserving "${entry.title}" in Drive (${i + 1}/${entries.length})...`, percent);

    try {
      const blob = entry.mediaBlob || (await getMediaBlobFromStorage(entry.id));
      if (blob && blob.size > 0) {
        const ext = entry.type === 'video' ? 'webm' : blob.type.includes('wav') ? 'wav' : 'webm';
        const mimeType = blob.type || (entry.type === 'video' ? 'video/webm' : 'audio/wav');
        const cleanTitle = entry.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        const fileName = `${entry.approxYear || 'memory'}_${cleanTitle}.${ext}`;

        await uploadFileToDrive(accessToken, folderId, fileName, mimeType, blob);
        uploadedCount++;
      } else if (entry.transcript) {
        const cleanTitle = entry.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        const fileName = `${entry.approxYear || 'memory'}_${cleanTitle}.txt`;
        const textBlob = new Blob([entry.transcript], { type: 'text/plain;charset=utf-8' });
        await uploadFileToDrive(accessToken, folderId, fileName, 'text/plain', textBlob);
        uploadedCount++;
      }
    } catch (entryErr) {
      console.warn(`[Drive Upload Error for story ${entry.id}]`, entryErr);
    }
  }

  onProgress?.('All memories safely preserved in Google Drive!', 100);
  return uploadedCount;
}

/* ─── Fetch Archive Index From Google Drive ─── */
export async function fetchArchiveIndexFromDrive(accessToken: string, folderId: string): Promise<StoryEntry[] | null> {
  try {
    const q = `'${folderId}' in parents and name = 'archive_index.json' and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!searchRes.ok) return null;
    const data = await searchRes.json();
    const fileId = data.files?.[0]?.id;
    if (!fileId) return null;

    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (fileRes.ok) {
      const items = await fileRes.json();
      if (Array.isArray(items)) {
        return items.map((raw: any) => ({
          ...raw,
          mediaBlob: null,
          mediaUrl: '',
          isSample: false,
        }));
      }
    }
  } catch (err) {
    console.warn('[Fetch from Drive Note]', err);
  }
  return null;
}

/* ─── 6. Generate Formatted Memoir HTML ─── */
export function generateMemoirHtml(speaker: string, entries: StoryEntry[]): string {
  const chaptersHtml = entries.map((entry, idx) => `
    <article style="margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid #E6DDD2;">
      <header>
        <span style="font-size: 11px; text-transform: uppercase; color: #8B4513; font-weight: bold;">
          Story ${idx + 1} • ${escapeHtml(entry.theme || 'Memory')} • ${escapeHtml(entry.approxYear || 'Past')}
        </span>
        <h2 style="font-family: Georgia, serif; font-size: 1.5rem; color: #2C241E; margin: 6px 0 12px 0;">
          ${escapeHtml(entry.title)}
        </h2>
      </header>
      ${entry.pullQuote ? `
        <blockquote style="font-style: italic; color: #5C4D40; background: #FAF7F2; padding: 12px 18px; border-left: 4px solid #8B4513; margin: 12px 0; border-radius: 6px;">
          "${escapeHtml(entry.pullQuote)}"
        </blockquote>
      ` : ''}
      <div style="font-size: 1.05rem; line-height: 1.8; color: #2C241E; font-family: Georgia, serif;">
        ${escapeHtml(entry.transcript)}
      </div>
      <footer style="margin-top: 12px; font-size: 11px; color: #7A6A5C;">
        Recorded in ${escapeHtml(entry.language || 'en')} • ${entry.mediaDurationSec ? Math.round(entry.mediaDurationSec) + 's' : ''} • ${entry.recordedAt ? new Date(entry.recordedAt).toLocaleDateString() : ''}
      </footer>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(speaker)}'s Living Memoir</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #2C241E; background: #FAF7F2; line-height: 1.7; }
    h1 { font-size: 2.4rem; color: #2C241E; text-align: center; margin-bottom: 6px; }
    .subtitle { text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8B4513; margin-bottom: 40px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(speaker)}'s Living Memoir</h1>
  <div class="subtitle">Preserved via Inheritance Living Family Archive • ${entries.length} Authentic Memories</div>
  <main>
    ${chaptersHtml}
  </main>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return (str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m] || m));
}
