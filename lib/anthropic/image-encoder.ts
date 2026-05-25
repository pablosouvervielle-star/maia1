import { createClient } from '@/lib/supabase/server'
import type { EncodedImage } from './dental-prompt'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number]

export async function encodeImagesForAI(imageIds: string[]): Promise<EncodedImage[]> {
  if (!imageIds || imageIds.length === 0) return []

  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('images')
    .select('storage_path, storage_bucket, mime_type, file_name')
    .in('id', imageIds)

  if (error || !images) return []

  const encoded: EncodedImage[] = []

  for (const image of images) {
    try {
      const mime = image.mime_type as string
      if (!ALLOWED_MIME_TYPES.includes(mime as AllowedMime)) continue

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(image.storage_bucket || 'dental-images')
        .download(image.storage_path)

      if (downloadError || !fileData) continue

      const arrayBuffer = await fileData.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      encoded.push({
        mimeType: mime as AllowedMime,
        base64Data: base64,
      })
    } catch {
      // Skip failed images, continue with others
    }
  }

  return encoded
}
