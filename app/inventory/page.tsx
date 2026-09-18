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
  X,
  Key,
  Shield,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedExposure, setSelectedExposure] = useState('');

  useEffect(() => {
    setAssets(PQStore.getAssets());
    setRepos(PQStore.getRepositories());
  }, []);

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
      diffAfter = `import { Sign } from 'oqs-signatures';\nimport jwt from 'jsonwebtoken';\n\nconst signer = new Sign('ML-DSA-65');\n\nexport function generateToken(payload: object, privateKeyBuffer: Buffer) {\n  const tokenHeader = { alg: 'ML-DSA-65', typ: 'JWT' };\n  const payloadStr = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 });\n  const message = Buffer.from(JSON.stringify(tokenHeader) + '.' + payloadStr);\n  \n  const signature = signer.sign(message, privateKeyBuffer);\n  return \`\${Buffer.from(JSON.stringify(tokenHeader)).toString('base64')}.\${Buffer.from(payloadStr).toString('base64')}.\${signature.toString('base64')}\`;\n}`;
    } else if (selectedAsset.algorithm === 'RSA-2048' && selectedAsset.purpose.includes('SSH')) {
      targetAlgo = 'ML-DSA-65';
      diffAfter = `from oqs import Signature\n\ndef load_ssh_key():\n    # ML-DSA-65 quantum resistant SSH Key\n    sig = Signature('ML-DSA-65')\n    return sig.generate_keypair()`;
    } else if (selectedAsset.algorithm === 'SHA-1') {
      targetAlgo = 'SHA-256';
      name = `Upgrade ${selectedAsset.purpose} to SHA-256`;
      diffAfter = `import hashlib\n\ndef hash_file(filepath):\n    # Upgrade hashing to SHA-256 (Grover resistant)\n    return hashlib.sha256(open(filepath, "rb").read()).hexdigest()`;
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

    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Migration Plan Created',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'operator@transit.io',
      details: `Created migration plan '${name}' for repository: ${selectedAsset.repoName}`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    router.push('/migrations');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRepo('');
    setSelectedRisk('');
    setSelectedExposure('');
  };

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
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cryptographic Bill of Materials (CBOM)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {assets.length} Primitives
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory of discovered cryptographic primitives, libraries, locations, and dependencies.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search algorithm, file, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Repo Filter */}
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="h-9 bg-slate-900/90 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
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
            className="h-9 bg-slate-900/90 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
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
            className="h-9 bg-slate-900/90 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
          >
            <option value="">All Exposures</option>
            <option value="Internet-facing">Internet-facing</option>
            <option value="Internal-facing">Internal-facing</option>
            <option value="Internal-only">Internal-only</option>
          </select>
        </div>

        {/* Clear Filter */}
        {(searchTerm || selectedRepo || selectedRisk || selectedExposure) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Clear Filters</span>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Split Screen Grid (Left: Table, Right: Details Sidepane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Inventory Table */}
        <div className={`${selectedAsset ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#0d121f]/90 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl backdrop-blur-xl`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono bg-slate-900/50">
                  <th className="p-4 font-semibold">Algorithm</th>
                  <th className="p-4 font-semibold">Purpose</th>
                  <th className="p-4 font-semibold">Library</th>
                  <th className="p-4 font-semibold">Repository</th>
                  <th className="p-4 font-semibold">Risk Posture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(isSelected ? null : asset)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15 border-l-2 border-cyan-400 pl-3.5' 
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="p-4 font-semibold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{asset.algorithm}</span>
                          {['ML-KEM-768', 'ML-DSA-65', 'AES-256-GCM'].includes(asset.algorithm) && (
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" title="Quantum Safe Primitive" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{asset.purpose}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                          {asset.library}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 truncate max-w-[120px] font-mono">{asset.repoName}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          asset.riskLevel === 'Critical' 
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' 
                            : asset.riskLevel === 'High'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : asset.riskLevel === 'Medium'
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                            : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        }`}>
                          {asset.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">
                      No matching cryptographic primitives found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Details Slideout Panel */}
        {selectedAsset && (
          <div className="lg:col-span-5 bg-[#0d121f]/95 border border-slate-800 rounded-2xl p-6 space-y-5 animate-in slide-in-from-right-4 duration-300 sticky top-20 shadow-2xl backdrop-blur-2xl max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Header Block */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Key className="h-4 w-4 text-cyan-400" />
                  <span>{selectedAsset.algorithm}</span>
                  <span className="text-xs font-mono text-slate-400">[{selectedAsset.variant}]</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                    THREAT SCORE: {selectedAsset.riskScore}/100
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedAsset.exposure}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3.5 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold uppercase text-[9px] font-mono tracking-wider">Repository</span>
                <span className="text-slate-200 font-mono font-medium">{selectedAsset.repoName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold uppercase text-[9px] font-mono tracking-wider">Exposure</span>
                <span className="text-slate-200 font-medium">{selectedAsset.exposure}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold uppercase text-[9px] font-mono tracking-wider">Component</span>
                <span className="text-slate-200 font-medium">{selectedAsset.component}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold uppercase text-[9px] font-mono tracking-wider">Static Confidence</span>
                <span className="text-emerald-400 font-mono font-medium">{selectedAsset.confidence}</span>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[10px] font-mono tracking-wider flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                Code Implementation
              </span>
              <div className="bg-[#05070c] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs leading-relaxed shadow-inner">
                <div className="bg-slate-900/80 px-3.5 py-1.5 text-slate-400 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="truncate max-w-[200px]">{selectedAsset.filePath}</span>
                  <span className="shrink-0 text-cyan-400 font-mono">Lines: {selectedAsset.lineNumbers.join('-')}</span>
                </div>
                <pre className="p-3.5 text-slate-300 overflow-x-auto">
                  <code>{selectedAsset.codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Transit Advisory Rationale */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/20 via-cyan-950/15 to-transparent border border-cyan-500/20 rounded-xl relative overflow-hidden space-y-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Transit Cryptographic Intelligence</span>
              </div>
              <span className="text-xs font-bold text-slate-100 block">
                Post-Quantum Threat Profile
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedAsset.explanation}
              </p>
              
              <div className="pt-3 border-t border-cyan-500/20 mt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-mono">
                  Recommended Quantum-Safe Target
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-300">{selectedAsset.recommendation.split(' (')[0]}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedAsset.recommendation}
                </p>
              </div>
            </div>

            {/* Dependents Graph List */}
            <div className="space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px] font-mono tracking-wider flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-cyan-400" />
                Blast Radius Dependents ({selectedAsset.dependents.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAsset.dependents.map((dep) => (
                  <span key={dep} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                    <ChevronRight className="h-2.5 w-2.5 text-cyan-400" />
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Action to Migrations Page */}
            {selectedAsset.riskLevel !== 'Low' && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleCreatePlan}
                  className="w-full h-10 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <span>Initialize Migration Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
