import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Users, 
  Search, 
  Filter,
  ArrowRight,
  GraduationCap,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';

const SubjectManagement = () => {
  const { students, loading } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Derive unique subjects from all students
  const subjects = useMemo(() => {
    const subSet = new Set();
    students.forEach(s => {
      s.subjects?.forEach(sub => subSet.add(sub.toUpperCase()));
    });
    return Array.from(subSet).sort();
  }, [students]);

  const studentsBySubject = useMemo(() => {
    if (!selectedSubject) return [];
    return students.filter(s => 
      s.subjects?.some(sub => sub.toUpperCase() === selectedSubject)
    );
  }, [selectedSubject, students]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Subject Management</h2>
          <p className="text-dark-muted">Organize students by their registered courses.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 glass-card flex items-center gap-3">
            <Layers className="text-primary-500" size={20} />
            <div>
              <p className="text-[10px] font-bold text-dark-muted uppercase">Active Subjects</p>
              <p className="text-xl font-bold">{subjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subjects List */}
        <div className="glass-card flex flex-col h-[600px]">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary-500" />
              Course Catalog
            </h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                className="input-field pl-10 text-sm h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {subjects
              .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  selectedSubject === subject 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                  : 'text-dark-muted hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedSubject === subject ? 'bg-white/20' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {subject.substring(0, 2)}
                  </div>
                  <span className="font-semibold tracking-wide">{subject}</span>
                </div>
                <ArrowRight size={16} className={`${selectedSubject === subject ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
              </button>
            ))}
            {subjects.length === 0 && !loading && (
              <p className="text-center py-8 text-sm text-dark-muted italic">No subjects registered yet.</p>
            )}
          </div>
        </div>

        {/* Selected Subject Students */}
        <div className="lg:col-span-2 glass-card flex flex-col h-[600px]">
          <div className="p-6 border-b border-dark-border flex items-center justify-between bg-slate-900/30">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedSubject ? `${selectedSubject} - Enrolled Students` : 'Select a Course'}
              </h3>
              <p className="text-sm text-dark-muted">
                {selectedSubject 
                  ? `${studentsBySubject.length} students enrolled in this course.`
                  : 'Pick a course from the list to view enrolled students.'
                }
              </p>
            </div>
            {selectedSubject && (
              <div className="p-3 rounded-xl bg-primary-600/10 text-primary-500">
                <Users size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedSubject ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <BookOpen size={64} className="mb-4" />
                <p className="text-xl font-medium">No Course Selected</p>
                <p className="text-sm max-w-xs mx-auto">Click on a subject from the sidebar to manage students enrolled in that specific course.</p>
              </div>
            ) : studentsBySubject.length === 0 ? (
              <p className="text-center py-12 text-dark-muted">No students currently enrolled in this course.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {studentsBySubject.map(student => (
                  <div key={student.id} className="p-4 bg-slate-900/50 border border-dark-border rounded-2xl hover:border-slate-600 transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-primary-500 font-bold border border-slate-700">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{student.name}</p>
                        <p className="text-xs text-dark-muted font-mono">{student.vuId}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <p className="text-[10px] font-bold text-dark-muted uppercase">Course Status</p>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                        <CheckCircle2 size={12} /> Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;
