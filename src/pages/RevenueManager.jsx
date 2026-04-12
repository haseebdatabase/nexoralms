import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Printer,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { generateStudentReport, generateInvoice, generateVoucher } from '../services/reportGenerator';
import toast from 'react-hot-toast';

const RevenueManager = () => {
  const { students, loading, updateStudent } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newInstallments, setNewInstallments] = useState([{ amount: '', dueDate: '', status: 'unpaid' }]);

  const revenue = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;
    let pendingVerification = [];

    students.forEach(s => {
      total += parseFloat(s.feeTotal || 0);
      s.feeDetails?.installments?.forEach((i, idx) => {
        if (i.status === 'paid') paid += parseFloat(i.amount);
        else pending += parseFloat(i.amount);
        
        if (i.status === 'pending_verification') {
          pendingVerification.push({ student: s, installment: i, index: idx });
        }
      });
    });

    return { total, paid, pending, pendingVerification };
  }, [students]);

  const handleUpdatePayment = async (studentId, installmentIdx, newStatus) => {
    const student = students.find(s => s.id === studentId);
    const updatedInstallments = [...student.feeDetails.installments];
    updatedInstallments[installmentIdx] = { 
      ...updatedInstallments[installmentIdx], 
      status: newStatus,
      paidAt: newStatus === 'paid' ? new Date().toISOString() : null
    };

    try {
      await updateStudent(studentId, {
        feeDetails: {
          ...student.feeDetails,
          installments: updatedInstallments
        }
      });
      toast.success('Payment status updated');
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const handleCreatePlan = async () => {
    const totalPlanAmount = newInstallments.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    
    try {
      await updateStudent(selectedStudent.id, {
        feeTotal: totalPlanAmount,
        feeDetails: {
          ...selectedStudent.feeDetails,
          installments: newInstallments
        }
      });
      setIsPlanModalOpen(false);
      setIsInstallmentModalOpen(false);
      toast.success('Installment plan created');
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const handleExportFullReport = (student) => {
    try {
      toast.loading('Preparing Academic Report...', { id: 'report-toast' });
      generateStudentReport(student, []); 
      toast.success('Report Downloaded', { id: 'report-toast' });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error('Failed to generate report', { id: 'report-toast' });
    }
  };

  const handlePrintVoucher = (student, installment, index) => {
    try {
      toast.loading('Preparing Payment Voucher...', { id: 'voucher-toast' });
      generateVoucher(student, installment, index);
      toast.success('Voucher Downloaded', { id: 'voucher-toast' });
    } catch (error) {
      console.error("Voucher Generation Error:", error);
      toast.error('Failed to generate voucher', { id: 'voucher-toast' });
    }
  };

  if (loading) return <div className="p-8 text-center text-cyan-500 font-bold uppercase tracking-widest text-xs">Syncing Financial Records...</div>;

  return (
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Revenue Manager</h2>
          <p className="text-dark-muted font-medium">Track student installments and total educational yield.</p>
        </div>
        <p className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase border-b border-cyan-500/30 pb-1">official academic solution</p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary-600 bg-slate-900/40">
          <div className="p-3 bg-primary-600/10 text-primary-500 rounded-xl w-fit mb-4">
            <DollarSign size={24} />
          </div>
          <h3 className="text-dark-muted font-bold text-xs uppercase tracking-tighter">Total Potential</h3>
          <p className="text-3xl font-bold text-white tracking-tighter">${revenue.total.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-slate-900/40">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-dark-muted font-bold text-xs uppercase tracking-tighter">Collected Revenue</h3>
          <p className="text-3xl font-bold text-white tracking-tighter">${revenue.paid.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-amber-500 bg-slate-900/40">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-4 flex items-center justify-between">
            <Clock size={24} />
          </div>
          <h3 className="text-dark-muted font-bold text-xs uppercase tracking-tighter">Pending Payments</h3>
          <p className="text-3xl font-bold text-white tracking-tighter">${revenue.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Triage: Pending Verifications */}
      {revenue.pendingVerification.length > 0 && (
        <div className="glass-card overflow-hidden bg-[#050b14] border border-blue-500/30 shadow-lg shadow-blue-500/10 mb-8 animate-in fade-in duration-500">
          <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-500/10 flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            <h3 className="font-bold text-lg text-blue-100">Verification Triage</h3>
            <span className="ml-auto bg-blue-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">{revenue.pendingVerification.length} Submissions</span>
          </div>
          <div className="divide-y divide-blue-500/10">
            {revenue.pendingVerification.map((pv, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-blue-500/5 transition-colors">
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Search className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-white">{pv.student.name}</h4>
                    <p className="text-xs text-blue-400 font-mono tracking-widest">{pv.student.vuId}</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-slate-900/50 p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Platform</p>
                    <p className="text-sm text-white font-black">{pv.installment.receipt?.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Transaction ID</p>
                    <p className="text-sm text-amber-500 font-mono font-bold tracking-wider">{pv.installment.receipt?.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Amount Declared</p>
                    <p className="text-sm text-emerald-500 font-black">${pv.installment.amount}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdatePayment(pv.student.id, pv.index, 'unpaid')}
                    className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest border border-red-500/20 transition-all"
                  >
                    Reject ID
                  </button>
                  <button 
                    onClick={() => handleUpdatePayment(pv.student.id, pv.index, 'paid')}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Verify & Collect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Fees Table */}
      <div className="glass-card overflow-hidden bg-slate-900/40 border border-white/5">
        <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-slate-900/80">
          <h3 className="font-bold text-lg">Academic Revenue Inventory</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">by its mughal</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-medium">
            <thead>
              <tr className="bg-slate-900/60 border-b border-dark-border">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Installments</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Yield</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {students.map((student) => {
                const totalInstallments = student.feeDetails?.installments?.length || 0;
                const paidCount = student.feeDetails?.installments?.filter(i => i.status === 'paid').length || 0;
                const progress = totalInstallments > 0 ? (paidCount / totalInstallments) * 100 : 0;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold uppercase tracking-tight">{student.name}</p>
                      <p className="text-[10px] font-mono text-cyan-500/70">{student.vuId}</p>
                    </td>
                    <td className="px-6 py-4 text-white font-bold">${student.feeTotal || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {student.feeDetails?.installments?.map((inst, idx) => (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-sm rotate-45 border border-white/10 ${
                              inst.status === 'paid' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 
                              inst.status === 'pending_verification' ? 'bg-blue-500 animate-pulse' :
                              'bg-slate-800'
                            }`}
                            title={`Installment ${idx + 1}: ${inst.status}`}
                          />
                        )) || <span className="text-[10px] text-dark-muted italic">Awaiting config</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary-600 h-full transition-all duration-700" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[9px] mt-1.5 text-slate-500 font-black uppercase tracking-widest">{Math.round(progress)}% Realized</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedStudent(student); setIsInstallmentModalOpen(true); }}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Installment Detail Modal */}
      {isInstallmentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/95" onClick={() => setIsInstallmentModalOpen(false)}></div>
          <div className="glass-card w-full max-w-2xl p-8 relative animate-in slide-in-from-bottom-4 duration-300 border border-white/10 bg-[#0a1120]">
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedStudent.name}</h3>
                <p className="text-cyan-500 uppercase text-[10px] font-black tracking-widest">{selectedStudent.vuId}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] font-black uppercase">Contracted Value</p>
                <p className="text-3xl font-black text-white tracking-tighter">${selectedStudent.feeTotal}</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-widest mb-4">Installment Pipeline</h4>
              {selectedStudent.feeDetails?.installments?.length > 0 ? (
                selectedStudent.feeDetails.installments.map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        inst.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                        inst.status === 'pending_verification' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {inst.status === 'paid' ? <CheckCircle2 size={20} /> : 
                         inst.status === 'pending_verification' ? <ShieldCheck size={20} /> :
                         <AlertCircle size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm flex items-center gap-2">
                          Stage #{idx + 1} 
                          {inst.status === 'pending_verification' && <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 rounded-full uppercase">Submitted</span>}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500">DUE: {inst.dueDate || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-white text-xl tracking-tighter">${inst.amount}</span>
                      <button 
                        onClick={() => handleUpdatePayment(selectedStudent.id, idx, inst.status === 'paid' ? 'unpaid' : 'paid')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          inst.status === 'paid' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        }`}
                      >
                        {inst.status === 'paid' ? 'Rollback' : 'Collect'}
                      </button>
                      <button 
                        onClick={() => handlePrintVoucher(selectedStudent, inst, idx)}
                        className="p-2.5 bg-slate-900 text-cyan-500 rounded-xl hover:bg-slate-800 transition-all border border-white/5"
                        title="Print Payment Voucher"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-slate-500 mb-6 italic text-sm">No payment pipeline configured for this client.</p>
                  <button 
                    onClick={() => { setIsPlanModalOpen(true); setNewInstallments([{ amount: '', dueDate: '', status: 'unpaid' }]); }}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} /> Initialize Pipeline
                  </button>
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => setIsInstallmentModalOpen(false)}
                className="flex-1 btn-secondary py-3 font-bold uppercase tracking-widest text-[10px]"
              >
                Exit Console
              </button>
              <button 
                onClick={() => handleExportFullReport(selectedStudent)}
                className="flex-1 bg-white text-black hover:bg-slate-200 rounded-xl py-3 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Generate Yield PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Plan Creator Modal */}
      {isPlanModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsPlanModalOpen(false)}></div>
          <div className="glass-card w-full max-w-xl p-8 relative border-t-4 border-t-cyan-500 bg-[#0a1120]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Configure Pipeline</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {newInstallments.map((inst, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 p-5 bg-slate-900/80 rounded-2xl border border-white/5 relative group">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Stage Amount ($)</label>
                    <input 
                      type="number" className="input-field" placeholder="0.00"
                      value={inst.amount}
                      onChange={e => {
                        const updated = [...newInstallments];
                        updated[idx].amount = e.target.value;
                        setNewInstallments(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Maturity Date</label>
                    <input 
                      type="date" className="input-field"
                      value={inst.dueDate}
                      onChange={e => {
                        const updated = [...newInstallments];
                        updated[idx].dueDate = e.target.value;
                        setNewInstallments(updated);
                      }}
                    />
                  </div>
                  {newInstallments.length > 1 && (
                    <button 
                      onClick={() => setNewInstallments(newInstallments.filter((_, i) => i !== idx))}
                      className="absolute -right-2 -top-2 bg-red-600 text-white p-1.5 rounded-full shadow-xl"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setNewInstallments([...newInstallments, { amount: '', dueDate: '', status: 'unpaid' }])}
              className="w-full mt-6 py-3 border-2 border-dashed border-white/5 rounded-2xl text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Append Pipeline Stage
            </button>

            <div className="mt-10 flex gap-4">
              <button onClick={() => setIsPlanModalOpen(false)} className="flex-1 btn-secondary uppercase tracking-widest text-[10px] font-black">Abort</button>
              <button onClick={handleCreatePlan} className="flex-1 btn-primary uppercase tracking-widest text-[10px] font-black shadow-cyan-900/40">Deploy Pipeline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueManager;
