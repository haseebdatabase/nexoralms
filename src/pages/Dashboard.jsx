import React, { useMemo } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { userData } = useAuth();
  const { students, loading: studentsLoading } = useStudents();
  const { tasks, loading: tasksLoading } = useTasks();

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (studentsLoading || tasksLoading) return null;

    const totalStudents = students.length;
    const activeTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Revenue: Sum of student fees (mocking trend for now)
    const totalRevenue = students.reduce((acc, curr) => acc + (Number(curr.feeTotal) || 0), 0);
    
    // Due Payments: Count students with feeTotal > 0 (simplification for this build)
    const duePayments = students.filter(s => (Number(s.feeTotal) || 0) > 0).length;

    return [
      { name: 'Total Students', value: totalStudents.toLocaleString(), trend: '+0%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { name: 'Active Tasks', value: activeTasks.toString(), trend: 'Live', icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { name: 'Projected Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '100%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { name: 'Monitored Clients', value: duePayments.toString(), trend: 'Active', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];
  }, [students, tasks, studentsLoading, tasksLoading]);

  // Chart Data: Mocking activity distribution based on tasks
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      value: Math.floor(Math.random() * 500) + 300 // Temporary randomized real-feel
    }));
  }, []);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'pending')
      .slice(0, 3);
  }, [tasks]);

  if (studentsLoading || tasksLoading) {
    return <div className="h-[70vh] flex items-center justify-center text-primary-500 font-bold animate-pulse">Initializing Neural Dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <section>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {userData?.name || 'HM Nexora'}</h2>
        <p className="text-dark-muted font-medium italic">Your {userData?.role || 'LMS'} mission control is ready.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics?.map((stat) => (
          <div key={stat.name} className="glass-card p-6 group hover:border-primary-500/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                stat.trend.startsWith('+') || stat.trend === 'Live' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-dark-muted font-bold text-xs uppercase tracking-tighter mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="text-primary-500" size={20} />
              Activity Performance
            </h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">REAL-TIME SYNC</span>
            </div>
          </div>
          <div className="h-80 w-full hover:cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Section: Checklist */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Daily Agenda</h3>
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Calendar size={18} />
            </div>
          </div>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <div className="py-20 text-center opacity-30 italic text-sm">No pending extra-curricular tasks detected.</div>
            ) : (
              upcomingTasks.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-primary-500/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      item.type === 'Quiz' ? 'bg-red-500/20 text-red-500' : 
                      item.type === 'Assignment' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-bold text-dark-muted flex items-center gap-1">
                      <Clock size={10} />
                      {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <p className="font-bold text-sm mb-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{item.subject}</p>
                  <p className="text-[10px] text-dark-muted font-bold">TASK ID: {item.id.substring(0, 8).toUpperCase()}</p>
                </div>
              ))
            )}
            <button className="w-full py-3 mt-4 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:bg-primary-500/10 border border-primary-500/20 rounded-xl transition-all active:scale-95">
              Launch Task Matrix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
