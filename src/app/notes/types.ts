// =============================================
// Lumiu Notes Module — Core Types
// =============================================

export type NoteColor =
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'pink'
  | 'gray';

export type NoteIcon =
  | '📓' | '📔' | '📒' | '📕' | '📗' | '📘' | '📙'
  | '🗒️' | '📋' | '📌' | '🔖' | '💡' | '🧠' | '🎯'
  | '⚡' | '🚀' | '🌟' | '🎨' | '🔬' | '📐' | '🏆';

export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'youtube' | 'link' | 'file';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'work' | 'personal' | 'creative' | 'planning';
  content: string; // TipTap JSON string
  color: NoteColor;
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string; // TipTap JSON string
  plainText: string;
  color: NoteColor;
  icon: string;
  tags: string[];
  attachments: MediaAttachment[];
  templateId?: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  wordCount: number;
  characterCount: number;
}

export interface Section {
  id: string;
  name: string;
  color: NoteColor;
  icon: string;
  notebookId: string;
  folderId?: string; // Optional parent folder
  noteIds: string[];
  createdAt: string;
  updatedAt: string;
  isExpanded: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: NoteColor;
  icon: string;
  notebookId: string;
  sectionIds: string[];
  createdAt: string;
  updatedAt: string;
  isExpanded: boolean;
}

export interface Notebook {
  id: string;
  name: string;
  color: NoteColor;
  icon: NoteIcon;
  description?: string;
  folderIds: string[]; // Grouped folders
  standaloneSectionIds: string[]; // Sections not in a folder
  createdAt: string;
  updatedAt: string;
  isExpanded: boolean;
}

export interface NotesStore {
  notebooks: Record<string, Notebook>;
  folders: Record<string, Folder>;
  sections: Record<string, Section>;
  notes: Record<string, Note>;
  notebookOrder: string[];
}

export type ThemeMode = 'light' | 'dark';

export interface NotesAppState {
  theme: ThemeMode;
  selectedNotebookId: string | null;
  selectedFolderId: string | null;
  selectedSectionId: string | null;
  selectedNoteId: string | null;
  sidebarCollapsed: boolean;
  sectionListCollapsed: boolean;
  searchQuery: string;
  showTemplates: boolean;
  showMediaPicker: boolean;
  focusMode: boolean;
}

export const NOTE_COLORS: Record<NoteColor, { light: string; dark: string; accent: string; label: string }> = {
  purple: { light: '#f3e8ff', dark: '#3b0764', accent: '#a855f7', label: 'Purple' },
  blue: { light: '#dbeafe', dark: '#1e3a5f', accent: '#3b82f6', label: 'Blue' },
  cyan: { light: '#cffafe', dark: '#164e63', accent: '#06b6d4', label: 'Cyan' },
  green: { light: '#dcfce7', dark: '#14532d', accent: '#22c55e', label: 'Green' },
  yellow: { light: '#fef9c3', dark: '#713f12', accent: '#eab308', label: 'Yellow' },
  orange: { light: '#ffedd5', dark: '#7c2d12', accent: '#f97316', label: 'Orange' },
  red: { light: '#fee2e2', dark: '#7f1d1d', accent: '#ef4444', label: 'Red' },
  pink: { light: '#fce7f3', dark: '#831843', accent: '#ec4899', label: 'Pink' },
  gray: { light: '#f3f4f6', dark: '#1f2937', accent: '#6b7280', label: 'Gray' },
};
