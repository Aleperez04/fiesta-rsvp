import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Printer, 
  Search, 
  Trash2, 
  Edit3, 
  Share2, 
  Copy, 
  Check, 
  AlertCircle, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { getTheme } from '../themes';

export default function EventDetailAdmin({ eventCode, token, onBack, onNavigateGuest }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Manual RSVP modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCompanions, setManualCompanions] = useState(0);
  const [manualNote, setManualNote] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Edit Event modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventCode]);

  async function fetchEventDetails() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al obtener datos del evento.');

      setData(result);
      // Preload edit states
      if (result.event) {
        setEditTitle(result.event.title || '');
        setEditTheme(result.event.theme || 'cumpleanos');
        setEditEventDate(result.event.eventDate || '');
        setEditDeadlineDate(result.event.deadlineDate || '');
        setEditLocation(result.event.location || '');
        setEditAddress(result.event.address || '');
        setEditDescription(result.event.description || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/e/${eventCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleShareWhatsApp() {
    if (!data?.event) return;
    const url = `${window.location.origin}/e/${eventCode}`;
    const msg = `¡Hola! Estás invitado a: *${data.event.title}* 🎉\n\nConfirma tu asistencia antes del día ${data.deadlineFormatted}:\n👉 ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }

  async function handleAddManualRsvp(e) {
    e.preventDefault();
    if (!manualName.trim()) return;

    setManualSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventCode}/manual-rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guestName: manualName.trim(),
          companionsCount: parseInt(manualCompanions, 10) || 0,
          note: manualNote.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Error al registrar invitado.');

      setShowManualModal(false);
      setManualName('');
      setManualCompanions(0);
      setManualNote('');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setManualSubmitting(false);
    }
  }

  async function handleDeleteRsvp(rsvpId, guestName) {
    if (!confirm(`¿Eliminar la confirmación de "${guestName}"?`)) return;

    try {
      const res = await fetch(`/api/events/${eventCode}/rsvp/${rsvpId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Error al eliminar.');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateEvent(e) {
    e.preventDefault();
    if (!editTitle.trim() || !editDeadlineDate) {
      alert('El título y la fecha límite son obligatorios.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          theme: editTheme,
          eventDate: editEventDate,
          deadlineDate: editDeadlineDate,
          location: editLocation.trim(),
          address: editAddress.trim(),
          description: editDescription.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Error al guardar cambios.');

      setShowEditModal(false);
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleExportCsv() {
    try {
      const res = await fetch(`/api/events/${eventCode}/export?token=${encodeURIComponent(token)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al descargar archivo.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistencia_${eventCode}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Cargando datos del evento...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl text-center shadow-lg">
        <div className="text-rose-500 text-3xl mb-2">⚠️</div>
        <h3 className="text-lg font-bold text-slate-800">Error al cargar evento</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="py-2 px-4 bg-slate-800 text-white text-xs font-semibold rounded-xl"
        >
          Volver a Mis Eventos
        </button>
      </div>
    );
  }

  const { event, totalRsvps, totalCompanions, totalGuests, isClosed, deadlineFormatted, eventDateFormatted, rsvps } = data;
  const theme = getTheme(event.theme);

  // Filtered RSVPs by search query
  const filteredRsvps = rsvps.filter(r => 
    r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.note && r.note.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Eventos</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateGuest(eventCode)}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <span>Ver como Invitado</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Evento / Fecha</span>
          </button>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className={`${theme.headerBg} rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase mb-2">
              <span>{theme.icon}</span>
              <span>{theme.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{event.title}</h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-white/90">
              {eventDateFormatted && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/80" />
                  <span>Evento: {eventDateFormatted}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-lg font-mono">
                <span>Código: <strong>{eventCode}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Sharing Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 space-y-2 no-print">
            <div className="text-[11px] uppercase font-bold text-white/80">Enlace para invitados:</div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-white text-slate-800 text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-slate-100 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS & GENERAL STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total General People */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Gran Total</span>
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalGuests}</div>
          <div className="text-xs font-semibold text-pink-600 mt-1">Personas confirmadas</div>
        </div>

        {/* Total Rsvps (Titulares) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Titulares</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRsvps}</div>
          <div className="text-xs font-semibold text-purple-600 mt-1">Grupos / Registros</div>
        </div>

        {/* Extra Companions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Acompañantes</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCompanions}</div>
          <div className="text-xs font-semibold text-indigo-600 mt-1">Invitados adicionales</div>
        </div>

        {/* Deadline Status */}
        <div className={`p-5 rounded-3xl border shadow-sm ${
          isClosed ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Fecha Límite</span>
            <div className={`p-2 rounded-xl ${isClosed ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-black text-slate-900 line-clamp-1">
            {deadlineFormatted || 'Sin límite'}
          </div>
          <div className={`text-xs font-extrabold mt-1 uppercase ${
            isClosed ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {isClosed ? '🔴 Registro Cerrado' : '🟢 Registro Activo'}
          </div>
        </div>

      </div>

      {/* GUEST LIST & PERSONAL BREAKDOWN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Lista Detallada de Asistencia</span>
              <span className="text-xs font-bold text-slate-400">({rsvps.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Desglose personal de cada invitado que ha confirmado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Manual RSVP Button */}
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Agregar Invitado</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Printable Header for Event Check-In */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-2xl font-black">{event.title} - Lista de Asistencia</h1>
          <p className="text-sm text-slate-600">Total confirmados: {totalGuests} personas ({totalRsvps} registros)</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-200 tracking-wider">
                <th className="py-3 px-5">Invitado Titular</th>
                <th className="py-3 px-4 text-center">Acompañantes</th>
                <th className="py-3 px-4 text-center">Total Lugares</th>
                <th className="py-3 px-5">Nota / Mensaje</th>
                <th className="py-3 px-5">Fecha Confirmación</th>
                <th className="py-3 px-4 text-right no-print">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRsvps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                    {searchQuery ? 'No se encontraron invitados con esa búsqueda.' : 'Aún no hay confirmaciones registradas para este evento.'}
                  </td>
                </tr>
              ) : (
                filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      {rsvp.guestName}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {rsvp.companionsCount > 0 ? `+${rsvp.companionsCount}` : '0'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs">
                        {rsvp.totalSeats}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-500 max-w-xs truncate">
                      {rsvp.note ? (
                        <span className="flex items-center gap-1.5 italic" title={rsvp.note}>
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>"{rsvp.note}"</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(rsvp.createdAt).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right no-print">
                      <button
                        onClick={() => handleDeleteRsvp(rsvp.id, rsvp.guestName)}
                        title="Eliminar confirmación"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: MANUAL RSVP */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Registrar Invitado Manualmente</h3>
            <p className="text-xs text-slate-500 mb-4">
              Útil si alguien te confirmó directamente por WhatsApp o llamada telefónica.
            </p>

            <form onSubmit={handleAddManualRsvp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ej. Tía Rosa Morales"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acompañantes adicionales</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={manualCompanions}
                  onChange={(e) => setManualCompanions(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-sm outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Total de lugares: {1 + (parseInt(manualCompanions, 10) || 0)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nota (Opcional)</label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="Ej. Confirmó por llamada / Viene de fuera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={manualSubmitting || !manualName.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                {manualSubmitting ? 'Guardando...' : 'Guardar Invitado'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EVENT & DEADLINE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Editar Configuración del Evento</h3>
            <p className="text-xs text-slate-500 mb-4">
              Modifica la fecha límite de confirmación, título, lugar o estilo del evento.
            </p>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              {/* DEADLINE EDITING */}
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                <label className="block text-xs font-bold text-rose-800 mb-1">
                  Fecha Límite para Confirmar Asistencia *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={editDeadlineDate}
                  onChange={(e) => setEditDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs outline-none bg-white font-medium"
                />
                <span className="text-[10px] text-rose-600 mt-1 block font-medium">
                  Al llegar esta fecha y hora, los invitados no podrán enviar más confirmaciones.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha del Evento</label>
                <input
                  type="datetime-local"
                  value={editEventDate}
                  onChange={(e) => setEditEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lugar / Salón</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Mensaje</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={editSubmitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
