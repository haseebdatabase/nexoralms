import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 relative overflow-hidden">
      {/* Background Decor - DISABLED FOR STABILITY */}
      {/* <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div> */}
      {/* <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div> */}

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-xl shadow-primary-900/40 mb-6 mx-auto">
            <span className="text-white text-3xl font-bold">N</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-dark-muted">Please enter your details to sign in.</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-dark-muted">Password</label>
                <a href="#" className="text-sm text-primary-500 hover:text-primary-400 font-medium">Forgot?</a>
              </div>
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

            <button 
              disabled={loading}
              type="submit" 
              className="w-full btn-primary py-3 flex items-center justify-center gap-3 font-semibold text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-dark-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400 font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
        
        <p className="mt-10 text-center text-xs text-dark-muted">
          &copy; 2024 Nexora LMS Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
