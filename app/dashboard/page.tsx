'use client';

import React, { useState, useEffect } from 'react';
import { 
  PQStore, 
  Repository, 
  CryptoAsset, 
  ScanJob 
} from '@/lib/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
} from 'recharts';
import { 
  ShieldAlert, 
  FolderGit2, 
  Activity, 
  Key, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [scans, setScans] = useState<ScanJob[]>([]);

  useEffect(() => {
    setMounted(true);
    const loadData = () => {
      setRepos(PQStore.getRepositories());
      setAssets(PQStore.getAssets());
      setScans(PQStore.getScans());
    };
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 space-y-6 bg-[#07090e] min-h-screen text-slate-100 flex flex-col items-center justify-center">
        <Activity className="h-8 w-8 text-cyan-400 animate-spin drop-shadow-[0_0_10px_#06b6d4]" />
        <span className="text-xs font-mono text-cyan-400 tracking-wider mt-3">
          INITIALIZING QUANTUM POSTURE METRICS...
        </span>
      </div>
    );
  }

  // Calculate dynamic stats
  const scannedRepos = repos.filter(r => r.status === 'scanned').length;
  const criticalAssets = assets.filter(a => a.riskLevel === 'Critical');
  const highAssets = assets.filter(a => a.riskLevel === 'High');
  const mediumAssets = assets.filter(a => a.riskLevel === 'Medium');
  const lowAssets = assets.filter(a => a.riskLevel === 'Low');

  // Quantum Safety Index calculation
  const quantumSafeCount = assets.filter(a => 
    ['AES-256-GCM', 'ML-KEM-768', 'ML-DSA-65', 'SHA-256', 'SHA-384', 'SHA-512'].includes(a.algorithm)
  ).length;
  const totalAssetsCount = assets.length;
  const quantumSafetyIndex = totalAssetsCount > 0 
    ? Math.round((quantumSafeCount / totalAssetsCount) * 100) 
    : 100;

  // Chart Data 1: Algorithm Distribution
  const algoCounts: Record<string, number> = {};
  assets.forEach(a => {
    algoCounts[a.algorithm] = (algoCounts[a.algorithm] || 0) + 1;
  });
  const algoChartData = Object.entries(algoCounts).map(([name, val]) => ({
    name,
    count: val,
  })).sort((a, b) => b.count - a.count);

  // Chart Data 2: Risk Breakdown
  const riskChartData = [
    { name: 'Critical', value: criticalAssets.length, color: '#f43f5e' },
    { name: 'High', value: highAssets.length, color: '#f59e0b' },
    { name: 'Medium', value: mediumAssets.length, color: '#06b6d4' },
    { name: 'Low', value: lowAssets.length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const handleExportReport = () => {
    alert('[Transit Intelligence] Post-Quantum Migration Assessment compiled successfully.');
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cryptographic Posture & Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              PQC Sentinel Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time discovery, Shor algorithm vulnerability assessment, and automated NIST migration planning.
          </p>
        </div>

        <button 
          onClick={handleExportReport}
          className="h-9 px-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileDown className="h-4 w-4 text-cyan-400" />
          Export Security Report
        </button>
      </div>

      {/* 4 High-Tech KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Repositories Card */}
        <div className="bg-[#0d121f]/90 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              Repositories
            </span>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{scannedRepos}</span>
            <span className="text-xs text-slate-400">/ {repos.length} Inspected</span>
          </div>

          <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>Continuous Git Sync Active</span>
          </div>
        </div>

        {/* Cryptographic Primitives Discovered */}
        <div className="bg-[#0d121f]/90 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              Crypto Assets (CBOM)
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Key className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{totalAssetsCount}</span>
            <span className="text-xs text-indigo-400 font-mono">Mapped Primitives</span>
          </div>

          <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span>Across {repos.filter(r => r.cryptoAssetsCount > 0).length} codebases</span>
          </div>
        </div>

        {/* Critical Post-Quantum Risks */}
        <div className="bg-[#0d121f]/90 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              Critical Risks
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-400">{criticalAssets.length}</span>
            <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              URGENT MIGRATION
            </span>
          </div>

          <div className="mt-3 text-[10px] text-rose-400/90 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
            <span>RSA-2048 / ECDSA Vulnerable</span>
          </div>
        </div>

        {/* Quantum Safety Index */}
        <div className="bg-[#0d121f]/90 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              Quantum Safety Index
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-400">{quantumSafetyIndex}%</span>
            <span className="text-xs text-slate-400 font-mono">NIST Compliant</span>
          </div>

          <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_#10b981]" 
              style={{ width: `${quantumSafetyIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Algorithm distribution bar chart */}
        <div className="lg:col-span-8 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Cryptographic Primitives Discovered
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequency distribution of signature algorithms, hashes, and encryption modes.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              AST Verified
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={algoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: 'rgba(148, 163, 184, 0.2)', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#22d3ee', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {algoChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name.includes('ML-') || entry.name.includes('256-GCM') ? '#10b981' : '#06b6d4'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="font-mono">Quantum-Safe (ML-KEM, ML-DSA, AES-256)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="font-mono">Legacy / Shor-Vulnerable</span>
            </span>
          </div>
        </div>

        {/* Risk Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl backdrop-blur-xl">
          <span className="text-sm font-semibold text-white tracking-wide mb-1">
            Vulnerability Classification
          </span>
          <p className="text-[11px] text-slate-400 mb-4">
            Categorized by threat posture and attack feasibility.
          </p>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: 'rgba(148, 163, 184, 0.2)', 
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                {criticalAssets.length + highAssets.length}
              </span>
              <span className="text-[9px] text-slate-400 font-mono font-medium uppercase tracking-wider">
                High / Crit
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {riskChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-mono">{item.name}: <strong className="text-white font-bold">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Monitored Repositories & Critical Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitored Repositories Fleet Summary */}
        <div className="lg:col-span-7 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Monitored Source Repositories
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Active repositories configured for continuous cryptographic scanning.
              </p>
            </div>
            <Link 
              href="/repositories" 
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Manage Fleet</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-mono">
                  <th className="pb-3 font-semibold">Repository</th>
                  <th className="pb-3 font-semibold text-center">Crypto Assets</th>
                  <th className="pb-3 font-semibold">Risk Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {repos.slice(0, 4).map((repo) => (
                  <tr key={repo.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-200">{repo.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                          {repo.branch} • {repo.url}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-300 font-mono font-bold">
                      {repo.cryptoAssetsCount}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-200">
                          {repo.status === 'unscanned' ? '-' : repo.riskScore}
                        </span>
                        {repo.status !== 'unscanned' && (
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                repo.riskScore > 80 ? 'bg-rose-500' : repo.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${repo.riskScore}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {repo.status === 'unscanned' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          Unscanned
                        </span>
                      ) : repo.riskScore > 75 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50 font-semibold">
                          Vulnerable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 font-semibold">
                          Resistant
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Advisories Panel */}
        <div className="lg:col-span-5 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Critical Advisories
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Immediate quantum threat exposures requiring migration.
              </p>
            </div>
            <Link 
              href="/inventory"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              All Assets →
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[240px]">
            {criticalAssets.map((asset) => (
              <div 
                key={asset.id} 
                className="p-3 bg-rose-950/20 border border-rose-800/40 hover:border-rose-700/60 rounded-xl flex items-start gap-3 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 font-mono text-[10px] font-bold">
                  !
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-rose-200 truncate">
                      {asset.algorithm} • {asset.purpose}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                      SCORE {asset.riskScore}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate font-mono">
                    {asset.repoName} • {asset.filePath}
                  </span>
                  <span className="text-[10px] text-rose-400 mt-1 leading-snug">
                    Vulnerability: Susceptible to Shor polynomial quantum factorisation.
                  </span>
                </div>
              </div>
            ))}
            
            {criticalAssets.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="h-7 w-7 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Zero Critical Threats</span>
                <span className="text-[10px] text-slate-400 mt-0.5">All examined cryptographic signatures satisfy baseline quantum readiness.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
