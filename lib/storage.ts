import type { Subject, Chapter, Question, ReviewRecord, ImportPayload, ChapterImportPayload, Quality, DifficultyFilter } from './types'
import { generateId, now } from './utils'
import { applyReview, isDue } from './sm2'

const KEYS = {
  subjects: 'mcq_subjects',
  chapters: 'mcq_chapters',
  questions: 'mcq_questions',
  reviews: 'mcq_reviews',
}

function getStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// --- Subjects ---
export const subjectStorage = {
  getAll(): Subject[] {
    return getStore<Subject>(KEYS.subjects)
  },
  get(id: string): Subject | undefined {
    return this.getAll().find(s => s.id === id)
  },
  create(data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject {
    const subject: Subject = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    setStore(KEYS.subjects, [...this.getAll(), subject])
    return subject
  },
  update(id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>): Subject | undefined {
    const all = this.getAll()
    const idx = all.findIndex(s => s.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: now() }
    setStore(KEYS.subjects, all)
    return all[idx]
  },
  delete(id: string): void {
    setStore(KEYS.subjects, this.getAll().filter(s => s.id !== id))
    // Cascade delete chapters → questions → reviews
    const chapters = chapterStorage.getBySubject(id)
    chapters.forEach(c => chapterStorage.delete(c.id))
  },
  reorder(orderedIds: string[]): void {
    const all = this.getAll()
    const map = new Map(all.map(s => [s.id, s]))
    const reordered = orderedIds.map(id => map.get(id)).filter(Boolean) as Subject[]
    // Append any subjects not in orderedIds at the end
    all.forEach(s => { if (!orderedIds.includes(s.id)) reordered.push(s) })
    setStore(KEYS.subjects, reordered)
  },
}

// --- Chapters ---
export const chapterStorage = {
  getAll(): Chapter[] {
    return getStore<Chapter>(KEYS.chapters)
  },
  getBySubject(subjectId: string): Chapter[] {
    return this.getAll()
      .filter(c => c.subjectId === subjectId)
      .sort((a, b) => a.order - b.order)
  },
  get(id: string): Chapter | undefined {
    return this.getAll().find(c => c.id === id)
  },
  create(data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Chapter {
    const chapter: Chapter = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    setStore(KEYS.chapters, [...this.getAll(), chapter])
    return chapter
  },
  update(id: string, data: Partial<Omit<Chapter, 'id' | 'createdAt'>>): Chapter | undefined {
    const all = this.getAll()
    const idx = all.findIndex(c => c.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: now() }
    setStore(KEYS.chapters, all)
    return all[idx]
  },
  delete(id: string): void {
    setStore(KEYS.chapters, this.getAll().filter(c => c.id !== id))
    const questions = questionStorage.getByChapter(id)
    questions.forEach(q => questionStorage.delete(q.id))
  },
  reorder(orderedIds: string[]): void {
    const all = this.getAll()
    const map = new Map(all.map(c => [c.id, c]))
    orderedIds.forEach((id, idx) => {
      const chapter = map.get(id)
      if (chapter) map.set(id, { ...chapter, order: idx })
    })
    setStore(KEYS.chapters, Array.from(map.values()))
  },
}

// --- Questions ---
export const questionStorage = {
  getAll(): Question[] {
    return getStore<Question>(KEYS.questions)
  },
  getByChapter(chapterId: string): Question[] {
    return this.getAll().filter(q => q.chapterId === chapterId)
  },
  get(id: string): Question | undefined {
    return this.getAll().find(q => q.id === id)
  },
  create(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question {
    const question: Question = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    setStore(KEYS.questions, [...this.getAll(), question])
    return question
  },
  update(id: string, data: Partial<Omit<Question, 'id' | 'createdAt'>>): Question | undefined {
    const all = this.getAll()
    const idx = all.findIndex(q => q.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: now() }
    setStore(KEYS.questions, all)
    return all[idx]
  },
  delete(id: string): void {
    setStore(KEYS.questions, this.getAll().filter(q => q.id !== id))
    reviewStorage.delete(id)
  },
}

// --- Reviews ---
export const reviewStorage = {
  getAll(): ReviewRecord[] {
    return getStore<ReviewRecord>(KEYS.reviews)
  },
  get(questionId: string): ReviewRecord | undefined {
    return this.getAll().find(r => r.questionId === questionId)
  },
  applyReview(questionId: string, quality: Quality): ReviewRecord {
    const all = this.getAll()
    const existing = all.find(r => r.questionId === questionId)
    const initial: ReviewRecord = existing || {
      questionId,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      lastReviewed: now(),
    }
    const updated = applyReview(initial, quality)
    const newAll = existing
      ? all.map(r => r.questionId === questionId ? updated : r)
      : [...all, updated]
    setStore(KEYS.reviews, newAll)
    return updated
  },
  delete(questionId: string): void {
    setStore(KEYS.reviews, this.getAll().filter(r => r.questionId !== questionId))
  },
}

export function resetChapterReviews(chapterId: string): void {
  const questionIds = new Set(questionStorage.getByChapter(chapterId).map(q => q.id))
  setStore(KEYS.reviews, reviewStorage.getAll().filter(r => !questionIds.has(r.questionId)))
}

export function getQuestionsByFilter(chapterId: string, filter: DifficultyFilter): Question[] {
  const questions = questionStorage.getByChapter(chapterId)
  if (filter === 'all') return questions

  const reviews = reviewStorage.getAll()
  const reviewMap = new Map(reviews.map(r => [r.questionId, r]))

  if (filter === 'due')   return questions.filter(q => isDue(reviewMap.get(q.id)))
  if (filter === 'again') return questions.filter(q => reviewMap.get(q.id)?.lastQuality === 0)
  if (filter === 'hard')  return questions.filter(q => reviewMap.get(q.id)?.lastQuality === 3)
  if (filter === 'good')  return questions.filter(q => reviewMap.get(q.id)?.lastQuality === 5)
  return questions
}

export function getDifficultyCount(chapterId: string) {
  const questions = questionStorage.getByChapter(chapterId)
  const reviews = reviewStorage.getAll()
  const reviewMap = new Map(reviews.map(r => [r.questionId, r]))
  return {
    due:   questions.filter(q => isDue(reviewMap.get(q.id))).length,
    again: questions.filter(q => reviewMap.get(q.id)?.lastQuality === 0).length,
    hard:  questions.filter(q => reviewMap.get(q.id)?.lastQuality === 3).length,
    good:  questions.filter(q => reviewMap.get(q.id)?.lastQuality === 5).length,
    all:   questions.length,
  }
}

// --- Import ---
export function importFromJSON(payload: ImportPayload): Subject {
  const subject = subjectStorage.create({
    name: payload.subject.name,
    description: payload.subject.description || '',
    color: payload.subject.color || '#6366f1',
    emoji: payload.subject.emoji || '📚',
  })

  payload.chapters.forEach((ch, idx) => {
    const chapter = chapterStorage.create({
      subjectId: subject.id,
      name: ch.name,
      description: ch.description || '',
      order: idx,
    })
    ch.questions.forEach(q => {
      questionStorage.create({
        chapterId: chapter.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      })
    })
  })

  return subject
}

// --- Import chapters into existing subject ---
export function importChaptersToSubject(subjectId: string, payload: ChapterImportPayload): number {
  const existingChapters = chapterStorage.getBySubject(subjectId)
  let startOrder = existingChapters.length

  payload.chapters.forEach((ch, idx) => {
    const chapter = chapterStorage.create({
      subjectId,
      name: ch.name,
      description: ch.description || '',
      order: startOrder + idx,
    })
    ch.questions.forEach(q => {
      questionStorage.create({
        chapterId: chapter.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      })
    })
  })

  return payload.chapters.length
}
