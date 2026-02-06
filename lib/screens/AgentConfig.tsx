import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MoreVertical, 
  Fingerprint, 
  Terminal, 
  Wrench, 
  FileText, 
  Box, 
  Trash2, 
  Cpu, 
  History, 
  ExternalLink,
  Save
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const AgentConfigScreen: React.FC<Props> = ({ onNavigate }) => {
  const [tools, setTools] = useState([
     { name: 'project_query', desc: 'Query a project (requires Docker + SHESHA_API_KEY)', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/20', checked: true },
     { name: 'project_upload', desc: 'Upload files into a project', icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/20', checked: true },
     { name: 'project_delete', desc: 'Delete a project (destructive)', icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/20', checked: false },
  ]);

  const toggleTool = (name: string) => {
    setTools(tools.map(t => t.name === name ? { ...t, checked: !t.checked } : t));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-border-dark/30">
        <button 
          onClick={() => onNavigate('agent-center')}
          className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Agent Configuration</h2>
        <button className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
          <MoreVertical size={24} />
        </button>
      </header>

      {/* Segmented Control */}
      <div className="px-4 py-3 sticky top-[64px] z-40 bg-background-dark">
         <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#254632] p-1 shadow-inner">
            <button className="flex h-full grow items-center justify-center rounded-lg px-2 text-[#94c7a8] text-sm font-medium transition-all hover:text-white">
               My Agents
            </button>
            <button className="flex h-full grow items-center justify-center rounded-lg px-2 bg-[#122118] shadow-sm text-primary text-sm font-bold ring-1 ring-white/10">
               Configuration
            </button>
            <button className="flex h-full grow items-center justify-center rounded-lg px-2 text-[#94c7a8] text-sm font-medium transition-all hover:text-white">
               Registry
            </button>
         </div>
      </div>

      <main className="flex-1 flex flex-col gap-6 pb-24 px-4 pt-2">
         {/* Persona Hero */}
         <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-dark border border-border-dark shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-all duration-500"></div>
            <div className="flex items-start justify-between z-10">
               <div className="flex gap-4 items-center">
                  <div className="relative">
                     <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl w-16 h-16 shadow-lg ring-2 ring-border-dark bg-gradient-to-br from-green-900 to-black flex items-center justify-center">
                        <Box size={32} className="text-primary opacity-80" />
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-surface-dark rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col">
                     <h3 className="text-white text-xl font-bold leading-tight">DevOps Specialist</h3>
                     <p className="text-[#94c7a8] text-xs font-mono mt-1 flex items-center gap-1">
                        <Fingerprint size={12} /> ID: 8492-A
                     </p>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">Active</span>
                  <span className="text-[10px] text-gray-500">Synced: 2m ago</span>
               </div>
            </div>
         </div>

         {/* System Prompt */}
         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <Terminal className="text-primary" size={20} />
                  System Prompt
               </h3>
               <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Edit Prompt</button>
            </div>
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-[#254632] rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-200"></div>
               <textarea 
                 className="relative w-full resize-none rounded-xl text-sm font-mono leading-relaxed bg-[#0d1612] text-[#d4ffe5] border border-[#356448] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-h-[160px] p-4 shadow-inner" 
                 spellCheck="false"
                 defaultValue={`You are an expert DevOps engineer specializing in Docker and Kubernetes orchestration. \n\nYour goal is to assist developers in debugging containerized applications, optimizing Dockerfiles, and managing cluster resources safely.`}
               />
               <div className="absolute bottom-3 right-3 flex gap-2">
                  <span className="text-[10px] bg-[#1a3224] text-[#94c7a8] px-2 py-0.5 rounded border border-[#356448]">CLI Mode</span>
               </div>
            </div>
         </section>

         {/* Tool Access Control */}
         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <Wrench className="text-primary" size={20} />
                  Tool Access Control
               </h3>
               <span className="text-xs text-gray-400">MCP Verbs</span>
            </div>
            <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden divide-y divide-border-dark/50">
               {tools.map((tool) => (
                 <div 
                   key={tool.name} 
                   className="p-4 flex items-center justify-between hover:bg-[#254632]/50 transition-colors cursor-pointer"
                   onClick={() => toggleTool(tool.name)}
                 >
                    <div className="flex gap-3 items-center">
                       <div className={`w-10 h-10 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center`}>
                          <tool.icon size={20} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white font-mono">{tool.name}</span>
                          <span className="text-xs text-[#94c7a8]">{tool.desc}</span>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                       <input type="checkbox" checked={tool.checked} readOnly className="sr-only peer" />
                       <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>
               ))}
            </div>
         </section>

         {/* Memory Stats */}
         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <Cpu className="text-primary" size={20} />
                  Memory & Context
               </h3>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1ce36c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Token Window</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">49% Used</span>
               </div>
               <div className="flex items-end gap-1 mb-4 relative z-10">
                  <span className="text-2xl font-mono font-bold">4,021</span>
                  <span className="text-sm text-gray-400 mb-1">/ 8,192</span>
               </div>
               <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-primary w-[49%] shadow-[0_0_10px_rgba(28,227,108,0.5)]"></div>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                     <History size={14} />
                     <span>Context size: 12MB</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      View Manifest
                      <ExternalLink size={12} />
                  </button>
               </div>
            </div>
         </section>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background-dark border-t border-border-dark backdrop-blur-xl bg-opacity-90 z-50">
         <div className="flex gap-3">
            <button className="flex-1 h-12 rounded-xl bg-surface-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98]">
               Revert
            </button>
            <button 
              onClick={() => onNavigate('agent-center')}
              className="flex-[2] h-12 rounded-xl bg-primary text-background-dark font-bold text-sm shadow-[0_0_15px_rgba(28,227,108,0.3)] hover:shadow-[0_0_25px_rgba(28,227,108,0.5)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
               <Save size={18} />
               Deploy Changes
            </button>
         </div>
      </div>
    </div>
  );
};
