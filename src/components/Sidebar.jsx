import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Zap,
  Target,
  ShieldAlert,
  ChevronRight,
  Calculator,
  Briefcase,
  Radar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const Sidebar = () => {
  const { logout, userData } = useAuth();
  const { alerts, criticalCount } = useNotifications();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Client Manager', path: '/clients' },
    { icon: Zap, label: 'Bulk Tracker', path: '/bulk-update' },
    { icon: Radar, label: 'Global Radar', path: '/radar' },
    { icon: ClipboardList, label: 'LMS Tracker', path: '/tracker' },
    { icon: Calculator, label: 'Grade Predictor', path: '/marks' },
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: CreditCard, label: 'Revenue Manager', path: '/revenue' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  // Only Owner sees Team Management
  if (userData?.role === 'owner') {
    navItems.splice(2, 0, { icon: Briefcase, label: 'Team Manager', path: '/team' });
  }

  return (
    <aside className="w-64 h-screen glass-card rounded-none border-y-0 border-l-0 fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-900/40">
            N
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">Nexora LMS</h1>
            <span className="text-[10px] text-primary-400 font-black tracking-widest uppercase">{userData?.role || 'SaaS'} EDITION</span>
          </div>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive ? 'active bg-primary-600/20 text-white border-r-4 border-primary-600' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
                <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
              </div>
              
              {item.label === 'Notifications' && alerts.length > 0 && (
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shadow-lg ${
                  criticalCount > 0 ? 'bg-red-500 text-white shadow-red-500/50 animate-pulse' : 'bg-blue-500 text-white shadow-blue-500/40'
                }`}>
                  {alerts.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-dark-border bg-[#0a0f1a]">
        <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 ring-1 ring-white/5">
          <div className="w-10 h-10 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30 font-black">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userData?.name || 'User'}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] text-primary-500 font-black uppercase tracking-widest">{userData?.role || 'Handler'}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          <span className="font-black text-[10px] uppercase tracking-widest">Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
