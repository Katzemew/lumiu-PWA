"use client";
import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CardStatus = "new" | "learning" | "review" | "mastered";
type ViewMode = "library" | "study" | "create" | "edit" | "ai-generate";
type CardTheme = "nebula" | "aurora" | "void" | "pulsar" | "comet" | "supernova" | "quasar" | "stardust";

interface Flashcard {
  id: string; front: string; back: string; hint?: string;
  tags: string[]; theme: CardTheme; status: CardStatus;
  easeFactor: number; interval: number; nextReview: number;
  repetitions: number; createdAt: number; order: number;
}
interface Deck {
  id: string; name: string; description: string; subject: string;
  theme: CardTheme; cards: Flashcard[]; createdAt: number; emoji: string; folderId: string | null;
}
interface Folder {
  id: string; name: string; emoji: string; color: string; createdAt: number; expanded: boolean;
}

// ─── SM-2 ─────────────────────────────────────────────────────────────────────
function sm2(card: Flashcard, quality: 0|1|2|3|4|5): Flashcard {
  let { easeFactor, interval, repetitions } = card;
  if (quality >= 3) {
    interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
    repetitions++; easeFactor = Math.max(1.3, easeFactor + 0.1 - (5-quality)*(0.08+(5-quality)*0.02));
  } else { repetitions = 0; interval = 1; }
  const status: CardStatus = repetitions===0?"learning":interval<=1?"learning":interval<=7?"review":"mastered";
  return { ...card, easeFactor, interval, repetitions, status, nextReview: Date.now() + interval*86400000 };
}

const uid = () => Math.random().toString(36).slice(2,10);

// ─── Seeds ────────────────────────────────────────────────────────────────────
const SEED_FOLDERS: Folder[] = [
  { id:"f1", name:"Sciences", emoji:"🔬", color:"#9D79FF", createdAt:Date.now()-86400000*10, expanded:true },
  { id:"f2", name:"Mathematics", emoji:"📐", color:"#c4b0ff", createdAt:Date.now()-86400000*7, expanded:false },
];
const SEED_DECKS: Deck[] = [
  { id:"d1", name:"Astrophysics 101", description:"Stellar formation to black holes", subject:"Science", theme:"nebula", emoji:"🌌", folderId:"f1", createdAt:Date.now()-86400000*7,
    cards:[
      {id:uid(),front:"What is a neutron star?",back:"An extremely dense stellar remnant from a supernova. Composed almost entirely of neutrons — mass 1–3× the Sun in ~20km diameter.",hint:"Dead star, ultra-dense",tags:["stars","remnants"],theme:"nebula",status:"review",easeFactor:2.5,interval:4,nextReview:Date.now()+86400000*2,repetitions:3,createdAt:Date.now()-86400000*5,order:0},
      {id:uid(),front:"Define Schwarzschild radius",back:"The radius where escape velocity equals c. For mass M: rs=2GM/c². For Earth, ~9mm. This is the event horizon of a black hole.",hint:"Event horizon formula",tags:["black holes"],theme:"void",status:"learning",easeFactor:2.2,interval:1,nextReview:Date.now()+86400000,repetitions:1,createdAt:Date.now()-86400000*3,order:1},
      {id:uid(),front:"What is redshift?",back:"Shift of spectral lines toward longer wavelengths. Caused by Doppler effect (receding objects), cosmological expansion, or gravitational redshift.",hint:"Light stretching = moving away",tags:["light","cosmology"],theme:"aurora",status:"mastered",easeFactor:2.8,interval:21,nextReview:Date.now()+86400000*15,repetitions:5,createdAt:Date.now()-86400000*10,order:2},
    ]
  },
  { id:"d2", name:"Organic Chemistry", description:"Reactions, mechanisms, functional groups", subject:"Chemistry", theme:"pulsar", emoji:"⚗️", folderId:"f1", createdAt:Date.now()-86400000*3,
    cards:[{id:uid(),front:"SN2 Reaction Mechanism",back:"Bimolecular nucleophilic substitution. Nucleophile attacks back face simultaneously as leaving group departs — inverts stereochemistry (Walden inversion).",hint:"Back-attack, one step, inversion",tags:["mechanisms"],theme:"pulsar",status:"new",easeFactor:2.5,interval:0,nextReview:Date.now(),repetitions:0,createdAt:Date.now()-86400000,order:0}]
  },
  { id:"d3", name:"Linear Algebra", description:"Vectors, matrices, transformations", subject:"Mathematics", theme:"quasar", emoji:"📐", folderId:"f2", createdAt:Date.now()-86400000*14,
    cards:[{id:uid(),front:"What is an eigenvector?",back:"A non-zero vector v such that Av=λv for matrix A and scalar λ. The transformation only scales v — its direction stays unchanged.",hint:"Matrix × vector = just scaled",tags:["matrices"],theme:"quasar",status:"review",easeFactor:2.6,interval:8,nextReview:Date.now()+86400000*3,repetitions:4,createdAt:Date.now()-86400000*7,order:0}]
  },
  { id:"d4", name:"World History", description:"Key events and turning points", subject:"History", theme:"stardust", emoji:"🌍", folderId:null, createdAt:Date.now()-86400000*2, cards:[] },
];

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES: Record<CardTheme,{label:string;gradient:string;accent:string;star:string}> = {
  nebula:   {label:"Nebula",   gradient:"linear-gradient(135deg,#0d0829,#1a0a3d 40%,#2d1b69 70%,#1a0a3d)", accent:"#9D79FF",star:"#e0d7ff"},
  aurora:   {label:"Aurora",   gradient:"linear-gradient(135deg,#001a2c,#003d2b 40%,#00695c 70%,#004d40)", accent:"#34d399",star:"#d1fae5"},
  void:     {label:"Void",     gradient:"linear-gradient(135deg,#050505,#0d1117 40%,#161b22 70%,#0d1117)", accent:"#58a6ff",star:"#e6edf3"},
  pulsar:   {label:"Pulsar",   gradient:"linear-gradient(135deg,#1a0020,#3d0050 40%,#6b0080 60%,#3d0050)", accent:"#e040fb",star:"#f3e5f5"},
  comet:    {label:"Comet",    gradient:"linear-gradient(135deg,#0a1628,#1e2a4a 40%,#0d3b6e 70%,#0a1628)", accent:"#60a5fa",star:"#dbeafe"},
  supernova:{label:"Supernova",gradient:"linear-gradient(135deg,#1a0a00,#3d1a00 40%,#8b3a00 60%,#3d1a00)", accent:"#fb923c",star:"#ffedd5"},
  quasar:   {label:"Quasar",   gradient:"linear-gradient(135deg,#001a1a,#003333 40%,#006666 60%,#003333)", accent:"#22d3ee",star:"#cffafe"},
  stardust: {label:"Stardust", gradient:"linear-gradient(135deg,#1a1500,#3d3000 40%,#7a6000 60%,#3d3000)", accent:"#fbbf24",star:"#fef3c7"},
};

// ─── StarField ────────────────────────────────────────────────────────────────
function StarField({count=40}:{count?:number}) {
  const s = useRef(Array.from({length:count},()=>({x:Math.random()*100,y:Math.random()*100,r:0.3+Math.random()*1.1,delay:Math.random()*4,dur:2+Math.random()*3})));
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
      {s.current.map((st,i)=>(
        <circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.r} fill="white" opacity={0.35}>
          <animate attributeName="opacity" values="0.15;0.8;0.15" dur={`${st.dur}s`} begin={`${st.delay}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LumIUFlashcards() {
  const [decks, setDecks] = useState<Deck[]>(SEED_DECKS);
  const [folders, setFolders] = useState<Folder[]>(SEED_FOLDERS);
  const [view, setView] = useState<ViewMode>("library");
  const [activeDeck, setActiveDeck] = useState<Deck|null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [studyDone, setStudyDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({again:0,hard:0,good:0,easy:0});
  // form
  const [formFront, setFormFront] = useState("");
  const [formBack, setFormBack] = useState("");
  const [formHint, setFormHint] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formTheme, setFormTheme] = useState<CardTheme>("nebula");
  const [editingCard, setEditingCard] = useState<Flashcard|null>(null);
  // ai
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDeckName, setAiDeckName] = useState("");
  const [aiEmoji, setAiEmoji] = useState("✨");
  const [aiTheme, setAiTheme] = useState<CardTheme>("nebula");
  const [aiTargetFolderId, setAiTargetFolderId] = useState<string|null>(null);
  // create method sheet
  const [showCreateMethod, setShowCreateMethod] = useState(false);
  const [methodStep, setMethodStep] = useState<"pick"|"paste"|"ai-topic">("pick");
  const [pasteText, setPasteText] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);
  const [methodAiTopic, setMethodAiTopic] = useState("");
  const [methodAiCount, setMethodAiCount] = useState(5);
  // deck/folder creation
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");
  const [newDeckEmoji, setNewDeckEmoji] = useState("📚");
  const [newDeckTheme, setNewDeckTheme] = useState<CardTheme>("nebula");
  const [newDeckFolderId, setNewDeckFolderId] = useState<string|null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderEmoji, setNewFolderEmoji] = useState("📁");
  const [newFolderColor, setNewFolderColor] = useState("#9D79FF");
  // context menus
  const [cardMenu, setCardMenu] = useState<{id:string;x:number;y:number}|null>(null);
  const [deckMenu, setDeckMenu] = useState<{id:string;x:number;y:number}|null>(null);
  const [folderMenu, setFolderMenu] = useState<{id:string;x:number;y:number}|null>(null);
  // drag
  const [draggingId, setDraggingId] = useState<string|null>(null);
  const [dragOverId, setDragOverId] = useState<string|null>(null);
  // theme
  const [appTheme, setAppTheme] = useState<"dark"|"light">("dark");
  const isDark = appTheme==="dark";

  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  // ── Lumiu Notes design system ──────────────────────────────────────────────
  // Dark: deep navy #0f0f23 bg, #1a1a38 surface, #22223a cards
  // Light: white main area, solid #9D79FF sidebar accent
  const T = {
    bg:      isDark ? "#0f0f23"                   : "#f5f3ff",
    surface: isDark ? "#1a1a38"                   : "#ffffff",
    s2:      isDark ? "#22223a"                   : "#ede9ff",
    s3:      isDark ? "#2a2a48"                   : "#e2dcff",
    sidebar: isDark ? "#16162e"                   : "#9D79FF",
    sidebarText: isDark ? "#c8c0f0"               : "#ffffff",
    sidebarMuted: isDark ? "rgba(200,192,240,0.5)": "rgba(255,255,255,0.65)",
    sidebarActive: isDark ? "#2e2e50"             : "rgba(255,255,255,0.25)",
    sidebarBorder: isDark ? "rgba(157,121,255,0.12)" : "rgba(255,255,255,0.2)",
    border:  isDark ? "rgba(157,121,255,0.12)"    : "rgba(157,121,255,0.18)",
    b2:      isDark ? "rgba(157,121,255,0.22)"    : "rgba(157,121,255,0.30)",
    text:    isDark ? "#e8e4ff"                   : "#1a1040",
    muted:   isDark ? "rgba(200,192,240,0.55)"    : "rgba(80,60,140,0.55)",
    accent:  "#9D79FF",
    accentDark: "#7c5cfc",
    glow:    "rgba(157,121,255,0.16)",
    glowMd:  "rgba(157,121,255,0.28)",
    green:   isDark ? "#34d399" : "#059669",
    amber:   isDark ? "#fbbf24" : "#d97706",
    red:     isDark ? "#f87171" : "#ef4444",
    blue:    isDark ? "#60a5fa" : "#3b82f6",
    pill:    isDark ? "#22223a" : "#ede9ff",
  };
  const sc = (s:CardStatus) => ({new:T.blue,learning:T.amber,review:T.accent,mastered:T.green}[s]);

  // ─── sync helper ──────────────────────────────────────────────────────────
  const sync = (deckId:string, fn:(d:Deck)=>Deck) => {
    setDecks(p=>p.map(d=>d.id===deckId?fn(d):d));
    if (activeDeck?.id===deckId) setActiveDeck(p=>p?fn(p):p);
  };
  const closeMenus = () => { setCardMenu(null); setDeckMenu(null); setFolderMenu(null); };

  // ─── study ────────────────────────────────────────────────────────────────
  const startStudy = (deck:Deck) => {
    const due = deck.cards.filter(c=>c.nextReview<=Date.now()+86400000);
    setStudyQueue(due.length>0?[...due]:deck.cards.slice(0,10));
    setStudyIndex(0); setIsFlipped(false); setShowHint(false);
    setStudyDone(false); setSessionStats({again:0,hard:0,good:0,easy:0});
    setActiveDeck(deck); setView("study");
  };
  const rateCard = (q:0|1|3|5) => {
    const card = studyQueue[studyIndex];
    const updated = sm2(card,q);
    const lbl = q===0?"again":q===1?"hard":q===3?"good":"easy";
    setSessionStats(p=>({...p,[lbl]:p[lbl as keyof typeof p]+1}));
    sync(activeDeck!.id, d=>({...d,cards:d.cards.map(c=>c.id===card.id?updated:c)}));
    if (studyIndex+1>=studyQueue.length) setStudyDone(true);
    else { setStudyIndex(i=>i+1); setIsFlipped(false); setShowHint(false); }
  };

  // ─── ai calls ─────────────────────────────────────────────────────────────
  const callAI = async (prompt:string, maxTokens=1000) => {
    const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})});
    const d = await r.json();
    return JSON.parse((d.content?.[0]?.text??"[]").replace(/```json|```/g,"").trim());
  };
  const makeCards = (parsed:{front:string;back:string;hint:string;tags:string[]}[], startOrder=0): Flashcard[] => {
    const keys = Object.keys(THEMES) as CardTheme[];
    return parsed.map((c,i)=>({id:uid(),front:c.front,back:c.back,hint:c.hint,tags:c.tags??[],theme:keys[i%keys.length],status:"new",easeFactor:2.5,interval:0,nextReview:Date.now(),repetitions:0,createdAt:Date.now(),order:startOrder+i}));
  };

  const generateFullDeck = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const parsed = await callAI(`Generate exactly ${aiCount} flashcards about: "${aiTopic}". Return ONLY a JSON array. Each: {"front":"Q","back":"2-4 sentence answer","hint":"memory hook","tags":["tag"]}`);
      const newDeck:Deck={id:uid(),name:aiDeckName||aiTopic,description:`AI: ${aiTopic}`,subject:"AI",theme:aiTheme,emoji:aiEmoji,cards:makeCards(parsed),createdAt:Date.now(),folderId:aiTargetFolderId};
      setDecks(p=>[newDeck,...p]); setAiTopic(""); setAiDeckName(""); setView("library");
    } catch(e){console.error(e);} finally{setAiLoading(false);}
  };

  const generateFromPaste = async () => {
    if (!pasteText.trim()||!activeDeck) return;
    setPasteLoading(true);
    try {
      const parsed = await callAI(`Extract key facts from this text as flashcards. Return ONLY JSON array. Each: {"front":"Q","back":"A","hint":"hint","tags":["tag"]}\n\nText:\n${pasteText}`,1500);
      sync(activeDeck.id, d=>({...d,cards:[...d.cards,...makeCards(parsed,d.cards.length)]}));
      setPasteText(""); setShowCreateMethod(false); setMethodStep("pick");
    } catch(e){console.error(e);} finally{setPasteLoading(false);}
  };

  const generateToActiveDeck = async (topic:string, count:number) => {
    if (!topic.trim()||!activeDeck) return;
    setAiLoading(true);
    try {
      const parsed = await callAI(`Generate exactly ${count} flashcards about: "${topic}". Return ONLY JSON array. Each: {"front":"Q","back":"A","hint":"hint","tags":["tag"]}`);
      sync(activeDeck.id, d=>({...d,cards:[...d.cards,...makeCards(parsed,d.cards.length)]}));
      setMethodAiTopic(""); setShowCreateMethod(false); setMethodStep("pick");
    } catch(e){console.error(e);} finally{setAiLoading(false);}
  };

  // ─── crud ─────────────────────────────────────────────────────────────────
  const saveCard = () => {
    if (!formFront.trim()||!formBack.trim()||!activeDeck) return;
    const tags = formTags.split(",").map(x=>x.trim()).filter(Boolean);
    if (editingCard) {
      sync(activeDeck.id, d=>({...d,cards:d.cards.map(c=>c.id===editingCard.id?{...editingCard,front:formFront,back:formBack,hint:formHint,tags,theme:formTheme}:c)}));
    } else {
      const card:Flashcard={id:uid(),front:formFront,back:formBack,hint:formHint,tags,theme:formTheme,status:"new",easeFactor:2.5,interval:0,nextReview:Date.now(),repetitions:0,createdAt:Date.now(),order:activeDeck.cards.length};
      sync(activeDeck.id, d=>({...d,cards:[...d.cards,card]}));
    }
    setFormFront(""); setFormBack(""); setFormHint(""); setFormTags(""); setEditingCard(null); setView("library");
  };
  const deleteCard = (id:string) => { if (!activeDeck) return; sync(activeDeck.id, d=>({...d,cards:d.cards.filter(c=>c.id!==id)})); closeMenus(); };
  const deleteDeck = (id:string) => { setDecks(p=>p.filter(d=>d.id!==id)); if (activeDeck?.id===id){setActiveDeck(null);setView("library");} closeMenus(); };
  const moveUp = (cardId:string) => {
    if (!activeDeck) return;
    const cards=[...activeDeck.cards].sort((a,b)=>a.order-b.order);
    const i=cards.findIndex(c=>c.id===cardId); if(i<=0) return;
    [cards[i-1],cards[i]]=[cards[i],cards[i-1]];
    sync(activeDeck.id,d=>({...d,cards:cards.map((c,idx)=>({...c,order:idx}))})); closeMenus();
  };
  const moveDown = (cardId:string) => {
    if (!activeDeck) return;
    const cards=[...activeDeck.cards].sort((a,b)=>a.order-b.order);
    const i=cards.findIndex(c=>c.id===cardId); if(i>=cards.length-1) return;
    [cards[i],cards[i+1]]=[cards[i+1],cards[i]];
    sync(activeDeck.id,d=>({...d,cards:cards.map((c,idx)=>({...c,order:idx}))})); closeMenus();
  };
  const reorder = (dragId:string, overId:string) => {
    if (!activeDeck||dragId===overId) return;
    const cards=[...activeDeck.cards].sort((a,b)=>a.order-b.order);
    const from=cards.findIndex(c=>c.id===dragId); const to=cards.findIndex(c=>c.id===overId);
    if(from<0||to<0) return;
    const [m]=cards.splice(from,1); cards.splice(to,0,m);
    sync(activeDeck.id,d=>({...d,cards:cards.map((c,i)=>({...c,order:i}))}));
  };
  const moveDeck = (deckId:string, fId:string|null) => { setDecks(p=>p.map(d=>d.id===deckId?{...d,folderId:fId}:d)); closeMenus(); };
  const createDeck = () => {
    if (!newDeckName.trim()) return;
    const d:Deck={id:uid(),name:newDeckName,description:newDeckDesc,subject:"Custom",theme:newDeckTheme,emoji:newDeckEmoji,cards:[],createdAt:Date.now(),folderId:newDeckFolderId};
    setDecks(p=>[d,...p]); setActiveDeck(d); setNewDeckName(""); setNewDeckDesc(""); setShowNewDeck(false);
  };
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders(p=>[...p,{id:uid(),name:newFolderName,emoji:newFolderEmoji,color:newFolderColor,createdAt:Date.now(),expanded:true}]);
    setNewFolderName(""); setShowNewFolder(false);
  };
  const deleteFolder = (id:string) => { setFolders(p=>p.filter(f=>f.id!==id)); setDecks(p=>p.map(d=>d.folderId===id?{...d,folderId:null}:d)); closeMenus(); };
  const toggleFolder = (id:string) => setFolders(p=>p.map(f=>f.id===id?{...f,expanded:!f.expanded}:f));
  const openEdit = (card:Flashcard) => { setEditingCard(card); setFormFront(card.front); setFormBack(card.back); setFormHint(card.hint??""); setFormTags(card.tags.join(", ")); setFormTheme(card.theme); setView("edit"); closeMenus(); };
  const getPos = (i:number,total:number) => { const d=i-carouselIndex; return ((d%total)+total+Math.floor(total/2))%total-Math.floor(total/2); };

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.lfc{font-family:'Chillax',sans-serif;background:${T.bg};color:${T.text};min-height:100vh;overflow-x:hidden;transition:background 0.35s,color 0.35s;}
/* Top */
.ftop{position:sticky;top:0;z-index:100;height:56px;background:${T.surface};border-bottom:1px solid ${T.border};display:flex;align-items:center;padding:0 22px;gap:14px;backdrop-filter:blur(12px);}
.flogo{font-weight:700;font-size:19px;color:${T.accent};letter-spacing:-0.3px;}
.flogo-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 10px ${T.accent};margin-left:5px;animation:blink 2s infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.35;}}
.fnav{height:30px;padding:0 15px;border-radius:20px;border:none;font-family:'Chillax';font-size:13px;font-weight:500;cursor:pointer;transition:all 0.18s;background:transparent;color:${T.muted};}
.fnav:hover{background:${T.s2};color:${T.text};}.fnav.act{background:${T.glow};color:${T.accent};}
.fright{margin-left:auto;display:flex;align-items:center;gap:10px;}
.tpill{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 14px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.tpill:hover{border-color:${T.accent};color:${T.text};}
.toggle-track{width:34px;height:18px;border-radius:9px;background:${isDark?"#9D79FF":"rgba(255,255,255,0.4)"};position:relative;transition:background 0.25s;flex-shrink:0;}
.toggle-thumb{position:absolute;width:14px;height:14px;border-radius:50%;background:white;top:2px;left:${isDark?"18px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
/* Library */
.libwrap{padding:28px 24px;max-width:1200px;margin:0 auto;}
.shead{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.stitle{font-size:20px;font-weight:600;letter-spacing:-0.3px;}
.badge{padding:3px 11px;border-radius:20px;font-size:11px;font-weight:600;background:${T.glow};color:${T.accent};border:1px solid ${T.border};}
/* Folder */
.frow{margin-bottom:20px;}
.fhdr{display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:14px;cursor:pointer;border:1px solid ${T.border};background:${T.surface};margin-bottom:9px;transition:all 0.18s;user-select:none;}
.fhdr:hover{border-color:${T.b2};background:${T.s2};}
.fchev{font-size:9px;color:${T.muted};transition:transform 0.22s;}.fchev.op{transform:rotate(90deg);}
.fdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.fname{font-size:14px;font-weight:600;flex:1;letter-spacing:-0.1px;}
.fcnt{font-size:11px;color:${T.muted};font-weight:500;}
.fdecks{padding-left:16px;}
/* Deck grid */
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(252px,1fr));gap:13px;margin-bottom:6px;}
.dcard{position:relative;overflow:hidden;border-radius:18px;border:1px solid ${T.border};cursor:pointer;transition:transform 0.22s,box-shadow 0.22s;}
.dcard:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.35);}
.dcinner{position:relative;overflow:hidden;border-radius:18px;height:168px;display:flex;flex-direction:column;justify-content:space-between;padding:16px;}
.demoji{font-size:28px;line-height:1;margin-bottom:4px;}
.dname{font-size:16px;font-weight:600;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.5);letter-spacing:-0.2px;}
.ddesc{font-size:11px;color:rgba(255,255,255,0.5);margin-top:3px;}
.dmeta{display:flex;align-items:center;gap:6px;margin-top:10px;}
.dstat{font-size:11px;color:rgba(255,255,255,0.65);font-weight:500;}
.dstudybtn{margin-left:auto;padding:5px 13px;border-radius:20px;border:none;font-family:'Chillax';font-size:11px;font-weight:600;cursor:pointer;background:rgba(255,255,255,0.18);color:white;transition:all 0.15s;backdrop-filter:blur(4px);}
.dstudybtn:hover{background:rgba(255,255,255,0.30);}
.d3dot{position:absolute;top:10px;right:10px;width:27px;height:27px;border-radius:14px;border:none;background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.8);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.15s;letter-spacing:1.5px;}
.dcard:hover .d3dot{opacity:1;}
.newdbtn{border-radius:18px;border:2px dashed ${T.border};background:transparent;color:${T.muted};cursor:pointer;height:168px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-family:'Chillax';transition:all 0.22s;width:100%;}
.newdbtn:hover{border-color:${T.accent};color:${T.accent};background:${T.glow};}
/* Context menu */
.ctxm{position:fixed;z-index:600;background:${T.surface};border:1px solid ${T.b2};border-radius:14px;padding:5px;min-width:172px;box-shadow:0 16px 48px rgba(0,0,0,0.5);}
.ctxi{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;font-size:13px;cursor:pointer;color:${T.text};border:none;background:transparent;width:100%;text-align:left;font-family:'Chillax';font-weight:500;transition:background 0.12s;}
.ctxi:hover{background:${T.s2};}.ctxi.dan{color:${T.red};}.ctxi.dan:hover{background:rgba(248,113,113,0.1);}
.ctxsep{height:1px;background:${T.border};margin:4px 5px;}
.ctxlabel{padding:4px 12px 2px;font-size:10px;font-weight:600;color:${T.muted};text-transform:uppercase;letter-spacing:0.07em;}
/* Carousel */
.ctrack{width:100%;display:flex;align-items:center;justify-content:center;position:relative;height:320px;perspective:1200px;}
.citem{position:absolute;width:265px;height:300px;border-radius:22px;overflow:hidden;cursor:pointer;transform-style:preserve-3d;transition:all 0.45s cubic-bezier(0.4,0,0.2,1);}
.ciface{position:absolute;inset:0;border-radius:22px;padding:18px;display:flex;flex-direction:column;backface-visibility:hidden;-webkit-backface-visibility:hidden;}
.cinum{font-size:10px;font-family:'JetBrains Mono';letter-spacing:0.08em;opacity:0.42;margin-bottom:6px;}
.cisub{font-size:11px;opacity:0.65;margin-bottom:8px;font-weight:500;}
.cititle{font-size:14px;font-weight:600;line-height:1.4;flex:1;letter-spacing:-0.1px;}
.cifooter{display:flex;align-items:center;justify-content:space-between;margin-top:8px;}
.cistatus{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;text-transform:uppercase;letter-spacing:0.04em;}
.citag{font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);}
.cnav{display:flex;align-items:center;gap:20px;margin-top:20px;justify-content:center;}
.carrow{width:40px;height:40px;border-radius:50%;border:1px solid ${T.border};background:${T.surface};color:${T.text};font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s;}
.carrow:hover{border-color:${T.accent};background:${T.glow};color:${T.accent};}
.cdots{display:flex;gap:5px;align-items:center;}
.cdot{border-radius:4px;height:4px;transition:all 0.3s;cursor:pointer;border:none;}
/* Back btn */
.bbtn{width:36px;height:36px;border-radius:50%;border:1px solid ${T.border};background:${T.surface};color:${T.text};font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s;flex-shrink:0;}
.bbtn:hover{border-color:${T.accent};color:${T.accent};}
/* Study */
.swrap{min-height:calc(100vh - 56px);display:flex;flex-direction:column;align-items:center;padding:28px 22px;}
.pbbg{flex:1;height:4px;border-radius:2px;background:${T.border};}
.pbfill{height:4px;border-radius:2px;background:linear-gradient(90deg,${T.accent},#c4b0ff);transition:width 0.4s;}
.scwrap{width:100%;max-width:520px;perspective:1200px;margin-bottom:22px;}
.scard{width:100%;height:308px;position:relative;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(0.4,0,0.2,1);cursor:pointer;}
.scard.flipped{transform:rotateY(180deg);}
.scface{position:absolute;inset:0;border-radius:22px;padding:28px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;justify-content:center;}
.scback{position:absolute;inset:0;border-radius:22px;padding:28px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);display:flex;flex-direction:column;justify-content:center;}
.sq{font-size:20px;font-weight:600;line-height:1.4;text-align:center;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.4);letter-spacing:-0.2px;}
.sa{font-size:15px;line-height:1.65;color:white;text-shadow:0 1px 6px rgba(0,0,0,0.3);}
.rrow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;max-width:520px;width:100%;}
.rbtn{flex:1;min-width:90px;padding:11px 12px;border-radius:14px;border:none;cursor:pointer;font-family:'Chillax';font-size:13px;font-weight:600;transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:2px;}
.rbtn span{font-size:10px;opacity:0.65;font-weight:400;}.rbtn:hover{transform:translateY(-2px);}
.hbtn{padding:7px 16px;border-radius:20px;border:1px solid ${T.border};background:${T.pill};color:${T.muted};font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;margin-bottom:13px;transition:all 0.15s;}
.hbtn:hover{border-color:${T.accent};color:${T.accent};}
/* Done */
.dwrap{display:flex;flex-direction:column;align-items:center;padding:52px 22px;gap:16px;}
.dstats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:380px;}
.dstat{background:${T.surface};border:1px solid ${T.border};border-radius:14px;padding:12px;text-align:center;}
.dsn{font-size:22px;font-weight:700;letter-spacing:-0.5px;}.dsl{font-size:11px;color:${T.muted};margin-top:2px;font-weight:500;}
/* Form */
.fwrap{padding:24px;max-width:640px;margin:0 auto;}
.fg{margin-bottom:16px;}
.fl{display:block;font-size:11px;font-weight:600;color:${T.muted};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.07em;}
.fi{width:100%;padding:10px 13px;background:${T.surface};border:1px solid ${T.border};border-radius:12px;color:${T.text};font-family:'Chillax';font-size:14px;outline:none;transition:border-color 0.18s;resize:vertical;}
.fi:focus{border-color:${T.accent};}
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;}
.topt{height:52px;border-radius:12px;cursor:pointer;border:2px solid transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:10px;font-weight:600;color:white;transition:all 0.15s;font-family:'Chillax';}
.topt.sel{border-color:white;box-shadow:0 0 0 3px rgba(157,121,255,0.3);}
.factions{display:flex;gap:10px;margin-top:22px;}
.btnp{padding:10px 24px;border-radius:12px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:14px;font-weight:600;cursor:pointer;transition:all 0.18s;letter-spacing:-0.1px;}
.btnp:hover{background:${T.accentDark};transform:translateY(-1px);}.btnp:disabled{opacity:0.45;cursor:not-allowed;transform:none;}
.btns{padding:10px 18px;border-radius:12px;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-family:'Chillax';font-size:14px;cursor:pointer;transition:all 0.18s;font-weight:500;}
.btns:hover{background:${T.s2};}
/* Create method sheet */
.moverlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;}
.msheet{background:${T.surface};border-radius:24px 24px 0 0;padding:22px 20px 36px;width:100%;max-width:500px;border-top:1px solid ${T.b2};}
.mhandle{width:36px;height:5px;border-radius:3px;background:${T.b2};margin:0 auto 20px;}
.mtitle{font-size:18px;font-weight:700;margin-bottom:5px;text-align:center;letter-spacing:-0.3px;}
.msub{font-size:12px;color:${T.muted};text-align:center;margin-bottom:20px;font-weight:500;}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.mbtn{border-radius:16px;border:1px solid ${T.border};background:${T.s2};cursor:pointer;padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:9px;transition:all 0.2s;font-family:'Chillax';}
.mbtn:hover{border-color:${T.accent};background:${T.glow};transform:translateY(-2px);}
.micon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;}
.mlabel{font-size:13px;font-weight:600;color:${T.text};letter-spacing:-0.1px;}
.msubtext{font-size:11px;color:${T.muted};text-align:center;font-weight:500;}
.mfull{width:100%;border-radius:16px;border:1px solid ${T.border};background:${T.s2};cursor:pointer;padding:16px 18px;display:flex;align-items:center;gap:13px;transition:all 0.2s;font-family:'Chillax';}
.mfull:hover{border-color:${T.accent};background:${T.glow};}
.mficon{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
/* Card list */
.clist{display:flex;flex-direction:column;gap:6px;margin-top:13px;}
.crow{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:9px;cursor:grab;transition:background 0.12s;}
.crow:active{cursor:grabbing;}.crow.dov{border-color:${T.accent};background:${T.glow};}
.cracent{width:3px;height:30px;border-radius:2px;flex-shrink:0;}
.crfront{font-size:13px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.crstatus{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;text-transform:uppercase;white-space:nowrap;letter-spacing:0.04em;}
.dhandle{color:${T.muted};font-size:13px;cursor:grab;padding:0 3px;flex-shrink:0;}
.c3dot{width:28px;height:28px;border-radius:9px;border:1px solid ${T.border};background:${T.pill};color:${T.muted};font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;letter-spacing:1.5px;flex-shrink:0;}
.c3dot:hover{background:${T.s2};color:${T.text};}
/* AI */
.aiwrap{padding:24px;max-width:640px;margin:0 auto;}
.aipulse{width:10px;height:10px;border-radius:50%;background:${T.accent};box-shadow:0 0 14px ${T.accent};animation:blink 1.5s infinite;}
.aigenbtn{width:100%;padding:14px;border-radius:14px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-0.1px;}
.aigenbtn:hover{background:${T.accentDark};transform:translateY(-1px);}.aigenbtn:disabled{opacity:0.45;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg);}}
/* Modal */
.moverlay2{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;}
.mbox{background:${T.surface};border:1px solid ${T.b2};border-radius:22px;padding:24px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;}
.mboxtitle{font-size:17px;font-weight:700;margin-bottom:18px;letter-spacing:-0.3px;}
scrollbar-width:thin;scrollbar-color:${T.border} transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${T.accent};border-radius:4px;opacity:0.4;}
`;

  // ─── renderDeckCard ───────────────────────────────────────────────────────
  const renderDeckCard = (deck:Deck) => {
    const th=THEMES[deck.theme];
    const due=deck.cards.filter(c=>c.nextReview<=Date.now()+86400000).length;
    return (
      <div key={deck.id} className="dcard" onClick={e=>{e.stopPropagation();setActiveDeck(deck);setCarouselIndex(0);}}>
        <div className="dcinner" style={{background:th.gradient}}>
          <StarField count={20}/>
          <div style={{position:"relative"}}>
            <div className="demoji">{deck.emoji}</div>
            <div className="dname">{deck.name}</div>
            {deck.description&&<div className="ddesc">{deck.description}</div>}
          </div>
          <div style={{position:"relative"}}>
            <div className="dmeta">
              <span className="dstat">📚 {deck.cards.length}</span>
              {due>0&&<span className="dstat" style={{color:th.accent}}>⚡{due}</span>}
              <button className="dstudybtn" onClick={e=>{e.stopPropagation();startStudy(deck);}}>Study →</button>
            </div>
          </div>
          <button className="d3dot" onClick={e=>{e.stopPropagation();setActiveDeck(deck);setDeckMenu({id:deck.id,x:e.clientX,y:e.clientY});}}>···</button>
        </div>
      </div>
    );
  };

  // ─── renderCarousel ───────────────────────────────────────────────────────
  const renderCarousel = () => {
    if (!activeDeck||activeDeck.cards.length===0) return (
      <div style={{textAlign:"center",padding:"36px 0",color:T.muted}}>
        <div style={{fontSize:34,marginBottom:7}}>🃏</div>
        <div style={{fontSize:14,marginBottom:13}}>No cards yet</div>
        <button className="btnp" style={{fontSize:13}} onClick={()=>setShowCreateMethod(true)}>+ Add Card</button>
      </div>
    );
    const sorted=[...activeDeck.cards].sort((a,b)=>a.order-b.order);
    const total=sorted.length;
    return (
      <div>
        <div className="ctrack">
          {sorted.map((card,i)=>{
            const pos=getPos(i,total); if(Math.abs(pos)>2) return null;
            const isC=pos===0; const th=THEMES[card.theme];
            return (
              <div key={card.id} className="citem" style={{transform:`translateX(${pos*205}px) translateZ(${isC?0:-Math.abs(pos)*80}px) scale(${isC?1:1-Math.abs(pos)*0.08})`,opacity:isC?1:1-Math.abs(pos)*0.28,zIndex:10-Math.abs(pos)}}
                onClick={()=>isC?setIsFlipped(!isFlipped):setCarouselIndex(i)}>
                <div className="ciface" style={{background:th.gradient}}>
                  <StarField count={16}/>
                  <div style={{position:"relative"}}>
                    <div className="cinum">{String(i+1).padStart(2,"0")} / {String(total).padStart(2,"0")}</div>
                    <div className="cisub" style={{color:th.accent}}>{card.tags[0]??"General"}</div>
                    <div className="cititle" style={{color:th.star}}>{card.front}</div>
                  </div>
                  <div style={{position:"relative"}}>
                    <div className="cifooter">
                      <span className="cistatus" style={{background:`${sc(card.status)}28`,color:th.star}}>{card.status}</span>
                      <div style={{display:"flex",gap:4}}>{card.tags.slice(0,2).map(t=><span key={t} className="citag">{t}</span>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="cnav">
          <button className="carrow" onClick={()=>setCarouselIndex(i=>(i-1+total)%total)}>◀</button>
          <div className="cdots">{sorted.map((_,i)=><button key={i} className="cdot" style={{width:i===carouselIndex?18:6,background:i===carouselIndex?"#9D79FF":T.border}} onClick={()=>setCarouselIndex(i)}/>)}</div>
          <button className="carrow" onClick={()=>setCarouselIndex(i=>(i+1)%total)}>▶</button>
        </div>
      </div>
    );
  };

  // ─── renderLibrary ────────────────────────────────────────────────────────
  const renderLibrary = () => {
    const unfiled = decks.filter(d=>d.folderId===null);
    return (
      <div className="libwrap" onClick={closeMenus}>
        <div className="shead">
          <span className="stitle">My Library</span>
          <span className="badge">{decks.length} decks</span>
          <div style={{marginLeft:"auto",display:"flex",gap:7}}>
            <button className="btns" style={{fontSize:12,padding:"6px 11px"}} onClick={e=>{e.stopPropagation();setShowNewFolder(true);}}>📁 Folder</button>
            <button className="btns" style={{fontSize:12,padding:"6px 11px"}} onClick={e=>{e.stopPropagation();setNewDeckFolderId(null);setShowNewDeck(true);}}>+ Deck</button>
            <button className="btns" style={{fontSize:12,padding:"6px 11px"}} onClick={e=>{e.stopPropagation();setView("ai-generate");}}>✦ AI</button>
          </div>
        </div>

        {folders.map(folder=>{
          const fd=decks.filter(d=>d.folderId===folder.id);
          return (
            <div key={folder.id} className="frow">
              <div className="fhdr" onClick={e=>{e.stopPropagation();toggleFolder(folder.id);}}>
                <span className={`fchev ${folder.expanded?"op":""}`}>▶</span>
                <div className="fdot" style={{background:folder.color}}/>
                <span style={{fontSize:15}}>{folder.emoji}</span>
                <span className="fname">{folder.name}</span>
                <span className="fcnt">{fd.length} deck{fd.length!==1?"s":""}</span>
                <button className="c3dot" style={{marginLeft:4}} onClick={e=>{e.stopPropagation();setFolderMenu({id:folder.id,x:e.clientX,y:e.clientY});}}> ···</button>
              </div>
              {folder.expanded&&(
                <div className="fdecks">
                  <div className="dgrid">
                    {fd.map(d=>renderDeckCard(d))}
                    <button className="newdbtn" onClick={e=>{e.stopPropagation();setNewDeckFolderId(folder.id);setShowNewDeck(true);}}>
                      <span style={{fontSize:20}}>+</span><span style={{fontSize:12,fontWeight:500}}>Add deck</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {unfiled.length>0&&(
          <>
            <div className="shead" style={{marginTop:10}}><span style={{fontSize:13,fontWeight:500,color:T.muted}}>Uncategorised</span></div>
            <div className="dgrid">
              {unfiled.map(d=>renderDeckCard(d))}
              <button className="newdbtn" onClick={e=>{e.stopPropagation();setNewDeckFolderId(null);setShowNewDeck(true);}}>
                <span style={{fontSize:20}}>+</span><span style={{fontSize:12,fontWeight:500}}>New Deck</span>
              </button>
            </div>
          </>
        )}

        {decks.length===0&&folders.length===0&&(
          <div style={{textAlign:"center",padding:"60px 0",color:T.muted}}>
            <div style={{fontSize:44,marginBottom:11}}>🌌</div>
            <div style={{fontSize:16,fontWeight:500,marginBottom:5}}>Your library is empty</div>
            <div style={{fontSize:13,marginBottom:18}}>Create a folder, add a deck, or let AI generate one</div>
            <button className="btnp" onClick={()=>setView("ai-generate")}>✦ Generate with AI</button>
          </div>
        )}

        {/* Active deck detail */}
        {activeDeck&&(
          <div style={{marginTop:30,borderTop:`1px solid ${T.border}`,paddingTop:22}}>
            <div className="shead">
              <span style={{fontSize:18}}>{activeDeck.emoji}</span>
              <span className="stitle">{activeDeck.name}</span>
              <span className="badge">{activeDeck.cards.length}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:7}}>
                <button className="btns" style={{fontSize:12,padding:"6px 11px"}} onClick={()=>startStudy(activeDeck)}>Study</button>
                <button className="btnp" style={{fontSize:12,padding:"6px 13px"}} onClick={e=>{e.stopPropagation();setShowCreateMethod(true);}}>+ Add Card</button>
              </div>
            </div>
            {renderCarousel()}
            <div style={{marginTop:22}}>
              <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:9,textTransform:"uppercase",letterSpacing:"0.06em"}}>All Cards — drag to reorder</div>
              <div className="clist">
                {[...activeDeck.cards].sort((a,b)=>a.order-b.order).map((card,i)=>{
                  const th=THEMES[card.theme];
                  return (
                    <div key={card.id} className={`crow ${dragOverId===card.id?"dov":""}`}
                      draggable onDragStart={()=>setDraggingId(card.id)}
                      onDragOver={e=>{e.preventDefault();setDragOverId(card.id);}}
                      onDragEnd={()=>{if(draggingId&&dragOverId)reorder(draggingId,dragOverId);setDraggingId(null);setDragOverId(null);}}
                      onClick={e=>e.stopPropagation()}>
                      <span className="dhandle">⠿</span>
                      <div className="cracent" style={{background:th.accent}}/>
                      <span style={{fontSize:10,fontFamily:"JetBrains Mono",color:T.muted,minWidth:18}}>{String(i+1).padStart(2,"0")}</span>
                      <span className="crfront">{card.front}</span>
                      <span className="crstatus" style={{background:`${sc(card.status)}22`,color:sc(card.status)}}>{card.status}</span>
                      <button className="c3dot" onClick={e=>{e.stopPropagation();setCardMenu({id:card.id,x:e.clientX,y:e.clientY});}}>···</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── renderStudy ──────────────────────────────────────────────────────────
  const renderStudy = () => {
    if (studyDone) return (
      <div className="dwrap">
        <div style={{fontSize:46}}>🎉</div>
        <div style={{fontSize:24,fontWeight:700}}>Session Complete!</div>
        <p style={{color:T.muted,fontSize:13}}>Your brain is building new constellations.</p>
        <div className="dstats">
          {[{l:"Again",v:sessionStats.again,c:T.red},{l:"Hard",v:sessionStats.hard,c:T.amber},{l:"Good",v:sessionStats.good,c:T.blue},{l:"Easy",v:sessionStats.easy,c:T.green}].map(s=>(
            <div key={s.l} className="dstat"><div className="dsn" style={{color:s.c}}>{s.v}</div><div className="dsl">{s.l}</div></div>
          ))}
        </div>
        <div style={{display:"flex",gap:9}}>
          <button className="btns" onClick={()=>setView("library")}>Library</button>
          <button className="btnp" onClick={()=>activeDeck&&startStudy(activeDeck)}>Again</button>
        </div>
      </div>
    );
    const card=studyQueue[studyIndex]; if (!card) return null;
    const th=THEMES[card.theme];
    return (
      <div className="swrap">
        <div style={{display:"flex",alignItems:"center",gap:11,width:"100%",maxWidth:520,marginBottom:7}}>
          <button className="bbtn" onClick={()=>setView("library")}>←</button>
          <span style={{fontSize:13,color:T.muted}}>{activeDeck?.name}</span>
          <span style={{fontSize:11,fontFamily:"JetBrains Mono",color:T.muted,marginLeft:"auto"}}>{studyIndex+1}/{studyQueue.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:11,width:"100%",maxWidth:520,marginBottom:22}}>
          <div className="pbbg"><div className="pbfill" style={{width:`${(studyIndex/studyQueue.length)*100}%`}}/></div>
        </div>
        <div className="scwrap">
          <div className={`scard ${isFlipped?"flipped":""}`} onClick={()=>setIsFlipped(!isFlipped)}>
            <div className="scface" style={{background:th.gradient}}>
              <StarField count={32}/>
              <div style={{position:"relative",textAlign:"center"}}>
                <div style={{fontSize:10,fontFamily:"JetBrains Mono",color:th.accent,marginBottom:13,opacity:0.65,letterSpacing:"0.06em"}}>QUESTION</div>
                <div className="sq">{card.front}</div>
                {showHint&&card.hint&&<div style={{marginTop:11,fontSize:12,color:"rgba(255,255,255,0.52)",fontStyle:"italic"}}>💡 {card.hint}</div>}
                <div style={{fontSize:11,color:"rgba(255,255,255,0.32)",marginTop:16}}>tap to reveal</div>
              </div>
            </div>
            <div className="scback" style={{background:th.gradient}}>
              <StarField count={32}/>
              <div style={{position:"relative"}}>
                <div style={{fontSize:10,fontFamily:"JetBrains Mono",color:th.accent,marginBottom:11,opacity:0.65,letterSpacing:"0.06em"}}>ANSWER</div>
                <div className="sa">{card.back}</div>
              </div>
            </div>
          </div>
        </div>
        {!isFlipped
          ? <button className="hbtn" onClick={()=>setShowHint(!showHint)}>{showHint?"Hide hint":"Show hint 💡"}</button>
          : <div className="rrow">
              {[{q:0 as const,l:"Again",s:"<1m",bg:`${T.red}22`,c:T.red},{q:1 as const,l:"Hard",s:"~1d",bg:`${T.amber}22`,c:T.amber},{q:3 as const,l:"Good",s:`${Math.max(1,Math.round(card.interval*card.easeFactor))}d`,bg:`${T.blue}22`,c:T.blue},{q:5 as const,l:"Easy",s:`${Math.round(card.interval*card.easeFactor*1.3)}d`,bg:`${T.green}22`,c:T.green}].map(r=>(
                <button key={r.l} className="rbtn" style={{background:r.bg,color:r.c}} onClick={()=>rateCard(r.q)}>{r.l}<span>{r.s}</span></button>
              ))}
            </div>
        }
      </div>
    );
  };

  // ─── renderForm ───────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="fwrap">
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:20}}>
        <button className="bbtn" onClick={()=>{setView("library");setEditingCard(null);}}>←</button>
        <span style={{fontSize:18,fontWeight:700}}>{editingCard?"Edit Card":"New Flashcard"}</span>
      </div>
      <div className="fg"><label className="fl">Front — Question</label><textarea className="fi" rows={3} placeholder="What do you want to remember?" value={formFront} onChange={e=>setFormFront(e.target.value)}/></div>
      <div className="fg"><label className="fl">Back — Answer</label><textarea className="fi" rows={5} placeholder="The detailed answer..." value={formBack} onChange={e=>setFormBack(e.target.value)}/></div>
      <div className="fg"><label className="fl">Hint (optional)</label><input className="fi" placeholder="A quick memory trigger..." value={formHint} onChange={e=>setFormHint(e.target.value)}/></div>
      <div className="fg"><label className="fl">Tags (comma-separated)</label><input className="fi" placeholder="biology, cells..." value={formTags} onChange={e=>setFormTags(e.target.value)}/></div>
      <div className="fg">
        <label className="fl">Card Theme</label>
        <div className="tgrid">{(Object.keys(THEMES) as CardTheme[]).map(th=><button key={th} className={`topt ${formTheme===th?"sel":""}`} style={{background:THEMES[th].gradient}} onClick={()=>setFormTheme(th)}><span style={{fontSize:11}}>✦</span><span>{THEMES[th].label}</span></button>)}</div>
      </div>
      <div className="factions">
        <button className="btnp" onClick={saveCard}>{editingCard?"Save Changes":"Add Card"}</button>
        <button className="btns" onClick={()=>{setView("library");setEditingCard(null);}}>Cancel</button>
      </div>
    </div>
  );

  // ─── renderAI ─────────────────────────────────────────────────────────────
  const renderAI = () => (
    <div className="aiwrap">
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:6}}>
        <button className="bbtn" onClick={()=>setView("library")}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div className="aipulse"/><span style={{fontSize:19,fontWeight:700}}>AI Card Generator</span></div>
      </div>
      <p style={{fontSize:13,color:T.muted,marginBottom:20,paddingLeft:46}}>Describe a topic — lumiu builds your deck.</p>
      <div className="fg"><label className="fl">Topic / Prompt</label><textarea className="fi" rows={4} placeholder="e.g. 'French Revolution key figures' or 'JS async/await' or 'Cell organelles'..." value={aiTopic} onChange={e=>setAiTopic(e.target.value)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
        <div className="fg" style={{margin:0}}><label className="fl">Deck Name</label><input className="fi" placeholder="Auto-named" value={aiDeckName} onChange={e=>setAiDeckName(e.target.value)}/></div>
        <div className="fg" style={{margin:0}}><label className="fl">Count</label><select className="fi" value={aiCount} onChange={e=>setAiCount(+e.target.value)} style={{cursor:"pointer"}}>{[5,10,15,20].map(n=><option key={n} value={n}>{n} cards</option>)}</select></div>
      </div>
      <div className="fg"><label className="fl">Save to folder</label><select className="fi" value={aiTargetFolderId??""} onChange={e=>setAiTargetFolderId(e.target.value||null)} style={{cursor:"pointer"}}><option value="">No folder</option>{folders.map(f=><option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}</select></div>
      <div className="fg"><label className="fl">Emoji</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["✨","🔬","📐","🌌","⚗️","🧠","📚","💡","🎯","🌿","⚡","🔮"].map(e=><button key={e} onClick={()=>setAiEmoji(e)} style={{width:33,height:33,border:`1px solid ${aiEmoji===e?"#9D79FF":T.border}`,borderRadius:8,background:aiEmoji===e?T.glow:"transparent",fontSize:16,cursor:"pointer",transition:"all 0.15s"}}>{e}</button>)}</div></div>
      <div className="fg"><label className="fl">Theme</label><div className="tgrid">{(Object.keys(THEMES) as CardTheme[]).map(th=><button key={th} className={`topt ${aiTheme===th?"sel":""}`} style={{background:THEMES[th].gradient}} onClick={()=>setAiTheme(th)}><span style={{fontSize:10}}>✦</span><span>{THEMES[th].label}</span></button>)}</div></div>
      <button className="aigenbtn" onClick={generateFullDeck} disabled={aiLoading||!aiTopic.trim()}>
        {aiLoading?<><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generating...</>:<>✦ Generate Deck</>}
      </button>
    </div>
  );

  // ─── renderCreateMethodSheet ──────────────────────────────────────────────
  const renderMethodSheet = () => (
    <div className="moverlay" onClick={()=>{setShowCreateMethod(false);setMethodStep("pick");}}>
      <div className="msheet" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        {methodStep==="pick"&&<>
          <div className="mtitle">Add to {activeDeck?.name??"Deck"}</div>
          <div className="msub">How would you like to create cards?</div>
          <div className="mgrid">
            <button className="mbtn" onClick={()=>{setView("create");setShowCreateMethod(false);setMethodStep("pick");}}>
              <div className="micon" style={{background:"linear-gradient(135deg,#9D79FF,#c4b0ff)"}}>⌨️</div>
              <div className="mlabel">Create manually</div>
              <div className="msubtext">Type your own Q&A</div>
            </button>
            <button className="mbtn" onClick={()=>setMethodStep("paste")}>
              <div className="micon" style={{background:"linear-gradient(135deg,#ec4899,#f43f5e)"}}>📋</div>
              <div className="mlabel">Paste text</div>
              <div className="msubtext">AI extracts cards</div>
            </button>
            <button className="mbtn" onClick={()=>setMethodStep("ai-topic")}>
              <div className="micon" style={{background:"linear-gradient(135deg,#06b6d4,#3b82f6)"}}>✦</div>
              <div className="mlabel">AI generate</div>
              <div className="msubtext">Describe a topic</div>
            </button>
            <button className="mbtn" onClick={()=>imgRef.current?.click()}>
              <div className="micon" style={{background:"linear-gradient(135deg,#10b981,#059669)"}}>🖼️</div>
              <div className="mlabel">Select images</div>
              <div className="msubtext">AI reads your notes</div>
            </button>
          </div>
          <button className="mfull" onClick={()=>fileRef.current?.click()}>
            <div className="mficon" style={{background:"linear-gradient(135deg,#f59e0b,#d97706)"}}>📄</div>
            <div style={{textAlign:"left"}}>
              <div className="mlabel" style={{marginBottom:2}}>Select file</div>
              <div className="msubtext">.pdf, .docx, .pptx — AI extracts key facts</div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.pptx" style={{display:"none"}} onChange={()=>alert("PDF parsing needs pdf.js — wire up in production!")}/>
          <input ref={imgRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={()=>alert("Image OCR needs tesseract.js — wire up in production!")}/>
        </>}

        {methodStep==="paste"&&<>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:15}}>
            <button className="bbtn" style={{width:30,height:30,fontSize:13}} onClick={()=>setMethodStep("pick")}>←</button>
            <div className="mtitle" style={{margin:0}}>Paste text</div>
          </div>
          <textarea className="fi" rows={8} placeholder="Paste your notes or textbook excerpt — AI will extract key concepts as flashcards." value={pasteText} onChange={e=>setPasteText(e.target.value)}/>
          <div style={{display:"flex",gap:9,marginTop:13}}>
            <button className="btnp" style={{flex:1}} onClick={generateFromPaste} disabled={pasteLoading||!pasteText.trim()}>
              {pasteLoading?<span style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}><div style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generating...</span>:"✦ Generate Cards"}
            </button>
            <button className="btns" onClick={()=>setMethodStep("pick")}>Cancel</button>
          </div>
        </>}

        {methodStep==="ai-topic"&&<>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:15}}>
            <button className="bbtn" style={{width:30,height:30,fontSize:13}} onClick={()=>setMethodStep("pick")}>←</button>
            <div className="mtitle" style={{margin:0}}>AI generate cards</div>
          </div>
          <textarea className="fi" rows={4} placeholder="e.g. 'Krebs cycle steps' or 'JavaScript closures'..." value={methodAiTopic} onChange={e=>setMethodAiTopic(e.target.value)}/>
          <div style={{display:"flex",alignItems:"center",gap:11,marginTop:11}}>
            <label className="fl" style={{margin:0,whiteSpace:"nowrap"}}>Count:</label>
            <select className="fi" style={{width:"auto"}} value={methodAiCount} onChange={e=>setMethodAiCount(+e.target.value)}>{[5,10,15,20].map(n=><option key={n} value={n}>{n}</option>)}</select>
          </div>
          <div style={{display:"flex",gap:9,marginTop:13}}>
            <button className="btnp" style={{flex:1}} onClick={()=>generateToActiveDeck(methodAiTopic,methodAiCount)} disabled={aiLoading||!methodAiTopic.trim()}>
              {aiLoading?<span style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}><div style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generating...</span>:"✦ Add Cards"}
            </button>
            <button className="btns" onClick={()=>setMethodStep("pick")}>Cancel</button>
          </div>
        </>}
      </div>
    </div>
  );

  // ─── Context menus ────────────────────────────────────────────────────────
  const clampY = (y:number) => Math.min(y, window.innerHeight-220);
  const clampX = (x:number) => Math.min(x, window.innerWidth-185);

  const renderCtxCard = () => {
    if (!cardMenu) return null;
    const card=activeDeck?.cards.find(c=>c.id===cardMenu.id); if (!card) return null;
    return (
      <div className="ctxm" style={{top:clampY(cardMenu.y),left:clampX(cardMenu.x)}} onClick={e=>e.stopPropagation()}>
        <button className="ctxi" onClick={()=>openEdit(card)}>✏️  Edit card</button>
        <button className="ctxi" onClick={()=>moveUp(card.id)}>↑  Move up</button>
        <button className="ctxi" onClick={()=>moveDown(card.id)}>↓  Move down</button>
        <div className="ctxsep"/>
        <button className="ctxi dan" onClick={()=>deleteCard(card.id)}>🗑  Delete card</button>
      </div>
    );
  };
  const renderCtxDeck = () => {
    if (!deckMenu) return null;
    const deck=decks.find(d=>d.id===deckMenu.id); if (!deck) return null;
    return (
      <div className="ctxm" style={{top:clampY(deckMenu.y),left:clampX(deckMenu.x)}} onClick={e=>e.stopPropagation()}>
        <button className="ctxi" onClick={()=>{startStudy(deck);closeMenus();}}>▶  Study</button>
        <button className="ctxi" onClick={()=>{setActiveDeck(deck);setShowCreateMethod(true);closeMenus();}}>+  Add card</button>
        <div className="ctxsep"/>
        <div className="ctxlabel">Move to folder</div>
        <button className="ctxi" onClick={()=>moveDeck(deck.id,null)}>📂  No folder</button>
        {folders.map(f=><button key={f.id} className="ctxi" onClick={()=>moveDeck(deck.id,f.id)}>{f.emoji}  {f.name}</button>)}
        <div className="ctxsep"/>
        <button className="ctxi dan" onClick={()=>deleteDeck(deck.id)}>🗑  Delete deck</button>
      </div>
    );
  };
  const renderCtxFolder = () => {
    if (!folderMenu) return null;
    const folder=folders.find(f=>f.id===folderMenu.id); if (!folder) return null;
    return (
      <div className="ctxm" style={{top:clampY(folderMenu.y),left:clampX(folderMenu.x)}} onClick={e=>e.stopPropagation()}>
        <button className="ctxi" onClick={()=>{setNewDeckFolderId(folder.id);setShowNewDeck(true);closeMenus();}}>+  Add deck</button>
        <div className="ctxsep"/>
        <button className="ctxi dan" onClick={()=>deleteFolder(folder.id)}>🗑  Delete folder</button>
      </div>
    );
  };

  // ─── Root ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="lfc" onClick={closeMenus}>
        <div className="ftop">
          <div className="flogo">lumiu<span className="flogo-dot"/></div>
          <div style={{width:1,height:22,background:T.border,margin:"0 4px"}}/>
          <button className={`fnav ${view==="library"?"act":""}`} onClick={()=>setView("library")}>Library</button>
          <button className={`fnav ${view==="ai-generate"?"act":""}`} onClick={()=>setView("ai-generate")}>✦ AI</button>
          <div className="fright">
            {activeDeck&&<span style={{fontSize:11,color:T.muted,fontFamily:"JetBrains Mono"}}>{activeDeck.emoji} {activeDeck.name}</span>}
            <button className="tpill" onClick={()=>setAppTheme(appTheme==="dark"?"light":"dark")}>
              {appTheme==="dark"?"🌙":"☀️"}
              <div className="toggle-track"><div className="toggle-thumb"/></div>
              {appTheme==="dark"?"Dark":"Light"}
            </button>
          </div>
        </div>

        {view==="library"&&renderLibrary()}
        {view==="study"&&renderStudy()}
        {view==="create"&&renderForm()}
        {view==="edit"&&renderForm()}
        {view==="ai-generate"&&renderAI()}

        {showCreateMethod&&renderMethodSheet()}

        {/* New Deck Modal */}
        {showNewDeck&&(
          <div className="moverlay2" onClick={()=>setShowNewDeck(false)}>
            <div className="mbox" onClick={e=>e.stopPropagation()}>
              <div className="mboxtitle">Create New Deck</div>
              <div className="fg"><label className="fl">Name</label><input className="fi" placeholder="e.g. Organic Chemistry" value={newDeckName} onChange={e=>setNewDeckName(e.target.value)} autoFocus/></div>
              <div className="fg"><label className="fl">Description</label><input className="fi" placeholder="What's this deck about?" value={newDeckDesc} onChange={e=>setNewDeckDesc(e.target.value)}/></div>
              <div className="fg"><label className="fl">Folder</label><select className="fi" value={newDeckFolderId??""} onChange={e=>setNewDeckFolderId(e.target.value||null)} style={{cursor:"pointer"}}><option value="">No folder</option>{folders.map(f=><option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}</select></div>
              <div className="fg"><label className="fl">Emoji</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["📚","🔬","📐","⚗️","🧠","💡","🎯","🌿","⚡","🔮","🌌","✨"].map(e=><button key={e} onClick={()=>setNewDeckEmoji(e)} style={{width:33,height:33,border:`1px solid ${newDeckEmoji===e?"#9D79FF":T.border}`,borderRadius:8,background:newDeckEmoji===e?T.glow:"transparent",fontSize:16,cursor:"pointer"}}>{e}</button>)}</div></div>
              <div className="fg"><label className="fl">Theme</label><div className="tgrid">{(Object.keys(THEMES) as CardTheme[]).map(th=><button key={th} className={`topt ${newDeckTheme===th?"sel":""}`} style={{background:THEMES[th].gradient}} onClick={()=>setNewDeckTheme(th)}><span style={{fontSize:10}}>{THEMES[th].label}</span></button>)}</div></div>
              <div className="factions"><button className="btnp" onClick={createDeck}>Create</button><button className="btns" onClick={()=>setShowNewDeck(false)}>Cancel</button></div>
            </div>
          </div>
        )}

        {/* New Folder Modal */}
        {showNewFolder&&(
          <div className="moverlay2" onClick={()=>setShowNewFolder(false)}>
            <div className="mbox" onClick={e=>e.stopPropagation()}>
              <div className="mboxtitle">Create Folder</div>
              <div className="fg"><label className="fl">Folder Name</label><input className="fi" placeholder="e.g. Sciences, Year 1..." value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} autoFocus/></div>
              <div className="fg"><label className="fl">Emoji</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["📁","🗂️","📂","🔬","📐","🌌","⚗️","📚","🎯","🧬","💊","🌿"].map(e=><button key={e} onClick={()=>setNewFolderEmoji(e)} style={{width:33,height:33,border:`1px solid ${newFolderEmoji===e?"#9D79FF":T.border}`,borderRadius:8,background:newFolderEmoji===e?T.glow:"transparent",fontSize:16,cursor:"pointer"}}>{e}</button>)}</div></div>
              <div className="fg"><label className="fl">Colour</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#9D79FF","#c4b0ff","#f87171","#fbbf24","#34d399","#60a5fa","#e040fb","#fb923c"].map(c=><button key={c} onClick={()=>setNewFolderColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${newFolderColor===c?"white":"transparent"}`,cursor:"pointer",boxShadow:newFolderColor===c?"0 0 0 2px "+c:"none"}}/>)}</div></div>
              <div className="factions"><button className="btnp" onClick={createFolder}>Create</button><button className="btns" onClick={()=>setShowNewFolder(false)}>Cancel</button></div>
            </div>
          </div>
        )}

        {renderCtxCard()}
        {renderCtxDeck()}
        {renderCtxFolder()}
      </div>
    </>
  );
}