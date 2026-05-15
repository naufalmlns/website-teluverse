'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { cookies } from 'next/headers'

export async function createEvent(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized. Please login again.' }
  }

  // Ambil data dari FormData
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const q1Question = formData.get('q1_question') as string
  const q2Question = formData.get('q2_question') as string
  const q1Answer = formData.get('q1_answer') as string
  const q2Answer = formData.get('q2_answer') as string

  // Ambil file image
  const posterFile = formData.get('poster') as File
  let image_url = ''

  if (posterFile && posterFile.size > 0) {
    const fileExt = posterFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('event-posters')
      .upload(fileName, posterFile, { upsert: true })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Gagal mengunggah poster.' }
    }

    const { data: urlData } = supabase.storage
      .from('event-posters')
      .getPublicUrl(fileName)
    image_url = urlData.publicUrl
  }

  if (!image_url) {
    image_url = 'https://picsum.photos/512' // Fallback
  }

  // Construct Quiz JSON
  const quizData = {
    quests: [
      {
        questId: "q1",
        question: q1Question,
        options: [
          formData.get('q1_opt1'), formData.get('q1_opt2'), formData.get('q1_opt3'), formData.get('q1_opt4')
        ],
        answer: q1Answer
      },
      {
        questId: "q2",
        question: q2Question,
        options: [
          formData.get('q2_opt1'), formData.get('q2_opt2'), formData.get('q2_opt3'), formData.get('q2_opt4')
        ],
        answer: q2Answer
      }
    ]
  }

  const newId = `evt_${Date.now()}`

  const { error } = await supabase
    .from('temporary_events')
    .insert({
      id: newId,
      user_id: user.id,
      title,
      description,
      location,
      start_date,
      end_date,
      image_url,
      quiz: quizData
    })

  if (error) {
    console.error('Insert Event Error:', error)
    return { error: 'Gagal menyimpan event ke Database.' }
  }

  // Trigger Sync ke PlayFab
  await triggerSync()

  revalidatePath('/mitra')
  return { success: true }
}

export async function updateEvent(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const eventId = formData.get('event_id') as string
  if (!eventId) return { error: 'Event ID missing.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const q1Question = formData.get('q1_question') as string
  const q2Question = formData.get('q2_question') as string
  const q1Answer = formData.get('q1_answer') as string
  const q2Answer = formData.get('q2_answer') as string

  let image_url = formData.get('existing_image_url') as string
  const posterFile = formData.get('poster') as File

  if (posterFile && posterFile.size > 0) {
    const fileExt = posterFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('event-posters')
      .upload(fileName, posterFile, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('event-posters')
        .getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }
  }

  const quizData = {
    quests: [
      {
        questId: "q1",
        question: q1Question,
        options: [
          formData.get('q1_opt1'), formData.get('q1_opt2'), formData.get('q1_opt3'), formData.get('q1_opt4')
        ],
        answer: q1Answer
      },
      {
        questId: "q2",
        question: q2Question,
        options: [
          formData.get('q2_opt1'), formData.get('q2_opt2'), formData.get('q2_opt3'), formData.get('q2_opt4')
        ],
        answer: q2Answer
      }
    ]
  }

  const { error } = await supabase
    .from('temporary_events')
    .update({
      title,
      description,
      location,
      start_date,
      end_date,
      image_url,
      quiz: quizData
    })
    .eq('id', eventId)
    .eq('user_id', user.id) // Ensure they only update their own event

  if (error) {
    console.error('Update Event Error:', error)
    return { error: 'Gagal update event ke Database.' }
  }

  // Trigger Sync ke PlayFab
  await triggerSync()

  revalidatePath('/mitra')
  return { success: true }
}

export async function deleteEvent(eventId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  // Ambil URL gambar sebelum dihapus untuk dihapus dari Storage
  const { data: evt } = await supabase
    .from('temporary_events')
    .select('image_url')
    .eq('id', eventId)
    .single()

  if (evt?.image_url && !evt.image_url.includes('picsum')) {
    // Ekstrak nama file dari public URL
    const urlParts = evt.image_url.split('/event-posters/')
    if (urlParts.length > 1) {
      const path = urlParts[1]
      await supabase.storage.from('event-posters').remove([path])
    }
  }

  // Hapus dari DB
  const { error } = await supabase
    .from('temporary_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id) // Security check

  if (error) {
    return { error: 'Gagal menghapus event dari Database.' }
  }

  // Sync ulang
  await triggerSync()

  revalidatePath('/mitra')
  return { success: true }
}

import { POST as runSync } from '@/app/api/mitra/events/sync/route'

async function triggerSync() {
  try {
    const res = await runSync()
    const data = await res.json()
    console.log("Sync response:", data)
  } catch (err) {
    console.error("Trigger sync failed:", err)
  }
}
