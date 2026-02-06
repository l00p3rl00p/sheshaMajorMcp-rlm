import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  UploadCloud, 
  FileJson, 
  FileText, 
  FileCode, 
  CheckCircle2,
  AlertTriangle,
  Rocket,
  ChevronDown,
  X
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const DataIngestionScreen: React.FC<Props> = ({ onNavigate }) => {
  const [ingestionMode, setIngestionMode] = useState<'STRICT' | 'PERMISSIVE'>('STRICT');
  const [groupingLogic, setGroupingLogic] = useState(true);

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
                <h1 className="text-base font-bold tracking-tight">Data Ingestion</h1>
                <p className="text-[10px] font-bold text-[#7c3aed] tracking-wider uppercase">Librarian Upload</p>
             </div>
         </div>
         <button className="text-gray-400 hover:text-white transition-colors" title="Open settings">
            <Settings size={20} />
         </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
         <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-yellow-200 text-sm">
           Ingestion UI is a demo. Use the CLI <span className="font-mono text-yellow-100">librarian upload</span> command for real ingestion.
         </div>
         
         {/* Validation Mode */}
         <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Validation Mode (UI Only)</h3>
            <div className="bg-[#181820] p-1 rounded-lg flex border border-white/5">
               <button 
                  onClick={() => setIngestionMode('STRICT')}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${ingestionMode === 'STRICT' ? 'bg-[#7c3aed] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Use strict validation (UI only)"
               >
                  Strict
               </button>
               <button 
                  onClick={() => setIngestionMode('PERMISSIVE')}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${ingestionMode === 'PERMISSIVE' ? 'bg-[#7c3aed] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Use permissive validation (UI only)"
               >
                  Permissive
               </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Strict rejects unsupported file types before calling <span className="font-mono text-gray-300">librarian upload</span>.</p>
         </section>

         {/* Configuration */}
         <section className="space-y-4">
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Target Project</h3>
                <div className="relative">
                   <select className="w-full bg-[#181820] text-white border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#7c3aed]" title="Select target project (UI only)">
                      <option>alpha</option>
                      <option>beta</option>
                      <option>create-new</option>
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
             </div>

             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Batch Notes (Local)</h3>
                <div className="bg-[#181820] border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 items-center min-h-[48px]">
                   <span className="flex items-center gap-1 bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      PROD_X <button title="Remove tag"><X size={10} /></button>
                   </span>
                   <span className="flex items-center gap-1 bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      LEGACY <button title="Remove tag"><X size={10} /></button>
                   </span>
                   <input type="text" placeholder="Add note..." className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 flex-1 min-w-[80px]" title="Add a batch note (UI only)" />
                </div>
             </div>
         </section>

         {/* Drop Zone */}
         <section className="relative">
            <div className="border-2 border-dashed border-[#7c3aed]/30 bg-[#7c3aed]/5 rounded-2xl h-64 flex flex-col items-center justify-center gap-4 group hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/10 transition-all cursor-pointer">
               <div className="w-16 h-16 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
               </div>
               <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Godly Drop Zone</h3>
               <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                     Drag & drop files or folders to upload into the selected project
                  </p>
               </div>
               <button className="bg-[#7c3aed]/40 text-white/60 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg transition-colors cursor-not-allowed" disabled title="File picker disabled in demo">
                  Select Files
               </button>
            </div>
            {/* Visual Border Glow Effect */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[0_0_0_1px_rgba(124,58,237,0.1),0_0_20px_rgba(124,58,237,0.1)]"></div>
         </section>

         {/* Supported Types */}
         <div className="flex flex-wrap justify-center gap-4 py-2 opacity-70">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .JSON
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .MD
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .TXT
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .CSV
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .YAML
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .PDF
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .DOCX
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .HTML
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
               <CheckCircle2 size={12} className="text-green-500" /> .PY / .TS / .JS
            </div>
         </div>

         {/* Recursive Toggle */}
         <section className="bg-[#181820] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
               <h3 className="text-sm font-bold text-white">Recursive Directory Upload</h3>
               <p className="text-[10px] text-gray-500 uppercase">Matches <span className="font-mono">--recursive</span> in CLI</p>
            </div>
            <div 
               onClick={() => setGroupingLogic(!groupingLogic)}
               className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${groupingLogic ? 'bg-[#7c3aed]' : 'bg-gray-700'}`}
               title="Toggle recursive upload (UI only)"
            >
               <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${groupingLogic ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
         </section>

         {/* Upload Queue */}
         <section>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Upload Queue</h3>
               <span className="text-[10px] font-bold bg-[#7c3aed]/20 text-[#a78bfa] px-2 py-0.5 rounded">3 ACTIVE</span>
            </div>
            
            <div className="space-y-3">
               {/* Item 1 */}
               <div className="bg-[#181820] border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed]">
                           <FileJson size={16} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-white">release_notes.json</h4>
                           <p className="text-[10px] text-gray-500">1.4 MB • VALID JSON</p>
                        </div>
                     </div>
                     <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                        <CheckCircle2 size={12} /> VALID
                     </span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                     <div className="h-full w-[75%] bg-[#7c3aed]"></div>
                  </div>
               </div>

               {/* Item 2 - Error */}
               <div className="bg-[#181820] border border-red-500/20 rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                           <FileText size={16} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-gray-300 line-through decoration-red-500 decoration-2">hero_banner.png</h4>
                           <p className="text-[10px] text-red-400 font-bold">UNSUPPORTED TYPE</p>
                        </div>
                     </div>
                     <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <AlertTriangle size={12} /> WRONG TYPE
                     </span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                     <div className="h-full w-[100%] bg-gray-700"></div>
                  </div>
               </div>

               {/* Item 3 */}
               <div className="bg-[#181820] border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed]">
                           <FileCode size={16} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-white">parser_registry.py</h4>
                           <p className="text-[10px] text-gray-500">14 KB • SOURCE CODE</p>
                        </div>
                     </div>
                     <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                        <CheckCircle2 size={12} /> VALID
                     </span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                     <div className="h-full w-[30%] bg-[#7c3aed]"></div>
                  </div>
               </div>
            </div>
         </section>

      </main>

      {/* Footer */}
      <footer className="p-4 bg-[#080c0a] border-t border-white/5 z-20">
         <button 
            onClick={() => onNavigate('ingestion-validation')}
            className="w-full bg-[#7c3aed]/40 text-white/60 py-4 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.2)] flex items-center justify-center gap-2 transition-all cursor-not-allowed"
            title="Disabled in demo. Use librarian upload."
            disabled
         >
            <Rocket size={18} fill="currentColor" />
            START INGESTION SEQUENCE
         </button>
      </footer>
    </div>
  );
};
