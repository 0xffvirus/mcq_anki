'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Subject } from '@/lib/types'
import { subjectStorage } from '@/lib/storage'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])

  const reload = useCallback(() => {
    setSubjects(subjectStorage.getAll())
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const createSubject = useCallback((data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    subjectStorage.create(data)
    reload()
  }, [reload])

  const updateSubject = useCallback((id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>) => {
    subjectStorage.update(id, data)
    reload()
  }, [reload])

  const deleteSubject = useCallback((id: string) => {
    subjectStorage.delete(id)
    reload()
  }, [reload])

  return { subjects, createSubject, updateSubject, deleteSubject, reload }
}
