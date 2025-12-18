import { useEffect, useState } from 'react';

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="inline-flex items-center gap-3 bg-white/95 text-gray-800 rounded-xl px-4 py-3 shadow-lg border border-white/10">
      <div className="font-mono text-xl font-semibold">{time}</div>
      <div className="text-sm opacity-80">{date}</div>
    </div>
  );
};

export default LiveClock;

