'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Stats {
  again: number
  hard: number
  good: number
  total: number
}

interface Props {
  stats: Stats
  chapterId: string
  subjectId: string
}

export function SessionComplete({ stats, chapterId, subjectId }: Props) {
  const router = useRouter()
  const score = stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="text-6xl">{score >= 80 ? '🎉' : score >= 50 ? '💪' : '📖'}</div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>
        <p className="text-muted-foreground mt-1">{stats.total} cards reviewed</p>
      </div>

      <div className="w-full grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{stats.good}</p>
          <p className="text-xs text-muted-foreground mt-1">Good</p>
        </div>
        <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20">
          <p className="text-2xl font-bold text-orange-400">{stats.hard}</p>
          <p className="text-xs text-muted-foreground mt-1">Hard</p>
        </div>
        <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
          <p className="text-2xl font-bold text-red-400">{stats.again}</p>
          <p className="text-xs text-muted-foreground mt-1">Again</p>
        </div>
      </div>

      <div className="w-full space-y-2">
        <Button
          className="w-full"
          onClick={() => router.push(`/subjects/${subjectId}/chapters/${chapterId}`)}
        >
          Back to Chapter
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => router.push('/')}
        >
          Home
        </Button>
      </div>
    </div>
  )
}
