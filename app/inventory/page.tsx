'use client';

import React, { useState, useEffect } from 'react';
import { PQStore, CryptoAsset, Repository, MigrationPlan } from '@/lib/mockData';
import { 
  Search, 
  Filter, 
  Sparkles, 
  FileCode, 
  Network, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);

  const handleCreatePlan = () => {
    if (!selectedAsset) return;

    const existingPlans = PQStore.getMigrations();
    const exists = existingPlans.some(p => p.assetId === selectedAsset.id);

    if (exists) {
      router.push('/migrations');
      return;
    }

    let diffBefore = selectedAsset.codeSnippet;
    let diffAfter = '';
    let name = `Upgrade ${selectedAsset.purpose} to Quantum-Safe`;
    let targetAlgo = 'ML-DSA-65';

    if (selectedAsset.algorithm === 'RSA-2048' && selectedAsset.purpose.includes('JWT')) {
      targetAlgo = 'ML-DSA-65';
      diffAfter = `import { Sign } from 'oqs-signatures'; // Open Quantum Safe node wrapper\nimport jwt from 'jsonwebtoken';\n\nconst signer = new Sign('ML-DSA-65');\n\nexport function generateToken(payload: object, privateKeyBuffer: Buffer) {\n  const tokenHeader = { alg: 'ML-DSA-65', typ: 'JWT' };\n  const payloadStr = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 });\n  const message = Buffer.from(JSON.stringify(tokenHeader) + '.' + payloadStr);\n  \n  const signature = signer.sign(message, privateKeyBuffer);\n  return \`\${Buffer.from(JSON.stringify(tokenHeader)).toString('base64')}.\${Buffer.from(payloadStr).toString('base64')}.\${signature.toString('base64')}\`;\n}`;
    } else if (selectedAsset.algorithm === 'RSA-2048' && selectedAsset.purpose.includes('SSH')) {
      targetAlgo = 'ML-DSA-65';
      diffAfter = `from oqs import Signature\n\ndef load_ssh_key():\n    # ML-DSA-65 quantum resistant SSH Key\n    sig = Signature('ML-DSA-65')\n    return sig.generate_keypair()`;
    } else if (selectedAsset.algorithm === 'SHA-1') {
      targetAlgo = 'SHA-256';
      name = `Upgrade ${selectedAsset.purpose} to SHA-256`;
      diffAfter = `import hashlib\n\ndef hash_file(filepath):\n    # Upgrade hashing to SHA-255 (Grover resistant)\n    return hashlib.sha256(open(filepath, "rb").read()).hexdigest()`;
    } else if (selectedAsset.algorithm === 'AES-128-CBC') {
      targetAlgo = 'AES-256-GCM';
      name = `Upgrade session payload encryption to AES-256-GCM`;
      diffAfter = `from cryptography.hazmat.primitives.ciphers.aead import AESGCM\n\ndef encrypt_session(key, data):\n    # Upgrade to AES-256-GCM (AEAD + quantum resistant)\n    aesgcm = AESGCM(key)\n    return aesgcm.encrypt(nonce, data, None)`;
    } else {
      targetAlgo = 'ML-KEM-768';
      diffAfter = selectedAsset.codeSnippet.replace(selectedAsset.algorithm, 'ML-KEM-768');
    }

    const newPlan: MigrationPlan = {
      id: `mig-${Date.now()}`,
      name: name,
      repoId: selectedAsset.repoId,
      repoName: selectedAsset.repoName,
      assetId: selectedAsset.id,
      targetAlgorithm: targetAlgo,
      status: 'draft',
      diffBefore,
      diffAfter,
      validationSteps: {
        syntax: 'pending',
        build: 'pending',
        tests: 'pending',
        policy: 'pending',
        rescan: 'pending'
      }
    };

    PQStore.saveMigrations([newPlan, ...existingPlans]);

    // Audit log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Migration Plan Created',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
      details: `Created migration plan '${name}' for repository: ${selectedAsset.repoName}`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    router.push('/migrations');
  };

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedExposure, setSelectedExposure] = useState('');

  useEffect(() => {
    setAssets(PQStore.getAssets());
    setRepos(PQStore.getRepositories());
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRepo('');
    setSelectedRisk('');
    setSelectedExposure('');
  };

  // Filter Logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.component.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRepo = selectedRepo ? asset.repoId === selectedRepo : true;
    const matchesRisk = selectedRisk ? asset.riskLevel === selectedRisk : true;
    const matchesExposure = selectedExposure ? asset.exposure === selectedExposure : true;

    return matchesSearch && matchesRepo && matchesRisk && matchesExposure;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Cryptographic Inventory</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Unified index of discovered cryptographic primitives, libraries, locations, and dependencies.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search algorithm, file, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-4 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Repo Filter */}
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Repositories</option>
            {repos.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Risk Tiers</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Exposure Filter */}
          <select
            value={selectedExposure}
            onChange={(e) => setSelectedExposure(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Exposure</option>
            <option value="Internet-facing">Internet-facing</option>
            <option value="Internal-facing">Internal-facing</option>
            <option value="Internal-only">Internal-only</option>
          </select>
        </div>

        {/* Clear Filter */}
        {(searchTerm || selectedRepo || selectedRisk || selectedExposure) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Clear Filters
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Split Screen Grid (Left: Table, Right: Details Sidepane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Inventory Table */}
        <div className={`${selectedAsset ? 'lg:col-span-7' : 'lg:col-span-12'} bg-zinc-900/30 border border-zinc-900 rounded-xl overflow-hidden transition-all duration-300`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-mono bg-zinc-950/20">
                  <th className="p-4 font-semibold">Algorithm</th>
                  <th className="p-4 font-semibold">Purpose</th>
                  <th className="p-4 font-semibold">Library</th>
                  <th className="p-4 font-semibold">Repository</th>
                  <th className="p-4 font-semibold">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(isSelected ? null : asset)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-zinc-900/80 hover:bg-zinc-900/80 border-l-2 border-indigo-500 pl-3.5' 
                          : 'hover:bg-zinc-900/20'
                      }`}
                    >
                      <td className="p-4 font-semibold text-zinc-200">
                        <div className="flex items-center gap-1.5">
                          {asset.algorithm}
                          {['ML-KEM-768', 'ML-DSA-65', 'AES-256-GCM'].includes(asset.algorithm) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Quantum Resistant" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400">{asset.purpose}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">
                          {asset.library}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 truncate max-w-[120px]">{asset.repoName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          asset.riskLevel === 'Critical' 
                            ? 'bg-red-950/20 border border-red-900/50 text-red-400' 
                            : asset.riskLevel === 'High'
                            ? 'bg-amber-950/20 border border-amber-900/50 text-amber-400'
                            : asset.riskLevel === 'Medium'
                            ? 'bg-blue-950/20 border border-blue-900/50 text-blue-400'
                            : 'bg-emerald-950/20 border border-emerald-900/50 text-emerald-400'
                        }`}>
                          {asset.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">
                      No matching cryptographic assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Slide-out Details Panel */}
        {selectedAsset && (
          <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-850 rounded-xl p-5 space-y-5 animate-in slide-in-from-right-4 duration-300 sticky top-20 shadow-xl max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Header Block */}
            <div className="flex items-start justify-between border-b border-zinc-900 pb-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-zinc-100 flex items-center gap-1.5">
                  {selectedAsset.algorithm}
                  <span className="text-[10px] font-mono text-zinc-500">[{selectedAsset.variant}]</span>
                </h3>
                <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider mt-0.5">
                  Risk Score: {selectedAsset.riskScore}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider">Repository</span>
                <span className="text-zinc-300 font-medium">{selectedAsset.repoName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider">Exposure</span>
                <span className="text-zinc-300 font-medium">{selectedAsset.exposure}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider">Used By Component</span>
                <span className="text-zinc-300 font-medium">{selectedAsset.component}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider">Static Confidence</span>
                <span className="text-zinc-300 font-medium">{selectedAsset.confidence}</span>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-1.5">
              <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-zinc-400" />
                Source Code Location
              </span>
              <div className="bg-black border border-zinc-950 rounded-lg overflow-hidden font-mono text-[10px] leading-relaxed">
                <div className="bg-zinc-900/60 px-3 py-1.5 text-zinc-500 border-b border-zinc-950 flex items-center justify-between">
                  <span className="truncate max-w-[200px]">{selectedAsset.filePath}</span>
                  <span className="shrink-0 text-indigo-400 font-medium">Lines: {selectedAsset.lineNumbers.join('-')}</span>
                </div>
                <pre className="p-3 text-zinc-400 overflow-x-auto scrollbar-thin">
                  <code>{selectedAsset.codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* AI Advisor Explanation */}
            <div className="space-y-2 p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-xl relative overflow-hidden">
              <div className="absolute top-2.5 right-3.5 flex items-center gap-1 text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" />
                AI advisory
              </div>
              <span className="text-xs font-semibold text-indigo-300 block">Threat & Vulnerability Assessment</span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                {selectedAsset.explanation}
              </p>
              
              <div className="pt-3 border-t border-indigo-900/40 mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Recommended Alternative</span>
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-zinc-200">{selectedAsset.recommendation.split(' (')[0]}</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  {selectedAsset.recommendation}
                </p>
              </div>
            </div>

            {/* Dependents Graph List */}
            <div className="space-y-2">
              <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-zinc-400" />
                Impact Graph Dependents ({selectedAsset.dependents.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAsset.dependents.map((dep) => (
                  <span key={dep} className="px-2 py-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-mono flex items-center gap-1">
                    <ChevronRight className="h-2.5 w-2.5 text-indigo-500" />
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Action to Migrations Page */}
            {selectedAsset.riskLevel !== 'Low' && (
              <div className="pt-2 border-t border-zinc-900">
                <button
                  onClick={handleCreatePlan}
                  className="w-full h-9 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/60 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Create Migration Plan
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
