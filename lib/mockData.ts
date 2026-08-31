// PQShield central mock data store & types

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  status: 'scanned' | 'scanning' | 'unscanned' | 'failed';
  lastScanTime: string | null;
  language: string[];
  riskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  cryptoAssetsCount: number;
}

export interface ScanJob {
  id: string;
  repoId: string;
  repoName: string;
  commitSha: string;
  branch: string;
  status: 'completed' | 'running' | 'failed';
  durationMs: number;
  timestamp: string;
  findingsCount: number;
  logs: string[];
}

export interface CryptoAsset {
  id: string;
  repoId: string;
  repoName: string;
  algorithm: string;
  variant: string;
  purpose: string;
  operation: string;
  filePath: string;
  lineNumbers: number[];
  library: string;
  component: string;
  dependents: string[];
  exposure: 'Internet-facing' | 'Internal-facing' | 'Internal-only';
  confidence: 'High' | 'Medium' | 'Low';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
  recommendation: string;
  codeSnippet: string;
  explanation: string;
}

export interface MigrationPlan {
  id: string;
  name: string;
  repoId: string;
  repoName: string;
  assetId: string;
  targetAlgorithm: string;
  status: 'draft' | 'validating' | 'approved' | 'merged';
  diffBefore: string;
  diffAfter: string;
  validationSteps: {
    syntax: 'pending' | 'running' | 'success' | 'failed';
    build: 'pending' | 'running' | 'success' | 'failed';
    tests: 'pending' | 'running' | 'success' | 'failed';
    policy: 'pending' | 'running' | 'success' | 'failed';
    rescan: 'pending' | 'running' | 'success' | 'failed';
  };
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'Block' | 'Warn' | 'Info';
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

// Initial Mock Data
const INITIAL_REPOSITORIES: Repository[] = [];
const INITIAL_SCANS: ScanJob[] = [];
const INITIAL_ASSETS: CryptoAsset[] = [];

const INITIAL_POLICIES: PolicyRule[] = [
  {
    id: 'pol-1',
    name: 'Ban MD5/SHA-1 Hashing',
    description: 'Ensure MD5 and SHA-1 hashes are blocked for all operations except legacy validation contexts.',
    enabled: true,
    severity: 'Block'
  },
  {
    id: 'pol-2',
    name: 'Ban Asymmetric Keys under 3072 bits',
    description: 'Require RSA key size to be at least 3072 bits and ECC curves to be NIST P-256 or better.',
    enabled: true,
    severity: 'Block'
  },
  {
    id: 'pol-3',
    name: 'Mandate Post-Quantum Transition Plan',
    description: 'Generate warnings for all classical asymmetric cryptographic usage (RSA, ECDSA, DH, ECDH) exposed to internet endpoints.',
    enabled: true,
    severity: 'Warn'
  },
  {
    id: 'pol-4',
    name: 'Require Authenticated Symmetric Encryption',
    description: 'Symmetric encryption must use AEAD modes (GCM, ChaCha20-Poly1305) and forbid CBC/ECB mode.',
    enabled: true,
    severity: 'Block'
  },
  {
    id: 'pol-5',
    name: 'Audit-Only for Internal Test Suites',
    description: 'Allow weaker algorithms inside test/mock folders, changing findings severity to Info.',
    enabled: false,
    severity: 'Info'
  }
];

const INITIAL_MIGRATIONS: MigrationPlan[] = [];
const INITIAL_AUDITS: AuditLog[] = [];

// Helper to initialize and retrieve from LocalStorage
const STORAGE_KEYS = {
  REPOSITORIES: 'pq_repositories',
  SCANS: 'pq_scans',
  ASSETS: 'pq_assets',
  POLICIES: 'pq_policies',
  MIGRATIONS: 'pq_migrations',
  AUDITS: 'pq_audits',
};

function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

// Exportable functions to interact with store
export const PQStore = {
  getRepositories: () => getStoredData<Repository[]>(STORAGE_KEYS.REPOSITORIES, INITIAL_REPOSITORIES),
  saveRepositories: (repos: Repository[]) => setStoredData(STORAGE_KEYS.REPOSITORIES, repos),
  
  getScans: () => getStoredData<ScanJob[]>(STORAGE_KEYS.SCANS, INITIAL_SCANS),
  saveScans: (scans: ScanJob[]) => setStoredData(STORAGE_KEYS.SCANS, scans),
  
  getAssets: () => getStoredData<CryptoAsset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS),
  saveAssets: (assets: CryptoAsset[]) => setStoredData(STORAGE_KEYS.ASSETS, assets),
  
  getPolicies: () => getStoredData<PolicyRule[]>(STORAGE_KEYS.POLICIES, INITIAL_POLICIES),
  savePolicies: (policies: PolicyRule[]) => setStoredData(STORAGE_KEYS.POLICIES, policies),
  
  getMigrations: () => getStoredData<MigrationPlan[]>(STORAGE_KEYS.MIGRATIONS, INITIAL_MIGRATIONS),
  saveMigrations: (migrations: MigrationPlan[]) => setStoredData(STORAGE_KEYS.MIGRATIONS, migrations),
  
  getAudits: () => getStoredData<AuditLog[]>(STORAGE_KEYS.AUDITS, INITIAL_AUDITS),
  saveAudits: (audits: AuditLog[]) => setStoredData(STORAGE_KEYS.AUDITS, audits),

  resetAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.REPOSITORIES);
    localStorage.removeItem(STORAGE_KEYS.SCANS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.POLICIES);
    localStorage.removeItem(STORAGE_KEYS.MIGRATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDITS);
  }
};
