'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { getQuestionsByFilter } from '@/lib/storage'
import { chapterStorage } from '@/lib/storage'
import type { DifficultyFilter } from '@/lib/types'
import { useStudySession } from '@/hooks/useStudySession'
import { StudyProgress } from '@/components/study/StudyProgress'
import { MCQCard } from '@/components/study/MCQCard'
import { FeedbackOverlay } from '@/components/study/FeedbackOverlay'
import { BottomActions } from '@/components/study/BottomActions'
import { SessionComplete } from '@/components/study/SessionComplete'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

interface Props {
  params: { subjectId: string; chapterId: string }
}

export default function StudyPage({ params }: Props) {
  const { subjectId, chapterId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = (searchParams.get('filter') ?? 'due') as DifficultyFilter
  const dueQuestions = getQuestionsByFilter(chapterId, filter)
  const chapter = chapterStorage.get(chapterId)

  const { state, currentQuestion, selectedAnswer, index, total, stats, progress, selectAnswer, rate } =
    useStudySession(dueQuestions)

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    )
  }

  if (dueQuestions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen px-4 pt-12">
        <button onClick={() => router.back()} className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
          ← Back
        </button>
        <EmptyState
          icon="✅"
          title="No cards here"
          description={filter === 'due' ? 'All questions have been reviewed.' : `No cards rated as "${filter}" yet.`}
          action={
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    )
  }

  if (state === 'complete') {
    return (
      <div className="px-4 pt-12">
        <SessionComplete stats={stats} chapterId={chapterId} subjectId={subjectId} />
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="flex flex-col min-h-screen px-4 pt-10 pb-6">
      {/* Top nav */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground text-sm"
        >
          ✕
        </button>
        <div className="flex-1">
          <StudyProgress current={index} total={total} progress={progress} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4">
        <MCQCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelect={selectAnswer}
        />

        {state === 'feedback' && selectedAnswer && (
          <FeedbackOverlay question={currentQuestion} selectedAnswer={selectedAnswer} />
        )}
      </div>

      {/* Bottom actions */}
      {state === 'feedback' && (
        <div className="mt-4">
          <p className="text-xs text-center text-muted-foreground mb-3">How did you do?</p>
          <BottomActions onRate={rate} />
        </div>
      )}

      {state === 'question' && (
        <div className="mt-4 h-[116px]" />
      )}
    </div>
  )
}
