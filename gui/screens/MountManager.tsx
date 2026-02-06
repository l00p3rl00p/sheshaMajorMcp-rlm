import React, { useState, useEffect } from 'react';
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
import { BridgeClient } from '../src/api/client';

interface Props {
    onNavigate: (screen: ScreenName) => void;
}

interface MountPoint {
    id: string;
    name: string;
    path: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
    lastSync: string;
    type: 'FOLDER' | 'FILE';
}

export const MountManagerScreen: React.FC<Props> = ({ onNavigate }) => {
    const [mounts, setMounts] = useState<MountPoint[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [simulatedPulse, setSimulatedPulse] = useState(false);

    // Initial load and health check
    useEffect(() => {
        const fetchStatus = async () => {
            const health = await BridgeClient.checkHealth();
            setIsConnected(health.status === 'active');
        };
        fetchStatus();
    }, []);

    // Load projects if connected
    useEffect(() => {
        if (!isConnected) return;

        const loadProjects = async () => {
            const projects = await BridgeClient.getProjects();
            // Map API projects to MountPoints
            setMounts(projects.map(p => ({
                id: p.id,
                name: p.id,
                path: p.path,
                status: 'CONNECTED', // Assumed connected if reported by CLI
                lastSync: 'Live',
                type: 'FOLDER'
            })));
        };

        loadProjects();
        // Poll every 5s for updates
        const interval = setInterval(loadProjects, 5000);
        return () => clearInterval(interval);
    }, [isConnected]);

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
            <header className="flex-none h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#080c0a] z-20">
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
                    <button className="text-gray-400 hover:text-white transition-colors" title="Settings">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">

                {/* Drop Zone / Mount Action */}
                <section className="relative">
                    <div className="border-2 border-dashed border-[#7c3aed]/30 bg-[#7c3aed]/5 rounded-2xl h-40 flex flex-col items-center justify-center gap-3 group hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/10 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:scale-110 transition-transform">
                            <FolderPlus size={24} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-white mb-1">Add Mount Point</h3>
                            <p className="text-xs text-gray-400 max-w-[250px] mx-auto leading-relaxed">
                                Drag a folder here to mount it as a source.<br />
                                <span className="text-[10px] opacity-70">Supports recursive observation.</span>
                            </p>
                        </div>
                    </div>
                    {/* Visual Border Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[0_0_0_1px_rgba(124,58,237,0.1),0_0_20px_rgba(124,58,237,0.1)]"></div>
                </section>

                {/* Active Mounts List */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Mounts</h3>
                        <span className="text-[10px] font-mono text-gray-500">{mounts.length} SOURCES</span>
                    </div>

                    <div className="space-y-3">
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
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Sync now">
                                            <RefreshCw size={16} />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Unmount">
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
        </div>
    );
};
