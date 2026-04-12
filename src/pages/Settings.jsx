import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, DownloadCloud, Webhook, Save, ShieldAlert, Loader2 } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useTasks } from '../hooks/useTasks';
import toast from 'react-hot-toast';

const Settings = () => {
  const { students } = useStudents();
  const { tasks } = useTasks();
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('nexora_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.webhookUrl) setWebhookUrl(config.webhookUrl);
    }
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('nexora_config', JSON.stringify({ webhookUrl }));
      toast.success('System configuration updated natively.');
      setIsSaving(false);
    }, 600);
  };

  const handleExportDatabase = () => {
    setIsExporting(true);
    try {
      // Prepare Students Data
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Type,ID,Name,VU_ID,Fee_Total,Paid,Pending\n";
      
      students.forEach(s => {
        let paid = 0;
        let pending = 0;
        s.feeDetails?.installments?.forEach(i => {
          if (i.status === 'paid') paid += parseFloat(i.amount);
          else pending += parseFloat(i.amount);
        });
        csvContent += `Student,${s.id},${s.name},${s.vuId},${s.feeTotal || 0},${paid},${pending}\n`;
      });

      // Prepare Tasks Data
      csvContent += "\nType,TaskID,StudentName,Subject,TaskType,Status,Deadline\n";
      tasks.forEach(t => {
        csvContent += `Task,${t.id},${t.studentName},${t.subject},${t.type},${t.status},${t.deadline}\n`;
      });

      // Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `nexora_db_backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Database exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export database');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="text-primary-500" />
            Global Settings
          </h2>
          <p className="text-dark-muted font-medium mt-1">Configure platform integrations and manage your data vault.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Vault */}
        <div className="glass-card p-8 border-t-4 border-t-amber-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Database className="text-amber-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Database Vault</h3>
              <p className="text-xs text-slate-400">Offline CSV Backups</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-8 leading-relaxed">
            Generate a full snapshot of your Nexora LMS ecosystem. This includes all configured student accounts, their financial pipelines, and all corresponding LMS tasks. Perfect for local, permanent record-keeping.
          </p>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 mb-8">
            <div className="flex justify-between items-center mb-4 text-sm font-bold">
              <span className="text-slate-400">Students Indexed</span>
              <span className="text-emerald-500">{students.length} Records</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Tasks Indexed</span>
              <span className="text-primary-500">{tasks.length} Records</span>
            </div>
          </div>

          <button 
            onClick={handleExportDatabase}
            disabled={isExporting}
            className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-900/20"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <DownloadCloud size={20} />}
            Download CSV Snapshot
          </button>
        </div>

        {/* Integration Engine */}
        <div className="glass-card p-8 border-t-4 border-t-primary-500 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary-600/10 rounded-xl">
              <Webhook className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Bot Integrations</h3>
              <p className="text-xs text-slate-400">Discord / WhatsApp Webhooks</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-8 leading-relaxed">
            Link your Nexora LMS to your Nexora Bot or Discord Server. When critical events occur (like a student successfully uploading a payment receipt), the LMS will automatically fire a silent alert to this webhook URL.
          </p>

          <div className="space-y-4 mb-auto">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Target Webhook URL</label>
              <input 
                type="url" 
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/... or your bot endpoint"
                className="input-field py-4 font-mono text-sm border-primary-500/30 focus:border-primary-500"
              />
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ShieldAlert size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200 leading-relaxed">
                The LMS sends standard <code className="bg-slate-900 px-1 rounded text-primary-400">application/json</code> payloads with a <code className="bg-slate-900 px-1 rounded text-primary-400">content</code> key, making it natively compatible with Discord webhooks out of the box.
              </p>
            </div>
          </div>

          <button 
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="w-full h-14 mt-8 btn-primary font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-3"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Synchronize Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
