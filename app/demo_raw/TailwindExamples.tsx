import React, { type FC } from "react";
import { ThunderboltFilled, FireFilled, SafetyCertificateFilled } from '@ant-design/icons';

const TailwindExamples: FC = () => {
  return (
    <div className="space-y-6">
      {/* Gradients & Animations Showcase */}
      <div className="space-y-4">
        <div className="group relative p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:border-cyan-500/30 transition-all overflow-hidden cursor-pointer">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ThunderboltFilled className="text-xl" />
            </div>
            <div>
              <div className="text-white font-bold group-hover:text-cyan-400 transition-colors">Turbo Engine V3</div>
              <div className="text-slate-500 text-xs mt-1">Real-time HMR with zero lag.</div>
            </div>
          </div>
          {/* Subtle Progress Bar */}
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-[65%] group-hover:w-full transition-all duration-1000 ease-out" />
          </div>
        </div>

        {/* Animated Card */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse mb-3">
             <FireFilled className="text-purple-400 text-2xl" />
          </div>
          <div className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            ELITE VERSION
          </div>
          <button className="mt-4 px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-bold tracking-tighter hover:bg-slate-200 transition-colors">
            UPGRADE NOW
          </button>
        </div>

        {/* Backdrop Blur Example */}
        <div className="relative h-24 rounded-xl overflow-hidden group">
           <img 
              src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80" 
              className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              alt="Cyber"
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl">
                 <span className="text-white text-xs font-bold tracking-widest flex items-center gap-2">
                    <SafetyCertificateFilled className="text-cyan-400" />
                    SECURE RUNTIME
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <label className="text-[10px] uppercase tracking-widest text-slate-600 font-bold block mb-4">Experimental Features</label>
        <div className="flex flex-wrap gap-2">
           <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-white/5">@tailwind-base</span>
           <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-white/5">jit-compiler</span>
           <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-white/5">dynamic-islands</span>
        </div>
      </div>
    </div>
  );
};

export default TailwindExamples;
