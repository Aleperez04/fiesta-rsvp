export const THEMES = {
  cumpleanos: {
    id: 'cumpleanos',
    name: 'Cumpleaños',
    icon: '🎂',
    badge: '¡Festejemos a lo grande!',
    bgGradient: 'from-fuchsia-900 via-purple-900 to-indigo-950',
    headerBg: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
    cardBg: 'bg-white/95 backdrop-blur-md shadow-2xl border border-purple-100',
    accentText: 'text-purple-600',
    accentBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200',
    accentBorder: 'border-purple-300 focus:border-purple-500 focus:ring-purple-200',
    badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
    tagline: 'Prepara tu mejor outfit y ven a celebrar con nosotros',
    decorations: ['🎈', '✨', '🎉', '🎁']
  },
  infantil: {
    id: 'infantil',
    name: 'Fiesta Infantil',
    icon: '🎈',
    badge: '¡Una fiesta súper divertida!',
    bgGradient: 'from-amber-400 via-rose-400 to-cyan-500',
    headerBg: 'bg-gradient-to-r from-yellow-400 via-pink-400 to-teal-400',
    cardBg: 'bg-white/95 backdrop-blur-md shadow-2xl border-4 border-yellow-200 rounded-3xl',
    accentText: 'text-rose-500',
    accentBg: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-200',
    accentBorder: 'border-amber-300 focus:border-rose-400 focus:ring-rose-200',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    tagline: 'Juegos, dulces, sorpresas y muchísima diversión',
    decorations: ['🍭', '⭐', '🚀', '🎨']
  },
  revelacion: {
    id: 'revelacion',
    name: 'Revelación de Género',
    icon: '🍼',
    badge: '¿Niño o Niña? ¡Acompáñanos a descubrirlo!',
    bgGradient: 'from-sky-300 via-pink-200 to-sky-400',
    headerBg: 'bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400',
    cardBg: 'bg-white/95 backdrop-blur-md shadow-2xl border border-pink-100 rounded-3xl',
    accentText: 'text-sky-600',
    accentBg: 'bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:opacity-90 text-white shadow-sky-200',
    accentBorder: 'border-sky-300 focus:border-pink-400 focus:ring-pink-200',
    badgeBg: 'bg-gradient-to-r from-sky-100 to-pink-100 text-purple-800 border-pink-200',
    tagline: 'Viste de tu predicción: ¿Team Rosa 🌸 o Team Azul 🚙?',
    decorations: ['🎀', '🧸', '🍼', '✨']
  },
  boda: {
    id: 'boda',
    name: 'Boda / Aniversario',
    icon: '💍',
    badge: 'Nuestra Historia de Amor',
    bgGradient: 'from-stone-900 via-neutral-900 to-amber-950',
    headerBg: 'bg-gradient-to-r from-amber-200 via-stone-200 to-amber-300 text-stone-900',
    cardBg: 'bg-stone-50/95 backdrop-blur-md shadow-2xl border border-amber-200/60 rounded-2xl',
    accentText: 'text-amber-800',
    accentBg: 'bg-amber-700 hover:bg-amber-800 text-amber-50 shadow-amber-200',
    accentBorder: 'border-amber-300 focus:border-amber-600 focus:ring-amber-200',
    badgeBg: 'bg-amber-100/80 text-amber-900 border-amber-300',
    tagline: 'El amor se celebra con quienes más queremos',
    decorations: ['🥂', '🕊️', '💐', '✨']
  },
  casual: {
    id: 'casual',
    name: 'Fiesta Casual / BBQ',
    icon: '🍕',
    badge: '¡Buena comida, bebidas y amigos!',
    bgGradient: 'from-orange-800 via-amber-900 to-stone-900',
    headerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    cardBg: 'bg-white/95 backdrop-blur-md shadow-2xl border border-orange-100 rounded-2xl',
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200',
    accentBorder: 'border-orange-300 focus:border-orange-500 focus:ring-orange-200',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    tagline: 'Ven a pasar un rato agradable, relajado y con grandes pláticas',
    decorations: ['🍔', '🍻', '🎶', '🔥']
  },
  graduacion: {
    id: 'graduacion',
    name: 'Graduación',
    icon: '🎓',
    badge: '¡Celebrando esta gran meta alcanzada!',
    bgGradient: 'from-slate-950 via-blue-950 to-indigo-950',
    headerBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-400',
    cardBg: 'bg-white/95 backdrop-blur-md shadow-2xl border border-blue-100 rounded-2xl',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-200',
    accentBorder: 'border-blue-300 focus:border-blue-600 focus:ring-blue-200',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
    tagline: 'El fin de una gran etapa y el inicio de un futuro brillante',
    decorations: ['🏆', '📜', '⭐', '🎓']
  }
};

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES.cumpleanos;
}
