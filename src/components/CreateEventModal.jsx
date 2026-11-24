import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, MapPin, AlignLeft, Check, AlertCircle } from 'lucide-react';
import { THEMES } from '../themes';

export default function CreateEventModal({ token, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('cumpleanos');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor ingresa el título o nombre del evento.');
      return;
    }
    if (!deadlineDate) {
      setError('Por favor define la fecha límite para confirmar asistencia.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          theme,
          description: description.trim(),
          eventDate,
          deadlineDate,
          location: location.trim(),
          address: address.trim(),
          mapUrl: mapUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el evento.');
      }

      onCreated(data.event);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generador de Fiestas y Eventos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Crear Nuevo Evento</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Se generará automáticamente un <strong className="text-slate-700">código único</strong> y un enlace para que tus invitados confirmen asistencia sin necesidad de registrarse.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Título del Evento o Fiesta <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cumpleaños #30 de Sofía / Boda Mariana & Carlos / Fiesta de Verano"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-sm font-medium outline-none transition"
            />
          </div>

          {/* Theme Selector (Predesigned styles) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Elige el Estilo Temático Predeterminado <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Este estilo definirá los colores, ambiente y diseño de la página que verán tus invitados:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(THEMES).map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{t.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates: Event Date and Deadline Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Fecha y Hora del Evento</span>
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-xs font-medium outline-none transition bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Cuándo se llevará a cabo la fiesta</span>
            </div>

            {/* DEADLINE DATE REQUIRED BY USER */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Fecha Límite para Confirmar <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="datetime-local"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rose-300 focus:border-rose-600 text-xs font-medium outline-none transition bg-white ring-1 ring-rose-200"
              />
              <span className="text-[10px] text-rose-600 font-medium mt-1 block">
                Después de este momento el registro se cerrará automáticamente.
              </span>
            </div>
          </div>

          {/* Location and Map */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre del Lugar / Salón (Opcional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Salón Jardín Los Arcos / Casa de Sofía"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-xs outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Av. Hidalgo #123, Col. Centro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-xs outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Enlace a Google Maps (Opcional)
              </label>
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-xs outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mensaje o Descripción de la Fiesta (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. ¡Te esperamos para celebrar este momento tan especial! Habrá cena, baile y sorpresas."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 text-xs outline-none transition resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-purple-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Evento y Generar Enlace</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
