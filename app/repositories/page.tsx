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
          user: 'admin@pqshield.io',
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
          user: 'admin@pqshield.io',
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

  return (
    <div className="p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Repositories Manager
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Connect and configure software source repositories for static cryptographic scanning.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-red-400">
              Repository API Error
            </p>

            <p className="text-xs text-red-300/80 mt-1">
              {error}
            </p>
          </div>

          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />

            <span className="text-xs text-zinc-500">
              Loading repositories...
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && repos.length === 0 && (
        <div className="border border-dashed border-zinc-800 rounded-xl py-16 flex flex-col items-center justify-center">
          <FolderGit2 className="h-10 w-10 text-zinc-700" />

          <h3 className="text-sm font-semibold text-zinc-300 mt-4">
            No repositories connected
          </h3>

          <p className="text-xs text-zinc-600 mt-1">
            Connect a GitHub repository to get started.
          </p>

          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="mt-5 h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Connect Repository
          </button>
        </div>
      )}

      {/* Grid of Repositories */}
      {!isLoading && repos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {repos.map((repo) => {
            const isScanning =
              scanningId === repo.id ||
              repo.status === 'scanning';

            return (
              <div
                key={repo.id}
                className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between group hover:border-zinc-800/80 transition-all duration-300 relative overflow-hidden"
              >
                {/* Scan Loader */}
                {isScanning && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-zinc-200">
                        Analyzing Repository
                      </span>

                      <span className="text-[10px] text-zinc-500 font-mono mt-1">
                        Cloning, AST parsing, mapping...
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  {/* Repository Title */}
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
                    ) : repo.status === 'scanning' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/20 border border-indigo-900/30 text-indigo-400">
                        Scanning
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/20 border border-red-900/30 text-red-400">
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Git URL */}
                  <div className="mt-4 text-xs font-mono text-zinc-400 bg-zinc-950/50 px-3 py-2 rounded border border-zinc-900/80 flex items-center justify-between">
                    <span className="truncate max-w-[280px]">
                      {repo.url}
                    </span>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                      aria-label={`Open ${repo.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600 hover:text-indigo-400 transition-colors" />
                    </a>
                  </div>

                  {/* Language Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {repo.language.length > 0 ? (
                      repo.language.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded font-semibold border border-zinc-700/30"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] bg-zinc-800/50 text-zinc-500 rounded font-semibold border border-zinc-700/20">
                        Language not available
                      </span>
                    )}
                  </div>

                  {/* Crypto Stats */}
                  {repo.status === 'scanned' && (
                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-4 text-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          Risk Score
                        </span>

                        <span
                          className={`text-base font-bold ${
                            repo.riskScore > 80
                              ? 'text-red-400'
                              : repo.riskScore > 50
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                          }`}
                        >
                          {repo.riskScore}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 border-x border-zinc-900">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          Inventory
                        </span>

                        <span className="text-base font-bold text-zinc-200">
                          {repo.cryptoAssetsCount}{' '}
                          <span className="text-[10px] text-zinc-500 font-normal">
                            assets
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          Critical Risks
                        </span>

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
                    onClick={() =>
                      handleDeleteRepo(
                        repo.id,
                        repo.name
                      )
                    }
                    disabled={
                      scanningId === repo.id
                    }
                    className="h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Disconnect
                  </button>

                  <div className="flex items-center gap-2">
                    {repo.status === 'scanned' && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Last scan:{' '}
                        {repo.lastScanTime?.split(
                          ' '
                        )[0]}
                      </span>
                    )}

                    <button
                      onClick={() =>
                        handleScanRepo(
                          repo.id
                        )
                      }
                      disabled={
                        scanningId !== null
                      }
                      className="h-8 px-3.5 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50 hover:border-zinc-600 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="h-5 w-5 text-indigo-400" />

                <h3 className="font-bold text-zinc-100">
                  Connect Repository
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
                className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveRepo}
              className="p-6 space-y-4"
            >
              {/* Repository Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Repository Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. user-auth-api"
                  value={repoName}
                  onChange={(e) =>
                    setRepoName(
                      e.target.value
                    )
                  }
                  disabled={isSaving}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Git URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  GitHub HTTPS/SSH URL
                </label>

                <input
                  type="text"
                  required
                  placeholder="https://github.com/org/repo-name"
                  value={repoUrl}
                  onChange={(e) =>
                    setRepoUrl(
                      e.target.value
                    )
                  }
                  disabled={isSaving}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />

                <p className="text-[9px] text-zinc-600">
                  Example: https://github.com/user/repository
                </p>
              </div>

              {/* Branch + Language */}
              <div className="grid grid-cols-2 gap-4">
                {/* Branch */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Default Branch
                  </label>

                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) =>
                      setBranch(
                        e.target.value
                      )
                    }
                    disabled={isSaving}
                    className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Primary Language
                  </label>

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(
                        e.target.value
                      )
                    }
                    disabled={isSaving}
                    className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  >
                    <option value="Python">
                      Python
                    </option>

                    <option value="TypeScript">
                      TypeScript
                    </option>

                    <option value="JavaScript">
                      JavaScript
                    </option>

                    <option value="Go">
                      Go
                    </option>

                    <option value="Java">
                      Java
                    </option>
                  </select>
                </div>
              </div>

              {/* Private Repository */}
              <div className="flex items-center justify-between rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 py-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Private Repository
                  </p>

                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    Mark this repository as private.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) =>
                    setIsPrivate(
                      e.target.checked
                    )
                  }
                  disabled={isSaving}
                  className="h-4 w-4 accent-indigo-600"
                />
              </div>

              {/* Exclusions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Path Exclusions
                </label>

                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) =>
                    setExclusions(
                      e.target.value
                    )
                  }
                  disabled={isSaving}
                  className="h-9 bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />

                <p className="text-[9px] text-zinc-600">
                  Scan exclusions are currently UI-only and will be connected to the scanner later.
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSaving) {
                      setIsModalOpen(false);
                      resetForm();
                    }
                  }}
                  disabled={isSaving}
                  className="h-9 px-4 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {isSaving
                    ? 'Connecting...'
                    : 'Connect & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}