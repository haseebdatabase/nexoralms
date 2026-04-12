import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  TrendingUp, 
  Trash2, 
  Mail, 
  Lock,
  Activity,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import toast from 'react-hot-toast';

const TeamManager = () => {
  const { assistants, loading, addAssistant, removeAssistant } = useTeam();
  const { students } = useStudents();
  const { tasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    email: '',
    password: ''
  });

  const getAssistantStats = (assistantId) => {
    const studentCount = students.filter(s => s.assignedAssistantId === assistantId).length;
    const assistantTasks = tasks.filter(t => t.assignedAssistantId === assistantId);
    const completedCount = assistantTasks.filter(t => t.status === 'completed').length;
    const taskRate = assistantTasks.length > 0 ? (completedCount / assistantTasks.length) * 100 : 0;
    
    return { studentCount, taskRate: taskRate.toFixed(0), totalTasks: assistantTasks.length };
  };

  const handleAddAssistant = async (e) => {
    e.preventDefault();
    try {
      await addAssistant(newAssistant);
      setIsModalOpen(false);
      setNewAssistant({ name: '', email: '', password: '' });
      toast.success('Assistant added to team');
    } catch (error) {
      toast.error('Failed to add assistant');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Team Management</h2>
          <p className="text-dark-muted">Manage your assistants and track their handling performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          <span>Add Assistant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary-600 bg-primary-600/5">
          <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Total Team Size</p>
          <p className="text-3xl font-black text-white">{assistants.length + 1} Members</p>
          <p className="text-xs text-primary-500 mt-2 font-bold">1 Owner + {assistants.length} Assistants</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-600 bg-emerald-600/5">
          <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Students Assigned</p>
          <p className="text-3xl font-black text-white">{students.filter(s => s.assignedAssistantId).length}</p>
          <p className="text-xs text-emerald-500 mt-2 font-bold">Delegated to your team</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-600 bg-amber-600/5">
          <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Network Capacity</p>
          <p className="text-3xl font-black text-white">94%</p>
          <p className="text-xs text-amber-500 mt-2 font-bold">Operational Efficiency</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/30 border-b border-dark-border flex items-center gap-2">
          <Briefcase className="text-primary-500" size={18} />
          <h3 className="font-bold text-lg text-white">Active Assistants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-dark-border">
                <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Assistant Name</th>
                <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Students</th>
                <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Progress Rate</th>
                <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {assistants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-dark-muted opacity-50 italic">
                    You haven't added any assistants yet. Start delegating to grow your team!
                  </td>
                </tr>
              ) : (
                assistants.map((assistant) => {
                  const stats = getAssistantStats(assistant.id);
                  return (
                    <tr key={assistant.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary-500 font-bold border border-slate-700">
                            {assistant.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white uppercase text-sm tracking-tight">{assistant.name}</p>
                            <p className="text-[10px] text-dark-muted">{assistant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-500" />
                          <span className="font-bold text-white">{stats.studentCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700 mb-1">
                          <div 
                            className="bg-emerald-600 h-full transition-all duration-700" 
                            style={{ width: `${stats.taskRate}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-between">
                          <span>{stats.taskRate}% Success</span>
                          <span>{stats.totalTasks} Tasks</span>
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Activity size={12} /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => removeAssistant(assistant.id)}
                          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assistant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-8 relative animate-in zoom-in duration-300 border-t-4 border-t-primary-600">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <UserPlus className="text-primary-500" />
              New Assistant Login
            </h3>
            <form onSubmit={handleAddAssistant} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5">Display Name</label>
                <div className="relative group">
                  <Briefcase title="Assistant Name" className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input 
                    type="text" required className="input-field pl-10" placeholder="e.g. Hassan Ali"
                    value={newAssistant.name} onChange={e => setNewAssistant({...newAssistant, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5">Email / Username</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input 
                    type="email" required className="input-field pl-10" placeholder="assistant@nexora.com"
                    value={newAssistant.email} onChange={e => setNewAssistant({...newAssistant, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5">Access Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input 
                    type="password" required className="input-field pl-10" placeholder="••••••••"
                    value={newAssistant.password} onChange={e => setNewAssistant({...newAssistant, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary font-bold">Cancel</button>
                <button type="submit" className="flex-1 btn-primary font-bold shadow-lg shadow-primary-900/40">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
