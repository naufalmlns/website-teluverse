'use client'

import { useState } from 'react'

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    location: string
    startDate: string
    endDate: string
    image: string
    createdAt: string
    quiz: any
  }
  onEdit: (event: any) => void
  onDelete: (eventId: string) => void
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  let statusLabel = 'Akan Datang'
  let statusColor = 'bg-blue-50 text-blue-600 border-blue-100'

  if (now > endDate) {
    statusLabel = 'Berakhir'
    statusColor = 'bg-red-50 text-red-600 border-red-100'
  } else if (now >= startDate && now <= endDate) {
    statusLabel = 'Sedang Aktif'
    statusColor = 'bg-green-50 text-green-600 border-green-100'
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { deleteEvent } = await import('./actions')
      const result = await deleteEvent(event.id)
      
      if (result.success) {
        onDelete(event.id)
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
    setShowDeleteModal(false)
    setIsDeleting(false)
  }

  const quizCount = event.quiz?.quests?.length || 0

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group text-gray-900">
        {/* Poster */}
        {event.image && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <h4 className="font-black text-gray-900 text-lg leading-tight">{event.title}</h4>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              📍 Gedung ID: {event.location}
            </span>
            <span className="flex items-center gap-1">
              🧠 {quizCount} Kuis
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>→</span>
            <span>{new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-all"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold py-2.5 rounded-xl transition-all"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5 text-gray-900">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Hapus Event?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Event <strong>&quot;{event.title}&quot;</strong> akan dihapus permanen dari PlayFab.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
    </>
  )
}
