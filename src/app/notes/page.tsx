'use client';
// =============================================
// Lumiu Notes — Main App Page
// =============================================

import React, { useEffect } from 'react';
import { NotesProvider, useNotes } from './context';
import { Sidebar } from './components/Sidebar';
// import { NoteListPanel } from './components/NoteListPanel';
import { EditorArea } from './components/EditorArea';
import { TemplateModal } from './components/TemplateModal';
import './notes.css';

function NotesApp() {
  const { state } = useNotes();
  const { ui } = state;

  return (
    <div
      data-theme={ui.theme}
      className={`notes-app ${ui.focusMode ? 'focus-mode' : ''}`}
    >
      {/* Sidebar: Notebooks, Sections & Notes */}
      <Sidebar />

      {/* Editor + Media Panel */}
      <EditorArea />

      {/* Template Modal (portal-style overlay) */}
      <TemplateModal />
    </div>
  );
}

export default function NotesPage() {
  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  );
}
