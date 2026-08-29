import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { Cloud, Check, AlertCircle, Loader2, Download, Music, Video, FileText, ExternalLink, ShieldCheck, Key, HelpCircle } from 'lucide-react';
import { getMediaBlobFromStorage } from '../storage/db';

interface GoogleDriveBackupProps {
  compact?: boolean;
}

export const GoogleDriveBackup: React.FC<GoogleDriveBackupProps> = ({ compact = false }) => {
  const { entries, speakerName, googleUser, signInWithGoogle } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [createdDriveFolderUrl, setCreatedDriveFolderUrl] = useState<string | null>(googleUser?.folderUrl || null);

  // Client ID / OAuth State
  const [clientId] = useState('249104411965-5sa7u1mojbjejsqnp5fkrma77hu01mkr.apps.googleusercontent.com');

  /* ─── 1. Direct Media & Memoir Downloader (.wav / .webm / .html) ─── */
  const downloadAllMediaAndMemoir = async () => {
    if (entries.length === 0) {
      setStatusMessage({
        type: 'info',
        text: 'No recorded memories to download yet. Record a story in the Capture Booth first!',
      });
      return;
    }

    setIsBackingUp(true);
    setProgressText('Packaging authentic media files...');
    setUploadPercent(20);

    try {
      // 1. Download formatted Memoir Book (HTML format)
      const memoirHtml = generateMemoirHtml(speakerName, entries);
      const memoirBlob = new Blob([memoirHtml], { type: 'text/html;charset=utf-8' });
      downloadBlob(memoirBlob, `Heirloom_Memoir_Book_${speakerName.replace(/\s+/g, '_')}.html`);
      setUploadPercent(50);

      // 2. Download each original audio and video file
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const blob = entry.mediaBlob || await getMediaBlobFromStorage(entry.id);
        if (blob) {
          const ext = entry.type === 'video' ? 'webm' : (blob.type.includes('wav') ? 'wav' : 'webm');
          const cleanTitle = entry.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
          const fileName = `${entry.approxYear || 'memory'}_${cleanTitle}.${ext}`;

          await new Promise((r) => setTimeout(r, 200));
          downloadBlob(blob, fileName);
        }
        setUploadPercent(50 + Math.floor(((i + 1) / entries.length) * 50));
      }

      setStatusMessage({
        type: 'success',
        text: `Exported ${entries.length} raw recording(s) and Heirloom Memoir Book to your device.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Download failed: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  /* ─── 2. Google Drive Direct Upload Flow (Uses active session if present) ─── */
  const handleGoogleDriveUpload = async () => {
    setStatusMessage(null);

    setIsBackingUp(true);
    setUploadPercent(10);
    setProgressText('Syncing to Google Drive...');

    try {
      let accessToken = googleUser?.accessToken;
      let folderId = googleUser?.folderId;
      let folderUrl = googleUser?.folderUrl;

      // If user isn't signed in yet, request token
      if (!accessToken) {
        setProgressText('Connecting with Google...');
        try {
          accessToken = await requestGoogleDriveToken(clientId.trim());
        } catch (authErr: any) {
          console.warn('[Google Drive Auth]', authErr);
          setStatusMessage({
            type: 'error',
            text: 'Google Sign-In could not complete. Please try again or download offline files.',
          });
          setIsBackingUp(false);
          return;
        }
      }

      // Ensure Folder exists
      if (!folderId) {
        setProgressText(`Creating "${speakerName}'s Family Archive" folder in Drive...`);
        const folder = await createDriveFolder(accessToken, `Inheritance Living Archive — ${speakerName}`);
        folderId = folder.id;
        folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
        setCreatedDriveFolderUrl(folderUrl);
      }

      // 1. Upload Formatted Heirloom Memoir Book directly as a Google Document
      setProgressText('Updating Memoir Book Google Doc in Drive...');
      setUploadPercent(40);
      const memoirHtml = generateMemoirHtml(speakerName, entries);
      await uploadFileToDrive(
        accessToken,
        folderId,
        `Heirloom Memoir Book — ${speakerName}`,
        'text/html',
        new Blob([memoirHtml], { type: 'text/html;charset=utf-8' }),
        true, // Converts to native Google Doc!
      );

      // 2. Upload Each Raw Audio (.wav / .webm) and Video (.webm) File
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        setProgressText(`Uploading clip ${i + 1} of ${entries.length}: "${entry.title}"...`);
        setUploadPercent(40 + Math.floor(((i + 1) / entries.length) * 55));

        const blob = entry.mediaBlob || await getMediaBlobFromStorage(entry.id);
        if (blob) {
          const extension = entry.type === 'video' ? 'webm' : (blob.type.includes('wav') ? 'wav' : 'webm');
          const mimeType = blob.type || (entry.type === 'video' ? 'video/webm' : 'audio/webm');
          const cleanTitle = entry.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
          const fileName = `${entry.approxYear || 'memory'}_${cleanTitle}.${extension}`;

          await uploadFileToDrive(
            accessToken,
            folderId,
            fileName,
            mimeType,
            blob,
          );
        }
      }

      setUploadPercent(100);
      setCreatedDriveFolderUrl(folderUrl || null);
      setStatusMessage({
        type: 'success',
        text: `All ${entries.length} memories & Google Doc Memoir are safely stored in your Google Drive!`,
      });
    } catch (err: any) {
      console.error('[Google Drive Upload Error]', err);
      setStatusMessage({
        type: 'error',
        text: `Upload error: ${err?.message || 'Could not complete Google Drive sync.'}`,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl border transition-all ${
            compact
              ? 'py-2 px-3 text-xs bg-white hover:bg-[#F4EFEA] border-[#E6DDD2] text-[#4A3B2F]'
              : 'py-3 px-4 text-sm font-semibold bg-white hover:bg-[#FAF7F2] border-[#DECFC0] text-[#2C241E] shadow-2xs'
          }`}
        >
          <Cloud className="w-4 h-4 text-[#8B4513]" />
          <span>Export & Back Up Archive to Google Drive</span>
        </button>
      ) : (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-[#8B4513]/30 shadow-md space-y-4 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0E8DE] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EFE6DB] flex items-center justify-center text-[#8B4513]">
                <Cloud className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#2C241E]">
                Archive Backup & Export
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#7A6A5C] hover:text-[#2C241E] px-2 py-1 rounded-lg bg-[#FAF7F2]"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-[#7A6A5C] leading-relaxed">
            Preserves your original <strong>master audio</strong> and <strong>Heirloom Memoir Book</strong> without lossy compression.
          </p>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="leading-relaxed">{statusMessage.text}</span>
                {createdDriveFolderUrl && (
                  <div className="pt-1">
                    <a
                      href={createdDriveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#8B4513] underline"
                    >
                      <span>Open Folder in Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isBackingUp && (
            <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#DECFC0]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8B4513]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {progressText}
                </span>
                <span>{uploadPercent}%</span>
              </div>
              <div className="w-full bg-[#E6DDD2] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#8B4513] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 2 Clear Options */}
          <div className="space-y-2.5 pt-1">
            {/* Option 1: Save to Google Drive */}
            <button
              onClick={handleGoogleDriveUpload}
              disabled={isBackingUp || entries.length === 0}
              className="btn-primary w-full !py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <Cloud className="w-4 h-4 fill-current" />
              <span>Save to Google Drive</span>
            </button>

            {/* Option 2: Export Raw Audio & Memoir */}
            <button
              onClick={downloadAllMediaAndMemoir}
              disabled={isBackingUp || entries.length === 0}
              className="btn-secondary w-full !py-2.5 text-xs font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Raw Audio & Memoir</span>
            </button>
          </div>

          {/* What gets saved */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9DFD4] space-y-1.5 text-xs text-[#5C4D40]">
            <div className="font-semibold text-[#2C241E] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B4513]" />
              <span>Included in your archive:</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#7A6A5C]">
              <Music className="w-3 h-3 text-[#8B4513]" />
              <span>Master Audio (.wav / .webm)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#7A6A5C]">
              <FileText className="w-3 h-3 text-[#8B4513]" />
              <span>Heirloom Memoir Book (Google Doc & printable format)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Helpers: File Download ─── */

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ─── Helpers: Human-Readable Memoir HTML Generator ─── */

function generateMemoirHtml(speaker: string, entries: any[]): string {
  const chaptersHtml = entries.map((entry, idx) => `
    <article class="chapter">
      <header>
        <span class="chapter-num">Story ${idx + 1} • ${escapeHtml(entry.theme || 'Memory')}</span>
        <h2>${escapeHtml(entry.title || 'Untitled Memory')}</h2>
        <div class="meta">${escapeHtml(entry.approxYear || '')} • Recorded: ${escapeHtml(entry.recordedAt || '')}</div>
      </header>
      <blockquote>"${escapeHtml(entry.pullQuote || '')}"</blockquote>
      <div class="transcript">${escapeHtml(entry.transcript || '').replace(/\n/g, '<br/>')}</div>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(speaker)}'s Heirloom Memoir</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #2C241E; background: #FAF7F2; }
    h1 { font-size: 2.2rem; text-align: center; color: #8B4513; margin-bottom: 8px; }
    .subtitle { text-align: center; font-style: italic; color: #7A6A5C; margin-bottom: 40px; border-bottom: 2px solid #DECFC0; padding-bottom: 20px; }
    .chapter { margin-bottom: 40px; background: white; padding: 28px; border-radius: 16px; border: 1px solid #E6DDD2; page-break-inside: avoid; }
    .chapter-num { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #8B4513; font-weight: bold; }
    h2 { font-size: 1.4rem; margin: 6px 0; color: #2C241E; }
    .meta { font-size: 0.8rem; color: #8C7C6E; margin-bottom: 14px; }
    blockquote { font-style: italic; color: #5C4D40; background: #FAF7F2; padding: 12px 18px; border-left: 4px solid #8B4513; margin: 16px 0; border-radius: 6px; }
    .transcript { font-size: 0.95rem; margin-top: 12px; }
    @media print { body { background: white; } .chapter { border: none; padding: 0; margin-bottom: 30px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(speaker)}'s Living Memoir</h1>
  <div class="subtitle">Preserved via Inheritance • ${entries.length} Authentic Memories</div>
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

/* ─── Google OAuth Token Request ─── */

function requestGoogleDriveToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    // Load Google Identity Services script if not already loaded
    if (!(window as any).google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initClient();
      script.onerror = () => reject(new Error('Could not load Google Identity Services'));
      document.body.appendChild(script);
    } else {
      initClient();
    }

    function initClient() {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
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
        client.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    }
  });
}

/* ─── Drive API Helpers ─── */

async function createDriveFolder(accessToken: string, folderName: string): Promise<{ id: string }> {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
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
  if (!res.ok) throw new Error(`Could not create Drive folder: ${res.statusText}`);
  return res.json();
}

async function uploadFileToDrive(
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
