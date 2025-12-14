import React from 'react';

interface SidebarProps {
  predictions: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ predictions }) => {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol}`;
  };

  function formatearSoloFecha(fechaISO: any) {
    if (!fechaISO) return '';

    const fechaObj = new Date(fechaISO);
    const opcionesSoloFecha: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'    
    };
    return fechaObj.toLocaleDateString('en-US', opcionesSoloFecha);
  }

  return (
    <div className="w-full bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      <header className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-blue-400">
          <picture>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
            >
              <path d="M3 17l6 -6l4 4l8 -8" />
              <path d="M14 7l7 0l0 7" />
            </svg>
          </picture>
          <h2 className="font-bold text-sm tracking-wider uppercase">Top 10 markets today</h2>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-1 space-y-2 custom-scrollbar">
        {predictions.map((item, index) => (
          <div 
            key={item.id} 
            className="group p-1 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 cursor-default"
          >
            <section className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-slate-500">#{index + 1}</span>

              <h3 className="text-sm font-medium max-w-[70%] text-center text-slate-200 line-clamp-2 mb-1 leading-snug group-hover:text-white">
                {item.title}
              </h3>
              
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                {formatVolume(item.volume24hr)} Vol
              </span>
            </section>
            <section className="flex flex-row gap-5 justify-between items-center">
              <article className="text-center flex gap-5 w-1/2 justify-center">
                <span>start</span>
                <p>{formatearSoloFecha(item.startDate)}</p>
              </article>
              <article className="text-center flex gap-5 w-1/2 justify-center">
                <span>End</span>
                <p>{formatearSoloFecha(item.endDate)}</p>
              </article>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;