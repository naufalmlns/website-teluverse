import { createAdminClient } from '@/utils/supabase/admin'
import { createMitra } from './actions'
import ExpiryInput from './ExpiryInput'
import DeleteMitraForm from './DeleteMitraForm'
import Link from 'next/link'

export default async function ManajemenMitraPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  const supabaseAdmin = createAdminClient();

  // Ambil daftar mitra dengan paginasi
  const { data: mitras, count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'mitra')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">👥 Partner Accounts</h2>
          <p className="text-gray-500 mt-2">Kelola akses dan masa aktif untuk akun Mitra / Tenant Campus Tour.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM TAMBAH MITRA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">➕</span> Registrasi Mitra
            </h3>
            <form action={createMitra} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Instansi</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#9B0B0B] outline-none" placeholder="Cth: Open Library" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Mitra</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#9B0B0B] outline-none" placeholder="mitra@telkomuniversity.ac.id" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password Awal</label>
                <input type="password" name="password" required minLength={6} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#9B0B0B] outline-none" placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Masa Aktif (Opsional)</label>
                <ExpiryInput />
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Kosongkan jika akun ini bersifat permanen.</p>
              </div>
              <button type="submit" className="w-full bg-[#9B0B0B] hover:bg-red-900 text-white font-bold py-4 rounded-xl transition shadow-md mt-2 flex justify-center items-center gap-2">
                Buat Akun Partner
              </button>
            </form>
          </div>
        </div>

        {/* TABEL DAFTAR MITRA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Daftar Mitra Terdaftar</h3>
              <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500">
                Total: {count || 0}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 font-medium border-b border-gray-50">
                    <th className="p-5">Instansi</th>
                    <th className="p-5">Status / Expiry</th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mitras && mitras.length > 0 ? (
                    mitras.map((mitra) => {
                      const isExpired = mitra.expires_at && new Date() > new Date(mitra.expires_at);
                      return (
                        <tr key={mitra.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-5">
                            <div className="font-bold text-gray-900">{mitra.name}</div>
                            <div className="text-xs text-gray-400 font-medium">{mitra.email || 'No email set'}</div>
                          </td>
                          <td className="p-5">
                            {mitra.expires_at ? (
                              isExpired ? (
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Expired</span>
                                  <span className="text-xs text-gray-400 line-through">{new Date(mitra.expires_at).toLocaleDateString('id-ID')}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Active (Temporary)</span>
                                  <span className="text-xs text-gray-700 font-semibold">{new Date(mitra.expires_at).toLocaleDateString('id-ID')}</span>
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Active</span>
                                <span className="text-xs text-gray-700 font-semibold">Permanen</span>
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-right">
                            <DeleteMitraForm userId={mitra.id} name={mitra.name} />
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-gray-400 italic">Belum ada partner yang terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex gap-2">
                {currentPage > 1 ? (
                  <Link 
                    href={`/admin/mitra?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition border border-gray-200"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 bg-gray-50 text-gray-300 rounded-xl text-xs font-bold cursor-not-allowed border border-gray-100">
                    ← Previous
                  </button>
                )}

                {currentPage < totalPages ? (
                  <Link 
                    href={`/admin/mitra?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-[#9B0B0B] hover:bg-red-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-100"
                  >
                    Next →
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 bg-gray-50 text-gray-300 rounded-xl text-xs font-bold cursor-not-allowed border border-gray-100">
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
