'use client';

import React, { useState, useEffect } from 'react';
import { PQStore, AuditLog } from '@/lib/mockData';
import { 
  History, 
  Search, 
  FileText, 
  Download, 
  User, 
  ShieldCheck, 
  GitMerge, 
  Play, 
  Calendar,
  Layers,
  ArrowDownToLine,
  Loader2,
  Shield,
  Clock
} from 'lucide-react';

interface ReportInfo {
  id: string;
  name: string;
  type: string;
  timestamp: string;
  size: string;
  summary: string;
}

const REPORTS_LIST: ReportInfo[] = [
  {
    id: 'rep-1',
    name: 'Post-Quantum Migration Readiness Audit',
    type: 'PDF Security Report',
    timestamp: '2026-08-13 10:00:00',
    size: '1.4 MB',
    summary: 'Comprehensive analysis of asymmetric key exposure, Shor vulnerabilities, and legacy hash functions across connected repositories.'
  },
  {
    id: 'rep-2',
    name: 'FIPS 204 Signature Compliance Assessment',
    type: 'PDF Policy Report',
    timestamp: '2026-08-12 11:30:00',
    size: '890 KB',
    summary: 'Evaluates codebase compliance against the newly ratified FIPS 204 ML-DSA digital signature standards.'
  },
  {
    id: 'rep-3',
    name: 'Cascading Cryptographic Dependency & Reachability Audit',
    type: 'JSON Data Graph',
    timestamp: '2026-08-11 16:45:00',
    size: '2.1 MB',
    summary: 'Technical Transit graph detailed node representation mapping cryptographic libraries to API endpoints and checkout flows.'
  }
];

export default function AuditPage() {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setAudits(PQStore.getAudits());
    const interval = setInterval(() => {
      setAudits(PQStore.getAudits());
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`[Transit Sentinel Report] "${name}" downloaded successfully.`);
    }, 1200);
  };

  const filteredAudits = audits.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    if (action.includes('Scan')) {
      return <Play className="h-4 w-4 text-cyan-400" />;
    }
    if (action.includes('Migration') || action.includes('Merged')) {
      return <GitMerge className="h-4 w-4 text-emerald-400" />;
    }
    if (action.includes('Policy')) {
      return <ShieldCheck className="h-4 w-4 text-amber-400" />;
    }
    return <User className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Audit Trail & Compliance Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track security actions, user operations, and download official post-quantum readiness assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Audit logs timeline */}
        <div className="lg:col-span-7 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col h-[540px] shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" />
              Event Stream
            </span>

            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredAudits.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-3.5 p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-600" />
                      {log.timestamp}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/90 font-mono">Actor: {log.user}</span>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}

            {filteredAudits.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                <History className="h-8 w-8 text-slate-700 mb-2" />
                <span className="text-xs font-semibold text-slate-400">No audit events match your search query.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Download Reports panel */}
        <div className="lg:col-span-5 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col h-[540px] shadow-xl backdrop-blur-xl">
          <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            Compliance & Readiness Reports
          </span>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {REPORTS_LIST.map((rep) => {
              const isDownloading = downloadingId === rep.id;
              return (
                <div 
                  key={rep.id} 
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-white tracking-tight leading-snug">
                        {rep.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-[9px] shrink-0 font-semibold uppercase">
                        {rep.size}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <span>{rep.type}</span>
                      <span>•</span>
                      <span>{rep.timestamp.split(' ')[0]}</span>
                    </div>

                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-sans">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => handleDownloadReport(rep.id, rep.name)}
                      disabled={isDownloading || downloadingId !== null}
                      className="h-8 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Download Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
