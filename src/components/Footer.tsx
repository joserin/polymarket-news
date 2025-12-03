import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-3xl h-full border border-dashed border-slate-700 bg-slate-800/50 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <div className="text-center">
            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">Sponsored</p>
            <p className="text-sm text-slate-300 font-medium">Place your advertisement here. Reach thousands of predictors.</p>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        .group-hover\\:animate-shimmer {
            animation: shimmer 1.5s infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;