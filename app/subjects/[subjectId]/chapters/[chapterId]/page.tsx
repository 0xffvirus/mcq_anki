'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestions } from '@/hooks/useQuestions'
import { chapterStorage, getDifficultyCount } from '@/lib/storage'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { QuestionForm } from '@/components/questions/QuestionForm'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import type { Question, DifficultyFilter } from '@/lib/types'

interface Props {
  params: { subjectId: string; chapterId: string }
}

const FILTERS: { key: DifficultyFilter; label: string; color: string; activeClass: string }[] = [
  { key: 'due',   label: 'Due',   color: 'text-amber-400',  activeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300' },
  { key: 'again', label: 'Again', color: 'text-red-400',    activeClass: 'bg-red-500/20 border-red-500/50 text-red-300' },
  { key: 'hard',  label: 'Hard',  color: 'text-orange-400', activeClass: 'bg-orange-500/20 border-orange-500/50 text-orange-300' },
  { key: 'good',  label: 'Good',  color: 'text-green-400',  activeClass: 'bg-green-500/20 border-green-500/50 text-green-300' },
  { key: 'all',   label: 'All',   color: 'text-muted-foreground', activeClass: 'bg-muted border-border text-foreground' },
]

export default function ChapterPage({ params }: Props) {
  const { subjectId, chapterId } = params
  const router = useRouter()
  const { questions, createQuestion, updateQuestion, deleteQuestion } = useQuestions(chapterId)
  const chapter = chapterStorage.get(chapterId)

  const [formOpen, setFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
  const [filter, setFilter] = useState<DifficultyFilter>('due')

  const counts = getDifficultyCount(chapterId)
  const selectedCount = counts[filter]

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    )
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this question?')) return
    deleteQuestion(id)
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

        <h1 className="text-xl font-bold text-foreground">{chapter.name}</h1>
        {chapter.description && (
          <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
        )}

        {questions.length > 0 && (
          <div className="mt-4 space-y-3">
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    filter === f.key
                      ? f.activeClass
                      : 'bg-transparent border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold ${filter === f.key ? '' : f.color}`}>
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={selectedCount === 0}
              onClick={() => router.push(`/subjects/${subjectId}/chapters/${chapterId}/study?filter=${filter}`)}
            >
              {selectedCount > 0 ? `Study ${selectedCount} ${FILTERS.find(f => f.key === filter)?.label} cards` : 'No cards in this filter'}
            </Button>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="flex-1 px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{questions.length} questions</p>
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon="❓"
            title="No questions yet"
            description="Add questions to start studying"
          />
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                onEdit={() => { setEditingQuestion(q); setFormOpen(true) }}
                onDelete={() => handleDelete(q.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingQuestion(undefined); setFormOpen(true) }}
        className="fixed bottom-8 right-1/2 translate-x-1/2 w-[calc(390px-64px)] max-w-[326px] h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
      >
        <span className="text-xl">+</span>
        New Question
      </button>

      <QuestionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingQuestion(undefined) }}
        initial={editingQuestion}
        onSave={data => {
          if (editingQuestion) {
            updateQuestion(editingQuestion.id, data)
          } else {
            createQuestion({ ...data, chapterId } as Omit<Question, 'id' | 'createdAt' | 'updatedAt'>)
          }
        }}
      />
    </div>
  )
}
