import { useState, useEffect } from 'react';

export default function WordRevealOverlay({ word, onDone }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(10, 20, 40, 0.75)' }}
    >
      <div
        className="flex flex-col items-center gap-6 rounded-3xl px-16 py-12 text-center shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)' }}
      >
        <p className="text-white/60 text-lg font-medium tracking-widest uppercase">
          Your word is
        </p>
        <h2
          className="text-white font-bold"
          style={{ fontSize: '3.5rem', letterSpacing: '-1px', textShadow: '0 0 40px rgba(99,179,237,0.4)' }}
        >
          {word}
        </h2>
        <p className="text-white/50 text-base">
          Drawing starts in{' '}
          <span className="text-white font-bold text-xl">{countdown}</span>
          ...
        </p>
        {/* Progress bar */}
        <div
          className="w-48 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(countdown / 3) * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
