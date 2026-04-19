// =============================================
// Lumiu Notes — Default Templates
// =============================================

import type { NoteTemplate } from './types';
import { v4 as uuidv4 } from 'uuid';

function makeContent(blocks: object[]): string {
  return JSON.stringify({ type: 'doc', content: blocks });
}

function h1(text: string) { return { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text }] }; }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }; }
function h3(text: string) { return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] }; }
function p(text = '') { return { type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }; }
function hr() { return { type: 'horizontalRule' }; }
function task(text: string, checked = false) {
  return { type: 'taskItem', attrs: { checked }, content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
}
function taskList(items: object[]) { return { type: 'taskList', content: items }; }
function bullet(items: string[]) {
  return {
    type: 'bulletList',
    content: items.map(t => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] })),
  };
}

export const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: uuidv4(),
    name: 'Cornell Notes',
    description: 'Classic study method: cues, notes, summary',
    icon: '📐',
    category: 'study',
    color: 'blue',
    tags: ['study', 'cornell', 'academic'],
    content: makeContent([
      h1('📐 Cornell Notes'),
      p('Subject: ____________    Date: ____________'),
      hr(),
      h2('🔑 Cues / Key Questions'),
      p('Write questions or keywords here after the lecture...'),
      hr(),
      h2('📝 Notes'),
      p('Main content and lecture notes go here...'),
      bullet(['Key point 1', 'Key point 2', 'Key point 3']),
      hr(),
      h2('📋 Summary'),
      p('Summarize the main ideas in your own words...'),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Meeting Notes',
    description: 'Structured template for meetings and discussions',
    icon: '🤝',
    category: 'work',
    color: 'green',
    tags: ['meeting', 'work', 'agenda'],
    content: makeContent([
      h1('🤝 Meeting Notes'),
      p('📅 Date: ____________    ⏰ Time: ____________    📍 Location: ____________'),
      hr(),
      h2('👥 Attendees'),
      bullet(['Person 1', 'Person 2', 'Person 3']),
      h2('📋 Agenda'),
      bullet(['Agenda item 1', 'Agenda item 2', 'Agenda item 3']),
      hr(),
      h2('💬 Discussion'),
      p('Notes from the discussion...'),
      hr(),
      h2('✅ Action Items'),
      taskList([
        task('Action item 1 — Owner: ____'),
        task('Action item 2 — Due: ____'),
        task('Follow up on _____'),
      ]),
      h2('📌 Next Meeting'),
      p('Date: ____________'),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Daily Journal',
    description: 'Daily reflection, gratitude & tasks',
    icon: '🌅',
    category: 'personal',
    color: 'orange',
    tags: ['journal', 'daily', 'reflection'],
    content: makeContent([
      h1('🌅 Daily Journal'),
      p('📅 Date: ____________    😊 Mood: ⭐⭐⭐⭐⭐'),
      hr(),
      h2('🙏 Gratitude (3 things)'),
      bullet(['I am grateful for...', 'Today I appreciated...', 'A good thing that happened...']),
      h2('🎯 Today\'s Focus'),
      p('The ONE thing I need to accomplish today:'),
      h2('✅ Today\'s Tasks'),
      taskList([
        task('High priority task'),
        task('Medium priority task'),
        task('Nice to have task'),
      ]),
      hr(),
      h2('📔 Journal Entry'),
      p('How was your day? Write freely...'),
      hr(),
      h2('🌙 Evening Reflection'),
      p('What went well? What can I improve? What did I learn?'),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Brainstorm Board',
    description: 'Capture all ideas, mind-map style',
    icon: '⚡',
    category: 'creative',
    color: 'yellow',
    tags: ['brainstorm', 'creative', 'ideas'],
    content: makeContent([
      h1('⚡ Brainstorm: ____________'),
      p('🎯 Central Idea / Question:'),
      hr(),
      h2('💡 Raw Ideas (no filter!)'),
      p('Dump everything here — no judgment, just flow...'),
      bullet(['Idea 1', 'Idea 2', 'Idea 3', 'Idea 4', '...more']),
      h2('🔗 Connections & Patterns'),
      p('What ideas connect? What themes emerge?'),
      h2('⭐ Top 3 Ideas'),
      bullet(['Best idea 1', 'Best idea 2', 'Best idea 3']),
      h2('🚀 Next Steps'),
      taskList([
        task('Research: ____'),
        task('Try: ____'),
        task('Share with: ____'),
      ]),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Project Charter',
    description: 'Full project planning and roadmap template',
    icon: '🚀',
    category: 'planning',
    color: 'purple',
    tags: ['project', 'planning', 'roadmap'],
    content: makeContent([
      h1('🚀 Project: ____________'),
      p('📅 Start Date: ____________    🏁 Target Date: ____________'),
      hr(),
      h2('🎯 Goal / Vision'),
      p('What are we trying to achieve and why?'),
      h2('📋 Scope'),
      h3('✅ In Scope'),
      bullet(['Feature 1', 'Feature 2']),
      h3('❌ Out of Scope'),
      bullet(['Not this version', 'Future consideration']),
      h2('👥 Team'),
      bullet(['Role 1: Name', 'Role 2: Name']),
      hr(),
      h2('📅 Milestones'),
      taskList([
        task('Phase 1: Research & Planning'),
        task('Phase 2: Design & Prototype'),
        task('Phase 3: Build & Test'),
        task('Phase 4: Launch & Review'),
      ]),
      h2('⚠️ Risks & Mitigations'),
      bullet(['Risk 1 → Mitigation', 'Risk 2 → Mitigation']),
      h2('📊 Success Metrics'),
      bullet(['Metric 1', 'Metric 2', 'Metric 3']),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Book / Video Notes',
    description: 'Capture insights from books, videos or courses',
    icon: '📚',
    category: 'study',
    color: 'cyan',
    tags: ['book', 'video', 'learning', 'review'],
    content: makeContent([
      h1('📚 Notes: "____________"'),
      p('👤 Author/Creator: ____________    📅 Completed: ____________    ⭐ My Rating: /10'),
      hr(),
      h2('🎯 Why I Read/Watched This'),
      p('What did I hope to learn or gain?'),
      h2('💡 Key Ideas & Highlights'),
      bullet(['Big idea 1', 'Big idea 2', 'Quote or stat']),
      h2('🔑 Memorable Quotes'),
      p('"Write the best quote here..."'),
      hr(),
      h2('🧠 What I Learned'),
      p('Main takeaways in my own words...'),
      h2('🚀 How I\'ll Apply This'),
      taskList([
        task('Apply idea 1 by doing...'),
        task('Share this with...'),
        task('Revisit in 30 days'),
      ]),
      h2('⭐ Overall Verdict'),
      p('Recommend? Who should read/watch this?'),
    ]),
  },
  {
    id: uuidv4(),
    name: 'Lecture Notes',
    description: 'Fast lecture capture with key terms & questions',
    icon: '🎓',
    category: 'study',
    color: 'pink',
    tags: ['lecture', 'class', 'academic'],
    content: makeContent([
      h1('🎓 Lecture: ____________'),
      p('📅 Date: ____________    📖 Course: ____________    👤 Prof: ____________'),
      hr(),
      h2('📝 Main Notes'),
      p('Write lecture content here (use bullet points for speed)...'),
      bullet(['Point 1', 'Point 2', 'Point 3']),
      h2('❓ Questions to Follow Up'),
      taskList([
        task('Question 1?'),
        task('Clarify: ____'),
        task('Look up: ____'),
      ]),
      h2('🔑 Key Terms / Definitions'),
      bullet(['Term 1: definition', 'Term 2: definition']),
      hr(),
      h2('💡 My Insights & Connections'),
      p('Connect to what you already know...'),
    ]),
  },
];
