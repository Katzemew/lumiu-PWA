import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignL, AlignC, AlignR, LinkIcon, DeleteIcon } from '../MediaIcons';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setPdf: (options: { src: string; width?: string; textAlign?: string }) => ReturnType;
  }
}

const PdfComponent = (props: any) => {
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
      const newWidth = Math.max(300, e.clientX - rect.left);
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

  const alignment = node.attrs.textAlign || 'left';
  const flexAlign = alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center';

  return (
    <NodeViewWrapper style={{ display: 'flex', width: '100%', justifyContent: flexAlign, margin: '1.5em 0' }}>
      <div
        ref={containerRef}
        className={`media-container ${selected ? 'selected' : ''}`}
        style={{ width: node.attrs.width || '100%', maxWidth: '100%', height: '650px' }}
      >
        {/* Floating Toolbar */}
        {selected && !isResizing && (
          <div className="floating-toolbar">
            <button className="toolbar-btn" onClick={() => setTextAlign('left')} title="Align Left"><AlignL /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('center')} title="Center"><AlignC /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('right')} title="Align Right"><AlignR /></button>

            <button className="toolbar-btn" onClick={deleteNode} title="Remove PDF" style={{ color: 'var(--color-danger)' }}><DeleteIcon /></button>
          </div>
        )}

        <embed
          src={node.attrs.src}
          type="application/pdf"
          style={{ width: '100%', height: '100%', display: 'block', borderRadius: 'var(--radius-md)' }}
        />

        {/* Resize Handle */}
        {(selected || isResizing) && (
          <div className="resize-handle" onMouseDown={onMouseDown} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const PdfExtension = Node.create({
  name: 'pdf',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      textAlign: { default: 'left' },
    };
  },

  parseHTML() {
    return [
      { tag: 'embed[type="application/pdf"]' },
      { tag: 'iframe[src*=".pdf"]' },
      { tag: 'div[data-pdf-embed]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-pdf-embed': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfComponent);
  },

  addCommands() {
    return {
      setPdf: (options: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'pdf',
          attrs: options,
        });
      },
    } as any;
  },
});
