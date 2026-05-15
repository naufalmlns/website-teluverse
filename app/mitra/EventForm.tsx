'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Building {
  id: string
  name: string
  formal: string
}

interface EventFormProps {
  editData?: {
    id: string
    title: string
    description: string
    location: string
    startDate: string
    endDate: string
    image: string
    createdAt: string
    quiz: {
      quests: {
        questId: string
        question: string
        options: string[]
        answer: string
      }[]
    }
  } | null
  onClose?: () => void
  onSuccess?: () => void
}

export default function EventForm({ editData, onClose, onSuccess }: EventFormProps) {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [posterPreview, setPosterPreview] = useState<string | null>(editData?.image || null)

  // State untuk opsi kuis agar dropdown jawaban benar bersifat dinamis
  const [q1Opts, setQ1Opts] = useState([
    editData?.quiz?.quests?.[0]?.options?.[0] || '',
    editData?.quiz?.quests?.[0]?.options?.[1] || '',
    editData?.quiz?.quests?.[0]?.options?.[2] || '',
    editData?.quiz?.quests?.[0]?.options?.[3] || ''
  ])
  const [q2Opts, setQ2Opts] = useState([
    editData?.quiz?.quests?.[1]?.options?.[0] || '',
    editData?.quiz?.quests?.[1]?.options?.[1] || '',
    editData?.quiz?.quests?.[1]?.options?.[2] || '',
    editData?.quiz?.quests?.[1]?.options?.[3] || ''
  ])

  // State untuk searchable building dropdown
  const [selectedBuilding, setSelectedBuilding] = useState<string>(editData?.location || '')
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)

  // Fetch daftar gedung dari PlayFab
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch('/api/admin/mode')
        const data = await res.json()
        if (data.buildingLocation?.buildings) {
          setBuildings(data.buildingLocation.buildings)
        }
      } catch (err) {
        console.error("Gagal memuat daftar gedung:", err)
      }
    }
    fetchBuildings()
  }, [])

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMsg('❌ Ukuran gambar maksimal 2MB.')
        e.target.value = ''
        return
      }
      setPosterPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setStatusMsg('⏳ Menyimpan & sinkronisasi ke PlayFab...')

    const form = e.currentTarget
    const formData = new FormData(form)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string

    const q1Question = formData.get('q1_question') as string
    const q2Question = formData.get('q2_question') as string
    const q1Answer = formData.get('q1_answer') as string
    const q2Answer = formData.get('q2_answer') as string

    if (!title || !description || !location || !startDate || !endDate) {
      setStatusMsg('❌ Semua field wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!q1Question || !q2Question || !q1Answer || !q2Answer) {
      setStatusMsg('❌ Kuis wajib diisi lengkap (2 pertanyaan + jawaban).')
      setIsLoading(false)
      return
    }

    // Gunakan server action
    try {
      const { createEvent, updateEvent } = await import('./actions')
      if (editData) {
        formData.append('event_id', editData.id)
        if (editData.image) {
          formData.append('existing_image_url', editData.image)
        }
      }

      const result = editData ? await updateEvent(formData) : await createEvent(formData)

      if (result?.error) {
        setStatusMsg(`❌ ${result.error}`)
      } else {
        setStatusMsg('✅ Event berhasil disimpan & disinkronkan!')
        if (!editData) form.reset()
        setPosterPreview(null)
        setQ1Opts(['', '', '', ''])
        setQ2Opts(['', '', '', ''])
        setTimeout(() => onSuccess?.(), 1000)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setStatusMsg('❌ Terjadi kesalahan saat menyimpan event.')
    } finally {
      setIsLoading(false)
    }
  }

  const q1 = editData?.quiz?.quests?.[0]
  const q2 = editData?.quiz?.quests?.[1]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      {/* JUDUL */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Event</label>
        <input
          type="text" name="title" required
          defaultValue={editData?.title || ''}
          placeholder="Cth: Promo Merdeka Belajar"
          className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none transition-all bg-white"
        />
      </div>

      {/* DESKRIPSI */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi</label>
        <textarea
          name="description" required rows={3}
          defaultValue={editData?.description || ''}
          placeholder="Jelaskan detail event Anda..."
          className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none transition-all resize-none bg-white"
        />
      </div>

      {/* LOKASI GEDUNG — Searchable Dropdown */}
      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-1.5">📍 Lokasi Gedung</label>
        <input type="hidden" name="location" value={selectedBuilding} />
        
        {/* Input Search */}
        <div
          className={`w-full border rounded-xl p-3.5 flex items-center gap-2 cursor-text transition-all bg-white ${
            showBuildingDropdown ? 'border-[#9B0B0B] ring-4 ring-red-50' : 'border-gray-200'
          }`}
          onClick={() => setShowBuildingDropdown(true)}
        >
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder={selectedBuilding 
              ? buildings.find(b => b.id === selectedBuilding)
                ? `${buildings.find(b => b.id === selectedBuilding)!.formal} (${buildings.find(b => b.id === selectedBuilding)!.name})`
                : `Gedung ID: ${selectedBuilding}`
              : 'Cari nama gedung...'
            }
            value={buildingSearch}
            onChange={(e) => {
              setBuildingSearch(e.target.value)
              setShowBuildingDropdown(true)
            }}
            onFocus={() => setShowBuildingDropdown(true)}
            className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
          />
          {selectedBuilding && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedBuilding(''); setBuildingSearch('') }}
              className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>

        {/* Selected Badge */}
        {selectedBuilding && !showBuildingDropdown && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B0B0B] bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              📍 {buildings.find(b => b.id === selectedBuilding)
                ? `${buildings.find(b => b.id === selectedBuilding)!.formal}`
                : `ID: ${selectedBuilding}`
              }
            </span>
          </div>
        )}

        {/* Dropdown List */}
        {showBuildingDropdown && (
          <>
            {/* Backdrop untuk close */}
            <div className="fixed inset-0 z-10" onClick={() => setShowBuildingDropdown(false)} />
            
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {buildings
                .filter(b => {
                  const keyword = buildingSearch.toLowerCase()
                  return !keyword || 
                    b.name.toLowerCase().includes(keyword) || 
                    b.formal.toLowerCase().includes(keyword) ||
                    b.id.includes(keyword)
                })
                .map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBuilding(b.id)
                      setBuildingSearch('')
                      setShowBuildingDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors flex items-center justify-between gap-2 ${
                      selectedBuilding === b.id ? 'bg-red-50 text-[#9B0B0B] font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{b.formal}</span>
                      <span className="text-gray-400 ml-1.5">({b.name})</span>
                    </div>
                    {selectedBuilding === b.id && <span className="text-[#9B0B0B]">✓</span>}
                  </button>
                ))
              }
              {buildings.filter(b => {
                const keyword = buildingSearch.toLowerCase()
                return !keyword || b.name.toLowerCase().includes(keyword) || b.formal.toLowerCase().includes(keyword) || b.id.includes(keyword)
              }).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Tidak ada gedung yang cocok.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* TANGGAL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Mulai</label>
          <input
            type="date" name="start_date" required
            defaultValue={editData?.startDate || ''}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Selesai</label>
          <input
            type="date" name="end_date" required
            defaultValue={editData?.endDate || ''}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none transition-all bg-white"
          />
        </div>
      </div>

      {/* POSTER UPLOAD */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">🖼️ Poster Event</label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#9B0B0B] transition-colors cursor-pointer relative bg-white">
          <input
            type="file" name="poster" accept="image/*"
            onChange={handlePosterChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {posterPreview ? (
            <div className="space-y-3">
              <img src={posterPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg mx-auto" />
              <p className="text-xs text-gray-400 font-medium">Klik untuk mengganti gambar</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <p className="text-sm text-gray-500 font-medium">Drag & drop atau klik untuk upload</p>
              <p className="text-[10px] text-gray-400">Format: JPG, PNG • Maks 2MB</p>
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER QUIZ */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-1">
          🧠 Kuis Event
        </h4>
        <p className="text-xs text-gray-400 font-medium mb-6">Wajib 2 pertanyaan. Setiap pertanyaan memiliki 4 opsi dan 1 jawaban benar.</p>

        {/* PERTANYAAN 1 */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#9B0B0B] text-white text-[10px] font-black px-2.5 py-1 rounded-lg">Q1</span>
            <span className="text-sm font-bold text-gray-700">Pertanyaan Pertama</span>
          </div>
          <input type="text" name="q1_question" required placeholder="Tulis pertanyaan pertama..."
            defaultValue={q1?.question || ''}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="q1_opt1" required placeholder="Opsi A"
              value={q1Opts[0]} onChange={(e) => setQ1Opts(p => [e.target.value, p[1], p[2], p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q1_opt2" required placeholder="Opsi B"
              value={q1Opts[1]} onChange={(e) => setQ1Opts(p => [p[0], e.target.value, p[2], p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q1_opt3" required placeholder="Opsi C"
              value={q1Opts[2]} onChange={(e) => setQ1Opts(p => [p[0], p[1], e.target.value, p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q1_opt4" required placeholder="Opsi D"
              value={q1Opts[3]} onChange={(e) => setQ1Opts(p => [p[0], p[1], p[2], e.target.value])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
          </div>
          <div>
            <label className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 block">✓ Jawaban Benar</label>
            <select name="q1_answer" required defaultValue={q1?.answer || ''}
              className="w-full border border-green-200 rounded-xl p-2.5 text-sm bg-green-50 focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none appearance-none cursor-pointer">
              <option value="">-- Pilih jawaban benar --</option>
              {q1Opts.map((opt, i) => opt && (
                <option key={i} value={opt}>Opsi {String.fromCharCode(65 + i)}: {opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PERTANYAAN 2 */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#9B0B0B] text-white text-[10px] font-black px-2.5 py-1 rounded-lg">Q2</span>
            <span className="text-sm font-bold text-gray-700">Pertanyaan Kedua</span>
          </div>
          <input type="text" name="q2_question" required placeholder="Tulis pertanyaan kedua..."
            defaultValue={q2?.question || ''}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="q2_opt1" required placeholder="Opsi A"
              value={q2Opts[0]} onChange={(e) => setQ2Opts(p => [e.target.value, p[1], p[2], p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q2_opt2" required placeholder="Opsi B"
              value={q2Opts[1]} onChange={(e) => setQ2Opts(p => [p[0], e.target.value, p[2], p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q2_opt3" required placeholder="Opsi C"
              value={q2Opts[2]} onChange={(e) => setQ2Opts(p => [p[0], p[1], e.target.value, p[3]])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
            <input type="text" name="q2_opt4" required placeholder="Opsi D"
              value={q2Opts[3]} onChange={(e) => setQ2Opts(p => [p[0], p[1], p[2], e.target.value])}
              className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-red-50 focus:border-[#9B0B0B] outline-none bg-white" />
          </div>
          <div>
            <label className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 block">✓ Jawaban Benar</label>
            <select name="q2_answer" required defaultValue={q2?.answer || ''}
              className="w-full border border-green-200 rounded-xl p-2.5 text-sm bg-green-50 focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none appearance-none cursor-pointer">
              <option value="">-- Pilih jawaban benar --</option>
              {q2Opts.map((opt, i) => opt && (
                <option key={i} value={opt}>Opsi {String.fromCharCode(65 + i)}: {opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUBMIT SECTION */}
      <div className="pt-6 border-t border-gray-100 space-y-3">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#9B0B0B] hover:bg-red-900 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95 text-sm"
          >
            {isLoading ? '⏳ Memproses...' : editData ? '💾 Update Event' : '🚀 Publish Event'}
          </button>
          {onClose && (
            <button
              type="button" onClick={onClose}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
            >
              Batal
            </button>
          )}
        </div>
        {statusMsg && (
          <p className={`text-center text-xs font-bold px-4 py-2 rounded-full ${
            statusMsg.includes('✅') ? 'bg-green-50 text-green-600' :
            statusMsg.includes('⏳') ? 'bg-yellow-50 text-yellow-600' :
            'bg-red-50 text-red-600'
          }`}>
            {statusMsg}
          </p>
        )}
      </div>
    </form>
  )
}
