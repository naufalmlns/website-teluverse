import { createAdminClient } from '@/utils/supabase/admin'
import { createMitra, deleteMitra } from './actions'

export default async function ManajemenMitraPage() {
  const supabaseAdmin = createAdminClient()

  // Gunakan Admin Client untuk bypass RLS, sehingga daftar mitra pasti muncul
  const { data: mitras } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'mitra')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-red-700">Manajemen Mitra</h2>
        <p className="text-gray-500 mt-2">Kelola akun untuk para Mitra / Tenant Campus Tour.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Tambah Mitra */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Tambah Akun Mitra</h3>
          <form action={createMitra} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Instansi</label>
              <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg p-2" placeholder="Cth: Open Library" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-lg p-2" placeholder="mitra@telkomuniversity.ac.id" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required minLength={6} className="w-full border border-gray-300 rounded-lg p-2" placeholder="Minimal 6 karakter" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Batas Waktu (Opsional)</label>
              <input type="datetime-local" name="expires_at" className="w-full border border-gray-300 rounded-lg p-2" />
              <p className="text-xs text-gray-500 mt-1">Kosongkan jika akun permanen.</p>
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition mt-4">
              Buat Akun
            </button>
          </form>
        </div>

        {/* Tabel Daftar Mitra */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Daftar Mitra Terdaftar</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 rounded-tl-lg">Nama Instansi</th>
                  <th className="p-3">Status / Expiry</th>
                  <th className="p-3">Dibuat Pada</th>
                  <th className="p-3 rounded-tr-lg text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mitras && mitras.length > 0 ? (
                  mitras.map((mitra) => {
                    return (
                      <tr key={mitra.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-semibold text-gray-800">{mitra.name}</div>
                          <div className="text-xs text-gray-500">{mitra.email || 'Email belum di-set'}</div>
                        </td>
                        <td className="p-3">
                          {mitra.expires_at ? (
                            new Date() > new Date(mitra.expires_at) ? (
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                ❌ Kedaluwarsa
                              </span>
                            ) : (
                              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs border border-orange-200">
                                Exp: {new Date(mitra.expires_at).toLocaleDateString('id-ID')} {new Date(mitra.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )
                          ) : (
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200">
                              ✅ Permanen
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(mitra.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3 text-right">
                          <form action={deleteMitra}>
                            <input type="hidden" name="userId" value={mitra.id} />
                            <button type="submit" className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition text-xs font-bold border border-red-200">
                              Hapus
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500 italic">Belum ada mitra yang terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
