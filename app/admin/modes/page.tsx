'use client';
import { useState, useEffect } from 'react';

interface Quest {
  QuestId: string;
  buildingId: string;
  Destination: string;
}

// Komponen terpisah untuk Select Searchable per-item
function BuildingSearchSelect({ 
  value, 
  onChange, 
  buildings, 
  isLoading,
  index 
}: { 
  value: string, 
  onChange: (id: string) => void, 
  buildings: any[], 
  isLoading: boolean,
  index: number 
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selected = buildings.find(b => b.id === value);
  const placeholderText = selected ? `${selected.formal || selected.name} (${selected.name})` : (isLoading ? '⏳ Memuat gedung...' : '🔍 Cari nama gedung...');

  const filteredBuildings = buildings.filter(b => {
    const keyword = search.toLowerCase();
    return !keyword || 
      b.name.toLowerCase().includes(keyword) || 
      (b.formal && b.formal.toLowerCase().includes(keyword)) ||
      b.id.includes(keyword);
  });

  return (
    <div className="relative w-full">
      <div 
        className={`w-full flex items-center gap-2 border bg-white rounded-xl p-3.5 transition-all cursor-text ${isOpen ? 'border-[#9B0B0B] ring-4 ring-red-50' : 'border-gray-200'}`}
        onClick={() => !isLoading && setIsOpen(true)}
      >
        <span className="text-gray-400 text-sm">📍</span>
        <input
          type="text"
          placeholder={placeholderText}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={isLoading}
          className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
        />
        {value && !isOpen && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
            className="text-gray-300 hover:text-red-500 transition px-1"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
            {filteredBuildings.length > 0 ? (
              filteredBuildings.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onChange(b.id);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm transition-colors border-b border-gray-50 last:border-0"
                >
                  <p className="font-bold text-gray-800">{b.formal || b.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">ID: {b.id} • {b.name}</p>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Gedung tidak ditemukan</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ModeManagementPage() {
  const [mode, setMode] = useState<string>('Normal');
  const [modeStatus, setModeStatus] = useState<string>('');
  const [quests, setQuests] = useState<Quest[]>([{ QuestId: 'q1', buildingId: '', Destination: '' }]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil konfigurasi saat ini dari server saat pertama kali buka
  useEffect(() => {
    const fetchCurrentConfig = async () => {
      try {
        const res = await fetch('/api/admin/mode');
        const data = await res.json();
        
        if (data.mode) setMode(data.mode);
        
        // Load daftar gedung dari PlayFab
        if (data.buildingLocation?.buildings) {
          setBuildingList(data.buildingLocation.buildings);
        }

        if (data.specialEvent?.quests?.length > 0) {
          setQuests(data.specialEvent.quests);
        }
      } catch (err) {
        console.error("Gagal mengambil data awal", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentConfig();
  }, []);

  const handleQuestChange = (index: number, buildingId: string) => {
    // Cari di buildingList yang dinamis
    const selectedBuilding = buildingList.find(b => b.id === buildingId);
    const newQuests = [...quests];
    newQuests[index] = {
      ...newQuests[index],
      buildingId: buildingId,
      Destination: selectedBuilding ? selectedBuilding.name : ''
    };
    setQuests(newQuests);
  };

  const addQuest = () => {
    if (quests.length < 8) {
      const nextId = `q${quests.length + 1}`;
      setQuests([...quests, { QuestId: nextId, buildingId: '', Destination: '' }]);
    }
  };

  const removeQuest = (index: number) => {
    if (quests.length > 1) {
      const filtered = quests.filter((_, i) => i !== index);
      // Re-index QuestId agar tetap berurutan q1, q2, dst
      const reIndexed = filtered.map((q, i) => ({
        ...q,
        QuestId: `q${i + 1}`
      }));
      setQuests(reIndexed);
    }
  };

  const saveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setModeStatus('⏳ Menyimpan konfigurasi...');
    try {
      const payload = mode === 'SpecialEvent' 
        ? { mode, quests: quests.filter(q => q.buildingId !== '') } 
        : { mode };

      const res = await fetch('/api/admin/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) setModeStatus('✅ Berhasil disimpan!');
      else setModeStatus('❌ Gagal menyimpan.');
    } catch (error) {
      setModeStatus('❌ Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">🎛️ Mode Management</h2>
        <p className="text-gray-500 mt-2">Atur mode operasional Tel-U Verse. Mode yang dipilih akan sinkron ke aplikasi secara real-time.</p>
      </div>

      <form onSubmit={saveConfiguration} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* RADIO OPTIONS */}
        <div className="grid grid-cols-1 gap-4">
          {['Normal', 'PKKMB', 'SpecialEvent'].map((m) => (
            <label key={m} className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${mode === m ? 'border-[#9B0B0B] bg-red-50 ring-4 ring-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex-shrink-0 mt-1">
                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="w-5 h-5 text-[#9B0B0B] focus:ring-[#9B0B0B]" />
              </div>
              <div className="ml-4">
                <span className="block text-lg font-black text-gray-900">
                  {m === 'Normal' ? 'Normal Mode' : m === 'PKKMB' ? 'PKKMB Mode' : 'Mode Kunjungan (Special Event)'}
                </span>
                <span className="block text-sm text-gray-500 mt-1 italic">
                  {m === 'Normal' ? 'Mode standar eksplorasi bebas.' : m === 'PKKMB' ? 'Mode orientasi untuk mahasiswa baru.' : 'Mode tur kampus dengan rute gedung spesifik.'}
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* SPECIAL EVENT ROUTES */}
        {mode === 'SpecialEvent' && (
          <div className="mt-8 pt-8 border-t border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">📍 Rute Tur Kampus</h3>
                <p className="text-sm text-gray-500">Urutan kunjungan gedung (1-8 titik).</p>
              </div>
              <button 
                type="button"
                onClick={addQuest}
                disabled={quests.length >= 8}
                className="bg-gray-900 hover:bg-black text-white text-sm font-bold py-2.5 px-5 rounded-xl transition disabled:opacity-30 flex items-center gap-2 shadow-lg"
              >
                <span>➕</span> Tambah Titik
              </button>
            </div>
            
            <div className="space-y-6">
              {quests.map((quest, index) => (
                <div key={index} className="flex items-end gap-4 group animate-slide-up">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:border-red-200 group-hover:text-red-500 transition-all">
                    {quest.QuestId.toUpperCase()}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Pilih Gedung Tujuan {index + 1}
                    </label>
                    <BuildingSearchSelect
                      value={quest.buildingId}
                      onChange={(id) => handleQuestChange(index, id)}
                      buildings={buildingList}
                      isLoading={isLoading}
                      index={index}
                    />
                  </div>

                  {quests.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeQuest(index)}
                      className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3.5 rounded-xl transition-all shadow-sm"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button type="submit" className="bg-[#9B0B0B] hover:bg-red-900 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95">
              Simpan Konfigurasi
            </button>
            {modeStatus && (
              <span className={`px-4 py-2 rounded-full text-xs font-bold ${modeStatus.includes('✅') ? 'bg-green-50 text-green-600' : modeStatus.includes('⏳') ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                {modeStatus}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium italic">*Pengaturan ini akan berdampak langsung pada seluruh aplikasi user.</p>
        </div>

      </form>
    </div>
  );
}
