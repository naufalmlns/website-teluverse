import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-black">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-extrabold text-red-700 tracking-tight">Super Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Tel-U Verse Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 text-gray-700 font-medium hover:bg-red-50 hover:text-red-700 rounded-xl transition">
            🎮 Game Mode
          </Link>
          <Link href="/admin/campus-tour" className="block px-4 py-3 text-gray-700 font-medium hover:bg-red-50 hover:text-red-700 rounded-xl transition">
            📍 Campus Tour
          </Link>
          <Link href="/admin/mitra" className="block px-4 py-3 text-gray-700 font-medium hover:bg-red-50 hover:text-red-700 rounded-xl transition">
            🏢 Manajemen Mitra
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <a href="/auth/logout" className="block w-full text-center px-4 py-3 bg-red-100 text-red-700 font-bold hover:bg-red-200 rounded-xl transition">
            Keluar
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
