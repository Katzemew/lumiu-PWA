'use client';
// =============================================
// Lumiu Notes — Context & State Management
// =============================================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { NotesStore, NotesAppState, ThemeMode, NoteColor, MediaAttachment } from './types';
import {
  loadStoreAsync, saveStore,
  createNotebook, updateNotebook, deleteNotebook,
  createFolder, updateFolder, deleteFolder,
  createSection, updateSection, deleteSection,
  createNote, createNoteFromTemplate, updateNote, deleteNote, addAttachment,
  searchNotes,
} from './store';
import type { Note, Notebook, Section, Folder } from './types';

// ── State ────────────────────────────────────
interface NotesState {
  store: NotesStore;
  ui: NotesAppState;
}

const defaultUI: NotesAppState = {
  theme: 'dark',
  selectedNotebookId: null,
  selectedFolderId: null,
  selectedSectionId: null,
  selectedNoteId: null,
  sidebarCollapsed: false,
  sectionListCollapsed: false,
  searchQuery: '',
  showTemplates: false,
  showMediaPicker: false,
  focusMode: false,
};

// ── Actions ──────────────────────────────────
type Action =
  | { type: 'LOAD_STORE'; payload: NotesStore }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SELECT_NOTEBOOK'; payload: string | null }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'SELECT_NOTE'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_SECTION_LIST' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_TEMPLATES' }
  | { type: 'TOGGLE_MEDIA_PICKER' }
  | { type: 'TOGGLE_FOCUS' }
  | { type: 'CREATE_NOTEBOOK'; payload: { name: string; color: NoteColor; icon: string } }
  | { type: 'UPDATE_NOTEBOOK'; payload: { id: string; patch: Partial<Notebook> } }
  | { type: 'DELETE_NOTEBOOK'; payload: string }
  | { type: 'TOGGLE_NOTEBOOK_EXPAND'; payload: string }
  | { type: 'CREATE_FOLDER'; payload: { notebookId: string; name: string; color: NoteColor; icon: string } }
  | { type: 'UPDATE_FOLDER'; payload: { id: string; patch: Partial<Folder> } }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'TOGGLE_FOLDER_EXPAND'; payload: string }
  | { type: 'CREATE_SECTION'; payload: { notebookId: string; folderId?: string; name: string; color: NoteColor; icon: string } }
  | { type: 'UPDATE_SECTION'; payload: { id: string; patch: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'TOGGLE_SECTION_EXPAND'; payload: string }
  | { type: 'CREATE_NOTE'; payload: { sectionId: string; title?: string } }
  | { type: 'CREATE_NOTE_FROM_TEMPLATE'; payload: { sectionId: string; templateId: string } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; patch: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_ATTACHMENT'; payload: { noteId: string; attachment: MediaAttachment } }
  | { type: 'REORDER_NOTEBOOKS'; payload: { activeId: string; overId: string } }
  | { type: 'REORDER_FOLDERS'; payload: { notebookId: string; activeId: string; overId: string } }
  | { type: 'REORDER_SECTIONS'; payload: { notebookId: string; folderId?: string; activeId: string; overId: string } }
  | { type: 'REORDER_NOTES'; payload: { sectionId: string; activeId: string; overId: string } }
  | { type: 'TELEPORT_TO_NOTE'; payload: { notebookId: string; folderId?: string; sectionId: string; noteId: string } };

function reducer(state: NotesState, action: Action): NotesState {
  switch (action.type) {
    case 'LOAD_STORE': return { ...state, store: action.payload };
    case 'SET_THEME': return { ...state, ui: { ...state.ui, theme: action.payload } };
    case 'SELECT_NOTEBOOK': return { ...state, ui: { ...state.ui, selectedNotebookId: action.payload, selectedFolderId: null, selectedSectionId: null, selectedNoteId: null } };
    case 'SELECT_SECTION': {
      // Find parent folder if any
      const sec = state.store.sections[action.payload || ''];
      return { ...state, ui: { ...state.ui, selectedSectionId: action.payload, selectedNoteId: null, selectedFolderId: sec?.id || null } };
    }
    case 'SELECT_NOTE': return { ...state, ui: { ...state.ui, selectedNoteId: action.payload } };
    case 'TOGGLE_SIDEBAR': return { ...state, ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } };
    case 'TOGGLE_SECTION_LIST': return { ...state, ui: { ...state.ui, sectionListCollapsed: !state.ui.sectionListCollapsed } };
    case 'SET_SEARCH': return { ...state, ui: { ...state.ui, searchQuery: action.payload } };
    case 'TOGGLE_TEMPLATES': return { ...state, ui: { ...state.ui, showTemplates: !state.ui.showTemplates } };
    case 'TOGGLE_MEDIA_PICKER': return { ...state, ui: { ...state.ui, showMediaPicker: !state.ui.showMediaPicker } };
    case 'TOGGLE_FOCUS': return { ...state, ui: { ...state.ui, focusMode: !state.ui.focusMode } };

    case 'CREATE_NOTEBOOK': {
      const { store, id } = createNotebook(state.store, action.payload.name, action.payload.color, action.payload.icon);
      return { store, ui: { ...state.ui, selectedNotebookId: id } };
    }
    case 'UPDATE_NOTEBOOK': {
      return { ...state, store: updateNotebook(state.store, action.payload.id, action.payload.patch) };
    }
    case 'DELETE_NOTEBOOK': {
      const newUI = { ...state.ui };
      if (state.ui.selectedNotebookId === action.payload) {
        newUI.selectedNotebookId = null; newUI.selectedSectionId = null; newUI.selectedNoteId = null;
      }
      return { store: deleteNotebook(state.store, action.payload), ui: newUI };
    }
    case 'TOGGLE_NOTEBOOK_EXPAND': {
      const nb = state.store.notebooks[action.payload];
      if (!nb) return state;
      return { ...state, store: updateNotebook(state.store, action.payload, { isExpanded: !nb.isExpanded }) };
    }
    case 'CREATE_FOLDER': {
      const { store, id } = createFolder(state.store, action.payload.notebookId, action.payload.name, action.payload.color, action.payload.icon);
      return { store, ui: { ...state.ui, selectedFolderId: id } };
    }
    case 'UPDATE_FOLDER': return { ...state, store: updateFolder(state.store, action.payload.id, action.payload.patch) };
    case 'DELETE_FOLDER': {
      const newUI = { ...state.ui };
      if (state.ui.selectedFolderId === action.payload) { newUI.selectedFolderId = null; newUI.selectedSectionId = null; }
      return { store: deleteFolder(state.store, action.payload), ui: newUI };
    }
    case 'TOGGLE_FOLDER_EXPAND': {
      const fld = state.store.folders[action.payload];
      if (!fld) return state;
      return { ...state, store: updateFolder(state.store, action.payload, { isExpanded: !fld.isExpanded }) };
    }
    case 'CREATE_SECTION': {
      const { store, id } = createSection(state.store, action.payload.notebookId, action.payload.name, action.payload.color, action.payload.icon, action.payload.folderId);
      return { store, ui: { ...state.ui, selectedSectionId: id, selectedFolderId: action.payload.folderId || null } };
    }
    case 'UPDATE_SECTION': {
      return { ...state, store: updateSection(state.store, action.payload.id, action.payload.patch) };
    }
    case 'DELETE_SECTION': {
      const newUI = { ...state.ui };
      if (state.ui.selectedSectionId === action.payload) { newUI.selectedSectionId = null; newUI.selectedNoteId = null; }
      return { store: deleteSection(state.store, action.payload), ui: newUI };
    }
    case 'TOGGLE_SECTION_EXPAND': {
      const sec = state.store.sections[action.payload];
      if (!sec) return state;
      return { ...state, store: updateSection(state.store, action.payload, { isExpanded: !sec.isExpanded }) };
    }
    case 'CREATE_NOTE': {
      const { store, id } = createNote(state.store, action.payload.sectionId, action.payload.title);
      return { store, ui: { ...state.ui, selectedNoteId: id } };
    }
    case 'CREATE_NOTE_FROM_TEMPLATE': {
      const { store, id } = createNoteFromTemplate(state.store, action.payload.sectionId, action.payload.templateId);
      return { store, ui: { ...state.ui, selectedNoteId: id, showTemplates: false } };
    }
    case 'UPDATE_NOTE': {
      return { ...state, store: updateNote(state.store, action.payload.id, action.payload.patch) };
    }
    case 'DELETE_NOTE': {
      const newUI = { ...state.ui };
      if (state.ui.selectedNoteId === action.payload) newUI.selectedNoteId = null;
      return { store: deleteNote(state.store, action.payload), ui: newUI };
    }
    case 'ADD_ATTACHMENT': {
      return { ...state, store: addAttachment(state.store, action.payload.noteId, action.payload.attachment) };
    }
    case 'REORDER_NOTEBOOKS': {
      const { activeId, overId } = action.payload;
      const oldIndex = state.store.notebookOrder.indexOf(activeId);
      const newIndex = state.store.notebookOrder.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newOrder = [...state.store.notebookOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      return { ...state, store: { ...state.store, notebookOrder: newOrder } };
    }
    case 'REORDER_FOLDERS': {
      const { notebookId, activeId, overId } = action.payload;
      const nb = state.store.notebooks[notebookId];
      if (!nb) return state;
      const oldIndex = nb.folderIds.indexOf(activeId);
      const newIndex = nb.folderIds.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newOrder = [...nb.folderIds];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      return { ...state, store: { ...state.store, notebooks: { ...state.store.notebooks, [notebookId]: { ...nb, folderIds: newOrder } } } };
    }
    case 'REORDER_SECTIONS': {
      const { folderId, notebookId, activeId, overId } = action.payload;
      if (folderId) {
        const fld = state.store.folders[folderId];
        if (!fld) return state;
        const oldI = fld.sectionIds.indexOf(activeId);
        const newI = fld.sectionIds.indexOf(overId);
        if (oldI === -1 || newI === -1) return state;
        const o = [...fld.sectionIds];
        const [r] = o.splice(oldI, 1);
        o.splice(newI, 0, r);
        return { ...state, store: { ...state.store, folders: { ...state.store.folders, [folderId]: { ...fld, sectionIds: o } } } };
      } else {
        const nb = state.store.notebooks[notebookId];
        if (!nb) return state;
        const oldI = nb.standaloneSectionIds.indexOf(activeId);
        const newI = nb.standaloneSectionIds.indexOf(overId);
        if (oldI === -1 || newI === -1) return state;
        const o = [...nb.standaloneSectionIds];
        const [r] = o.splice(oldI, 1);
        o.splice(newI, 0, r);
        return { ...state, store: { ...state.store, notebooks: { ...state.store.notebooks, [notebookId]: { ...nb, standaloneSectionIds: o } } } };
      }
    }
    case 'REORDER_NOTES': {
      const { sectionId, activeId, overId } = action.payload;
      const sec = state.store.sections[sectionId];
      if (!sec) return state;
      const oldI = sec.noteIds.indexOf(activeId);
      const newI = sec.noteIds.indexOf(overId);
      if (oldI === -1 || newI === -1) return state;
      const o = [...sec.noteIds];
      const [r] = o.splice(oldI, 1);
      o.splice(newI, 0, r);
      return { ...state, store: { ...state.store, sections: { ...state.store.sections, [sectionId]: { ...sec, noteIds: o } } } };
    }
    case 'TELEPORT_TO_NOTE': {
      const { notebookId, folderId, sectionId, noteId } = action.payload;
      const nb = state.store.notebooks[notebookId];
      const fld = folderId ? state.store.folders[folderId] : null;
      const sec = state.store.sections[sectionId];
      
      const newStore = { ...state.store };
      if (nb) newStore.notebooks = { ...newStore.notebooks, [notebookId]: { ...nb, isExpanded: true } };
      if (folderId && fld) newStore.folders = { ...newStore.folders, [folderId]: { ...fld, isExpanded: true } };
      if (sec) newStore.sections = { ...newStore.sections, [sectionId]: { ...sec, isExpanded: true } };

      return {
        ...state,
        store: newStore,
        ui: {
          ...state.ui,
          selectedNotebookId: notebookId,
          selectedFolderId: folderId || null,
          selectedSectionId: sectionId,
          selectedNoteId: noteId,
          searchQuery: '',
        },
      };
    }
    default: return state;
  }
}

// ── Context ──────────────────────────────────
interface NotesContextValue {
  state: NotesState;
  dispatch: React.Dispatch<Action>;
  // Convenience selectors
  selectedNote: Note | null;
  selectedSection: Section | null;
  selectedNotebook: Notebook | null;
  searchResults: Note[];
  // Convenience actions
  setTheme: (t: ThemeMode) => void;
  toggleFocusMode: () => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { store: { notebooks: {}, folders: {}, sections: {}, notes: {}, notebookOrder: [] }, ui: defaultUI });

  // Load from localeStorage or IndexedDB on mount
  useEffect(() => {
    async function init() {
      const stored = await loadStoreAsync();
      dispatch({ type: 'LOAD_STORE', payload: stored });
      // Also load theme pref
      const savedTheme = localStorage.getItem('lumiu_theme') as ThemeMode | null;
      if (savedTheme) dispatch({ type: 'SET_THEME', payload: savedTheme });
      // Auto-select first notebook + section + note
      const nbOrder = stored.notebookOrder;
      if (nbOrder.length > 0) {
        const nbId = nbOrder[0];
        dispatch({ type: 'SELECT_NOTEBOOK', payload: nbId });
        const nb = stored.notebooks[nbId];
        if (nb) {
          let firstSecId = null;
          if (nb.standaloneSectionIds.length > 0) {
            firstSecId = nb.standaloneSectionIds[0];
          } else if (nb.folderIds.length > 0) {
            const firstFolder = stored.folders[nb.folderIds[0]];
            if (firstFolder && firstFolder.sectionIds.length > 0) {
              firstSecId = firstFolder.sectionIds[0];
            }
          }

          if (firstSecId) {
            dispatch({ type: 'SELECT_SECTION', payload: firstSecId });
            const sec = stored.sections[firstSecId];
            if (sec && sec.noteIds.length > 0) {
              dispatch({ type: 'SELECT_NOTE', payload: sec.noteIds[0] });
            }
          }
        }
      }
    }
    init();
  }, []);

  // Persist store changes
  useEffect(() => {
    if (state.store.notebookOrder.length > 0) saveStore(state.store);
  }, [state.store]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('lumiu_theme', state.ui.theme);
  }, [state.ui.theme]);

  const selectedNote = state.ui.selectedNoteId ? (state.store.notes[state.ui.selectedNoteId] ?? null) : null;
  const selectedSection = state.ui.selectedSectionId ? (state.store.sections[state.ui.selectedSectionId] ?? null) : null;
  const selectedNotebook = state.ui.selectedNotebookId ? (state.store.notebooks[state.ui.selectedNotebookId] ?? null) : null;
  const searchResults = state.ui.searchQuery ? searchNotes(state.store, state.ui.searchQuery) : [];

  const setTheme = useCallback((t: ThemeMode) => dispatch({ type: 'SET_THEME', payload: t }), []);
  const toggleFocusMode = useCallback(() => dispatch({ type: 'TOGGLE_FOCUS' }), []);

  return (
    <NotesContext.Provider value={{ state, dispatch, selectedNote, selectedSection, selectedNotebook, searchResults, setTheme, toggleFocusMode }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider');
  return ctx;
}
