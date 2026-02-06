import React from 'react';
import {
  Settings,
  Tag,
  Gauge,
  Network,
  Layers,
  ArrowRight,
  HeartPulse,
  FolderOpen,
  Trash2,
  UploadCloud,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { AppHeader, BottomNav } from '../components/Shared';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const CapabilitiesScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <AppHeader 
        title="Capability Discovery" 
        rightAction={
          <button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5" title="Capability settings">
            <Settings size={20} />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 space-y-6 pt-2">
        {/* Server Limits Panel (Horizontal Scroll) */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-1">Server Limits</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-1">
            {/* Version Card */}
            <div className="snap-start min-w-[140px] flex-1 flex flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-border-dark shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Tag size={20} />
                <span className="text-sm font-medium">Version</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">v0.3.1</p>
              <p className="text-[10px] text-gray-500">From local manifest</p>
            </div>
            
            {/* Throughput Card */}
            <div className="snap-start min-w-[140px] flex-1 flex flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-border-dark shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Gauge size={20} />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold tracking-tight">stdio</p>
                <span className="text-xs font-medium mb-1 text-gray-400">MCP</span>
              </div>
              <div className="h-1 w-full bg-black/40 rounded-full mt-auto">
                <div className="h-full w-[35%] bg-primary rounded-full"></div>
              </div>
            </div>

            {/* Clients Card */}
            <div className="snap-start min-w-[140px] flex-1 flex flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-border-dark shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Network size={20} />
                <span className="text-sm font-medium">Clients</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">Local</p>
              <p className="text-[10px] text-gray-500">CLI + MCP</p>
            </div>
          </div>
        </section>

        {/* Degraded Feature Map */}
        <section className="relative group">
           <div className="absolute inset-x-2 -bottom-2 h-16 bg-surface-dark/40 rounded-xl scale-95 z-0"></div>
           <div className="absolute inset-x-4 -bottom-3 h-16 bg-surface-dark/20 rounded-xl scale-90 z-0"></div>
           <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-900/10 p-5">
               <div className="flex gap-4">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-500">
                   <Layers size={20} />
                 </div>
                 <div className="flex flex-col gap-1">
                   <h3 className="text-base font-bold leading-tight text-white">Environment Constraints</h3>
                   <p className="text-sm font-normal leading-normal text-text-secondary">
                      Docker not detected. <br className="hidden sm:block"/>Project queries and sandboxed execution are disabled.
                   </p>
                 </div>
               </div>
             <button className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 bg-amber-900/30 text-amber-400 text-sm font-semibold rounded-lg hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-2" title="View degraded capability map">
               <span>View Map</span>
               <ArrowRight size={16} />
             </button>
           </div>
        </section>

        {/* Active MCP Tools Grid */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-white">Active MCP Tools</h2>
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">6 Tools</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tool Card 1 */}
            <div className="group flex flex-col gap-3 rounded-xl border border-border-dark bg-surface-dark p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-white">
                   <HeartPulse size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(28,227,108,0.6)]"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-white">health</h3>
                 <p className="text-sm text-text-secondary mt-1 line-clamp-2">Basic server health check, including Docker status.</p>
               </div>
               <div className="mt-auto pt-2 border-t border-border-dark/50">
                 <code className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300">no args</code>
               </div>
            </div>

            {/* Tool Card 2 */}
            <div className="group flex flex-col gap-3 rounded-xl border border-border-dark bg-surface-dark p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-white">
                   <FolderOpen size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(28,227,108,0.6)]"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-white">projects_list</h3>
                 <p className="text-sm text-text-secondary mt-1 line-clamp-2">List known project IDs in local storage.</p>
               </div>
               <div className="mt-auto pt-2 border-t border-border-dark/50 flex flex-wrap gap-2">
                 <code className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300">no args</code>
               </div>
            </div>

            {/* Tool Card 3 */}
            <div className="group flex flex-col gap-3 rounded-xl border border-border-dark bg-surface-dark p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-white">
                   <UploadCloud size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(28,227,108,0.6)]"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-white">project_upload</h3>
                 <p className="text-sm text-text-secondary mt-1 line-clamp-2">Upload a file or directory into a project.</p>
               </div>
               <div className="mt-auto pt-2 border-t border-border-dark/50">
                 <code className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300">project_id, path, recursive?</code>
               </div>
            </div>

            {/* Tool Card 4 */}
            <div className="group flex flex-col gap-3 rounded-xl border border-border-dark bg-surface-dark p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-white">
                   <Tag size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(28,227,108,0.6)]"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-white">project_create</h3>
                 <p className="text-sm text-text-secondary mt-1 line-clamp-2">Create a new project.</p>
               </div>
               <div className="mt-auto pt-2 border-t border-border-dark/50">
                 <code className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300">project_id</code>
               </div>
            </div>

            {/* Tool Card 5 */}
            <div className="group flex flex-col gap-3 rounded-xl border border-border-dark bg-surface-dark p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-white">
                   <Trash2 size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(28,227,108,0.6)]"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-white">project_delete</h3>
                 <p className="text-sm text-text-secondary mt-1 line-clamp-2">Delete a project and its documents.</p>
               </div>
               <div className="mt-auto pt-2 border-t border-border-dark/50">
                 <code className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300">project_id</code>
               </div>
            </div>

            {/* Tool Card 6 - Conditional */}
            <div className="group flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-surface-dark/70 p-4 relative overflow-hidden">
               <div className="flex justify-between items-start">
                 <div className="p-2 rounded-lg bg-black/20 text-amber-400">
                   <HelpCircle size={20} />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-amber-400"></div>
               </div>
               <div>
                 <h3 className="text-base font-bold text-amber-100">project_query</h3>
                 <p className="text-sm text-amber-200/70 mt-1 line-clamp-2">
                   Query a project using Shesha RLM (requires Docker + SHESHA_API_KEY).
                 </p>
               </div>
               <div className="mt-auto pt-2 border-t border-amber-500/20">
                 <div className="flex items-center gap-1 text-amber-300 text-xs font-medium bg-amber-900/10 px-2 py-1 rounded w-fit">
                   <AlertTriangle size={14} />
                   <span>Docker Required</span>
                 </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav currentScreen="capabilities" onNavigate={onNavigate} />
    </div>
  );
};
