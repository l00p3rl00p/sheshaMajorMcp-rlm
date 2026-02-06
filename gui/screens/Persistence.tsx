import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Database, 
  ChevronLeft, 
  FileJson, 
  HardDrive, 
  Terminal, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  FolderArchive,
  UploadCloud
} from 'lucide-react';
import { ScreenName } from '../types';
import { ScanlineEffect } from '../components/Shared';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const PersistenceScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'manifest' | 'storage' | 'logs'>('manifest');

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md border-b border-border-dark">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight flex-1 text-center">Persistence Manager</h2>
          <button 
            onClick={() => onNavigate('data-ingestion')}
            className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
            title="Ingest Data"
          >
            <UploadCloud size={24} />
          </button>
        </div>
        
        {/* Status */}
        <div className="px-4 pb-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-dark border border-border-dark px-3 py-1 rounded-full">
            <CheckCircle2 size={16} className="text-primary animate-pulse" />
            <p className="text-primary text-xs font-bold uppercase tracking-wider">System Healthy</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-dark border border-border-dark px-3 py-1 rounded-full">
            <Database size={16} className="text-text-secondary" />
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Mounted</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 justify-between gap-4">
          {(['manifest', 'storage', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 flex-1 transition-all capitalize ${
                activeTab === tab ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-white'
              }`}
              title={`Show ${tab} view`}
            >
              <p className="text-sm font-bold">{tab}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'manifest' && (
          <div className="pt-6 animate-fade-in">
             <div className="flex items-center justify-between px-4 pb-3">
               <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                 <FileJson className="text-primary" />
                 Manifest Inspector
               </h3>
               <span className="text-xs font-mono text-text-secondary bg-surface-dark px-2 py-1 rounded border border-border-dark">.librarian/manifest.json</span>
             </div>
             
             <div className="mx-4 mb-6 rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
               <div className="flex items-center justify-between bg-[#13241b] px-4 py-2 border-b border-border-dark">
                 <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Read-Only</span>
                 <div className="flex gap-1.5">
                   <div className="size-2 rounded-full bg-red-500/20"></div>
                   <div className="size-2 rounded-full bg-yellow-500/20"></div>
                   <div className="size-2 rounded-full bg-green-500"></div>
                 </div>
               </div>
               <div className="p-4 grid grid-cols-[35%_1fr] gap-x-4 gap-y-0 font-mono text-xs sm:text-sm">
                  {/* JSON Content */}
                  {[
                    ['package.name', '"shesha"', 'text-primary'],
                    ['package.version', '"0.3.1.dev35"', 'text-yellow-400'],
                    ['paths.storage', '"$LIBRARIAN_HOME/storage"', 'text-blue-400'],
                    ['paths.logs', '"$LIBRARIAN_HOME/logs"', 'text-orange-300'],
                    ['infra.docker_available', 'false', 'text-amber-300']
                  ].map(([key, val, colorClass], i) => (
                    <div key={key} className={`col-span-2 grid grid-cols-subgrid ${i < 4 ? 'border-b border-border-dark/30' : ''} py-3 items-center group hover:bg-white/5 px-2 -mx-2 rounded`}>
                      <p className="text-text-secondary">{key}</p>
                      <p className={`${colorClass} truncate`}>{val}</p>
                    </div>
                  ))}
               </div>
               
               {/* Collapsible details mock */}
               <div className="flex flex-col border-t border-border-dark bg-[#0d1811]">
                  <div className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-border-dark/50">
                    <div className="flex items-center gap-2">
                       <ChevronRight size={16} className="text-text-secondary rotate-90" />
                       <span className="text-white font-mono text-sm font-medium">commands</span>
                       <span className="text-[10px] text-text-secondary bg-border-dark/30 px-1.5 rounded ml-2">Object</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-1 pl-10 overflow-x-auto">
                    <pre className="text-text-secondary text-xs font-mono leading-relaxed whitespace-pre">
{`{
  "cli": [`}<span className="text-primary">"librarian"</span>{`],
  "mcp": [`}<span className="text-primary">"librarian"</span>{`, `}<span className="text-primary">"mcp"</span>{`]
}`}
                    </pre>
                  </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="pt-6 animate-fade-in">
             <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                  <HardDrive className="text-primary" />
                  Storage Locations
                </h3>
                <button className="text-primary hover:text-white transition-colors" title="Refresh storage metrics">
                  <RefreshCw size={20} />
                </button>
             </div>
             
             <div className="flex flex-col gap-3 px-4 mb-6">
                {/* Storage Root */}
                <div className="p-4 rounded-xl bg-surface-dark border border-border-dark shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <div className="bg-border-dark/30 p-2 rounded-lg text-primary">
                            <Database size={24} />
                         </div>
                         <div>
                            <h4 className="text-white text-sm font-bold">Storage Root</h4>
                            <p className="text-text-secondary text-xs font-mono mt-0.5">$LIBRARIAN_HOME/storage</p>
                          </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Active</span>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-text-secondary font-medium">
                         <span>Projects</span>
                         <span>3</span>
                      </div>
                      <div className="w-full bg-[#0d1811] rounded-full h-2 overflow-hidden">
                         <div className="bg-primary h-full rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-secondary/70">
                         <span>projects/ + raw/ + docs/</span>
                         <span>Resolved at runtime</span>
                      </div>
                   </div>
                </div>

                {/* Logs Root */}
                <div className="p-4 rounded-xl bg-surface-dark border border-border-dark shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <div className="bg-border-dark/30 p-2 rounded-lg text-text-secondary">
                            <FolderArchive size={24} />
                         </div>
                         <div>
                            <h4 className="text-white text-sm font-bold">Logs Root</h4>
                            <p className="text-text-secondary text-xs font-mono mt-0.5">$LIBRARIAN_HOME/logs</p>
                          </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-border-dark/20 text-text-secondary text-[10px] font-bold uppercase tracking-wider">Mounted</span>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-text-secondary font-medium">
                         <span>Log Files</span>
                         <span>Active</span>
                      </div>
                      <div className="w-full bg-[#0d1811] rounded-full h-2 overflow-hidden">
                         <div className="bg-yellow-500 h-full rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-secondary/70">
                         <span>stdout / stderr traces</span>
                         <span>Rotates on install</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="pt-6 animate-fade-in">
             <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                  <Terminal className="text-primary" />
                  Operation Logs
                </h3>
                <div className="flex gap-2">
                   <span className="flex size-2 rounded-full bg-red-500 animate-pulse mt-2"></span>
                   <span className="text-xs text-text-secondary uppercase font-bold tracking-wider pt-1">Live</span>
                </div>
             </div>
             
             <div className="mx-4 mb-4 rounded-xl bg-[#0a0f0c] border border-border-dark p-4 font-mono text-xs overflow-hidden shadow-inner relative min-h-[200px]">
                <div className="space-y-3 relative z-10">
                   {[
                     { time: '10:41:05', lvl: 'INFO', msg: 'Initializing Librarian state...', color: 'text-blue-400' },
                     { time: '10:41:06', lvl: 'INFO', msg: 'Manifest loaded v0.3.1', color: 'text-blue-400' },
                     { time: '10:41:55', lvl: 'WARN', msg: 'Docker not available; project_query disabled.', color: 'text-yellow-400' },
                     { time: '10:42:01', lvl: 'SYS', msg: 'Self-test complete. Storage + logs ready.', color: 'text-primary' },
                     { time: '10:42:15', lvl: 'ERR', msg: 'Project upload failed (invalid file type).', color: 'text-red-500', bg: 'bg-red-500/10 -mx-4 px-4 py-1 border-l-2 border-red-500' },
                     { time: '10:42:18', lvl: 'INFO', msg: 'Waiting for next upload request... _', color: 'text-blue-400', animate: true }
                   ].map((log, i) => (
                     <div key={i} className={`flex gap-3 text-white/90 ${log.bg || ''} ${log.animate ? 'animate-pulse' : ''}`}>
                        <span className="text-text-secondary shrink-0 opacity-50">{log.time}</span>
                        <span className={`${log.color} font-bold shrink-0 w-10`}>[{log.lvl}]</span>
                        <span className="break-words">{log.msg}</span>
                     </div>
                   ))}
                </div>
                <ScanlineEffect />
             </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-30 pt-8">
        <button className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-base py-3.5 px-6 rounded-lg shadow-[0_0_20px_rgba(28,227,108,0.2)] flex items-center justify-center gap-2 group">
           <ShieldCheck size={20} className="group-hover:rotate-180 transition-transform duration-500" />
           Verify Integrity
        </button>
      </div>
    </div>
  );
};
