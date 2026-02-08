/**
 * Agent Configuration Screen
 * 
 * Displays MCP tool capabilities fetched from the CLI backend.
 * This is a READ-ONLY view of CLI-owned definitions.
 * GUI does not duplicate or modify these definitions.
 */
import React, { useState, useEffect } from 'react';
import {
   ChevronLeft,
   MoreVertical,
   Terminal,
   Wrench,
   Info,
   Loader2
} from 'lucide-react';
import { ScreenName } from '../types';
import { HeaderTabs } from '../components/Shared';
import { BridgeClient, ToolInfo } from '../src/api/client';

interface Props {
   onNavigate: (screen: ScreenName) => void;
   currentScreen: ScreenName;
}

export const AgentConfigScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
   const [tools, setTools] = useState<ToolInfo[]>([]);
   const [systemPromptPreview, setSystemPromptPreview] = useState<string>('');
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchCapabilities = async () => {
         setIsLoading(true);
         const data = await BridgeClient.getCapabilities();
         if (data) {
            setTools(data.tools);
            setSystemPromptPreview(data.system_prompt_preview);
         }
         setIsLoading(false);
      };
      fetchCapabilities();
   }, []);

   return (
      <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
         <header className="flex flex-col gap-2 p-4 pb-2 justify-between sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-border-dark/30">
            <div className="flex items-center justify-between">
               <button
                  onClick={() => onNavigate('agent-center')}
                  className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  title="Back to Agent Center"
               >
                  <ChevronLeft size={24} />
               </button>
               <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">MCP Capabilities</h2>
               <button className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors" title="More actions">
                  <MoreVertical size={24} />
               </button>
            </div>
            <HeaderTabs currentScreen={currentScreen} onNavigate={onNavigate} />
         </header>

         {/* Info Banner */}
         <div className="mx-4 mt-4 p-3 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-start gap-3">
            <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-200">
               This view shows MCP tools defined by the CLI. These are read-only; the GUI displays what the CLI provides.
            </p>
         </div>

         <main className="flex-1 flex flex-col gap-6 pb-8 px-4 pt-4">
            {isLoading ? (
               <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary" />
               </div>
            ) : (
               <>
                  {/* System Prompt Preview */}
                  <section className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <h3 className="text-white text-base font-bold flex items-center gap-2">
                           <Terminal className="text-primary" size={20} />
                           System Prompt (Preview)
                        </h3>
                        <span className="text-xs text-gray-400 font-mono">prompts/system.md</span>
                     </div>
                     <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-[#254632] rounded-xl opacity-30 blur transition duration-200"></div>
                        <div className="relative w-full rounded-xl text-sm font-mono leading-relaxed bg-[#0d1612] text-[#d4ffe5] border border-[#356448] min-h-[160px] p-4 shadow-inner whitespace-pre-wrap overflow-auto max-h-[300px]">
                           {systemPromptPreview || '[Not available]'}
                        </div>
                     </div>
                  </section>

                  {/* Tool Definitions */}
                  <section className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <h3 className="text-white text-base font-bold flex items-center gap-2">
                           <Wrench className="text-primary" size={20} />
                           MCP Tools ({tools.length})
                        </h3>
                        <span className="text-xs text-gray-400">From CLI _tool_defs()</span>
                     </div>
                     <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden divide-y divide-border-dark/50">
                        {tools.length === 0 ? (
                           <div className="p-4 text-center text-gray-400">No tools available</div>
                        ) : (
                           tools.map((tool) => (
                              <div
                                 key={tool.name}
                                 className="p-4 flex items-center justify-between"
                              >
                                 <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white font-mono">{tool.name}</span>
                                    <span className="text-xs text-[#94c7a8]">{tool.description}</span>
                                 </div>
                                 <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">MCP</span>
                              </div>
                           ))
                        )}
                     </div>
                  </section>
               </>
            )}
         </main>
      </div>
   );
};
