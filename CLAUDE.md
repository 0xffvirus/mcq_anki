# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**MCQ Flashcards** — a Next.js 14 (App Router) PWA for spaced repetition studying. Fully client-side; no backend, no database.

### Data Flow

```
UI Components → Custom Hooks → Storage Layer (lib/storage.ts) → localStorage
                                      ↕
                              SM-2 Algorithm (lib/sm2.ts)
```

### Storage Layer (`lib/storage.ts`)

All persistence is localStorage via entity-specific stores: `mcq_subjects`, `mcq_chapters`, `mcq_questions`, `mcq_reviews`. The storage module exports typed CRUD objects (`subjectStorage`, `chapterStorage`, etc.) with `getAll`, `getById`, `create`, `update`, `delete` methods. Cascade deletes are handled here (subject → chapters → questions → reviews).

### Custom Hooks Pattern

Each hook (`hooks/useSubjects.ts`, `useChapters.ts`, `useQuestions.ts`) follows this pattern:
1. `useState` holds local data
2. `useEffect` calls `reload()` on mount
3. Mutations call the storage function then `reload()` to sync state
4. All callbacks are `useCallback`-memoized

`useStudySession.ts` manages study session state (current question, progress, SM-2 rating submission).

### Spaced Repetition (`lib/sm2.ts`)

Implements the SM-2 algorithm. Quality ratings map to: 0 = Again, 3 = Hard, 5 = Good. Mastery = 3+ repetitions with 7+ day interval. Questions are filtered by difficulty/due status for the chapter view.

### Page Routes

```
/                                                  → Dashboard (subjects)
/subjects/[subjectId]                              → Chapters list
/subjects/[subjectId]/chapters/[chapterId]         → Questions list with difficulty filters
/subjects/[subjectId]/chapters/[chapterId]/study   → Study session
```

### Key Data Models (`lib/types.ts`)

- `Subject` — id, name, description, color, emoji
- `Chapter` — id, subjectId, name, order
- `Question` — id, chapterId, question, options `{A,B,C,D}`, correctAnswer, explanation
- `ReviewRecord` — questionId, easeFactor, interval, repetitions, nextReviewDate, lastQuality

### Tech Stack

- **Next.js 14** (App Router, client components throughout)
- **Tailwind CSS** with dark theme via CSS HSL variables
- **Shadcn/ui** (components in `components/ui/`, config in `components.json`)
- **dnd-kit** for drag-and-drop reordering of subjects/chapters
- **PWA** — service worker at `public/sw.js` with network-first HTML, cache-first static assets

### Import Format

JSON import structure: `{ subject: {...}, chapters: [{ ...chapter, questions: [...] }] }`. See `public/sample-import.json`.
