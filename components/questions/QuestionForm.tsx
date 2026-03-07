'use client'
import { useState, useEffect } from 'react'
import type { Question } from '@/lib/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Question, 'id' | 'chapterId' | 'createdAt' | 'updatedAt'>) => void
  initial?: Question
}

type OptionKey = 'A' | 'B' | 'C' | 'D'

export function QuestionForm({ open, onClose, onSave, initial }: Props) {
  const [questionText, setQuestionText] = useState(initial?.question ?? '')
  const [options, setOptions] = useState<Record<OptionKey, string>>(
    initial?.options ?? { A: '', B: '', C: '', D: '' }
  )
  const [correct, setCorrect] = useState<OptionKey>(initial?.correctAnswer ?? 'A')
  const [explanation, setExplanation] = useState(initial?.explanation ?? '')

  useEffect(() => {
    if (open) {
      setQuestionText(initial?.question ?? '')
      setOptions(initial?.options ?? { A: '', B: '', C: '', D: '' })
      setCorrect(initial?.correctAnswer ?? 'A')
      setExplanation(initial?.explanation ?? '')
    }
  }, [open, initial])

  const setOption = (key: OptionKey, val: string) =>
    setOptions(prev => ({ ...prev, [key]: val }))

  const isValid = questionText.trim() && (['A','B','C','D'] as OptionKey[]).every(k => options[k].trim())

  const handleSave = () => {
    if (!isValid) return
    onSave({
      question: questionText.trim(),
      options,
      correctAnswer: correct,
      explanation: explanation.trim(),
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-[360px] mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Question' : 'New Question'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Question</p>
            <Textarea
              placeholder="Enter question..."
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows={3}
              className="bg-muted border-border resize-none"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Options (tap to mark correct)</p>
            <div className="space-y-2">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => (
                <div key={key} className="flex gap-2 items-center">
                  <button
                    onClick={() => setCorrect(key)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0 flex items-center justify-center transition-colors ${
                      correct === key
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {key}
                  </button>
                  <Input
                    placeholder={`Option ${key}`}
                    value={options[key]}
                    onChange={e => setOption(key, e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Explanation (optional)</p>
            <Textarea
              placeholder="Explain the correct answer..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={2}
              className="bg-muted border-border resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {initial ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
