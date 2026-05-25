'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Square, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  onAttach?: () => void
  isStreaming: boolean
  onStop: () => void
  disabled?: boolean
}

export function ChatInput({ onSend, onAttach, isStreaming, onStop, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    // Auto-resize textarea
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
        {onAttach && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 self-end mb-0.5"
            onClick={onAttach}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Describe symptoms, clinical findings, or ask a question... (Enter to send)"
          className={cn(
            'min-h-[44px] max-h-[180px] flex-1 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0 text-sm',
          )}
          disabled={disabled || isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="shrink-0 self-end"
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="shrink-0 self-end"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        MAIA provides clinical decision support — not a substitute for professional judgment
      </p>
    </div>
  )
}
