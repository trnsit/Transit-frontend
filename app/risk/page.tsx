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
  Zap
} from 'lucide-react';

// Custom Node styles
const nodeClassName = "px-4 py-3 rounded-xl border font-sans text-xs flex flex-col gap-1.5 shadow-lg select-none min-w-[150px]";
const primitiveNodeStyle = "bg-red-950/20 border-red-900/60 text-red-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
const libNodeStyle = "bg-indigo-950/20 border-indigo-900/50 text-indigo-300";
const fileNodeStyle = "bg-zinc-900 border-zinc-800 text-zinc-300";
const serviceNodeStyle = "bg-zinc-900 border-indigo-500/40 text-zinc-100 shadow-[0_0_10px_rgba(99,102,241,0.08)]";
const endpointNodeStyle = "bg-orange-950/20 border-orange-900/40 text-orange-300";

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
      details: 'Asymmetric signature primitive vulnerable to Shor\'s algorithm decryption.'
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
      details: 'npm dependency used to sign, verify, and parse token payloads.'
    },
    position: { x: 250, y: 150 },
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
      details: 'Contains token generation functions import RS256 signing.'
    },
    position: { x: 450, y: 150 },
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
      details: 'Core business service managing user log-in validation.'
    },
    position: { x: 650, y: 150 },
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
      details: 'Public checkout endpoint verifying user auth tokens.'
    },
    position: { x: 880, y: 50 },
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
      details: 'Front-end user dashboard rendering user information.'
    },
    position: { x: 880, y: 150 },
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
      details: 'Administrative dashboard using JWT authentication.'
    },
    position: { x: 880, y: 250 },
    className: `${nodeClassName} ${endpointNodeStyle}`
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'n-rsa', target: 'n-jsonwebtoken', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e2', source: 'n-jsonwebtoken', target: 'n-jwt-ts', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' } },
  { id: 'e3', source: 'n-jwt-ts', target: 'n-auth-service', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e4e4e7' } },
  { id: 'e4', source: 'n-auth-service', target: 'n-checkout', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } },
  { id: 'e5', source: 'n-auth-service', target: 'n-dashboard', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } },
  { id: 'e6', source: 'n-auth-service', target: 'n-admin-console', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } }
];

export default function RiskPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Pre-select the RSA node by default to show initial context
    setSelectedNode(initialNodes[0].data);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col items-center justify-center">
        <Network className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono text-zinc-500 mt-2">Loading dependency analyzer...</span>
      </div>
    );
  }

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Risk & Impact Graph</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Trace how low-level cryptographic vulnerabilities propagate up to affect high-level services and exposed endpoints.
        </p>
      </div>

      {/* Grid of Risk Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Quantum Exposure</span>
            <span className="text-lg font-bold text-zinc-100">Critical Threat Tier</span>
            <p className="text-[10px] text-zinc-500 leading-normal mt-1">
              Active Internet-facing endpoints signed with asymmetric RSA/ECDSA cryptography.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Transitive Risk Factor</span>
            <span className="text-lg font-bold text-zinc-100">High Cascade Risk</span>
            <p className="text-[10px] text-zinc-500 leading-normal mt-1">
              Auth components have multiple cascading library and database dependents.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-start gap-3">
          <Zap className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Migration Complexity</span>
            <span className="text-lg font-bold text-zinc-100">High Complexity</span>
            <p className="text-[10px] text-zinc-500 leading-normal mt-1">
              Upgrading token signatures requires modifying middleware and coordinating client keys.
            </p>
          </div>
        </div>
      </div>

      {/* React Flow Container & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* React Flow Graph */}
        <div className="lg:col-span-8 h-[420px] bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden shadow-inner group">
          <div className="absolute top-3 left-4 z-10 bg-zinc-900/95 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 backdrop-blur-sm">
            <Info className="h-3 w-3 text-indigo-400" />
            Click on any node to analyze transitive impact
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
            <Background color="#27272a" gap={16} size={1} />
            <Controls className="bg-zinc-900 border border-zinc-800 text-zinc-400 fill-zinc-400 rounded-lg overflow-hidden [&>button]:border-zinc-800 [&>button]:bg-zinc-900 [&>button]:hover:bg-zinc-800 [&>button]:text-zinc-300" />
          </ReactFlow>
        </div>

        {/* Selected Node Analysis Side Panel */}
        <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between h-[420px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-[9px] font-mono uppercase font-semibold text-zinc-500 tracking-wider">
                    {selectedNode.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    selectedNode.risk === 'Critical' 
                      ? 'bg-red-950/20 border border-red-900 text-red-400 animate-pulse' 
                      : selectedNode.risk === 'High'
                      ? 'bg-amber-950/20 border border-amber-900 text-amber-400'
                      : 'bg-blue-950/20 border border-blue-900 text-blue-400'
                  }`}>
                    {selectedNode.risk} Risk
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                    {selectedNode.label === 'RSA-2048' ? (
                      <Key className="h-4 w-4 text-red-400 shrink-0" />
                    ) : selectedNode.label.endsWith('.ts') ? (
                      <FileCode className="h-4 w-4 text-zinc-400 shrink-0" />
                    ) : selectedNode.label.startsWith('/') ? (
                      <Network className="h-4 w-4 text-orange-400 shrink-0" />
                    ) : (
                      <FolderGit2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    )}
                    {selectedNode.label}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-indigo-400 block mt-1">
                    Component Score: {selectedNode.score} / 100
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Description</span>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
                      {selectedNode.details}
                    </p>
                  </div>

                  {selectedNode.label === 'RSA-2048' && (
                    <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-lg">
                      <span className="text-[10px] font-semibold text-red-200 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        Transitive Impact Path
                      </span>
                      <span className="text-[9px] text-zinc-400 leading-normal block mt-1 font-mono">
                        RSA-2048 ➜ jsonwebtoken ➜ src/auth/jwt.ts ➜ AuthenticationService ➜ /checkout & /admin API
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedNode.risk === 'Critical' || selectedNode.risk === 'High' ? (
                <div className="pt-4 border-t border-zinc-900">
                  <div className="flex items-start gap-2 bg-indigo-950/10 border border-indigo-900/20 p-2.5 rounded-lg text-[10px] text-zinc-400 mb-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    Recommended replacement: ML-DSA-65 (hybrid signature).
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-lg">
              <Network className="h-7 w-7 text-zinc-700 mb-2.5" />
              <span className="text-xs font-semibold text-zinc-400">Node Analyzer Idle</span>
              <span className="text-[10px] text-zinc-600 mt-0.5">Click any node in the dependency graph to analyze.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
