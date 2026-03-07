'use client'
import { useState, useCallback } from 'react'
import type { Question, Quality } from '@/lib/types'
import { reviewStorage } from '@/lib/storage'

type SessionState = 'question' | 'feedback' | 'complete'

interface SessionStats {
  again: number
  hard: number
  good: number
  total: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useStudySession(dueQuestions: Question[]) {
  // Shuffle once on mount — useState initializer runs only on first render
  const [shuffled] = useState<Question[]>(() => shuffle(dueQuestions))

  const [index, setIndex] = useState(0)
  const [state, setState] = useState<SessionState>(shuffled.length === 0 ? 'complete' : 'question')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [stats, setStats] = useState<SessionStats>({ again: 0, hard: 0, good: 0, total: shuffled.length })

  const currentQuestion = shuffled[index] ?? null

  const selectAnswer = useCallback((answer: string) => {
    if (state !== 'question') return
    setSelectedAnswer(answer)
    setState('feedback')
  }, [state])

  const rate = useCallback((quality: Quality) => {
    if (!currentQuestion) return

    reviewStorage.applyReview(currentQuestion.id, quality)

    setStats(prev => ({
      ...prev,
      again: quality === 0 ? prev.again + 1 : prev.again,
      hard: quality === 3 ? prev.hard + 1 : prev.hard,
      good: quality === 5 ? prev.good + 1 : prev.good,
    }))

    const nextIndex = index + 1
    if (nextIndex >= shuffled.length) {
      setState('complete')
    } else {
      setIndex(nextIndex)
      setSelectedAnswer(null)
      setState('question')
    }
  }, [currentQuestion, index, shuffled.length])

  const progress = shuffled.length > 0 ? (index / shuffled.length) * 100 : 100

  return {
    state,
    currentQuestion,
    selectedAnswer,
    index,
    total: shuffled.length,
    stats,
    progress,
    selectAnswer,
    rate,
  }
}
