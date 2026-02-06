import React from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileImage, 
  FileText, 
  MoreVertical,
  Upload,
  RefreshCw,
  EyeOff,
  Copy
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const IngestionValidationScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-[#0d0d12] text-white font-display overflow-hidden relative">
      
      {/* Header */}
      <header className="flex-none h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#080c0a] z-20">
         <div className="flex items-center gap-3">
             <button 
                onClick={() => onNavigate('data-ingestion')}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                title="Back to Data Ingestion"
             >
                <ArrowLeft size={24} />
             </button>
             <div className="flex flex-col">
                <h1 className="text-base font-bold tracking-tight">Ingestion Validation</h1>
                <p className="text-[10px] font-mono text-gray-500 tracking-wide">Batch ID: SHS-992-01X</p>
             </div>
         </div>
         <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Refresh validation (demo)">
            <RotateCcw size={18} />
         </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
         <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-yellow-200 text-sm">
           Validation UI is a demo. Use the CLI for real ingestion and verification.
         </div>
         
         {/* Stats Cards */}
         <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#181820] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL</span>
               <span className="text-2xl font-bold text-white">12</span>
            </div>
            <div className="bg-[#181820] border border-red-500/20 bg-red-500/5 rounded-xl p-3 flex flex-col justify-center">
               <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">ERRORS</span>
               <span className="text-2xl font-bold text-red-400">2</span>
            </div>
            <div className="bg-[#181820] border border-green-500/20 bg-green-500/5 rounded-xl p-3 flex flex-col justify-center">
               <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">SUCCESS</span>
               <span className="text-2xl font-bold text-green-400">10</span>
            </div>
         </div>

         {/* File Batch Status */}
         <section>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-lg font-bold text-white">File Batch Status</h3>
               <span className="text-[10px] font-bold bg-[#7c3aed]/20 text-[#a78bfa] px-2 py-1 rounded border border-[#7c3aed]/20">Parser Rules</span>
            </div>
            
            <div className="space-y-3">
               {/* Item 1 - Error with Detail */}
               <div className="bg-[#181820] border border-red-500/20 rounded-xl overflow-hidden">
                  <div className="p-3 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                           <FileImage size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-white">hero_banner.png</h4>
                           <p className="text-[10px] text-gray-400">450 KB • PNG</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-[10px] font-bold text-red-400 uppercase">INVALID</span>
                        <button className="text-gray-500 hover:text-white" title="More actions"><MoreVertical size={16} /></button>
                     </div>
                  </div>
                  
                  {/* Error Detail */}
                  <div className="mx-3 mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                     <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-red-400" />
                        <span className="text-xs font-bold text-red-200 uppercase">Rule Failure</span>
                     </div>
                     <p className="text-xs text-red-200/80 leading-relaxed">
                        Unsupported file type. Only text, markdown, JSON/CSV/YAML, PDF, DOCX, and HTML are accepted.
                     </p>
                  </div>
               </div>

               {/* Item 2 - Success */}
               <div className="bg-[#181820] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#34d399]">
                        <FileText size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">release_notes.pdf</h4>
                        <p className="text-[10px] text-gray-400">1.2 MB • PDF</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center text-black">
                        <CheckCircle2 size={16} />
                     </div>
                     <button className="text-gray-500 hover:text-white" title="More actions"><MoreVertical size={16} /></button>
                  </div>
               </div>

               {/* Item 3 - Warning */}
               <div className="bg-[#181820] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <FileText size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">design_spec.docx</h4>
                        <p className="text-[10px] text-gray-400">12.4 MB • DOCX</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="px-2 py-1 rounded border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-bold text-yellow-500 uppercase">LARGE FILE</span>
                     <button className="text-gray-500 hover:text-white" title="More actions"><MoreVertical size={16} /></button>
                  </div>
               </div>
            </div>
         </section>

         {/* Upload Plan Preview */}
         <section>
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Upload Plan Preview</h3>
               <button className="text-[10px] font-bold text-[#7c3aed] flex items-center gap-1 hover:text-[#a78bfa]" title="Copy JSON preview">
                  <Copy size={12} /> Copy JSON
               </button>
            </div>
            <div className="bg-black border border-white/10 rounded-xl p-4 overflow-hidden relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#7c3aed]"></div>
               <pre className="text-[10px] font-mono text-gray-300 leading-relaxed overflow-x-auto">
{`{
  "project_id": "alpha",
  "batch_id": "SHS-992-01X",
  "files": [
     { "path": "release_notes.pdf", "status": "valid" },
     { "path": "design_spec.docx", "status": "large_file" },
     { "path": "hero_banner.png", "status": "rejected" }
  ]
}`}
               </pre>
            </div>
         </section>

      </main>

      {/* Footer Actions */}
      <footer className="p-4 bg-[#080c0a] border-t border-white/5 z-20 space-y-3">
         <div className="flex gap-3">
            <button className="flex-1 bg-[#181820] border border-white/10 hover:bg-white/5 text-gray-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors" title="Retry failed items (demo)">
               <RefreshCw size={14} /> Retry Failed
            </button>
            <button className="flex-1 bg-[#181820] border border-white/10 hover:bg-white/5 text-gray-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors" title="Ignore warnings (demo)">
               <EyeOff size={14} /> Ignore Warnings
            </button>
         </div>
         <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full bg-[#7c3aed]/40 text-white/60 py-4 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.2)] flex items-center justify-center gap-2 transition-all cursor-not-allowed"
            title="Disabled in demo"
            disabled
         >
            <Upload size={18} />
            Confirm Ingestion
         </button>
      </footer>
    </div>
  );
};
