'use client';
// =============================================
// Lumiu Notes — Media Panel
// =============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes } from '../context';
import { v4 as uuidv4 } from 'uuid';
import type { MediaAttachment, MediaType } from '../types';

const MEDIA_ICONS: Record<MediaType, string> = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  pdf: '📄',
  youtube: '▶️',
  link: '🔗',
  file: '📎',
};

type MediaTab = 'files' | 'links' | 'media';

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  return match ? match[1] : null;
}

function getMediaType(url: string, mimeType?: string): MediaType {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (getYoutubeId(url)) return 'youtube';
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogv', 'mov'].includes(ext)) return 'video';
  if (['mp3', 'ogg', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  return 'link';
}

export function MediaPanel() {
  const { state, dispatch, selectedNote } = useNotes();
  const { ui } = state;
  const [tab, setTab] = useState<MediaTab>('files');
  const [linkUrl, setLinkUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeUrls, setActiveUrls] = useState<string[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScanner = (e: any) => {
      if (e.detail?.urls) setActiveUrls(e.detail.urls);
    };
    window.addEventListener('media-scanner-update', handleScanner);
    return () => window.removeEventListener('media-scanner-update', handleScanner);
  }, []);

  const addAttachment = useCallback((attachment: MediaAttachment) => {
    if (!selectedNote) return;
    dispatch({ type: 'ADD_ATTACHMENT', payload: { noteId: selectedNote.id, attachment } });
  }, [selectedNote, dispatch]);

  const handleFileChange = (files: FileList | null) => {
    if (!files || !selectedNote) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const type = getMediaType(file.name, file.type);
        addAttachment({
          id: uuidv4(), type, url,
          name: file.name,
          size: file.size,
          createdAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLinkAdd = () => {
    if (!linkUrl.trim() || !selectedNote) return;
    const ytId = getYoutubeId(linkUrl);
    const type = ytId ? 'youtube' : 'link';
    addAttachment({
      id: uuidv4(), type, url: linkUrl.trim(),
      name: linkUrl.trim(),
      thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined,
      createdAt: new Date().toISOString(),
    });
    setLinkUrl('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    if (!selectedNote) return;
    const att = selectedNote.attachments.find(a => a.id === id);
    const isOrphan = att && !activeUrls.includes(att.url);
    
    if (isOrphan) {
      if (!window.confirm('This media is not currently used in your note. Are you sure you want to remove it from your Media Panel?')) {
        return;
      }
    }

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        id: selectedNote.id,
        patch: { attachments: selectedNote.attachments.filter(a => a.id !== id) },
      },
    });
  };

  const attachments = selectedNote?.attachments ?? [];
  const fileAttachments = attachments.filter(a => ['image', 'video', 'audio', 'pdf', 'file'].includes(a.type));
  const linkAttachments = attachments.filter(a => ['youtube', 'link'].includes(a.type));

  if (!ui.showMediaPicker) return null;

  return (
    <div className="media-panel">
      <div className="media-panel-header">
        <span className="media-panel-title">📎 Media & Links</span>
        <button className="btn-icon" onClick={() => dispatch({ type: 'TOGGLE_MEDIA_PICKER' })}>✕</button>
      </div>

      {/* Tabs */}
      <div className="media-tabs">
        {(['files', 'links', 'media'] as MediaTab[]).map(t => (
          <button key={t} className={`media-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'files' ? '📄 Files' : t === 'links' ? '🔗 Links' : '🖼️ Gallery'}
          </button>
        ))}
      </div>

      <div className="media-panel-body">
        {!selectedNote ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Select a note to manage media
          </div>
        ) : (
          <>
            {/* Files Tab */}
            {tab === 'files' && (
              <>
                {/* Drop Zone */}
                <div
                  ref={dropRef}
                  className={`media-upload-zone ${isDragging ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="media-upload-icon">{isDragging ? '📥' : '⬆️'}</div>
                  <div className="media-upload-text">Drop files here or click to upload</div>
                  <div className="media-upload-sub">Images, PDFs, Audio, Video files</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e.target.files)}
                />

                {/* File list */}
                  <div className="attached-media-list">
                    {fileAttachments.map(att => (
                      <MediaItemCard 
                        key={att.id} 
                        attachment={att} 
                        onRemove={removeAttachment} 
                        isOrphan={!activeUrls.includes(att.url)}
                      />
                    ))}
                  {fileAttachments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No files attached yet
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Links Tab */}
            {tab === 'links' && (
              <>
                <div className="media-url-input-row">
                  <input
                    className="media-url-input"
                    placeholder="Paste YouTube or website URL..."
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLinkAdd()}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleLinkAdd}>Add</button>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 10, padding: '0 2px' }}>
                  💡 YouTube links get auto-detected as videos
                </div>

                <div className="attached-media-list">
                  {linkAttachments.map(att => (
                    <MediaItemCard 
                      key={att.id} 
                      attachment={att} 
                      onRemove={removeAttachment} 
                      isOrphan={!activeUrls.includes(att.url)}
                    />
                  ))}
                  {linkAttachments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No links added yet
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Gallery Tab */}
            {tab === 'media' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {attachments.filter(a => a.type === 'image' || (a.type === 'youtube' && a.thumbnailUrl)).map(att => (
                  <div key={att.id} style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    aspectRatio: '16/10',
                    background: 'var(--bg-elevated)',
                    position: 'relative',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.type === 'youtube' ? att.thumbnailUrl : att.url}
                      alt={att.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('insert-media', {
                          detail: { type: att.type, url: att.url, name: att.name, thumbnailUrl: att.thumbnailUrl }
                        }));
                      }}
                    />
                    {att.type === 'youtube' && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)', pointerEvents: 'none'
                      }}>
                        <span style={{ fontSize: 24 }}>▶️</span>
                      </div>
                    )}
                  </div>
                ))}
                {attachments.filter(a => a.type === 'image' || a.type === 'youtube').length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No images or videos yet
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Media Item Card ──────────────────────────
function MediaItemCard({ 
  attachment: att, 
  onRemove, 
  isOrphan 
}: { 
  attachment: MediaAttachment; 
  onRemove: (id: string) => void;
  isOrphan: boolean;
}) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const insertMedia = () => {
    window.dispatchEvent(new CustomEvent('insert-media', {
      detail: { type: att.type, url: att.url, name: att.name, thumbnailUrl: att.thumbnailUrl }
    }));
  };

  return (
    <div className="media-item">
      {att.type === 'image' && att.url.length < 500 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={att.url} alt={att.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
      ) : att.type === 'youtube' && att.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={att.thumbnailUrl} alt={att.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <span className="media-item-icon">{MEDIA_ICONS[att.type]}</span>
      )}

      <div className="media-item-info">
        <div className="media-item-name" title={att.name}>
          {att.name.length > 28 ? att.name.slice(0, 28) + '…' : att.name}
          {isOrphan && (
            <span 
              title="Not used in workspace" 
              style={{ color: 'var(--color-warning)', marginLeft: 6, fontWeight: 'bold', fontSize: 13 }}
            >
              !
            </span>
          )}
        </div>
        <div className="media-item-type">{att.type} {att.size ? `· ${formatSize(att.size)}` : ''}</div>
      </div>

      <div className="media-item-actions">
        <button className="btn-icon" onClick={insertMedia} title="Insert to Note" style={{ fontSize: 13 }}>➕</button>
        <a href={att.url} target="_blank" rel="noreferrer" className="btn-icon" title="Open" style={{ textDecoration: 'none', fontSize: 13 }}>↗️</a>
        <button className="btn-icon" onClick={() => onRemove(att.id)} title="Remove" style={{ fontSize: 13 }}>🗑️</button>
      </div>
    </div>
  );
}
