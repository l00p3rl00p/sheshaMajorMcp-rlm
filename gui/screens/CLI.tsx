import React from 'react';
import { 
  Search, 
  Copy, 
  Download, 
  ChevronDown 
} from 'lucide-react';
import { AppHeader, BottomNav } from '../components/Shared';
import { ScreenName } from '../types';

interface Props {
  onNavigate: (screen: ScreenName) => void;
}

export const CliReferenceScreen: React.FC<Props> = ({ onNavigate }) => {
  const commands = [
    {
      name: 'librarian install',
      tag: 'Core',
      description:
        'Initialize state, run the self-test, and write the local manifest + readme for operators.',
      example: 'librarian install --manifest-dir .',
      flags: [
        { flag: '--storage-path <path>', desc: 'Override storage directory.' },
        { flag: '--log-dir <path>', desc: 'Override log directory.' },
        { flag: '--manifest-dir <path>', desc: 'Where .librarian/manifest.json is written.' },
        { flag: '--skip-docker', desc: 'Skip Docker availability check.' },
        { flag: '--skip-sandbox', desc: 'Skip sandbox container ping test.' },
      ],
    },
    {
      name: 'librarian mcp',
      tag: 'Run',
      description:
        'Run the MCP server over stdio for client integrations (Claude Desktop, Cursor, etc.).',
      example: 'librarian mcp --storage-path /path/to/storage',
      flags: [
        { flag: '--storage-path <path>', desc: 'Override storage directory.' },
        { flag: '--log-dir <path>', desc: 'Override log directory.' },
        { flag: '--model <name>', desc: 'Override SHESHA_MODEL.' },
        { flag: '--api-key <key>', desc: 'Override SHESHA_API_KEY.' },
      ],
    },
    {
      name: 'librarian query',
      tag: 'Query',
      description:
        'Run a headless query against a project using Shesha RLM.',
      example: 'librarian query --project alpha "Summarize the latest release notes"',
      flags: [
        { flag: '--project <id>', desc: 'Target project ID (required).' },
        { flag: '--storage-path <path>', desc: 'Override storage directory.' },
        { flag: '--model <name>', desc: 'Override SHESHA_MODEL.' },
        { flag: '--api-key <key>', desc: 'Override SHESHA_API_KEY.' },
      ],
    },
    {
      name: 'librarian projects',
      tag: 'Manage',
      description:
        'Create, list, or delete projects stored in the local Librarian storage path.',
      example: 'librarian projects create alpha',
      flags: [
        { flag: 'list', desc: 'List projects.' },
        { flag: 'create <id>', desc: 'Create a project.' },
        { flag: 'delete <id>', desc: 'Delete a project.' },
        { flag: '--storage-path <path>', desc: 'Override storage directory.' },
      ],
    },
    {
      name: 'librarian upload',
      tag: 'Ingest',
      description:
        'Upload files or directories into a project for parsing and storage.',
      example: 'librarian upload --project alpha ./docs --recursive',
      flags: [
        { flag: '--project <id>', desc: 'Target project ID (required).' },
        { flag: '--recursive', desc: 'Recurse into directories.' },
        { flag: '--storage-path <path>', desc: 'Override storage directory.' },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <AppHeader 
        title="CLI Reference" 
        showBack 
        onBack={() => onNavigate('dashboard')}
      />

      {/* Search Bar */}
      <div className="px-4 pb-3 sticky top-[72px] z-30 bg-background-dark">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </span>
          <input 
            className="w-full bg-surface-dark border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-500 text-white" 
            placeholder="Search commands (e.g. install, query, upload)..." 
            type="text" 
            title="Filter commands"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-focus-within:flex">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-gray-400">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar snap-x sticky top-[120px] z-30 bg-background-dark">
        <button className="snap-start shrink-0 px-4 py-1.5 rounded-full bg-primary text-background-dark text-xs font-bold shadow-[0_0_20px_rgba(28,227,108,0.25)]" title="Show all commands">
          All Commands
        </button>
        <button className="snap-start shrink-0 px-4 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 text-gray-300 text-xs font-medium transition-colors" title="Filter install commands">
          Install
        </button>
        <button className="snap-start shrink-0 px-4 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 text-gray-300 text-xs font-medium transition-colors" title="Filter MCP commands">
          MCP
        </button>
        <button className="snap-start shrink-0 px-4 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 text-gray-300 text-xs font-medium transition-colors" title="Filter project management commands">
          Projects
        </button>
        <button className="snap-start shrink-0 px-4 py-1.5 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 text-gray-300 text-xs font-medium transition-colors" title="Filter upload commands">
          Upload
        </button>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-24">
        {commands.map((command) => (
          <article
            key={command.name}
            className="group bg-surface-dark rounded-xl border border-white/10 overflow-hidden hover:border-primary/40 transition-colors shadow-sm"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-base font-bold font-mono text-primary">{command.name}</h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                  {command.tag}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{command.description}</p>

              <div className="relative bg-[#0d1610] rounded-lg border border-white/5 p-3 group/code">
                <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Copy command">
                    <Copy size={16} />
                  </button>
                </div>
                <code className="block font-mono text-xs sm:text-sm text-gray-300 pr-8 break-all">
                  {command.example}
                </code>
              </div>
            </div>

            {command.flags?.length ? (
              <div className="border-t border-white/5 bg-white/[0.02]">
                <details className="group/details">
                  <summary className="flex items-center justify-between w-full p-3 cursor-pointer select-none text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-primary transition-colors">
                    <span>Options & Flags</span>
                    <ChevronDown size={16} className="transform group-open/details:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      {command.flags.map((flag) => (
                        <div key={flag.flag} className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2">
                          <div className="shrink-0 font-mono text-primary font-medium text-xs">{flag.flag}</div>
                          <div className="flex-1">
                            <p className="text-gray-300 text-xs">{flag.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            ) : null}
          </article>
        ))}
      </main>

      <button className="fixed bottom-24 right-6 h-14 w-14 flex items-center justify-center bg-primary text-background-dark rounded-full shadow-[0_0_20px_rgba(28,227,108,0.4)] hover:scale-110 active:scale-95 transition-all z-40 group" title="Export command list">
        <Download size={24} />
      </button>

      <BottomNav currentScreen="cli" onNavigate={onNavigate} />
    </div>
  );
};
