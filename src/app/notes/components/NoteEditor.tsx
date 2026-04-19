'use client';
// =============================================
// Lumiu Notes — Rich Text Editor (TipTap)
// =============================================

import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './extensions/ResizableImageExtension';
import { PdfExtension } from './extensions/PdfNodeExtension';
import { AudioExtension } from './extensions/AudioExt-2';
import { FontSize } from './extensions/FontSize';
import FontFamily from '@tiptap/extension-font-family';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table';
import { TableHeader } from '@tiptap/extension-table';
import { YoutubeExtension } from './extensions/YoutubeExtension';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Extension } from '@tiptap/core';
import type { Note } from '../types';
import { useNotes } from '../context';

// ── SVG Icons ────────────────────────────────
const B = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 110 8H6zM6 12h9a4 4 0 110 8H6z" /></svg>;
const I = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>;
const U = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4v6a6 6 0 0012 0V4M4 20h16" /></svg>;
const S = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><path d="M 7 7 Q 8 3 12 3 T 17 7M7 17Q8 21 12 21T17 17" /></svg>;
const HL = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21v-3.75l9-9 3.75 3.75-9 9H3zm14.25-10.5L14.5 7.75 16 6.25a.75.75 0 011.06 0l2.19 2.19a.75.75 0 010 1.06l-1.5 1.5z" /></svg>;
const H1 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 6v12M12 6v12" /><text x="15" y="16" fill="currentColor" stroke="none" fontSize="9" fontWeight="700">1</text></svg>;
const H2 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 6v12M12 6v12" /><text x="15" y="16" fill="currentColor" stroke="none" fontSize="9" fontWeight="700">2</text></svg>;
const H3 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 6v12M12 6v12" /><text x="15" y="16" fill="currentColor" stroke="none" fontSize="9" fontWeight="700">3</text></svg>;
const UL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>;
const OL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="3" y="9" fill="currentColor" stroke="none" fontSize="7">1.</text><text x="3" y="15" fill="currentColor" stroke="none" fontSize="7">2.</text><text x="3" y="21" fill="currentColor" stroke="none" fontSize="7">3.</text></svg>;
const TL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="6" height="6" rx="1" /><line x1="13" y1="8" x2="21" y2="8" /><rect x="3" y="14" width="6" height="6" rx="1" fill="currentColor" opacity=".3" /><line x1="13" y1="17" x2="21" y2="17" /></svg>;
const BQ = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21v-4a4 4 0 004-4V3" /><path d="M13 21v-4a4 4 0 004-4V3" /></svg>;
const CODE = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const HR_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12" /></svg>;
const LINK_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
const IMG_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
const PDF_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const YT_ICON = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
const TABLE_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>;
const AlignL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>;
const AlignC = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>;
const AlignR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></svg>;
const UNDO_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 010 11H11" /></svg>;
const REDO_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 000 11H13" /></svg>;
const SUB = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5 12 15M12 5 4 15" /><path d="M16 18h4M16 18a2 2 0 012-2h.5c.83 0 1.5.67 1.5 1.5S19.33 19 18.5 19H16v1.5c0 .83.67 1.5 1.5 1.5h2" /></svg>;
const SUP = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 13 12 20M12 13 4 20" /><path d="M16 4h4M16 4a2 2 0 012-2h.5c.83 0 1.5.67 1.5 1.5S19.33 5 18.5 5H16v1.5c0 .83.67 1.5 1.5 1.5h2" /></svg>;
const AUDIO_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /><path d="M19.07 4.93a10 10 0 010 14.14" /></svg>;
const UPLOAD_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const FONT_SIZE_ICON = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>;

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  tooltip: string;
  disabled?: boolean;
  children: React.ReactNode;
}
function ToolbarButton({ onClick, active, tooltip, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      className={`toolbar-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      type="button"
    >
      {children}
    </button>
  );
}

function Divider() { return <div className="toolbar-divider" />; }

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { dispatch } = useNotes();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false,
      }),
      ResizableImage,
      PdfExtension,
      FontFamily,
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Start writing your note… ✨' }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TableHeader,
      YoutubeExtension.configure({
        width: 640,
      }),
      AudioExtension,
      FontSize,
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph', 'resizableImage', 'pdf', 'audio', 'youtubeVideo'] }),
      Underline,
      Subscript,
      Superscript,
      Extension.create({
        name: 'customShortcuts',
        addKeyboardShortcuts() {
          return {
            'Mod-z': () => this.editor.commands.undo(),
            'Mod-y': () => this.editor.commands.redo(),
            'Mod-Shift-z': () => this.editor.commands.redo(),
          }
        },
      }),
    ],
    content: note.content ? JSON.parse(note.content) : { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: { class: 'ProseMirror', spellcheck: 'true' },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData('text/plain') ?? '';
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|[^\s]+)/g;
        const match = text.match(youtubeRegex);
        if (match) {
          const { schema } = view.state;
          const node = schema.nodes.youtubeVideo.create({ src: match[0] });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
          return true; // handled
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      const json = JSON.stringify(editor.getJSON());
      const text = editor.getText();
      const chars = editor.storage.characterCount?.characters?.() ?? 0;
      const words = editor.storage.characterCount?.words?.() ?? 0;
      
      // Media Scanner: Extract all media URLs currently in the document
      const currentUrls = new Set<string>();
      editor.getJSON().content?.forEach(function walk(node: any) {
        if (['resizableImage', 'pdf', 'audio', 'youtubeVideo'].includes(node.type)) {
          if (node.attrs?.src) currentUrls.add(node.attrs.src);
        }
        if (node.content) node.content.forEach(walk);
      });
      window.dispatchEvent(new CustomEvent('media-scanner-update', { detail: { urls: Array.from(currentUrls) } }));

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        dispatch({ type: 'UPDATE_NOTE', payload: { id: note.id, patch: { content: json, plainText: text, characterCount: chars, wordCount: words } } });
      }, 800);
    },
    // We handle toolbar state updates manually via useEffect and transactions for zero latency
    onTransaction() {},
  }, [note.id]);

  // ── High-Precision Toolbar State ───────────────
  const [toolbarState, setToolbarState] = React.useState<any>({ color: '#000000', fontSize: '', fontFamily: '' });

  const updateToolbarState = useCallback(() => {
    if (!editor) return;
    let alignL = editor.isActive({ textAlign: 'left' });
    let alignC = editor.isActive({ textAlign: 'center' });
    let alignR = editor.isActive({ textAlign: 'right' });

    const activeMediaType = ['resizableImage', 'pdf', 'audio', 'youtubeVideo'].find(type => editor.isActive(type));
    if (activeMediaType) {
      const mediaAlign = editor.getAttributes(activeMediaType).textAlign;
      alignL = mediaAlign === 'left' || (!mediaAlign && activeMediaType === 'pdf' ? true : false); // PDF defaults to left, others to center
      alignC = mediaAlign === 'center' || (!mediaAlign && activeMediaType !== 'pdf' ? true : false);
      alignR = mediaAlign === 'right';
    }

    let fontSize = editor.getAttributes('textStyle').fontSize || '';
    if (!fontSize) {
      if (editor.isActive('heading', { level: 1 })) fontSize = '20px';
      else if (editor.isActive('heading', { level: 2 })) fontSize = '16px';
      else if (editor.isActive('heading', { level: 3 })) fontSize = '14px';
      else fontSize = '12px';
    }

    setToolbarState({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      highlight: editor.isActive('highlight'),
      subscript: editor.isActive('subscript'),
      superscript: editor.isActive('superscript'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      taskList: editor.isActive('taskList'),
      blockquote: editor.isActive('blockquote'),
      code: editor.isActive('code'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      alignLeft: alignL,
      alignCenter: alignC,
      alignRight: alignR,
      fontFamily: editor.getAttributes('textStyle').fontFamily || '',
      fontSize: fontSize,
      color: editor.getAttributes('textStyle').color || '#000000',
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', updateToolbarState);
    editor.on('selectionUpdate', updateToolbarState);
    // Initial state
    updateToolbarState();
    return () => {
      editor.off('transaction', updateToolbarState);
      editor.off('selectionUpdate', updateToolbarState);
    };
  }, [editor, updateToolbarState]);

  // Update editor content when note changes externally
  useEffect(() => {
    if (!editor || !note.content) return;
    try {
      const current = JSON.stringify(editor.getJSON());
      if (current !== note.content) {
        editor.commands.setContent(JSON.parse(note.content), { emitUpdate: false });
      }
    } catch { /* ignore */ }
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editor) return;
    const handleInsertMedia = (e: any) => {
      const { type, url } = e.detail;
      if (type === 'image') (editor.chain().focus() as any).setImage({ src: url }).run();
      else if (type === 'pdf') (editor.chain().focus() as any).setPdf({ src: url }).run();
      else if (type === 'audio') (editor.chain().focus() as any).setAudio({ src: url }).run();
      else if (type === 'youtube') (editor.chain().focus() as any).setYoutubeVideo({ src: url }).run();
      else if (type === 'link') editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };
    window.addEventListener('insert-media', handleInsertMedia);
    return () => window.removeEventListener('insert-media', handleInsertMedia);
  }, [editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editor || !note) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        let type: any = 'file';
        if (file.type.startsWith('image/')) {
          type = 'image';
          (editor.chain().focus() as any).setImage({ src: url }).run();
        }
        else if (file.type === 'application/pdf') {
          type = 'pdf';
          (editor.chain().focus() as any).setPdf({ src: url }).run();
        }
        else if (file.type.startsWith('audio/')) {
          type = 'audio';
          (editor.chain().focus() as any).setAudio({ src: url }).run();
        }

        // Sync to Media Panel
        dispatch({
          type: 'ADD_ATTACHMENT',
          payload: {
            noteId: note.id,
            attachment: {
              id: Math.random().toString(36).slice(2, 9),
              type,
              url,
              name: file.name,
              size: file.size,
              createdAt: new Date().toISOString()
            }
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href ?? '';
    const url = prompt('Enter URL:', prev);
    if (url === null) return;
    if (url === '') { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    
    // Paste link directly into the workspace if selection is empty
    if (editor?.state.selection.empty) {
      editor?.chain().focus().insertContent(`<a href="${url}">${url}</a> `).run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    if (imageInputRef.current) imageInputRef.current.value = '';
    imageInputRef.current?.click();
  }, []);

  const insertPdf = useCallback(() => {
    const url = prompt('PDF URL:');
    if (url) {
      (editor?.chain().focus() as any).setPdf({ src: url }).run();
      dispatch({ type: 'ADD_ATTACHMENT', payload: { noteId: note.id, attachment: { id: Date.now().toString(), type: 'pdf', url, name: 'External PDF', createdAt: new Date().toISOString() } } });
    }
  }, [editor, note.id, dispatch]);

  const insertYoutube = useCallback(() => {
    const url = prompt('YouTube URL:');
    if (url) {
      (editor?.chain().focus() as any).setYoutubeVideo({ src: url }).run();
      dispatch({ type: 'ADD_ATTACHMENT', payload: { noteId: note.id, attachment: { id: Date.now().toString(), type: 'youtube', url, name: 'YouTube Video', createdAt: new Date().toISOString() } } });
    }
  }, [editor, note.id, dispatch]);

  const insertAudio = useCallback(() => {
    const url = prompt('Audio URL:');
    if (url) {
      (editor?.chain().focus() as any).setAudio({ src: url }).run();
      dispatch({ type: 'ADD_ATTACHMENT', payload: { noteId: note.id, attachment: { id: Date.now().toString(), type: 'audio', url, name: 'External Audio', createdAt: new Date().toISOString() } } });
    }
  }, [editor, note.id, dispatch]);

  const setFontSize = useCallback((size: string) => {
    if (size === 'default') {
      editor?.chain().focus().unsetFontSize().run();
    } else {
      editor?.chain().focus().setFontSize(size).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const applyAlignment = (alignment: string) => {
    if (!editor) return;
    if (editor.isActive('resizableImage')) {
      editor.chain().focus().updateAttributes('resizableImage', { textAlign: alignment }).run();
    } else if (editor.isActive('pdf')) {
      editor.chain().focus().updateAttributes('pdf', { textAlign: alignment }).run();
    } else if (editor.isActive('audio')) {
      editor.chain().focus().updateAttributes('audio', { textAlign: alignment }).run();
    } else if (editor.isActive('youtubeVideo')) {
      editor.chain().focus().updateAttributes('youtubeVideo', { textAlign: alignment }).run();
    } else {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  };

  const toolbar = toolbarState || {} as any;
  const isMediaSelected = editor ? (editor.isActive('resizableImage') || editor.isActive('pdf') || editor.isActive('audio') || editor.isActive('youtubeVideo')) : false;
  const disableTextFormat = isMediaSelected;

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Bubble Menu (Floating on selection) */}
      <BubbleMenu 
        editor={editor} 
        className="bubble-menu" 
        shouldShow={({ editor, from, to }) => {
          const isMedia = editor.isActive('resizableImage') || editor.isActive('pdf') || editor.isActive('audio') || editor.isActive('youtubeVideo');
          return !isMedia && from !== to && editor.isEditable;
        }}
      >
        <div className="toolbar-group">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={toolbar.bold} tooltip="Bold"><B /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={toolbar.italic} tooltip="Italic"><I /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={toolbar.underline} tooltip="Underline"><U /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={toolbar.strike} tooltip="Strikethrough"><S /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={toolbar.h1} tooltip="H1"><H1 /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={toolbar.h2} tooltip="H2"><H2 /></ToolbarButton>
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} tooltip="Link"><LINK_ICON /></ToolbarButton>
        </div>
      </BubbleMenu>

      {/* Formatting Toolbar */}
      <div className="format-toolbar">
        {/* Undo/Redo */}
        <div className="toolbar-group">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} tooltip="Undo (Ctrl+Z)" disabled={!toolbar.canUndo}><UNDO_ICON /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} tooltip="Redo (Ctrl+Y)" disabled={!toolbar.canRedo}><REDO_ICON /></ToolbarButton>
        </div>
        <Divider />

        {/* Format Dropdown */}
        <div className="toolbar-group">
          <select
            className="toolbar-dropdown format-sync"
            value={toolbar.h1 ? 'h1' : toolbar.h2 ? 'h2' : toolbar.h3 ? 'h3' : 'p'}
            onChange={(e) => {
              const val = e.target.value;
              editor.chain().focus().unsetFontSize().run(); // Unset custom size to strictly sync with header css
              if (val === 'p') editor.chain().focus().setParagraph().run();
              else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            disabled={disableTextFormat}
            style={{ width: 110, marginRight: 4 }}
          >
            <option value="p">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>
        <Divider />

        {/* Text Formatting */}
        <div className="toolbar-group">
          {/* Font Family Dropdown */}
          <select
            className="toolbar-dropdown font-sync"
            onChange={e => {
              const val = e.target.value;
              if (val) editor.chain().focus().setFontFamily(val).run();
              else editor.chain().focus().unsetFontFamily().run();
            }}
            value={toolbar.fontFamily}
            disabled={disableTextFormat}
            style={{ width: 140, marginRight: 4 }}
          >
            <option value="">Default Font</option>
            <optgroup label="Dyslexia Friendly">
              <option value="Lexend">Lexend</option>
              <option value="Atkinson Hyperlegible">Atkinson Hyper</option>
              <option value="Comic Sans MS, Comic Sans">Comic Sans</option>
            </optgroup>
            <optgroup label="Modern Sans">
              <option value="Inter">Inter</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Lato">Lato</option>
              <option value="Nunito">Nunito</option>
              <option value="Ubuntu">Ubuntu</option>
              <option value="Source Sans Pro">Source Sans</option>
              <option value="Work Sans">Work Sans</option>
            </optgroup>
            <optgroup label="Elegant Serif">
              <option value="Merriweather">Merriweather</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Lora">Lora</option>
              <option value="Crimson Text">Crimson Text</option>
              <option value="Bitter">Bitter</option>
              <option value="EB Garamond">EB Garamond</option>
            </optgroup>
            <optgroup label="Classic">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </optgroup>
            <optgroup label="Monospace">
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Courier New">Courier New</option>
              <option value="monospace">Standard Mono</option>
            </optgroup>
          </select>

          {/* Smart Font Size Picker */}
          <FontSizePicker editor={editor} currentSize={toolbar.fontSize} disabled={disableTextFormat} />

          <input
            type="color"
            onInput={e => {
              const val = (e.target as HTMLInputElement).value;
              editor.chain().focus().setColor(val).run();
            }}
            value={/^#[0-9A-Fa-f]{6}$/.test(toolbar.color) ? toolbar.color : '#000000'}
            disabled={disableTextFormat}
            className="toolbar-color-picker"
            title="Text Color"
          />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={toolbar.bold} disabled={disableTextFormat} tooltip="Bold (Ctrl+B)"><B /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={toolbar.italic} disabled={disableTextFormat} tooltip="Italic (Ctrl+I)"><I /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={toolbar.underline} disabled={disableTextFormat} tooltip="Underline (Ctrl+U)"><U /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={toolbar.strike} disabled={disableTextFormat} tooltip="Strikethrough"><S /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={toolbar.highlight} disabled={disableTextFormat} tooltip="Highlight"><HL /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={toolbar.subscript} disabled={disableTextFormat} tooltip="Subscript"><SUB /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={toolbar.superscript} disabled={disableTextFormat} tooltip="Superscript"><SUP /></ToolbarButton>
        </div>
        <Divider />

        {/* Lists */}
        <div className="toolbar-group">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={toolbar.bulletList} tooltip="Bullet List"><UL /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={toolbar.orderedList} tooltip="Numbered List"><OL /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={toolbar.taskList} tooltip="Task List"><TL /></ToolbarButton>
        </div>
        <Divider />

        {/* Alignment */}
        <div className="toolbar-group">
          <ToolbarButton onClick={() => applyAlignment('left')} active={toolbar.alignLeft} tooltip="Align Left"><AlignL /></ToolbarButton>
          <ToolbarButton onClick={() => applyAlignment('center')} active={toolbar.alignCenter} tooltip="Center"><AlignC /></ToolbarButton>
          <ToolbarButton onClick={() => applyAlignment('right')} active={toolbar.alignRight} tooltip="Align Right"><AlignR /></ToolbarButton>
        </div>
        <Divider />

        {/* Block types */}
        <div className="toolbar-group">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={toolbar.blockquote} tooltip="Blockquote"><BQ /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={toolbar.code} tooltip="Inline Code"><CODE /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Divider"><HR_ICON /></ToolbarButton>
        </div>
        <Divider />

        {/* Media */}
        <div className="toolbar-group">
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} tooltip="Insert Link"><LINK_ICON /></ToolbarButton>
          <ToolbarButton onClick={() => { if (fileInputRef.current) fileInputRef.current.value = ''; fileInputRef.current?.click(); }} tooltip="Upload Media"><UPLOAD_ICON /></ToolbarButton>
          <ToolbarButton onClick={insertImage} tooltip="Insert Image"><IMG_ICON /></ToolbarButton>
          <ToolbarButton onClick={insertYoutube} tooltip="Embed YouTube"><YT_ICON /></ToolbarButton>
          <ToolbarButton onClick={insertTable} tooltip="Insert Table"><TABLE_ICON /></ToolbarButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Word count */}
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, paddingRight: 4 }}>
          {editor.storage.characterCount?.words?.() ?? 0} words
        </div>
      </div>

      {/* Editor Content */}
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ── Smart FontSize Picker ───────────────────────
// Handles single-click (dropdown) and double-click (custom input)
function FontSizePicker({ editor, currentSize, disabled }: { editor: any, currentSize: string, disabled?: boolean }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitSize = (val: string) => {
    setIsEditing(false);
    if (!val) return;
    // Append px if it's just a number
    let finalSize = val;
    if (/^\d*\.?\d+$/.test(val)) {
      finalSize = val + 'px';
    }
    editor.chain().focus().setFontSize(finalSize).run();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className="toolbar-size-input"
        type="text"
        value={tempValue}
        placeholder={currentSize || 'Size'}
        onChange={e => setTempValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') commitSize(tempValue);
          if (e.key === 'Escape') setIsEditing(false);
        }}
        onBlur={() => commitSize(tempValue)}
      />
    );
  }

  return (
    <select
      className="toolbar-dropdown size-sync"
      onDoubleClick={() => {
        setIsEditing(true);
        setTempValue(currentSize.replace('px', ''));
      }}
      onChange={e => {
        const val = e.target.value;
        if (val === 'default') editor.chain().focus().unsetFontSize().run();
        else editor.chain().focus().setFontSize(val).run();
      }}
      value={currentSize || 'default'}
      disabled={disabled}
      style={{ width: 70, marginRight: 4 }}
      data-tooltip="Double-click to type size"
    >
      <option value="default">Size</option>
      {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map(size => (
        <option key={size} value={`${size}px`}>{size}</option>
      ))}
      {currentSize && !['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'].includes(currentSize) && (
        <option value={currentSize}>{currentSize.replace('px', '')}</option>
      )}
    </select>
  );
}

