import { login } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* LEFT PANEL - Branding (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#9B0B0B] flex-col justify-center items-center p-12 text-center text-white">
        {/* <div className="bg-white p-4 rounded-2xl mb-8 shadow-xl">
          {}
          <svg className="w-16 h-16 text-[#9B0B0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div> */}
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Tel-U Verse</h1>
        <p className="text-lg text-red-100 font-medium max-w-sm leading-relaxed">
          Empowering Smart Campus Management and Discovery
        </p>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-24 bg-white shadow-2xl z-10">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Admin & Tenant Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 text-[#9B0B0B] p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form action={login} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9B0B0B] focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="name@telkomuniversity.ac.id"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9B0B0B] focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                  {/* Ikon Mata (Static) */}
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-500 cursor-pointer font-medium">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#9B0B0B] focus:ring-[#9B0B0B] mr-2" />
                Remember me
              </label>
              <a href="#" className="font-bold text-[#9B0B0B] hover:text-red-900 transition">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#9B0B0B] hover:bg-red-900 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 mt-4 text-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-100 pt-6">
            Akses hanya untuk Administrator dan Mitra terdaftar.
          </div>
        </div>
      </div>
    </div>
  )
}
