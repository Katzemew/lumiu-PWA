"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent, TouchEvent } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tool =
    | "select"
    | "pen"
    | "eraser"
    | "text"
    | "rect"
    | "ellipse"
    | "arrow"
    | "sticky"
    | "image"
    | "line"
    | "highlighter"
    | "frame";

type StrokeStyle = "solid" | "dashed" | "dotted";

interface Point {
    x: number;
    y: number;
}

interface BaseElement {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    locked: boolean;
    zIndex: number;
}

interface DrawElement extends BaseElement {
    type: "draw" | "highlight";
    points: Point[];
    color: string;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
}

interface ShapeElement extends BaseElement {
    type: "rect" | "ellipse" | "frame";
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    cornerRadius?: number;
    label?: string;
}

interface TextElement extends BaseElement {
    type: "text";
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    align: "left" | "center" | "right";
    italic: boolean;
    underline: boolean;
}

interface StickyElement extends BaseElement {
    type: "sticky";
    content: string;
    bgColor: string;
    textColor: string;
    fontSize: number;
}

interface ArrowElement extends BaseElement {
    type: "arrow" | "line";
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    arrowStart: boolean;
    arrowEnd: boolean;
}

type WhiteboardElement =
    | DrawElement
    | ShapeElement
    | TextElement
    | StickyElement
    | ArrowElement;

interface HistoryState {
    elements: WhiteboardElement[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STICKY_COLORS = [
    { bg: "#FFF176", text: "#333" },
    { bg: "#F48FB1", text: "#333" },
    { bg: "#80DEEA", text: "#333" },
    { bg: "#A5D6A7", text: "#333" },
    { bg: "#CE93D8", text: "#333" },
    { bg: "#FFCC80", text: "#333" },
];

const PALETTE = [
    "#1a1a2e", "#e94560", "#0f3460", "#533483",
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
    "#ffffff", "#c0c0c0", "#888888", "#333333",
];

const FONTS = ["Lexend", "Caveat", "Space Mono", "Playfair Display", "Nunito"];

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LumIUWhiteboard() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [tool, setTool] = useState<Tool>("select");
    const [elements, setElements] = useState<WhiteboardElement[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [color, setColor] = useState("#4d96ff");
    const [fillColor, setFillColor] = useState("transparent");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
    const [fontSize, setFontSize] = useState(18);
    const [fontFamily, setFontFamily] = useState("Lexend");
    const [opacity, setOpacity] = useState(100);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<Point | null>(null);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryState[]>([{ elements: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [rightPanel, setRightPanel] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
    const [showMinimap, setShowMinimap] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ─── Theme tokens ────────────────────────────────────────────────────────
    const t = theme === "dark"
        ? {
            bg: "#0d0d1a",
            surface: "#141428",
            surfaceHover: "#1e1e3a",
            border: "#2a2a4a",
            text: "#e8e8ff",
            textMuted: "#7070a0",
            accent: "#7c5cfc",
            accentGlow: "rgba(124,92,252,0.3)",
            toolbar: "#0f0f22",
            panel: "#111126",
            gridColor: "rgba(255,255,255,0.04)",
            shadow: "0 8px 32px rgba(0,0,0,0.6)",
            selectedRing: "#7c5cfc",
            canvasBg: "#080815",
        }
        : {
            bg: "#f0f0fa",
            surface: "#ffffff",
            surfaceHover: "#f5f5ff",
            border: "#dcdcf0",
            text: "#1a1a3e",
            textMuted: "#8080aa",
            accent: "#5b3fdb",
            accentGlow: "rgba(91,63,219,0.15)",
            toolbar: "#ffffff",
            panel: "#fafaff",
            gridColor: "rgba(0,0,0,0.05)",
            shadow: "0 4px 24px rgba(0,0,0,0.1)",
            selectedRing: "#5b3fdb",
            canvasBg: "#e8e8f8",
        };

    // ─── History management ───────────────────────────────────────────────────
    const pushHistory = useCallback(
        (newElements: WhiteboardElement[]) => {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push({ elements: newElements });
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex]
    );

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements(history[historyIndex - 1].elements);
            setSelectedIds([]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements(history[historyIndex + 1].elements);
        }
    }, [history, historyIndex]);

    // ─── Coordinate helpers ───────────────────────────────────────────────────
    const screenToCanvas = useCallback(
        (sx: number, sy: number): Point => ({
            x: (sx - pan.x) / zoom,
            y: (sy - pan.y) / zoom,
        }),
        [pan, zoom]
    );

    const snap = (v: number) => (snapToGrid ? Math.round(v / 20) * 20 : v);

    // ─── Mouse handlers ───────────────────────────────────────────────────────
    const handleMouseDown = (e: MouseEvent<SVGSVGElement>) => {
        if (e.button === 1 || (e.button === 0 && tool === "select" && e.altKey)) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }
        if (e.button !== 0) return;

        const pt = screenToCanvas(e.clientX, e.clientY);
        const x = snap(pt.x);
        const y = snap(pt.y);

        if (tool === "pen" || tool === "highlighter") {
            setIsDrawing(true);
            setCurrentPath([{ x, y }]);
            return;
        }

        if (
            tool === "rect" ||
            tool === "ellipse" ||
            tool === "arrow" ||
            tool === "line" ||
            tool === "frame"
        ) {
            setIsDrawing(true);
            setDrawStart({ x, y });
            return;
        }

        if (tool === "text") {
            const el: TextElement = {
                id: uid(),
                type: "text",
                x,
                y,
                width: 200,
                height: 40,
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
                content: "Click to edit",
                fontSize,
                fontFamily,
                fontWeight: "400",
                color,
                align: "left",
                italic: false,
                underline: false,
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
            setEditingId(el.id);
            setTool("select");
            return;
        }

        if (tool === "sticky") {
            const sc = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
            const el: StickyElement = {
                id: uid(),
                type: "sticky",
                x,
                y,
                width: 200,
                height: 160,
                rotation: -1 + Math.random() * 2,
                opacity: 1,
                locked: false,
                zIndex: elements.length,
                content: "💡 New idea",
                bgColor: sc.bg,
                textColor: sc.text,
                fontSize: 14,
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
            setTool("select");
            return;
        }

        if (tool === "select") {
            // Check if clicking on empty space
            const clickedEl = getElementAtPoint(pt);
            if (!clickedEl) {
                setSelectedIds([]);
            }
        }
    };

    const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            return;
        }
        if (!isDrawing) return;

        const pt = screenToCanvas(e.clientX, e.clientY);
        const x = snap(pt.x);
        const y = snap(pt.y);

        if (tool === "pen" || tool === "highlighter") {
            setCurrentPath((prev) => [...prev, { x, y }]);
        }
        if (
            drawStart &&
            (tool === "rect" ||
                tool === "ellipse" ||
                tool === "arrow" ||
                tool === "line" ||
                tool === "frame")
        ) {
            // Update ghost element (handled in render via drawStart state)
            setCurrentPath([drawStart, { x, y }]);
        }
    };

    const handleMouseUp = (e: MouseEvent<SVGSVGElement>) => {
        setIsPanning(false);
        if (!isDrawing) return;
        setIsDrawing(false);

        const pt = screenToCanvas(e.clientX, e.clientY);
        const x = snap(pt.x);
        const y = snap(pt.y);

        if ((tool === "pen" || tool === "highlighter") && currentPath.length > 1) {
            const el: DrawElement = {
                id: uid(),
                type: tool === "highlighter" ? "highlight" : "draw",
                points: currentPath,
                color: tool === "highlighter" ? color + "66" : color,
                strokeWidth: tool === "highlighter" ? strokeWidth * 6 : strokeWidth,
                strokeStyle,
                x: Math.min(...currentPath.map((p) => p.x)),
                y: Math.min(...currentPath.map((p) => p.y)),
                width: 1,
                height: 1,
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
        }

        if (drawStart && tool === "rect") {
            const el: ShapeElement = {
                id: uid(),
                type: "rect",
                x: Math.min(drawStart.x, x),
                y: Math.min(drawStart.y, y),
                width: Math.abs(x - drawStart.x) || 100,
                height: Math.abs(y - drawStart.y) || 80,
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
                fill: fillColor,
                stroke: color,
                strokeWidth,
                strokeStyle,
                cornerRadius: 4,
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
        }

        if (drawStart && tool === "ellipse") {
            const el: ShapeElement = {
                id: uid(),
                type: "ellipse",
                x: Math.min(drawStart.x, x),
                y: Math.min(drawStart.y, y),
                width: Math.abs(x - drawStart.x) || 100,
                height: Math.abs(y - drawStart.y) || 80,
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
                fill: fillColor,
                stroke: color,
                strokeWidth,
                strokeStyle,
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
        }

        if (drawStart && (tool === "arrow" || tool === "line")) {
            const el: ArrowElement = {
                id: uid(),
                type: tool,
                x: drawStart.x,
                y: drawStart.y,
                x2: x,
                y2: y,
                width: Math.abs(x - drawStart.x),
                height: Math.abs(y - drawStart.y),
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
                color,
                strokeWidth,
                strokeStyle,
                arrowStart: false,
                arrowEnd: tool === "arrow",
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
        }

        if (drawStart && tool === "frame") {
            const el: ShapeElement = {
                id: uid(),
                type: "frame",
                x: Math.min(drawStart.x, x),
                y: Math.min(drawStart.y, y),
                width: Math.abs(x - drawStart.x) || 300,
                height: Math.abs(y - drawStart.y) || 200,
                rotation: 0,
                opacity: opacity / 100,
                locked: false,
                zIndex: elements.length,
                fill: "transparent",
                stroke: t.accent,
                strokeWidth: 2,
                strokeStyle: "dashed",
                label: "Frame",
            };
            const next = [...elements, el];
            setElements(next);
            pushHistory(next);
        }

        setCurrentPath([]);
        setDrawStart(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            const delta = -e.deltaY * 0.001;
            const newZoom = Math.min(Math.max(zoom + delta * zoom, 0.1), 5);
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                setPan({
                    x: mx - (mx - pan.x) * (newZoom / zoom),
                    y: my - (my - pan.y) * (newZoom / zoom),
                });
            }
            setZoom(newZoom);
        } else {
            setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
        }
    };

    // ─── Element helpers ──────────────────────────────────────────────────────
    const getElementAtPoint = (pt: Point): WhiteboardElement | null => {
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            if (pt.x >= el.x && pt.x <= el.x + el.width && pt.y >= el.y && pt.y <= el.y + el.height) {
                return el;
            }
        }
        return null;
    };

    const deleteSelected = () => {
        const next = elements.filter((el) => !selectedIds.includes(el.id));
        setElements(next);
        pushHistory(next);
        setSelectedIds([]);
    };

    const duplicateSelected = () => {
        const newEls = elements
            .filter((el) => selectedIds.includes(el.id))
            .map((el) => ({ ...el, id: uid(), x: el.x + 20, y: el.y + 20, zIndex: elements.length + 1 }));
        const next = [...elements, ...newEls];
        setElements(next);
        pushHistory(next);
        setSelectedIds(newEls.map((el) => el.id));
    };

    // ─── Keyboard shortcuts ───────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (editingId) return;
            if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.shiftKey ? redo() : undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); duplicateSelected(); }
            if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
            if (e.key === "v") setTool("select");
            if (e.key === "p") setTool("pen");
            if (e.key === "t") setTool("text");
            if (e.key === "r") setTool("rect");
            if (e.key === "o") setTool("ellipse");
            if (e.key === "a") setTool("arrow");
            if (e.key === "s") setTool("sticky");
            if (e.key === "e") setTool("eraser");
            if (e.key === "f") setTool("frame");
            if (e.key === "Escape") { setSelectedIds([]); setTool("select"); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [editingId, selectedIds, undo, redo, duplicateSelected, deleteSelected]);

    // ─── Render path ─────────────────────────────────────────────────────────
    const pathFromPoints = (pts: Point[]) => {
        if (pts.length < 2) return "";
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpx = (prev.x + curr.x) / 2;
            const cpy = (prev.y + curr.y) / 2;
            d += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
        }
        return d;
    };

    const strokeDash = (style: StrokeStyle, width: number) => {
        if (style === "dashed") return `${width * 4},${width * 2}`;
        if (style === "dotted") return `${width},${width * 2}`;
        return "none";
    };

    // ─── Selected element props update ───────────────────────────────────────
    const updateSelected = (patch: Partial<WhiteboardElement>) => {
        const next = elements.map((el) =>
            selectedIds.includes(el.id) ? { ...el, ...patch } as WhiteboardElement : el
        );
        setElements(next);
        pushHistory(next);
    };

    const selectedEl = elements.find((el) => selectedIds[0] === el.id);

    // ─── Render ───────────────────────────────────────────────────────────────
    const toolList: { id: Tool; icon: string; label: string; key: string }[] = [
        { id: "select", icon: "⬡", label: "Select", key: "V" },
        { id: "pen", icon: "✏️", label: "Pen", key: "P" },
        { id: "highlighter", icon: "🖊️", label: "Highlight", key: "H" },
        { id: "eraser", icon: "⬜", label: "Eraser", key: "E" },
        { id: "text", icon: "T", label: "Text", key: "T" },
        { id: "sticky", icon: "📝", label: "Sticky", key: "S" },
        { id: "rect", icon: "▭", label: "Rectangle", key: "R" },
        { id: "ellipse", icon: "◯", label: "Ellipse", key: "O" },
        { id: "arrow", icon: "↗", label: "Arrow", key: "A" },
        { id: "line", icon: "╱", label: "Line", key: "L" },
        { id: "frame", icon: "⬚", label: "Frame", key: "F" },
    ];

    const css = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=Caveat:wght@400;600&family=Space+Mono&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { overflow: hidden; font-family: 'Lexend', sans-serif; }

    .lumiu-root {
      --bg: ${t.bg};
      --surface: ${t.surface};
      --surface-hover: ${t.surfaceHover};
      --border: ${t.border};
      --text: ${t.text};
      --text-muted: ${t.textMuted};
      --accent: ${t.accent};
      --accent-glow: ${t.accentGlow};
      --toolbar: ${t.toolbar};
      --panel: ${t.panel};
      --grid: ${t.gridColor};
      --shadow: ${t.shadow};
      --ring: ${t.selectedRing};
      --canvas-bg: ${t.canvasBg};
      background: var(--bg);
      color: var(--text);
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background 0.3s, color 0.3s;
    }

    /* ── Top Bar ── */
    .topbar {
      height: 52px;
      background: var(--toolbar);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      z-index: 100;
      flex-shrink: 0;
      box-shadow: var(--shadow);
    }

    .logo {
      font-family: 'Lexend', sans-serif;
      font-weight: 600;
      font-size: 17px;
      letter-spacing: -0.5px;
      color: var(--accent);
      margin-right: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .logo-dot { 
      width: 8px; height: 8px; 
      border-radius: 50%; 
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }

    .topbar-sep { width: 1px; height: 28px; background: var(--border); margin: 0 4px; }

    .icon-btn {
      width: 32px; height: 32px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.15s;
    }
    .icon-btn:hover { background: var(--surface-hover); color: var(--text); }
    .icon-btn.active { background: var(--accent-glow); color: var(--accent); }
    .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .zoom-display {
      font-size: 12px;
      color: var(--text-muted);
      min-width: 44px;
      text-align: center;
      font-family: 'Space Mono', monospace;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
    }
    .zoom-display:hover { background: var(--surface-hover); color: var(--text); }

    .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    .theme-toggle:hover { border-color: var(--accent); color: var(--text); }
    .theme-toggle-pill {
      width: 28px; height: 16px;
      background: ${theme === "dark" ? "var(--accent)" : "var(--border)"};
      border-radius: 8px;
      position: relative;
      transition: background 0.2s;
    }
    .theme-toggle-pill::after {
      content: '';
      position: absolute;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: white;
      top: 2px;
      left: ${theme === "dark" ? "14px" : "2px"};
      transition: left 0.2s;
    }

    /* ── Main Layout ── */
    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Left Toolbar ── */
    .toolbar {
      width: 56px;
      background: var(--toolbar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      gap: 2px;
      z-index: 10;
      flex-shrink: 0;
    }

    .tool-btn {
      width: 40px; height: 40px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.15s;
      position: relative;
      gap: 1px;
    }
    .tool-btn:hover { background: var(--surface-hover); color: var(--text); }
    .tool-btn.active {
      background: var(--accent-glow);
      color: var(--accent);
    }
    .tool-btn.active::before {
      content: '';
      position: absolute;
      left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 20px;
      background: var(--accent);
      border-radius: 0 3px 3px 0;
    }
    .tool-key {
      font-size: 8px;
      font-family: 'Space Mono', monospace;
      opacity: 0.5;
      line-height: 1;
    }
    .tool-sep { width: 28px; height: 1px; background: var(--border); margin: 4px 0; }

    /* ── Canvas ── */
    .canvas-area {
      flex: 1;
      overflow: hidden;
      position: relative;
      background: var(--canvas-bg);
    }

    .canvas-grid {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 1;
    }

    .canvas-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* ── Right Panel ── */
    .right-panel {
      width: 240px;
      background: var(--panel);
      border-left: 1px solid var(--border);
      overflow-y: auto;
      flex-shrink: 0;
      padding: 0;
    }

    .panel-section {
      border-bottom: 1px solid var(--border);
      padding: 12px;
    }

    .panel-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .panel-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .panel-label {
      font-size: 11px;
      color: var(--text-muted);
      min-width: 52px;
    }

    .panel-input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 12px;
      padding: 5px 8px;
      outline: none;
      font-family: 'Lexend', sans-serif;
      transition: border-color 0.15s;
    }
    .panel-input:focus { border-color: var(--accent); }

    .panel-input[type="range"] {
      -webkit-appearance: none;
      height: 4px;
      border-radius: 2px;
      background: var(--border);
      padding: 0;
      cursor: pointer;
    }
    .panel-input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    }

    .color-swatch {
      width: 28px; height: 28px;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 0.1s, border-color 0.1s;
    }
    .color-swatch:hover { transform: scale(1.1); }
    .color-swatch.selected { border-color: var(--ring); box-shadow: 0 0 0 2px var(--accent-glow); }

    .stroke-styles {
      display: flex;
      gap: 4px;
    }
    .stroke-btn {
      flex: 1;
      height: 28px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .stroke-btn:hover, .stroke-btn.active { 
      background: var(--accent-glow); 
      border-color: var(--accent); 
      color: var(--accent);
    }

    .select-input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 11px;
      padding: 5px 6px;
      outline: none;
      cursor: pointer;
    }
    .select-input:focus { border-color: var(--accent); }

    /* ── Selection handles ── */
    .sel-handle {
      fill: white;
      stroke: var(--ring);
      stroke-width: 1.5;
      cursor: nwse-resize;
    }

    /* ── Minimap ── */
    .minimap {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 160px;
      height: 100px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: var(--shadow);
      z-index: 50;
    }
    .minimap-label {
      position: absolute;
      top: 4px; left: 6px;
      font-size: 8px;
      color: var(--text-muted);
      font-family: 'Space Mono', monospace;
      pointer-events: none;
    }

    /* ── Zoom Controls ── */
    .zoom-controls {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 4px 8px;
      box-shadow: var(--shadow);
      z-index: 50;
    }
    .zoom-btn {
      width: 24px; height: 24px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.1s;
    }
    .zoom-btn:hover { background: var(--surface-hover); }
    .zoom-pct {
      font-size: 11px;
      min-width: 38px;
      text-align: center;
      color: var(--text-muted);
      font-family: 'Space Mono', monospace;
      cursor: pointer;
    }

    /* ── Status bar ── */
    .statusbar {
      height: 24px;
      background: var(--toolbar);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 16px;
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'Space Mono', monospace;
      flex-shrink: 0;
    }

    /* ── Floating text editor ── */
    .floating-textarea {
      position: absolute;
      background: transparent;
      border: 2px dashed var(--accent);
      border-radius: 4px;
      resize: none;
      outline: none;
      color: var(--text);
      font-family: 'Lexend', sans-serif;
      padding: 4px 6px;
      z-index: 200;
      min-width: 100px;
      min-height: 32px;
    }

    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="lumiu-root">
                {/* ── Top Bar ── */}
                <div className="topbar">
                    <div className="logo">
                        <div className="logo-dot" />
                        lumiu
                    </div>
                    <div className="topbar-sep" />

                    {/* File ops */}
                    <button className="icon-btn" title="New board">
                        📄
                    </button>
                    <button className="icon-btn" title="Save (⌘S)">
                        💾
                    </button>
                    <button className="icon-btn" title="Export">
                        📤
                    </button>

                    <div className="topbar-sep" />

                    {/* Undo/Redo */}
                    <button
                        className="icon-btn"
                        onClick={undo}
                        disabled={historyIndex === 0}
                        title="Undo ⌘Z"
                    >
                        ↩
                    </button>
                    <button
                        className="icon-btn"
                        onClick={redo}
                        disabled={historyIndex === history.length - 1}
                        title="Redo ⌘⇧Z"
                    >
                        ↪
                    </button>

                    <div className="topbar-sep" />

                    {/* Grid & Snap */}
                    <button
                        className={`icon-btn ${showGrid ? "active" : ""}`}
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle grid"
                    >
                        ⊞
                    </button>
                    <button
                        className={`icon-btn ${snapToGrid ? "active" : ""}`}
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        title="Snap to grid"
                    >
                        🧲
                    </button>
                    <button
                        className={`icon-btn ${showMinimap ? "active" : ""}`}
                        onClick={() => setShowMinimap(!showMinimap)}
                        title="Minimap"
                    >
                        🗺
                    </button>
                    <button
                        className={`icon-btn ${rightPanel ? "active" : ""}`}
                        onClick={() => setRightPanel(!rightPanel)}
                        title="Properties panel"
                    >
                        ▣
                    </button>

                    <div className="topbar-right">
                        <span style={{ fontSize: 11, color: t.textMuted }}>
                            {elements.length} objects
                        </span>
                        <button
                            className="theme-toggle"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? "🌙" : "☀️"}
                            <div className="theme-toggle-pill" />
                            {theme === "dark" ? "Dark" : "Light"}
                        </button>
                        <button
                            className="icon-btn"
                            style={{
                                background: t.accent,
                                color: "white",
                                width: "auto",
                                padding: "0 12px",
                                borderRadius: 8,
                            }}
                        >
                            Share ↗
                        </button>
                    </div>
                </div>

                {/* ── Main Area ── */}
                <div className="main">
                    {/* ── Left Toolbar ── */}
                    <div className="toolbar">
                        {toolList.slice(0, 4).map((t_) => (
                            <button
                                key={t_.id}
                                className={`tool-btn ${tool === t_.id ? "active" : ""}`}
                                onClick={() => setTool(t_.id)}
                                title={`${t_.label} (${t_.key})`}
                            >
                                <span>{t_.icon}</span>
                                <span className="tool-key">{t_.key}</span>
                            </button>
                        ))}
                        <div className="tool-sep" />
                        {toolList.slice(4, 7).map((t_) => (
                            <button
                                key={t_.id}
                                className={`tool-btn ${tool === t_.id ? "active" : ""}`}
                                onClick={() => setTool(t_.id)}
                                title={`${t_.label} (${t_.key})`}
                            >
                                <span style={{ fontWeight: t_.id === "text" ? 700 : 400 }}>{t_.icon}</span>
                                <span className="tool-key">{t_.key}</span>
                            </button>
                        ))}
                        <div className="tool-sep" />
                        {toolList.slice(7).map((t_) => (
                            <button
                                key={t_.id}
                                className={`tool-btn ${tool === t_.id ? "active" : ""}`}
                                onClick={() => setTool(t_.id)}
                                title={`${t_.label} (${t_.key})`}
                            >
                                <span>{t_.icon}</span>
                                <span className="tool-key">{t_.key}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Canvas ── */}
                    <div
                        className="canvas-area"
                        ref={canvasRef}
                        onWheel={handleWheel}
                        style={{ cursor: isPanning ? "grabbing" : tool === "select" ? "default" : tool === "text" ? "text" : "crosshair" }}
                    >
                        {/* Grid */}
                        {showGrid && (
                            <svg
                                className="canvas-grid"
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                            >
                                <defs>
                                    <pattern
                                        id="grid"
                                        width={20 * zoom}
                                        height={20 * zoom}
                                        x={pan.x % (20 * zoom)}
                                        y={pan.y % (20 * zoom)}
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <circle cx={0} cy={0} r={0.8} fill={t.gridColor} />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        )}

                        {/* Main SVG */}
                        <svg
                            ref={svgRef}
                            className="canvas-svg"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                                {/* Render elements */}
                                {[...elements]
                                    .sort((a, b) => a.zIndex - b.zIndex)
                                    .map((el) => {
                                        const isSelected = selectedIds.includes(el.id);
                                        const onElClick = (e: MouseEvent) => {
                                            e.stopPropagation();
                                            if (tool === "select") {
                                                setSelectedIds(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                                            }
                                            if (tool === "eraser") {
                                                const next = elements.filter((e2) => e2.id !== el.id);
                                                setElements(next);
                                                pushHistory(next);
                                            }
                                        };

                                        if (el.type === "draw" || el.type === "highlight") {
                                            return (
                                                <g key={el.id} opacity={el.opacity} onClick={onElClick}>
                                                    <path
                                                        d={pathFromPoints(el.points)}
                                                        fill="none"
                                                        stroke={el.color}
                                                        strokeWidth={el.strokeWidth}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeDasharray={strokeDash(el.strokeStyle, el.strokeWidth)}
                                                        style={{ cursor: tool === "select" ? "move" : "default" }}
                                                    />
                                                    {isSelected && (
                                                        <path
                                                            d={pathFromPoints(el.points)}
                                                            fill="none"
                                                            stroke={t.selectedRing}
                                                            strokeWidth={el.strokeWidth + 4}
                                                            strokeLinecap="round"
                                                            opacity={0.3}
                                                        />
                                                    )}
                                                </g>
                                            );
                                        }

                                        if (el.type === "rect" || el.type === "frame") {
                                            const shape = el as ShapeElement;
                                            return (
                                                <g
                                                    key={el.id}
                                                    opacity={el.opacity}
                                                    onClick={onElClick}
                                                    transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                                                    style={{ cursor: tool === "select" ? "move" : "default" }}
                                                >
                                                    <rect
                                                        x={el.x} y={el.y}
                                                        width={el.width} height={el.height}
                                                        rx={shape.cornerRadius || 0}
                                                        fill={shape.fill}
                                                        stroke={shape.stroke}
                                                        strokeWidth={shape.strokeWidth}
                                                        strokeDasharray={strokeDash(shape.strokeStyle, shape.strokeWidth)}
                                                    />
                                                    {el.type === "frame" && shape.label && (
                                                        <text
                                                            x={el.x + 6}
                                                            y={el.y - 5}
                                                            fill={shape.stroke}
                                                            fontSize={10}
                                                            fontFamily="Lexend"
                                                        >
                                                            {shape.label}
                                                        </text>
                                                    )}
                                                    {isSelected && (
                                                        <>
                                                            <rect
                                                                x={el.x - 3} y={el.y - 3}
                                                                width={el.width + 6} height={el.height + 6}
                                                                rx={(shape.cornerRadius || 0) + 3}
                                                                fill="none"
                                                                stroke={t.selectedRing}
                                                                strokeWidth={1.5}
                                                                strokeDasharray="4,2"
                                                            />
                                                            {[[el.x, el.y], [el.x + el.width, el.y], [el.x, el.y + el.height], [el.x + el.width, el.y + el.height]].map(([cx, cy], i) => (
                                                                <circle key={i} cx={cx} cy={cy} r={4} className="sel-handle" />
                                                            ))}
                                                        </>
                                                    )}
                                                </g>
                                            );
                                        }

                                        if (el.type === "ellipse") {
                                            const shape = el as ShapeElement;
                                            return (
                                                <g key={el.id} opacity={el.opacity} onClick={onElClick}
                                                    transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                                                    style={{ cursor: tool === "select" ? "move" : "default" }}
                                                >
                                                    <ellipse
                                                        cx={el.x + el.width / 2} cy={el.y + el.height / 2}
                                                        rx={el.width / 2} ry={el.height / 2}
                                                        fill={shape.fill}
                                                        stroke={shape.stroke}
                                                        strokeWidth={shape.strokeWidth}
                                                        strokeDasharray={strokeDash(shape.strokeStyle, shape.strokeWidth)}
                                                    />
                                                    {isSelected && (
                                                        <ellipse
                                                            cx={el.x + el.width / 2} cy={el.y + el.height / 2}
                                                            rx={el.width / 2 + 4} ry={el.height / 2 + 4}
                                                            fill="none" stroke={t.selectedRing}
                                                            strokeWidth={1.5} strokeDasharray="4,2"
                                                        />
                                                    )}
                                                </g>
                                            );
                                        }

                                        if (el.type === "text") {
                                            const txt = el as TextElement;
                                            return (
                                                <g key={el.id} opacity={el.opacity} onClick={onElClick}
                                                    style={{ cursor: tool === "select" ? "move" : "default" }}
                                                    onDoubleClick={() => setEditingId(el.id)}
                                                >
                                                    <foreignObject x={el.x} y={el.y} width={el.width + 40} height={el.height + 20}>
                                                        <div
                                                            style={{
                                                                fontFamily: txt.fontFamily,
                                                                fontSize: txt.fontSize,
                                                                fontWeight: txt.fontWeight,
                                                                color: txt.color,
                                                                fontStyle: txt.italic ? "italic" : "normal",
                                                                textDecoration: txt.underline ? "underline" : "none",
                                                                textAlign: txt.align,
                                                                whiteSpace: "pre-wrap",
                                                                userSelect: "none",
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {txt.content}
                                                        </div>
                                                    </foreignObject>
                                                    {isSelected && (
                                                        <rect
                                                            x={el.x - 3} y={el.y - 3}
                                                            width={el.width + 46} height={el.height + 26}
                                                            fill="none" stroke={t.selectedRing}
                                                            strokeWidth={1.5} strokeDasharray="4,2" rx={4}
                                                        />
                                                    )}
                                                </g>
                                            );
                                        }

                                        if (el.type === "sticky") {
                                            const sticky = el as StickyElement;
                                            return (
                                                <g key={el.id} opacity={el.opacity} onClick={onElClick}
                                                    transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                                                    style={{ cursor: tool === "select" ? "move" : "default" }}
                                                    onDoubleClick={() => setEditingId(el.id)}
                                                >
                                                    <filter id={`shadow-${el.id}`}>
                                                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.2" />
                                                    </filter>
                                                    <rect
                                                        x={el.x} y={el.y}
                                                        width={el.width} height={el.height}
                                                        rx={6}
                                                        fill={sticky.bgColor}
                                                        filter={`url(#shadow-${el.id})`}
                                                    />
                                                    <rect x={el.x} y={el.y} width={el.width} height={6} rx={3} fill="rgba(0,0,0,0.08)" />
                                                    <foreignObject x={el.x + 8} y={el.y + 12} width={el.width - 16} height={el.height - 20}>
                                                        <div
                                                            style={{
                                                                fontFamily: "Caveat, cursive",
                                                                fontSize: sticky.fontSize + 2,
                                                                color: sticky.textColor,
                                                                whiteSpace: "pre-wrap",
                                                                wordBreak: "break-word",
                                                                userSelect: "none",
                                                                lineHeight: 1.5,
                                                            }}
                                                        >
                                                            {sticky.content}
                                                        </div>
                                                    </foreignObject>
                                                    {isSelected && (
                                                        <rect
                                                            x={el.x - 3} y={el.y - 3}
                                                            width={el.width + 6} height={el.height + 6}
                                                            rx={9} fill="none" stroke={t.selectedRing}
                                                            strokeWidth={1.5} strokeDasharray="4,2"
                                                        />
                                                    )}
                                                </g>
                                            );
                                        }

                                        if (el.type === "arrow" || el.type === "line") {
                                            const arr = el as ArrowElement;
                                            const dx = arr.x2 - arr.x;
                                            const dy = arr.y2 - arr.y;
                                            const len = Math.sqrt(dx * dx + dy * dy);
                                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                                            const aw = 10;
                                            return (
                                                <g key={el.id} opacity={el.opacity} onClick={onElClick}
                                                    style={{ cursor: tool === "select" ? "move" : "default" }}
                                                >
                                                    <defs>
                                                        <marker id={`arrow-${el.id}`} markerWidth={aw} markerHeight={aw} refX={aw - 1} refY={aw / 2} orient="auto">
                                                            <polygon points={`0 0, ${aw} ${aw / 2}, 0 ${aw}`} fill={arr.color} />
                                                        </marker>
                                                    </defs>
                                                    <line
                                                        x1={arr.x} y1={arr.y} x2={arr.x2} y2={arr.y2}
                                                        stroke={arr.color}
                                                        strokeWidth={arr.strokeWidth}
                                                        strokeDasharray={strokeDash(arr.strokeStyle, arr.strokeWidth)}
                                                        strokeLinecap="round"
                                                        markerEnd={arr.arrowEnd ? `url(#arrow-${el.id})` : undefined}
                                                    />
                                                    {isSelected && (
                                                        <>
                                                            <circle cx={arr.x} cy={arr.y} r={5} className="sel-handle" />
                                                            <circle cx={arr.x2} cy={arr.y2} r={5} className="sel-handle" />
                                                        </>
                                                    )}
                                                </g>
                                            );
                                        }

                                        return null;
                                    })}

                                {/* Live draw preview */}
                                {isDrawing && currentPath.length > 1 && (tool === "pen" || tool === "highlighter") && (
                                    <path
                                        d={pathFromPoints(currentPath)}
                                        fill="none"
                                        stroke={tool === "highlighter" ? color + "66" : color}
                                        strokeWidth={tool === "highlighter" ? strokeWidth * 6 : strokeWidth}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray={strokeDash(strokeStyle, strokeWidth)}
                                        opacity={opacity / 100}
                                    />
                                )}

                                {/* Shape ghost */}
                                {isDrawing && drawStart && currentPath.length > 1 && (
                                    <>
                                        {tool === "rect" && (
                                            <rect
                                                x={Math.min(drawStart.x, currentPath[1].x)}
                                                y={Math.min(drawStart.y, currentPath[1].y)}
                                                width={Math.abs(currentPath[1].x - drawStart.x)}
                                                height={Math.abs(currentPath[1].y - drawStart.y)}
                                                fill={fillColor} stroke={color} strokeWidth={strokeWidth}
                                                strokeDasharray={strokeDash(strokeStyle, strokeWidth)}
                                                rx={4} opacity={opacity / 100}
                                            />
                                        )}
                                        {tool === "ellipse" && (
                                            <ellipse
                                                cx={(drawStart.x + currentPath[1].x) / 2}
                                                cy={(drawStart.y + currentPath[1].y) / 2}
                                                rx={Math.abs(currentPath[1].x - drawStart.x) / 2}
                                                ry={Math.abs(currentPath[1].y - drawStart.y) / 2}
                                                fill={fillColor} stroke={color} strokeWidth={strokeWidth}
                                                strokeDasharray={strokeDash(strokeStyle, strokeWidth)}
                                                opacity={opacity / 100}
                                            />
                                        )}
                                        {(tool === "arrow" || tool === "line") && (
                                            <line
                                                x1={drawStart.x} y1={drawStart.y}
                                                x2={currentPath[1].x} y2={currentPath[1].y}
                                                stroke={color} strokeWidth={strokeWidth}
                                                strokeDasharray={strokeDash(strokeStyle, strokeWidth)}
                                                strokeLinecap="round" opacity={opacity / 100}
                                            />
                                        )}
                                        {tool === "frame" && (
                                            <rect
                                                x={Math.min(drawStart.x, currentPath[1].x)}
                                                y={Math.min(drawStart.y, currentPath[1].y)}
                                                width={Math.abs(currentPath[1].x - drawStart.x)}
                                                height={Math.abs(currentPath[1].y - drawStart.y)}
                                                fill="transparent" stroke={t.accent} strokeWidth={2}
                                                strokeDasharray="6,3" opacity={0.7}
                                            />
                                        )}
                                    </>
                                )}
                            </g>
                        </svg>

                        {/* Floating text editor */}
                        {editingId && (() => {
                            const el = elements.find((e) => e.id === editingId);
                            if (!el) return null;
                            const screenX = el.x * zoom + pan.x;
                            const screenY = el.y * zoom + pan.y;
                            const isSticky = el.type === "sticky";
                            const isTxt = el.type === "text";
                            return (
                                <textarea
                                    ref={textareaRef}
                                    className="floating-textarea"
                                    style={{
                                        left: screenX,
                                        top: screenY,
                                        width: (el.width + (isTxt ? 40 : 0)) * zoom,
                                        minHeight: el.height * zoom,
                                        fontSize: (isSticky ? (el as StickyElement).fontSize : (el as TextElement).fontSize) * zoom,
                                        fontFamily: isSticky ? "Caveat" : (el as TextElement).fontFamily,
                                        color: isSticky ? (el as StickyElement).textColor : (el as TextElement).color,
                                        background: isSticky ? (el as StickyElement).bgColor : "transparent",
                                        borderRadius: isSticky ? 6 : 4,
                                        padding: isSticky ? "12px 8px 8px" : "4px 6px",
                                    }}
                                    defaultValue={isSticky ? (el as StickyElement).content : (el as TextElement).content}
                                    autoFocus
                                    onChange={(e) => {
                                        const next = elements.map((el2) => {
                                            if (el2.id !== editingId) return el2;
                                            if (isSticky) return { ...el2, content: e.target.value } as StickyElement;
                                            return { ...el2, content: e.target.value } as TextElement;
                                        });
                                        setElements(next);
                                    }}
                                    onBlur={() => {
                                        pushHistory(elements);
                                        setEditingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") { pushHistory(elements); setEditingId(null); }
                                    }}
                                />
                            );
                        })()}

                        {/* Minimap */}
                        {showMinimap && (
                            <div className="minimap">
                                <span className="minimap-label">OVERVIEW</span>
                                <svg width="100%" height="100%" viewBox="-500 -300 1000 600">
                                    {elements.map((el) => (
                                        <rect
                                            key={el.id}
                                            x={el.x / 8} y={el.y / 8}
                                            width={Math.max(el.width / 8, 4)}
                                            height={Math.max(el.height / 8, 4)}
                                            fill={t.accent}
                                            opacity={0.5}
                                            rx={1}
                                        />
                                    ))}
                                    <rect
                                        x={-pan.x / zoom / 8}
                                        y={-pan.y / zoom / 8}
                                        width={window.innerWidth / zoom / 8}
                                        height={window.innerHeight / zoom / 8}
                                        fill="none"
                                        stroke={t.accent}
                                        strokeWidth={1}
                                        opacity={0.6}
                                    />
                                </svg>
                            </div>
                        )}

                        {/* Zoom controls */}
                        <div className="zoom-controls">
                            <button className="zoom-btn" onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}>−</button>
                            <span className="zoom-pct" onClick={() => setZoom(1)} title="Reset zoom">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button className="zoom-btn" onClick={() => setZoom(Math.min(zoom + 0.1, 5))}>+</button>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    {rightPanel && (
                        <div className="right-panel">
                            {/* Color */}
                            <div className="panel-section">
                                <div className="panel-title">Color</div>
                                <div className="color-grid">
                                    {PALETTE.map((c) => (
                                        <div
                                            key={c}
                                            className={`color-swatch ${color === c ? "selected" : ""}`}
                                            style={{ background: c, border: c === "#ffffff" ? `2px solid ${t.border}` : "" }}
                                            onClick={() => setColor(c)}
                                        />
                                    ))}
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Stroke</span>
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        style={{ width: 32, height: 28, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                                    />
                                    <input
                                        type="text"
                                        className="panel-input"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        style={{ fontFamily: "Space Mono", fontSize: 11 }}
                                    />
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Fill</span>
                                    <input
                                        type="color"
                                        value={fillColor === "transparent" ? "#ffffff" : fillColor}
                                        onChange={(e) => setFillColor(e.target.value)}
                                        style={{ width: 32, height: 28, border: "none", borderRadius: 6, cursor: "pointer" }}
                                    />
                                    <button
                                        className="panel-input"
                                        style={{ cursor: "pointer", background: fillColor === "transparent" ? "transparent" : fillColor, fontSize: 10 }}
                                        onClick={() => setFillColor(fillColor === "transparent" ? "#4d96ff22" : "transparent")}
                                    >
                                        {fillColor === "transparent" ? "No fill" : fillColor}
                                    </button>
                                </div>
                            </div>

                            {/* Stroke */}
                            <div className="panel-section">
                                <div className="panel-title">Stroke</div>
                                <div className="panel-row">
                                    <span className="panel-label">Width</span>
                                    <input
                                        type="range"
                                        className="panel-input"
                                        min={1} max={20}
                                        value={strokeWidth}
                                        onChange={(e) => setStrokeWidth(+e.target.value)}
                                    />
                                    <span style={{ fontSize: 11, minWidth: 20, color: t.textMuted, fontFamily: "Space Mono" }}>{strokeWidth}</span>
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Style</span>
                                    <div className="stroke-styles">
                                        {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((s) => (
                                            <button
                                                key={s}
                                                className={`stroke-btn ${strokeStyle === s ? "active" : ""}`}
                                                onClick={() => setStrokeStyle(s)}
                                            >
                                                {s === "solid" ? "—" : s === "dashed" ? "- -" : "···"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Typography */}
                            <div className="panel-section">
                                <div className="panel-title">Typography</div>
                                <div className="panel-row">
                                    <span className="panel-label">Font</span>
                                    <select
                                        className="select-input"
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                        style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}` }}
                                    >
                                        {FONTS.map((f) => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Size</span>
                                    <input
                                        type="range"
                                        className="panel-input"
                                        min={8} max={96}
                                        value={fontSize}
                                        onChange={(e) => setFontSize(+e.target.value)}
                                    />
                                    <span style={{ fontSize: 11, minWidth: 24, color: t.textMuted, fontFamily: "Space Mono" }}>{fontSize}</span>
                                </div>
                            </div>

                            {/* Opacity */}
                            <div className="panel-section">
                                <div className="panel-title">Appearance</div>
                                <div className="panel-row">
                                    <span className="panel-label">Opacity</span>
                                    <input
                                        type="range"
                                        className="panel-input"
                                        min={10} max={100}
                                        value={opacity}
                                        onChange={(e) => setOpacity(+e.target.value)}
                                    />
                                    <span style={{ fontSize: 11, minWidth: 28, color: t.textMuted, fontFamily: "Space Mono" }}>{opacity}%</span>
                                </div>
                            </div>

                            {/* Selection actions */}
                            {selectedIds.length > 0 && (
                                <div className="panel-section">
                                    <div className="panel-title">Selection ({selectedIds.length})</div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {[
                                            { label: "🔼 Bring fwd", fn: () => { const next = elements.map((el) => selectedIds.includes(el.id) ? { ...el, zIndex: el.zIndex + 1 } : el); setElements(next); pushHistory(next); } },
                                            { label: "🔽 Send back", fn: () => { const next = elements.map((el) => selectedIds.includes(el.id) ? { ...el, zIndex: Math.max(0, el.zIndex - 1) } : el); setElements(next); pushHistory(next); } },
                                            { label: "⧉ Duplicate", fn: duplicateSelected },
                                            { label: "🔒 Lock", fn: () => updateSelected({ locked: true } as Partial<WhiteboardElement>) },
                                            { label: "🗑 Delete", fn: deleteSelected },
                                        ].map(({ label, fn }) => (
                                            <button
                                                key={label}
                                                onClick={fn}
                                                style={{
                                                    background: t.surface,
                                                    border: `1px solid ${t.border}`,
                                                    borderRadius: 6,
                                                    color: t.text,
                                                    fontSize: 11,
                                                    padding: "5px 8px",
                                                    cursor: "pointer",
                                                    fontFamily: "Lexend",
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sticky colors if sticky selected */}
                            {selectedEl?.type === "sticky" && (
                                <div className="panel-section">
                                    <div className="panel-title">Sticky Color</div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {STICKY_COLORS.map((sc) => (
                                            <div
                                                key={sc.bg}
                                                style={{
                                                    width: 28, height: 28,
                                                    background: sc.bg,
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                    border: (selectedEl as StickyElement).bgColor === sc.bg ? `2px solid ${t.selectedRing}` : "2px solid transparent",
                                                }}
                                                onClick={() => updateSelected({ bgColor: sc.bg, textColor: sc.text } as Partial<StickyElement>)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keyboard shortcuts quick ref */}
                            <div className="panel-section">
                                <div className="panel-title">Shortcuts</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {[
                                        ["V", "Select"], ["P", "Pen"], ["T", "Text"],
                                        ["S", "Sticky"], ["R", "Rect"], ["O", "Ellipse"],
                                        ["A", "Arrow"], ["F", "Frame"], ["E", "Eraser"],
                                        ["⌘Z", "Undo"], ["⌘⇧Z", "Redo"], ["Del", "Delete"],
                                        ["⌘D", "Duplicate"], ["Scroll", "Pan"], ["⌘Scroll", "Zoom"],
                                    ].map(([key, label]) => (
                                        <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textMuted }}>
                                            <span style={{ fontFamily: "Space Mono", color: t.accent }}>{key}</span>
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Status Bar ── */}
                <div className="statusbar">
                    <span>lumiu whiteboard v0.1</span>
                    <span>·</span>
                    <span>tool: {tool}</span>
                    <span>·</span>
                    <span>zoom: {Math.round(zoom * 100)}%</span>
                    <span>·</span>
                    <span>objects: {elements.length}</span>
                    {selectedIds.length > 0 && (
                        <>
                            <span>·</span>
                            <span style={{ color: t.accent }}>selected: {selectedIds.length}</span>
                        </>
                    )}
                    <span style={{ marginLeft: "auto" }}>
                        {theme === "dark" ? "🌙 dark mode" : "☀️ light mode"}
                    </span>
                </div>
            </div>
        </>
    );
}