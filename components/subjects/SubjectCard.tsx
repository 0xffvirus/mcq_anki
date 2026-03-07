'use client'
import { useRouter } from 'next/navigation'
import type { Subject } from '@/lib/types'
import { ProgressRing } from '@/components/ProgressRing'
import { questionStorage, reviewStorage, getQuestionsForReview } from '@/lib/storage'
import { chapterStorage } from '@/lib/storage'
import { isMastered } from '@/lib/sm2'

interface Props {
  subject: Subject
}

function getSubjectStats(subjectId: string) {
  const chapters = chapterStorage.getBySubject(subjectId)
  let total = 0
  let due = 0
  let mastered = 0
  const reviews = reviewStorage.getAll()
  const reviewMap = new Map(reviews.map(r => [r.questionId, r]))

  chapters.forEach(ch => {
    const questions = questionStorage.getByChapter(ch.id)
    total += questions.length
    questions.forEach(q => {
      if (isMastered(reviewMap.get(q.id))) mastered++
    })
    due += getQuestionsForReview(ch.id).length
  })

  return {
    total,
    due,
    mastered,
    masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
  }
}

export function SubjectCard({ subject }: Props) {
  const router = useRouter()
  const stats = getSubjectStats(subject.id)

  return (
    <div
      className="bg-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform border border-border"
      onClick={() => router.push(`/subjects/${subject.id}`)}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: subject.color + '22' }}
      >
        {subject.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{subject.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {stats.total} cards
          {stats.due > 0 && (
            <span className="ml-2 text-amber-400 font-medium">{stats.due} due</span>
          )}
        </p>
      </div>

      <ProgressRing
        percent={stats.masteryPercent}
        size={44}
        strokeWidth={3}
        color={subject.color}
      />
    </div>
  )
}
