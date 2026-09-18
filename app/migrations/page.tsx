'use client';

import React, { useState, useEffect } from 'react';
import { PQStore, MigrationPlan, Repository, CryptoAsset } from '@/lib/mockData';
import { 
  GitCompare, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronRight, 
  Play, 
  Merge,
  ArrowRightLeft,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Code
} from 'lucide-react';

export default function MigrationsPage() {
  const [plans, setPlans] = useState<MigrationPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MigrationPlan | null>(null);
  
  // Validation animation states
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState({
    syntax: 'pending' as 'pending' | 'running' | 'success' | 'failed',
    build: 'pending' as 'pending' | 'running' | 'success' | 'failed',
    tests: 'pending' as 'pending' | 'running' | 'success' | 'failed',
    policy: 'pending' as 'pending' | 'running' | 'success' | 'failed',
    rescan: 'pending' as 'pending' | 'running' | 'success' | 'failed'
  });

  useEffect(() => {
    const list = PQStore.getMigrations();
    setPlans(list);
    if (list.length > 0) {
      setSelectedPlan(list[0]);
      setValidationState(list[0].validationSteps);
    }
  }, []);

  const handleStartValidation = () => {
    if (!selectedPlan) return;
    setIsValidating(true);
    
    const initialSteps = {
      syntax: 'running' as const,
      build: 'pending' as const,
      tests: 'pending' as const,
      policy: 'pending' as const,
      rescan: 'pending' as const
    };
    setValidationState(initialSteps);

    setTimeout(() => {
      setValidationState(prev => ({ ...prev, syntax: 'success', build: 'running' }));
      
      setTimeout(() => {
        setValidationState(prev => ({ ...prev, build: 'success', tests: 'running' }));
        
        setTimeout(() => {
          setValidationState(prev => ({ ...prev, tests: 'success', policy: 'running' }));
          
          setTimeout(() => {
            setValidationState(prev => ({ ...prev, policy: 'success', rescan: 'running' }));
            
            setTimeout(() => {
              const completedSteps = {
                syntax: 'success' as const,
                build: 'success' as const,
                tests: 'success' as const,
                policy: 'success' as const,
                rescan: 'success' as const
              };
              setValidationState(completedSteps);
              setIsValidating(false);

              const updatedPlan: MigrationPlan = {
                ...selectedPlan,
                status: 'approved',
                validationSteps: completedSteps
              };
              setSelectedPlan(updatedPlan);
              const updatedPlans = plans.map(p => p.id === selectedPlan.id ? updatedPlan : p);
              setPlans(updatedPlans);
              PQStore.saveMigrations(updatedPlans);

            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleMergeMigration = () => {
    if (!selectedPlan) return;

    const updatedPlan: MigrationPlan = {
      ...selectedPlan,
      status: 'merged'
    };
    setSelectedPlan(updatedPlan);
    const updatedPlans = plans.map(p => p.id === selectedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    PQStore.saveMigrations(updatedPlans);

    const repositories = PQStore.getRepositories().map(r => {
      if (r.id === selectedPlan.repoId) {
        return {
          ...r,
          riskScore: 28,
          criticalCount: 0,
          cryptoAssetsCount: r.cryptoAssetsCount
        };
      }
      return r;
    });
    PQStore.saveRepositories(repositories);

    const assets = PQStore.getAssets().map(a => {
      if (a.id === selectedPlan.assetId) {
        return {
          ...a,
          algorithm: 'ML-DSA-65',
          variant: 'Standard',
          purpose: 'JWT Token Signing (Migrated)',
          operation: 'Post-Quantum Sign/Verify',
          riskLevel: 'Low' as const,
          riskScore: 12,
          recommendation: 'Migration completed successfully with Transit.',
          codeSnippet: selectedPlan.diffAfter,
          explanation: 'This cryptographic signature has been converted to ML-DSA-65, conforming to FIPS 204. Secure against Shor\'s quantum algorithm.'
        };
      }
      return a;
    });
    PQStore.saveAssets(assets);

    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Migration Merged',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'operator@transit.io',
      details: `Merged migration: '${selectedPlan.name}' into ${selectedPlan.repoName} (main branch). Risk score decreased to 28.`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    alert('Migration successfully merged into repository main branch! Quantum safety score upgraded.');
  };

  const getStepIcon = (state: 'pending' | 'running' | 'success' | 'failed') => {
    switch (state) {
      case 'running':
        return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-900" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              PQC Migration Planner & Refactoring Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              NIST FIPS 204 / 203
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plan, validate, and merge post-quantum code transformations with automated AST diff compilation.
          </p>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Migration plans selection */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl backdrop-blur-xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono block">
              Active Migration Plans
            </span>
            
            <div className="space-y-2.5">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-100 leading-tight">
                        {plan.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">{plan.repoName}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-semibold">
                      <ArrowRightLeft className="h-3 w-3" />
                      <span>{plan.targetAlgorithm} Target</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
                      <span className="text-[10px] text-slate-500">Pipeline</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        plan.status === 'merged'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : plan.status === 'approved'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Stepper Container */}
          {selectedPlan && (
            <div className="bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono block">
                Validation & Integrity Pipeline
              </span>
              
              {/* Stepper list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.syntax)}
                    <span className="text-slate-200 font-medium">Syntax Validation</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">AST Tree</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.build)}
                    <span className="text-slate-200 font-medium">Build Verification</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Compile Pass</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.tests)}
                    <span className="text-slate-200 font-medium">Unit Test Suite</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Pytest/Jest</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.policy)}
                    <span className="text-slate-200 font-medium">Policy Engine Evaluation</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">NIST FIPS</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.rescan)}
                    <span className="text-slate-200 font-medium">Final Static Re-scan</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Post-Audit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {selectedPlan.status === 'draft' && (
                  <button
                    onClick={handleStartValidation}
                    disabled={isValidating}
                    className="w-full h-10 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isValidating ? 'Validating AST & Tests...' : 'Run Validation Pipeline'}</span>
                  </button>
                )}

                {selectedPlan.status === 'approved' && (
                  <button
                    onClick={handleMergeMigration}
                    className="w-full h-10 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  >
                    <Merge className="h-3.5 w-3.5" />
                    <span>Approve & Merge Code Transformation</span>
                  </button>
                )}

                {selectedPlan.status === 'merged' && (
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-2.5 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold">Migration Applied</span>
                      <span className="text-[10px] text-slate-400 leading-normal">
                        This plan has been merged into main. Reset simulation DB in the sidebar to run again.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Dynamic Diff Viewer */}
        {selectedPlan ? (
          <div className="lg:col-span-8 bg-[#0d121f]/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  AST Code Transformation Proposal
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Comparing: Vulnerable Classical vs. Post-Quantum Refactor</span>
              </div>
              
              <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 font-semibold">
                <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                Transit AI Synthesized
              </div>
            </div>

            {/* Split screen diff layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before code panel (Red deletions) */}
              <div className="flex flex-col bg-[#05070c] border border-rose-900/40 rounded-xl overflow-hidden font-mono text-xs leading-relaxed shadow-inner">
                <div className="bg-rose-950/30 px-3.5 py-2 text-rose-300 font-semibold border-b border-rose-900/40 flex items-center justify-between uppercase tracking-wider text-[9px]">
                  <span>Vulnerable Code [-]</span>
                  <span className="text-rose-400 font-normal">RSA / Classical</span>
                </div>
                <pre className="p-3.5 text-rose-200 overflow-x-auto min-h-[220px]">
                  <code>{selectedPlan.diffBefore}</code>
                </pre>
              </div>

              {/* After code panel (Green additions) */}
              <div className="flex flex-col bg-[#05070c] border border-emerald-900/40 rounded-xl overflow-hidden font-mono text-xs leading-relaxed shadow-inner">
                <div className="bg-emerald-950/30 px-3.5 py-2 text-emerald-300 font-semibold border-b border-emerald-900/40 flex items-center justify-between uppercase tracking-wider text-[9px]">
                  <span>PQC Migrated Code [+]</span>
                  <span className="text-emerald-400 font-normal">{selectedPlan.targetAlgorithm}</span>
                </div>
                <pre className="p-3.5 text-emerald-200 overflow-x-auto min-h-[220px]">
                  <code>{selectedPlan.diffAfter}</code>
                </pre>
              </div>
            </div>

            {/* AI Reasoning Block */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex gap-3 items-start">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Cryptographic Rationale & API Compatibility
                </span>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  The generated code replaces legacy classical primitives with modern post-quantum modules. Signature generation and verification are wrapped in zero-allocation buffer adapters, preserving downstream signature verification semantics while conferring complete Shor quantum resistance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-[#0d121f]/40">
            <GitCompare className="h-8 w-8 text-slate-700 mb-2.5" />
            <span className="text-xs font-semibold text-slate-300 font-sans">No Migration Proposal Loaded</span>
            <span className="text-[10px] text-slate-500 font-sans mt-0.5">Please select an active migration plan from the left panel.</span>
          </div>
        )}
      </div>
    </div>
  );
}
