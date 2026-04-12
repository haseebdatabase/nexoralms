import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CredentialsVault from '../components/CredentialsVault';
import { 
  Bell, 
  Search, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  LayoutPanelLeft 
} from 'lucide-react';

const DashboardLayout = () => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050b1a] text-slate-100 font-sans selection:bg-primary-500/30 selection:text-white">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-x-hidden">
        {/* Elite Topbar */}
        <header className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="System search (Students, Courses, Tasks)..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-medium text-sm shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Access Vault Toggle */}
            <button 
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/20"
            >
              <ShieldCheck size={16} />
              Credentials Vault
            </button>

            <button className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-primary-500/50 transition-all relative group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full border-2 border-[#050b1a] shadow-lg shadow-red-900/40"></span>
            </button>
            
            <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
            
            <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <User size={20} />
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-white leading-none mb-1">HM Nexora</p>
                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">Handler Dev</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content with Slide Animation */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <Outlet />
        </div>

        {/* Cinematic Backdrop Elements - DISABLED FOR STABILITY */}
        {/* <div className="fixed top-[-15%] right-[-5%] w-[45%] h-[45%] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen opacity-50"></div> */}
        {/* <div className="fixed bottom-[-10%] left-[15%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30"></div> */}
      </main>

      {/* Slide-out Credentials Vault Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-[#0a0f1a] border-l border-white/5 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out ${isVaultOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500">
              <ShieldCheck size={20} />
            </div>
            <h2 className="font-bold text-lg">Elite Vault</h2>
          </div>
          <button onClick={() => setIsVaultOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <CredentialsVault />
      </div>

      {/* Drawer Overlay */}
      {isVaultOpen && (
        <div 
          onClick={() => setIsVaultOpen(false)}
          className="fixed inset-0 bg-black/60 z-[90] animate-in fade-in duration-300"
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
