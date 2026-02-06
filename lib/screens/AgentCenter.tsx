import React, { useState } from 'react';
import { 
  Bot, 
  Menu, 
  LayoutGrid, 
  Grid, 
  Terminal as TerminalIcon, 
  MoreVertical, 
  Play, 
  Settings, 
  Maximize2, 
  Minimize2, 
  GripHorizontal,
  Code2,
  FolderOpen,
  Globe,
  Send,
  Database,
  Cpu,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  Search,
  Layers,
  FileJson,
  History,
  Power
} from 'lucide-react';
import { ScreenName } from '../types';
import { BottomNav, ScanlineEffect } from '../components/Shared';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

type ViewMode = 'standard' | 'operator' | 'debug';

export const AgentCenterScreen: React.FC<Props> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-display overflow-hidden relative transition-colors duration-500">
      {/* Dynamic Backgrounds based on Mode */}
      {viewMode === 'standard' && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      )}
      {viewMode === 'operator' && (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-black to-black"></div>
      )}
      {viewMode === 'debug' && (
        <div className="absolute inset-0 z-0 pointer-events-none bg-[#050a07]">
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: 'linear-gradient(#1ce36c 1px, transparent 1px), linear-gradient(90deg, #1ce36c 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      )}

      {/* Unified Header with Reframe Toggle */}
      <header className="flex-none px-4 pt-12 pb-3 flex items-center justify-between z-30 bg-surface-dark/80 backdrop-blur-md border-b border-border-dark transition-all duration-300">
        {viewMode === 'operator' ? (
           <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Menu size={24} />
           </button>
        ) : (
          <div className="flex items-center gap-3">
             <button className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-gray-400">
               <Menu size={24} />
             </button>
             <div>
               <h1 className="text-sm font-bold tracking-widest uppercase text-white">Shesha<span className="text-primary">RLM</span></h1>
               <div className="flex items-center gap-2">
                 <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'debug' ? 'bg-primary animate-pulse' : 'bg-primary'}`}></span>
                 <p className="text-[10px] text-primary/80 font-mono">v0.3.1</p>
               </div>
             </div>
          </div>
        )}

        {/* Reframe Toggle */}
        <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 backdrop-blur-sm">
           <button 
             onClick={() => setViewMode('standard')}
             className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'standard' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Std
           </button>
           <button 
             onClick={() => setViewMode('debug')}
             className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'debug' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(28,227,108,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Debug
           </button>
           <button 
             onClick={() => setViewMode('operator')}
             className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'operator' ? 'bg-primary text-black shadow-[0_0_10px_rgba(28,227,108,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Op
           </button>
        </div>

        {viewMode === 'operator' ? (
          <div className="relative">
             <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
             <Bot size={24} className="text-gray-400" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
             <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                <Settings size={18} />
             </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-24">
         
         {/* STANDARD VIEW (Original) */}
         {viewMode === 'standard' && (
            <div className="p-3 space-y-3 animate-fade-in">
               {/* Mode Selector (Sub-nav for Standard) */}
               <div className="flex-none py-2 flex gap-2 overflow-x-auto no-scrollbar mb-2">
                  {['OPERATOR_MODE', 'DEBUG_VIEW', 'CREATIVE_CANVAS'].map((mode, i) => (
                    <button key={mode} className={`flex-none px-3 py-1 rounded-full border text-[10px] font-mono tracking-wide ${i === 0 ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {i === 0 ? '●' : '○'} {mode}
                    </button>
                  ))}
               </div>

               {/* Draggable Panel 1: Persona Registry */}
               <section className="bg-surface-dark/60 backdrop-blur-md border border-white/5 rounded-lg flex flex-col relative overflow-hidden">
                  <div className="h-8 bg-surface-dark border-b border-white/5 flex items-center justify-between px-3 cursor-move">
                     <div className="flex items-center gap-2">
                        <Grid size={14} className="text-gray-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Persona Registry</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-500">
                        <Maximize2 size={12} className="hover:text-white cursor-pointer" />
                        <Minimize2 size={12} className="hover:text-white cursor-pointer" />
                     </div>
                  </div>
                  <div className="p-3">
                     <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {/* Active Persona */}
                        <div 
                          onClick={() => onNavigate('agent-config')}
                          className="flex-none w-40 p-2.5 rounded bg-primary/5 border border-primary/30 relative cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                           <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_5px_#1ce36c]"></div>
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded bg-surface-dark flex items-center justify-center border border-primary/20">
                                 <Bot size={16} className="text-primary" />
                              </div>
                              <div>
                                 <h3 className="text-xs font-bold text-white">Architect</h3>
                                 <p className="text-[9px] text-primary font-mono">ACTIVE</p>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                                 <FolderOpen size={10} /> project_upload
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                                 <Globe size={10} /> project_query
                              </div>
                           </div>
                        </div>

                        {/* Standby Persona */}
                        <div className="flex-none w-40 p-2.5 rounded bg-surface-dark border border-white/5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
                                 <Code2 size={16} className="text-blue-400" />
                              </div>
                              <div>
                                 <h3 className="text-xs font-bold text-gray-300">Coder</h3>
                                 <p className="text-[9px] text-gray-500 font-mono">STANDBY</p>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono">
                                 <TerminalIcon size={10} /> projects_list
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Draggable Panel 2: Prompt Execution */}
               <section 
                 onClick={() => onNavigate('live-interaction')}
                 className="bg-surface-dark/80 backdrop-blur-xl border border-primary/30 rounded-lg flex flex-col min-h-[250px] shadow-[0_0_10px_rgba(28,227,108,0.15)] cursor-pointer hover:border-primary/50 transition-colors"
               >
                  <div className="h-8 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20 flex items-center justify-between px-3 cursor-move">
                     <div className="flex items-center gap-2">
                        <GripHorizontal size={14} className="text-primary/50" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">Prompt Execution</span>
                     </div>
                     <div className="flex items-center gap-2 text-primary/60">
                        <MoreVertical size={14} className="hover:text-white cursor-pointer" />
                     </div>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-3">
                     <div className="flex gap-2">
                        <div className="mt-0.5 text-primary">➜</div>
                        <div className="text-gray-300">Summarize the most recent changes in project <span className="text-primary">alpha</span> and flag anomalies.</div>
                     </div>
                     <div className="pl-4 border-l border-white/10 space-y-2 py-1">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px]">
                           <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                           PLANNING SEQUENCE...
                        </div>
                        <div className="bg-surface-dark border border-white/10 rounded p-2">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                                 <FolderOpen size={12} />
                                 CALL: Librarian MCP
                              </span>
                              <span className="text-[9px] text-gray-600">14:02:45</span>
                           </div>
                           <code className="text-[10px] text-gray-400 block break-all">project_query(project_id=\"alpha\", question=\"Summarize recent changes\")</code>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Floating Action Bar */}
                <div className="absolute bottom-6 left-4 right-4 z-40">
                  <div className="bg-surface-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <button 
                           onClick={() => onNavigate('message-monitor')}
                           className="p-2 rounded-xl text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
                        >
                           <TerminalIcon size={20} />
                        </button>
                        <button 
                           onClick={() => onNavigate('query-console')}
                           className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                           <Database size={20} />
                        </button>
                     </div>
                     <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                     <button 
                       onClick={() => onNavigate('live-interaction')}
                       className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(28,227,108,0.4)] active:scale-95 transition-transform"
                     >
                        <Play size={18} fill="currentColor" />
                        <span>Run</span>
                     </button>
                  </div>
                </div>
            </div>
         )}

         {/* OPERATOR MODE (Minimalist Reframe) */}
         {viewMode === 'operator' && (
           <div className="flex flex-col h-full animate-fade-in relative">
              {/* Status Orbs */}
              <div className="flex justify-around items-center py-10 px-4">
                 <div className="flex flex-col items-center gap-3 group">
                    <div className="w-20 h-20 rounded-full border border-primary/30 shadow-[0_0_30px_rgba(28,227,108,0.15)] flex items-center justify-center bg-black relative group-hover:scale-105 transition-transform duration-500">
                       <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-20"></div>
                       <Cpu size={28} className="text-primary" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">System</p>
                       <p className="text-xs font-bold text-primary">OPTIMAL</p>
                    </div>
                 </div>

                 <div 
                    onClick={() => onNavigate('message-monitor')}
                    className="flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                 >
                    <div className="w-20 h-20 rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center bg-black relative">
                       <Activity size={28} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-0.5">Network</p>
                       <p className="text-xs font-bold text-gray-300">IDLE</p>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(192,132,252,0.15)] flex items-center justify-center bg-black relative">
                       <div className="absolute top-1 right-2 w-3 h-3 bg-purple-500 rounded-full border-2 border-black"></div>
                       <Bot size={28} className="text-purple-400" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Agent</p>
                       <p className="text-xs font-bold text-purple-400 animate-pulse">THINKING</p>
                    </div>
                 </div>
              </div>

              {/* Active Processes */}
              <div className="px-6 flex-1">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Active Processes</h2>
                    <span className="text-[10px] font-mono text-gray-600">2 RUNNING</span>
                 </div>
                 
                 <div className="space-y-4">
                    {/* Process 1 */}
                    <div className="bg-surface-dark border border-primary/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(28,227,108,0.05)] relative overflow-hidden group hover:border-primary/50 transition-colors">
                       <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#1ce36c]"></div>
                       <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0d1f14] flex items-center justify-center text-primary border border-primary/20">
                             <Search size={20} />
                          </div>
                          <div>
                             <h3 className="text-base font-bold text-white">Project Query</h3>
                             <p className="text-xs font-mono text-primary/70">project_query</p>
                          </div>
                       </div>
                       <div className="relative h-1.5 w-full bg-black rounded-full overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 bg-primary w-[64%] shadow-[0_0_10px_#1ce36c]"></div>
                       </div>
                       <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400">
                          <span>Processing project alpha</span>
                          <span className="text-white">64%</span>
                       </div>
                    </div>

                    {/* Process 2 */}
                    <div 
                       onClick={() => onNavigate('query-console')}
                       className="bg-surface-dark border border-white/5 rounded-2xl p-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                       <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 border border-white/10">
                                <Database size={20} />
                             </div>
                             <div>
                                <h3 className="text-base font-bold text-gray-200">Project Upload</h3>
                                <p className="text-xs font-mono text-gray-500">project_upload</p>
                             </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Queued</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                          <div className="h-full w-0 bg-gray-500"></div>
                       </div>
                    </div>

                    {/* Placeholder */}
                    <button className="w-full py-8 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-400 hover:border-white/10 transition-colors group">
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <MoreVertical size={16} />
                       </div>
                       <span className="text-xs font-medium">Waiting for next command sequence...</span>
                    </button>
                 </div>
              </div>

              {/* Bottom Action */}
              <div className="p-4 mt-auto">
                 <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#0d110e] border border-white/10 rounded-2xl p-1.5 flex items-center pl-4 shadow-2xl">
                       <input 
                         type="text" 
                         placeholder="Analyze system performance..." 
                         className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder-gray-500 h-10"
                       />
                       <button className="w-10 h-10 rounded-xl bg-[#1a2e23] text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                          <ArrowUp size={20} />
                       </button>
                    </div>
                 </div>
                 <div className="absolute bottom-6 left-8">
                     <Power size={24} className="text-gray-600 hover:text-white transition-colors cursor-pointer" />
                 </div>
              </div>
           </div>
         )}

         {/* DEBUG MODE (Data-Dense Reframe) */}
         {viewMode === 'debug' && (
           <div className="flex flex-col h-full animate-fade-in px-2 gap-2 text-[10px] font-mono pt-2">
              {/* Telemetry Row */}
              <div className="grid grid-cols-3 gap-2">
                 <div className="bg-[#0a0f0c] border border-[#1f3629] p-2 rounded relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <span className="text-gray-500 font-bold uppercase">CPU</span>
                       <span className="text-primary font-bold text-lg">12%</span>
                    </div>
                    {/* Mock Sparkline */}
                    <div className="absolute inset-x-0 bottom-0 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                       <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <path d="M0,25 L10,20 L20,28 L30,15 L40,22 L50,10 L60,18 L70,5 L80,20 L90,15 L100,22" fill="none" stroke="#1ce36c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                          <path d="M0,25 L10,20 L20,28 L30,15 L40,22 L50,10 L60,18 L70,5 L80,20 L90,15 L100,22 V30 H0 Z" fill="#1ce36c" fillOpacity="0.1" stroke="none" />
                       </svg>
                    </div>
                 </div>
                 <div className="bg-[#0a0f0c] border border-[#1f3629] p-2 rounded relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <span className="text-gray-500 font-bold uppercase">MEM</span>
                       <span className="text-white font-bold text-lg">450MB</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-12 opacity-30 group-hover:opacity-60 transition-opacity">
                       <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <path d="M0,28 L20,25 L40,26 L60,20 L80,15 L100,10" fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                          <path d="M0,28 L20,25 L40,26 L60,20 L80,15 L100,10 V30 H0 Z" fill="#ffffff" fillOpacity="0.1" stroke="none" />
                       </svg>
                    </div>
                 </div>
                 <div className="bg-[#0a0f0c] border border-[#1f3629] p-2 rounded relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <span className="text-gray-500 font-bold uppercase">LAT</span>
                       <span className="text-white font-bold text-lg">24ms</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-12 opacity-30 group-hover:opacity-60 transition-opacity">
                       <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <path d="M0,20 L20,22 L40,20 L60,24 L80,20 L100,22" fill="none" stroke="#1ce36c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                       </svg>
                    </div>
                 </div>
              </div>

              {/* Terminal */}
              <div 
                 onClick={() => onNavigate('message-monitor')}
                 className="bg-black border border-border-dark p-2 rounded flex-none min-h-[140px] flex flex-col font-mono text-[10px] cursor-pointer hover:border-primary/30 transition-colors"
              >
                 <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                    <span className="font-bold text-gray-500">TERMINAL</span>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-1 text-gray-400">
                    <div><span className="text-blue-400">sys</span> init sequence started...</div>
                    <div><span className="text-blue-400">net</span> listening on port 8080</div>
                    <div><span className="text-green-500">➜</span> loaded persona "SRE_Main"</div>
                    <div><span className="text-green-500">➜</span> tool registry updated (6 tools)</div>
                    <div className="text-yellow-500">[WARN] latency spike detected in region: us-east</div>
                    <div><span className="text-green-500">➜</span> executing analysis...</div>
                    <div className="flex items-center gap-1">
                       <span className="text-primary">{'>'} awaiting_input</span>
                       <span className="w-1.5 h-3 bg-primary animate-pulse"></span>
                    </div>
                 </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                 {/* Left Column */}
                 <div className="flex flex-col gap-2">
                    {/* Call Stack */}
                    <div className="bg-[#0a0f0c] border border-border-dark rounded flex-1 p-2 overflow-hidden relative">
                       <div className="absolute left-3 top-2 bottom-2 w-px bg-white/5 z-0"></div>
                       <div className="relative z-10 space-y-3">
                          <div className="flex items-center gap-1 text-gray-500 font-bold border-b border-white/5 pb-1 mb-2">
                             <Layers size={10} /> CALL STACK
                          </div>
                          <div className="pl-4 relative">
                             <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary border-2 border-black"></div>
                             <div className="text-white font-bold">project_query</div>
                             <div className="text-gray-500">project_id: alpha</div>
                             <div className="text-primary mt-0.5">110ms</div>
                          </div>
                          <div className="pl-4 relative opacity-80">
                             <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary border-2 border-black"></div>
                             <div className="text-white font-bold">project_upload</div>
                             <div className="text-gray-500">docs/changes.md</div>
                             <div className="text-primary mt-0.5">45ms</div>
                          </div>
                          <div className="pl-4 relative opacity-50">
                             <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-gray-500 border-2 border-black"></div>
                             <div className="text-white font-bold">projects_list</div>
                             <div className="text-gray-500">storage scan</div>
                             <div className="text-yellow-500 mt-0.5">Processing...</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column */}
                 <div className="flex flex-col gap-2">
                    {/* Persona */}
                    <div className="bg-[#0a0f0c] border border-border-dark rounded p-2 space-y-2">
                       <div className="flex items-center justify-between text-gray-500 font-bold border-b border-white/5 pb-1">
                          <span className="flex items-center gap-1"><Bot size={10} /> PERSONA</span>
                          <Settings size={10} />
                       </div>
                       <div className="grid grid-cols-2 gap-y-1 text-[9px]">
                          <span className="text-gray-500">Role</span>
                          <span className="text-primary bg-primary/10 px-1 rounded w-fit">SRE_Lead</span>
                          <span className="text-gray-500">Temp</span>
                          <span className="text-white text-right">0.2</span>
                          <span className="text-gray-500">Ctx</span>
                          <span className="text-white text-right">4096t</span>
                          <span className="text-gray-500">Model</span>
                          <span className="text-white text-right">GPT-4o</span>
                       </div>
                    </div>

                    {/* Manifest */}
                    <div className="bg-[#0a0f0c] border border-border-dark rounded flex-1 p-2 overflow-hidden">
                       <div className="flex items-center gap-1 text-gray-500 font-bold border-b border-white/5 pb-1 mb-1">
                          <FileJson size={10} /> MANIFEST
                       </div>
                       <pre className="text-[9px] text-gray-400 leading-tight">
{`{
 "tools": [
  "health",
  "projects_list",
  "project_create",
  "project_delete",
  "project_upload",
  "project_query"
 ],
 "env": [
  "LIBRARIAN_HOME",
  "LIBRARIAN_STORAGE_PATH",
  "LIBRARIAN_LOG_DIR"
 ]
}`}
                       </pre>
                    </div>
                 </div>
              </div>

              {/* MCP Trace (Bottom) */}
              <div 
                 onClick={() => onNavigate('message-monitor')}
                 className="bg-black border border-border-dark rounded h-24 flex flex-col cursor-pointer hover:border-primary/30 transition-colors"
              >
                 <div className="flex items-center justify-between px-2 py-1 bg-white/5 border-b border-white/5">
                    <span className="font-bold text-gray-500 flex items-center gap-1">
                       <Activity size={10} /> MCP TRACE
                    </span>
                    <div className="flex gap-2">
                       <span className="text-primary bg-primary/10 px-1 rounded font-bold">STDIO</span>
                       <span className="text-gray-600">FILTER: ALL</span>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-1 space-y-1">
                    <div className="flex gap-2 font-mono text-[9px]">
                       <span className="text-gray-600">14:02:01.004</span>
                       <span className="text-green-500 font-bold w-6">{'<IN>'}</span>
                       <span className="text-gray-300 truncate">{`{"jsonrpc": "2.0", "method": "initialize...`}</span>
                    </div>
                    <div className="flex gap-2 font-mono text-[9px]">
                       <span className="text-gray-600">14:02:01.055</span>
                       <span className="text-blue-500 font-bold w-6">{'>OUT'}</span>
                       <span className="text-gray-300 truncate">{`{"jsonrpc": "2.0", "result": {"capabilit...`}</span>
                    </div>
                 </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                 <div className="flex-1 bg-[#0a0f0c] border border-border-dark rounded p-2 flex items-center gap-2">
                    <span className="text-green-500 font-bold">{'>'}</span>
                    <input className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 font-mono" placeholder="Inject command..." />
                 </div>
                 <button className="bg-surface-dark border border-white/10 rounded px-3 text-gray-400 hover:text-white">
                    <History size={14} />
                 </button>
                 <button className="bg-primary text-black rounded px-3 font-bold hover:bg-green-400">
                    <Send size={14} />
                 </button>
              </div>
           </div>
         )}
      </main>

      <BottomNav currentScreen="agent-center" onNavigate={onNavigate} />
    </div>
  );
};
