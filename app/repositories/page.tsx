'use client';

import React, { useState, useEffect } from 'react';
import { PQStore, Repository, CryptoAsset, ScanJob } from '@/lib/mockData';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  FolderGit2, 
  Layers, 
  FileText,
  AlertTriangle,
  Play,
  X
} from 'lucide-react';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);

  // Form states
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [language, setLanguage] = useState('Python');
  const [exclusions, setExclusions] = useState('**/tests/**, **/node_modules/**');

  useEffect(() => {
    setRepos(PQStore.getRepositories());
  }, []);

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName || !repoUrl) {
      alert('Please fill in name and URL.');
      return;
    }

    const newRepo: Repository = {
      id: `repo-${Date.now()}`,
      name: repoName,
      url: repoUrl,
      branch: branch,
      status: 'unscanned',
      lastScanTime: null,
      language: [language],
      riskScore: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      cryptoAssetsCount: 0
    };

    const updated = [...repos, newRepo];
    setRepos(updated);
    PQStore.saveRepositories(updated);

    // Audit log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Repository Connected',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
      details: `Connected repository ${repoName} (${branch})`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    // Close and reset
    setIsModalOpen(false);
    setRepoName('');
    setRepoUrl('');
    setBranch('main');
  };

  const handleDeleteRepo = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect repository "${name}"? This deletes its scan history and findings.`)) return;

    const updated = repos.filter(r => r.id !== id);
    setRepos(updated);
    PQStore.saveRepositories(updated);

    // Delete associated assets and scans
    const assets = PQStore.getAssets().filter(a => a.repoId !== id);
    PQStore.saveAssets(assets);

    const scans = PQStore.getScans().filter(s => s.repoId !== id);
    PQStore.saveScans(scans);

    // Audit log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Repository Disconnected',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
      details: `Disconnected repository: ${name}`
    };
    PQStore.saveAudits([newAudit, ...audits]);
  };

  const handleScanRepo = (id: string) => {
    setScanningId(id);

    // 1. Update repo status to scanning
    const updatedRepos = repos.map(r => r.id === id ? { ...r, status: 'scanning' as const } : r);
    setRepos(updatedRepos);
    PQStore.saveRepositories(updatedRepos);

    // 2. Set timeout to simulate scanning process (3 seconds)
    setTimeout(() => {
      const repo = repos.find(r => r.id === id);
      if (!repo) return;

      const randomRisk = Math.floor(Math.random() * 50) + 40; // 40-90
      const critical = randomRisk > 80 ? 1 : 0;
      const high = randomRisk > 60 ? 2 : 1;
      const medium = 2;
      const low = 1;
      const totalAssets = critical + high + medium + low;

      // Update repo details
      const finalizedRepos = PQStore.getRepositories().map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'scanned' as const,
            lastScanTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
            riskScore: randomRisk,
            criticalCount: critical,
            highCount: high,
            mediumCount: medium,
            lowCount: low,
            cryptoAssetsCount: totalAssets
          };
        }
        return r;
      });
      setRepos(finalizedRepos);
      PQStore.saveRepositories(finalizedRepos);

      // Create new scan job
      const scanJobs = PQStore.getScans();
      const newScan: ScanJob = {
        id: `scan-${Date.now()}`,
        repoId: repo.id,
        repoName: repo.name,
        commitSha: Math.random().toString(16).substring(2, 10) + '00000000000000000000000000000000',
        branch: repo.branch,
        status: 'completed',
        durationMs: 7800,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        findingsCount: totalAssets,
        logs: [
          `[INFO] Cloning commit for branch ${repo.branch}`,
          `[INFO] Scanning workspace directory for languages...`,
          `[INFO] Target: ${repo.language.join(', ')} AST parser activated`,
          `[INFO] Discovery: Found ${critical} critical, ${high} high vulnerability`,
          `[SUCCESS] Repository ${repo.name} successfully cataloged.`
        ]
      };
      PQStore.saveScans([newScan, ...scanJobs]);

      // Create mock crypto assets for this scanned repository
      const currentAssets = PQStore.getAssets();
      const newAssets: CryptoAsset[] = [];

      if (critical > 0) {
        newAssets.push({
          id: `asset-c-${Date.now()}`,
          repoId: id,
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
          exposure: 'Internet-facing',
          confidence: 'High',
          riskLevel: 'Critical',
          riskScore: 88,
          recommendation: 'Replace RSA keys with post-quantum ML-DSA signature scheme or Ed25519.',
          codeSnippet: `from cryptography.hazmat.primitives.asymmetric import rsa\n\ndef load_ssh_key():\n    return rsa.generate_private_key(public_exponent=65537, key_size=2048)`,
          explanation: 'Asymmetric RSA-2048 keys offer minimal quantum security. Shore\'s algorithm can compute the private key from public factors. Transition to hybrid PQC schemes.'
        });
      }

      if (high > 0) {
        newAssets.push({
          id: `asset-h-${Date.now()}`,
          repoId: id,
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
          exposure: 'Internal-facing',
          confidence: 'High',
          riskLevel: 'High',
          riskScore: 68,
          recommendation: 'Replace SHA-1 with SHA-256 or SHA-384. Symmetric hashes like SHA-256 are considered quantum resistant.',
          codeSnippet: `import hashlib\n\ndef hash_file(filepath):\n    return hashlib.sha1(open(filepath, "rb").read()).hexdigest()`,
          explanation: 'SHA-1 is highly susceptible to collision attacks, making it unsafe for cryptographic validation. Grover\'s algorithm further lowers its security.'
        });
      }

      // Add a medium risk asset
      newAssets.push({
        id: `asset-m-${Date.now()}`,
        repoId: id,
        repoName: repo.name,
        algorithm: 'AES-128-CBC',
        variant: 'CBC',
        purpose: 'Backup File Encryption',
        operation: 'Encryption',
        filePath: 'src/backup/vault.py',
        lineNumbers: [32, 33],
        library: 'cryptography',
        component: 'LocalVault',
        dependents: ['BackupCronJob'],
        exposure: 'Internal-only',
        confidence: 'High',
        riskLevel: 'Medium',
        riskScore: 54,
        recommendation: 'Upgrade backup encryption to AES-256-GCM mode to ensure AEAD and quantum resistance.',
        codeSnippet: `from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes\n\ndef create_cipher(key, iv):\n    return Cipher(algorithms.AES(key), modes.CBC(iv))` ,
        explanation: 'AES-128 keys are computationally vulnerable in a post-quantum scenario where Grover\'s search reduces key space security to 64 bits.'
      });

      PQStore.saveAssets([...newAssets, ...currentAssets]);

      // Audit log
      const audits = PQStore.getAudits();
      const newAudit = {
        id: `aud-${Date.now()}`,
        action: 'Scan Completed',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: 'System Worker',
        details: `Scan complete for repository: ${repo.name}. Discovered ${totalAssets} assets.`
      };
      PQStore.saveAudits([newAudit, ...audits]);

      setScanningId(null);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Repositories Manager</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Connect and configure software source repositories for static cryptographic scanning.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      {/* Grid of Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {repos.map((repo) => {
          const isScanning = scanningId === repo.id || repo.status === 'scanning';
          return (
            <div 
              key={repo.id} 
              className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between group hover:border-zinc-800/80 transition-all duration-300 relative overflow-hidden"
            >
              {/* Scan Loader overlay indicator */}
              {isScanning && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-zinc-200">Analyzing Repository</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1">Cloning, AST parsing, mapping...</span>
                  </div>
                </div>
              )}

              <div>
                {/* Repository Title Block */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-300">
                      <FolderGit2 className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-100 group-hover:text-white transition-colors">
                        {repo.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <GitFork className="h-3 w-3 text-zinc-600" />
                        {repo.branch}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {repo.status === 'scanned' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 font-medium">
                      Scanned
                    </span>
                  ) : repo.status === 'unscanned' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                      Unscanned
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/20 border border-red-900/30 text-red-400">
                      Failed
                    </span>
                  )}
                </div>

                {/* Git URL */}
                <div className="mt-4 text-xs font-mono text-zinc-400 bg-zinc-950/50 px-3 py-2 rounded border border-zinc-900/80 flex items-center justify-between">
                  <span className="truncate max-w-[280px]">{repo.url}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                </div>

                {/* Language Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {repo.language.map((lang) => (
                    <span key={lang} className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded font-semibold border border-zinc-700/30">
                      {lang}
                    </span>
                  ))}
                </div>

                {/* Crypto Stats Grid */}
                {repo.status === 'scanned' && (
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-4 text-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Risk Score</span>
                      <span className={`text-base font-bold ${
                        repo.riskScore > 80 ? 'text-red-400' : repo.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {repo.riskScore}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-x border-zinc-900">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Inventory</span>
                      <span className="text-base font-bold text-zinc-200">
                        {repo.cryptoAssetsCount} <span className="text-[10px] text-zinc-500 font-normal">assets</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Critical Risks</span>
                      <span className="text-base font-bold text-red-400">
                        {repo.criticalCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-zinc-900/60 pt-4 gap-2">
                <button
                  onClick={() => handleDeleteRepo(repo.id, repo.name)}
                  className="h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Disconnect
                </button>
                <div className="flex items-center gap-2">
                  {repo.status === 'scanned' && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Last scan: {repo.lastScanTime?.split(' ')[0]}
                    </span>
                  )}
                  <button
                    onClick={() => handleScanRepo(repo.id)}
                    className="h-8 px-3.5 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50 hover:border-zinc-600 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Play className="h-3 w-3 text-indigo-400 fill-indigo-400" />
                    Scan Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-zinc-100">Connect Repository</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRepo} className="p-6 space-y-4">
              {/* Repo Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user-auth-api"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Git URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">GitHub HTTPS/SSH URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/org/repo-name.git"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Flex row branch & language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Default Branch</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Primary Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Go">Go</option>
                    <option value="Java">Java</option>
                  </select>
                </div>
              </div>

              {/* Exclusions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Path Exclusions</label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Bottom Buttons */}
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
                  Connect & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
