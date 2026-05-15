'use client'

import { useState, useEffect } from 'react'

import { getAdminEvents, deleteEventAsAdmin } from './actions'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const { events } = await getAdminEvents()
      setEvents(events)
    } catch (err) {
      console.error("Gagal memuat event:", err)
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const result = await deleteEventAsAdmin(deleteTarget.id)
      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== deleteTarget.id))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }

    setDeleteTarget(null)
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🎪 Event Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua event dari seluruh Mitra. Total: <strong>{events.length}</strong> event.
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 hover:border-[#9B0B0B] hover:text-[#9B0B0B] transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* EVENT TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="text-3xl animate-spin mb-4">⏳</div>
            <p className="text-sm text-gray-400 font-medium">Memuat event dari PlayFab...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Event</th>
                  <th className="px-6 py-4 font-bold">Mitra</th>
                  <th className="px-6 py-4 font-bold">Lokasi</th>
                  <th className="px-6 py-4 font-bold">Periode</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => {
                  const now = new Date()
                  const startDate = new Date(event.startDate)
                  const endDate = new Date(event.endDate)

                  let statusLabel = 'Akan Datang'
                  let statusColor = 'bg-blue-50 text-blue-600'
                  if (now > endDate) {
                    statusLabel = 'Berakhir'
                    statusColor = 'bg-red-50 text-red-600'
                  } else if (now >= startDate && now <= endDate) {
                    statusLabel = 'Aktif'
                    statusColor = 'bg-green-50 text-green-600'
                  }

                  return (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{event.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{event.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {event.mitraName || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 font-medium">📍 ID: {event.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <span>{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          <span className="mx-1">→</span>
                          <span>{new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <div className="text-5xl">🎪</div>
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Event</h3>
            <p className="text-sm text-gray-500">Belum ada Mitra yang membuat event.</p>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5 text-gray-900">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Hapus Event?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Event <strong>&quot;{deleteTarget.title}&quot;</strong> milik <strong>{deleteTarget.mitraName || 'Unknown'}</strong> akan dihapus permanen dari PlayFab.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-red-100"
              >
                {isDeleting ? '⏳ Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
