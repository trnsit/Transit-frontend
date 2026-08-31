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
  X
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
        
        // Add to Audit Log
        const audits = PQStore.getAudits();
        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Policy Toggled',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'admin@pqshield.io',
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
        // Add to Audit Log
        const audits = PQStore.getAudits();
        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Policy Adjusted',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'admin@pqshield.io',
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

    // Audit Log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Policy Rule Created',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
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

    // Audit Log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Policy Rule Deleted',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
      details: `Deleted policy: '${name}'`
    };
    PQStore.saveAudits([newAudit, ...audits]);
  };

  const getSeverityStyle = (sev: 'Block' | 'Warn' | 'Info') => {
    switch (sev) {
      case 'Block':
        return 'bg-red-950/20 border border-red-900/50 text-red-400 font-semibold';
      case 'Warn':
        return 'bg-amber-950/20 border border-amber-900/50 text-amber-400 font-semibold';
      default:
        return 'bg-blue-950/20 border border-blue-900/50 text-blue-400 font-semibold';
    }
  };

  const getSeverityIcon = (sev: 'Block' | 'Warn' | 'Info') => {
    switch (sev) {
      case 'Block':
        return <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />;
      case 'Warn':
        return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">Policy Center</h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Manage compliance regulations, minimum cryptographic standards, and post-quantum migration deadlines.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Create Policy Rule
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {policies.map((policy) => (
          <div 
            key={policy.id}
            className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-350 ${
              policy.enabled 
                ? 'bg-zinc-900/40 border-zinc-900/90 hover:border-zinc-800' 
                : 'bg-zinc-950/25 border-zinc-950/90 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {policy.enabled ? (
                    <div className="h-8.5 w-8.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <X className="h-4.5 w-4.5" />
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${policy.enabled ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      {policy.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {policy.id}</span>
                  </div>
                </div>

                {/* Enabled Toggle Switch Button */}
                <button
                  onClick={() => handleTogglePolicy(policy.id)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                    policy.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    policy.enabled ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs text-zinc-400 leading-relaxed font-sans">
                {policy.description}
              </p>
            </div>

            {/* Adjustments row */}
            <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Severity</span>
                <select
                  value={policy.severity}
                  disabled={!policy.enabled}
                  onChange={(e) => handleChangeSeverity(policy.id, e.target.value as any)}
                  className="h-8 bg-zinc-950 border border-zinc-850 rounded-lg px-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="Block">Block</option>
                  <option value="Warn">Warn</option>
                  <option value="Info">Info</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] ${getSeverityStyle(policy.severity)}`}>
                  {getSeverityIcon(policy.severity)}
                  {policy.severity}
                </div>
                
                {policy.id.startsWith('pol-') && policy.id !== 'pol-1' && policy.id !== 'pol-2' && policy.id !== 'pol-3' && policy.id !== 'pol-4' && (
                  <button
                    onClick={() => handleDeletePolicy(policy.id, policy.name)}
                    className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-transparent rounded flex items-center justify-center transition-colors"
                    title="Delete custom policy"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-zinc-100">Create Policy Rule</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Require SHA-384 in API endpoints"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-655 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize compliance checks and migration triggers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-950 border border-zinc-855 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-660 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Enforcement Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Block">Block (Fail validation & builds)</option>
                  <option value="Warn">Warn (Audit exception warnings)</option>
                  <option value="Info">Info (Audit logs only)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
