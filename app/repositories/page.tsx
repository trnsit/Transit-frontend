'use client';

import React, { useEffect, useState } from 'react';
import {
  PQStore,
  Repository,
  CryptoAsset,
  ScanJob,
} from '@/lib/mockData';

import {
  GitFork,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  FolderGit2,
  Play,
  X,
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import {
  getRepositories,
  createRepository,
  deleteRepository,
} from '@/lib/repositories';

/*
 * Backend repository response.
 *
 * This matches the FastAPI /repositories response:
 *
 * {
 *   id,
 *   user_id,
 *   provider,
 *   external_repo_id,
 *   name,
 *   full_name,
 *   url,
 *   default_branch,
 *   is_private,
 *   created_at,
 *   updated_at
 * }
 */
interface BackendRepository {
  id: string;
  user_id: string;
  provider: string;
  external_repo_id: string;
  name: string;
  full_name: string;
  url: string;
  default_branch: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

/*
 * Convert backend repository data into the structure
 * currently expected by the existing frontend UI.
 *
 * The backend currently does not return:
 * - language
 * - status
 * - riskScore
 * - cryptoAssetsCount
 * - scan information
 *
 * Those will be connected later when the scanning backend
 * is implemented.
 */
function mapBackendRepository(
  repo: BackendRepository
): Repository {
  return {
    id: repo.id,
    name: repo.name,
    url: repo.url,
    branch: repo.default_branch,

    status: 'unscanned',
    lastScanTime: null,

    language: [],

    riskScore: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    cryptoAssetsCount: 0,
  };
}

/*
 * Extract "owner/repository" from a GitHub URL.
 *
 * Example:
 * https://github.com/MohammedSajad04/transit
 *
 * becomes:
 * MohammedSajad04/transit
 */
function getGitHubFullName(url: string): string {
  try {
    const parsedUrl = new URL(url);

    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname === 'github.com' || hostname === 'www.github.com') {
      const parts = parsedUrl.pathname
        .split('/')
        .filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1].replace(/\.git$/, '')}`;
      }
    }
  } catch {
    // Ignore invalid URL here.
    // Form validation will handle the error.
  }

  return '';
}

/*
 * Generate an external repository ID.
 *
 * At the moment the manual-connect form does not have
 * a GitHub API repository ID.
 *
 * We therefore use the normalized GitHub full_name.
 *
 * Later, when GitHub OAuth/repository discovery is connected,
 * this should be replaced by GitHub's actual repository ID.
 */
function getExternalRepositoryId(
  fullName: string,
  url: string
): string {
  if (fullName) {
    return fullName;
  }

  return url.trim();
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scanningId, setScanningId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Form states
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [language, setLanguage] = useState('Python');
  const [exclusions, setExclusions] = useState(
    '**/tests/**, **/node_modules/**'
  );

  /*
   * Backend requires is_private.
   *
   * The old form didn't have this field, so we add
   * a checkbox to the form.
   */
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scanned' | 'unscanned'>('all');

  /*
   * Load repositories from FastAPI/PostgreSQL.
   *
   * OLD:
   * PQStore.getRepositories()
   *
   * NEW:
   * GET /repositories
   */
  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getRepositories();

      const backendRepositories =
        data as BackendRepository[];

      const frontendRepositories =
        backendRepositories.map(mapBackendRepository);

      setRepos(frontendRepositories);
    } catch (err) {
      console.error(
        'Failed to load repositories:',
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load repositories.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Load repositories when page opens.
   */
  useEffect(() => {
    loadRepositories();
  }, []);

  /*
   * Reset the connection form.
   */
  const resetForm = () => {
    setRepoName('');
    setRepoUrl('');
    setBranch('main');
    setLanguage('Python');
    setExclusions(
      '**/tests/**, **/node_modules/**'
    );
    setIsPrivate(false);
  };

  /*
   * Connect repository.
   *
   * OLD FLOW:
   *
   * Form
   *   ↓
   * Fake Repository object
   *   ↓
   * PQStore
   *   ↓
   * localStorage
   *
   * NEW FLOW:
   *
   * Form
   *   ↓
   * POST /repositories
   *   ↓
   * FastAPI
   *   ↓
   * PostgreSQL
   *   ↓
   * Repository response
   *   ↓
   * UI
   */
  const handleSaveRepo = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!repoName.trim() || !repoUrl.trim()) {
      alert('Please fill in repository name and URL.');
      return;
    }

    /*
     * Validate URL.
     */
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(repoUrl.trim());
    } catch {
      alert('Please enter a valid repository URL.');
      return;
    }

    /*
     * Currently this form is specifically for GitHub.
     */
    const hostname =
      parsedUrl.hostname.toLowerCase();

    if (
      hostname !== 'github.com' &&
      hostname !== 'www.github.com'
    ) {
      alert(
        'Please enter a GitHub repository URL.'
      );
      return;
    }

    /*
     * Extract owner/repository.
     *
     * Example:
     * github.com/user/project
     *
     * → user/project
     */
    const fullName =
      getGitHubFullName(repoUrl);

    if (!fullName) {
      alert(
        'Please enter a valid GitHub repository URL such as https://github.com/user/repository'
      );
      return;
    }

    /*
     * GitHub is the provider for this form.
     */
    const provider = 'github';

    /*
     * The current backend schema requires an external_repo_id.
     *
     * Since this manual form doesn't yet retrieve GitHub's
     * real repository ID, use full_name as a temporary stable ID.
     *
     * This will be replaced with GitHub's actual ID when
     * /repositories/github/remote is integrated.
     */
    const externalRepoId =
      getExternalRepositoryId(
        fullName,
        repoUrl
      );

    try {
      setIsSaving(true);
      setError(null);

      /*
       * Exact payload expected by:
       *
       * POST /repositories
       */
      const created =
        await createRepository({
          provider,
          external_repo_id: externalRepoId,
          name: repoName.trim(),
          full_name: fullName,
          url: repoUrl.trim(),
          default_branch: branch.trim() || 'main',
          is_private: isPrivate,
        });

      /*
       * Convert backend response to frontend format.
       */
      const backendRepository =
        created as BackendRepository;

      const newRepository =
        mapBackendRepository(
          backendRepository
        );

      /*
       * The backend currently doesn't store language.
       *
       * Keep the selected language in the current UI state
       * so the newly-created card immediately displays it.
       *
       * It will not survive a page refresh until the backend
       * repository schema supports language.
       */
      newRepository.language = [language];

      /*
       * Add the new repository to the current UI.
       */
      setRepos((currentRepos) => [
        newRepository,
        ...currentRepos,
      ]);

      /*
       * Keep audit logging in localStorage for now.
       *
       * Later this should move to the backend audit API.
       */
      try {
        const audits = PQStore.getAudits();

        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Repository Connected',
          timestamp: new Date()
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19),
          user: 'operator@transit.io',
          details: `Connected repository ${repoName.trim()} (${branch.trim() || 'main'})`,
        };

        PQStore.saveAudits([
          newAudit,
          ...audits,
        ]);
      } catch (auditError) {
        console.warn(
          'Repository connected, but local audit log could not be updated:',
          auditError
        );
      }

      /*
       * Close modal and reset form.
       */
      setIsModalOpen(false);
      resetForm();

      alert(
        `Repository "${newRepository.name}" connected successfully.`
      );
    } catch (err) {
      console.error(
        'Failed to create repository:',
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to connect repository.';

      setError(message);

      alert(
        `Failed to connect repository:\n\n${message}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Delete repository from backend.
   *
   * NEW FLOW:
   *
   * Disconnect
   *   ↓
   * DELETE /repositories/{id}
   *   ↓
   * PostgreSQL
   *   ↓
   * Remove from UI
   *
   * Scan/assets are still local mock data for now.
   */
  const handleDeleteRepo = async (
    id: string,
    name: string
  ) => {
    const confirmed = confirm(
      `Are you sure you want to disconnect repository "${name}"? This deletes its scan history and findings.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      /*
       * Delete from backend/PostgreSQL.
       */
      await deleteRepository(id);

      /*
       * Remove from frontend state.
       */
      setRepos((currentRepos) =>
        currentRepos.filter(
          (repo) => repo.id !== id
        )
      );

      /*
       * Delete associated mock assets.
       *
       * This is temporary until backend scan/inventory
       * APIs are connected.
       */
      try {
        const assets =
          PQStore.getAssets().filter(
            (asset) => asset.repoId !== id
          );

        PQStore.saveAssets(assets);
      } catch (assetError) {
        console.warn(
          'Repository deleted, but local assets could not be cleaned:',
          assetError
        );
      }

      /*
       * Delete associated mock scans.
       */
      try {
        const scans =
          PQStore.getScans().filter(
            (scan) => scan.repoId !== id
          );

        PQStore.saveScans(scans);
      } catch (scanError) {
        console.warn(
          'Repository deleted, but local scans could not be cleaned:',
          scanError
        );
      }

      /*
       * Local audit entry for now.
       */
      try {
        const audits = PQStore.getAudits();

        const newAudit = {
          id: `aud-${Date.now()}`,
          action: 'Repository Disconnected',
          timestamp: new Date()
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19),
          user: 'operator@transit.io',
          details: `Disconnected repository: ${name}`,
        };

        PQStore.saveAudits([
          newAudit,
          ...audits,
        ]);
      } catch (auditError) {
        console.warn(
          'Repository deleted, but local audit log could not be updated:',
          auditError
        );
      }

      alert(
        `Repository "${name}" disconnected successfully.`
      );
    } catch (err) {
      console.error(
        'Failed to delete repository:',
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to disconnect repository.';

      setError(message);

      alert(
        `Failed to disconnect repository:\n\n${message}`
      );
    }
  };

  /*
   * Scan repository.
   *
   * IMPORTANT:
   *
   * This is STILL MOCK functionality.
   *
   * We don't have a backend scan endpoint yet.
   *
   * Once the scanner API is available, this function
   * will be replaced with:
   *
   * POST /repositories/{id}/scan
   *
   * or whatever endpoint the backend provides.
   */
  const handleScanRepo = (id: string) => {
    setScanningId(id);

    /*
     * Update UI to scanning.
     */
    setRepos((currentRepos) =>
      currentRepos.map((repo) =>
        repo.id === id
          ? {
              ...repo,
              status: 'scanning',
            }
          : repo
      )
    );

    /*
     * Simulated scan.
     *
     * Temporary only.
     */
    setTimeout(() => {
      setRepos((currentRepos) => {
        const repo =
          currentRepos.find(
            (item) => item.id === id
          );

        if (!repo) {
          setScanningId(null);
          return currentRepos;
        }

        const randomRisk =
          Math.floor(Math.random() * 50) + 40;

        const critical =
          randomRisk > 80 ? 1 : 0;

        const high =
          randomRisk > 60 ? 2 : 1;

        const medium = 2;
        const low = 1;

        const totalAssets =
          critical +
          high +
          medium +
          low;

        const scanTimestamp =
          new Date()
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19);

        const finalizedRepo: Repository = {
          ...repo,

          status: 'scanned',

          lastScanTime:
            scanTimestamp,

          riskScore:
            randomRisk,

          criticalCount:
            critical,

          highCount:
            high,

          mediumCount:
            medium,

          lowCount:
            low,

          cryptoAssetsCount:
            totalAssets,
        };

        /*
         * Create mock scan job.
         */
        try {
          const scanJobs =
            PQStore.getScans();

          const newScan: ScanJob = {
            id: `scan-${Date.now()}`,
            repoId: repo.id,
            repoName: repo.name,

            commitSha:
              Math.random()
                .toString(16)
                .substring(2, 10) +
              '00000000000000000000000000000000',

            branch: repo.branch,

            status: 'completed',

            durationMs: 7800,

            timestamp:
              scanTimestamp,

            findingsCount:
              totalAssets,

            logs: [
              `[INFO] Cloning commit for branch ${repo.branch}`,
              `[INFO] Scanning workspace directory for languages...`,
              `[INFO] Target: ${
                repo.language.length > 0
                  ? repo.language.join(', ')
                  : 'Automatic'
              } AST parser activated`,
              `[INFO] Discovery: Found ${critical} critical, ${high} high vulnerability`,
              `[SUCCESS] Repository ${repo.name} successfully cataloged.`,
            ],
          };

          PQStore.saveScans([
            newScan,
            ...scanJobs,
          ]);
        } catch (scanError) {
          console.warn(
            'Could not save mock scan:',
            scanError
          );
        }

        /*
         * Create mock crypto assets.
         */
        try {
          const currentAssets =
            PQStore.getAssets();

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
              filePath:
                'src/ssh/keys.py',
              lineNumbers: [45, 46],
              library: 'cryptography',
              component:
                'SftpConnector',
              dependents: [
                'RemoteSyncWorker',
              ],
              exposure:
                'Internet-facing',
              confidence: 'High',
              riskLevel: 'Critical',
              riskScore: 88,
              recommendation:
                'Replace RSA keys with post-quantum ML-DSA signature scheme or Ed25519.',
              codeSnippet:
                `from cryptography.hazmat.primitives.asymmetric import rsa\n\ndef load_ssh_key():\n    return rsa.generate_private_key(public_exponent=65537, key_size=2048)`,
              explanation:
                "Asymmetric RSA-2048 keys offer minimal quantum security. Shor's algorithm can compute the private key from public factors. Transition to hybrid PQC schemes.",
            });
          }

          if (high > 0) {
            newAssets.push({
              id: `asset-h-${Date.now()}`,
              repoId: id,
              repoName: repo.name,
              algorithm: 'SHA-1',
              variant: 'Standard',
              purpose:
                'File Integrity Hashing',
              operation: 'Hashing',
              filePath:
                'src/utils/hash.py',
              lineNumbers: [14],
              library: 'hashlib',
              component:
                'FileUploader',
              dependents: [
                'AdminLogs',
              ],
              exposure:
                'Internal-facing',
              confidence: 'High',
              riskLevel: 'High',
              riskScore: 68,
              recommendation:
                'Replace SHA-1 with SHA-256 or SHA-384. Symmetric hashes like SHA-256 are considered quantum resistant.',
              codeSnippet:
                `import hashlib\n\ndef hash_file(filepath):\n    return hashlib.sha1(open(filepath, "rb").read()).hexdigest()`,
              explanation:
                "SHA-1 is highly susceptible to collision attacks, making it unsafe for cryptographic validation. Grover's algorithm further lowers its security.",
            });
          }

          /*
           * Medium-risk asset.
           */
          newAssets.push({
            id: `asset-m-${Date.now()}`,
            repoId: id,
            repoName: repo.name,
            algorithm: 'AES-128-CBC',
            variant: 'CBC',
            purpose:
              'Backup File Encryption',
            operation: 'Encryption',
            filePath:
              'src/backup/vault.py',
            lineNumbers: [32, 33],
            library: 'cryptography',
            component:
              'LocalVault',
            dependents: [
              'BackupCronJob',
            ],
            exposure:
              'Internal-only',
            confidence: 'High',
            riskLevel: 'Medium',
            riskScore: 54,
            recommendation:
              'Upgrade backup encryption to AES-256-GCM mode to ensure AEAD and quantum resistance.',
            codeSnippet:
              `from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes\n\ndef create_cipher(key, iv):\n    return Cipher(algorithms.AES(key), modes.CBC(iv))`,
            explanation:
              "AES-128 keys are computationally vulnerable in a post-quantum scenario where Grover's search reduces key space security to 64 bits.",
          });

          PQStore.saveAssets([
            ...newAssets,
            ...currentAssets,
          ]);
        } catch (assetError) {
          console.warn(
            'Could not save mock crypto assets:',
            assetError
          );
        }

        /*
         * Local audit entry.
         */
        try {
          const audits =
            PQStore.getAudits();

          const newAudit = {
            id: `aud-${Date.now()}`,
            action: 'Scan Completed',
            timestamp:
              scanTimestamp,
            user: 'System Worker',
            details:
              `Scan complete for repository: ${repo.name}. Discovered ${totalAssets} assets.`,
          };

          PQStore.saveAudits([
            newAudit,
            ...audits,
          ]);
        } catch (auditError) {
          console.warn(
            'Could not save mock audit:',
            auditError
          );
        }

        setScanningId(null);

        return currentRepos.map(
          (currentRepo) =>
            currentRepo.id === id
              ? finalizedRepo
              : currentRepo
        );
      });
    }, 3000);
  };

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.url.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'scanned') return matchesSearch && repo.status === 'scanned';
    if (statusFilter === 'unscanned') return matchesSearch && repo.status === 'unscanned';
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Repository Fleet Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {repos.length} Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect and configure software source repositories for static cryptographic scanning and post-quantum migration.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="h-9 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-300">
                Repository Operation Alert
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter repositories by name or URL..."
            className="w-full h-9 pl-9 pr-3 bg-[#0d121f] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0d121f] border border-slate-800 rounded-xl self-stretch sm:self-auto">
          {(['all', 'scanned', 'unscanned'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'all' ? 'All Repositories' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 bg-[#0d121f]/50 border border-slate-800/80 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-cyan-400">
              Synchronizing repository fleet...
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRepos.length === 0 && (
        <div className="border border-dashed border-slate-800 bg-[#0d121f]/40 rounded-2xl py-16 flex flex-col items-center justify-center text-center p-6">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            No matching repositories found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {repos.length === 0
              ? 'Connect a GitHub or GitLab repository to initialize continuous post-quantum cryptographic discovery.'
              : 'No repositories matched your search or status filter.'}
          </p>
          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="mt-5 h-9 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Connect Repository
          </button>
        </div>
      )}

      {/* Grid of Repositories */}
      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRepos.map((repo) => {
            const isScanning =
              scanningId === repo.id || repo.status === 'scanning';

            return (
              <div
                key={repo.id}
                className="bg-[#0d121f]/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden shadow-xl backdrop-blur-xl"
              >
                {/* Active Scan Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-[#07090e]/90 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin drop-shadow-[0_0_8px_#22d3ee]" />
                      <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500/20" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-white tracking-wider">
                        SCANNING REPOSITORY
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        AST parsing, Tree-sitter extraction, policy checks...
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  {/* Title & Stance Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors shadow-sm">
                        <FolderGit2 className="h-5 w-5" />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-base">
                          {repo.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <GitFork className="h-3 w-3 text-cyan-400" />
                            {repo.branch}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            GitHub
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Chip */}
                    {repo.status === 'scanned' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Scanned
                      </span>
                    ) : repo.status === 'unscanned' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                        Unscanned
                      </span>
                    ) : repo.status === 'scanning' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Analyzing
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Git URL */}
                  <div className="mt-4 text-xs font-mono text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="truncate max-w-[280px]">{repo.url}</span>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-slate-500 hover:text-cyan-400 transition-colors ml-2"
                      aria-label={`Open ${repo.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Language Badges */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {repo.language.length > 0 ? (
                      repo.language.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-300 rounded-md border border-cyan-500/20 font-medium"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/60 text-slate-500 rounded-md border border-slate-800">
                        Polyglot
                      </span>
                    )}
                  </div>

                  {/* Crypto Stats Grid */}
                  {repo.status === 'scanned' && (
                    <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                          Risk Score
                        </span>
                        <span
                          className={`text-base font-extrabold font-mono ${
                            repo.riskScore > 80
                              ? 'text-rose-400'
                              : repo.riskScore > 50
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {repo.riskScore}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 border-x border-slate-800">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                          CBOM Assets
                        </span>
                        <span className="text-base font-extrabold font-mono text-slate-200">
                          {repo.cryptoAssetsCount}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                          Critical
                        </span>
                        <span className="text-base font-extrabold font-mono text-rose-400">
                          {repo.criticalCount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4 gap-2">
                  <button
                    onClick={() => handleDeleteRepo(repo.id, repo.name)}
                    disabled={scanningId === repo.id}
                    className="h-8 px-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Disconnect
                  </button>

                  <div className="flex items-center gap-2">
                    {repo.status === 'scanned' && repo.lastScanTime && (
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        Scanned {repo.lastScanTime.split(' ')[0]}
                      </span>
                    )}

                    <button
                      onClick={() => handleScanRepo(repo.id)}
                      disabled={scanningId !== null}
                      className="h-8 px-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Scan Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d121f] border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  Connect Git Repository
                </h3>
              </div>

              <button
                onClick={() => {
                  if (!isSaving) {
                    setIsModalOpen(false);
                    resetForm();
                  }
                }}
                disabled={isSaving}
                className="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRepo} className="p-6 space-y-4">
              {/* Repository Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Repository Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. auth-service-api"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  disabled={isSaving}
                  className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50"
                />
              </div>

              {/* Git URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  GitHub / Git Clone URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/org/repo-name"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isSaving}
                  className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-500">
                  Provide standard HTTPS or SSH clone URL
                </p>
              </div>

              {/* Branch + Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Default Branch
                  </label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={isSaving}
                    className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isSaving}
                    className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                  >
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Go">Go</option>
                    <option value="Java">Java</option>
                  </select>
                </div>
              </div>

              {/* Private Repository Toggle */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800 px-3.5 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Private Repository
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Requires git token authentication for access.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={isSaving}
                  className="h-4 w-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Exclusions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Path Exclusions
                </label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  disabled={isSaving}
                  className="h-10 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSaving) {
                      setIsModalOpen(false);
                      resetForm();
                    }
                  }}
                  disabled={isSaving}
                  className="h-9 px-4 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {isSaving ? 'Registering...' : 'Connect & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}