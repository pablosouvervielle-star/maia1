'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UploadedImage } from '@/types/ai.types'
import Image from 'next/image'

interface ImageUploadZoneProps {
  images: UploadedImage[]
  onDrop: (files: File[]) => void
  onRemove: (id: string) => void
  uploading: boolean
  maxImages?: number
}

export function ImageUploadZone({
  images,
  onDrop,
  onRemove,
  uploading,
  maxImages = 10,
}: ImageUploadZoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxImages - images.length
      onDrop(acceptedFiles.slice(0, remaining))
    },
    [images.length, maxImages, onDrop]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 20 * 1024 * 1024,
    disabled: images.length >= maxImages || uploading,
    multiple: true,
  })

  return (
    <div className="space-y-2">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={img.preview}
                  alt={img.file.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              {img.uploadedId ? null : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(img.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone (compact) */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            'mx-4 flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 cursor-pointer text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary',
            isDragActive && 'border-primary text-primary bg-primary/5'
          )}
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-4 w-4 shrink-0" />
          <span>
            {isDragActive
              ? 'Drop images here'
              : 'Attach X-rays or intraoral photos (drag & drop or click)'}
          </span>
          {uploading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </div>
      )}
    </div>
  )
}
