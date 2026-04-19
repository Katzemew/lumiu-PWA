'use client';
// =============================================
// Lumiu Notes — Editor Area (top bar + editor + media)
// =============================================

import React, { useEffect, useState } from 'react';
import { useNotes } from '../context';
import { NoteEditor } from './NoteEditor';
import { MediaPanel } from './MediaPanel';
import { NOTE_COLORS } from '../types';
import type { NoteIcon } from '../types';

const NOTE_ICONS: string[] = ['📄', '📝', '🧠', '💡', '⚡', '🎯', '🌟', '🔬', '📊', '🎨', '🚀', '🔑', '⭐', '🌿', '🔖', '📌', '🗒️', '🎓', '💼', '🤝'];

export function EditorArea() {
  const { state, dispatch, selectedNote } = useNotes();
  const { ui } = state;
  const [title, setTitle] = useState('');
  const [editingIcon, setEditingIcon] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  useEffect(() => {
    setTitle(selectedNote?.title ?? '');
    setEditingIcon(false);
    setAddingTag(false);
  }, [selectedNote?.id]);

  const updateTitle = (val: string) => {
    setTitle(val);
    if (selectedNote) dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { title: val } } });
  };

  const togglePin = () => {
    if (!selectedNote) return;
    dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { isPinned: !selectedNote.isPinned } } });
  };

  const toggleFavorite = () => {
    if (!selectedNote) return;
    dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { isFavorite: !selectedNote.isFavorite } } });
  };

  const deleteNote = () => {
    if (!selectedNote) return;
    if (confirm(`Delete "${selectedNote.title || 'Untitled'}"? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_NOTE', payload: selectedNote.id });
    }
  };

  const changeIcon = (icon: string) => {
    if (!selectedNote) return;
    dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { icon } } });
    setEditingIcon(false);
  };

  const addTag = () => {
    if (!selectedNote || !newTag.trim()) { setAddingTag(false); return; }
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!selectedNote.tags.includes(tag)) {
      dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { tags: [...selectedNote.tags, tag] } } });
    }
    setNewTag('');
    setAddingTag(false);
  };

  const removeTag = (tag: string) => {
    if (!selectedNote) return;
    dispatch({ type: 'UPDATE_NOTE', payload: { id: selectedNote.id, patch: { tags: selectedNote.tags.filter(t => t !== tag) } } });
  };

  // ─── No note selected ───────────────────────
  if (!selectedNote) {
    return (
      <div className="notes-editor-area">
        <div className="no-note-selected">
          <div className="no-note-icon">✨</div>
          <div className="no-note-title">Select a note to start</div>
          <div className="no-note-sub">
            Choose a note from the list, or create a new one.
            You can also use templates to get started quickly!
          </div>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'TOGGLE_TEMPLATES' })}>📋 Browse Templates</button>
        </div>
      </div>
    );
  }

  const accentColor = '#a855f7';
  const saveStatus = 'Saved';

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0 }}>
      <div className="notes-editor-area">
        {/* Top Bar */}
        <div className="editor-topbar">
          {/* Sidebar toggle */}
          <button
            className="btn-icon"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            title="Toggle Sidebar"
            style={{ fontSize: 16 }}
          >{ui.sidebarCollapsed ? '▶' : '☰'}</button>

          {/* Note icon picker */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => setEditingIcon(!editingIcon)}
              title="Change icon"
              style={{ fontSize: 20, width: 36, height: 36 }}
            >{selectedNote.icon}</button>

            {editingIcon && (
              <div style={{
                position: 'absolute', top: '100%', left: 0,
                background: 'var(--bg-toolbar)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)', padding: 12,
                display: 'flex', flexWrap: 'wrap', gap: 6,
                width: 260, zIndex: 1000,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                marginTop: 8,
              }}>
                <div style={{ width: '100%', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Icon</div>
                {NOTE_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => changeIcon(icon)}
                    className="icon-picker-item"
                    style={{
                      width: 36, height: 36, fontSize: 20, border: 'none',
                      background: selectedNote.icon === icon ? 'var(--accent-dim)' : 'transparent',
                      borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >{icon}</button>
                ))}
              </div>
            )}
          </div>

          {/* Title input */}
          <input
            className="editor-title-input"
            placeholder="Untitled Note"
            value={title}
            onChange={e => updateTitle(e.target.value)}
          />

          {/* Meta */}
          <div className="editor-meta">
            <span>{selectedNote.wordCount} words</span>
            <span>·</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>✓ {saveStatus}</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px' }}>
            <button
              className={`btn-icon ${selectedNote.isPinned ? 'active' : ''}`}
              onClick={togglePin}
              title={selectedNote.isPinned ? 'Unpin' : 'Pin note'}
              style={{ fontSize: 18 }}
            >
              {selectedNote.isPinned ? '📌' : '📍'}
            </button>
            <button
              className={`btn-icon ${selectedNote.isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
              title={selectedNote.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ fontSize: 18 }}
            >
              {selectedNote.isFavorite ? '⭐' : '☆'}
            </button>
            <div style={{ position: 'relative' }}>
              <button
                className={`btn-icon ${ui.showMediaPicker ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'TOGGLE_MEDIA_PICKER' })}
                title="Media & Links"
                style={{ fontSize: 18 }}
              >
                📎
              </button>
              {selectedNote.attachments.length > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--accent)', color: 'white',
                  fontSize: '9px', fontWeight: 'bold',
                  padding: '1px 4px', borderRadius: '10px',
                  pointerEvents: 'none', border: '1px solid var(--bg-surface)'
                }}>
                  {selectedNote.attachments.length}
                </span>
              )}
            </div>
            <button
              className="btn-icon"
              onClick={deleteNote}
              title="Delete note"
              style={{ color: 'var(--color-danger)', fontSize: 18 }}
            >
              🗑️
            </button>
          </div>

          {/* Exit Focus Mode */}
          {ui.focusMode && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => dispatch({ type: 'TOGGLE_FOCUS' })}
              style={{ marginLeft: 8 }}
            >
              Exit Focus
            </button>
          )}
        </div>

        {/* Editor */}
        <NoteEditor key={selectedNote.id} note={selectedNote} />

        {/* Tags row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 20px', borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap', flexShrink: 0, background: 'var(--bg-toolbar)',
          position: 'relative', zIndex: 10
        }}>
          {/* Tags */}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tags:</span>
          {selectedNote.tags.map(tag => (
            <span
              key={tag}
              className="note-tag"
              style={{ cursor: 'pointer', gap: 3, display: 'inline-flex', alignItems: 'center' }}
              onClick={() => removeTag(tag)}
              title="Click to remove"
            >
              #{tag} <span style={{ fontSize: 9 }}>✕</span>
            </span>
          ))}
          {addingTag ? (
            <input
              style={{
                height: 22, padding: '0 8px', background: 'var(--bg-input)',
                border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)', fontSize: '12px', outline: 'none', width: 100,
              }}
              placeholder="tag name..."
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setAddingTag(false); }}
              autoFocus
            />
          ) : (
            <button
              className="btn-icon"
              onClick={() => setAddingTag(true)}
              title="Add tag"
              style={{ width: 22, height: 22, fontSize: 14, borderRadius: 'var(--radius-full)', border: '1px dashed var(--border-default)' }}
            >+</button>
          )}

          {/* Accent strip */}
          <div style={{ flex: 1 }} />
          <div style={{ height: 4, width: 60, borderRadius: 2, background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
        </div>
      </div>

      {/* Media Panel */}
      <MediaPanel />
    </div>
  );
}
