'use client';
// =============================================
// Lumiu Notes — Template Picker Modal
// =============================================

import React, { useState } from 'react';
import { useNotes } from '../context';
import { DEFAULT_TEMPLATES } from '../templates';
import { NOTE_COLORS } from '../types';
import type { NoteTemplate } from '../types';

type Category = 'all' | 'study' | 'work' | 'personal' | 'creative' | 'planning';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'study', label: 'Study', emoji: '📚' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'personal', label: 'Personal', emoji: '🌿' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'planning', label: 'Planning', emoji: '🗺️' },
];

export function TemplateModal() {
  const { state, dispatch, selectedSection } = useNotes();
  const [category, setCategory] = useState<Category>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  if (!state.ui.showTemplates) return null;

  const templates = category === 'all'
    ? DEFAULT_TEMPLATES
    : DEFAULT_TEMPLATES.filter(t => t.category === category);

  const applyTemplate = (template: NoteTemplate) => {
    if (!selectedSection) {
      alert('Please select a section first.');
      return;
    }
    dispatch({ type: 'CREATE_NOTE_FROM_TEMPLATE', payload: { sectionId: selectedSection.id, templateId: template.id } });
  };

  const dismiss = () => dispatch({ type: 'TOGGLE_TEMPLATES' });

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">📋 Note Templates</div>
            <div className="modal-subtitle">Select a template to start your note faster</div>
          </div>
          <button className="btn-icon" onClick={dismiss} style={{ fontSize: 18 }}>✕</button>
        </div>

        {/* Category Filter */}
        <div className="template-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="template-grid">
          {/* Blank note */}
          <div
            className="template-card"
            style={{
              border: hovered === '__blank' ? '1px solid var(--accent)' : undefined,
              background: hovered === '__blank' ? 'var(--accent-dim)' : undefined,
            }}
            onMouseEnter={() => setHovered('__blank')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              if (!selectedSection) { alert('Please select a section first.'); return; }
              dispatch({ type: 'CREATE_NOTE', payload: { sectionId: selectedSection.id } });
              dispatch({ type: 'TOGGLE_TEMPLATES' });
            }}
          >
            <div className="template-card-icon">📄</div>
            <div className="template-card-name">Blank Note</div>
            <div className="template-card-desc">Start from scratch with a completely empty note</div>
            <div className="template-card-tags">
              <span className="template-tag">blank</span>
              <span className="template-tag">empty</span>
            </div>
          </div>

          {templates.map(tmpl => {
            const colorInfo = NOTE_COLORS[tmpl.color];
            return (
              <div
                key={tmpl.id}
                className="template-card"
                style={{
                  borderLeft: `3px solid ${colorInfo.accent}`,
                  transform: hovered === tmpl.id ? 'translateY(-3px)' : undefined,
                  boxShadow: hovered === tmpl.id ? `0 8px 24px ${colorInfo.accent}30` : undefined,
                }}
                onMouseEnter={() => setHovered(tmpl.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => applyTemplate(tmpl)}
              >
                <div className="template-card-icon">{tmpl.icon}</div>
                <div className="template-card-name">{tmpl.name}</div>
                <div className="template-card-desc">{tmpl.description}</div>
                <div className="template-card-tags">
                  {tmpl.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="template-tag"
                      style={{ background: `${colorInfo.accent}20`, color: colorInfo.accent }}
                    >{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {templates.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No templates in this category yet
          </div>
        )}
      </div>
    </div>
  );
}
