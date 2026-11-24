import React, { useState } from 'react';
import { PartyPopper, User, LogIn, UserPlus, LogOut, PlusCircle, Search } from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onNavigateHome, 
  onNavigateDashboard, 
  onOpenCreateEvent,
  onSearchCode 
}) {
  const [searchCode, setSearchCode] = useState('');

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchCode.trim()) {
      onSearchCode(searchCode.trim().toUpperCase());
      setSearchCode('');
    }
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo / Brand */}
          <div 
            onClick={onNavigateHome} 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Fiesta RSVP
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 font-medium tracking-wide">
                Confirmación de Asistencia
              </span>
            </div>
          </div>

          {/* Quick Event Code Search for Guests */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="¿Tienes un código? Ej. FIESTA-7K9M"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono tracking-wider transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* User Auth Buttons / Profile Menu */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onNavigateDashboard}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  Mis Eventos
                </button>

                <button
                  onClick={onOpenCreateEvent}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-xs font-bold shadow-md shadow-pink-500/20 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nuevo Evento</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="hidden lg:block text-right">
                    <div className="text-xs font-bold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Cerrar Sesión"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-pink-400" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs font-bold text-white shadow-md shadow-pink-500/25 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
