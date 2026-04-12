import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const { students } = useStudents();
  const { tasks } = useTasks();

  // 1. Revenue Metrics
  const revenueData = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let processing = 0;

    students.forEach(s => {
      s.feeDetails?.installments?.forEach(i => {
        if (i.status === 'paid') collected += parseFloat(i.amount);
        else if (i.status === 'pending_verification') processing += parseFloat(i.amount);
        else pending += parseFloat(i.amount);
      });
    });

    return [
      { name: 'Collected', value: collected },
      { name: 'Processing', value: processing },
      { name: 'Pending', value: pending },
    ];
  }, [students]);

  // 2. Subject Yield Metrics
  const subjectData = useMemo(() => {
    const map = {};
    students.forEach(s => {
      s.subjects?.forEach(sub => {
        const key = sub.toUpperCase();
        map[key] = (map[key] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // top 10 subjects
  }, [students]);

  // 3. Task Completion Metrics
  const taskData = useMemo(() => {
    let completed = 0;
    let pending = 0;
    tasks.forEach(t => {
      if (t.status === 'completed') completed++;
      else pending++;
    });
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
  }, [tasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-primary-500" />
            Analytics Command Center
          </h2>
          <p className="text-dark-muted font-medium">Platform-wide telemetry and performance yields.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Financial Yield */}
        <div className="glass-card p-6 col-span-1 lg:col-span-1 border-t-2 border-t-emerald-500 h-[380px]">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Revenue Flow
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value" stroke="none"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Top Subjects */}
        <div className="glass-card p-6 col-span-1 lg:col-span-2 border-t-2 border-t-primary-500 h-[380px]">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users size={16} className="text-primary-500" /> Enrollment Demographics
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                  contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #0ea5e9', borderRadius: '12px', fontWeight: 'bold' }} 
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 3: Task Flow */}
        <div className="glass-card p-6 col-span-1 lg:col-span-3 border-t-2 border-t-amber-500 h-[300px] flex gap-8 items-center">
          <div className="w-1/3">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={16} className="text-amber-500" /> Handler Task Output
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-500 font-bold">Resolved</span>
                <span className="text-2xl font-black text-white">{taskData[0].value}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <span className="text-amber-500 font-bold">In-Queue</span>
                <span className="text-2xl font-black text-white">{taskData[1].value}</span>
              </div>
            </div>
          </div>
          <div className="w-2/3 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #f59e0b', borderRadius: '12px' }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                   <Cell fill="#10b981" />
                   <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
