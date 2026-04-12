import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CreditCard, 
  ClipboardList, 
  User, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  LogOut,
  AlertTriangle,
  FileText,
  HelpCircle,
  TrendingUp,
  LayoutDashboard,
  MessageCircle,
  UploadCloud,
  X,
  Award
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Receipt Upload State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [targetInstallmentIdx, setTargetInstallmentIdx] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [paymentDate, setPaymentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const rawInfo = localStorage.getItem('studentInfo');
    if (!rawInfo) return navigate('/student/login');

    const info = JSON.parse(rawInfo);

    // Fetch real-time student document updates
    const studentUnsub = onSnapshot(doc(db, 'students', info.id), (docSnap) => {
      if (docSnap.exists()) {
        const fullData = { id: docSnap.id, ...docSnap.data() };
        setStudentInfo(fullData);
        localStorage.setItem('studentInfo', JSON.stringify(fullData));
      }
    });

    // Fetch real-time tasks for this student
    const q = query(
      collection(db, 'tasks'), 
      where('studentId', '==', info.id)
    );

    const taskUnsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      studentUnsub();
      taskUnsub();
    };
  }, [navigate]);

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    if (!transactionId || !paymentDate) return toast.error('Please fill all fields');
    
    setIsSubmitting(true);
    try {
      const updatedInstallments = [...studentInfo.feeDetails.installments];
      updatedInstallments[targetInstallmentIdx] = {
        ...updatedInstallments[targetInstallmentIdx],
        status: 'pending_verification',
        receipt: { transactionId, paymentMethod, paymentDate, submittedAt: new Date().toISOString() }
      };

      await updateDoc(doc(db, 'students', studentInfo.id), {
        'feeDetails.installments': updatedInstallments
      });

      // --- WEBHOOK INTEGRATION ---
      const configStr = localStorage.getItem('nexora_config');
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config.webhookUrl) {
          fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🚨 **LMS FEE ALERT**\nStudent **${studentInfo.name}** (${studentInfo.vuId}) just uploaded a **$${studentInfo.feeDetails.installments[targetInstallmentIdx].amount}** receipt via ${paymentMethod}.\n*TID:* \`${transactionId}\`\n*Action required in Revenue Manager.*`
            })
          }).catch(console.error); // Silent fail to not block UX if bot is down
        }
      }

      toast.success('Receipt submitted for verification!');
      setIsReceiptModalOpen(false);
      setTransactionId('');
    } catch (error) {
      toast.error('Failed to submit receipt');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sub-component for metric cards
  const MetricCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-dark-muted uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Gamification Engine
  const getGamerTier = (count) => {
    if (count >= 16) return { name: "Academic Elite", color: "text-purple-400", bg: "bg-purple-500/20", outline: "border-purple-500/50 shadow-purple-500/30" };
    if (count >= 6) return { name: "Scholar", color: "text-blue-400", bg: "bg-blue-500/20", outline: "border-blue-500/50 shadow-blue-500/30" };
    return { name: "Novice", color: "text-emerald-400", bg: "bg-emerald-500/20", outline: "border-emerald-500/50 shadow-emerald-500/30" };
  };
  const tier = getGamerTier(completedTasks.length);

  const nextInstallmentIdx = studentInfo?.feeDetails?.installments?.findIndex(i => i.status === 'unpaid');
  const nextInstallment = studentInfo?.feeDetails?.installments?.[nextInstallmentIdx];
  const waitingVerification = studentInfo?.feeDetails?.installments?.filter(i => i.status === 'pending_verification').length || 0;

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-bold tracking-widest animate-pulse">CONNECTING TO ACADEMIC CORE...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-6">
          <div className={`w-24 h-24 rounded-3xl ${tier.bg} border-2 ${tier.outline} flex items-center justify-center text-white shadow-2xl relative`}>
            <User size={40} className={tier.color} />
            <div className={`absolute -bottom-3 bg-slate-900 border ${tier.outline} px-3 py-1 rounded-full flex items-center gap-1 shadow-xl`}>
              <Award size={12} className={tier.color} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${tier.color}`}>Lvl {completedTasks.length}</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              {studentInfo?.name || 'Loading Student...'}
            </h1>
            <p className="text-cyan-500 font-bold tracking-wider mt-1 flex items-center gap-2">
              {studentInfo?.vuId} 
              <span className="text-dark-muted font-normal uppercase text-[10px]">| OFFICIAL ACADEMIC SOLUTION</span>
            </p>
            <div className="mt-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${tier.bg} ${tier.color} border ${tier.outline}`}>
                {tier.name} Status
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); navigate('/student/login'); }}
          className="btn-secondary self-start flex items-center gap-3 border-cyan-900/50 hover:border-cyan-500/50 group"
        >
          <LogOut size={20} className="group-hover:text-cyan-500 transition-colors" />
          Sign Out
        </button>
      </header>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in duration-700">
        <MetricCard title="Tasks Pending" value={pendingTasks.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <MetricCard title="Tasks Completed" value={completedTasks.length} icon={CheckCircle2} color="text-cyan-500" bg="bg-cyan-500/10" />
        <MetricCard title="Processing Receipts" value={waitingVerification} icon={TrendingUp} color="text-purple-500" bg="bg-purple-500/10" />
        <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-blue-500 bg-blue-500/5 relative overflow-hidden">
          <p className="text-xs font-bold text-blue-500/80 uppercase tracking-wider mb-1">Next Installment</p>
          <div className="flex items-end justify-between z-10">
            <p className="text-3xl font-black text-white tracking-tighter">
              {nextInstallment ? `$${nextInstallment.amount}` : 'Paid'}
            </p>
            {nextInstallment && (
              <button 
                onClick={() => {
                  setTargetInstallmentIdx(nextInstallmentIdx);
                  setIsReceiptModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all border border-blue-400/50 flex items-center gap-2"
              >
                <UploadCloud size={14} /> Submit ID
              </button>
            )}
          </div>
          <CreditCard size={64} className="absolute -right-4 -bottom-4 text-blue-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <ClipboardList className="text-cyan-500" />
            LMS Activity Hub
          </h3>
          <div className="space-y-6">
            {pendingTasks.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <CheckCircle2 size={64} className="mx-auto mb-4 text-cyan-500" />
                <p className="text-xl font-bold">All caught up!</p>
                <p>No pending activities from your handler.</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-cyan-500/30 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold uppercase tracking-widest text-xs">
                      {task.type.substring(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{task.subject}: {task.type}</h4>
                      <p className="text-sm text-dark-muted flex items-center gap-2">
                        <Clock size={14} /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase border border-amber-500/20">
                      Processing
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support & Documents */}
        <div className="space-y-8">
          <div className="glass-card p-8 border-t-2 border-t-cyan-600">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <MessageCircle className="text-cyan-500" size={20} />
              Handler Support
            </h3>
            <p className="text-sm text-dark-muted mb-6 italic leading-relaxed">
              "Need help with your LMS? Connect directly with your dedicated handler for priority academic support."
            </p>
            <a 
              href={`https://wa.me/923001234567?text=Hi, I am ${studentInfo?.name} (${studentInfo?.vuId}). I need assistance with my current assignment.`}
              target="_blank" rel="noreferrer"
              className="w-full btn-primary bg-cyan-600 hover:bg-cyan-500 h-12 flex items-center justify-center gap-2 font-bold shadow-lg shadow-cyan-900/40 no-underline"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="glass-card p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <FileText className="text-primary-500" size={20} />
              Recent Marks
            </h3>
            <div className="space-y-4">
              {[
                { sub: 'CS201', type: 'Quiz #1', marks: '9/10' },
                { sub: 'ENG101', type: 'Assignment', marks: '18/20' }
              ].map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                  <div>
                    <p className="font-bold text-white">{m.sub}</p>
                    <p className="text-xs text-dark-muted">{m.type}</p>
                  </div>
                  <span className="text-emerald-500 font-bold">{m.marks}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsReceiptModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-8 relative border-t-4 border-t-blue-500 bg-[#0a1120] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <UploadCloud className="text-blue-500" /> Payment Verification
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-xs text-dark-muted mb-8 italic">
              Transfer exactly <strong className="text-white">${nextInstallment?.amount}</strong> to your handler's account and submit the Transaction Ref ID here to verify your payment.
            </p>

            <form onSubmit={handleSubmitReceipt} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Platform Used</label>
                <select 
                  className="input-field py-3 text-sm font-bold"
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="SadaPay">SadaPay</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Transaction ID (TID) / Ref No</label>
                <input 
                  type="text" className="input-field py-3 text-sm font-bold tracking-widest text-center"
                  placeholder="e.g. 0583726485" required value={transactionId} onChange={e => setTransactionId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Date of Transfer</label>
                <input 
                  type="date" className="input-field py-3 text-sm font-bold"
                  required value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 mt-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30"
              >
                {isSubmitting ? 'Processing...' : 'Submit ID for Verification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
