import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckSquare, 
  Square, 
  Search, 
  Filter, 
  Zap,
  BookOpen,
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

const BulkUpdate = () => {
  const { students } = useStudents();
  const { tasks } = useTasks();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('Quiz');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get unique subjects
  const subjects = useMemo(() => {
    const set = new Set();
    students.forEach(s => s.subjects?.forEach(sub => set.add(sub.toUpperCase())));
    return Array.from(set).sort();
  }, [students]);

  // Filter students by subject
  const studentsInSubject = useMemo(() => {
    if (!selectedSubject) return [];
    return students.filter(s => s.subjects?.some(sub => sub.toUpperCase() === selectedSubject));
  }, [selectedSubject, students]);

  const toggleStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === studentsInSubject.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsInSubject.map(s => s.id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedStudents.length === 0) return toast.error('No students selected');
    
    setIsUpdating(true);
    const batch = writeBatch(db);
    let count = 0;

    try {
      selectedStudents.forEach((studentId) => {
        // Find existing task or create new one
        const existingTask = tasks.find(t => 
          t.studentId === studentId && 
          t.subject.toUpperCase() === selectedSubject && 
          t.type === selectedType && 
          t.status === 'pending'
        );

        if (existingTask) {
          batch.update(doc(db, 'tasks', existingTask.id), {
            status: 'completed',
            updatedAt: serverTimestamp()
          });
          count++;
        }
      });

      if (count === 0) {
        toast.error('No pending tasks found for selected students/subject');
      } else {
        await batch.commit();
        toast.success(`Successfully updated ${count} tasks to Completed!`);
        setSelectedStudents([]);
      }
    } catch (error) {
      toast.error('Bulk update failed');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Bulk Activity Manager</h2>
          <p className="text-dark-muted">High-speed batch processing for major LMS activities.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-6 py-2 flex items-center gap-3 border-primary-500/30">
            <Zap className="text-amber-500 fill-amber-500" size={20} />
            <div>
              <p className="text-[10px] font-bold text-dark-muted uppercase">Fast Mode</p>
              <p className="text-sm font-bold text-white">ACTIVE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Header */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-sm font-bold text-dark-muted mb-2 uppercase tracking-wider">1. Select Subject</label>
          <select 
            className="input-field h-12"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">Choose Course...</option>
            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-dark-muted mb-2 uppercase tracking-wider">2. Activity Type</label>
          <select 
            className="input-field h-12"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option>Quiz</option>
            <option>Assignment</option>
            <option>GDB</option>
            <option>Mid-Term</option>
            <option>Final-Term</option>
          </select>
        </div>
        <button 
          onClick={handleBulkUpdate}
          disabled={isUpdating || selectedStudents.length === 0}
          className="btn-primary h-12 flex items-center justify-center gap-3 font-bold text-lg"
        >
          {isUpdating ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={20} />}
          Process Batch ({selectedStudents.length})
        </button>
      </div>

      {/* Student Multi-Select List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-dark-border bg-slate-900/30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors"
            >
              {selectedStudents.length === studentsInSubject.length && studentsInSubject.length > 0 ? (
                <CheckSquare size={20} />
              ) : (
                <Square size={20} />
              )}
              {selectedStudents.length === studentsInSubject.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-dark-muted font-bold">|</span>
            <p className="text-sm text-dark-muted">
              {studentsInSubject.length} Students found for {selectedSubject || '...'}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Ready for Batch Update
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-dark-border overflow-y-auto max-h-[500px]">
          {studentsInSubject.map(student => (
            <button
              key={student.id}
              onClick={() => toggleStudent(student.id)}
              className={`flex items-center gap-4 p-4 text-left transition-all hover:bg-slate-900 group ${
                selectedStudents.includes(student.id) ? 'bg-primary-600/5' : ''
              }`}
            >
              <div className={`transition-colors ${selectedStudents.includes(student.id) ? 'text-primary-500' : 'text-dark-muted'}`}>
                {selectedStudents.includes(student.id) ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <div className="overflow-hidden">
                <p className={`font-bold transition-colors truncate ${selectedStudents.includes(student.id) ? 'text-white' : 'text-slate-400'}`}>
                  {student.name}
                </p>
                <p className="text-xs text-dark-muted font-mono">{student.vuId}</p>
              </div>
            </button>
          ))}
          {studentsInSubject.length === 0 && (
            <div className="col-span-full py-20 text-center text-dark-muted italic opacity-50">
              {selectedSubject ? 'No students found for this subject.' : 'Select a subject to begin batch processing.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpdate;
