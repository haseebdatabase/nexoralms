import React, { useMemo, useState } from 'react';
import { Target, Radar, ClipboardCopy, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { useGlobalActivities } from '../hooks/useGlobalActivities';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalRadar = () => {
  const { globalActivities, loading: radarLoading } = useGlobalActivities();
  const { students } = useStudents();
  const { addTask } = useTasks();
  const { userData } = useAuth();
  
  const [adoptingId, setAdoptingId] = useState(null);

  // Group current user's students by subject
  const studentsBySubject = useMemo(() => {
    const map = {};
    students.forEach(student => {
      if (student.subjects) {
        student.subjects.forEach(subject => {
          const subUpper = subject.toUpperCase();
          if (!map[subUpper]) map[subUpper] = [];
          map[subUpper].push({ id: student.id, name: student.name });
        });
      }
    });
    return map;
  }, [students]);

  const handleAdoptActivity = async (activity) => {
    const relevantStudents = studentsBySubject[activity.subject.toUpperCase()];
    if (!relevantStudents || relevantStudents.length === 0) {
      toast.error(`You have no students enrolled in ${activity.subject}`);
      return;
    }

    setAdoptingId(activity.id);
    let successCount = 0;

    try {
      // Create a specific task for each relevant student
      for (const student of relevantStudents) {
        await addTask({
          studentId: student.id,
          studentName: student.name,
          subject: activity.subject,
          type: activity.type,
          deadline: activity.deadline,
          priority: activity.priority,
          desc: `(Discovered via Radar) Synchronized task detected by ${activity.createdByHandlerName}.`
        });
        successCount++;
      }
      toast.success(`Adopted task for ${successCount} student(s)!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to adopt activity.');
    } finally {
      setAdoptingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Target className="text-primary-500" />
            Global Activity Radar
          </h2>
          <p className="text-dark-muted mt-1">
            Stay synced with other handlers. Discover LMS activities detected across the SaaS Hive.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-6 py-2 flex items-center gap-3 border-emerald-500/30">
            <Radar className="text-emerald-500 animate-pulse fill-emerald-500/20" size={20} />
            <div>
              <p className="text-[10px] font-bold text-dark-muted uppercase">Radar Status</p>
              <p className="text-sm font-bold text-emerald-400">SCANNING</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-dark-border bg-slate-900/30">
          <h3 className="font-bold flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500"/> Activity Feed
          </h3>
          <span className="text-xs bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full font-bold">
            {globalActivities.length} Detections
          </span>
        </div>

        {radarLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-primary-500" size={32} />
          </div>
        ) : globalActivities.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-dark-muted text-center">
            <Radar size={48} className="opacity-20 mb-4" />
            <h4 className="font-bold text-white mb-1">Radar is Clear</h4>
            <p className="text-sm max-w-sm">No global activities have been detected yet. When a handler adds an activity, it will ping here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-border">
            <AnimatePresence>
              {globalActivities.map((activity, idx) => {
                const subUpper = activity.subject.toUpperCase();
                const relevantStudents = studentsBySubject[subUpper] || [];
                const isRelevant = relevantStudents.length > 0;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={activity.id} 
                    className={`p-6 transition-colors ${isRelevant ? 'bg-primary-900/10 hover:bg-primary-800/10' : 'hover:bg-slate-900'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${isRelevant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                            {activity.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-dark-muted font-bold">
                            By {activity.createdByHandlerName}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-white">{activity.subject}</h4>
                        <p className="text-sm text-slate-400 bg-slate-900 inline-block px-2 py-1 rounded mt-2 border border-slate-800">
                          Deadline: {activity.deadline}
                        </p>
                      </div>
                      
                      {isRelevant && (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-primary-400 bg-primary-900/40 px-2 py-1 rounded-full mb-2 inline-block">
                            {relevantStudents.length} MATCHING STUDENT(S)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {isRelevant ? (
                      <button
                        onClick={() => handleAdoptActivity(activity)}
                        disabled={adoptingId === activity.id}
                        className="w-full btn-primary h-10 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        {adoptingId === activity.id ? <Loader2 className="animate-spin" size={16} /> : <ClipboardCopy size={16} />}
                        ADOPT TASK FOR {relevantStudents.length} STUDENTS
                      </button>
                    ) : (
                      <div className="w-full h-10 border border-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500 gap-2 bg-slate-900/50">
                        <AlertCircle size={14} /> NO RELEVANT STUDENTS MATCHED
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalRadar;
