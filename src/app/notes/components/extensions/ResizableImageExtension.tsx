import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignL, AlignC, AlignR, LinkIcon, DeleteIcon } from '../MediaIcons';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setImage: (options: { src: string; alt?: string; width?: number | string; textAlign?: string }) => ReturnType;
  }
}

const ResizableImageComponent = (props: any) => {
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
      const newWidth = Math.max(50, e.clientX - rect.left);
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
    <NodeViewWrapper style={{ display: 'flex', width: '100%', justifyContent: flexAlign, margin: '1em 0' }}>
      <div 
        ref={containerRef}
        className={`media-container ${selected ? 'selected' : ''}`}
        style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: node.attrs.width || 'auto', 
          maxWidth: '100%',
        }}
      >
        {/* Floating Toolbar */}
        {selected && !isResizing && (
          <div className="floating-toolbar">
            <button className="toolbar-btn" onClick={() => setTextAlign('left')} title="Align Left"><AlignL /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('center')} title="Center"><AlignC /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('right')} title="Align Right"><AlignR /></button>

            <button className="toolbar-btn" onClick={deleteNode} title="Remove Image" style={{ color: 'var(--color-danger)' }}><DeleteIcon /></button>
          </div>
        )}

        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius-md)' }} 
        />

        {/* Resize Handle */}
        {(selected || isResizing) && (
          <div className="resize-handle" onMouseDown={onMouseDown} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: { default: 'auto' },
      textAlign: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string; width?: number | string; textAlign?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'resizableImage',
          attrs: options,
        });
      },
    } as any;
  },
});
