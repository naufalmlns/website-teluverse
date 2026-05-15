'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navLinks = [
    { name: 'Overview', href: '/admin', icon: '📊' },
    { name: 'Mode Management', href: '/admin/modes', icon: '🎛️' },
    { name: 'Partner Accounts', href: '/admin/mitra', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        className={`bg-[#FAF8F8] border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`p-8 whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 p-0'}`}>
          <h1 className="text-2xl font-extrabold text-[#9B0B0B] tracking-tight">Tel-U Verse</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">Management Portal</p>
        </div>

        {/* Mini Header placeholder when closed */}
        {!isSidebarOpen && <div className="h-20" />}
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                title={!isSidebarOpen ? link.name : ''}
                className={`flex items-center rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isSidebarOpen ? 'px-4 py-3 gap-3' : 'px-0 py-3 justify-center'
                } ${
                  isActive 
                    ? 'bg-red-50 text-[#9B0B0B] font-bold shadow-sm' 
                    : 'text-gray-600 font-bold hover:bg-gray-100'
                }`}
              >
                <span className="text-xl shrink-0">{link.icon}</span> 
                <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Settings & Help Hidden */}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-[#9B0B0B] p-2 hover:bg-red-50 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {navLinks.find(l => l.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Notification Hidden */}
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-xl">👨‍💼</span>
              </div>
              <a href="/auth/logout" className="text-sm font-bold text-[#9B0B0B] hover:underline">
                Logout
              </a>
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
