import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate, label = "Tiempo restante para confirmar" }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
        <Clock className="w-4 h-4 text-rose-500" />
        <span>El tiempo límite para confirmar ya ha finalizado.</span>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto text-center">
        <div className="bg-slate-100/90 rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800">{timeLeft.days}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Días</div>
        </div>
        <div className="bg-slate-100/90 rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800">{timeLeft.hours}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Horas</div>
        </div>
        <div className="bg-slate-100/90 rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800">{timeLeft.minutes}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Min</div>
        </div>
        <div className="bg-slate-100/90 rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800">{timeLeft.seconds}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Seg</div>
        </div>
      </div>
    </div>
  );
}
