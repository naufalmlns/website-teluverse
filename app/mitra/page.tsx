export default function MitraDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow border border-gray-100">
        <div className="flex justify-between items-center mb-8 border-b pb-6">
           <h1 className="text-2xl font-bold text-red-700">Mitra Dashboard</h1>
           <a href="/auth/logout" className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition border border-red-200">
             Logout
           </a>
        </div>
        <p className="text-gray-600 text-lg">
          Selamat datang, Mitra Tel-U Verse!
        </p>
        <p className="text-gray-500 mt-4">
          Halaman ini nantinya akan berisi formulir manajemen "Temporary Event" (Point of Interest) di map in-game.
        </p>
      </div>
    </div>
  )
}
