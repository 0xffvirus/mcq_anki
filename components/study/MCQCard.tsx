'use client'
import type { Question } from '@/lib/types'

interface Props {
  question: Question
  selectedAnswer: string | null
  onSelect: (answer: string) => void
}

type OptionKey = 'A' | 'B' | 'C' | 'D'

export function MCQCard({ question, selectedAnswer, onSelect }: Props) {
  const isRevealed = selectedAnswer !== null

  const getOptionStyle = (key: OptionKey) => {
    if (!isRevealed) return 'bg-muted hover:bg-muted/70 text-foreground border border-transparent active:scale-[0.98]'
    if (key === question.correctAnswer) return 'bg-green-500/20 border-green-500 text-green-300'
    if (key === selectedAnswer) return 'bg-red-500/20 border-red-500 text-red-300'
    return 'bg-muted text-muted-foreground border border-transparent opacity-60'
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-5 border border-border min-h-[120px] flex items-center">
        <p className="text-base font-medium text-foreground leading-snug">{question.question}</p>
      </div>

      <div className="space-y-2.5">
        {(['A', 'B', 'C', 'D'] as OptionKey[]).filter(key => question.options[key]?.trim()).map(key => (
          <button
            key={key}
            disabled={isRevealed}
            onClick={() => onSelect(key)}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm flex gap-3 items-start transition-all border ${getOptionStyle(key)}`}
          >
            <span className="font-bold flex-shrink-0 mt-0.5">{key}.</span>
            <span className="leading-snug">{question.options[key]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
