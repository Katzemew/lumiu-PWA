import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignL, AlignC, AlignR, DeleteIcon } from '../MediaIcons';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setAudio: (options: { src: string; width?: string; textAlign?: string }) => ReturnType;
  }
}

const AudioComponent = (props: any) => {
  const { node, updateAttributes, selected, deleteNode } = props;
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(250, e.clientX - rect.left); // Set min-width for usability
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, updateAttributes]);

  const setTextAlign = (align: string) => {
    updateAttributes({ textAlign: align });
  };

  const alignment = node.attrs.textAlign || 'center';
  const flexAlign = alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center';

  return (
    <NodeViewWrapper
      className="audio-node-view"
      style={{ display: 'flex', width: '100%', justifyContent: flexAlign, margin: '1.5rem 0' }}
    >
      <div
        ref={containerRef}
        className={`media-container ${selected ? 'selected' : ''}`}
        style={{ width: node.attrs.width || '100%', maxWidth: '100%' }}
      >
        {/* Floating Toolbar - Visible on Select */}
        {selected && !isResizing && (
          <div className="floating-toolbar">
            <button className="toolbar-btn" onClick={() => setTextAlign('left')} title="Align Left"><AlignL /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('center')} title="Center"><AlignC /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('right')} title="Align Right"><AlignR /></button>
            <div className="toolbar-divider" style={{ height: 16 }} />
            <button className="toolbar-btn" onClick={deleteNode} title="Remove Audio" style={{ color: 'var(--color-danger)' }}><DeleteIcon /></button>
          </div>
        )}

        {/* Audio Player Container */}
        <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 shadow-sm hover:border-zinc-500 transition-colors">
          <audio
            src={node.attrs.src}
            controls
            className="w-full h-10 block"
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Resize Handle */}
        {(selected || isResizing) && (
          <div className="resize-handle" onMouseDown={onMouseDown} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const AudioExtension = Node.create({
  name: 'audio',
  group: 'block',
  atom: true, // Prevents users from typing inside the audio block

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({ src: attributes.src })
      },
      width: {
        default: '100%',
        renderHTML: attributes => ({ style: `width: ${attributes.width}` })
      },
      textAlign: {
        default: 'center',
        renderHTML: attributes => ({ 'data-align': attributes.textAlign })
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio[src]',
      },
      {
        tag: 'div[data-audio-embed]',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Crucial: We must render the actual audio tag or a data-attribute div for persistence
    return ['div', mergeAttributes(HTMLAttributes, { 'data-audio-embed': '' }),
      ['audio', { src: HTMLAttributes.src }]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent);
  },

  addCommands() {
    return {
      setAudio: (options: any) => ({ commands }: any) => {
        if (!options.src) return false;
        return commands.insertContent({
          type: 'audio',
          attrs: options,
        });
      },
    } as any;
  },
});