import React from 'react';
import type { CleanPrediction } from '../env.d';

interface SidebarProps {
  predictions: CleanPrediction[];
}

const Sidebar: React.FC<SidebarProps> = ({ predictions }) => {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol}`;
  };

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
                {item.question}
              </h3>
              
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                {formatVolume(item.volume)} Vol
              </span>
            </section>

            <section className="flex flex-row gap-2 justify-between items-center">
              {item.outcomes.slice(0, 2).map((outcome, i) => (
                <div key={i} className="flex justify-between items-center w-1/3">
                  <span className="text-slate-400">{outcome.label}</span>
                  <span className={`font-mono font-bold ${outcome.price > 0.5 ? 'text-blue-400' : 'text-slate-500'}`}>
                    {(outcome.price * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </section>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;