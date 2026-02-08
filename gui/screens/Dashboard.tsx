import React from 'react';
import {
  CheckCircle2,
  Terminal,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Database,
  Bolt,
  Server
} from 'lucide-react';
import { AppHeader, BottomNav } from '../components/Shared';
import { ScreenName } from '../types';

import { BridgeClient } from '../src/api/client';
import { useBridgeEvents } from '../src/hooks/useBridgeEvents';

interface Props {
  onNavigate: (screen: ScreenName) => void;
  currentScreen: ScreenName;
}

export const DashboardScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
  const [health, setHealth] = React.useState({ status: 'connecting', docker_available: false, version: '...' });
  const events = useBridgeEvents(10);

  const formatEventLabel = (method: string, type: string) => {
    const labels: Record<string, string> = {
      'health': 'MCP_HEALTH_OK',
      'manifest': 'MANIFEST_LOADED',
      'projects': 'PROJECTS_LIST_OK',
      'settings': 'SETTINGS_LOADED'
    };
    if (type === 'err') return `${method.toUpperCase()}_ERROR`;
    return labels[method] || method.toUpperCase();
  };

  React.useEffect(() => {
    const check = async () => {
      const h = await BridgeClient.checkHealth();
      setHealth(h);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <AppHeader
        subtitle={`Librarian MCP • v${health.version}`}
        icon={<Server size={20} className="text-primary" />}
        currentScreen={currentScreen}
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-6 space-y-6">
        {/* Status Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Server Status */}
            <div className={`p-4 rounded-xl bg-surface-dark border ${health.status === 'active' ? 'border-green-500/30' : 'border-red-500/30'} flex flex-col gap-2 shadow-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Server</span>
                <CheckCircle2 size={20} className={health.status === 'active' ? "text-green-500" : "text-red-500"} />
              </div>
              <p className="text-xl font-bold font-display capitalize">{health.status}</p>
            </div>

            {/* MCP Stdio */}
            <div className="p-4 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">MCP Stdio</span>
                <Terminal size={20} className="text-primary" />
              </div>
              <p className="text-xl font-bold font-display">Ready</p>
            </div>

            {/* Docker Engine */}
            <div className={`col-span-1 p-4 rounded-xl bg-surface-dark border ${health.docker_available ? 'border-green-500/30' : 'border-yellow-500/30'} flex flex-col gap-1 shadow-sm relative overflow-hidden group`}>
              {!health.docker_available && <div className="absolute -right-4 -top-4 w-12 h-12 bg-yellow-500/10 rounded-full blur-xl"></div>}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Docker</span>
                {health.docker_available ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-yellow-500" />}
              </div>
              <p className="text-xl font-bold font-display">{health.docker_available ? 'Available' : 'Degraded'}</p>
              {!health.docker_available && <p className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded w-fit mt-1">QUERY_DISABLED</p>}
            </div>

            {/* Manifest Sync */}
            <div className="p-4 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Manifest</span>
                <RefreshCw size={20} className="text-primary" />
              </div>
              <p className="text-xl font-bold font-display">Synced</p>
            </div>
          </div>
        </section>

        {/* System Environment */}
        <section className="space-y-3 cursor-pointer" onClick={() => onNavigate('persistence')} title="Open Persistence Manager">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-tight">System Environment</h3>
            <button className="text-xs text-primary hover:underline" title="Review configuration paths">Edit Config</button>
          </div>
          <div className="rounded-xl bg-surface-dark border border-border-dark overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-4 border-b border-border-dark/50 flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <FolderOpen size={14} />
                Manifest Path
              </p>
              <p className="text-sm font-mono text-gray-200 truncate">./.librarian/manifest.json</p>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <Database size={14} />
                Storage Root
              </p>
              <p className="text-sm font-mono text-gray-200 truncate">$LIBRARIAN_HOME/storage</p>
            </div>
          </div>
        </section>

        {/* Live Readiness Feed */}
        <section className="space-y-3 pb-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
              Live Readiness
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">T-0s</span>
          </div>
          <div className="bg-black rounded-xl border border-border-dark p-4 font-mono text-xs overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-10 pointer-events-none"></div>
            <ul className="space-y-2 relative z-10">
              {events.slice(0, 5).map((event, idx) => (
                <li key={event.id} className={`flex gap-3 ${idx === 0 ? 'text-primary/90' : idx === 1 ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="opacity-50">[{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                  <span>{formatEventLabel(event.method, event.type)}</span>
                </li>
              ))}
              {events.length === 0 && (
                <li className="flex gap-3 text-gray-600">
                  <span className="opacity-50">[--:--:--]</span>
                  <span>NO_EVENTS_YET</span>
                </li>
              )}
            </ul>
          </div>
        </section>

        <div className="h-8"></div>
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 right-5 z-40">
        <button
          onClick={() => onNavigate('agent-center')}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-background-dark shadow-lg shadow-primary/30 active:scale-95 transition-transform hover:bg-white hover:text-black"
          title="Open Agent Center"
        >
          <Bolt size={24} fill="currentColor" />
        </button>
      </div>

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
    </div>
  );
};
