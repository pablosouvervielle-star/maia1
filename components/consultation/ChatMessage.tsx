import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/ai.types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'
  const content = message.displayContent || message.content

  return (
    <div className={cn('flex gap-3 py-4', isAssistant ? 'items-start' : 'items-start flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isAssistant
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
          isAssistant
            ? 'bg-card border border-border rounded-tl-sm'
            : 'bg-primary text-primary-foreground rounded-tr-sm'
        )}
      >
        {content ? (
          <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
        ) : isStreaming ? (
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
          </div>
        ) : null}
        <span className="text-[10px] opacity-50 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
