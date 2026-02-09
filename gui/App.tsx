import React, { useState, useEffect, useCallback } from 'react';
import { DashboardScreen } from './screens/Dashboard';
import { CliReferenceScreen } from './screens/CLI';
import { CapabilitiesScreen } from './screens/Capabilities';
import { PersistenceScreen } from './screens/Persistence';
import { AgentCenterScreen } from './screens/AgentCenter';
import { AgentConfigScreen } from './screens/AgentConfig';
import { LiveInteractionScreen } from './screens/LiveInteraction';
import { QueryConsoleScreen } from './screens/QueryConsole';
import { MessageMonitorScreen } from './screens/MessageMonitor';
import { OperatorChatScreen } from './screens/OperatorChat';
import { StagingAreaScreen } from './screens/StagingArea';
import { PromptPreviewScreen } from './screens/PromptPreview';
import { MountManagerScreen } from './screens/MountManager';
import { DocumentationScreen } from './screens/Documentation';
import { ScreenName } from './types';
import { SettingsScreen } from './screens/Settings';
import { HelpCircle, Activity } from 'lucide-react';
import { ErrorBoundary } from './components/Shared';
import { HealthPanel, HealthState } from './components/HealthPanel';
import { BridgeClient } from './src/api/client';
import { HelpOverlay } from './components/HelpOverlay';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [health, setHealth] = useState<HealthState>({
    bridgeStatus: 'unknown',
    dockerAvailable: false,
    manifestExists: false,
    manifestExpectedPath: '',
    manifestDir: '',
    manifestConfigured: false,
    lastChecked: null,
    checking: true,
  });
  const [showHealthPanel, setShowHealthPanel] = useState(true);
  const [showManifestPrompt, setShowManifestPrompt] = useState(false);
  const [isHelpOverlayOpen, setIsHelpOverlayOpen] = useState(false);

  const refreshHealth = useCallback(async () => {
    setHealth((prev) => ({ ...prev, checking: true }));
    try {
      const healthResp = await BridgeClient.checkHealth();
      const manifest = await BridgeClient.getManifest();
      setHealth({
        bridgeStatus: healthResp.status === 'active' ? 'active' : 'disconnected',
        dockerAvailable: healthResp.docker_available,
        manifestExists: manifest.exists,
        manifestExpectedPath: manifest.expected_path,
        manifestDir: manifest.manifest_dir,
        manifestConfigured: manifest.configured,
        lastChecked: new Date().toLocaleTimeString(),
        checking: false,
      });

      const dismissed = localStorage.getItem('shesha_manifest_prompt_dismissed') === '1';
      if (!dismissed && healthResp.status === 'active' && !manifest.exists && !manifest.configured) {
        setShowManifestPrompt(true);
        setIsHelpOverlayOpen(false);
        setShowHealthPanel(false);
      }
    } catch (error) {
      setHealth((prev) => ({
        ...prev,
        checking: false,
        bridgeStatus: 'disconnected',
      }));
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, [refreshHealth]);
  const toggleHelpOverlay = () => {
    setIsHelpOverlayOpen((prev) => {
      const next = !prev;
      if (next) {
        setShowHealthPanel(false);
        setShowManifestPrompt(false);
      }
      return next;
    });
  };

  const toggleHealthPanel = () => {
    setShowHealthPanel((prev) => {
      const next = !prev;
      if (next) {
        setIsHelpOverlayOpen(false);
        setShowManifestPrompt(false);
      }
      return next;
    });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'cli':
        return <CliReferenceScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'capabilities':
        return <CapabilitiesScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'persistence':
        return <PersistenceScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'documentation':
        return <DocumentationScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'agent-center':
        return <AgentCenterScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'agent-config':
        return <AgentConfigScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'live-interaction':
        return <LiveInteractionScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'query-console':
        return <QueryConsoleScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'message-monitor':
        return <MessageMonitorScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'operator-chat':
        return <OperatorChatScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'staging-area':
        return <StagingAreaScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'prompt-preview':
        return <PromptPreviewScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'mount-manager':
        return <MountManagerScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} currentScreen={currentScreen} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col shadow-2xl relative">
      {showHealthPanel && (
        <HealthPanel
          health={health}
          onRefresh={refreshHealth}
          onOpenBridge={() => setCurrentScreen('mount-manager')}
          onOpenSettings={() => setCurrentScreen('settings')}
          onClose={() => setShowHealthPanel(false)}
        />
      )}
      <ErrorBoundary>
        {renderScreen()}
      </ErrorBoundary>

      {/* Global Help Toggle */}
      <button
        onClick={toggleHelpOverlay}
        className="fixed top-4 right-4 z-[90] p-2 rounded-full bg-black/60 border border-white/10 text-gray-200 hover:text-primary hover:border-primary/30 transition-colors"
        title="Open detailed help for this screen"
      >
        <HelpCircle size={18} />
      </button>
      <button
        onClick={toggleHealthPanel}
        className="fixed top-4 right-16 z-[90] p-2 rounded-full bg-black/60 border border-white/10 text-gray-200 hover:text-primary hover:border-primary/30 transition-colors"
        title={showHealthPanel ? 'Hide health panel' : 'Show health panel'}
      >
        <Activity size={18} />
      </button>
      {isHelpOverlayOpen && (
        <HelpOverlay
          screen={currentScreen}
          onClose={() => setIsHelpOverlayOpen(false)}
        />
      )}

      {/* First-run Manifest Prompt */}
      {showManifestPrompt && (
        <div className="fixed inset-0 z-[88]">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => { }}
            title="Manifest setup required"
          />
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-[520px] bg-[#0f1210] border border-white/10 shadow-2xl rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Setup Required</div>
            <div className="mt-2 text-base font-bold text-white">Choose a manifest directory</div>
            <div className="mt-2 text-sm text-gray-200">
              The bridge could not find <span className="font-mono">.librarian/manifest.json</span>. Pick a folder to store it
              (typically your repo root), then run <span className="font-mono">librarian install</span> once.
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Expected location after you set it: <span className="font-mono break-all">{health.manifestExpectedPath || '(unknown)'}</span>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  localStorage.setItem('shesha_manifest_prompt_dismissed', '1');
                  setShowManifestPrompt(false);
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs hover:bg-white/10"
                title="Dismiss this prompt (you can configure later in Settings)"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('settings');
                  setShowManifestPrompt(false);
                }}
                className="px-3 py-2 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary/90"
                title="Open Settings to set manifest-dir"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
