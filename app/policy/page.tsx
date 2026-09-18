'use client';

import React, { useState, useEffect } from 'react';
import { PQStore, PolicyRule } from '@/lib/mockData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Info,
  X,
  Lock,
  Shield,
  Zap
} from 'lucide-react';

export default function PolicyPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Block' | 'Warn' | 'Info'>('Block');

  useEffect(() => {
    setPolicies(PQStore.getPolicies());
  }, []);

  const handleTogglePolicy = (id: string) => {
    const updated = policies.map(p => {
      if (p.id === id) {
        const nextState = !p.enabled;
        
        const audits = PQStore.getAudits();
        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Policy Toggled',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'operator@transit.io',
          details: `Policy '${p.name}' set to ${nextState ? 'ENABLED' : 'DISABLED'}`
        };
        PQStore.saveAudits([newAudit, ...audits]);

        return { ...p, enabled: nextState };
      }
      return p;
    });
    setPolicies(updated);
    PQStore.savePolicies(updated);
  };

  const handleChangeSeverity = (id: string, newSeverity: 'Block' | 'Warn' | 'Info') => {
    const updated = policies.map(p => {
      if (p.id === id) {
        const audits = PQStore.getAudits();
        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Policy Adjusted',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'operator@transit.io',
          details: `Enforcement severity for policy '${p.name}' set to ${newSeverity}`
        };
        PQStore.saveAudits([newAudit, ...audits]);

        return { ...p, severity: newSeverity };
      }
      return p;
    });
    setPolicies(updated);
    PQStore.savePolicies(updated);
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      alert('Please fill in name and description.');
      return;
    }

    const newRule: PolicyRule = {
      id: `pol-${Date.now()}`,
      name: name,
      description: description,
      enabled: true,
      severity: severity
    };

    const updated = [...policies, newRule];
    setPolicies(updated);
    PQStore.savePolicies(updated);

    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Policy Rule Created',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'operator@transit.io',
      details: `Created policy: '${name}' with severity ${severity}`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    setIsModalOpen(false);
    setName('');
    setDescription('');
    setSeverity('Block');
  };

  const handleDeletePolicy = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete policy rule "${name}"?`)) return;

    const updated = policies.filter(p => p.id !== id);
    setPolicies(updated);
    PQStore.savePolicies(updated);

    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Policy Rule Deleted',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'operator@transit.io',
      details: `Deleted policy: '${name}'`
    };
    PQStore.saveAudits([newAudit, ...audits]);
  };

  const getSeverityStyle = (sev: 'Block' | 'Warn' | 'Info') => {
    switch (sev) {
      case 'Block':
        return 'bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold';
      case 'Warn':
        return 'bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold';
      default:
        return 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-semibold';
    }
  };

  const getSeverityIcon = (sev: 'Block' | 'Warn' | 'Info') => {
    switch (sev) {
      case 'Block':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
      case 'Warn':
        return <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      default:
        return <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cryptographic Policy & Compliance Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {policies.filter(p => p.enabled).length} Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforce post-quantum cryptographic mandates, ban obsolete algorithms, and set migration deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Policy Rule</span>
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {policies.map((policy) => (
          <div 
            key={policy.id}
            className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xl ${
              policy.enabled 
                ? 'bg-[#0d121f]/90 border-slate-800 hover:border-cyan-500/40' 
                : 'bg-[#090d16]/60 border-slate-800/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {policy.enabled ? (
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
                      <X className="h-5 w-5" />
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm leading-tight ${policy.enabled ? 'text-white' : 'text-slate-400'}`}>
                      {policy.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">RULE: {policy.id}</span>
                  </div>
                </div>

                {/* Enabled Toggle Switch Button */}
                <button
                  onClick={() => handleTogglePolicy(policy.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer flex items-center ${
                    policy.enabled 
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                      : 'bg-slate-800'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    policy.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs text-slate-400 leading-relaxed font-sans">
                {policy.description}
              </p>
            </div>

            {/* Adjustments row */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">Severity</span>
                <select
                  value={policy.severity}
                  disabled={!policy.enabled}
                  onChange={(e) => handleChangeSeverity(policy.id, e.target.value as any)}
                  className="h-8 bg-slate-900 border border-slate-800 rounded-xl px-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <option value="Block">Block</option>
                  <option value="Warn">Warn</option>
                  <option value="Info">Info</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono ${getSeverityStyle(policy.severity)}`}>
                  {getSeverityIcon(policy.severity)}
                  <span>{policy.severity}</span>
                </div>
                
                {policy.id.startsWith('pol-') && policy.id !== 'pol-1' && policy.id !== 'pol-2' && policy.id !== 'pol-3' && policy.id !== 'pol-4' && (
                  <button
                    onClick={() => handleDeletePolicy(policy.id, policy.name)}
                    className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete custom policy rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d121f] border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Create Compliance Rule</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Require ML-DSA-65 signatures in authentication"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Define the cryptographic standard, prohibited algorithms, and enforcement criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Enforcement Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option value="Block">Block (Fail PRs & block builds)</option>
                  <option value="Warn">Warn (Emit security audit warnings)</option>
                  <option value="Info">Info (Record findings in audit trail)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  Save Policy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
