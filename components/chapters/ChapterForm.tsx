'use client'
import { useState } from 'react'
import type { Chapter } from '@/lib/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string }) => void
  initial?: Chapter
}

export function ChapterForm({ open, onClose, onSave, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-[360px] mx-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Chapter' : 'New Chapter'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <Input
              placeholder="Chapter name"
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
