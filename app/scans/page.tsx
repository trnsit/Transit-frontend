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
  Check
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

    // Create a new temporary running scan job
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

    // Update list
    setScans(prev => [newScanJob, ...prev]);
    setSelectedScan(newScanJob);

    // Live logs simulation
    const logPool = [
      `[SYSTEM] Connecting to repository manager...`,
      `[SYSTEM] Resolving branch '${repo.branch}' to latest commit SHA`,
      `[SYSTEM] Clone repository: Fetching files...`,
      `[SYSTEM] Clone complete. Repository size: 14.2 MB.`,
      `[PARSER] Language detected: Python (100%)`,
      `[PARSER] Loading Tree-sitter AST syntax parsers...`,
      `[PARSER] Analyzing AST nodes and imports...`,
      `[ENGINE] Scanning patterns for cryptographic libraries (cryptography, hashlib)...`,
      `[ENGINE] Discovered RSA-2048 signing primitive in src/ssh/keys.py`,
      `[ENGINE] Discovered SHA-1 usage in src/utils/hash.py`,
      `[POLICY] Running compliance validation engine...`,
      `[POLICY] ALERT: RSA-2048 is flagged as quantum-vulnerable.`,
      `[POLICY] ALERT: SHA-1 is prohibited by policy: Ban MD5/SHA-1 Hashing.`,
      `[SYSTEM] Compiling dependency and impact graph...`,
      `[SYSTEM] Scan finalized. Discovered 3 assets.`,
      `[SUCCESS] Analysis complete. Inventory written to database.`
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logPool.length) {
        setLiveLogs(prev => [...prev, logPool[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        
        // Finalize scan state
        const finalizedJob: ScanJob = {
          ...newScanJob,
          status: 'completed',
          durationMs: 4800,
          findingsCount: 3,
          logs: logPool
        };

        // Update PQStore Repositories status
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

        // Update PQStore Scans list
        const updatedScans = PQStore.getScans().map(s => s.id === newScanId ? finalizedJob : s);
        // Wait, since we prepended it in state, we should write it correctly in localStorage
        PQStore.saveScans([finalizedJob, ...PQStore.getScans()]);
        setScans([finalizedJob, ...PQStore.getScans().filter(s => s.id !== newScanId)]);
        setSelectedScan(finalizedJob);
        setIsScanning(false);

        // Create the assets for this repo if not already exists
        const currentAssets = PQStore.getAssets();
        // Clear old ones of this repo
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
            explanation: 'Asymmetric RSA-2048 keys offer minimal quantum security. Shore\'s algorithm can compute the private key from public factors. Transition to hybrid PQC schemes.'
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
            recommendation: 'Replace SHA-1 with SHA-256 or SHA-384. Symmetric hashes like SHA-256 are considered quantum resistant.',
            codeSnippet: `import hashlib\n\ndef hash_file(filepath):\n    return hashlib.sha1(open(filepath, "rb").read()).hexdigest()`,
            explanation: 'SHA-1 is highly susceptible to collision attacks, making it unsafe for cryptographic validation. Grover\'s algorithm further lowers its security.'
          }
        ];
        PQStore.saveAssets([...newAssets, ...filterAssets]);

        // Audit Log
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
    }, 250);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">Scan Center</h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Trigger new static cryptographic discovery scans and monitor orchestrator log outputs.
        </p>
      </div>

      {/* Top Scan Trigger Console */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">Select Scan Target</label>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            disabled={isScanning}
            className="h-10 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors w-full"
          >
            <option value="">-- Choose Repository --</option>
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
          className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto active:scale-[0.98]"
        >
          {isScanning ? (
            <>
              <Cpu className="h-4 w-4 animate-spin text-white" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-white" />
              Run Analysis
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout (History vs Live Output logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scans History Column */}
        <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 flex flex-col h-[520px]">
          <span className="text-sm font-semibold text-zinc-300 mb-4">Scan History</span>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {scans.map((scan) => {
              const isSelected = selectedScan?.id === scan.id;
              const isRunning = scan.status === 'running';
              return (
                <div
                  key={scan.id}
                  onClick={() => !isScanning && setSelectedScan(scan)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-zinc-900 border-zinc-700 shadow-md' 
                      : 'bg-zinc-950/40 border-zinc-900/80 hover:bg-zinc-900/20 hover:border-zinc-800'
                  } ${isScanning ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-bold text-zinc-200 truncate">{scan.repoName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-700" />
                        commit: {scan.commitSha.slice(0, 7)}
                      </span>
                    </div>

                    {isRunning ? (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-950/20 border border-indigo-900 text-indigo-400 animate-pulse font-semibold">
                        RUNNING
                      </span>
                    ) : scan.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 font-medium">
                        PASSED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-red-950/20 border border-red-900/40 text-red-400">
                        FAILED
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-900/40 pt-2.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isRunning ? 'Running...' : `${(scan.durationMs / 1000).toFixed(1)}s`}
                    </span>
                    <span>
                      {scan.findingsCount} assets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Output Logs / Details Column */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
            <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-indigo-400" />
              Scan Logs Console
            </span>
            {selectedScan && (
              <span className="text-[10px] text-zinc-500 font-mono">
                ID: {selectedScan.id}
              </span>
            )}
          </div>

          {selectedScan ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Monospace Code Terminal logs */}
              <div className="flex-1 bg-black border border-zinc-900 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-zinc-400 overflow-y-auto space-y-1.5 scrollbar-thin">
                <div className="text-indigo-400 font-semibold mb-2">
                  $ pqshield-analyzer --repo {selectedScan.repoName} --branch {selectedScan.branch}
                </div>
                
                {/* Print Live Logs if current is running, else compile stored logs */}
                {selectedScan.status === 'running' ? (
                  liveLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={
                        log.includes('[SUCCESS]') 
                          ? 'text-emerald-400' 
                          : log.includes('[WARN]') || log.includes('ALERT:') 
                          ? 'text-amber-400' 
                          : 'text-zinc-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  selectedScan.logs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={
                        log.includes('[SUCCESS]') 
                          ? 'text-emerald-400' 
                          : log.includes('[WARN]') || log.includes('ALERT:') 
                          ? 'text-amber-400' 
                          : 'text-zinc-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>

              {/* Status footer inside console pane */}
              <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="font-semibold">Scanner Version:</span>
                  <span className="font-mono text-zinc-500">v1.2.0-beta</span>
                </div>
                {selectedScan.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Check className="h-4 w-4 bg-emerald-950 border border-emerald-800 rounded-full p-0.5" />
                    Scan Verified
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-lg">
              <TerminalIcon className="h-8 w-8 text-zinc-700 mb-3" />
              <span className="text-xs font-semibold text-zinc-400">No Scan Target Selected</span>
              <span className="text-[10px] text-zinc-600 mt-1">Select a repository and trigger scan to see output logs.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
