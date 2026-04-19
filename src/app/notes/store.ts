'use client';
// =============================================
// Lumiu Notes — Data Store (localStorage-based)
// =============================================

import { v4 as uuidv4 } from 'uuid';
import type {
  Note, Section, Notebook, Folder, NotesStore, NoteColor, MediaAttachment,
} from './types';
import { DEFAULT_TEMPLATES } from './templates';

const STORE_KEY = 'lumiu_notes_store';

// ── IndexedDB Helper ────────────────────────
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LumiuDB', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('keyval')) {
        request.result.createObjectStore('keyval');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: string, val: any) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('keyval', 'readwrite');
    tx.objectStore('keyval').put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keyval', 'readonly');
    const req = tx.objectStore('keyval').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Seed Data ───────────────────────────────
function createSeedData(): NotesStore {
  const nb1Id = uuidv4();
  const nb2Id = uuidv4();
  const sec1Id = uuidv4();
  const sec2Id = uuidv4();
  const sec3Id = uuidv4();
  const note1Id = uuidv4();
  const note2Id = uuidv4();
  const note3Id = uuidv4();
  const now = new Date().toISOString();

  const welcomeContent = JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '👋 Welcome to Lumiu Notes!' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'This is your ADHD-friendly note-taking space. Here\'s what you can do:' }] },
      {
        type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '📝 Rich text editing with formatting toolbar' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '🖼️ Embed images, videos, PDFs and audio files' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '🎬 Embed YouTube videos & website links' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '📁 Organize with Notebooks → Sections → Notes' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '🎨 Choose from beautiful note templates' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '🌙 Toggle between light and dark mode' }] }] },
        ]
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Start typing below to create your first note!' }] },
    ],
  });

  return {
    notebookOrder: [nb1Id, nb2Id],
    notebooks: {
      [nb1Id]: {
        id: nb1Id, name: 'My Learning Hub', color: 'purple', icon: '🧠',
        description: 'Main notebook for study & learning',
        folderIds: [], standaloneSectionIds: [sec1Id, sec2Id], createdAt: now, updatedAt: now, isExpanded: true,
      },
      [nb2Id]: {
        id: nb2Id, name: 'Projects', color: 'blue', icon: '🚀',
        description: 'Track all my creative projects',
        folderIds: [], standaloneSectionIds: [sec3Id], createdAt: now, updatedAt: now, isExpanded: false,
      },
    },
    folders: {},
    sections: {
      [sec1Id]: {
        id: sec1Id, name: 'Getting Started', color: 'cyan', icon: '🌟',
        notebookId: nb1Id, noteIds: [note1Id, note2Id],
        createdAt: now, updatedAt: now, isExpanded: true,
      },
      [sec2Id]: {
        id: sec2Id, name: 'Study Notes', color: 'green', icon: '📚',
        notebookId: nb1Id, noteIds: [],
        createdAt: now, updatedAt: now, isExpanded: false,
      },
      [sec3Id]: {
        id: sec3Id, name: 'Ideas', color: 'yellow', icon: '💡',
        notebookId: nb2Id, noteIds: [note3Id],
        createdAt: now, updatedAt: now, isExpanded: false,
      },
    },
    notes: {
      [note1Id]: {
        id: note1Id, title: 'Welcome to Lumiu!', content: welcomeContent,
        plainText: 'Welcome to Lumiu Notes!', color: 'purple', icon: '👋',
        tags: ['welcome', 'guide'], attachments: [],
        sectionId: sec1Id, createdAt: now, updatedAt: now,
        isPinned: true, isFavorite: true, wordCount: 50, characterCount: 250,
      },
      [note2Id]: {
        id: note2Id, title: 'ADHD Study Tips', content: JSON.stringify({
          type: 'doc', content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🎯 Focus Strategies' }] },
            {
              type: 'taskList', content: [
                { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use the Pomodoro technique (25 min work, 5 min break)' }] }] },
                { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Break tasks into small chunks' }] }] },
                { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use color coding for different subjects' }] }] },
              ]
            },
          ],
        }),
        plainText: 'Focus Strategies', color: 'cyan', icon: '🎯',
        tags: ['study', 'adhd', 'tips'], attachments: [],
        sectionId: sec1Id, createdAt: now, updatedAt: now,
        isPinned: false, isFavorite: false, wordCount: 30, characterCount: 150,
      },
      [note3Id]: {
        id: note3Id, title: 'Project Brainstorm', content: JSON.stringify({
          type: 'doc', content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '💡 Big Ideas' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Write your project ideas here...' }] },
          ],
        }),
        plainText: 'Big Ideas', color: 'yellow', icon: '💡',
        tags: ['project', 'ideas'], attachments: [],
        sectionId: sec3Id, createdAt: now, updatedAt: now,
        isPinned: false, isFavorite: false, wordCount: 10, characterCount: 50,
      },
    },
  };
}

// ── Load / Save ─────────────────────────────
function migrateStore(store: any): NotesStore {
  let changed = false;
  if (!store.folders) { store.folders = {}; changed = true; }
  Object.keys(store.notebooks).forEach(id => {
    const nb = store.notebooks[id];
    if (nb.sectionIds !== undefined) {
      nb.folderIds = nb.folderIds || [];
      nb.standaloneSectionIds = nb.sectionIds;
      delete nb.sectionIds;
      changed = true;
    }
  });

  if (changed) saveStore(store);
  return store;
}

export async function loadStoreAsync(): Promise<NotesStore> {
  if (typeof window === 'undefined') return createSeedData();
  
  // 1. Try loading from IndexedDB first (Primary logic for large stores)
  try {
    const idbData = await idbGet(STORE_KEY);
    if (idbData) {
      return migrateStore(idbData);
    }
  } catch (e) {
    console.warn("IndexedDB get failed:", e);
  }

  // 2. Fallback to localStorage (Legacy)
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      return migrateStore(JSON.parse(raw));
    }
  } catch (e) { /* ignore */ }
  
  // 3. Fallback to seed data
  const seed = createSeedData();
  saveStore(seed);
  return seed;
}

export function saveStore(store: NotesStore): void {
  if (typeof window === 'undefined') return;
  
  // 1. Save to IndexedDB (asynchronous, doesn't block)
  idbSet(STORE_KEY, store).catch(e => console.error("IndexedDB save error:", e));

  // 2. Try to sync to localStorage for fast synch retrieval constraints, but gracefully catch if > 5MB
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (err: any) {
    if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
      console.warn("Lumiu Notes: LocalStorage quota exceeded. Large data like media files are now safely persisted using IndexedDB exclusively.");
    } else {
      console.error("Failed to save to localStorage:", err);
    }
  }
}

// ── Notebook CRUD ────────────────────────────
export function createNotebook(
  store: NotesStore,
  name: string,
  color: NoteColor = 'purple',
  icon = '📓',
): { store: NotesStore; id: string } {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // Auto-create a "General" section
  const sectionId = uuidv4();
  const generalSection: Section = {
    id: sectionId,
    name: 'General',
    color: 'blue',
    icon: '📂',
    notebookId: id,
    noteIds: [],
    createdAt: now,
    updatedAt: now,
    isExpanded: true
  };

  const updated: NotesStore = {
    ...store,
    notebooks: {
      ...store.notebooks,
      [id]: { id, name, color, icon: icon as never, description: '', folderIds: [], standaloneSectionIds: [sectionId], createdAt: now, updatedAt: now, isExpanded: true },
    },
    sections: {
      ...store.sections,
      [sectionId]: generalSection,
    },
    notebookOrder: [...store.notebookOrder, id],
  };
  return { store: updated, id };
}

export function updateNotebook(store: NotesStore, id: string, patch: Partial<Notebook>): NotesStore {
  return {
    ...store,
    notebooks: { ...store.notebooks, [id]: { ...store.notebooks[id], ...patch, updatedAt: new Date().toISOString() } },
  };
}

export function deleteNotebook(store: NotesStore, id: string): NotesStore {
  const nb = store.notebooks[id];
  if (!nb) return store;
  const newFolders = { ...store.folders };
  const newSections = { ...store.sections };
  const newNotes = { ...store.notes };
  
  // Cleanup folders, sections, notes
  nb.folderIds.forEach(fid => {
    const fld = newFolders[fid];
    if (fld) {
      fld.sectionIds.forEach(sid => {
        const s = newSections[sid];
        if (s) s.noteIds.forEach(nid => delete newNotes[nid]);
        delete newSections[sid];
      });
    }
    delete newFolders[fid];
  });
  nb.standaloneSectionIds.forEach(sid => {
    const s = newSections[sid];
    if (s) s.noteIds.forEach(nid => delete newNotes[nid]);
    delete newSections[sid];
  });

  const newNotebooks = { ...store.notebooks };
  delete newNotebooks[id];
  return { ...store, notebooks: newNotebooks, folders: newFolders, sections: newSections, notes: newNotes, notebookOrder: store.notebookOrder.filter(i => i !== id) };
}

// ── Folder CRUD ──────────────────────────────
export function createFolder(
  store: NotesStore,
  notebookId: string,
  name: string,
  color: NoteColor = 'purple',
  icon = '📂',
): { store: NotesStore; id: string } {
  const id = uuidv4();
  const now = new Date().toISOString();
  const folder: Folder = { id, name, color, icon, notebookId, sectionIds: [], createdAt: now, updatedAt: now, isExpanded: true };
  const nb = store.notebooks[notebookId];
  return {
    store: {
      ...store,
      folders: { ...store.folders, [id]: folder },
      notebooks: { ...store.notebooks, [notebookId]: { ...nb, folderIds: [...nb.folderIds, id], updatedAt: now } },
    },
    id,
  };
}

export function updateFolder(store: NotesStore, id: string, patch: Partial<Folder>): NotesStore {
  return { ...store, folders: { ...store.folders, [id]: { ...store.folders[id], ...patch, updatedAt: new Date().toISOString() } } };
}

export function deleteFolder(store: NotesStore, id: string): NotesStore {
  const fld = store.folders[id];
  if (!fld) return store;
  const newSections = { ...store.sections };
  const newNotes = { ...store.notes };
  fld.sectionIds.forEach(sid => {
    const s = newSections[sid];
    if (s) s.noteIds.forEach(nid => delete newNotes[nid]);
    delete newSections[sid];
  });
  const newFolders = { ...store.folders };
  delete newFolders[id];
  const nb = store.notebooks[fld.notebookId];
  return {
    ...store,
    folders: newFolders,
    sections: newSections,
    notes: newNotes,
    notebooks: nb ? { ...store.notebooks, [fld.notebookId]: { ...nb, folderIds: nb.folderIds.filter(i => i !== id) } } : store.notebooks,
  };
}

// ── Section CRUD ─────────────────────────────
export function createSection(
  store: NotesStore,
  notebookId: string,
  name: string,
  color: NoteColor = 'blue',
  icon = '📄',
  folderId?: string,
): { store: NotesStore; id: string } {
  const id = uuidv4();
  const now = new Date().toISOString();
  const section: Section = { id, name, color, icon, notebookId, folderId, noteIds: [], createdAt: now, updatedAt: now, isExpanded: true };
  
  const newSections = { ...store.sections, [id]: section };
  const newNotebooks = { ...store.notebooks };
  const newFolders = { ...store.folders };

  if (folderId && store.folders[folderId]) {
    const fld = store.folders[folderId];
    newFolders[folderId] = { ...fld, sectionIds: [...fld.sectionIds, id], updatedAt: now };
  } else {
    const nb = store.notebooks[notebookId];
    if (nb) {
      newNotebooks[notebookId] = { ...nb, standaloneSectionIds: [...nb.standaloneSectionIds, id], updatedAt: now };
    }
  }

  return { store: { ...store, sections: newSections, notebooks: newNotebooks, folders: newFolders }, id };
}

export function updateSection(store: NotesStore, id: string, patch: Partial<Section>): NotesStore {
  return { ...store, sections: { ...store.sections, [id]: { ...store.sections[id], ...patch, updatedAt: new Date().toISOString() } } };
}

export function deleteSection(store: NotesStore, id: string): NotesStore {
  const sec = store.sections[id];
  if (!sec) return store;
  
  const newNotes = { ...store.notes };
  sec.noteIds.forEach(nId => delete newNotes[nId]);

  const newSections = { ...store.sections };
  delete newSections[id];

  const newNotebooks = { ...store.notebooks };
  const newFolders = { ...store.folders };

  if (sec.folderId && store.folders[sec.folderId]) {
    const fld = store.folders[sec.folderId];
    newFolders[sec.folderId] = { ...fld, sectionIds: fld.sectionIds.filter(i => i !== id) };
  } else {
    const nb = store.notebooks[sec.notebookId];
    if (nb) {
      newNotebooks[sec.notebookId] = { ...nb, standaloneSectionIds: (nb.standaloneSectionIds || []).filter(i => i !== id) };
    }
  }

  return { ...store, sections: newSections, notes: newNotes, notebooks: newNotebooks, folders: newFolders };
}

// ── Note CRUD ────────────────────────────────
export function createNote(
  store: NotesStore,
  sectionId: string,
  title = 'Untitled Note',
  templateContent?: string,
  color: NoteColor = 'purple',
): { store: NotesStore; id: string } {
  const id = uuidv4();
  const now = new Date().toISOString();
  const defaultContent = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
  const note: Note = {
    id, title,
    content: templateContent || defaultContent,
    plainText: '', color, icon: '📄',
    tags: [], attachments: [],
    sectionId, createdAt: now, updatedAt: now,
    isPinned: false, isFavorite: false, wordCount: 0, characterCount: 0,
  };
  const sec = store.sections[sectionId];
  return {
    store: {
      ...store,
      notes: { ...store.notes, [id]: note },
      sections: sec ? { ...store.sections, [sectionId]: { ...sec, noteIds: [id, ...sec.noteIds] } } : store.sections,
    },
    id,
  };
}

export function createNoteFromTemplate(store: NotesStore, sectionId: string, templateId: string): { store: NotesStore; id: string } {
  const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
  if (!template) return createNote(store, sectionId);
  return createNote(store, sectionId, template.name, template.content, template.color);
}

export function updateNote(store: NotesStore, id: string, patch: Partial<Note>): NotesStore {
  return { ...store, notes: { ...store.notes, [id]: { ...store.notes[id], ...patch, updatedAt: new Date().toISOString() } } };
}

export function deleteNote(store: NotesStore, id: string): NotesStore {
  const note = store.notes[id];
  if (!note) return store;
  const newNotes = { ...store.notes };
  delete newNotes[id];
  const sec = store.sections[note.sectionId];
  return {
    ...store,
    notes: newNotes,
    sections: sec ? { ...store.sections, [note.sectionId]: { ...sec, noteIds: sec.noteIds.filter(i => i !== id) } } : store.sections,
  };
}

export function addAttachment(store: NotesStore, noteId: string, attachment: MediaAttachment): NotesStore {
  const note = store.notes[noteId];
  if (!note) return store;
  return updateNote(store, noteId, { attachments: [...note.attachments, attachment] });
}

export function searchNotes(store: NotesStore, query: string): Note[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return Object.values(store.notes).filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.plainText.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q)),
  );
}
