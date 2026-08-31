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
  Info
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
      // Sync validation state if it has already been validated in store
      setValidationState(list[0].validationSteps);
    }
  }, []);

  const handleStartValidation = () => {
    if (!selectedPlan) return;
    setIsValidating(true);
    
    // Reset stepper
    const initialSteps = {
      syntax: 'running' as const,
      build: 'pending' as const,
      tests: 'pending' as const,
      policy: 'pending' as const,
      rescan: 'pending' as const
    };
    setValidationState(initialSteps);

    // Timeline simulation
    setTimeout(() => {
      // Step 1 Syntax pass
      setValidationState(prev => ({ ...prev, syntax: 'success', build: 'running' }));
      
      setTimeout(() => {
        // Step 2 Build compile pass
        setValidationState(prev => ({ ...prev, build: 'success', tests: 'running' }));
        
        setTimeout(() => {
          // Step 3 Tests pass
          setValidationState(prev => ({ ...prev, tests: 'success', policy: 'running' }));
          
          setTimeout(() => {
            // Step 4 Policy compliance checks pass
            setValidationState(prev => ({ ...prev, policy: 'success', rescan: 'running' }));
            
            setTimeout(() => {
              // Step 5 Rescan verification pass
              const completedSteps = {
                syntax: 'success' as const,
                build: 'success' as const,
                tests: 'success' as const,
                policy: 'success' as const,
                rescan: 'success' as const
              };
              setValidationState(completedSteps);
              setIsValidating(false);

              // Update in plans store
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

    // 1. Update migration status to merged
    const updatedPlan: MigrationPlan = {
      ...selectedPlan,
      status: 'merged'
    };
    setSelectedPlan(updatedPlan);
    const updatedPlans = plans.map(p => p.id === selectedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    PQStore.saveMigrations(updatedPlans);

    // 2. Perform side-effects: update repository risk score and assets list
    const repositories = PQStore.getRepositories().map(r => {
      if (r.id === selectedPlan.repoId) {
        return {
          ...r,
          riskScore: 28, // Dropped from 92 since RSA was migrated!
          criticalCount: 0, // RSA is gone
          cryptoAssetsCount: r.cryptoAssetsCount // count stays, but algorithm type changes
        };
      }
      return r;
    });
    PQStore.saveRepositories(repositories);

    // Modify the corresponding asset in Inventory to ML-DSA-65
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
          recommendation: 'Migration completed successfully on 2026-08-13.',
          codeSnippet: selectedPlan.diffAfter,
          explanation: 'This cryptographic signature has been converted to ML-DSA-65, conforming to FIPS 204. Secure against Shor\'s quantum algorithm.'
        };
      }
      return a;
    });
    PQStore.saveAssets(assets);

    // 3. Add to Audit Log
    const audits = PQStore.getAudits();
    const newAudit = {
      id: `aud-${Date.now()}`,
      action: 'Migration Merged',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin@pqshield.io',
      details: `Merged migration: '${selectedPlan.name}' into ${selectedPlan.repoName} (main branch). Risk score decreased to 28.`
    };
    PQStore.saveAudits([newAudit, ...audits]);

    alert('Migration successfully merged into repository production branch. Risk posture updated!');
  };

  const getStepIcon = (state: 'pending' | 'running' | 'success' | 'failed') => {
    switch (state) {
      case 'running':
        return <Loader2 className="h-4.5 w-4.5 text-indigo-400 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-4.5 w-4.5 text-red-500" />;
      default:
        return <div className="h-4.5 w-4.5 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-650" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">PQC Migration Planner</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Plan, execute, and validate code migrations from classical algorithms to post-quantum alternatives.
        </p>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Migration plans selection */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Migration Plans</span>
            
            <div className="space-y-2">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-700 shadow-md'
                        : 'bg-zinc-950/40 border-zinc-900/85 hover:bg-zinc-900/10 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-zinc-200 leading-tight">{plan.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-1 font-mono">{plan.repoName}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                      <ArrowRightLeft className="h-3 w-3 text-indigo-400" />
                      <span>{plan.targetAlgorithm} Transition</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-900 pt-2.5">
                      <span className="text-[9px] text-zinc-500">Status</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        plan.status === 'merged'
                          ? 'bg-emerald-950/20 border border-emerald-900 text-emerald-400'
                          : plan.status === 'approved'
                          ? 'bg-indigo-950/20 border border-indigo-900 text-indigo-400'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
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
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Validation Pipeline</span>
              
              {/* Stepper list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.syntax)}
                    <span className="text-zinc-300 font-medium">Syntax Validation</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">AST Tree</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.build)}
                    <span className="text-zinc-300 font-medium">Build Verification</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Compile</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.tests)}
                    <span className="text-zinc-300 font-medium">Unit Test Suite</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Pytest/Jest</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.policy)}
                    <span className="text-zinc-300 font-medium">Policy Engine Evaluation</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Compliance</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {getStepIcon(validationState.rescan)}
                    <span className="text-zinc-300 font-medium">Final Static Re-scan</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Sanity Check</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-900 space-y-2">
                {selectedPlan.status === 'draft' && (
                  <button
                    onClick={handleStartValidation}
                    disabled={isValidating}
                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    {isValidating ? 'Validating changes...' : 'Run Validation Pipeline'}
                  </button>
                )}

                {selectedPlan.status === 'approved' && (
                  <button
                    onClick={handleMergeMigration}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold shadow-lg transition-all active:scale-[0.98]"
                  >
                    <Merge className="h-3.5 w-3.5" />
                    Approve & Merge Code
                  </button>
                )}

                {selectedPlan.status === 'merged' && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg flex items-start gap-2.5 text-emerald-400">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold">Migration Applied</span>
                      <span className="text-[10px] text-zinc-400 leading-normal">
                        This plan has been merged. Click prototype reset in the sidebar to test again.
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
          <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Code Refactor Proposal</h3>
                <span className="text-[10px] text-zinc-500 font-mono">Comparing: before vs after migration</span>
              </div>
              
              <div className="p-2 bg-indigo-950/15 border border-indigo-900/30 rounded text-[10px] font-mono text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                AI Generated Migration Proposal
              </div>
            </div>

            {/* Split screen diff layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before code panel (Red deletions) */}
              <div className="flex flex-col bg-black border border-zinc-950 rounded-lg overflow-hidden font-mono text-[10px] leading-relaxed">
                <div className="bg-red-950/30 px-3 py-1.5 text-red-300 font-semibold border-b border-zinc-950 flex items-center justify-between uppercase tracking-wider text-[9px]">
                  <span>Vulnerable Code [DELETION]</span>
                  <span className="text-zinc-600 font-normal">RS256 Signature</span>
                </div>
                <pre className="p-3 text-red-200 overflow-x-auto min-h-[220px] bg-red-950/5 border-l-2 border-red-500">
                  <code>{selectedPlan.diffBefore}</code>
                </pre>
              </div>

              {/* After code panel (Green additions) */}
              <div className="flex flex-col bg-black border border-zinc-950 rounded-lg overflow-hidden font-mono text-[10px] leading-relaxed">
                <div className="bg-emerald-950/30 px-3 py-1.5 text-emerald-300 font-semibold border-b border-zinc-950 flex items-center justify-between uppercase tracking-wider text-[9px]">
                  <span>PQC Migrated Code [ADDITION]</span>
                  <span className="text-zinc-650 font-normal">ML-DSA-65 Signature</span>
                </div>
                <pre className="p-3 text-emerald-200 overflow-x-auto min-h-[220px] bg-emerald-950/5 border-l-2 border-emerald-500">
                  <code>{selectedPlan.diffAfter}</code>
                </pre>
              </div>
            </div>

            {/* AI Reasoning Block */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-lg flex gap-3 items-start">
              <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-zinc-300 block">AI Explanation of Migration Implementation</span>
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                  The generated code swaps the legacy `RS256` token signing API call with a secure post-quantum `ML-DSA-65` hybrid module wrapper. Private key buffers are passed directly to `oqs` signatures to avoid key serialization conflicts, preserving token metadata while guaranteeing quantum-resistant signature validations.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 h-[400px] border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-6">
            <GitCompare className="h-8 w-8 text-zinc-700 mb-2.5" />
            <span className="text-xs font-semibold text-zinc-400 font-sans">No Migration Proposal Loaded</span>
            <span className="text-[10px] text-zinc-600 font-sans mt-0.5">Please select an active migration plan from the left panel.</span>
          </div>
        )}
      </div>
    </div>
  );
}
