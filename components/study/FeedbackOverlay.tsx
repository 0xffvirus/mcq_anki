'use client'
import type { Question } from '@/lib/types'

interface Props {
  question: Question
  selectedAnswer: string
}

export function FeedbackOverlay({ question, selectedAnswer }: Props) {
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className={`rounded-2xl p-4 border ${
      isCorrect
        ? 'bg-green-500/10 border-green-500/40'
        : 'bg-red-500/10 border-red-500/40'
    }`}>
      <p className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
        {isCorrect ? 'Correct!' : `Incorrect — Answer is ${question.correctAnswer}`}
      </p>
      {question.explanation && (
        <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
      )}
    </div>
  )
}
