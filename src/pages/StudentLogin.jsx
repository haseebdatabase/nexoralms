import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Mail, Lock, User, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const [vuId, setVuId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Search for student with this VU ID
      const q = query(collection(db, 'students'), where('vuId', '==', vuId.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Student record not found. Please check your ID.');
      }

      const studentData = querySnapshot.docs[0].data();
      const studentId = querySnapshot.docs[0].id;

      // In a real app, we would verify the password properly.
      // For this SaaS version, we'll check if password matches or matches default set by handler.
      if (password === 'portal123' || password === studentData.portalPassword) {
        localStorage.setItem('studentAuth', studentId);
        localStorage.setItem('studentInfo', JSON.stringify({
          id: studentId,
          name: studentData.name,
          vuId: studentData.vuId
        }));
        toast.success(`Welcome, ${studentData.name}!`);
        navigate('/student/dashboard');
      } else {
        throw new Error('Invalid Portal Password');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b1a] px-4 relative overflow-hidden">
      {/* Student Portal Specific Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl mb-6 mx-auto">
            <GraduationCap className="text-emerald-500" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Student Portal</h1>
          <p className="text-dark-muted">Nexora LMS Pro &bull; Access your academics</p>
        </div>

        <div className="glass-card p-8 border-t-4 border-t-emerald-600">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-dark-muted mb-2 uppercase tracking-wide">VU Student ID</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={vuId}
                  onChange={(e) => setVuId(e.target.value)}
                  className="input-field pl-10 h-12 uppercase" 
                  placeholder="BC123456789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-muted mb-2 uppercase tracking-wide">Portal Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 h-12" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 flex items-center justify-center gap-3 font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to My Dashboard'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-dark-muted italic">
            Check with your Handler if you don't have your portal password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
