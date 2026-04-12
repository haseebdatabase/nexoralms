import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Target,
  ArrowUpRight,
  TrendingDown,
  Percent,
  Calculator
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import toast from 'react-hot-toast';

const MarksEntry = () => {
  const { students, updateStudent } = useStudents();
  const { tasks } = useTasks();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({
    quiz: '',
    assignment: '',
    mid: '',
    final: ''
  });

  const studentTasks = useMemo(() => {
    if (!selectedStudent) return [];
    return tasks.filter(t => t.studentId === selectedStudent.id);
  }, [selectedStudent, tasks]);

  const calculateGrade = () => {
    const q = parseFloat(marks.quiz || 0);
    const a = parseFloat(marks.assignment || 0);
    const m = parseFloat(marks.mid || 0);
    const f = parseFloat(marks.final || 0);
    
    // VU Formula Mock: Quiz(15%) + Assignment(15%) + Mid(20%) + Final(50%)
    const total = (q*1.5) + (a*1.5) + (m*0.5) + (f*1.0); // Simplified for demo
    const gpa = (total / 100) * 4.0;
    
    return { 
      total: total.toFixed(1), 
      gpa: gpa.toFixed(2),
      status: gpa >= 2.0 ? 'Passing' : 'Action Required'
    };
  };

  const gradeInfo = calculateGrade();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold">Marks & Grade Predictor</h2>
        <p className="text-dark-muted">Calculate performance metrics and project semester outcomes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Student Selector */}
        <div className="lg:col-span-1 glass-card flex flex-col h-[650px]">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-primary-500" />
              Active Students
            </h3>
            <input 
              type="text" 
              placeholder="Filter names..." 
              className="input-field h-10 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedStudent?.id === s.id 
                  ? 'bg-primary-600 text-white' 
                  : 'text-dark-muted hover:bg-slate-900 hover:text-white'
                }`}
              >
                <p className="font-bold truncate uppercase tracking-tight text-sm">{s.name}</p>
                <p className={`text-[10px] font-mono ${selectedStudent?.id === s.id ? 'text-primary-200' : 'text-slate-500'}`}>
                  {s.vuId}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Prediction UI */}
        <div className="lg:col-span-3 space-y-8">
          {!selectedStudent ? (
            <div className="glass-card h-[650px] flex flex-col items-center justify-center text-dark-muted opacity-40">
              <Target size={64} className="mb-4" />
              <p className="text-xl font-bold">Performance Analysis Ready</p>
              <p>Select a student to enter marks and predict grades.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-b-4 border-b-emerald-600 flex justify-between items-center bg-emerald-600/5">
                  <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Projected CGPA</p>
                    <p className="text-3xl font-black text-white">{gradeInfo.gpa}</p>
                  </div>
                  <TrendingUp className="text-emerald-500" size={32} />
                </div>
                <div className="glass-card p-6 border-b-4 border-b-primary-600 flex justify-between items-center bg-primary-600/5">
                  <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Total Weight</p>
                    <p className="text-3xl font-black text-white">{gradeInfo.total}%</p>
                  </div>
                  <Percent className="text-primary-500" size={32} />
                </div>
                <div className="glass-card p-6 border-b-4 border-b-amber-600 flex justify-between items-center bg-amber-600/5">
                  <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-1">Academic Status</p>
                    <p className={`text-xl font-black ${gradeInfo.status === 'Passing' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {gradeInfo.status}
                    </p>
                  </div>
                  <Trophy className={gradeInfo.status === 'Passing' ? 'text-emerald-500' : 'text-amber-500'} size={32} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Entry Form */}
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-6">Enter Marks (Current Session)</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quiz Average (%)</label>
                        <input 
                          type="number" className="input-field h-12 text-lg font-bold" 
                          value={marks.quiz} onChange={e => setMarks({...marks, quiz: e.target.value})}
                          placeholder="0" max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assignments (%)</label>
                        <input 
                          type="number" className="input-field h-12 text-lg font-bold" 
                          value={marks.assignment} onChange={e => setMarks({...marks, assignment: e.target.value})}
                          placeholder="0" max="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mid-Term Marks</label>
                        <input 
                          type="number" className="input-field h-12 text-lg font-bold" 
                          value={marks.mid} onChange={e => setMarks({...marks, mid: e.target.value})}
                          placeholder="0" max="40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                          Final Exam (Predicted)
                          <Target size={12} className="text-primary-500" />
                        </label>
                        <input 
                          type="number" className="input-field h-12 text-lg font-bold border-primary-500/30" 
                          value={marks.final} onChange={e => setMarks({...marks, final: e.target.value})}
                          placeholder="Goal?" max="60"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 p-4 rounded-2xl bg-slate-900/50 border border-dark-border">
                      <p className="text-xs font-bold text-dark-muted uppercase mb-3 tracking-widest">Prediction Tip</p>
                      <p className="text-sm leading-relaxed text-slate-300 italic">
                        "Increasing Final Exam marks by <span className="text-primary-500 font-bold">5 points</span> will boost this student's CGPA to <span className="text-emerald-500 font-bold">{(parseFloat(gradeInfo.gpa) + 0.2).toFixed(2)}</span>."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task correlation */}
                <div className="glass-card p-8 bg-slate-900/20 items-center justify-center flex flex-col">
                  <h3 className="text-xl font-bold mb-4 self-start">Recent Activity History</h3>
                  <div className="w-full space-y-3">
                    {studentTasks.slice(0, 4).map(task => (
                      <div key={task.id} className="flex justify-between items-center p-3 bg-dark-bg border border-dark-border rounded-xl">
                        <div>
                          <p className="font-bold text-xs uppercase">{task.subject}</p>
                          <p className="text-[10px] text-dark-muted">{task.type}</p>
                        </div>
                        <CheckCircle2 className="text-emerald-500" size={16} />
                      </div>
                    ))}
                    {studentTasks.length === 0 && <p className="text-center text-dark-muted py-8 italic">No previous activity logs found.</p>}
                  </div>
                  <button className="w-full btn-primary h-12 mt-8 font-bold flex items-center justify-center gap-2">
                    Save Academic Record
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;
