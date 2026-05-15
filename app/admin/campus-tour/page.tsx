'use client';
import { useState, useEffect } from 'react';

type Quest = { QuestId: string; buildingId: string; Destination: string; };
type Building = { id: string; name: string; formal: string; isBuilding: boolean; };

export default function CampusTourPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [eventStatus, setEventStatus] = useState<string>('');
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(true);

  // Ambil Data dari API
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch('/api/admin/special-event');
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

  const updateSpecialEvent = async () => {
    setEventStatus('⏳ Menyimpan rute event...');
    try {
      const res = await fetch('/api/admin/special-event', {
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

  const reorderQuests = (list: Quest[]) => {
    const newList = list.map((q, index) => ({
      ...q,
      QuestId: `q${index + 1}`
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
    reorderQuests(newList);
  };

  const handleBuildingSelect = (index: number, selectedBuildingId: string) => {
    const building = availableBuildings.find(b => b.id === selectedBuildingId);
    if (building) {
      const newList = [...quests];
      newList[index].buildingId = building.id;
      newList[index].Destination = building.name;
      setQuests(newList);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-red-700">Campus Tour</h2>
        <p className="text-gray-500 mt-2">Atur rute gedung untuk mode Special Event di in-game.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Rute Special Event</h3>
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
                <div className="bg-red-100 text-red-800 font-bold px-4 py-3 rounded-lg w-16 text-center">
                  {quest.QuestId}
                </div>
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
  );
}
