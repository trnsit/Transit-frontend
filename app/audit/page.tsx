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
  Loader2
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
    summary: 'Comprehensive analysis of asymmetric key exposure and legacy hash functions across 4 scanned repositories.'
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
    summary: 'Technical transit graph detailed node representation mapping cryptographic libraries to API endpoints.'
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
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`[PROTOTYPE DOWNLOAD SUCCESS] "${name}" downloaded successfully to local storage.`);
    }, 1500);
  };

  const filteredAudits = audits.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    if (action.includes('Scan')) {
      return <Play className="h-4 w-4 text-indigo-400" />;
    }
    if (action.includes('Migration') || action.includes('Merged')) {
      return <GitMerge className="h-4 w-4 text-emerald-400" />;
    }
    if (action.includes('Policy')) {
      return <ShieldCheck className="h-4 w-4 text-amber-400" />;
    }
    return <User className="h-4 w-4 text-zinc-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">Audit & Reports</h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Track security actions, user operations, and download compliance readiness assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Audit logs timeline */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-400" />
              Audit Trail Logs
            </span>

            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 bg-zinc-950 border border-zinc-850 rounded-lg pl-8 pr-3 text-[11px] text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {filteredAudits.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-3 p-3 bg-zinc-950/30 border border-zinc-900/80 rounded-lg hover:border-zinc-800 transition-colors"
              >
                <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-200">{log.action}</span>
                    <span className="text-[9px] text-zinc-500 font-mono shrink-0 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-zinc-600" />
                      {log.timestamp}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">User: {log.user}</span>
                  <p className="text-[10px] text-zinc-400 leading-normal mt-1 text-zinc-400">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}

            {filteredAudits.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-lg">
                <History className="h-7 w-7 text-zinc-700 mb-2" />
                <span className="text-xs font-semibold text-zinc-400">No audit events match search.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Download Reports panel */}
        <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 flex flex-col h-[520px]">
          <span className="text-sm font-semibold text-zinc-300 mb-4 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            Compliance & Readiness Reports
          </span>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {REPORTS_LIST.map((rep) => {
              const isDownloading = downloadingId === rep.id;
              return (
                <div 
                  key={rep.id} 
                  className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-lg flex flex-col justify-between hover:border-zinc-800 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-zinc-200 tracking-tight leading-snug">
                        {rep.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] shrink-0 font-medium uppercase">
                        {rep.size}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                      <span>{rep.type}</span>
                      <span>•</span>
                      <span>Generated: {rep.timestamp.split(' ')[0]}</span>
                    </div>

                    <p className="mt-2.5 text-[10px] text-zinc-400 leading-normal font-sans">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-zinc-900/60 flex items-center justify-end">
                    <button
                      onClick={() => handleDownloadReport(rep.id, rep.name)}
                      disabled={isDownloading || downloadingId !== null}
                      className="h-8 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5 text-indigo-400" />
                          Download Report
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
