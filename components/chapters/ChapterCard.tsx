'use client'
import { useRouter } from 'next/navigation'
import type { Chapter } from '@/lib/types'
import { questionStorage, reviewStorage } from '@/lib/storage'

interface Props {
  chapter: Chapter
  subjectId: string
  onEdit: () => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  isDragging?: boolean
}

export function ChapterCard({ chapter, subjectId, onEdit, onDelete, dragHandleProps, isDragging }: Props) {
  const router = useRouter()
  const questions = questionStorage.getByChapter(chapter.id)
  const total = questions.length
  const reviews = reviewStorage.getAll()
  const reviewMap = new Map(reviews.map(r => [r.questionId, r]))

  const again      = questions.filter(q => reviewMap.get(q.id)?.lastQuality === 0).length
  const hard       = questions.filter(q => reviewMap.get(q.id)?.lastQuality === 3).length
  const good       = questions.filter(q => reviewMap.get(q.id)?.lastQuality === 5).length
  const unreviewed = questions.filter(q => !reviewMap.get(q.id)).length

  const pct = (n: number) => total > 0 ? (n / total) * 100 : 0

  const segments = [
    { value: pct(unreviewed), color: '#f59e0b' },  // amber - new/unreviewed
    { value: pct(again),      color: '#ef4444' },  // red - again
    { value: pct(hard),       color: '#f97316' },  // orange - hard
    { value: pct(good),       color: '#22c55e' },  // green - good
  ]

  return (
    <div className={`bg-card rounded-2xl p-4 border border-border transition-shadow ${isDragging ? 'shadow-2xl shadow-black/60' : ''}`}>
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="touch-none flex-shrink-0 flex flex-col gap-[3px] px-1 pt-1 cursor-grab active:cursor-grabbing mt-0.5"
        >
          {[0,1,2].map(i => (
            <div key={i} className="w-4 h-[2px] rounded-full bg-muted-foreground/40" />
          ))}
        </div>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/subjects/${subjectId}/chapters/${chapter.id}`)}
        >
          <p className="font-semibold text-foreground truncate">{chapter.name}</p>
          {chapter.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{chapter.description}</p>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
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
        <p className="text-xs text-muted-foreground">{total} cards</p>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
          {segments.map((seg, i) =>
            seg.value > 0 ? (
              <div
                key={i}
                className="h-full transition-all"
                style={{ width: `${seg.value}%`, backgroundColor: seg.color }}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
