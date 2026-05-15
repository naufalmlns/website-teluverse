'use client';
import { useState } from 'react';

export default function GameModePage() {
  const [mode, setMode] = useState<string>('Normal');
  const [modeStatus, setModeStatus] = useState<string>('');

  const updateMode = async () => {
    setModeStatus('⏳ Menyimpan ke server...');
    try {
      const res = await fetch('/api/admin/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode })
      });
      if (res.ok) setModeStatus('✅ Mode berhasil diubah di PlayFab!');
      else setModeStatus('❌ Gagal mengubah mode.');
    } catch (error) {
      setModeStatus('❌ Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-red-700">Game Mode</h2>
        <p className="text-gray-500 mt-2">Ubah mode event yang sedang aktif di Tel-U Verse.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Kontrol Mode</h3>
        <div className="flex gap-4 items-center">
          <select 
            className="flex-1 border-2 border-gray-300 p-3 rounded-xl focus:outline-none focus:border-red-500 bg-white"
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="Normal">Mode Normal</option>
            <option value="PKKMB">Mode PKKMB (Orientasi)</option>
            <option value="SpecialEvent">Mode Special Event</option>
          </select>
          <button onClick={updateMode} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition">
            Terapkan Mode
          </button>
        </div>
        {modeStatus && <p className="mt-4 font-medium text-gray-700">{modeStatus}</p>}
      </div>
    </div>
  );
}