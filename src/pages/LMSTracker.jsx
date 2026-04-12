import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon, 
  Filter, 
  Plus,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useStudents } from '../hooks/useStudents';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LMSTracker = () => {
  const { tasks, loading, addTask, updateTaskStatus, deleteTask } = useTasks();
  const { students } = useStudents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [newTask, setNewTask] = useState({
    studentId: '',
    studentName: '',
    type: 'Quiz',
    subject: '',
    deadline: '',
    priority: 'Medium'
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.studentId) return toast.error('Please select a student');
    
    try {
      await addTask(newTask);
      setIsModalOpen(false);
      setNewTask({ studentId: '', studentName: '', type: 'Quiz', subject: '', deadline: '', priority: 'Medium' });
      toast.success('Task added to tracker');
    } catch (error) {
      console.error("Task Addition Failed:", error);
      toast.error('Failed to add task');
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await updateTaskStatus(task.id, newStatus);
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">LMS Tracker</h2>
          <p className="text-dark-muted">Track and manage student activities across all subjects.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 px-6 shadow-cyan-900/40"
        >
          <Plus size={20} />
          <span>New Activity</span>
        </button>
      </div>

      {/* View Toggles */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/50 border border-dark-border rounded-xl w-fit">
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-dark-muted hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-12 text-center text-dark-muted">Syncing with LMS...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card">
              <ClipboardList className="mx-auto mb-4 text-dark-border" size={48} />
              <p className="text-dark-muted">No activities found in this view.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const deadlineDate = new Date(task.deadline);
              const isOverdue = deadlineDate < new Date() && task.status !== 'completed';
              const isUrgent = (deadlineDate - new Date()) < 86400000 && (deadlineDate - new Date()) > 0 && task.status !== 'completed';

              return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={task.id}
                className={`glass-card p-5 border-l-4 group transition-all h-full flex flex-col ${
                  task.status === 'completed' ? 'border-l-emerald-500 opacity-80' : 
                  isOverdue ? 'border-l-red-600 shadow-lg shadow-red-900/40' :
                  isUrgent ? 'border-l-cyan-400 shadow-lg shadow-cyan-900/40' :
                  task.priority === 'High' ? 'border-l-cyan-600' : 
                  task.priority === 'Medium' ? 'border-l-slate-600' : 'border-l-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                    task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.type}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteTask(task.id)} className="text-dark-muted hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className={`font-bold text-lg mb-1 ${task.status === 'completed' ? 'line-through text-dark-muted' : 'text-white'}`}>
                  {task.subject}: {task.type}
                </h4>
                <p className="text-sm text-dark-muted mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {task.studentName?.charAt(0)}
                  </span>
                  {task.studentName}
                </p>

                <div className="mt-auto pt-4 border-t border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-dark-muted">
                    <Clock size={14} />
                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => toggleStatus(task)}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                      task.status === 'completed' ? 'text-emerald-500 hover:text-emerald-400' : 'text-cyan-500 hover:text-cyan-400'
                    }`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    <span>{task.status === 'completed' ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
              </motion.div>
            );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/80" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card w-full max-w-lg p-8 relative animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold mb-6">New LMS Activity</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-muted mb-1.5">Select Student</label>
                <select 
                  required className="input-field"
                  value={newTask.studentId}
                  onChange={e => {
                    const student = students.find(s => s.id === e.target.value);
                    setNewTask({...newTask, studentId: e.target.value, studentName: student?.name || ''});
                  }}
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.vuId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1.5">Activity Type</label>
                  <select 
                    className="input-field"
                    value={newTask.type}
                    onChange={e => setNewTask({...newTask, type: e.target.value})}
                  >
                    <option>Quiz</option>
                    <option>Assignment</option>
                    <option>GDB</option>
                    <option>Mid-Term</option>
                    <option>Final-Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1.5">Subject</label>
                  <input 
                    type="text" required className="input-field" placeholder="e.g. CS101"
                    value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1.5">Deadline</label>
                  <input 
                    type="date" required className="input-field"
                    value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1.5">Priority</label>
                  <select 
                    className="input-field"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary shadow-cyan-900/40">Start Tracking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMSTracker;
