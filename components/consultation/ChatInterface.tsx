'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { DiagnosisPanel } from './DiagnosisPanel'
import { ImageUploadZone } from './ImageUploadZone'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

interface ConsultationPatient {
  id: string
  first_name: string
  last_name: string
}

interface ChatInterfaceProps {
  consultationId: string
  patient: ConsultationPatient
}

export function ChatInterface({ consultationId, patient }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)

  const {
    messages,
    isStreaming,
    currentDiagnosis,
    uploadedImages,
    sendMessage,
    stopStreaming,
    addUploadedImage,
    removeUploadedImage,
  } = useChat({ consultationId })

  const { uploading, uploadImage } = useImageUpload({
    consultationId,
    patientId: patient.id,
    onImageUploaded: addUploadedImage,
  })

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleImageDrop(files: File[]) {
    for (const file of files) {
      await uploadImage(file)
    }
    toast.success(`${files.length} image(s) ready to send`)
  }

  return (
    <div className="flex h-full">
      {/* Chat panel */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <p className="text-sm font-medium">
              {patient.first_name} {patient.last_name}
            </p>
            <p className="text-xs text-muted-foreground">AI Consultation</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">Start the consultation</p>
                <p className="text-xs mt-1 max-w-xs">
                  Describe the chief complaint, symptoms, and clinical findings. Attach X-rays if available.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Image upload zone */}
        {showImageUpload && (
          <>
            <Separator />
            <div className="py-2">
              <ImageUploadZone
                images={uploadedImages}
                onDrop={handleImageDrop}
                onRemove={removeUploadedImage}
                uploading={uploading}
              />
            </div>
          </>
        )}

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onAttach={() => setShowImageUpload(!showImageUpload)}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </div>

      {/* Diagnosis panel — desktop only */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-col border-l border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Stethoscope className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Diagnosis</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <DiagnosisPanel diagnosis={currentDiagnosis} className="h-full" />
        </div>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Tabs defaultValue="chat">
          <TabsList className="w-full rounded-none border-t">
            <TabsTrigger value="chat" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="flex-1">
              <Stethoscope className="h-4 w-4 mr-1" />
              Diagnosis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="diagnosis" className="h-64 bg-background border-t">
            <DiagnosisPanel diagnosis={currentDiagnosis} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
