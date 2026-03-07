'use client'
import { useState } from 'react'
import { useSubjects } from '@/hooks/useSubjects'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { ImportButton } from '@/components/subjects/ImportButton'
import { EmptyState } from '@/components/EmptyState'
import type { Subject } from '@/lib/types'

export default function Dashboard() {
  const { subjects, createSubject, reload } = useSubjects()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MCQ Flash</h1>
            <p className="text-sm text-muted-foreground">{subjects.length} subjects</p>
          </div>
          <ImportButton onImport={reload} />
        </div>
      </div>

      {/* Subject List */}
      <div className="flex-1 px-4 pb-24">
        {subjects.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No subjects yet"
            description="Create a subject or import a JSON file to get started"
          />
        ) : (
          <div className="space-y-3">
            {subjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-8 right-1/2 translate-x-1/2 w-[calc(390px-64px)] max-w-[326px] h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
      >
        <span className="text-xl">+</span>
        New Subject
      </button>

      <SubjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={data => createSubject(data as Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>)}
      />
    </div>
  )
}
