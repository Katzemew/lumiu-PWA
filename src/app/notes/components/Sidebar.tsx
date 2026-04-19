'use client';
// =============================================
// Lumiu Notes — Sidebar Component
// =============================================

import React, { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNotes } from '../context';
import { NOTE_COLORS } from '../types';
import type { NoteColor, NoteIcon, Note } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const NOTEBOOK_ICONS: NoteIcon[] = ['📓', '📔', '📒', '📕', '📗', '📘', '📙', '🗒️', '📋', '📌', '🔖', '💡', '🧠', '🎯', '⚡', '🚀', '🌟', '🎨', '🔬', '📐', '🏆'];
const SECTION_ICONS = ['📂', '📁', '🗂️', '📌', '🔖', '⭐', '💼', '📊', '🎯', '💡', '🔑', '🌿'];

type CreateState = { type: 'notebook' | 'folder' | 'section'; notebookId?: string; folderId?: string } | null;

export function Sidebar() {
  const { state, dispatch, searchResults } = useNotes();
  const { store, ui } = state;
  const [creating, setCreating] = useState<CreateState>(null);
  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState<NoteColor>('purple');
  const [createIcon, setCreateIcon] = useState('📓');
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    
    // Notebook drag
    if ((active.id as string).startsWith('nb-') && (over.id as string).startsWith('nb-')) {
      const activeId = (active.id as string).replace('nb-', '');
      const overId = (over.id as string).replace('nb-', '');
      dispatch({ type: 'REORDER_NOTEBOOKS', payload: { activeId, overId } });
      return;
    }

    // Folder drag
    if ((active.id as string).startsWith('fld-') && (over.id as string).startsWith('fld-')) {
      const activeStr = active.id as string;
      const notebookId = activeStr.split('-')[1];
      const activeId = activeStr.split('-')[2];
      const overId = (over.id as string).split('-')[2];
      dispatch({ type: 'REORDER_FOLDERS', payload: { notebookId, activeId, overId } });
      return;
    }

    // Section drag
    if ((active.id as string).startsWith('sec-') && (over.id as string).startsWith('sec-')) {
      const activeStr = active.id as string;
      const notebookId = activeStr.split('-')[1];
      const folderId = activeStr.split('-')[2] === 'none' ? undefined : activeStr.split('-')[2];
      const activeId = activeStr.split('-')[3];
      const overId = (over.id as string).split('-')[3];
      dispatch({ type: 'REORDER_SECTIONS', payload: { notebookId, folderId, activeId, overId } });
      return;
    }

    // Note drag
    if ((active.id as string).startsWith('nt-') && (over.id as string).startsWith('nt-')) {
      const activeStr = active.id as string;
      const sectionId = activeStr.split('-')[1];
      const activeId = activeStr.split('-')[2];
      const overId = (over.id as string).split('-')[2];
      dispatch({ type: 'REORDER_NOTES', payload: { sectionId, activeId, overId } });
    }
  };

  const startCreate = (type: 'notebook' | 'folder' | 'section', notebookId?: string, folderId?: string) => {
    setCreating({ type, notebookId, folderId });
    setCreateName('');
    setCreateColor(type === 'notebook' ? 'purple' : (type === 'folder' ? 'cyan' : 'blue'));
    setCreateIcon(type === 'notebook' ? '📓' : (type === 'folder' ? '📁' : '📄'));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitCreate = () => {
    if (!createName.trim() || !creating) { setCreating(null); return; }
    if (creating.type === 'notebook') {
      dispatch({ type: 'CREATE_NOTEBOOK', payload: { name: createName.trim(), color: createColor, icon: createIcon } });
    } else if (creating.type === 'folder' && creating.notebookId) {
      dispatch({ type: 'CREATE_FOLDER', payload: { notebookId: creating.notebookId, name: createName.trim(), color: createColor, icon: createIcon } });
    } else if (creating.type === 'section' && creating.notebookId) {
      dispatch({ type: 'CREATE_SECTION', payload: { notebookId: creating.notebookId, folderId: creating.folderId, name: createName.trim(), color: createColor, icon: createIcon } });
    }
    setCreating(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitCreate();
    if (e.key === 'Escape') setCreating(null);
  };

  return (
    <aside className={`notes-sidebar ${ui.sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🧠</div>
        <span className="sidebar-title">Lumiu Notes</span>

        {/* Theme toggle */}
        <div className="theme-toggle" style={{ marginLeft: 'auto' }}>
          <button
            className={`theme-toggle-btn ${ui.theme === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
            title="Dark mode"
          >🌙</button>
          <button
            className={`theme-toggle-btn ${ui.theme === 'light' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
            title="Light mode"
          >☀️</button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search" style={{ position: 'relative' }}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search notes..."
            value={ui.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
          {ui.searchQuery && (
            <button className="btn-icon" onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} style={{ width: 20, height: 20, fontSize: 12 }}>✕</button>
          )}
        </div>

        {/* Search results dropdown */}
        {ui.searchQuery && (
          <div className="search-results-panel">
            {searchResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notes found for &ldquo;{ui.searchQuery}&rdquo;
              </div>
            ) : searchResults.map(note => (
              <div
                key={note.id}
                className="search-result-item"
                onClick={() => {
                  const sec = store.sections[note.sectionId];
                  if (sec) {
                    dispatch({
                      type: 'TELEPORT_TO_NOTE',
                      payload: { notebookId: sec.notebookId, sectionId: note.sectionId, noteId: note.id }
                    });
                  }
                }}
              >
                <span className="search-result-icon">{note.icon}</span>
                <div className="search-result-info">
                  <div className="search-result-title">{note.title}</div>
                  <div className="search-result-meta">{note.plainText.slice(0, 60)}...</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integrated Quick Access & Notebooks */}
      <div className="sidebar-notebooks">
        {/* Quick Access Group (Inline) */}
        {(() => {
          const pinnedNotes = Object.values(store.notes).filter((n: any) => n.isPinned);
          const favoriteNotes = Object.values(store.notes).filter((n: any) => n.isFavorite && !n.isPinned);
          const allQuick = [...pinnedNotes, ...favoriteNotes];
          
          if (allQuick.length === 0) return null;

          return (
            <div style={{ marginBottom: 12 }}>
              <div className="sidebar-section-label">
                <span>Quick Access</span>
                <span className="notebook-count">{allQuick.length}</span>
              </div>
              <div className="section-notes-list" style={{ marginLeft: 0, paddingLeft: 4 }}>
                {allQuick.map((note: any) => (
                  <div
                    key={note.id}
                    className={`sidebar-note-item ${ui.selectedNoteId === note.id ? 'active' : ''}`}
                    onClick={() => {
                      const sec = store.sections[note.sectionId];
                      if (sec) {
                        dispatch({
                          type: 'TELEPORT_TO_NOTE',
                          payload: { notebookId: sec.notebookId, sectionId: note.sectionId, noteId: note.id }
                        });
                      }
                    }}
                  >
                    <span className="sidebar-note-icon">{note.isPinned ? '📌' : '⭐'}</span>
                    <div className="sidebar-note-info">
                      <div className="sidebar-note-title">{note.title || 'Untitled'}</div>
                      <div className="sidebar-note-meta">
                        {note.icon} · {store.sections[note.sectionId]?.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="sidebar-section-label">
          <span>Notebooks</span>
          <button
            className="btn-icon"
            onClick={() => startCreate('notebook')}
            title="New Notebook"
            style={{ width: 22, height: 22, fontSize: 14 }}
          >+</button>
        </div>

        {/* New Notebook Create Row */}
        {creating?.type === 'notebook' && (
          <div style={{ padding: '8px 12px', background: 'var(--bg-hover)', margin: '2px 8px', borderRadius: 'var(--radius-md)' }}>
            <EmojiColorPicker
              selectedIcon={createIcon}
              selectedColor={createColor}
              icons={NOTEBOOK_ICONS}
              onIconChange={setCreateIcon}
              onColorChange={setCreateColor}
            />
            <div className="inline-create" style={{ padding: 0, marginTop: 6 }}>
              <input
                ref={inputRef}
                className="inline-create-input"
                placeholder="Notebook name..."
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-primary btn-sm" onClick={commitCreate}>✓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setCreating(null)}>✕</button>
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={store.notebookOrder.map(id => `nb-${id}`)} strategy={verticalListSortingStrategy}>
            {store.notebookOrder.map(nbId => {
              const nb = store.notebooks[nbId];
              if (!nb) return null;
              const isNbActive = ui.selectedNotebookId === nbId;
              const accentColor = NOTE_COLORS[nb.color]?.accent ?? '#a855f7';

              return (
                <SortableNotebook
                  key={nbId}
                  id={`nb-${nbId}`}
                  nbId={nbId}
                  nb={nb}
                  isNbActive={isNbActive}
                  accentColor={accentColor}
                  ui={ui}
                  store={store}
                  dispatch={dispatch}
                  creating={creating}
                  setCreating={setCreating}
                  createName={createName}
                  setCreateName={setCreateName}
                  createIcon={createIcon}
                  setCreateIcon={setCreateIcon}
                  createColor={createColor}
                  setCreateColor={setCreateColor}
                  commitCreate={commitCreate}
                  startCreate={startCreate}
                  handleKeyDown={handleKeyDown}
                  inputRef={inputRef}
                />
              );
            })}
          </SortableContext>
        </DndContext>
        {store.notebookOrder.length === 0 && (
          <div className="notes-empty" style={{ height: 120 }}>
            <div className="notes-empty-icon">📓</div>
            <div>No notebooks yet</div>
            <button className="btn btn-primary btn-sm" onClick={() => startCreate('notebook')}>Create Notebook</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
          Lumiu Notes v0.1.0
        </div>
      </div>
    </aside>
  );
}

// ── Helper Components ───────────────────────

function ItemMenu({ onRename, onDelete, onAddChild, addChildLabel }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) window.addEventListener('mousedown', clickOut);
    return () => window.removeEventListener('mousedown', clickOut);
  }, [isOpen]);

  return (
    <div className="item-menu-wrap" ref={menuRef} onClick={e => e.stopPropagation()}>
      <button className="item-menu-trigger" onClick={() => setIsOpen(!isOpen)}>⋮</button>
      {isOpen && (
        <div className="item-menu-dropdown">
          {onAddChild && <button onClick={() => { onAddChild(); setIsOpen(false); }}>➕ {addChildLabel || 'Add'}</button>}
          {onRename && <button onClick={() => { onRename(); setIsOpen(false); }}>✏️ Rename</button>}
          {onDelete && <button className="delete" onClick={() => { onDelete(); setIsOpen(false); }}>🗑️ Delete</button>}
        </div>
      )}
    </div>
  );
}

function EditableLabel({ value, isEditing, onSave, onCancel, className }: any) {
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setVal(value);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, value]);

  if (!isEditing) return <span className={className}>{value}</span>;

  return (
    <input
      ref={inputRef}
      className="inline-edit-input"
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onSave(val)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSave(val);
        if (e.key === 'Escape') onCancel();
      }}
      onClick={e => e.stopPropagation()}
    />
  );
}

// ── Sortable Wrappers ────────────────────────
function SortableNotebook({ id, nbId, nb, isNbActive, accentColor, ui, store, dispatch, creating, setCreating, createName, setCreateName, createIcon, setCreateIcon, createColor, setCreateColor, commitCreate, startCreate, handleKeyDown, inputRef }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isRenaming, setIsRenaming] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="notebook-item">
      <div className={`notebook-header ${isNbActive ? 'active' : ''}`} onClick={() => dispatch({ type: 'SELECT_NOTEBOOK', payload: nbId })}>
        <span
          className={`notebook-chevron ${nb.isExpanded ? 'open' : ''}`}
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_NOTEBOOK_EXPAND', payload: nbId }); }}
        >▶</span>
        <span className="notebook-icon">{nb.icon}</span>
        <EditableLabel
          value={nb.name}
          isEditing={isRenaming}
          className="notebook-name"
          onSave={(val: string) => { dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: nbId, patch: { name: val } } }); setIsRenaming(false); }}
          onCancel={() => setIsRenaming(false)}
        />
        <span className="notebook-count">{nb.folderIds.length + nb.standaloneSectionIds.length}</span>

        <ItemMenu
          onRename={() => setIsRenaming(true)}
          onDelete={() => dispatch({ type: 'DELETE_NOTEBOOK', payload: nbId })}
          onAddChild={() => startCreate('folder', nbId)}
          addChildLabel="New Folder"
        />
        <span className="notebook-drag-handle" {...listeners} {...attributes}>☰</span>
      </div>

      {nb.isExpanded && (
        <div className="notebook-content">
          {creating?.type === 'folder' && creating.notebookId === nbId && (
             <div className="inline-create-box">
               <EmojiColorPicker selectedIcon={createIcon} selectedColor={createColor} icons={NOTEBOOK_ICONS} onIconChange={setCreateIcon} onColorChange={setCreateColor} small />
               <div className="inline-create">
                 <input ref={inputRef} className="inline-create-input" placeholder="Folder name..." value={createName} onChange={e => setCreateName(e.target.value)} onKeyDown={handleKeyDown} />
                 <button className="btn btn-primary btn-sm" onClick={commitCreate}>✓</button>
                 <button className="btn btn-ghost btn-sm" onClick={() => setCreating(null)}>✕</button>
               </div>
             </div>
          )}

          {/* Render Folders */}
          <SortableContext items={nb.folderIds.map((fid: string) => `fld-${nbId}-${fid}`)} strategy={verticalListSortingStrategy}>
            {nb.folderIds.map((fid: string) => (
              <SortableFolder
                key={fid}
                id={`fld-${nbId}-${fid}`}
                fldId={fid}
                fld={store.folders[fid]}
                nbId={nbId}
                ui={ui}
                store={store}
                dispatch={dispatch}
                creating={creating}
                startCreate={startCreate}
                commitCreate={commitCreate}
                handleKeyDown={handleKeyDown}
                createIcon={createIcon}
                setCreateIcon={setCreateIcon}
                createColor={createColor}
                setCreateColor={setCreateColor}
                createName={createName}
                setCreateName={setCreateName}
                setCreating={setCreating}
                inputRef={inputRef}
              />
            ))}
          </SortableContext>

          {/* Render Standalone Sections */}
          <SortableContext items={nb.standaloneSectionIds.map((sid: string) => `sec-${nbId}-none-${sid}`)} strategy={verticalListSortingStrategy}>
            {nb.standaloneSectionIds.map((sid: string) => (
              <SortableSection
                key={sid}
                id={`sec-${nbId}-none-${sid}`}
                secId={sid}
                sec={store.sections[sid]}
                isActive={ui.selectedSectionId === sid}
                secAccent={NOTE_COLORS[store.sections[sid]?.color as NoteColor]?.accent || '#60a5fa'}
                dispatch={dispatch}
                store={store}
                ui={ui}
                setCreating={setCreating}
                inputRef={inputRef}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

function SortableFolder({ id, fldId, fld, nbId, ui, store, dispatch, creating, setCreating, startCreate, commitCreate, handleKeyDown, createIcon, setCreateIcon, createColor, setCreateColor, createName, setCreateName, inputRef }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isRenaming, setIsRenaming] = useState(false);
  if (!fld) return null;

  return (
    <div ref={setNodeRef} style={style} className="folder-item">
      <div className={`folder-header ${ui.selectedFolderId === fldId ? 'active' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_FOLDER_EXPAND', payload: fldId })}>
        <span className={`folder-chevron ${fld.isExpanded ? 'open' : ''}`}>▶</span>
        <span className="folder-icon">{fld.icon}</span>
        <EditableLabel
          value={fld.name}
          isEditing={isRenaming}
          className="folder-name"
          onSave={(val: string) => { dispatch({ type: 'UPDATE_FOLDER', payload: { id: fldId, patch: { name: val } } }); setIsRenaming(false); }}
          onCancel={() => setIsRenaming(false)}
        />
        <ItemMenu
          onRename={() => setIsRenaming(true)}
          onDelete={() => dispatch({ type: 'DELETE_FOLDER', payload: fldId })}
          onAddChild={() => startCreate('section', nbId, fldId)}
          addChildLabel="New Section"
        />
        <span className="folder-drag-handle" {...listeners} {...attributes}>☰</span>
      </div>

      {fld.isExpanded && (
        <div className="folder-content">
          {creating?.type === 'section' && creating.folderId === fldId && (
             <div className="inline-create-box small">
               <EmojiColorPicker selectedIcon={createIcon} selectedColor={createColor} icons={SECTION_ICONS} onIconChange={setCreateIcon} onColorChange={setCreateColor} small />
               <div className="inline-create">
                 <input className="inline-create-input" placeholder="Section name..." value={createName} onChange={e => setCreateName(e.target.value)} onKeyDown={handleKeyDown} />
                 <button className="btn btn-primary btn-sm" onClick={commitCreate}>✓</button>
                 <button className="btn btn-ghost btn-sm" onClick={() => setCreating(null)}>✕</button>
               </div>
             </div>
          )}
          <SortableContext items={fld.sectionIds.map((sid: string) => `sec-${nbId}-${fldId}-${sid}`)} strategy={verticalListSortingStrategy}>
            {fld.sectionIds.map((sid: string) => (
              <SortableSection
                key={sid}
                id={`sec-${nbId}-${fldId}-${sid}`}
                secId={sid}
                sec={store.sections[sid]}
                isActive={ui.selectedSectionId === sid}
                secAccent={NOTE_COLORS[store.sections[sid]?.color as NoteColor]?.accent || '#60a5fa'}
                dispatch={dispatch}
                store={store}
                ui={ui}
                setCreating={setCreating}
                inputRef={inputRef}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

function SortableSection({ id, sec, isActive, secAccent, dispatch, secId, store, ui, setCreating, inputRef }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isRenaming, setIsRenaming] = useState(false);
  const notes = sec.noteIds.map((nid: string) => store.notes[nid]).filter(Boolean);

  return (
    <div ref={setNodeRef} style={style} className="section-group">
      <div className={`section-item ${isActive ? 'active' : ''}`} onClick={() => dispatch({ type: 'SELECT_SECTION', payload: secId })}>
        <div className="section-dot" style={{ background: secAccent }} />
        <span className="section-icon">{sec.icon}</span>
        <EditableLabel
          value={sec.name}
          isEditing={isRenaming}
          className="section-name"
          onSave={(val: string) => { dispatch({ type: 'UPDATE_SECTION', payload: { id: secId, patch: { name: val } } }); setIsRenaming(false); }}
          onCancel={() => setIsRenaming(false)}
        />
        
        <ItemMenu
          onRename={() => setIsRenaming(true)}
          onDelete={() => dispatch({ type: 'DELETE_SECTION', payload: secId })}
          onAddChild={() => dispatch({ type: 'CREATE_NOTE', payload: { sectionId: secId } })}
          addChildLabel="New Note"
        />
        <span className="section-drag-handle" {...listeners} {...attributes}>☰</span>
        <span className="section-count">{sec.noteIds.length}</span>
      </div>

      {isActive && (
        <div className="section-notes-list">
          <SortableContext items={sec.noteIds.map((nid: string) => `nt-${secId}-${nid}`)} strategy={verticalListSortingStrategy}>
            {notes.map((note: any) => (
              <SortableNote
                key={note.id}
                id={`nt-${secId}-${note.id}`}
                note={note}
                isActive={ui.selectedNoteId === note.id}
                dispatch={dispatch}
              />
            ))}
          </SortableContext>
          {notes.length === 0 && (
            <div className="sidebar-notes-empty" onClick={() => dispatch({ type: 'CREATE_NOTE', payload: { sectionId: secId } })}>
              + Add first note
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SortableNote({ id, note, isActive, dispatch }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isRenaming, setIsRenaming] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sidebar-note-item ${isActive ? 'active' : ''}`}
      onClick={() => dispatch({ type: 'SELECT_NOTE', payload: note.id })}
    >
      <span className="sidebar-note-icon">{note.icon}</span>
      <div className="sidebar-note-info">
        <EditableLabel
          value={note.title || 'Untitled'}
          isEditing={isRenaming}
          className="sidebar-note-title"
          onSave={(val: string) => { dispatch({ type: 'UPDATE_NOTE', payload: { id: note.id, patch: { title: val } } }); setIsRenaming(false); }}
          onCancel={() => setIsRenaming(false)}
        />
        <div className="sidebar-note-meta">{formatDate(note.updatedAt)}</div>
      </div>
      <ItemMenu
        onRename={() => setIsRenaming(true)}
        onDelete={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
      />
      <span className="note-drag-handle" {...listeners} {...attributes} style={{ opacity: 0.3, cursor: 'grab', fontSize: '10px' }}>☰</span>
      {note.isPinned && <span style={{ fontSize: 10 }}>📌</span>}
    </div>
  );
}

// ── Emoji + Color Picker sub-component ──────
interface EmojiColorPickerProps {
  selectedIcon: string;
  selectedColor: NoteColor;
  icons: string[];
  onIconChange: (icon: string) => void;
  onColorChange: (color: NoteColor) => void;
  small?: boolean;
}
function EmojiColorPicker({ selectedIcon, selectedColor, icons, onIconChange, onColorChange, small }: EmojiColorPickerProps) {
  return (
    <div style={{ marginBottom: 4 }}>
      {/* Color row */}
      <div className="color-picker-row" style={{ marginBottom: 6 }}>
        {(Object.entries(NOTE_COLORS) as [NoteColor, typeof NOTE_COLORS[NoteColor]][]).map(([color, val]) => (
          <div
            key={color}
            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
            style={{ background: val.accent, width: small ? 16 : 20, height: small ? 16 : 20 }}
            onClick={() => onColorChange(color)}
            title={val.label}
          />
        ))}
      </div>
      {/* Icon row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {icons.map(icon => (
          <button
            key={icon}
            onClick={() => onIconChange(icon)}
            style={{
              width: small ? 24 : 28, height: small ? 24 : 28,
              fontSize: small ? 14 : 16,
              border: selectedIcon === icon ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              background: selectedIcon === icon ? 'var(--accent-dim)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={icon}
            type="button"
          >{icon}</button>
        ))}
      </div>
    </div>
  );
}
