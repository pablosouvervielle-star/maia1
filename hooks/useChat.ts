'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { ChatMessage, DiagnosisUpdate, UploadedImage } from '@/types/ai.types'
import { stripJsonBlock } from '@/lib/anthropic/dental-prompt'

interface UseChatOptions {
  consultationId: string
  initialMessages?: ChatMessage[]
}

export function useChat({ consultationId, initialMessages = [] }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisUpdate | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const uploadedImageIds = uploadedImages
        .filter((img) => img.uploadedId)
        .map((img) => img.uploadedId!)

      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        displayContent: text,
        imageIds: uploadedImageIds,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Add streaming placeholder
      const streamingId = `assistant-streaming-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: streamingId,
          role: 'assistant',
          content: '',
          displayContent: '',
          createdAt: new Date().toISOString(),
        },
      ])
      setIsStreaming(true)
      setUploadedImages([])

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId,
            message: text,
            imageIds: uploadedImageIds,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                toast.error(`Error IA: ${data.error}`)
                setMessages((prev) => prev.filter((msg) => msg.id !== streamingId))
                setIsStreaming(false)
                return
              }

              if (data.text) {
                accumulatedText += data.text
                const displayText = stripJsonBlock(accumulatedText)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingId
                      ? { ...msg, content: accumulatedText, displayContent: displayText }
                      : msg
                  )
                )
              }

              if (data.done) {
                const finalDisplayText = stripJsonBlock(accumulatedText)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingId
                      ? {
                          ...msg,
                          id: data.messageId || streamingId,
                          content: accumulatedText,
                          displayContent: finalDisplayText,
                          diagnosis: data.diagnosis,
                        }
                      : msg
                  )
                )
                if (data.diagnosis) {
                  setCurrentDiagnosis(data.diagnosis)
                }
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return

        toast.error('Failed to get AI response. Please try again.')
        setMessages((prev) => prev.filter((msg) => msg.id !== streamingId))
      } finally {
        setIsStreaming(false)
      }
    },
    [consultationId, isStreaming, uploadedImages]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const addUploadedImage = useCallback((image: UploadedImage) => {
    setUploadedImages((prev) => [...prev, image])
  }, [])

  const removeUploadedImage = useCallback((id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  return {
    messages,
    isStreaming,
    currentDiagnosis,
    uploadedImages,
    sendMessage,
    stopStreaming,
    addUploadedImage,
    removeUploadedImage,
    setCurrentDiagnosis,
  }
}
