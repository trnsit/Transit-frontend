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
  Legend
} from 'recharts';
import { 
  ShieldAlert, 
  Folder, 
  Activity, 
  Key, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileDown
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
    // Refresh every 3 seconds to capture scan completions or repo additions
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono text-zinc-500">Loading metrics...</span>
      </div>
    );
  }

  // Calculate stats dynamically
  const scannedRepos = repos.filter(r => r.status === 'scanned').length;
  const criticalAssets = assets.filter(a => a.riskLevel === 'Critical');
  const highAssets = assets.filter(a => a.riskLevel === 'High');
  const mediumAssets = assets.filter(a => a.riskLevel === 'Medium');
  const lowAssets = assets.filter(a => a.riskLevel === 'Low');

  // Quantum Safety Index calculation (safe symmetric or PQC signatures / total)
  // AES-256-GCM is safe in our mock list, let's look at counts
  const quantumSafeCount = assets.filter(a => ['AES-256-GCM', 'ML-KEM-768', 'ML-DSA-65'].includes(a.algorithm)).length;
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
    { name: 'Critical', value: criticalAssets.length, color: '#f43f5e' }, // rose-500
    { name: 'High', value: highAssets.length, color: '#f59e0b' },      // amber-500
    { name: 'Medium', value: mediumAssets.length, color: '#3b82f6' },    // blue-500
    { name: 'Low', value: lowAssets.length, color: '#10b981' },       // emerald-500
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Security Overview</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time post-quantum cryptographic posture and migration monitoring.
          </p>
        </div>
        <button 
          onClick={() => alert('PDF export initialized. Generative report compiled for PQShield.')}
          className="h-9 px-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
        >
          <FileDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          Export Security Report
        </button>
      </div>

      {/* Grid Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Repositories */}
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-350 dark:hover:border-zinc-700/60 transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Repositories</span>
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <Folder className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{scannedRepos}</span>
            <span className="text-xs text-zinc-500">/ {repos.length} Scanned</span>
          </div>
          <div className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            Last scan 14h ago
          </div>
        </div>

        {/* Total Crypto Assets */}
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-350 dark:hover:border-zinc-700/60 transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Crypto Assets</span>
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{totalAssetsCount}</span>
            <span className="text-xs text-indigo-650 dark:text-indigo-400 font-mono">Found in code</span>
          </div>
          <div className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Across {repos.filter(r => r.cryptoAssetsCount > 0).length} repositories
          </div>
        </div>

        {/* Critical Warnings */}
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-350 dark:hover:border-zinc-700/60 transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Critical Risks</span>
            <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-red-500 dark:text-red-400">{criticalAssets.length}</span>
            <span className="text-xs text-red-650 dark:text-red-500 font-semibold font-mono">POLICY VIOLATIONS</span>
          </div>
          <div className="mt-3 text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
            Vulnerable asymmetric signatures
          </div>
        </div>

        {/* Quantum Safety Index */}
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-350 dark:hover:border-zinc-700/60 transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Quantum Safety</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{quantumSafetyIndex}%</span>
            <span className="text-xs text-zinc-500">Compliance</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-555 h-full rounded-full transition-all duration-500" 
              style={{ width: `${quantumSafetyIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Algorithm distribution bar chart */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 p-5 rounded-xl flex flex-col shadow-sm dark:shadow-none">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 mb-5">Cryptographic Primitives Discovered</span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={algoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4f46e5', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {algoChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name.includes('ML-') || entry.name.includes('256-GCM') ? '#10b981' : '#4f46e5'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200 dark:border-zinc-900 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Quantum Safe / Resistant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
              Vulnerable to Quantum Decryption
            </span>
          </div>
        </div>

        {/* Risk Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 p-5 rounded-xl flex flex-col shadow-sm dark:shadow-none">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 mb-5">Vulnerability Breakdown</span>
          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {criticalAssets.length + highAssets.length}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-medium uppercase">High/Crit Risk</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            {riskChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-zinc-550 dark:text-zinc-400">
                <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong className="text-zinc-800 dark:text-zinc-200">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Repositories & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanned Repositories Summary */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex flex-col shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">Monitored Repositories</span>
            <Link 
              href="/repositories" 
              className="text-xs text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              Manage Repos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 text-[10px] uppercase font-mono">
                  <th className="pb-2.5 font-semibold">Repository</th>
                  <th className="pb-2.5 font-semibold text-center">Crypto Assets</th>
                  <th className="pb-2.5 font-semibold">Risk Score</th>
                  <th className="pb-2.5 font-semibold">Stance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900/40 text-xs">
                {repos.slice(0, 3).map((repo) => (
                  <tr key={repo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{repo.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[180px]">{repo.url}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-zinc-700 dark:text-zinc-300 font-semibold">{repo.cryptoAssetsCount}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-850 dark:text-zinc-200">{repo.status === 'unscanned' ? '-' : repo.riskScore}</span>
                        {repo.status !== 'unscanned' && (
                          <div className="w-16 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                repo.riskScore > 80 ? 'bg-red-500' : repo.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${repo.riskScore}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {repo.status === 'unscanned' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">Unscanned</span>
                      ) : repo.riskScore > 75 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 font-semibold">Vulnerable</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-650 dark:text-emerald-400 font-semibold">Resistant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vulnerability Warnings Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex flex-col shadow-sm dark:shadow-none">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 mb-4">Critical Advisories</span>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
            {criticalAssets.map((asset) => (
              <div 
                key={asset.id} 
                className="p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3"
              >
                <div className="h-6 w-6 rounded bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-650 dark:text-red-400 shrink-0 font-mono text-[9px] font-bold">
                  !
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-[11px] font-semibold text-red-800 dark:text-red-200">
                    Legacy {asset.algorithm} used for {asset.purpose}
                  </span>
                  <span className="text-[10px] text-zinc-550 dark:text-zinc-400 truncate font-mono">
                    {asset.repoName} • {asset.filePath}
                  </span>
                  <span className="text-[10px] text-red-655 dark:text-red-400 mt-1">
                    Risk: Quantum vulnerable key signature.
                  </span>
                </div>
              </div>
            ))}
            
            {criticalAssets.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-500 mb-2" />
                <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-300">All Clear</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">No critical algorithm risks active.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
