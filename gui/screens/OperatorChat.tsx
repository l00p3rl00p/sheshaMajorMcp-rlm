/**
 * Operator Chat Screen
 * 
 * PROTOTYPE: A messaging interface mockup. Message history is kept in local component state.
 * Context menus and tool execution cards are simulated to demonstrate the intended user experience.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
   Menu,
   LayoutGrid,
   ChevronDown,
   Terminal,
   Bot,
   BrainCircuit,
   Mic,
   Send,
   Plus,
   X,
   Zap,
   Bookmark,
   Share,
   Layers,
   Copy,
   CheckCircle
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
   onNavigate: (screen: ScreenName) => void;
}

export const OperatorChatScreen: React.FC<Props> = ({ onNavigate }) => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
   const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number } | null>(null);
   const [inputText, setInputText] = useState('');
   const [messages, setMessages] = useState<any[]>([]);
   const [notification, setNotification] = useState<string | null>(null);
   const bottomRef = useRef<HTMLDivElement>(null);

   const handleLongPress = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
         visible: true,
         x: 0,
         y: 0
      });
   };

   const closeContextMenu = () => {
      setContextMenu(null);
   };

   const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 2000);
   };

   const handleSend = () => {
      if (!inputText.trim()) return;
      setMessages([...messages, { type: 'user', text: inputText }]);
      setInputText('');
      setTimeout(() => {
         if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
   };

   const handleContextAction = (action: string) => {
      closeContextMenu();
      if (action === 'stage') {
         onNavigate('staging-area');
      } else {
         showNotification(action);
      }
   };

   return (
      <div className="flex h-screen bg-black text-white font-display overflow-hidden relative">

         {/* Notification Toast */}
         {notification && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[80] bg-surface-dark/90 backdrop-blur border border-primary/20 text-primary px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
               <CheckCircle size={16} />
               <span className="text-xs font-bold">{notification}</span>
            </div>
         )}

         {/* Main Chat Area */}
         <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? '-translate-x-[20%]' : ''}`}>

            {/* Header */}
            <header className="flex-none h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#080c0a] z-20">
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => onNavigate('live-interaction')}
                     className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                     title="Back to Live Interaction"
                  >
                     <Menu size={24} />
                  </button>
                  <div className="flex flex-col">
                     <h1 className="text-base font-bold tracking-tight">Project Alpha Ops</h1>
                     <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">ONLINE</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <button
                     onClick={() => onNavigate('staging-area')}
                     className="p-2 rounded-lg bg-[#1a2e23] border border-primary/20 text-primary hover:bg-primary hover:text-black transition-colors"
                     title="Staging Matrix"
                  >
                     <Layers size={20} />
                  </button>
                  <button
                     onClick={() => setIsSidebarOpen(true)}
                     className="p-2 rounded-lg bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
                     title="Open context sidebar"
                  >
                     <LayoutGrid size={20} />
                  </button>
               </div>
            </header>

            {/* Chat Stream */}
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative custom-scrollbar">

               <div className="flex justify-center mb-6">
                  <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded-full">TODAY, 10:42 AM</span>
               </div>

               {/* User Message (Interactive) */}
               <div className="flex flex-col items-end gap-1 relative">
                  <span className="text-[10px] text-gray-500 font-bold pr-1">Developer</span>
                  <div className="flex gap-2 max-w-[85%]">
                     <div
                        onContextMenu={handleLongPress}
                        onClick={(e) => {
                           if (e.detail === 2) handleLongPress(e);
                        }}
                        className="bg-[#6d28d9] rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed shadow-lg cursor-pointer hover:brightness-110 transition-all select-none"
                        title="Double click or Right click for menu"
                     >
                        Summarize recent updates for project <span className="text-primary font-mono">alpha</span> and flag any ingestion warnings.
                     </div>
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 border-2 border-[#080c0a] overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                     </div>
                  </div>
               </div>

               {/* Thought Process (Collapsed) */}
               <div className="max-w-[85%] ml-10">
                  <div
                     onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                     className="bg-[#0f1210] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-all"
                     title={isThoughtExpanded ? 'Collapse thought process' : 'Expand thought process'}
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <BrainCircuit size={16} className="text-purple-400" />
                           <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Thought Process: Analysis Strategy</span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isThoughtExpanded ? 'rotate-180' : ''}`} />
                     </div>

                     {isThoughtExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400 font-mono space-y-2 animate-fade-in">
                           <p>1. Resolve project: <span className="text-white">alpha</span></p>
                           <p>2. Call <span className="text-primary">librarian:project_query</span> with a release summary prompt.</p>
                           <p>3. Cross-check ingestion warnings via the last upload trace.</p>
                           <p className="text-purple-400 italic">Context Check: Focus on the latest ingestion batch.</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Tool Execution Card */}
               <div className="max-w-[85%] ml-10">
                  <div className="bg-[#0f1210] border-l-4 border-primary rounded-r-lg p-3 flex items-center justify-between shadow-md relative overflow-hidden group">
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-white/5 rounded-lg">
                           <Terminal size={18} className="text-gray-300" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">librarian:project_query</span>
                           <span className="text-[10px] font-mono text-gray-400">project_id: alpha</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5 bg-[#1a2e23] px-2 py-1 rounded text-[10px] font-bold text-primary relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        DONE
                     </div>
                  </div>
               </div>

               {/* Agent Response (Interactive) */}
               <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] text-purple-400 font-bold">Shesha Agent</span>
                     <span className="bg-[#1a1a1a] text-gray-500 text-[9px] px-1.5 py-0.5 rounded border border-white/5">v0.3.1</span>
                  </div>
                  <div
                     onContextMenu={handleLongPress}
                     onClick={(e) => {
                        if (e.detail === 2) handleLongPress(e);
                     }}
                     className="bg-[#141416] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed shadow-lg max-w-[85%] text-gray-200 cursor-pointer hover:border-white/20 transition-colors"
                  >
                     <p className="mb-3">
                        I summarized the latest changes for project <span className="text-primary font-mono bg-primary/10 px-1 rounded">alpha</span> and detected one ingestion warning.
                     </p>
                     <p>
                        The warning shows a rejected file type in the last upload batch. Want me to list the rejected files and suggested fixes?
                     </p>
                  </div>
               </div>

               {/* Action Chips */}
               <div className="flex flex-wrap gap-2 ml-2">
                  <button onClick={() => showNotification('Fetching rejected files...')} className="flex items-center gap-2 bg-[#1a1a1a] border border-purple-500/30 text-xs font-medium px-4 py-2 rounded-full hover:bg-purple-500/10 hover:border-purple-500 transition-colors text-white" title="List rejected files (demo)">
                     <Bot size={14} className="text-purple-400" />
                     Yes, show rejected files
                  </button>
                  <button onClick={() => showNotification('Checking manifest status...')} className="bg-[#1a1a1a] border border-white/10 text-xs font-medium px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white" title="Check manifest status (demo)">
                     Check manifest status
                  </button>
               </div>

               {/* Added Messages */}
               {messages.map((msg, i) => (
                  <div key={i} className="flex flex-col items-end gap-1 animate-fade-in">
                     <span className="text-[10px] text-gray-500 font-bold pr-1">Developer</span>
                     <div className="flex gap-2 max-w-[85%]">
                        <div className="bg-[#6d28d9] rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed shadow-lg">
                           {msg.text}
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 border-2 border-[#080c0a] overflow-hidden">
                           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                     </div>
                  </div>
               ))}

               <div className="h-16" ref={bottomRef}></div>
            </main>

            {/* Input Bar */}
            <div className="flex-none p-4 bg-[#080c0a] border-t border-white/5 relative z-30">
               <div className="flex items-center gap-3">
                  <button className="p-3 rounded-full bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors" title="Attach context (demo)">
                     <Plus size={20} />
                  </button>
                  <div className="flex-1 relative">
                     <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message or use /"
                        className="w-full bg-[#141416] border border-white/10 rounded-full py-3.5 pl-5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                     />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white" title="Voice input (demo)">
                        <Mic size={18} />
                     </button>
                  </div>
                  <button onClick={handleSend} className="p-3 rounded-full bg-[#6d28d9] text-white hover:bg-[#5b21b6] transition-colors shadow-[0_0_15px_rgba(109,40,217,0.4)]" title="Send message">
                     <Send size={20} className="ml-0.5" />
                  </button>
               </div>
            </div>
         </div>

         {/* Rich Context Sidebar (Drawer) */}
         <div className={`absolute top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-[#0f1210] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer Header */}
            <div className="flex-none h-16 flex items-center justify-between px-4 border-b border-white/5">
               <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Context</h2>
               <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-md hover:bg-white/10 text-gray-400"
                  title="Close sidebar"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
               <section>
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Persona</h3>
                     <button onClick={() => showNotification('Persona config opened')} className="text-[10px] text-primary hover:underline" title="Change persona (demo)">Change</button>
                  </div>
                  <div className="bg-[#141416] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-900 to-black flex items-center justify-center border border-white/10">
                        <Zap size={20} className="text-primary" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">SRE Lead</h4>
                        <p className="text-[10px] text-gray-500">Full system access</p>
                     </div>
                  </div>
               </section>

               <section className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Clip Gallery</h3>
                     <span className="text-[10px] bg-white/5 px-1.5 rounded text-gray-500">3</span>
                  </div>
                  <div className="space-y-3">
                     <div className="bg-[#141416] border border-white/5 rounded-xl p-3 group hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-1.5">
                              <Terminal size={12} className="text-gray-500" />
                              <span className="text-[10px] font-bold text-gray-300">project_query</span>
                           </div>
                           <span className="text-[9px] text-gray-600 font-mono">10:41 AM</span>
                        </div>
                        <div className="bg-black/30 rounded p-2 mb-2">
                           <code className="text-[9px] text-gray-400 font-mono line-clamp-3">
                              Warning: rejected file type (.png) during upload batch...
                           </code>
                        </div>
                        <button onClick={() => {
                           setInputText(prev => prev + ' [Clip: sys_read_logs] ');
                           setIsSidebarOpen(false);
                        }} className="w-full py-1.5 bg-white/5 rounded-lg text-[10px] font-medium text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center gap-1" title="Add clip to chat input">
                           <Plus size={12} /> Add to Chat
                        </button>
                     </div>
                  </div>
               </section>
            </div>
         </div>

         {/* Overlay */}
         {isSidebarOpen && (
            <div
               onClick={() => setIsSidebarOpen(false)}
               className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
               title="Close sidebar"
            ></div>
         )}

         {/* Context Menu */}
         {contextMenu && (
            <>
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={closeContextMenu} title="Close context menu"></div>
               <div className="absolute z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-[#1a1a1a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-2 space-y-1">
                     <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => handleContextAction('Saved to Clips')}
                        title="Save message to Clips"
                     >
                        <span className="flex items-center gap-3"><Bookmark size={18} /> Save to Clips</span>
                        <span className="opacity-0"><ChevronDown size={16} /></span>
                     </button>
                     <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => handleContextAction('Added to Prompt')}
                        title="Use message as prompt"
                     >
                        <span className="flex items-center gap-3"><Terminal size={18} /> Use as Prompt</span>
                        <span className="opacity-0"><ChevronDown size={16} /></span>
                     </button>
                     <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => handleContextAction('Copied to clipboard')}
                        title="Copy message to clipboard"
                     >
                        <span className="flex items-center gap-3"><Copy size={18} /> Copy Text</span>
                        <span className="opacity-0"><ChevronDown size={16} /></span>
                     </button>
                     <div className="h-px bg-white/10 my-1 mx-2"></div>
                     <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => handleContextAction('stage')}
                        title="Add message to Staging Area"
                     >
                        <span className="flex items-center gap-3"><Layers size={18} /> Add to Staging Area</span>
                        <Layers size={16} className="text-gray-500" />
                     </button>
                     <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => handleContextAction('Shared')}
                        title="Share message (demo)"
                     >
                        <span className="flex items-center gap-3"><Share size={18} /> Share</span>
                        <span className="opacity-0"><ChevronDown size={16} /></span>
                     </button>
                  </div>
               </div>
            </>
         )}

      </div>
   );
};
