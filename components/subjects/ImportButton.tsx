'use client'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { importFromJSON } from '@/lib/storage'
import type { ImportPayload } from '@/lib/types'

interface Props {
  onImport?: () => void
}

export function ImportButton({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target?.result as string) as ImportPayload
        importFromJSON(payload)
        onImport?.()
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
        Import JSON
      </Button>
    </>
  )
}
