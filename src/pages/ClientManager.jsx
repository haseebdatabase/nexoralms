import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Book,
  GraduationCap,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Upload
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useTeam } from '../hooks/useTeam';
import toast from 'react-hot-toast';

const ClientManager = () => {
  const { students, loading, addStudent, deleteStudent } = useStudents();
  const { assistants } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    vuId: '',
    vuPassword: '',
    contactPrimary: '',
    contactSecondary: '',
    personalEmail: '',
    vuEmail: '',
    subjects: '',
    assignedAssistantId: '',
    portalPassword: 'portal123' // Default for new students
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vuId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const subjectArray = typeof newStudent.subjects === 'string' 
        ? newStudent.subjects.split(',').map(s => s.trim()).filter(s => s)
        : newStudent.subjects;

      const studentData = {
        ...newStudent,
        subjects: subjectArray
      };

      if (isEditMode) {
        await updateStudent(editingId, studentData);
        toast.success('Student updated successfully');
      } else {
        await addStudent(studentData);
        toast.success('Student added successfully');
      }

      closeModal();
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update student' : 'Failed to add student');
    }
  };

  const openEditModal = (student) => {
    setIsEditMode(true);
    setEditingId(student.id);
    setNewStudent({
      ...student,
      subjects: student.subjects?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setNewStudent({ 
      name: '', 
      vuId: '', 
      vuPassword: '', 
      contactPrimary: '',
      contactSecondary: '',
      personalEmail: '',
      vuEmail: '',
      subjects: '', 
      assignedAssistantId: '',
      portalPassword: 'portal123'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        toast.success('Student deleted');
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      
      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < rows.length; i++) { // Skip header
        const columns = rows[i].split(',').map(s => s.trim());
        if (columns.length < 2) continue;
        
        const [name, vuId, contactPrimary, personalEmail, vuEmail] = columns;
        if (!name || !vuId) {
          failCount++;
          continue;
        }

        try {
          await addStudent({
            name,
            vuId,
            contactPrimary: contactPrimary || '',
            personalEmail: personalEmail || '',
            vuEmail: vuEmail || '',
            vuPassword: 'ChangeMe123!', // Default password for bulk
            portalPassword: 'portal123',
            subjects: [],
            assignedAssistantId: ''
          });
          successCount++;
        } catch (error) {
          console.error("Bulk Import Error for row:", i, error);
          failCount++;
        }
      }
      toast.success(`Import complete: ${successCount} added, ${failCount} failed`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Client Manager</h2>
          <p className="text-dark-muted">Manage your student profiles and LMS credentials.</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-secondary flex items-center gap-2 cursor-pointer">
            <Upload size={18} />
            <span>Bulk Import</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 px-6 shadow-cyan-900/40"
          >
            <UserPlus size={20} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or VU ID..." 
            className="input-field pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900 border border-dark-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 min-w-[140px]">
            <option>All Subjects</option>
            {/* Unique subjects logic could be added here */}
          </select>
          <button className="btn-secondary px-4 flex items-center gap-2 text-sm">
            <Book size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-medium">
            <thead>
              <tr className="bg-slate-900/50 border-b border-dark-border">
                <th className="px-6 py-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">VU ID / Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Subjects</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Handler / Assistant</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-dark-muted font-bold tracking-widest uppercase text-xs">Syncing Academic Database...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-dark-muted italic">No students found. Add your first student to get started!</td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const assignedTo = assistants.find(a => a.id === student.assignedAssistantId)?.name || 'Direct (Owner)';
                  return (
                    <tr key={student.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-600/10 text-primary-500 flex items-center justify-center font-bold border border-primary-500/20">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white uppercase text-sm tracking-tight">{student.name}</p>
                            <p className="text-[10px] text-dark-muted font-mono">LMS PRO MEMBER</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-sm bg-slate-900 px-3 py-1 rounded-lg border border-dark-border text-primary-400 block w-fit">{student.vuId}</span>
                          <span className="text-[10px] text-dark-muted font-bold block pl-1">{student.contactPrimary}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {student.subjects?.map(sub => (
                            <span key={sub} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <UserCheck size={14} className="text-emerald-500" />
                            {assignedTo}
                          </div>
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(student)} className="p-2 hover:text-primary-500 transition-colors bg-slate-900 rounded-lg"><Edit size={16} /></button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-2 hover:text-red-500 transition-colors bg-slate-900 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/80" onClick={closeModal}></div>
          <div className="glass-card w-full max-w-2xl p-8 relative animate-in zoom-in duration-300 border-t-4 border-t-primary-600 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <UserPlus className="text-primary-500" />
              {isEditMode ? 'Update Student Profile' : 'Comprehensive Student Enrollment'}
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Full Name</label>
                  <input 
                    type="text" required className="input-field" placeholder="John Doe"
                    value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">VU ID</label>
                  <input 
                    type="text" required className="input-field font-mono" placeholder="BC123456789"
                    value={newStudent.vuId} onChange={e => setNewStudent({...newStudent, vuId: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Primary Contact No</label>
                  <input 
                    type="text" required className="input-field" placeholder="+92 300 1234567"
                    value={newStudent.contactPrimary} onChange={e => setNewStudent({...newStudent, contactPrimary: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Alternative Contact (Optional)</label>
                  <input 
                    type="text" className="input-field" placeholder="+92 300 7654321"
                    value={newStudent.contactSecondary} onChange={e => setNewStudent({...newStudent, contactSecondary: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Personal Gmail</label>
                  <input 
                    type="email" className="input-field" placeholder="john.personal@gmail.com"
                    value={newStudent.personalEmail} onChange={e => setNewStudent({...newStudent, personalEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">VU Gmail</label>
                  <input 
                    type="email" className="input-field" placeholder="bc123456789@vu.edu.pk"
                    value={newStudent.vuEmail} onChange={e => setNewStudent({...newStudent, vuEmail: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">LMS Password</label>
                  <input 
                    type="password" required className="input-field" placeholder="••••••••"
                    value={newStudent.vuPassword} onChange={e => setNewStudent({...newStudent, vuPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Assign Assistant</label>
                  <select 
                    className="input-field"
                    value={newStudent.assignedAssistantId}
                    onChange={e => setNewStudent({...newStudent, assignedAssistantId: e.target.value})}
                  >
                    <option value="">Direct (Owner Only)</option>
                    {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Portal Password (For Student Login)</label>
                  <input 
                    type="text" required className="input-field border-emerald-500/30 text-emerald-400" placeholder="portal123"
                    value={newStudent.portalPassword} onChange={e => setNewStudent({...newStudent, portalPassword: e.target.value})}
                  />
                  <p className="text-[9px] text-dark-muted mt-1 italic">Students login with this password via the Portal.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1.5 text-left">Subjects (comma separated)</label>
                  <input 
                    type="text" className="input-field font-bold" placeholder="CS101, ENG101, MTH301"
                    value={newStudent.subjects} onChange={e => setNewStudent({...newStudent, subjects: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary font-bold">Cancel</button>
                <button type="submit" className="flex-1 btn-primary font-bold shadow-lg shadow-primary-900/40">
                  {isEditMode ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
