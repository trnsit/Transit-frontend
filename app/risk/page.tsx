'use client';

import React, { useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  Node, 
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Network,
  Info,
  Key,
  FolderGit2,
  FileCode,
  ShieldCheck,
  Zap,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

// Custom Node styles
const nodeClassName = "px-4 py-3 rounded-xl border font-mono text-xs flex flex-col gap-1 shadow-lg select-none min-w-[160px] backdrop-blur-md";
const primitiveNodeStyle = "bg-[#180d14]/90 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
const libNodeStyle = "bg-[#0d1424]/90 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
const fileNodeStyle = "bg-[#0c121e]/90 border-slate-700/80 text-slate-200";
const serviceNodeStyle = "bg-[#0b1726]/90 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
const endpointNodeStyle = "bg-[#1a120a]/90 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]";

const initialNodes: Node[] = [
  // Primitives
  {
    id: 'n-rsa',
    type: 'input',
    data: { 
      label: 'RSA-2048', 
      type: 'Cryptographic Primitive', 
      risk: 'Critical', 
      score: 94,
      details: 'Asymmetric signature primitive vulnerable to Shor\'s algorithm quantum polynomial factorisation.'
    },
    position: { x: 50, y: 150 },
    className: `${nodeClassName} ${primitiveNodeStyle}`
  },
  // Libraries
  {
    id: 'n-jsonwebtoken',
    data: { 
      label: 'jsonwebtoken', 
      type: 'Crypto Library', 
      risk: 'Medium', 
      score: 55,
      details: 'npm dependency used to sign, verify, and parse token payloads across internal services.'
    },
    position: { x: 260, y: 150 },
    className: `${nodeClassName} ${libNodeStyle}`
  },
  // Code Files
  {
    id: 'n-jwt-ts',
    data: { 
      label: 'src/auth/jwt.ts', 
      type: 'Source Code File', 
      risk: 'High', 
      score: 75,
      details: 'Contains token generation functions that import RS256 signing.'
    },
    position: { x: 470, y: 150 },
    className: `${nodeClassName} ${fileNodeStyle}`
  },
  // Application Components
  {
    id: 'n-auth-service',
    data: { 
      label: 'AuthenticationService', 
      type: 'Application Component', 
      risk: 'Critical', 
      score: 90,
      details: 'Core business service managing user log-in and zero-trust session validation.'
    },
    position: { x: 680, y: 150 },
    className: `${nodeClassName} ${serviceNodeStyle}`
  },
  // Dependents / Endpoints
  {
    id: 'n-checkout',
    type: 'output',
    data: { 
      label: '/checkout (API)', 
      type: 'Exposed Endpoint', 
      risk: 'High', 
      score: 82,
      details: 'Public checkout endpoint verifying user auth tokens in payment flows.'
    },
    position: { x: 920, y: 50 },
    className: `${nodeClassName} ${endpointNodeStyle}`
  },
  {
    id: 'n-dashboard',
    type: 'output',
    data: { 
      label: '/dashboard (UI)', 
      type: 'Public Web Route', 
      risk: 'Medium', 
      score: 64,
      details: 'Front-end user dashboard rendering session-scoped user information.'
    },
    position: { x: 920, y: 150 },
    className: `${nodeClassName} ${endpointNodeStyle}`
  },
  {
    id: 'n-admin-console',
    type: 'output',
    data: { 
      label: '/admin (Console)', 
      type: 'Admin Panel API', 
      risk: 'Critical', 
      score: 88,
      details: 'Administrative dashboard using JWT authentication with privilege access.'
    },
    position: { x: 920, y: 250 },
    className: `${nodeClassName} ${endpointNodeStyle}`
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'n-rsa', target: 'n-jsonwebtoken', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' }, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'e2', source: 'n-jsonwebtoken', target: 'n-jwt-ts', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }, style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e3', source: 'n-jwt-ts', target: 'n-auth-service', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e4', source: 'n-auth-service', target: 'n-checkout', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e5', source: 'n-auth-service', target: 'n-dashboard', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e6', source: 'n-auth-service', target: 'n-admin-console', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' }, style: { stroke: '#f43f5e', strokeWidth: 2 } }
];

export default function RiskPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setSelectedNode(initialNodes[0].data);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 bg-[#07090e] min-h-screen text-slate-100 flex flex-col items-center justify-center">
        <Network className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-cyan-400 mt-3">INITIALIZING BLAST-RADIUS DEPENDENCY GRAPH...</span>
      </div>
    );
  }

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cryptographic Blast Radius & Impact Graph
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Interactive Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trace how vulnerable cryptographic primitives propagate through libraries, files, and high-impact services.
          </p>
        </div>
      </div>

      {/* Grid of Risk Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#0d121f]/90 border border-slate-800 hover:border-rose-500/30 rounded-2xl flex items-start gap-3.5 shadow-xl transition-all">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Quantum Exposure
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              Critical Exposure Tier
            </span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Internet-facing endpoints signed with asymmetric RSA/ECDSA cryptography vulnerable to store-now-decrypt-later.
            </p>
          </div>
        </div>

        <div className="p-5 bg-[#0d121f]/90 border border-slate-800 hover:border-indigo-500/30 rounded-2xl flex items-start gap-3.5 shadow-xl transition-all">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Transitive Risk Factor
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              High Cascading Reach
            </span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Core authentication primitives cascade into 3 exposed services, affecting token issuance and gateway security.
            </p>
          </div>
        </div>

        <div className="p-5 bg-[#0d121f]/90 border border-slate-800 hover:border-cyan-500/30 rounded-2xl flex items-start gap-3.5 shadow-xl transition-all">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Migration Feasibility
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              Automated Patch Eligible
            </span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Eligible for Transit ML-DSA-65 hybrid cryptographic wrapper injection with zero breaking API changes.
            </p>
          </div>
        </div>
      </div>

      {/* React Flow Container & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* React Flow Graph Canvas */}
        <div className="lg:col-span-8 h-[460px] bg-[#05070c] border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl group">
          <div className="absolute top-3 left-4 z-10 bg-[#0d121f]/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2 backdrop-blur-md shadow-md">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Click any node to inspect blast-radius telemetry</span>
          </div>

          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="font-mono text-xs"
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-[#0d121f] border border-slate-800 text-slate-300 fill-slate-300 rounded-xl overflow-hidden shadow-xl [&>button]:border-slate-800 [&>button]:bg-[#0d121f] [&>button]:hover:bg-slate-800 [&>button]:text-slate-200" />
          </ReactFlow>
        </div>

        {/* Selected Node Analysis Side Panel */}
        <div className="lg:col-span-4 bg-[#0d121f]/95 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[460px] overflow-y-auto shadow-2xl backdrop-blur-xl">
          {selectedNode ? (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 tracking-wider">
                    {selectedNode.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedNode.risk === 'Critical' 
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' 
                      : selectedNode.risk === 'High'
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                  }`}>
                    {selectedNode.risk} Threat
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {selectedNode.label === 'RSA-2048' ? (
                      <Key className="h-4 w-4 text-rose-400 shrink-0" />
                    ) : selectedNode.label.endsWith('.ts') ? (
                      <FileCode className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : selectedNode.label.startsWith('/') ? (
                      <Network className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <FolderGit2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    )}
                    <span>{selectedNode.label}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      Blast Severity: {selectedNode.score} / 100
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Description</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {selectedNode.details}
                    </p>
                  </div>

                  {selectedNode.label === 'RSA-2048' && (
                    <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-semibold text-rose-300 flex items-center gap-1.5 uppercase">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        Transitive Propagation Path
                      </span>
                      <span className="text-[11px] text-slate-300 leading-relaxed block font-mono">
                        RSA-2048 ➜ jsonwebtoken ➜ src/auth/jwt.ts ➜ AuthenticationService ➜ /checkout & /admin APIs
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedNode.risk === 'Critical' || selectedNode.risk === 'High' ? (
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-start gap-2 bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl text-xs text-cyan-300">
                    <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Target NIST Standard: ML-DSA-65 post-quantum hybrid signature.</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
              <Network className="h-8 w-8 text-slate-700 mb-2.5" />
              <span className="text-xs font-semibold text-slate-400">Node Analyzer Idle</span>
              <span className="text-[10px] text-slate-600 mt-1">Click any node in the topology canvas to inspect telemetry.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
