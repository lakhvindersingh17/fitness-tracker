"use client";

import { BarChart2, ClipboardList, Plus, TrendingUp, User } from "lucide-react";
import React from "react";

export function BottomNav({ activeTab }: { activeTab: 'home' | 'log' | 'add' | 'trends' | 'me' }) {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-2 pb-safe sm:pb-2 rounded-t-2xl z-50">
      <div className="flex items-center justify-around">
        <NavIcon icon={<BarChart2 />} label="Dash" active={activeTab === 'home'} onClick={() => window.location.href='/'} />
        <NavIcon icon={<ClipboardList />} label="Log" active={activeTab === 'log'} onClick={() => window.location.href='/workout'} />
        <div className="flex-1 flex justify-center mt-[-32px]">
          <button onClick={() => window.location.href='/diet'} className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/40 border-4 border-[#0A0C10] flex items-center justify-center text-white">
            <Plus className="w-8 h-8 text-white" />
          </button>
        </div>
        <NavIcon icon={<TrendingUp />} label="Trends" active={activeTab === 'trends'} onClick={() => window.location.href='/trends'} />
        <NavIcon icon={<User />} label="Me" active={activeTab === 'me'} onClick={() => window.location.href='/profile'} />
      </div>
    </div>
  );
}

function NavIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className={`mb-1 flex items-center justify-center w-6 h-6 ${active ? 'scale-110' : ''} transition-transform [&_svg]:w-6 [&_svg]:h-6`}>
        {icon}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}
