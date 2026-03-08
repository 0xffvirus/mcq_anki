import type { ReviewRecord, Quality } from './types'
import { now } from './utils'

export const QUALITY_MAP = {
  again: 0 as Quality,
  hard: 3 as Quality,
  good: 5 as Quality,
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

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    lastReviewed: now(),
    lastQuality: quality,
  }
}

export function isDue(record: ReviewRecord | undefined): boolean {
  return !record
}

export function isMastered(record: ReviewRecord | undefined): boolean {
  if (!record) return false
  return record.repetitions >= 3 && record.interval >= 7
}
