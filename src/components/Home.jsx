import React, { useState } from 'react';
import { 
  PartyPopper, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Share2, 
  Search, 
  Heart 
} from 'lucide-react';
import { THEMES } from '../themes';

export default function Home({ user, onOpenAuth, onOpenCreateEvent, onNavigateGuest }) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  function handleGoToEvent(e) {
    e.preventDefault();
    if (!inputCode.trim()) {
      setError('Por favor ingresa un código de evento válido.');
      return;
    }
    setError('');
    onNavigateGuest(inputCode.trim().toUpperCase());
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-pink-500 selection:text-white">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-pink-400 mb-6 backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Confirmación de Asistencia (RSVP) sin complicaciones</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Organiza tu fiesta y recibe confirmaciones{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              al instante
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tus invitados confirman con un solo clic <strong className="text-white">sin crear cuentas ni registrarse</strong>. Define una fecha límite, genera tu código único y visualiza tus métricas en tiempo real.
          </p>

          {/* Quick Access Card for Guests */}
          <div className="mt-10 max-w-md mx-auto bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-center gap-1.5">
              <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
              <span>¿Tienes una invitación? Entra con tu código</span>
            </div>

            <form onSubmit={handleGoToEvent} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ej. FIESTA-7K9M"
                  value={inputCode}
                  onChange={(e) => { setInputCode(e.target.value); setError(''); }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl px-4 py-3 text-sm text-center sm:text-left font-mono tracking-widest uppercase outline-none text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-pink-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Ver Fiesta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {error && (
              <p className="text-xs text-rose-400 mt-2 font-medium">{error}</p>
            )}
          </div>

          {/* Host Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <button
                onClick={onOpenCreateEvent}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-extrabold text-sm text-white shadow-xl shadow-purple-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Crear Nuevo Evento</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-extrabold text-sm text-white shadow-xl shadow-purple-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Crear mi evento gratis</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Todo lo que necesitas para tu fiesta</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Diseñado pensando en la comodidad del anfitrión y de sus invitados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-800/50 border border-slate-700/80 p-6 rounded-3xl hover:border-purple-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cero Registro para Invitados</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tus invitados no necesitan instalar aplicaciones ni crear cuentas. Solo ingresan su nombre, cuántos van con ellos y confirman su asistencia en segundos.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 p-6 rounded-3xl hover:border-purple-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Control de Fecha Límite</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Define con exactitud hasta qué fecha y hora se recibirán confirmaciones. Al cumplirse el plazo, el sistema bloquea nuevos registros de forma automática.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 p-6 rounded-3xl hover:border-purple-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Métricas y Reporte en Excel</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Consulta en tiempo real el total de personas confirmadas, filtra por nombre y descarga la lista en formato Excel/CSV para el control en la puerta de la fiesta.
            </p>
          </div>

        </div>
      </div>

      {/* Pre-designed Themes Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-1">Plantillas Visuales</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Estilos Predeterminados para Cada Ocasión</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Elige el ambiente ideal al crear tu evento:</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(THEMES).map((theme) => (
            <div
              key={theme.id}
              className="bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl text-center hover:scale-105 transition"
            >
              <div className="text-3xl mb-2">{theme.icon}</div>
              <div className="text-xs font-bold text-white">{theme.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{theme.tagline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>Fiesta RSVP © 2026 - Plataforma moderna para eventos y confirmaciones de asistencia.</p>
      </footer>

    </div>
  );
}
