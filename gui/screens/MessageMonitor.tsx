import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Activity,
  ChevronDown
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const MessageMonitorScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('LIVE');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleNode = (id: number) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedNodes(newSet);
  };

  const getFilterClass = (name: string, color: string = 'text-gray-300', activeColor: string = 'bg-primary text-black') => {
      const isActive = activeFilter === name;
      if (isActive) return `flex items-center gap-1.5 px-3 py-1.5 rounded-full ${activeColor} text-xs font-bold shadow-[0_0_10px_rgba(28,227,108,0.4)]`;
      return `flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a2e23] border border-[#2a4535] ${color} text-xs font-medium hover:border-primary/50 transition-colors`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050a07] text-white font-display relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0" style={{ 
         backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
         backgroundSize: '40px 40px'
      }}></div>

      <header className="flex items-center justify-between px-4 py-4 relative z-20">
        <div className="flex items-center gap-3">
           <button onClick={() => onNavigate('agent-center')} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-white" />
           </button>
           <h1 className="text-xl font-bold">Message Monitor</h1>
        </div>
        <button className="text-gray-400 hover:text-white">
           <Settings size={24} />
        </button>
      </header>

      {/* Filters */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar relative z-20">
         <button onClick={() => setActiveFilter('LIVE')} className={getFilterClass('LIVE')}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'LIVE' ? 'bg-black' : 'bg-green-500'} animate-pulse`}></span>
            LIVE
         </button>
         <button onClick={() => setActiveFilter('Docker')} className={getFilterClass('Docker')}>
            Docker
         </button>
         <button onClick={() => setActiveFilter('Librarian')} className={getFilterClass('Librarian')}>
            Librarian
         </button>
         <button onClick={() => setActiveFilter('Success')} className={getFilterClass('Success', 'text-green-400', 'bg-green-500 text-black')}>
            <CheckCircle2 size={12} /> Success
         </button>
         <button onClick={() => setActiveFilter('Errors')} className={getFilterClass('Errors', 'text-red-400', 'bg-red-500 text-white')}>
            Errors
         </button>
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar p-4 min-h-[600px]">
         <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/5 -translate-x-1/2 z-0"></div>
         <div className="flex flex-col gap-12 relative pb-24 max-w-lg mx-auto">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a110d] border border-white/10 rounded-full px-3 py-0.5 text-[10px] font-mono text-gray-500 z-10">
               10:42:00
            </div>

            {/* Transaction 1 */}
            <div className="relative h-32 w-full">
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <path d="M140,40 C200,40 200,80 250,80" fill="none" stroke="#1ce36c" strokeWidth="2" strokeOpacity="0.5" />
                  <circle cx="140" cy="40" r="3" fill="#3b82f6" />
                  <circle cx="250" cy="80" r="3" fill="#1ce36c" />
               </svg>

               <div className="absolute left-0 top-0 w-[45%]">
                  <div className="bg-[#0a110d] border border-blue-500/30 rounded-lg p-3 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative group hover:border-blue-500/60 transition-colors">
                     <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Query</span>
                        <span className="text-[10px] font-mono text-gray-500">05.002s</span>
                     </div>
                     <h3 className="text-sm font-bold text-white mb-0.5">health</h3>
                     <p className="text-xs text-gray-400">System Health</p>
                  </div>
               </div>

               <div className="absolute right-0 top-[60px] w-[45%] transition-all z-20">
                  <div 
                    onClick={() => toggleNode(1)}
                    className={`bg-[#0a110d] border ${expandedNodes.has(1) ? 'border-green-500' : 'border-green-500/30'} rounded-lg p-3 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative cursor-pointer transition-all`}
                  >
                     <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500"></div>
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-green-400 uppercase">Response</span>
                        <span className="text-[10px] font-mono text-gray-500">05.150s</span>
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm font-bold text-white">200 OK</span>
                     </div>
                     <div className="text-[10px] text-gray-500 flex items-center gap-1 hover:text-white">
                        PAYLOAD <span className={`text-[8px] transition-transform ${expandedNodes.has(1) ? 'rotate-180' : 'rotate-90'}`}>▶</span>
                     </div>
                     {expandedNodes.has(1) && (
                         <div className="mt-2 pt-2 border-t border-white/10 font-mono text-[9px] text-gray-300">
                             {`{ "status": "ok", "docker": { "ok": false } }`}
                         </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Transaction 2 */}
            <div className={`relative w-full mt-4 transition-all ${expandedNodes.has(1) ? 'mt-12' : 'mt-4'}`} style={{ height: expandedNodes.has(2) ? '12rem' : '10rem' }}>
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                   <path d="M140,40 C200,40 200,80 250,80" fill="none" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 4" />
                   <circle cx="140" cy="40" r="3" fill="#3b82f6" />
                   <circle cx="250" cy="80" r="3" fill="#ef4444" />
               </svg>

               <div className="absolute left-0 top-0 w-[45%]">
                  <div className="bg-[#0a110d] border border-blue-500/30 rounded-lg p-3 relative">
                     <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Query</span>
                        <span className="text-[10px] font-mono text-gray-500">05.410s</span>
                     </div>
                     <h3 className="text-sm font-bold text-white mb-0.5">project_query</h3>
                     <p className="text-xs text-gray-400">Librarian MCP</p>
                  </div>
               </div>

               <div className="absolute right-0 top-[60px] w-[45%]">
                  <div 
                    onClick={() => toggleNode(2)}
                    className="bg-[#0a110d] border border-red-500/30 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative cursor-pointer"
                  >
                     <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500"></div>
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Error</span>
                        <span className="text-[10px] font-mono text-gray-500">05.485s</span>
                     </div>
                     <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <span className="text-sm font-bold text-white leading-tight">Docker Unavailable</span>
                     </div>
                     <div className="bg-red-500/5 rounded p-2 border border-red-500/10">
                        <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">TRACE <ChevronDown size={10} className={expandedNodes.has(2) ? "rotate-180" : ""} /></div>
                        <pre className={`font-mono text-[9px] text-red-300 transition-all overflow-hidden ${expandedNodes.has(2) ? 'max-h-20' : 'max-h-12'}`}>
{`{
  "err": "docker_unavailable",
  "code": 503,
  "detail": "project_query disabled"
}`}
                        </pre>
                     </div>
                  </div>
               </div>
            </div>
            
         </div>
      </main>

      {/* FAB */}
      <div className="absolute bottom-6 right-6 z-30">
         <button className="w-14 h-14 rounded-full bg-primary text-black shadow-[0_0_20px_rgba(28,227,108,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
            <Play size={24} fill="currentColor" className="ml-1" />
         </button>
      </div>
    </div>
  );
};
