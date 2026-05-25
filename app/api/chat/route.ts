import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAnthropicClient, DENTAL_MODEL } from '@/lib/anthropic/client'
import {
  DENTAL_SYSTEM_PROMPT,
  buildDentalMessages,
  extractDiagnosisFromText,
  type PatientContext,
  type ChatHistoryMessage,
} from '@/lib/anthropic/dental-prompt'
import { encodeImagesForAI } from '@/lib/anthropic/image-encoder'
import { differenceInYears, parseISO } from 'date-fns'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const maxDuration = 120

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { consultationId, message, imageIds } = await request.json()

  if (!consultationId || !message) {
    return NextResponse.json({ error: 'consultationId and message are required' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Fetch consultation + patient context
  const { data: consultation, error: consultationError } = await admin
    .from('consultations')
    .select(`
      id, chief_complaint, patient_id,
      patients ( first_name, last_name, date_of_birth, gender, medical_history )
    `)
    .eq('id', consultationId)
    .eq('dentist_id', user.id)
    .single()

  if (consultationError || !consultation) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
  }

  const patient = consultation.patients as unknown as {
    first_name: string
    last_name: string
    date_of_birth: string | null
    gender: string | null
    medical_history: {
      conditions?: string[]
      medications?: string[]
      allergies?: string[]
      notes?: string
    } | null
  }

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null

  const patientContext: PatientContext = {
    firstName: patient.first_name,
    lastName: patient.last_name,
    age,
    gender: patient.gender,
    medicalHistory: patient.medical_history || {},
    chiefComplaint: consultation.chief_complaint || undefined,
  }

  // Fetch recent chat history (last 20 messages to manage context window)
  const { data: chatMessages } = await admin
    .from('chat_messages')
    .select('role, content')
    .eq('consultation_id', consultationId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: true })
    .limit(20)

  const chatHistory: ChatHistoryMessage[] = (chatMessages || []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Encode images if provided
  const encodedImages = imageIds?.length ? await encodeImagesForAI(imageIds) : []

  // Build messages for Claude
  const messages = buildDentalMessages(patientContext, chatHistory, message, encodedImages)

  // Save user message to DB
  await admin.from('chat_messages').insert({
    consultation_id: consultationId,
    role: 'user',
    content: message,
    has_images: (imageIds?.length ?? 0) > 0,
    image_ids: imageIds || [],
  })

  // Stream from Claude
  const anthropic = getAnthropicClient()
  const encoder = new TextEncoder()
  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: DENTAL_MODEL,
          max_tokens: 4096,
          system: DENTAL_SYSTEM_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: messages as any,
        })

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        // Extract diagnosis JSON from response
        const diagnosisData = extractDiagnosisFromText(fullResponse)

        // Save assistant message
        const { data: savedMessage } = await admin
          .from('chat_messages')
          .insert({
            consultation_id: consultationId,
            role: 'assistant',
            content: fullResponse,
          })
          .select('id')
          .single()

        // Save structured diagnosis if found
        if (diagnosisData) {
          await admin.from('diagnoses').upsert(
            {
              consultation_id: consultationId,
              patient_id: consultation.patient_id,
              dentist_id: user.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              conditions: (diagnosisData as any).conditions || [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recommended_treatments: (diagnosisData as any).recommended_treatments || [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              differential_diagnosis: (diagnosisData as any).differential_diagnosis || [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              red_flags: (diagnosisData as any).red_flags || [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              follow_up_recommendations: (diagnosisData as any).follow_up_recommendations || '',
              raw_ai_response: fullResponse,
            },
            { onConflict: 'consultation_id' }
          )
        }

        // Send done signal with diagnosis data
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              messageId: savedMessage?.id,
              diagnosis: diagnosisData,
            })}\n\n`
          )
        )
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
