import React, { useState } from 'react';
import {
   ArrowLeft,
   Settings,
   CheckCircle2,
   AlertCircle,
   Play,
   Activity,
   ChevronDown,
   Clock
} from 'lucide-react';
import { ScreenName } from '../types';
import { HeaderTabs } from '../components/Shared';
import { useBridgeEvents } from '../src/hooks/useBridgeEvents';
import { BridgeClient, BridgeEvent } from '../src/api/client';

interface Props {
   onNavigate: (screen: ScreenName) => void;
   currentScreen: ScreenName;
}

export const MessageMonitorScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
   const [activeFilter, setActiveFilter] = useState('LIVE');
   const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
   const events = useBridgeEvents(50);

   const toggleNode = (id: string) => {
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

   const filteredEvents = events.filter(e => {
      if (activeFilter === 'LIVE') return true;
      if (activeFilter === 'Success') return e.type === 'res';
      if (activeFilter === 'Errors') return e.type === 'err';
      if (activeFilter === 'Docker') return e.method === 'health'; // approx
      if (activeFilter === 'Librarian') return e.method.startsWith('project_');
      return true;
   });

   const triggerDemoTrace = async () => {
      // fire a few requests to demonstrate traffic
      await BridgeClient.checkHealth();
      await BridgeClient.getManifest();
   };

   return (
      <div className="flex flex-col min-h-screen bg-[#050a07] text-white font-display relative overflow-hidden">
         {/* Grid Background */}
         <div className="absolute inset-0 z-0" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
         }}></div>

         <header className="flex flex-col gap-2 px-4 py-3 relative z-20">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button onClick={() => onNavigate('agent-center')} className="hover:bg-white/10 p-1 rounded-full transition-colors" title="Back to Agent Center">
                     <ArrowLeft size={24} className="text-white" />
                  </button>
                  <h1 className="text-xl font-bold">Message Monitor</h1>
               </div>
               <button className="text-gray-400 hover:text-white" title="Open settings">
                  <Settings size={24} />
               </button>
            </div>
            <HeaderTabs currentScreen={currentScreen} onNavigate={onNavigate} />
         </header>

         {/* Filters */}
         <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar relative z-20">
            <button onClick={() => setActiveFilter('LIVE')} className={getFilterClass('LIVE')} title="Show live traffic">
               <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'LIVE' ? 'bg-black' : 'bg-green-500'} animate-pulse`}></span>
               LIVE
            </button>
            <button onClick={() => setActiveFilter('Docker')} className={getFilterClass('Docker')} title="Filter Docker-related traffic">
               Docker
            </button>
            <button onClick={() => setActiveFilter('Librarian')} className={getFilterClass('Librarian')} title="Filter Librarian traffic">
               Librarian
            </button>
            <button onClick={() => setActiveFilter('Success')} className={getFilterClass('Success', 'text-green-400', 'bg-green-500 text-black')} title="Filter successful responses">
               <CheckCircle2 size={12} /> Success
            </button>
            <button onClick={() => setActiveFilter('Errors')} className={getFilterClass('Errors', 'text-red-400', 'bg-red-500 text-white')} title="Filter errors">
               Errors
            </button>
         </div>

         <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar p-4 min-h-[600px]">
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/5 -translate-x-1/2 z-0"></div>

            {filteredEvents.length === 0 && (
               <div className="flex flex-col items-center justify-center pt-20 relative z-10 opacity-50">
                  <Activity size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-500 font-mono text-sm">No recent traffic captured.</p>
                  <button onClick={triggerDemoTrace} className="mt-4 text-primary hover:underline text-xs">Trigger Probe</button>
               </div>
            )}

            <div className="flex flex-col gap-6 relative pb-24 max-w-lg mx-auto">
               {filteredEvents.map((event) => (
                  <div key={event.id + event.type} className="relative w-full animate-fade-in">
                     {/* Time Badge */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a110d] border border-white/10 rounded-full px-2 py-0.5 text-[8px] font-mono text-gray-500 z-10 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                     </div>

                     {/* Left Side: Requests */}
                     {event.type === 'req' && (
                        <div className="mr-[55%] relative">
                           <svg className="absolute top-4 -right-6 w-12 h-8 pointer-events-none z-0 text-blue-500/30">
                              <path d="M0,4 C20,4 20,20 48,20" fill="none" stroke="currentColor" strokeWidth="1" />
                              <circle cx="48" cy="20" r="2" fill="currentColor" />
                           </svg>
                           <div className="bg-[#0a110d] border border-blue-500/30 rounded-lg p-3 relative group hover:border-blue-500/60 transition-colors">
                              <div className="absolute -right-1 top-4 w-2 h-2 rounded-full bg-blue-500"></div>
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-bold text-blue-400 uppercase">Req</span>
                                 <span className="text-[9px] font-mono text-gray-500">ID: {event.id}</span>
                              </div>
                              <h3 className="text-sm font-bold text-white mb-0.5">{event.method}</h3>
                              {event.payload && (
                                 <div className="mt-2 text-[9px] font-mono text-gray-400 truncate opacity-70 group-hover:opacity-100">
                                    {JSON.stringify(event.payload).slice(0, 40)}...
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Right Side: Responses / Errors */}
                     {(event.type === 'res' || event.type === 'err') && (
                        <div className="ml-[55%] relative">
                           <svg className="absolute top-4 -left-6 w-12 h-8 pointer-events-none z-0 text-white/10">
                              <path d="M48,4 C28,4 28,20 0,20" fill="none" class={event.type === 'res' ? "stroke-green-500/30" : "stroke-red-500/30"} strokeWidth="1" />
                              <circle cx="0" cy="20" r="2" class={event.type === 'res' ? "fill-green-500/30" : "fill-red-500/30"} />
                           </svg>

                           <div
                              onClick={() => toggleNode(event.id)}
                              className={`bg-[#0a110d] border ${event.type === 'res' ? 'border-green-500/30' : 'border-red-500/30'} rounded-lg p-3 relative cursor-pointer hover:bg-white/5 transition-colors`}
                           >
                              <div className={`absolute -left-1 top-4 w-2 h-2 rounded-full ${event.type === 'res' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`text-[10px] font-bold uppercase ${event.type === 'res' ? 'text-green-400' : 'text-red-400'}`}>
                                    {event.type === 'res' ? 'Res' : 'Err'}
                                 </span>
                                 <span className="text-[9px] font-mono text-gray-500">{event.duration}ms</span>
                              </div>

                              <div className="flex items-center gap-1.5 mb-2">
                                 {event.type === 'res' ? (
                                    <CheckCircle2 size={14} className="text-green-500" />
                                 ) : (
                                    <AlertCircle size={14} className="text-red-500" />
                                 )}
                                 <span className="text-xs font-bold text-white">{event.method}</span>
                              </div>

                              <div className="text-[9px] text-gray-500 flex items-center gap-1 mt-1">
                                 PAYLOAD <span className={`text-[8px] transition-transform ${expandedNodes.has(event.id) ? 'rotate-180' : 'rotate-90'}`}>▶</span>
                              </div>

                              {expandedNodes.has(event.id) && (
                                 <div className="mt-2 pt-2 border-t border-white/10 font-mono text-[9px] text-gray-300 overflow-x-auto">
                                    {JSON.stringify(event.payload, null, 2)}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </main>

         {/* FAB */}
         <div className="absolute bottom-6 right-6 z-30">
            <button
               onClick={triggerDemoTrace}
               className="w-14 h-14 rounded-full bg-primary text-black shadow-[0_0_20px_rgba(28,227,108,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
               title="Trigger Demo Trace"
            >
               <Play size={24} fill="currentColor" className="ml-1" />
            </button>
         </div>
      </div>
   );
};
