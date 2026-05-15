'use client'

import { useState, useEffect } from 'react'
import EventForm from './EventForm'
import EventCard from './EventCard'
import { createClient } from '@/utils/supabase/client'

export default function MitraDashboard() {
  const [events, setEvents] = useState<any[]>([])
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mitraName, setMitraName] = useState('')
  const [userId, setUserId] = useState('')

  const fetchEvents = async (uid?: string) => {
    const id = uid || userId
    if (!id) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('temporary_events')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Map snake_case dari DB ke camelCase untuk komponen UI
        const mappedEvents = data.map((evt) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description,
          location: evt.location,
          startDate: evt.start_date,
          endDate: evt.end_date,
          image: evt.image_url,
          createdAt: evt.created_at,
          quiz: evt.quiz
        }))
        setEvents(mappedEvents)
      }
    } catch (err) {
      console.error("Gagal memuat event:", err)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        if (profile) setMitraName(profile.name)

        // Ambil event milik Mitra ini saja
        fetchEvents(user.id)
      } else {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCloseForm = () => {
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleSuccess = () => {
    setEditingEvent(null)
    setShowForm(false)
    fetchEvents() // Refresh dari PlayFab
  }

  const handleDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#9B0B0B] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-100">
              {mitraName?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mitra Dashboard</h1>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                {mitraName || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-xl">🤝</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-[#9B0B0B] hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: EVENT FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  {editingEvent ? '✏️ Edit Event' : '➕ Buat Event Baru'}
                </h3>
                {!showForm && !editingEvent && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#9B0B0B] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-900 transition shadow-md shadow-red-100"
                  >
                    + Buat
                  </button>
                )}
              </div>

              <div className="p-6">
                {showForm || editingEvent ? (
                  <EventForm
                    editData={editingEvent}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="text-5xl">📋</div>
                    <p className="text-sm text-gray-500 font-medium">
                      Klik tombol <strong className="text-gray-800">&quot;+ Buat&quot;</strong> di atas untuk membuat event baru.
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Event akan langsung tersinkronisasi ke aplikasi Tel-U Verse.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: EVENT LIST */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">📅 Event Aktif</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {events.length} event terdaftar di PlayFab
                </p>
              </div>
              <button
                onClick={() => fetchEvents()}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#9B0B0B] hover:text-[#9B0B0B] transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                🔄 Refresh dari PlayFab
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-3xl animate-spin mb-4">⏳</div>
                <p className="text-sm text-gray-400 font-medium">Memuat event dari PlayFab...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center space-y-4">
                <div className="text-6xl">🎪</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Belum Ada Event</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Buat event pertama Anda dan tampilkan di peta Tel-U Verse!
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#9B0B0B] hover:bg-red-900 text-white font-bold text-sm py-3 px-8 rounded-xl transition shadow-lg shadow-red-100"
                >
                  + Buat Event Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
