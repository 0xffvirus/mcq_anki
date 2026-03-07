'use client'
import type { Quality } from '@/lib/types'

interface Props {
  onRate: (quality: Quality) => void
}

export function BottomActions({ onRate }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onRate(0)}
        className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-red-500/15 text-red-400 active:scale-[0.96] transition-transform border border-red-500/30"
      >
        <span className="text-lg">🔁</span>
        <span className="text-xs font-semibold mt-1">Again</span>
      </button>
      <button
        onClick={() => onRate(3)}
        className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-orange-500/15 text-orange-400 active:scale-[0.96] transition-transform border border-orange-500/30"
      >
        <span className="text-lg">😐</span>
        <span className="text-xs font-semibold mt-1">Hard</span>
      </button>
      <button
        onClick={() => onRate(5)}
        className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-green-500/15 text-green-400 active:scale-[0.96] transition-transform border border-green-500/30"
      >
        <span className="text-lg">✅</span>
        <span className="text-xs font-semibold mt-1">Good</span>
      </button>
    </div>
  )
}
