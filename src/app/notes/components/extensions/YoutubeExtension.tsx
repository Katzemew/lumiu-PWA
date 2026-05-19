import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignL, AlignC, AlignR, LinkIcon, DeleteIcon } from '../MediaIcons';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setYoutubeVideo: (options: { src: string; width?: number | string; textAlign?: string }) => ReturnType;
  }
}

const YoutubeComponent = (props: any) => {
  const { node, updateAttributes, selected, deleteNode } = props;
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = trimmed.match(regExp);
    const id = match ? match[1] : null;
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    return id
      ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${origin}` : ''}`
      : url;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(200, e.clientX - rect.left);
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
    <NodeViewWrapper style={{ display: 'flex', width: '100%', justifyContent: flexAlign, margin: '1.5em 0' }}>
      <div
        ref={containerRef}
        className={`media-container ${selected ? 'selected' : ''}`}
        style={{ width: node.attrs.width || '640px', maxWidth: '100%' }}
      >
        {/* Floating Toolbar */}
        {selected && !isResizing && (
          <div className="floating-toolbar">
            <button className="toolbar-btn" onClick={() => setTextAlign('left')} title="Align Left"><AlignL /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('center')} title="Center"><AlignC /></button>
            <button className="toolbar-btn" onClick={() => setTextAlign('right')} title="Align Right"><AlignR /></button>

            <button className="toolbar-btn" onClick={deleteNode} title="Remove Video" style={{ color: 'var(--color-danger)' }}><DeleteIcon /></button>
          </div>
        )}

        {/* Video Embed */}
        <div className="flex-video-wrapper">
          <iframe
            src={getEmbedUrl(node.attrs.src)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="YouTube video player"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Resize Handle */}
        {(selected || isResizing) && (
          <div className="resize-handle" onMouseDown={onMouseDown} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const YoutubeExtension = Node.create({
  name: 'youtubeVideo',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '640px' },
      textAlign: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube-video]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-youtube-video': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeComponent);
  },

  addCommands() {
    return {
      setYoutubeVideo: (options: { src: string; width?: number | string; textAlign?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'youtubeVideo',
          attrs: options,
        });
      },
    } as any;
  },

  addPasteRules() {
    return [
      {
        find: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|[^\s]+)/g,
        handler: ({ command, range, match }: any) => {
          if (match[0]) {
            command({
              type: this.name,
              attrs: { src: match[0] },
            });
          }
        },
      },
    ];
  },
});
