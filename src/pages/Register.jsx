import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 relative overflow-hidden">
      {/* Background Decor - DISABLED FOR STABILITY */}
      {/* <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2"></div> */}
      {/* <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-primary-600/10 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2"></div> */}

      <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl mb-6 mx-auto">
            <ShieldCheck className="text-primary-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-muted">Join Nexora LMS Pro and manage students with ease.</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="Hassan Ali"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" required className="w-4 h-4 rounded bg-slate-900 border-dark-border text-primary-500 focus:ring-primary-500" />
              <span className="text-sm text-dark-muted">I agree to the Terms of Service and Privacy Policy</span>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full btn-primary py-3 flex items-center justify-center gap-3 font-semibold text-lg mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
