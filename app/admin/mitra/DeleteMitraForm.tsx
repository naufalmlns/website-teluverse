'use client';
import { useState } from 'react';
import { deleteMitra } from './actions';

export default function DeleteMitraForm({ userId, name }: { userId: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition border border-transparent hover:border-red-100"
        title="Hapus Mitra"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* CUSTOM MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-500 text-center mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus mitra <span className="font-bold text-gray-900">"{name}"</span>? 
              <br/><span className="text-sm italic font-medium text-red-500 mt-2 block">Aksi ini tidak dapat dibatalkan.</span>
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
              >
                Batal
              </button>
              <form action={deleteMitra} className="flex-1">
                <input type="hidden" name="userId" value={userId} />
                <button 
                  type="submit"
                  className="w-full px-6 py-4 rounded-2xl bg-[#9B0B0B] hover:bg-red-900 text-white font-bold shadow-lg shadow-red-200 transition-all"
                >
                  Ya, Hapus
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
