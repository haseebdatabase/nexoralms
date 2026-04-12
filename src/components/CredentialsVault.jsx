import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { decryptPassword } from '../services/encryption';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CredentialsVault = () => {
  const { students } = useStudents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: '📋' });
  };

  const getDecryptedPass = (student) => {
    try {
      return decryptPassword(student.vuPassword, user.uid);
    } catch (e) {
      return 'Decryption Error';
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vuId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-dark-border bg-slate-900/50">
        <h3 className="font-bold flex items-center gap-2 text-white mb-4">
          <ShieldCheck className="text-emerald-500" size={18} />
          LMS Credentials Vault
        </h3>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="w-full bg-slate-800/80 border border-dark-border rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredStudents.map(student => (
          <div key={student.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest truncate">{student.name}</p>
              <div className="flex gap-1">
                <button 
                  onClick={() => copyToClipboard(student.vuId, 'VU ID')}
                  className="p-1 hover:text-primary-500 text-dark-muted transition-colors"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-dark-bg p-1.5 rounded-lg border border-slate-800">
                <span className="text-[11px] font-mono text-emerald-500">{student.vuId}</span>
                <span className="text-[9px] font-bold uppercase text-slate-600">VU ID</span>
              </div>
              
              <div className="flex items-center justify-between bg-dark-bg p-1.5 rounded-lg border border-slate-800 relative group/pass overflow-hidden">
                <span className="text-[11px] font-mono text-primary-400">
                  {showPassword[student.id] ? getDecryptedPass(student) : '••••••••••••'}
                </span>
                <div className="flex gap-1 bg-dark-bg pl-2">
                  <button 
                    onClick={() => setShowPassword(p => ({...p, [student.id]: !p[student.id]}))}
                    className="p-1 hover:text-white text-dark-muted transition-colors"
                  >
                    {showPassword[student.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(getDecryptedPass(student), 'Password')}
                    className="p-1 hover:text-primary-500 text-dark-muted transition-colors border-l border-slate-800 ml-1"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <p className="text-center py-8 text-xs text-dark-muted italic">No students found.</p>
        )}
      </div>

      <div className="p-3 bg-slate-950 border-t border-dark-border text-[10px] text-dark-muted text-center italic">
        "AES-256 Encrypted Access"
      </div>
    </div>
  );
};

export default CredentialsVault;
