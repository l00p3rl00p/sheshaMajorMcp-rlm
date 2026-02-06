import React, { useState } from 'react';
import { 
  X, 
  Rocket, 
  ChevronLeft,
  Copy,
  ChevronDown,
  Box,
  Check
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const PromptPreviewScreen: React.FC<Props> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      onNavigate('live-interaction');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d12] text-white font-display overflow-hidden relative">
      
      {/* Header */}
      <header className="flex-none h-16 px-4 flex items-center justify-between bg-[#121218] border-b border-white/5 z-20">
         <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight uppercase">Final Preview</h1>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
               <span className="text-[10px] font-bold text-primary tracking-wider">ESTIMATOR READY</span>
            </div>
         </div>
         <button 
            onClick={() => onNavigate('staging-area')}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400"
            title="Close preview"
         >
            <X size={24} />
         </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
         
         {/* Token Context Card */}
         <section className="bg-[#181820] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 relative z-10">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Context</span>
               <div className="bg-[#059669]/20 text-[#34d399] px-2 py-0.5 rounded border border-[#059669]/30 text-[10px] font-bold uppercase">Safe</div>
            </div>
            
            <div className="flex items-end gap-2 mb-4 relative z-10">
               <span className="text-3xl font-mono font-bold text-white">1,240</span>
               <span className="text-sm font-mono text-gray-500 mb-1">/ 8,192</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-6 relative z-10 flex">
               <div className="h-full bg-[#6366f1] w-[20%]"></div> {/* History */}
               <div className="h-full bg-[#ec4899] w-[15%]"></div> {/* System */}
               <div className="h-full bg-[#1ce36c] w-[10%]"></div> {/* Query */}
            </div>

            {/* Distribution Legend */}
            <div className="space-y-2 relative z-10">
               <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                     <div className="w-2 h-2 rounded-sm bg-[#6366f1]"></div>
                     Context History
                  </div>
                  <span className="font-mono text-gray-500">540</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                     <div className="w-2 h-2 rounded-sm bg-[#ec4899]"></div>
                     System Prompt
                  </div>
                  <span className="font-mono text-gray-500">310</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                     <div className="w-2 h-2 rounded-sm bg-[#1ce36c]"></div>
                     Current Query
                  </div>
                  <span className="font-mono text-gray-500">390</span>
               </div>
            </div>

            {/* Background Decor */}
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
               <Box size={120} />
            </div>
         </section>

         {/* Persona Selector */}
         <section>
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">System Persona</h3>
            <button className="w-full bg-[#181820] border border-white/10 hover:border-purple-500/50 rounded-xl p-3 flex items-center justify-between transition-colors group">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">
                     <BotIcon />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">RLM Operator (Default)</span>
               </div>
               <ChevronDown size={18} className="text-gray-500" />
            </button>
         </section>

         {/* Compiled Prompt View */}
         <section className="flex-1 flex flex-col min-h-0">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Compiled Prompt</h3>
               <button 
                 onClick={handleCopy}
                 className={`flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${copied ? 'text-green-400' : 'text-purple-400 hover:text-purple-300'}`}
                 title="Copy compiled prompt"
               >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Raw'}
               </button>
            </div>
            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed text-gray-300 overflow-x-auto shadow-inner">
               <p className="text-[#ec4899] font-bold mb-2">### System Instruction</p>
               <p className="mb-4 text-gray-400">You are a Shesha RLM operator. Use Librarian MCP tools and keep responses concise and actionable.</p>
               
               <p className="text-[#6366f1] font-bold mb-2">### Context from Chat</p>
               <p className="mb-4 text-gray-400">User requested ingestion warnings for project alpha. Docker is unavailable.</p>

               <p className="text-[#1ce36c] font-bold mb-2">### Query Result</p>
               <p className="text-white">Summarize rejected files and suggest valid replacements or CLI fixes.</p>
            </div>
         </section>
      </main>

      {/* Footer Actions */}
      <footer className="flex-none p-4 bg-[#121218] border-t border-white/5 z-20">
         <div className="flex gap-3">
           <button 
              onClick={() => onNavigate('staging-area')}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              title="Return to staging"
           >
               <ChevronLeft size={18} />
               Edit
            </button>
           <button 
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-[2] bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
              title="Execute via RLM (demo)"
           >
               {isExecuting ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   SENDING...
                 </>
               ) : (
                 <>
                   <Rocket size={18} fill="currentColor" />
                   EXECUTE VIA RLM
                 </>
               )}
            </button>
         </div>
      </footer>

    </div>
  );
};

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
