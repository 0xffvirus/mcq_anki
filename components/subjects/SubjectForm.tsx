'use client'
import { useState } from 'react'
import type { Subject } from '@/lib/types'
import { randomColor } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const EMOJIS = ['📚', '🧬', '⚗️', '🧪', '🔬', '📐', '🌍', '💻', '🎯', '🏛️', '⚡', '🎨']

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void
  initial?: Subject
}

export function SubjectForm({ open, onClose, onSave, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '📚')
  const [color, setColor] = useState(initial?.color ?? randomColor())

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), emoji, color })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-[360px] mx-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Subject' : 'New Subject'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <Input
              placeholder="Subject name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="bg-muted border-border resize-none"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {['#6366f1','#8b5cf6','#ec4899','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {initial ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
