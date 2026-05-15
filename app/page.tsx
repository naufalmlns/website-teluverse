import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans text-black">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
        
        <h1 className="text-5xl font-extrabold text-red-700 tracking-tight">
          Tel-U Verse
        </h1>
        <p className="text-xl text-gray-600">
          Campus Tour AR/VR Experience
        </p>

        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8 text-left">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            📍 Live Events Board
          </h2>
          <p className="text-gray-600 italic">
            Belum ada event yang sedang aktif saat ini.
          </p>
          {/* Nanti bisa diisi fetch ke public events API */}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1">
            Download APK
          </button>
          
          <Link href="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 px-8 rounded-full transition transform hover:-translate-y-1">
            Login Mitra / Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
