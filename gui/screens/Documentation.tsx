/**
 * Documentation Screen
 * 
 * PROTOTYPE: This screen currently loads documentation from the repository roots via ?raw imports
 * or allows manual file upload for previewing. In production, this would fetch from a central registry.
 */
import React, { useMemo, useState } from 'react';
import { BookOpen, UploadCloud, RefreshCw, FileText, Terminal } from 'lucide-react';
import { AppHeader, BottomNav } from '../components/Shared';
import { ScreenName } from '../types';

// Declare raw module types
// @ts-ignore
import readmeText from '../../mcp-server-readme.md?raw';
// @ts-ignore
import mcpSource from '../../src/shesha/librarian/mcp.py?raw';

interface Props {
  onNavigate: (screen: ScreenName) => void;
  currentScreen: ScreenName;
}

const extractCommands = (text: string): string[] => {
  const blocks = Array.from(text.matchAll(/```bash([\s\S]*?)```/g));
  const lines = blocks
    .flatMap((match) => match[1].split('\n'))
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  return Array.from(new Set(lines));
};

const extractMcpTools = (text: string): string[] => {
  const tools = Array.from(text.matchAll(/name=\"([a-zA-Z0-9_]+)\"/g)).map((m) => m[1]);
  return Array.from(new Set(tools));
};

export const DocumentationScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
  const [overrideText, setOverrideText] = useState<string | null>(null);
  const sourceText = overrideText ?? readmeText;
  const commands = useMemo(() => extractCommands(sourceText), [sourceText]);
  const mcpTools = useMemo(() => extractMcpTools(mcpSource), []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setOverrideText(String(reader.result ?? ''));
    };
    reader.onerror = () => {
      console.error('Failed to read documentation file');
      alert('Failed to read documentation file. Please try again.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <AppHeader
        title="Documentation"
        subtitle="Loaded from mcp-server-readme.md"
        rightAction={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary cursor-pointer" title="Load a generated readme from disk">
              <UploadCloud size={16} />
              Load File
              <input
                type="file"
                accept=".md,.txt"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
            <button
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-primary transition-colors"
              title="Reset to repo snapshot"
              onClick={() => setOverrideText(null)}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        }
        currentScreen={currentScreen}
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-6 space-y-6">
        <section className="rounded-xl bg-surface-dark border border-border-dark p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
            <BookOpen size={14} />
            Commands (CLI + MCP)
          </div>
          <p className="text-xs text-gray-400">
            This list is generated from the current <span className="font-mono text-gray-300">mcp-server-readme.md</span> snapshot.
            Load a newer generated file to refresh.
          </p>
        </section>

        <section className="space-y-3">
          {commands.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-yellow-200 text-sm">
              No commands found. Load a generated readme or ensure the CLI installer has created one.
            </div>
          ) : (
            commands.map((cmd) => (
              <div key={cmd} className="flex items-start gap-3 rounded-xl border border-border-dark bg-surface-dark p-3">
                <div className="p-2 rounded-lg bg-black/30 text-primary">
                  <FileText size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Command</div>
                  <div className="font-mono text-sm text-white break-all">{cmd}</div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rounded-xl bg-surface-dark border border-border-dark p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
            <Terminal size={14} />
            MCP Tools (From Source)
          </div>
          <div className="text-xs text-gray-500">Extracted from `src/shesha/librarian/mcp.py`.</div>
          <div className="flex flex-wrap gap-2 pt-2">
            {mcpTools.map((tool) => (
              <span key={tool} className="px-2 py-1 rounded bg-black/30 border border-border-dark text-xs font-mono text-gray-200">
                {tool}
              </span>
            ))}
          </div>
        </section>
      </main>

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
    </div>
  );
};
