import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ambil data user yang sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/mitra');

  if (isAuthRoute) {
    // 1. Cek apakah user sudah login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // 2. Ambil data profil dari tabel profiles untuk mengecek role & expiry date
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, expires_at')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Jika login tapi tidak punya profil di public.profiles
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isMitraRoute = request.nextUrl.pathname.startsWith('/mitra');

    // 3. Cek Role Admin
    if (isAdminRoute && profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      // Lempar ke dashboard mitra atau landing page jika bukan admin
      url.pathname = profile.role === 'mitra' ? '/mitra' : '/'; 
      return NextResponse.redirect(url);
    }

    // 4. Cek Role Mitra (Admin juga boleh masuk ke rute mitra jika diperlukan)
    if (isMitraRoute && profile.role !== 'mitra' && profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // 5. Cek Expiry Date untuk Mitra
    if (profile.role === 'mitra' && profile.expires_at) {
      const now = new Date();
      const expiryDate = new Date(profile.expires_at);
      
      if (now > expiryDate) {
        // Akun sudah expired
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'Akun Anda sudah kedaluwarsa.');
        
        // Opsional: Sign out otomatis
        // await supabase.auth.signOut();
        
        // Gunakan redirect dengan custom response agar session cookies terhapus
        let expiredResponse = NextResponse.redirect(url);
        // Copy cookies configuration for logout if necessary, but just redirect is fine for now
        return expiredResponse;
      }
    }
  }

  return supabaseResponse;
}
