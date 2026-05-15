import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* HEADER */}
      <header className="w-full py-6 px-8 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2 text-red-700 font-extrabold text-2xl tracking-tight">
          <span className="text-3xl"></span> Tel-U Verse
        </div>
        {/* Tidak ada menu tab sama sekali seperti yang direkomendasikan */}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-8 py-20 flex flex-col items-center text-center">

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Jelajahi Tel-U dengan <br className="hidden md:block" />
            <span className="text-red-600">Cara Baru!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
            Ubah orientasi kampus menjadi petualangan epik. Gunakan AR untuk menemukan rute, selesaikan quest interaktif, dan kumpulkan poin reward di seluruh penjuru Telkom University.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://github.com/naufalmlns/website-teluverse/releases/download/application/TelUVerse.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-red-700 hover:bg-red-800 text-white font-black text-xl py-5 px-12 rounded-2xl shadow-2xl shadow-red-200 transition-all transform hover:-translate-y-2 active:scale-95 flex items-center gap-4"
            >
              <span className="text-3xl group-hover:animate-bounce">🤖</span>
              <div className="text-left">
                <span className="block leading-none">Unduh APK Sekarang</span>
                <span className="text-[10px] font-bold text-red-200 uppercase tracking-[0.2em] mt-1 block">Android Version • 280 MB</span>
              </div>
            </a>

            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Versi Terbaru v1.0.0
              </span>
              <span className="text-xs font-medium text-gray-400 italic">
                *Requires Android 10 or higher
              </span>
            </div>
          </div>
        </section>

        {/* LIVE EVENTS SECTION */}
        <section className="bg-gray-50 py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📍 Live Events Board</h2>
              <p className="text-gray-600">Jangan lewatkan berbagai kegiatan menarik yang sedang berlangsung di Tel-U hari ini.</p>
            </div>

            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 italic text-lg">
                Belum ada event yang sedang aktif saat ini.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - THE SECRET LINK */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <span></span> Tel-U Verse
          </div>
          <p className="text-sm">
            © 2026 Telkom University. All rights reserved.
          </p>
          <div>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-300 transition">
              Portal Mitra
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
