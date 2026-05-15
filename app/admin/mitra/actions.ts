'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createMitra(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const expiresAtRaw = formData.get('expires_at') as string

  if (!email || !password || !name) {
    console.error('Missing required fields')
    return
  }

  const expires_at = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null

  // Membuat user baru menggunakan Admin API, sehingga tidak melogout Admin saat ini
  const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  if (error) {
    console.error('Error creating user:', error)
    return
  }

  // JAMINAN KEBERHASILAN:
  // Supabase Trigger akan merespon dengan "User Baru".
  // Maka dari itu, kita TIMPA (update) baris profile tersebut langsung dari server!
  if (authData?.user) {
    await supabaseAdmin.from('profiles').update({
      name: name,
      email: email, // Memasukkan email ke public.profiles agar mudah ditampilkan
      expires_at: expires_at
    }).eq('id', authData.user.id)
  }

  revalidatePath('/admin/mitra')
}

export async function deleteMitra(formData: FormData) {
  const userId = formData.get('userId') as string
  if (!userId) return

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error deleting user:', error)
    return
  }

  // Karena onDelete Cascade, menghapus auth user juga akan menghapus data di tabel profiles
  revalidatePath('/admin/mitra')
}
