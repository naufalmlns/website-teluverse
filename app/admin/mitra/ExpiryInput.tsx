'use client';
import { useRef, useState, useEffect } from 'react';

export default function ExpiryInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [minDateTime, setMinDateTime] = useState('');

  // Fungsi untuk mendapatkan waktu lokal dalam format YYYY-MM-DDTHH:mm
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    // Set min time saat pertama kali load
    setMinDateTime(getLocalISOString());
    
    // Update min time setiap menit agar tetap relevan
    const interval = setInterval(() => {
      setMinDateTime(getLocalISOString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    const now = getLocalISOString();

    // Jika user memilih waktu yang sudah lewat, otomatis tarik ke waktu sekarang (auto-correction)
    if (selectedValue && selectedValue < now) {
      e.target.value = now;
    }
  };

  return (
    <div className="relative group">
      <input 
        ref={inputRef}
        type="datetime-local" 
        name="expires_at" 
        min={minDateTime}
        onChange={handleChange}
        onFocus={() => setMinDateTime(getLocalISOString())} // Refresh min saat diklik
        className="w-full border border-gray-300 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-[#9B0B0B] outline-none transition-all" 
      />
      <button
        type="button"
        onClick={handleReset}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
        title="Kosongkan tanggal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
