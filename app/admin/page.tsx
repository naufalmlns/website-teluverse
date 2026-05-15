import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';

export default async function AdminDashboardOverview() {
  // Ambil data dari Supabase
  const supabaseAdmin = createAdminClient();
  
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mitra');

  // Ambil data Mode dari PlayFab
  const titleId = process.env.PLAYFAB_TITLE_ID; 
  const secretKey = process.env.PLAYFAB_SECRET_KEY;
  let activeMode = "Normal";

  try {
    const getUrl = `https://${titleId}.playfabapi.com/Server/GetTitleData`;
    const getResponse = await fetch(getUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-SecretKey': secretKey || '' 
        },
        body: JSON.stringify({
            Keys: ["Mode"] 
        }),
        next: { revalidate: 0 } // Jangan di-cache agar selalu terbaru
    });
    const getData = await getResponse.json();
    const titleData = getData?.data?.Data as Record<string, string>;
    
    if (titleData && titleData["Mode"]) {
        try {
            const modeObj = JSON.parse(titleData["Mode"]);
            activeMode = modeObj.Active || "Normal";
        } catch (e) { activeMode = titleData["Mode"]; }
    }
  } catch (err) {
    console.error("Gagal fetch mode dari PlayFab", err);
  }

  // Ambil 20 mitra terbaru untuk preview (agar bisa scroll)
  const { data: latestMitras } = await supabaseAdmin
    .from('profiles')
    .select('name, expires_at')
    .eq('role', 'mitra')
    .order('created_at', { ascending: false })
    .limit(20);

  const totalMitra = count || 0;

  return (
    <div className="space-y-8">
      
      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card: Mitra */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Akun Mitra Terdaftar</h3>
              <div className="text-5xl font-extrabold text-gray-900 mt-2">{totalMitra}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 text-2xl shadow-inner">
              🤝
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Terhubung dengan database real-time
          </p>
        </div>
      </div>

      {/* PREVIEW SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PREVIEW: MODE MANAGEMENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🎛️ Mode Management
            </h3>
            <Link href="/admin/modes" className="text-sm font-bold text-[#9B0B0B] hover:underline">Manage</Link>
          </div>
          <div className="p-6 space-y-4">
            {/* Normal Mode */}
            <div className={`p-4 rounded-xl border-2 transition-all ${activeMode === 'Normal' ? 'border-green-500 bg-green-50' : 'border-gray-100 opacity-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${activeMode === 'Normal' ? 'bg-green-500' : 'border-2 border-gray-300'}`}></div>
                  <span className="font-bold text-gray-800">Normal Mode</span>
                </div>
                {activeMode === 'Normal' && <span className="text-[10px] font-black text-green-700 bg-green-200 px-2 py-0.5 rounded-full">ACTIVE</span>}
              </div>
            </div>

            {/* PKKMB Mode */}
            <div className={`p-4 rounded-xl border-2 transition-all ${activeMode === 'PKKMB' ? 'border-green-500 bg-green-50' : 'border-gray-100 opacity-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${activeMode === 'PKKMB' ? 'bg-green-500' : 'border-2 border-gray-300'}`}></div>
                  <span className="font-bold text-gray-800">PKKMB Mode</span>
                </div>
                {activeMode === 'PKKMB' && <span className="text-[10px] font-black text-green-700 bg-green-200 px-2 py-0.5 rounded-full">ACTIVE</span>}
              </div>
            </div>

            {/* Special Event Mode */}
            <div className={`p-4 rounded-xl border-2 transition-all ${activeMode === 'SpecialEvent' ? 'border-green-500 bg-green-50' : 'border-gray-100 opacity-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${activeMode === 'SpecialEvent' ? 'bg-green-500' : 'border-2 border-gray-300'}`}></div>
                  <span className="font-bold text-gray-800">Special Event</span>
                </div>
                {activeMode === 'SpecialEvent' && <span className="text-[10px] font-black text-green-700 bg-green-200 px-2 py-0.5 rounded-full">ACTIVE</span>}
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW: PARTNER ACCOUNTS */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              👥 Partner Accounts Preview
            </h3>
            <Link href="/admin/mitra" className="text-sm font-bold text-[#9B0B0B] hover:underline">View All</Link>
          </div>
          <div className="p-0 max-h-[260px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 font-semibold">Instansi</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Tipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestMitras && latestMitras.length > 0 ? (
                  latestMitras.map((mitra, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{mitra.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${mitra.expires_at && new Date() > new Date(mitra.expires_at) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {mitra.expires_at && new Date() > new Date(mitra.expires_at) ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">
                        {mitra.expires_at ? 'Temporary' : 'Permanen'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400 italic">Belum ada mitra terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}