'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Chapter } from '@/lib/types'
import { chapterStorage } from '@/lib/storage'

export function useChapters(subjectId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([])

  const reload = useCallback(() => {
    setChapters(chapterStorage.getBySubject(subjectId))
  }, [subjectId])

  useEffect(() => {
    reload()
  }, [reload])

  const createChapter = useCallback((data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
    chapterStorage.create(data)
    reload()
  }, [reload])

  const updateChapter = useCallback((id: string, data: Partial<Omit<Chapter, 'id' | 'createdAt'>>) => {
    chapterStorage.update(id, data)
    reload()
  }, [reload])

  const deleteChapter = useCallback((id: string) => {
    chapterStorage.delete(id)
    reload()
  }, [reload])

  return { chapters, createChapter, updateChapter, deleteChapter, reload }
}
