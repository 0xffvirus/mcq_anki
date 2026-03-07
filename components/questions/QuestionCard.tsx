'use client'
import type { Question } from '@/lib/types'

interface Props {
  question: Question
  onEdit: () => void
  onDelete: () => void
}

export function QuestionCard({ question, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
      <div className="flex items-start gap-2">
        <p className="text-sm font-medium text-foreground flex-1 leading-snug">{question.question}</p>
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

      <div className="grid grid-cols-2 gap-1.5">
        {(['A', 'B', 'C', 'D'] as const).map(opt => (
          <div
            key={opt}
            className={`rounded-lg px-2.5 py-1.5 text-xs flex gap-1.5 items-start ${
              opt === question.correctAnswer
                ? 'bg-green-500/15 text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="font-bold flex-shrink-0">{opt}.</span>
            <span className="leading-snug">{question.options[opt]}</span>
          </div>
        ))}
      </div>

      {question.explanation && (
        <p className="text-xs text-muted-foreground border-t border-border pt-2">
          {question.explanation}
        </p>
      )}
    </div>
  )
}
