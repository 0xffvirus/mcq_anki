import type { ReviewRecord, Quality } from './types'
import { now, today } from './utils'

export const QUALITY_MAP = {
  again: 0 as Quality,
  hard: 3 as Quality,
  good: 5 as Quality,
}

export function createInitialReview(questionId: string): ReviewRecord {
  return {
    questionId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: today(),
    lastReviewed: now(),
  }
}

export function applyReview(record: ReviewRecord, quality: Quality): ReviewRecord {
  let { easeFactor, interval, repetitions } = record

  if (quality < 3) {
    // Again: reset
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString().split('T')[0],
    lastReviewed: now(),
    lastQuality: quality,
  }
}

export function isDue(record: ReviewRecord | undefined): boolean {
  if (!record) return true
  return record.nextReviewDate <= today()
}

export function isMastered(record: ReviewRecord | undefined): boolean {
  if (!record) return false
  return record.repetitions >= 3 && record.interval >= 7
}
