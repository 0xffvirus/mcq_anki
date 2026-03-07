'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Question } from '@/lib/types'
import { questionStorage } from '@/lib/storage'

export function useQuestions(chapterId: string) {
  const [questions, setQuestions] = useState<Question[]>([])

  const reload = useCallback(() => {
    setQuestions(questionStorage.getByChapter(chapterId))
  }, [chapterId])

  useEffect(() => {
    reload()
  }, [reload])

  const createQuestion = useCallback((data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    questionStorage.create(data)
    reload()
  }, [reload])

  const updateQuestion = useCallback((id: string, data: Partial<Omit<Question, 'id' | 'createdAt'>>) => {
    questionStorage.update(id, data)
    reload()
  }, [reload])

  const deleteQuestion = useCallback((id: string) => {
    questionStorage.delete(id)
    reload()
  }, [reload])

  return { questions, createQuestion, updateQuestion, deleteQuestion, reload }
}
