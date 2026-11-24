import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Users, 
  Calendar, 
  Clock, 
  Share2, 
  Trash2, 
  BarChart3, 
  AlertCircle 
} from 'lucide-react';
import { getTheme } from '../themes';

export default function Dashboard({ token, onSelectEvent, onOpenCreateEvent, onNavigateGuest }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar tus eventos.');
      }
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyLink(code, eventTitle) {
    const url = `${window.location.origin}/e/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  function handleShareWhatsApp(event) {
    const url = `${window.location.origin}/e/${event.code}`;
    const message = `¡Hola! Estás cordialmente invitado a: *${event.title}* 🎉\n\nPor favor confirma tu asistencia en el siguiente enlace antes del día ${event.deadlineFormatted}:\n👉 ${url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  async function handleDeleteEvent(code, title) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${title}"? Esta acción borrará también todas las confirmaciones registradas.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar el evento.');
      setEvents(prev => prev.filter(e => e.code !== code));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mis Eventos y Fiestas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra tus confirmaciones, consulta las estadísticas de asistencia y comparte tus enlaces.
          </p>
        </div>

        <button
          onClick={onOpenCreateEvent}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Nuevo Evento</span>
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-500">Cargando tus eventos...</p>
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="mt-12 text-center max-w-md mx-auto p-8 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            🎉
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Aún no tienes ningún evento</h3>
          <p className="text-xs text-slate-500 mb-6">
            Comienza creando tu primera fiesta para obtener tu código único y recibir confirmaciones de tus invitados.
          </p>
          <button
            onClick={onOpenCreateEvent}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white transition shadow-md shadow-purple-600/20"
          >
            Crear mi primer evento
          </button>
        </div>
      ) : (
        /* Events Grid */
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const theme = getTheme(event.theme);
            const isCopied = copiedCode === event.code;

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Theme styling */}
                  <div className={`${theme.headerBg} p-4 sm:p-5 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{theme.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {theme.name}
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      event.isClosed ? 'bg-rose-950/80 text-rose-200' : 'bg-emerald-950/80 text-emerald-200'
                    }`}>
                      {event.isClosed ? 'Cerrado' : 'Abierto'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-snug line-clamp-1">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">📍 {event.location}</p>
                      )}
                    </div>

                    {/* Unique Code Banner */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Código Único</span>
                        <span className="font-mono font-black text-sm text-slate-800 tracking-wider">
                          {event.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyLink(event.code, event.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition shadow-sm"
                        title="Copiar enlace del evento"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copiar link</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                        <div className="text-xl sm:text-2xl font-black text-purple-700">
                          {event.totalRsvps || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase text-purple-900 tracking-wider">
                          Confirmaciones
                        </div>
                      </div>

                      <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-2xl">
                        <div className="text-xl sm:text-2xl font-black text-pink-700">
                          {event.totalGuests || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase text-pink-900 tracking-wider">
                          Total Personas
                        </div>
                      </div>
                    </div>

                    {/* Deadline notice */}
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Evento: <strong className="text-slate-700">{event.eventDateFormatted || 'No definida'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Límite: <strong>{event.deadlineFormatted || 'Sin límite'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectEvent(event.code)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Ver Invitados</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(event)}
                    title="Enviar invitación por WhatsApp"
                    className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigateGuest(event.code)}
                    title="Abrir vista de invitado"
                    className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(event.code, event.title)}
                    title="Eliminar evento"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
