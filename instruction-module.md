# Lumiu Instruction Module

## Overview
Lumiu is a Next.js PWA built for neurodiverse learners (ADHD and Dyslexia). It combines dataset-driven insights, adaptive learning tools, note-taking, flashcards, AI chat, quizzes, and gamified dashboard elements.

## Setup
1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Open app:
   - `http://localhost:3000`

## Key Modules
- `app/page.tsx`: main landing page
- `app/dashboard/*`: dashboard and learner tools
- `app/notes/*`: note editor, templates, media panel
- `app/api/*`: API routes for chat, dataset, quizzes, auth
- `src/lib/*`: database, JWT, Supabase helpers
- `src/utils/supabase/*`: Supabase client, middleware, server utilities

## Data & AI
- Uses Kaggle ADHD dataset in `public/dataset/adhd_data.csv`
- Serves dataset via `/api/dataset`
- Integrates Google Generative AI via `@google/genai` and `@google/generative-ai`

## Commands
- `npm run dev` — run locally
- `npm run build` — build production app
- `npm start` — run production server
- `npm run lint` — lint source files

## Deployment Notes
- Designed for Vercel or compatible Node hosting
- Ensure environment variables are configured for Supabase and Google AI

## File Structure Highlights
- `app/`: Next.js app router pages and API routes
- `public/manifest.json`: PWA manifest
- `prisma/schema.prisma`: database schema for Prisma
- `tailwind.config.ts`: Tailwind CSS config
- `src/auth-config.js`: authentication configuration

## Maintainability
- Keep UI logic in `app/*`
- Keep backend logic in `src/*`
- Update dataset and AI prompts through API route handlers
