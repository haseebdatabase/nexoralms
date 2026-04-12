import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, AlertTriangle, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { alerts } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type, severity) => {
    if (type.includes('finance')) {
      return severity === 'critical' ? <AlertTriangle className="text-red-500" /> : <ShieldCheck className="text-blue-500" />;
    }
    return severity === 'critical' ? <AlertTriangle className="text-red-500" /> : <Clock className="text-amber-500" />;
  };

  const getStyles = (severity) => {
    switch(severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20';
      case 'warning': return 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20';
      default: return 'border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-primary-500" />
            System Notifications
          </h2>
          <p className="text-dark-muted font-medium mt-1">
            Auto-Pilot scanning has dynamically generated these urgent alerts.
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border bg-slate-900/60 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            Alert Feed
          </h3>
          <span className="text-xs bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full font-bold">
            {alerts.length} Detected
          </span>
        </div>

        <div className="divide-y divide-dark-border max-h-[70vh] overflow-y-auto custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-dark-muted text-center">
              <Bell size={48} className="opacity-20 mb-4" />
              <h4 className="font-bold text-white mb-1">All Clear</h4>
              <p className="text-sm max-w-sm">No critical deadlines or pending payments detected.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-6 flex items-start gap-5 transition-all border-l-4 ${getStyles(alert.severity)}`}
              >
                <div className="mt-1 bg-slate-900 p-2 rounded-xl shadow-lg border border-white/5">
                  {getIcon(alert.type, alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-white">{alert.title}</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">{alert.message}</p>
                  
                  <button 
                    onClick={() => navigate(alert.actionLink)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-400 hover:text-white transition-colors"
                  >
                    Resolve Issue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
