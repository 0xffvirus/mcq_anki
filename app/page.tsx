'use client'
import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useSubjects } from '@/hooks/useSubjects'
import { subjectStorage } from '@/lib/storage'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { ImportButton } from '@/components/subjects/ImportButton'
import { SortableItem } from '@/components/SortableItem'
import { EmptyState } from '@/components/EmptyState'
import type { Subject } from '@/lib/types'

export default function Dashboard() {
  const { subjects, createSubject, reload } = useSubjects()
  const [formOpen, setFormOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subjects.findIndex(s => s.id === active.id)
    const newIndex = subjects.findIndex(s => s.id === over.id)
    const reordered = arrayMove(subjects, oldIndex, newIndex)
    subjectStorage.reorder(reordered.map(s => s.id))
    reload()
  }

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
      <div className="flex-1 px-4 pb-24 flex flex-col">
        <div className="flex-1">
          {subjects.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No subjects yet"
              description="Create a subject or import a JSON file to get started"
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={subjects.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {subjects.map(subject => (
                    <SortableItem key={subject.id} id={subject.id}>
                      {(dragHandleProps, isDragging) => (
                        <SubjectCard subject={subject} dragHandleProps={dragHandleProps} isDragging={isDragging} />
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="pt-6 text-center text-xs text-muted-foreground">
          Made by Bahaa
        </div>
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
