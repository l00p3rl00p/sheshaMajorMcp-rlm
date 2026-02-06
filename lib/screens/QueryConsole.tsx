import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Scissors, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  Database,
  Save,
  History,
  Check
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const QueryConsoleScreen: React.FC<Props> = ({ onNavigate }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [clips, setClips] = useState<any[]>([
    { id: 1, type: 'json', content: '{\"project_id\": \"alpha\", \"status\": \"ok\"}', time: '13:55' }
  ]);
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
      setIsRunning(true);
      setTimeout(() => setIsRunning(false), 1000);
  };

  const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleClip = () => {
    const newClip = {
      id: Date.now(),
      type: 'json',
      content: JSON.stringify({
        project_id: "alpha",
        answer: "Release summary: v0.3.1 adds CLI install guidance and MCP tool mapping.",
        latency: "45ms"
      }, null, 2),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setClips([newClip, ...clips]);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-background-dark border-b border-border-dark z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Database size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Shesha RLM</h1>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => onNavigate('agent-center')} className="text-gray-400 hover:text-white transition-colors">
              <History size={20} />
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-none p-4 pb-0 relative">
           <div className="bg-[#0f1713] border border-border-dark rounded-xl p-4 shadow-inner relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Project Query Console</span>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                 </div>
              </div>
              
              <div className="font-mono text-sm leading-relaxed relative z-10">
                 <p>
                    <span className="text-blue-400 font-bold">project_id</span> <span className="text-white">=</span> <span className="text-green-400">\"alpha\"</span>
                 </p>
                 <p>
                    <span className="text-blue-400 font-bold">question</span> <span className="text-white">=</span> <span className="text-gray-300">\"Summarize the latest release notes and surface warnings.\"</span>
                 </p>
              </div>

              {/* Run Button */}
              <button 
                onClick={handleRun}
                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all active:scale-95 group-hover:scale-105 z-20 ${isRunning ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-400'}`}
              >
                 {isRunning ? (
                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 ) : (
                     <Play size={20} fill="currentColor" className="ml-1" />
                 )}
              </button>
           </div>
        </div>

        {/* Stream Section */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
           <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Stream</h2>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">200 OK</span>
           </div>

           <div className="flex-1 bg-black/40 border-t border-white/5 relative overflow-y-auto custom-scrollbar p-2">
              <div className="font-mono text-xs text-gray-500 mb-2">// Response received at 14:02:45</div>
              <pre className="font-mono text-xs leading-relaxed text-gray-300">
{`{
  "project_id": `}<span className="text-blue-300">"alpha"</span>{`,
  "answer": `}<span className="text-blue-300">"Release summary: v0.3.1 adds CLI install guidance and MCP tool mapping."</span>{`,
  "warnings": [
    `}<span className="text-orange-400">"Docker unavailable: project_query disabled"</span>{`
  ],
  "meta": {
    "latency": `}<span className="text-orange-400">"45ms"</span>{`,
    "source": `}<span className="text-blue-300">"librarian project_query"</span>{`
  }
}`}
              </pre>
           </div>

           {/* Actions */}
           <div className="flex gap-3 pt-4">
              <button 
                onClick={handleClip}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-semibold active:scale-[0.98]"
              >
                 <Scissors size={16} /> Clip Response
              </button>
              <button 
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-dark border border-white/10 hover:bg-white/5 transition-colors text-gray-300 text-sm font-semibold active:scale-[0.98]"
              >
                 {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} 
                 {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
        </div>
      </main>

      {/* Side Clips Drawer */}
      <div 
        className={`absolute top-0 right-0 bottom-0 width-[280px] bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 z-50 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
         <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scratchpad</span>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-gray-400"
            >
               <ChevronRight size={20} />
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {clips.map(clip => (
               <div key={clip.id} className="bg-surface-dark/80 border border-white/10 rounded-xl p-3 shadow-lg relative group">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-mono text-gray-500">{clip.time}</span>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:text-white text-gray-500"><Copy size={12} /></button>
                        <button className="p-1 hover:text-red-400 text-gray-500"><Trash2 size={12} /></button>
                     </div>
                  </div>
                  <pre className="font-mono text-[10px] text-gray-300 overflow-hidden line-clamp-4 leading-relaxed">
                     {clip.content}
                  </pre>
               </div>
            ))}
            
            {clips.length === 0 && (
               <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                  <Database size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">No clips yet</p>
               </div>
            )}
         </div>

         <div className="p-3 border-t border-white/5 bg-black/20">
            <button className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
               <Save size={14} /> Save All
            </button>
         </div>
      </div>

      {/* Drawer Toggle Handle (Visible when closed) */}
      {!isDrawerOpen && (
         <button 
           onClick={() => setIsDrawerOpen(true)}
           className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface-dark border-l border-y border-white/10 p-1.5 rounded-l-lg text-gray-400 hover:text-white shadow-lg z-40"
         >
            <ChevronLeft size={20} />
         </button>
      )}
    </div>
  );
};
