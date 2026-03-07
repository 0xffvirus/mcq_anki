'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useChapters } from '@/hooks/useChapters'
import { useSubjects } from '@/hooks/useSubjects'
import { chapterStorage } from '@/lib/storage'
import { ChapterCard } from '@/components/chapters/ChapterCard'
import { ChapterForm } from '@/components/chapters/ChapterForm'
import { ImportChapterButton } from '@/components/chapters/ImportChapterButton'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { SortableItem } from '@/components/SortableItem'
import { EmptyState } from '@/components/EmptyState'
import type { Chapter } from '@/lib/types'

interface Props {
  params: { subjectId: string }
}

export default function SubjectPage({ params }: Props) {
  const { subjectId } = params
  const router = useRouter()
  const { subjects, updateSubject, deleteSubject } = useSubjects()
  const { chapters, createChapter, updateChapter, deleteChapter, reload } = useChapters(subjectId)

  const subject = subjects.find(s => s.id === subjectId)

  const [chapterFormOpen, setChapterFormOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | undefined>()
  const [subjectFormOpen, setSubjectFormOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = chapters.findIndex(c => c.id === active.id)
    const newIndex = chapters.findIndex(c => c.id === over.id)
    const reordered = arrayMove(chapters, oldIndex, newIndex)
    chapterStorage.reorder(reordered.map(c => c.id))
    reload()
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Subject not found</p>
      </div>
    )
  }

  const handleDeleteSubject = () => {
    if (!confirm('Delete this subject and all its chapters and questions?')) return
    deleteSubject(subjectId)
    router.push('/')
  }

  const handleDeleteChapter = (id: string) => {
    if (!confirm('Delete this chapter and all its questions?')) return
    deleteChapter(id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground text-sm mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: subject.color + '22' }}
          >
            {subject.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{subject.name}</h1>
            {subject.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{subject.description}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setSubjectFormOpen(true)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteSubject}
              className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive text-sm"
            >
              Del
            </button>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex-1 px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{chapters.length} chapters</p>
          <ImportChapterButton subjectId={subjectId} onImport={reload} />
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No chapters yet"
            description="Add a chapter to organize your questions"
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {chapters.map(chapter => (
                  <SortableItem key={chapter.id} id={chapter.id}>
                    {(dragHandleProps, isDragging) => (
                      <ChapterCard
                        chapter={chapter}
                        subjectId={subjectId}
                        onEdit={() => { setEditingChapter(chapter); setChapterFormOpen(true) }}
                        onDelete={() => handleDeleteChapter(chapter.id)}
                        dragHandleProps={dragHandleProps}
                        isDragging={isDragging}
                      />
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingChapter(undefined); setChapterFormOpen(true) }}
        className="fixed bottom-8 right-1/2 translate-x-1/2 w-[calc(390px-64px)] max-w-[326px] h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
      >
        <span className="text-xl">+</span>
        New Chapter
      </button>

      <ChapterForm
        open={chapterFormOpen}
        onClose={() => { setChapterFormOpen(false); setEditingChapter(undefined) }}
        initial={editingChapter}
        onSave={data => {
          if (editingChapter) {
            updateChapter(editingChapter.id, data)
          } else {
            createChapter({ ...data, subjectId, order: chapters.length } as Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>)
          }
        }}
      />

      <SubjectForm
        open={subjectFormOpen}
        onClose={() => setSubjectFormOpen(false)}
        initial={subject}
        onSave={data => updateSubject(subjectId, data)}
      />
    </div>
  )
}
