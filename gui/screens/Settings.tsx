import React, { useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, Copy } from 'lucide-react';
import { AppHeader } from '../components/Shared';
import { ScreenName } from '../types';
import { BridgeClient, ManifestStatus, SettingsResponse } from '../src/api/client';

interface Props {
  onNavigate: (screen: ScreenName) => void;
  currentScreen: ScreenName;
}

export const SettingsScreen: React.FC<Props> = ({ onNavigate, currentScreen }) => {
  const [notice, setNotice] = useState<string | null>(null);
  const [bridgeSettings, setBridgeSettings] = useState<SettingsResponse | null>(null);
  const [manifest, setManifest] = useState<ManifestStatus | null>(null);
  const [manifestDirDraft, setManifestDirDraft] = useState('');
  const [savingManifestDir, setSavingManifestDir] = useState(false);

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Copied to clipboard.');
      setTimeout(() => setNotice(null), 1500);
    } catch {
      setNotice('Copy failed. Select and copy manually.');
      setTimeout(() => setNotice(null), 2000);
    }
  };

  const zshCommand = 'echo \'export PATH="/path/to/sheshaMajorMcp-rlm/.venv/bin:$PATH"\' >> ~/.zshrc\nsource ~/.zshrc';
  const bashCommand = 'echo \'export PATH="/path/to/sheshaMajorMcp-rlm/.venv/bin:$PATH"\' >> ~/.bashrc\nsource ~/.bashrc';
  const windowsCommand = '$env:Path = "$env:Path;C:\\\\path\\\\to\\\\sheshaMajorMcp-rlm\\\\.venv\\\\Scripts"';

  useEffect(() => {
    const load = async () => {
      const [settingsResp, manifestResp] = await Promise.all([
        BridgeClient.getSettings(),
        BridgeClient.getManifest(),
      ]);
      setBridgeSettings(settingsResp);
      setManifest(manifestResp);
      if (settingsResp?.manifest_dir) {
        setManifestDirDraft(settingsResp.manifest_dir);
      } else if (manifestResp.manifest_dir) {
        setManifestDirDraft(manifestResp.manifest_dir);
      }
    };
    load();
  }, []);

  const manifestExpectedPath = useMemo(() => {
    if (manifest?.expected_path) return manifest.expected_path;
    if (!manifestDirDraft.trim()) return '';
    return `${manifestDirDraft.replace(/\/+$/, '')}/.librarian/manifest.json`;
  }, [manifest?.expected_path, manifestDirDraft]);

  const saveManifestDir = async () => {
    const value = manifestDirDraft.trim();
    if (!value) {
      setNotice('Manifest directory is required.');
      setTimeout(() => setNotice(null), 2000);
      return;
    }
    const ok = window.confirm(
      `Set manifest directory to:\n\n${value}\n\nThe bridge will look for:\n${manifestExpectedPath || '(computed on save)'}\n\nThis does not create the manifest. You still need to run:\n\nlibrarian install --manifest-dir "${value}"\n`
    );
    if (!ok) return;

    setSavingManifestDir(true);
    const resp = await BridgeClient.setManifestDir(value);
    setSavingManifestDir(false);
    if (!resp) {
      setNotice('Failed to update manifest directory (bridge disconnected or invalid path).');
      setTimeout(() => setNotice(null), 2500);
      return;
    }
    setBridgeSettings(resp);
    const manifestResp = await BridgeClient.getManifest();
    setManifest(manifestResp);
    setNotice('Manifest directory updated.');
    setTimeout(() => setNotice(null), 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display">
      <AppHeader
        title="Settings"
        showBack
        onBack={() => onNavigate('dashboard')}
        icon={<SettingsIcon size={20} className="text-primary" />}
        currentScreen={currentScreen}
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-6 space-y-6">
        {notice && (
          <div className="text-[10px] text-yellow-200 bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
            {notice}
          </div>
        )}

        <section className="bg-surface-dark border border-border-dark rounded-xl p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Add Librarian to PATH</div>
          <p className="text-xs text-gray-400">
            Replace <span className="font-mono">/path/to/sheshaMajorMcp-rlm</span> with your install location.
          </p>

          <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="text-[11px] text-gray-400">macOS (zsh)</div>
            <pre className="font-mono text-[11px] text-gray-300 whitespace-pre-wrap">{zshCommand}</pre>
            <button
              onClick={() => copyText(zshCommand)}
              className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
              title="Copy command"
            >
              <Copy size={12} />
              Copy command
            </button>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="text-[11px] text-gray-400">Linux (bash)</div>
            <pre className="font-mono text-[11px] text-gray-300 whitespace-pre-wrap">{bashCommand}</pre>
            <button
              onClick={() => copyText(bashCommand)}
              className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
              title="Copy command"
            >
              <Copy size={12} />
              Copy command
            </button>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="text-[11px] text-gray-400">Windows (PowerShell)</div>
            <pre className="font-mono text-[11px] text-gray-300 whitespace-pre-wrap">{windowsCommand}</pre>
            <button
              onClick={() => copyText(windowsCommand)}
              className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
              title="Copy command"
            >
              <Copy size={12} />
              Copy command
            </button>
          </div>
        </section>

        <section className="bg-surface-dark border border-border-dark rounded-xl p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Manifest Location</div>
          <p className="text-xs text-gray-400">
            The GUI reads <span className="font-mono">.librarian/manifest.json</span> via the local bridge. If the bridge
            was started from a different working directory, set the manifest directory here so it can find the file.
          </p>

          <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-gray-400">Current manifest-dir</div>
              <div
                className={`text-[10px] font-mono px-2 py-1 rounded border ${manifest?.exists ? 'border-green-500/30 text-green-200 bg-green-500/10' : 'border-yellow-500/30 text-yellow-200 bg-yellow-500/10'
                  }`}
                title={manifest?.exists ? 'Manifest file found' : 'Manifest file missing'}
              >
                {manifest?.exists ? 'FOUND' : 'MISSING'}
              </div>
            </div>
            <div className="text-[11px] text-gray-300 font-mono break-all" title="Bridge manifest directory">
              {bridgeSettings?.manifest_dir || manifest?.manifest_dir || '(bridge disconnected)'}
            </div>
            <div className="text-[11px] text-gray-400 mt-2">Expected manifest path</div>
            <div className="text-[11px] text-gray-300 font-mono break-all" title="Where the bridge will look">
              {manifestExpectedPath || '(unknown)'}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="text-[11px] text-gray-400">Set manifest-dir (folder path)</div>
            <input
              value={manifestDirDraft}
              onChange={(e) => setManifestDirDraft(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] font-mono text-gray-200 outline-none focus:border-primary/40"
              placeholder="/path/to/repo/root (or another folder)"
              title="Folder where .librarian/manifest.json should live"
            />
            <button
              onClick={saveManifestDir}
              disabled={savingManifestDir}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-primary text-black text-[11px] font-bold hover:bg-primary/90 disabled:opacity-60"
              title="Save manifest-dir to the bridge (requires bridge running)"
            >
              {savingManifestDir ? 'Saving…' : 'Save manifest-dir'}
            </button>
            <div className="text-[10px] text-gray-400" title="CLI command to generate the manifest">
              After setting, run: <span className="font-mono">librarian install --manifest-dir "{manifestDirDraft.trim() || '<path>'}"</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
