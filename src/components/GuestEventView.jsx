import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  Share2, 
  Plus, 
  Minus,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { getTheme } from '../themes';
import CountdownTimer from './CountdownTimer';

export default function GuestEventView({ eventCode, onNavigateHome }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [companionsCount, setCompanionsCount] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [eventCode]);

  async function fetchEvent() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/event/${eventCode}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cargar la información del evento.');
      }
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function launchCelebration() {
    // Multi-stage confetti celebration
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Por favor escribe tu nombre completo.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/public/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode,
          guestName: guestName.trim(),
          companionsCount: parseInt(companionsCount, 10) || 0,
          note: note.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la confirmación.');
      }

      setConfirmedData(data.rsvp);
      launchCelebration();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-300">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Evento no encontrado</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'Verifica que el código del evento sea el correcto.'}</p>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const theme = getTheme(event.theme);
  const totalSeats = 1 + (parseInt(companionsCount, 10) || 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} py-8 px-4 sm:px-6 relative overflow-x-hidden`}>
      {/* Background Floating Elements */}
      <div className="absolute top-6 left-6 text-3xl sm:text-5xl opacity-30 select-none animate-bounce-soft pointer-events-none">
        {theme.decorations[0]}
      </div>
      <div className="absolute top-20 right-8 text-4xl sm:text-6xl opacity-30 select-none animate-pulse pointer-events-none">
        {theme.decorations[1]}
      </div>
      <div className="absolute bottom-12 left-10 text-3xl sm:text-5xl opacity-30 select-none animate-pulse pointer-events-none">
        {theme.decorations[2]}
      </div>
      <div className="absolute bottom-20 right-8 text-4xl sm:text-6xl opacity-30 select-none animate-bounce-soft pointer-events-none">
        {theme.decorations[3]}
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* Main Event Card */}
        <div className={`${theme.cardBg} rounded-3xl overflow-hidden shadow-2xl transition-all duration-300`}>
          
          {/* Header Banner */}
          <div className={`${theme.headerBg} p-6 sm:p-8 text-center text-white relative`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <span>{theme.icon}</span>
              <span>{theme.badge}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm mb-2">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-sm sm:text-base text-white/90 max-w-md mx-auto leading-relaxed">
                {event.description}
              </p>
            )}

            <div className="mt-3 text-xs font-medium text-white/80">
              Código del evento: <span className="font-mono font-bold tracking-wider">{event.code}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Event Details: Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {event.eventDateFormatted && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha y Hora</div>
                    <div className="text-sm font-semibold text-slate-800 leading-snug">{event.eventDateFormatted}</div>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-pink-100 text-pink-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Lugar</div>
                    <div className="text-sm font-semibold text-slate-800 leading-snug">{event.location}</div>
                    {event.address && <div className="text-xs text-slate-500 truncate">{event.address}</div>}
                    {event.mapUrl && (
                      <a 
                        href={event.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-pink-600 font-semibold hover:underline mt-1"
                      >
                        <Navigation className="w-3 h-3" /> Ver mapa
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DEADLINE BANNER REQUIRED BY USER */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              event.isDeadlinePassed 
                ? 'bg-rose-50 border-rose-300 text-rose-900' 
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  event.isDeadlinePassed ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-900'
                }`}>
                  {event.isDeadlinePassed ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider">
                    {event.isDeadlinePassed ? 'Confirmación Cerrada' : 'Fecha Límite de Confirmación'}
                  </div>
                  <div className="text-base font-bold">
                    {event.deadlineFormatted}
                  </div>
                  <p className="text-sm leading-relaxed font-medium opacity-95">
                    {event.deadlinePrompt}
                  </p>
                </div>
              </div>

              {/* Countdown Component if still active */}
              {!event.isDeadlinePassed && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <CountdownTimer targetDate={event.deadlineDate} label="Tiempo restante para confirmar" />
                </div>
              )}
            </div>

            {/* CONFIRMATION FORM OR SUCCESS SCREEN */}
            {confirmedData ? (
              /* Success Confirmation Card */
              <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">¡Confirmación Exitosa!</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Gracias <span className="font-bold text-slate-800">{confirmedData.guestName}</span>, tu asistencia ha sido confirmada.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm max-w-sm mx-auto text-left space-y-2">
                  <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Lugares reservados:</span>
                    <span className="font-extrabold text-slate-800">{confirmedData.totalSeats} {confirmedData.totalSeats === 1 ? 'lugar' : 'lugares'}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Titular:</span>
                    <span className="font-semibold text-slate-800">{confirmedData.guestName}</span>
                  </div>
                  {confirmedData.companionsCount > 0 && (
                    <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Acompañantes adicionales:</span>
                      <span className="font-semibold text-slate-800">+{confirmedData.companionsCount}</span>
                    </div>
                  )}
                  {confirmedData.note && (
                    <div className="text-xs pt-1">
                      <span className="text-slate-500 block font-medium">Nota enviada:</span>
                      <span className="text-slate-700 italic">"{confirmedData.note}"</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-emerald-800 font-medium">
                  ¡Te esperamos con mucha emoción para celebrar juntos! 🎉
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: event.title,
                          text: `¡Confirmé mi asistencia a ${event.title}!`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('¡Enlace del evento copiado al portapapeles!');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    Compartir invitación
                  </button>

                  <button
                    onClick={() => {
                      setConfirmedData(null);
                      setGuestName('');
                      setCompanionsCount(0);
                      setNote('');
                    }}
                    className="inline-flex items-center justify-center py-2.5 px-4 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Registrar a otro invitado
                  </button>
                </div>
              </div>
            ) : event.isDeadlinePassed ? (
              /* Closed Registration Card */
              <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  🔒
                </div>
                <h3 className="text-xl font-bold text-slate-800">El registro ha concluido</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  La fecha límite definida por el anfitrión ha finalizado. Por motivos de organización ya no es posible registrar nuevas confirmaciones.
                </p>
                <div className="pt-4">
                  <button
                    onClick={onNavigateHome}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
                  >
                    Volver a la página principal
                  </button>
                </div>
              </div>
            ) : (
              /* Active RSVP Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <Sparkles className={`w-5 h-5 ${theme.accentText}`} />
                    Confirma tu lugar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Solo ingresa tu nombre y cuántas personas te acompañarán. No necesitas registrarte ni crear contraseñas.
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tu Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej. Juan Pérez López"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.accentBorder} bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium transition outline-none`}
                  />
                </div>

                {/* Companions Counter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    ¿Cuántos invitados o acompañantes van contigo?
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-500">Acompañantes adicionales:</div>
                      <div className="text-xs text-slate-400">Sin contarte a ti</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCompanionsCount(prev => Math.max(0, prev - 1))}
                        disabled={companionsCount <= 0}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-300 disabled:opacity-40 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-sm font-bold text-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center text-xl font-extrabold text-slate-800">
                        {companionsCount}
                      </span>

                      <button
                        type="button"
                        onClick={() => setCompanionsCount(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-sm font-bold text-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Seat Summary Box */}
                  <div className="mt-2 text-center text-xs font-semibold text-slate-600 bg-slate-100/80 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Total de lugares a reservar: <strong className="text-slate-900">{totalSeats}</strong> ({totalSeats === 1 ? '1 persona' : `${totalSeats} personas en total`})
                    </span>
                  </div>
                </div>

                {/* Optional Note / Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>Mensaje para el anfitrión (Opcional)</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">alergias, felicitación, etc.</span>
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ej. ¡Muchas felicidades! Nos vemos ahí. / Somos vegetarianos..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.accentBorder} bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm transition outline-none resize-none`}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !guestName.trim()}
                  className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${theme.accentBg}`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Confirmando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirmar Asistencia ({totalSeats} {totalSeats === 1 ? 'Lugar' : 'Lugares'})</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Footer Credit & Home Button */}
        <div className="text-center mt-6 text-white/70 text-xs space-y-2">
          <p>Plataforma de Confirmación de Fiestas y Eventos</p>
          <button 
            onClick={onNavigateHome}
            className="text-white hover:text-white underline font-semibold transition"
          >
            ¿Quieres crear tu propio evento? Crea tu fiesta aquí
          </button>
        </div>
      </div>
    </div>
  );
}
