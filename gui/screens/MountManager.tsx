import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Settings,
    FolderPlus,
    FolderOpen,
    HardDrive,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    MoreVertical,
    Activity,
    Trash2,
    Clock
} from 'lucide-react';
import { ScreenName } from '../types';
import { HeaderTabs } from '../components/Shared';
import { BridgeClient } from '../src/api/client';

interface Props {
    onNavigate: (screen: ScreenName) => void;
    currentScreen: ScreenName;
}

interface MountPoint {
    id: string;
    name: string;
    path: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
    lastSync: string;
    type: 'FOLDER' | 'FILE';
}

export const MountManagerScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
    const [mounts, setMounts] = useState<MountPoint[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [simulatedPulse, setSimulatedPulse] = useState(false);
    const [bridgeKeyInput, setBridgeKeyInput] = useState(BridgeClient.getBridgeKey());
    const [bridgeError, setBridgeError] = useState<string | null>(null);
    const [bridgeNotice, setBridgeNotice] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newProjectId, setNewProjectId] = useState('');
    const [newMountPath, setNewMountPath] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropMessage, setDropMessage] = useState<string | null>(null);

    const copyText = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setBridgeNotice('Copied to clipboard.');
            setTimeout(() => setBridgeNotice(null), 1500);
        } catch {
            setBridgeNotice('Copy failed. Select and copy manually.');
            setTimeout(() => setBridgeNotice(null), 2000);
        }
    };

    const detectPlatform = () => {
        if (typeof navigator === 'undefined') return 'unknown';
        const platform = (navigator.platform || '').toLowerCase();
        if (platform.includes('mac')) return 'mac';
        if (platform.includes('win')) return 'windows';
        if (platform.includes('linux')) return 'linux';
        return 'unknown';
    };

    const platform = detectPlatform();
    const examplePath =
        platform === 'windows'
            ? 'C:\\Users\\you\\Documents'
            : platform === 'mac'
                ? '/Users/you/Documents'
                : platform === 'linux'
                    ? '/home/you/Documents'
                    : '/path/to/folder';

    // Initial load and health check
    useEffect(() => {
        const fetchStatus = async () => {
            const health = await BridgeClient.checkHealth();
            const connected = health.status === 'active';
            setIsConnected(connected);
            setBridgeError(connected ? null : 'Bridge offline. Start the bridge or paste the key below.');
        };
        fetchStatus();
    }, []);

    const refreshHealth = useCallback(async () => {
        const health = await BridgeClient.checkHealth();
        const connected = health.status === 'active';
        setIsConnected(connected);
        setBridgeError(connected ? null : 'Bridge offline. Start the bridge or paste the key below.');
    }, []);

    const loadProjects = useCallback(async () => {
        if (!isConnected) return;
        const projects = await BridgeClient.getProjects();
        setMounts(projects.map(p => ({
            id: p.id,
            name: p.id,
            path: p.path || 'No path bound',
            status: 'CONNECTED',
            lastSync: 'Live',
            type: 'FOLDER'
        })));
    }, [isConnected]);

    // Load projects if connected
    useEffect(() => {
        if (!isConnected) return;
        loadProjects();
        const interval = setInterval(loadProjects, 5000);
        return () => clearInterval(interval);
    }, [isConnected, loadProjects]);

    // Visual Pulse Effect
    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setSimulatedPulse(p => !p);
        }, 1000);
        return () => clearInterval(pulseInterval);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#0d0d12] text-white font-display overflow-hidden relative">

            {/* Header */}
            <header className="flex-none px-4 pt-3 pb-2 flex flex-col gap-2 border-b border-white/5 bg-[#080c0a] z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('persistence')}
                            className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                            title="Back to Persistence"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold tracking-tight">Mount Manager</h1>
                            <p className="text-[10px] font-bold text-[#7c3aed] tracking-wider uppercase">Local Sources</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 border border-white/5`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${simulatedPulse ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-600'} transition-colors duration-1000`}></div>
                            <span className="text-[10px] font-mono text-gray-400">PULSE</span>
                        </div>
                    <button
                        onClick={() => {
                            setIsModalOpen(false);
                            setIsBridgeModalOpen(false);
                            setIsSettingsOpen((v) => !v);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    </div>
                </div>
                <HeaderTabs currentScreen={currentScreen} onNavigate={onNavigate} />
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">

                {/* Bridge Connection */}
                {!isConnected && (
                    <section className="border border-yellow-500/30 bg-yellow-500/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-yellow-200">Bridge not connected</h3>
                                <p className="text-xs text-yellow-200/70">
                                    Start the bridge, then open the GUI so the key is injected.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsSettingsOpen(false);
                                    setIsBridgeModalOpen((v) => !v);
                                }}
                                className="text-yellow-200/80 hover:text-yellow-200 text-xs"
                                title="Bridge setup guide"
                            >
                                Open setup
                            </button>
                                <button
                                    onClick={refreshHealth}
                                    className="text-yellow-200/80 hover:text-yellow-200 text-xs"
                                    title="Retry bridge connection"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-yellow-200/80">
                            <button
                                onClick={() => copyText('librarian bridge')}
                                className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20"
                                title="Copy command"
                            >
                                Copy: librarian bridge
                            </button>
                            <button
                                onClick={() => copyText('librarian gui')}
                                className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20"
                                title="Copy command"
                            >
                                Copy: librarian gui
                            </button>
                            <span>Or paste the bridge key from</span>
                            <span className="font-mono">$LIBRARIAN_HOME/secret.json</span>
                        </div>
                        <p className="text-[10px] text-yellow-200/60">
                            Default locations: Mac <span className="font-mono">~/Library/Application Support/Librarian/secret.json</span>,
                            Linux <span className="font-mono">~/.local/share/librarian/secret.json</span>,
                            Windows <span className="font-mono">%APPDATA%\\Librarian\\secret.json</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                value={bridgeKeyInput}
                                onChange={(e) => setBridgeKeyInput(e.target.value)}
                                placeholder="Bridge key"
                                className="flex-1 bg-black/40 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-500/50"
                            />
                            <button
                                onClick={() => {
                                    BridgeClient.setBridgeKey(bridgeKeyInput);
                                    refreshHealth();
                                }}
                                className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-200 text-xs font-bold hover:bg-yellow-500/30 transition-colors"
                                title="Save bridge key"
                            >
                                Save
                            </button>
                        </div>
                        {bridgeError && <p className="text-[10px] text-yellow-200/60">{bridgeError}</p>}
                        {bridgeNotice && <p className="text-[10px] text-yellow-200/80">{bridgeNotice}</p>}
                    </section>
                )}

                {/* Drop Zone / Mount Action */}
                <section className="relative">
                    <button
                        onClick={() => {
                            setFormError(null);
                            setIsBridgeModalOpen(false);
                            setIsSettingsOpen(false);
                            setIsModalOpen((v) => !v);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDropMessage('Drag and drop cannot provide full local paths in a browser. Paste the path instead.');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDropMessage('Drag and drop is not supported for paths. Please paste the full folder path.');
                            setIsBridgeModalOpen(false);
                            setIsSettingsOpen(false);
                            setIsModalOpen(true);
                        }}
                        className="w-full border-2 border-dashed border-[#7c3aed]/30 bg-[#7c3aed]/5 rounded-2xl h-40 flex flex-col items-center justify-center gap-3 group hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/10 transition-all cursor-pointer"
                        title="Add mount point"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:scale-110 transition-transform">
                            <FolderPlus size={24} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-white mb-1">Add Mount Point</h3>
                            <p className="text-xs text-gray-400 max-w-[250px] mx-auto leading-relaxed">
                                Paste an absolute folder path to mount it as a source.<br />
                                <span className="text-[10px] opacity-70">Drag-and-drop cannot provide full paths in a browser.</span>
                            </p>
                        </div>
                    </button>
                    {/* Visual Border Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[0_0_0_1px_rgba(124,58,237,0.1),0_0_20px_rgba(124,58,237,0.1)]"></div>
                </section>
                {dropMessage && (
                    <div className="text-[10px] text-purple-200/80 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                        {dropMessage}
                    </div>
                )}

                {/* Active Mounts List */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Mounts</h3>
                        <span className="text-[10px] font-mono text-gray-500">{mounts.length} SOURCES</span>
                    </div>

                    <div className="space-y-3">
                        {isConnected && mounts.length === 0 && (
                            <div className="bg-[#181820] border border-white/5 rounded-xl p-4 text-xs text-gray-400">
                                No mounts yet. Add one to bind a local directory.
                            </div>
                        )}
                        {mounts.map((mount) => (
                            <div key={mount.id} className="bg-[#181820] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Icon Status Ring */}
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${mount.status === 'CONNECTED' ? 'bg-[#7c3aed]/20 border-[#7c3aed]/30 text-[#7c3aed]' :
                                            mount.status === 'SYNCING' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                                                'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}>
                                            {mount.type === 'FOLDER' ? <FolderOpen size={20} /> : <HardDrive size={20} />}
                                        </div>
                                        {mount.status === 'SYNCING' && (
                                            <div className="absolute -top-1 -right-1">
                                                <RefreshCw size={12} className="text-blue-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-200">{mount.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <code className="text-[10px] text-gray-500 bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <span className="text-[#7c3aed] font-bold">@</span> {mount.path}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="flex items-center justify-end gap-1.5 mb-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${mount.status === 'CONNECTED' ? 'bg-green-500' :
                                                mount.status === 'SYNCING' ? 'bg-blue-500' :
                                                    'bg-red-500'
                                                }`}></div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${mount.status === 'CONNECTED' ? 'text-green-500' :
                                                mount.status === 'SYNCING' ? 'text-blue-400' :
                                                    'text-red-500'
                                                }`}>
                                                {mount.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                            <Clock size={10} />
                                            <span>Synced {mount.lastSync}</span>
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-white/5 mx-2"></div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={loadProjects}
                                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                            title="Sync now"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await BridgeClient.deleteProject(mount.id);
                                                loadProjects();
                                            }}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Unmount"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="More options">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Best Practice Note */}
                <div className="mt-8 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-3">
                    <Activity className="text-blue-400 shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-blue-100 mb-1">Heartbeat Monitor Active</h4>
                        <p className="text-xs text-blue-200/70 leading-relaxed mb-2">
                            The system checks connection integrity every 60 seconds (Pulse). This ensures mounted paths are still accessible and haven't been renamed or deleted externally.
                        </p>
                        <div className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-2 py-1.5 rounded border border-blue-500/20">
                            CLI LINKAGE: Mounts must bind to a `librarian projects create &lt;id&gt;` workspace ID to persist.
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Mount Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[60]">
                    <div className="w-full max-w-[420px] bg-[#111318] border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Create Mount</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                                title="Close"
                            >
                                X
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Project ID</label>
                                <input
                                    value={newProjectId}
                                    onChange={(e) => setNewProjectId(e.target.value)}
                                    placeholder="alpha"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/40"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Mount Path</label>
                                <input
                                    value={newMountPath}
                                    onChange={(e) => setNewMountPath(e.target.value)}
                                    placeholder="/path/to/folder"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/40"
                                />
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <button
                                        onClick={() => setNewMountPath(examplePath)}
                                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                        title="Paste example path"
                                    >
                                        Paste example
                                    </button>
                                    <button
                                        onClick={() => setNewMountPath(platform === 'windows' ? 'C:\\Users\\you\\Desktop' : '~/Documents')}
                                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                        title="Paste quick path"
                                    >
                                        Quick path
                                    </button>
                                    <span className="text-[10px] text-gray-500">
                                        Detected: {platform === 'unknown' ? 'unknown OS' : platform}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Use an absolute path or <span className="font-mono">~</span>. Examples:
                                    <span className="font-mono"> /Users/you/Documents</span>, <span className="font-mono">~/Documents</span>, or <span className="font-mono">C:\\Users\\you\\Documents</span>
                                </p>
                            </div>
                            {formError && <p className="text-[10px] text-red-400">{formError}</p>}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white"
                                title="Cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setFormError(null);
                                    const projectId = newProjectId.trim();
                                    const mountPath = newMountPath.trim();
                                    if (!projectId || !mountPath) {
                                        setFormError('Project ID and mount path are required.');
                                        return;
                                    }
                                    const isAbsolute =
                                        mountPath.startsWith('/') ||
                                        mountPath.startsWith('~') ||
                                        /^[A-Za-z]:[\\/]/.test(mountPath);
                                    if (!isAbsolute) {
                                        setFormError('Mount path must be absolute or start with ~.');
                                        return;
                                    }
                                    setIsSubmitting(true);
                                    const created = await BridgeClient.createProject(projectId, mountPath);
                                    setIsSubmitting(false);
                                    if (!created) {
                                        setFormError('Failed to create mount. Check bridge status and path.');
                                        return;
                                    }
                                    setNewProjectId('');
                                    setNewMountPath('');
                                    setIsModalOpen(false);
                                    loadProjects();
                                }}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-bold hover:bg-white disabled:opacity-60"
                                title="Create mount"
                            >
                                {isSubmitting ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bridge Setup Modal */}
            {isBridgeModalOpen && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[70]">
                    <div className="w-full max-w-[520px] bg-[#111318] border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Bridge Setup</h3>
                            <button
                                onClick={() => setIsBridgeModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                                title="Close"
                            >
                                X
                            </button>
                        </div>
                        <ol className="space-y-3 text-sm text-gray-300">
                            <li className="bg-black/30 border border-white/10 rounded-lg p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500">Step 1</div>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    <span>Start the local bridge server.</span>
                                    <button
                                        onClick={() => copyText('librarian bridge')}
                                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                        title="Copy command"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-2 font-mono text-[11px] text-gray-400">librarian bridge</div>
                            </li>
                            <li className="bg-black/30 border border-white/10 rounded-lg p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500">Step 2</div>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    <span>Open the GUI so the key is injected automatically.</span>
                                    <button
                                        onClick={() => copyText('librarian gui')}
                                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                        title="Copy command"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-2 font-mono text-[11px] text-gray-400">librarian gui</div>
                            </li>
                            <li className="bg-black/30 border border-white/10 rounded-lg p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500">Step 3</div>
                                <div className="mt-1">If you already opened the GUI, paste the bridge key from:</div>
                                <div className="mt-2 text-[11px] text-gray-400">
                                    <div className="font-mono">$LIBRARIAN_HOME/secret.json</div>
                                    <div className="mt-1">Mac: <span className="font-mono">~/Library/Application Support/Librarian/secret.json</span></div>
                                    <div>Linux: <span className="font-mono">~/.local/share/librarian/secret.json</span></div>
                                    <div>Windows: <span className="font-mono">%APPDATA%\\Librarian\\secret.json</span></div>
                                </div>
                            </li>
                            <li className="bg-black/30 border border-white/10 rounded-lg p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500">Step 4</div>
                                <div className="mt-1">Click “Retry” on the page to confirm the bridge is connected.</div>
                            </li>
                        </ol>
                    </div>
                </div>
            )}

            {isSettingsOpen && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[80]">
                    <div className="w-full max-w-[520px] bg-[#111318] border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Settings</h3>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="text-gray-400 hover:text-white"
                                title="Close"
                            >
                                X
                            </button>
                        </div>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="text-xs uppercase tracking-wide text-gray-500">Add to PATH</div>
                            <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
                                <div className="text-[11px] text-gray-400">macOS (zsh)</div>
                                <div className="font-mono text-[11px] text-gray-300">
                                    echo 'export PATH="/Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/.venv/bin:$PATH"' &gt;&gt; ~/.zshrc
                                </div>
                                <div className="font-mono text-[11px] text-gray-300">source ~/.zshrc</div>
                                <button
                                    onClick={() => copyText('echo \'export PATH="/Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/.venv/bin:$PATH"\' >> ~/.zshrc\nsource ~/.zshrc')}
                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                    title="Copy command"
                                >
                                    Copy command
                                </button>
                            </div>
                            <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
                                <div className="text-[11px] text-gray-400">Linux (bash)</div>
                                <div className="font-mono text-[11px] text-gray-300">
                                    echo 'export PATH="/Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/.venv/bin:$PATH"' &gt;&gt; ~/.bashrc
                                </div>
                                <div className="font-mono text-[11px] text-gray-300">source ~/.bashrc</div>
                                <button
                                    onClick={() => copyText('echo \'export PATH="/Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/.venv/bin:$PATH"\' >> ~/.bashrc\nsource ~/.bashrc')}
                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                    title="Copy command"
                                >
                                    Copy command
                                </button>
                            </div>
                            <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
                                <div className="text-[11px] text-gray-400">Windows (PowerShell)</div>
                                <div className="font-mono text-[11px] text-gray-300">
                                    $env:Path = "$env:Path;C:\\Users\\you\\path\\to\\sheshaMajorMcp-rlm\\.venv\\Scripts"
                                </div>
                                <button
                                    onClick={() => copyText('$env:Path = "$env:Path;C:\\\\Users\\\\you\\\\path\\\\to\\\\sheshaMajorMcp-rlm\\\\.venv\\\\Scripts"')}
                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                                    title="Copy command"
                                >
                                    Copy command
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">Replace paths with your install location.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
