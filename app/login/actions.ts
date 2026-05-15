'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=Email atau password salah.')
  }

  // Jika login berhasil, cek role di tabel profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  console.log("LOGIN DEBUG - User ID:", authData.user.id)
  console.log("LOGIN DEBUG - Profile Data:", profile)
  console.log("LOGIN DEBUG - Profile Error:", profileError)

  if (profile?.role === 'admin') {
    return redirect('/admin')
  } else if (profile?.role === 'mitra') {
    return redirect('/mitra')
  }

  // Default fallback
  return redirect('/')
}
