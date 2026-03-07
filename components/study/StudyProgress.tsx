'use client'
import { Progress } from '@/components/ui/progress'

interface Props {
  current: number
  total: number
  progress: number
}

export function StudyProgress({ current, total, progress }: Props) {
  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Card {current + 1} of {total}</span>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  )
}
