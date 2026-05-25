'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { UploadedImage } from '@/types/ai.types'

interface UseImageUploadOptions {
  consultationId: string
  patientId: string
  onImageUploaded?: (image: UploadedImage) => void
}

export function useImageUpload({ consultationId, patientId, onImageUploaded }: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false)

  const uploadImage = useCallback(
    async (file: File, imageType = 'other'): Promise<UploadedImage | null> => {
      const localId = `local-${Date.now()}`
      const preview = URL.createObjectURL(file)

      const localImage: UploadedImage = { id: localId, file, preview, imageType }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('consultation_id', consultationId)
        formData.append('patient_id', patientId)
        formData.append('image_type', imageType)

        const res = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Upload failed')
        }

        const { image } = await res.json()
        const uploadedImage: UploadedImage = {
          ...localImage,
          uploadedId: image.id,
          preview: image.signedUrl || preview,
        }

        onImageUploaded?.(uploadedImage)
        return uploadedImage
      } catch (error) {
        toast.error(`Upload failed: ${(error as Error).message}`)
        return null
      } finally {
        setUploading(false)
      }
    },
    [consultationId, patientId, onImageUploaded]
  )

  return { uploading, uploadImage }
}
