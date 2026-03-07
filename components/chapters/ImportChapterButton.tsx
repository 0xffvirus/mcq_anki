'use client'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { importChaptersToSubject } from '@/lib/storage'
import type { ChapterImportPayload } from '@/lib/types'

interface Props {
  subjectId: string
  onImport?: () => void
}

export function ImportChapterButton({ subjectId, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target?.result as string) as ChapterImportPayload
        if (!Array.isArray(payload.chapters)) {
          alert('Invalid format. Expected { "chapters": [...] }')
          return
        }
        const count = importChaptersToSubject(subjectId, payload)
        onImport?.()
        alert(`Imported ${count} chapter${count !== 1 ? 's' : ''} successfully.`)
      } catch {
        alert('Invalid JSON file. Please check the format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        className="border-border text-muted-foreground"
        onClick={() => inputRef.current?.click()}
      >
        Import Chapters
      </Button>
    </>
  )
}
