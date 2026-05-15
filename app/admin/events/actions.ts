'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getAdminEvents() {
  const titleId = process.env.PLAYFAB_TITLE_ID
  const secretKey = process.env.PLAYFAB_SECRET_KEY

  if (!titleId || !secretKey) {
    console.error("PlayFab credentials missing")
    return { events: [] }
  }

  try {
    const getUrl = `https://${titleId}.playfabapi.com/Server/GetTitleData`
    const pfResponse = await fetch(getUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SecretKey': secretKey
      },
      body: JSON.stringify({ Keys: ["Events"] })
    })

    const data = await pfResponse.json()
    const titleData = data?.data?.Data as Record<string, string>

    if (titleData && titleData["Events"]) {
      try {
        const events = JSON.parse(titleData["Events"])
        return { events: events || [] }
      } catch (e) {
        console.error("Failed to parse PlayFab Events JSON", e)
      }
    }
  } catch (error) {
    console.error("Fetch Admin Events Error:", error)
  }

  return { events: [] }
}

export async function deleteEventAsAdmin(eventId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // 1. Get the image url to delete from Storage
  const { data: evt } = await supabase
    .from('temporary_events')
    .select('image_url')
    .eq('id', eventId)
    .single()

  if (evt?.image_url && !evt.image_url.includes('picsum')) {
    const urlParts = evt.image_url.split('/event-posters/')
    if (urlParts.length > 1) {
      const path = urlParts[1]
      await supabase.storage.from('event-posters').remove([path])
    }
  }

  // 2. Delete from DB
  const { error } = await supabase
    .from('temporary_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error("Admin Delete Error:", error)
    return { error: 'Gagal menghapus event dari Database.' }
  }

  // 3. Trigger Sync PlayFab
  try {
    const { POST: runSync } = await import('@/app/api/mitra/events/sync/route')
    const res = await runSync()
    const data = await res.json()
    console.log("Admin Sync response:", data)
  } catch (err) {
    console.error("Trigger sync failed:", err)
  }

  revalidatePath('/admin/events')
  return { success: true }
}
