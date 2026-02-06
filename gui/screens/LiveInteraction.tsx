import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Terminal as TerminalIcon, 
  Zap,
  ChevronDown,
  Pause,
  Trash2,
  Save,
  Code,
  ArrowUp,
  BrainCircuit,
  Play
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const LiveInteractionScreen: React.FC<Props> = ({ onNavigate }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState([1, 2, 3, 4]); // Dummy IDs
  const [expandedPayload, setExpandedPayload] = useState(false);

  const clearLogs = () => setLogs([]);

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      <header className="shrink-0 pt-2 pb-2 px-4 bg-background-dark z-20 border-b border-border-dark">
        <div className="flex items-center justify-between h-14">
           <button 
             onClick={() => onNavigate('agent-center')}
             className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
             title="Back to Agent Center"
           >
             <ArrowLeft size={24} />
           </button>
           <h1 className="text-lg font-bold tracking-tight">Live Interaction</h1>
           <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors" title="Open settings">
             <Settings size={24} />
           </button>
        </div>
        
        {/* Persona Selector */}
        <div className="mt-2 relative group">
           <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Zap size={16} className="text-primary" />
           </div>
           <select className="appearance-none w-full bg-surface-dark border border-[#356448] text-white py-3 pl-12 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all cursor-pointer" title="Select persona">
              <option value="devops">Persona: DevOps-01 (Active)</option>
              <option value="researcher">Persona: Research Lead</option>
           </select>
           <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
           </div>
        </div>

        {/* View Toggle */}
        <div className="mt-4 p-1 bg-surface-dark rounded-xl flex">
           <button 
             onClick={() => onNavigate('operator-chat')}
             className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
             title="Switch to chat view"
           >
             Chat View
           </button>
           <button className="flex-1 py-2 rounded-lg bg-background-dark shadow-sm text-sm font-bold text-primary flex items-center justify-center gap-2 border border-[#356448]" title="Trace view (current)">
              <TerminalIcon size={16} /> Trace View
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
         {/* Intent Banner */}
         <div className="px-4 pb-2 pt-4 shrink-0">
            <div className="relative rounded-2xl overflow-hidden bg-cover bg-center min-h-[140px] flex flex-col justify-between p-5 border border-[#356448]/50 shadow-lg bg-gradient-to-b from-surface-dark to-black">
               <div className="flex justify-between items-start">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md ${isPaused ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-primary/10 border-primary/20'}`}>
                     <span className="relative flex h-2 w-2">
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-yellow-500' : 'bg-primary'}`}></span>
                       <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-yellow-500' : 'bg-primary'}`}></span>
                     </span>
                     <span className={`text-xs font-bold uppercase tracking-wider ${isPaused ? 'text-yellow-500' : 'text-primary'}`}>{isPaused ? 'Paused' : 'Processing'}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">ID: #8821X</span>
               </div>
               <div className="mt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Current Intent</p>
                  <p className="text-lg font-medium leading-snug text-white">Query project <span className="text-primary">alpha</span> for the latest release summary.</p>
               </div>
            </div>
         </div>

         {/* Trace Stream */}
         <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-background-dark/95 backdrop-blur py-2 z-10 border-b border-white/5">
               <BrainCircuit size={16} className="text-gray-500" />
               <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Thought Stream</h3>
               <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
            </div>
            
            <div className="font-mono text-xs space-y-4 pb-24">
               {/* Log Items */}
               {logs.length > 0 ? (
                 <>
                   <div className="group">
                      <div className="flex gap-3 text-gray-500 mb-1">
                         <span>10:42:05</span><span className="text-blue-400 font-bold">START</span>
                      </div>
                      <div className="pl-4 border-l-2 border-gray-800 group-hover:border-blue-400/30 transition-colors">
                         <p className="text-gray-300">Analysis initiated on <span className="text-yellow-200">/src/middleware/auth.ts</span></p>
                      </div>
                   </div>

                   <div className="group">
                      <div className="flex gap-3 text-gray-500 mb-1">
                         <span>10:42:08</span>
                         <span className="text-primary font-bold">TOOL_USE</span>
                         <span className="text-gray-400 text-[10px] border border-gray-700 rounded px-1 flex items-center">MCP: Librarian</span>
                      </div>
                      <div className="pl-4 border-l-2 border-gray-800 group-hover:border-primary/30 transition-colors bg-surface-dark/50 p-2 rounded-r-lg mt-1">
                         <p className="text-primary break-all">call project_query({`{ project_id: "alpha", question: "Summarize the latest release notes." }`})</p>
                      </div>
                   </div>

                   <div className="group opacity-75">
                      <div className="flex gap-3 text-gray-500 mb-1">
                         <span>10:42:09</span><span className="text-purple-400 font-bold">STDIO</span>
                      </div>
                      <div className="pl-4 border-l-2 border-gray-800">
                         <p className={`text-gray-400 ${expandedPayload ? '' : 'line-clamp-2'}`}>{`{ "content": "Release summary: v0.3.1 adds CLI install guidance, MCP tool list, and improved persistence reporting..." }`}</p>
                         <button 
                           onClick={() => setExpandedPayload(!expandedPayload)}
                           className="text-[10px] text-gray-500 hover:text-white underline mt-1"
                           title={expandedPayload ? 'Collapse payload' : 'Expand payload'}
                         >
                           {expandedPayload ? 'Collapse Payload' : 'Expand Payload'}
                         </button>
                      </div>
                   </div>

                   <div className="group">
                      <div className="flex gap-3 text-gray-500 mb-1">
                         <span>10:42:12</span><span className="text-orange-400 font-bold">THOUGHT</span>
                      </div>
                      <div className="pl-4 border-l-2 border-gray-800">
                         <p className="text-gray-300 italic">Project query complete. I will surface key changes, environment requirements, and any detected warnings.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 mt-4 animate-pulse">
                      <span className="text-primary">➜</span><span className="h-4 w-2 bg-primary"></span>
                   </div>
                 </>
               ) : (
                 <div className="text-gray-600 italic py-4 text-center">Trace logs cleared.</div>
               )}
            </div>
         </div>
      </main>

      <footer className="bg-surface-dark/95 border-t border-white/5 pb-6 pt-3 px-4 backdrop-blur-lg fixed bottom-0 left-0 right-0 z-30">
         <div className="flex justify-between items-center mb-3">
            <div className="flex gap-2">
               <button 
                 onClick={() => setIsPaused(!isPaused)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide ${isPaused ? 'bg-primary/10 text-primary border-primary/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}
                 title={isPaused ? 'Resume trace stream' : 'Pause trace stream'}
               >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
               </button>
               <button 
                 onClick={clearLogs}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wide"
                 title="Clear trace logs"
               >
                  <Trash2 size={14} /> Clear
               </button>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold uppercase tracking-wide" title="Save snapshot">
               <Save size={14} /> Snapshot
            </button>
         </div>
         <div className="relative flex items-center">
            <div className="absolute left-3 text-primary flex items-center pointer-events-none">
               <Code size={20} />
            </div>
            <input className="w-full bg-black/40 border border-[#356448] text-white pl-10 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-500 text-sm font-mono" placeholder="Inject command or new goal..." type="text" title="Enter a new intent (read-only demo)" />
            <button className="absolute right-2 p-1.5 bg-primary text-black rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_10px_rgba(28,227,108,0.4)]" title="Send intent (demo)">
               <ArrowUp size={20} />
            </button>
         </div>
      </footer>
    </div>
  );
};
