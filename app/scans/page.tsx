'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PQStore, ScanJob, Repository } from '@/lib/mockData';
import { 
  Play, 
  Terminal as TerminalIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Cpu, 
  Search,
  Check,
  Shield,
  Zap,
  Activity,
  FolderGit2
} from 'lucide-react';

export default function ScansPage() {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanJob | null>(null);
  
  // Trigger scan states
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allScans = PQStore.getScans();
    setScans(allScans);
    if (allScans.length > 0) {
      setSelectedScan(allScans[0]);
    }
    setRepos(PQStore.getRepositories());
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs]);

  const handleStartScan = () => {
    if (!selectedRepoId) {
      alert('Please select a repository to scan.');
      return;
    }
    const repo = repos.find(r => r.id === selectedRepoId);
    if (!repo) return;

    setIsScanning(true);
    setLiveLogs([]);

    const newScanId = `scan-${Date.now()}`;
    const newScanJob: ScanJob = {
      id: newScanId,
      repoId: repo.id,
      repoName: repo.name,
      commitSha: Math.random().toString(16).substring(2, 10) + '00000000000000000000000000000000',
      branch: repo.branch,
      status: 'running',
      durationMs: 0,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      findingsCount: 0,
      logs: []
    };

    setScans(prev => [newScanJob, ...prev]);
    setSelectedScan(newScanJob);

    const logPool = [
      `[SYSTEM] Connecting to Transit Quantum Orchestrator...`,
      `[SYSTEM] Resolving branch '${repo.branch}' to latest commit SHA`,
      `[SYSTEM] Clone repository: Fetching source tree...`,
      `[SYSTEM] Clone complete. Size: 14.8 MB verified.`,
      `[PARSER] Language detected: Python (100%)`,
      `[PARSER] Initializing Tree-sitter AST syntax parsers...`,
      `[PARSER] Inspecting AST call expressions and import graphs...`,
      `[ENGINE] Discovering cryptographic primitives (cryptography, hashlib)...`,
      `[ENGINE] Detected RSA-2048 key exchange in src/ssh/keys.py`,
      `[ENGINE] Detected SHA-1 message digest in src/utils/hash.py`,
      `[POLICY] Running NIST SP 800-208 & FIPS 204 compliance validation...`,
      `[ALERT] RSA-2048 flagged: Vulnerable to Shor's quantum factorisation.`,
      `[POLICY] ALERT: SHA-1 violates security policy: Deprecated Legacy Hash.`,
      `[SYSTEM] Generating cryptographic dependency & blast-radius graph...`,
      `[SYSTEM] Inspection complete. 3 assets registered into CBOM inventory.`,
      `[SUCCESS] Transit Security Sentinel verified quantum posture.`
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logPool.length) {
        setLiveLogs(prev => [...prev, logPool[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        
        const finalizedJob: ScanJob = {
          ...newScanJob,
          status: 'completed',
          durationMs: 4600,
          findingsCount: 3,
          logs: logPool
        };

        const updatedRepos = PQStore.getRepositories().map(r => {
          if (r.id === repo.id) {
            return {
              ...r,
              status: 'scanned' as const,
              lastScanTime: finalizedJob.timestamp,
              riskScore: 78,
              criticalCount: 1,
              highCount: 1,
              mediumCount: 1,
              lowCount: 0,
              cryptoAssetsCount: 3
            };
          }
          return r;
        });
        PQStore.saveRepositories(updatedRepos);
        setRepos(updatedRepos);

        PQStore.saveScans([finalizedJob, ...PQStore.getScans()]);
        setScans([finalizedJob, ...PQStore.getScans().filter(s => s.id !== newScanId)]);
        setSelectedScan(finalizedJob);
        setIsScanning(false);

        const currentAssets = PQStore.getAssets();
        const filterAssets = currentAssets.filter(a => a.repoId !== repo.id);
        const newAssets = [
          {
            id: `asset-c-${Date.now()}`,
            repoId: repo.id,
            repoName: repo.name,
            algorithm: 'RSA-2048',
            variant: 'PKCS#1 v1.5',
            purpose: 'SSH Authentication',
            operation: 'Signing/Key Exchange',
            filePath: 'src/ssh/keys.py',
            lineNumbers: [45, 46],
            library: 'cryptography',
            component: 'SftpConnector',
            dependents: ['RemoteSyncWorker'],
            exposure: 'Internet-facing' as const,
            confidence: 'High' as const,
            riskLevel: 'Critical' as const,
            riskScore: 88,
            recommendation: 'Replace RSA keys with post-quantum ML-DSA signature scheme or Ed25519.',
            codeSnippet: `from cryptography.hazmat.primitives.asymmetric import rsa\n\ndef load_ssh_key():\n    return rsa.generate_private_key(public_exponent=65537, key_size=2048)`,
            explanation: 'Asymmetric RSA-2048 keys offer minimal quantum security. Shor\'s algorithm can compute private key from public factors.'
          },
          {
            id: `asset-h-${Date.now()}`,
            repoId: repo.id,
            repoName: repo.name,
            algorithm: 'SHA-1',
            variant: 'Standard',
            purpose: 'File Integrity Hashing',
            operation: 'Hashing',
            filePath: 'src/utils/hash.py',
            lineNumbers: [14],
            library: 'hashlib',
            component: 'FileUploader',
            dependents: ['AdminLogs'],
            exposure: 'Internal-facing' as const,
            confidence: 'High' as const,
            riskLevel: 'High' as const,
            riskScore: 68,
            recommendation: 'Replace SHA-1 with SHA-256 or SHA-384. Symmetric hashes like SHA-256 are quantum resistant.',
            codeSnippet: `import hashlib\n\ndef hash_file(filepath):\n    return hashlib.sha1(open(filepath, "rb").read()).hexdigest()`,
            explanation: 'SHA-1 is highly susceptible to collision attacks, making it unsafe for cryptographic validation.'
          }
        ];
        PQStore.saveAssets([...newAssets, ...filterAssets]);

        const audits = PQStore.getAudits();
        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Scan Completed',
          timestamp: finalizedJob.timestamp,
          user: 'System Worker',
          details: `Scan complete for repo ${repo.name} (commit ${finalizedJob.commitSha.slice(0, 7)}). Discovered 3 assets.`
        };
        PQStore.saveAudits([newAudit, ...audits]);
      }
    }, 240);
  };

  const getLogClass = (log: string) => {
    if (log.includes('[SUCCESS]')) return 'text-emerald-400 font-semibold';
    if (log.includes('[ALERT]') || log.includes('Vulnerable')) return 'text-rose-400 font-semibold';
    if (log.includes('[POLICY]') || log.includes('[WARN]')) return 'text-amber-400';
    if (log.includes('[PARSER]')) return 'text-indigo-300';
    if (log.includes('[ENGINE]')) return 'text-cyan-300';
    if (log.includes('[SYSTEM]')) return 'text-slate-400';
    return 'text-slate-300';
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cryptographic Scans Console
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AST Engine Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trigger on-demand static code analysis, extract cryptographic primitives, and monitor live engine logs.
          </p>
        </div>
      </div>

      {/* Top Scan Trigger Console */}
      <div className="bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-end gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex-1 flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
            Target Repository
          </label>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            disabled={isScanning}
            className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all w-full cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Choose Repository Fleet Target --</option>
            {repos.map(repo => (
              <option key={repo.id} value={repo.id}>
                {repo.name} ({repo.branch})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStartScan}
          disabled={isScanning || !selectedRepoId}
          className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto active:scale-[0.98] cursor-pointer"
        >
          {isScanning ? (
            <>
              <Cpu className="h-4 w-4 animate-spin" />
              <span>Scanning AST...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Launch Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout (History vs Live Output logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scans History Column */}
        <div className="lg:col-span-5 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-5 flex flex-col h-[540px] shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300">
              Scan History
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {scans.length} Jobs
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {scans.map((scan) => {
              const isSelected = selectedScan?.id === scan.id;
              const isRunning = scan.status === 'running';

              return (
                <div
                  key={scan.id}
                  onClick={() => !isScanning && setSelectedScan(scan)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  } ${isScanning ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {scan.repoName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
                        commit: {scan.commitSha.slice(0, 7)}
                      </span>
                    </div>

                    {isRunning ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 animate-pulse font-semibold">
                        RUNNING
                      </span>
                    ) : scan.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                        PASSED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400">
                        FAILED
                      </span>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {isRunning ? 'Analyzing...' : `${(scan.durationMs / 1000).toFixed(1)}s`}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {scan.findingsCount} assets found
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Output Logs / Details Column */}
        <div className="lg:col-span-7 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-5 flex flex-col h-[540px] shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
              <TerminalIcon className="h-4 w-4 text-cyan-400" />
              Terminal Stream Console
            </span>
            {selectedScan && (
              <span className="text-[10px] text-slate-500 font-mono">
                TASK: {selectedScan.id}
              </span>
            )}
          </div>

          {selectedScan ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Monospace Code Terminal logs */}
              <div className="flex-1 bg-[#05070c] border border-slate-800/90 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-400 overflow-y-auto space-y-1.5 shadow-inner">
                <div className="text-cyan-400 font-semibold mb-3 flex items-center gap-2 pb-2 border-b border-slate-800/60">
                  <span className="text-slate-500">$</span>
                  <span>transit-sentinel-analyzer --repo {selectedScan.repoName} --branch {selectedScan.branch}</span>
                </div>
                
                {/* Print Live Logs if current is running, else compile stored logs */}
                {selectedScan.status === 'running' ? (
                  liveLogs.map((log, idx) => (
                    <div key={idx} className={getLogClass(log)}>
                      {log}
                    </div>
                  ))
                ) : (
                  selectedScan.logs.map((log, idx) => (
                    <div key={idx} className={getLogClass(log)}>
                      {log}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>

              {/* Status footer inside console pane */}
              <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>Engine:</span>
                  <span className="text-cyan-400">Transit Sentinel v2.4-PQC</span>
                </div>
                {selectedScan.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-xs">
                    <Check className="h-3.5 w-3.5 bg-emerald-950 border border-emerald-800 rounded-full p-0.5" />
                    Verified Pass
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
              <TerminalIcon className="h-8 w-8 text-slate-700 mb-3" />
              <span className="text-xs font-semibold text-slate-400">No Target Scan Selected</span>
              <span className="text-[10px] text-slate-600 mt-1">Select a repository and trigger scan to inspect output streams.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
