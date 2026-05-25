import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const consultationId = formData.get('consultation_id') as string
  const patientId = formData.get('patient_id') as string
  const imageType = (formData.get('image_type') as string) || 'other'

  if (!file || !consultationId || !patientId) {
    return NextResponse.json({ error: 'file, consultation_id, and patient_id are required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 20MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${consultationId}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('dental-images')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: imageRecord, error: dbError } = await supabase
    .from('images')
    .insert({
      consultation_id: consultationId,
      patient_id: patientId,
      dentist_id: user.id,
      storage_path: storagePath,
      storage_bucket: 'dental-images',
      image_type: imageType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Get signed URL for preview
  const { data: signedUrl } = await supabase.storage
    .from('dental-images')
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({
    image: {
      ...imageRecord,
      signedUrl: signedUrl?.signedUrl,
    },
  }, { status: 201 })
}
