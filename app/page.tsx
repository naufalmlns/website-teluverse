'use client';
import { useState, useEffect } from 'react';

type Quest = { QuestId: string; buildingId: string; Destination: string; };
type Building = { id: string; name: string; formal: string; isBuilding: boolean; };

export default function Home() {
  const [mode, setMode] = useState<string>('Normal');
  const [modeStatus, setModeStatus] = useState<string>('');

  const [quests, setQuests] = useState<Quest[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  
  const [eventStatus, setEventStatus] = useState<string>('');
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(true);

  // Ambil Data dari API
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch('/api/special-event');
        const data = await res.json();
        if (data.quests) setQuests(data.quests);
        if (data.buildings) setAvailableBuildings(data.buildings);
      } catch (error) {
        setEventStatus('❌ Gagal memuat data dari server.');
      } finally {
        setIsLoadingEvent(false);
      }
    };
    fetchEventData();
  }, []);

  const updateMode = async () => {
    setModeStatus('⏳ Menyimpan ke server...');
    try {
      const res = await fetch('/api/mode', {
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

  const updateSpecialEvent = async () => {
    setEventStatus('⏳ Menyimpan rute event...');
    try {
      const res = await fetch('/api/special-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quests: quests })
      });
      if (res.ok) setEventStatus('✅ Rute event berhasil diperbarui!');
      else setEventStatus('❌ Gagal menyimpan rute event.');
    } catch (error) {
      setEventStatus('❌ Terjadi kesalahan jaringan.');
    }
  };

  // --- LOGIKA AUTO INCREMENT & DROPDOWN ---

  // Fungsi merapikan urutan q1, q2, q3 setiap kali ada perubahan
  const reorderQuests = (list: Quest[]) => {
    const newList = list.map((q, index) => ({
      ...q,
      QuestId: `q${index + 1}` // Otomatis jadi q1, q2, dst.
    }));
    setQuests(newList);
  };

  const addQuest = () => {
    if (quests.length < 8) {
      reorderQuests([...quests, { QuestId: '', buildingId: '', Destination: '' }]);
    }
  };

  const removeQuest = (index: number) => {
    const newList = quests.filter((_, i) => i !== index);
    reorderQuests(newList); // Hitung ulang setelah ada yang dihapus
  };

  // Saat Admin memilih gedung dari dropdown
  const handleBuildingSelect = (index: number, selectedBuildingId: string) => {
    const building = availableBuildings.find(b => b.id === selectedBuildingId);
    if (building) {
      const newList = [...quests];
      newList[index].buildingId = building.id;
      newList[index].Destination = building.name; // Otomatis mengisi nama gedung
      setQuests(newList);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-8 font-sans text-black">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* PANEL MODE */}
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Kontrol Mode Game</h2>
          <div className="flex gap-4 items-center">
            <select 
              className="flex-1 border-2 border-gray-300 p-3 rounded-xl focus:outline-none focus:border-red-500"
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

        {/* PANEL SPECIAL EVENT */}
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-700">Rute Special Event</h2>
            <span className="bg-gray-200 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
              {quests.length} / 8 Tujuan
            </span>
          </div>

          {isLoadingEvent ? (
            <p className="text-center py-8 text-gray-500">Memuat data gedung dari server...</p>
          ) : (
            <div className="space-y-4">
              {quests.map((quest, index) => (
                <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  
                  {/* AUTO INCREMENT QUEST ID (Read Only) */}
                  <div className="bg-red-100 text-red-800 font-bold px-4 py-3 rounded-lg w-16 text-center">
                    {quest.QuestId}
                  </div>

                  {/* DROPDOWN PILIH GEDUNG */}
                  <div className="flex-1">
                    <select 
                      className="w-full border-2 border-gray-300 p-3 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                      value={quest.buildingId}
                      onChange={(e) => handleBuildingSelect(index, e.target.value)}
                    >
                      <option value="" disabled>-- Pilih Gedung Tujuan --</option>
                      {availableBuildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          ID: {b.id} - {b.name} ({b.formal})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => removeQuest(index)}
                    className="text-red-500 hover:text-red-700 font-bold p-3 bg-red-50 rounded-lg"
                    title="Hapus Tujuan"
                  >
                    ✖
                  </button>
                </div>
              ))}

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                {quests.length < 8 ? (
                  <button 
                    onClick={addQuest}
                    className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg border border-red-600 transition"
                  >
                    + Tambah Tujuan
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-orange-500">Batas maksimal (8 tujuan) tercapai.</p>
                )}
                
                <button 
                  onClick={updateSpecialEvent}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow transition"
                >
                  Simpan Rute
                </button>
              </div>
              {eventStatus && <p className="mt-4 font-medium text-center">{eventStatus}</p>}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}