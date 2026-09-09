# MCQ Flash

A spaced-repetition flashcard PWA for studying multiple-choice questions. Organize questions into subjects and chapters, then study them with an SM-2 based algorithm that adapts to how well you know each answer.

**Fully client-side** — no backend, no database, no account. All data lives in your browser's `localStorage`, and the app works offline once installed.

## Features

- **Subjects → Chapters → Questions** hierarchy for organizing study material
- **SM-2 spaced repetition** with Again / Hard / Good ratings
- **Study sessions** with progress tracking, instant feedback, and explanations
- **Difficulty filters** — study due, again, hard, good, or all questions
- **Mastery tracking** — a question is mastered after 3+ repetitions with a 7+ day interval
- **Drag-and-drop** reordering of subjects and chapters
- **JSON import/export** to bulk-load subjects and questions
- **Installable PWA** with offline support and a dark theme
- **Mobile-first** responsive design

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router, client components)
- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) with a dark theme via CSS HSL variables
- [shadcn/ui](https://ui.shadcn.com) components
- [dnd-kit](https://dndkit.com) for drag-and-drop
- [lucide-react](https://lucide.dev) icons

## Getting Started

```bash
# install dependencies
npm install

# start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Usage

1. On the dashboard, create a **subject** or import a JSON file.
2. Add **chapters** to the subject.
3. Add **questions** to each chapter, or import them in bulk.
4. Open a chapter and start a **study session**.
5. Rate each answer as **Again**, **Hard**, or **Good** — the scheduler adjusts the next interval.

### Import Format

Import a subject with chapters and questions using this JSON structure (see [`public/sample-import.json`](public/sample-import.json)):

```json
{
  "subject": {
    "name": "Biology",
    "description": "Core biology concepts",
    "color": "#22c55e",
    "emoji": "🧬"
  },
  "chapters": [
    {
      "name": "Chapter 1: Cell Biology",
      "description": "Structure and function of cells",
      "questions": [
        {
          "question": "Which organelle is known as the powerhouse of the cell?",
          "options": {
            "A": "Nucleus",
            "B": "Mitochondria",
            "C": "Ribosome",
            "D": "Golgi apparatus"
          },
          "correctAnswer": "B",
          "explanation": "Mitochondria produce ATP through cellular respiration."
        }
      ]
    }
  ]
}
```

## How Spaced Repetition Works

The scheduler implements the [SM-2 algorithm](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm) in [`lib/sm2.ts`](lib/sm2.ts):

- **Again** (quality `0`) resets repetitions and schedules the question for tomorrow.
- **Hard** (quality `3`) and **Good** (quality `5`) increase the interval (1 day → 6 days → `interval × easeFactor`).
- The ease factor is updated after every review and never drops below `1.3`.
- A question is **mastered** after 3+ repetitions with an interval of at least 7 days.

## Project Structure

```
app/                        Next.js App Router pages
  page.tsx                  Dashboard (subjects)
  subjects/[subjectId]/     Chapters list
    chapters/[chapterId]/   Questions list + study session
components/                 UI components (subjects, chapters, questions, study, ui)
hooks/                      Data hooks (useSubjects, useChapters, useQuestions, useStudySession)
lib/
  storage.ts                localStorage CRUD stores + cascade deletes
  sm2.ts                    SM-2 spaced repetition algorithm
  types.ts                  Data models
public/
  sw.js                     Service worker (offline caching)
  sample-import.json        Example import file
```

### Data Flow

```
UI Components → Custom Hooks → Storage Layer (lib/storage.ts) → localStorage
                                      ↕
                              SM-2 Algorithm (lib/sm2.ts)
```

All persistence uses entity-specific localStorage keys: `mcq_subjects`, `mcq_chapters`, `mcq_questions`, `mcq_reviews`. Deleting a subject cascades to its chapters, questions, and review records.

## Deployment

The app can be deployed to any static/Node host. The easiest option is [Vercel](https://vercel.com/new):

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m "Add my feature"`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

Please run `npm run lint` before submitting.

## License

Released under the [MIT License](LICENSE).
