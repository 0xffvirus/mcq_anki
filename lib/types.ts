export interface Subject {
  id: string
  name: string
  description: string
  color: string
  emoji: string
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  subjectId: string
  name: string
  description: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  chapterId: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  createdAt: string
  updatedAt: string
}

export interface ReviewRecord {
  questionId: string
  easeFactor: number
  interval: number
  repetitions: number
  lastReviewed: string
  lastQuality?: Quality
}

export type DifficultyFilter = 'due' | 'again' | 'hard' | 'good' | 'all'

export type Quality = 0 | 3 | 5

export interface ChapterImportPayload {
  chapters: Array<{
    name: string
    description?: string
    questions: Array<{
      question: string
      options: { A: string; B: string; C: string; D: string }
      correctAnswer: 'A' | 'B' | 'C' | 'D'
      explanation?: string
    }>
  }>
}

export interface ImportPayload {
  subject: {
    name: string
    description?: string
    color?: string
    emoji?: string
  }
  chapters: Array<{
    name: string
    description?: string
    questions: Array<{
      question: string
      options: { A: string; B: string; C: string; D: string }
      correctAnswer: 'A' | 'B' | 'C' | 'D'
      explanation?: string
    }>
  }>
}
