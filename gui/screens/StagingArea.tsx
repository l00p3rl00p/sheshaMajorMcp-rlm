import React, { useState } from 'react';
import { 
  ArrowLeft, 
  GripVertical, 
  Trash2, 
  Edit3, 
  Check, 
  Zap, 
  Plus,
  LayoutTemplate,
  ChevronDown
} from 'lucide-react';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

interface Fragment {
  id: number;
  type: 'CHAT' | 'CLIP' | 'MANUAL';
  content: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const StagingAreaScreen: React.FC<Props> = ({ onNavigate }) => {
  const [fragments, setFragments] = useState<Fragment[]>([
    {
      id: 1,
      type: 'CHAT',
      content: 'Summarize the latest ingestion warnings for project alpha and list rejected files.',
      color: 'text-[#a78bfa]',
      bgColor: 'bg-[#6d28d9]/20',
      borderColor: 'border-[#6d28d9]/30'
    },
    {
      id: 2,
      type: 'CLIP',
      content: 'Context: Use the local manifest (.librarian/manifest.json) to confirm paths and Docker availability.',
      color: 'text-[#34d399]',
      bgColor: 'bg-[#059669]/20',
      borderColor: 'border-[#059669]/30'
    },
    {
      id: 3,
      type: 'MANUAL',
      content: 'Format output as a short checklist with suggested CLI commands.',
      color: 'text-[#f472b6]',
      bgColor: 'bg-[#be185d]/20',
      borderColor: 'border-[#be185d]/30'
    }
  ]);

  const deleteFragment = (id: number) => {
    setFragments(fragments.filter(f => f.id !== id));
  };

  const addFragment = () => {
    const newFragment: Fragment = {
      id: Date.now(),
      type: 'MANUAL',
      content: 'New instruction fragment...',
      color: 'text-[#f472b6]',
      bgColor: 'bg-[#be185d]/20',
      borderColor: 'border-[#be185d]/30'
    };
    setFragments([...fragments, newFragment]);
  };

  const clearAll = () => {
    if (window.confirm('Clear all staged fragments?')) {
      setFragments([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d12] text-white font-display overflow-hidden relative">
      
      {/* Header */}
      <header className="flex-none h-16 px-4 flex items-center justify-between bg-[#121218] border-b border-white/5 z-20">
         <div className="flex items-center gap-3">
             <button 
                onClick={() => onNavigate('operator-chat')}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                title="Back to Operator Chat"
             >
                <ArrowLeft size={24} />
             </button>
             <div>
                <h1 className="text-base font-bold tracking-tight uppercase">Staging Matrix</h1>
                <p className="text-[10px] text-purple-400 font-mono tracking-wide">{fragments.length} FRAGMENTS ACTIVE</p>
             </div>
         </div>
         <button className="text-gray-500 hover:text-white transition-colors" title="More options">
            <ChevronDown size={20} />
         </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative custom-scrollbar">
         
         {fragments.map((fragment) => (
           <div key={fragment.id} className={`bg-[#181820] border ${fragment.type === 'MANUAL' ? fragment.borderColor : 'border-white/5'} rounded-xl p-4 relative group hover:border-purple-500/30 transition-all shadow-md animate-fade-in`}>
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-600 cursor-grab active:cursor-grabbing" />
                    <span className={`text-[10px] font-bold ${fragment.bgColor} ${fragment.color} px-2 py-0.5 rounded border ${fragment.borderColor}`}>{fragment.type === 'CHAT' ? 'FROM CHAT' : fragment.type === 'CLIP' ? 'FROM CLIP' : 'MANUAL'}</span>
                 </div>
                 <div className="flex gap-1">
                    <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/5" title="Edit fragment"><Edit3 size={14} /></button>
                    <button onClick={() => deleteFragment(fragment.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-white/5" title="Delete fragment"><Trash2 size={14} /></button>
                 </div>
              </div>
              <div className={fragment.type === 'MANUAL' ? "bg-black/30 rounded-lg p-3 border border-white/5 font-mono text-sm text-gray-200" : "text-sm text-gray-300 leading-relaxed font-mono"}>
                 {fragment.content}
              </div>
           </div>
         ))}

         {fragments.length === 0 && (
            <div className="text-center py-10 text-gray-600 font-mono text-sm">
               Staging area is empty.
            </div>
         )}

         {/* Add Area */}
         <div 
            onClick={addFragment}
            className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-white/20 hover:text-gray-500 transition-colors cursor-pointer active:scale-[0.99]"
            title="Add a new fragment"
         >
            <Plus size={24} />
            <span className="text-xs font-bold uppercase tracking-wide">Add Fragment</span>
         </div>

      </main>

      {/* Footer Actions */}
      <footer className="flex-none p-4 bg-[#121218] border-t border-white/5 z-20">
         <div className="flex items-center justify-between gap-4">
            <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors px-2" title="Save current fragments as a template">
               <LayoutTemplate size={18} />
               <span className="text-xs font-bold uppercase">Save Template</span>
            </button>
            <div className="h-4 w-px bg-white/10"></div>
            <button 
               onClick={clearAll}
               className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors px-2"
               title="Clear all fragments"
            >
               <Trash2 size={18} />
               <span className="text-xs font-bold uppercase">Clear All</span>
            </button>
         </div>
         <button 
            onClick={() => onNavigate('prompt-preview')}
            disabled={fragments.length === 0}
            className="w-full mt-4 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            title="Merge fragments and open prompt preview"
         >
            <Zap size={18} fill="currentColor" />
            MERGE & SEND
         </button>
      </footer>
    </div>
  );
};
