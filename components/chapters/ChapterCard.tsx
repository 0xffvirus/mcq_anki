'use client'
import { useRouter } from 'next/navigation'
import type { Chapter } from '@/lib/types'
import { questionStorage, reviewStorage, getQuestionsForReview } from '@/lib/storage'
import { isMastered } from '@/lib/sm2'

interface Props {
  chapter: Chapter
  subjectId: string
  onEdit: () => void
  onDelete: () => void
}

export function ChapterCard({ chapter, subjectId, onEdit, onDelete }: Props) {
  const router = useRouter()
  const questions = questionStorage.getByChapter(chapter.id)
  const due = getQuestionsForReview(chapter.id).length
  const reviews = reviewStorage.getAll()
  const reviewMap = new Map(reviews.map(r => [r.questionId, r]))
  const mastered = questions.filter(q => isMastered(reviewMap.get(q.id))).length
  const masteryPercent = questions.length > 0 ? Math.round((mastered / questions.length) * 100) : 0

  return (
    <div
      className="bg-card rounded-2xl p-4 border border-border cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => router.push(`/subjects/${subjectId}/chapters/${chapter.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{chapter.name}</p>
          {chapter.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{chapter.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive text-xs"
            onClick={onDelete}
          >
            Del
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{questions.length} cards</span>
          {due > 0 ? (
            <span className="text-amber-400 font-medium">{due} due</span>
          ) : (
            <span className="text-green-500">{masteryPercent}% mastered</span>
          )}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${masteryPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
