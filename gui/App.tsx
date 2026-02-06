import React, { useMemo, useState } from 'react';
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
import { HelpCircle, Menu } from 'lucide-react';
import { ErrorBoundary } from './components/Shared';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const helpText = useMemo<Record<ScreenName, string>>(
    () => ({
      dashboard: 'High-level system status. Use this to validate MCP readiness and Docker availability.',
      cli: 'Reference the actual CLI commands and flags for Librarian operations.',
      capabilities: 'See available MCP tools and environment constraints.',
      persistence: 'Inspect manifest, storage, and logs. Read-only visibility layer.',
      'agent-center': 'Operator command center with reframe modes and quick access to tracing.',
      'agent-config': 'Configure personas and tool access at a glance.',
      'live-interaction': 'Trace live MCP thought/tool flow. Read-only view.',
      'query-console': 'Compose and preview project queries before running via CLI.',
      'message-monitor': 'Visualize MCP request/response pairs and errors.',
      'operator-chat': 'Operator chat view with tool cards and clip gallery.',
      'staging-area': 'Build multi-step prompts from clips and fragments.',
      'prompt-preview': 'Token-aware prompt preview before execution.',
      'mount-manager': 'Manage local directory mounts/sources for observation.',
      'styling-preview': 'Preview design system components.',
      documentation: 'Generated command list from mcp-server-readme.md (load a newer file to refresh).',
    }),
    []
  );

  const navItems: { id: ScreenName; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cli', label: 'CLI Reference' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'persistence', label: 'Persistence' },
    { id: 'documentation', label: 'Documentation' },
    { id: 'agent-center', label: 'Agent Center' },
    { id: 'agent-config', label: 'Agent Config' },
    { id: 'live-interaction', label: 'Live Interaction' },
    { id: 'query-console', label: 'Query Console' },
    { id: 'message-monitor', label: 'Message Monitor' },
    { id: 'operator-chat', label: 'Operator Chat' },
    { id: 'staging-area', label: 'Staging Area' },
    { id: 'prompt-preview', label: 'Prompt Preview' },
    { id: 'mount-manager', label: 'Mount Manager' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} />;
      case 'cli':
        return <CliReferenceScreen onNavigate={setCurrentScreen} />;
      case 'capabilities':
        return <CapabilitiesScreen onNavigate={setCurrentScreen} />;
      case 'persistence':
        return <PersistenceScreen onNavigate={setCurrentScreen} />;
      case 'documentation':
        return <DocumentationScreen onNavigate={setCurrentScreen} />;
      case 'agent-center':
        return <AgentCenterScreen onNavigate={setCurrentScreen} />;
      case 'agent-config':
        return <AgentConfigScreen onNavigate={setCurrentScreen} />;
      case 'live-interaction':
        return <LiveInteractionScreen onNavigate={setCurrentScreen} />;
      case 'query-console':
        return <QueryConsoleScreen onNavigate={setCurrentScreen} />;
      case 'message-monitor':
        return <MessageMonitorScreen onNavigate={setCurrentScreen} />;
      case 'operator-chat':
        return <OperatorChatScreen onNavigate={setCurrentScreen} />;
      case 'staging-area':
        return <StagingAreaScreen onNavigate={setCurrentScreen} />;
      case 'prompt-preview':
        return <PromptPreviewScreen onNavigate={setCurrentScreen} />;
      case 'mount-manager':
        return <MountManagerScreen onNavigate={setCurrentScreen} />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col shadow-2xl relative">
      <ErrorBoundary>
        {renderScreen()}
      </ErrorBoundary>

      {/* Global Navigation Toggle */}
      <button
        onClick={() => setIsNavOpen(true)}
        className="fixed top-4 left-4 z-[90] p-2 rounded-full bg-black/60 border border-white/10 text-gray-200 hover:text-primary hover:border-primary/30 transition-colors"
        title="Open global navigation"
      >
        <Menu size={18} />
      </button>

      {/* Global Help Toggle */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed top-4 right-4 z-[90] p-2 rounded-full bg-black/60 border border-white/10 text-gray-200 hover:text-primary hover:border-primary/30 transition-colors"
        title="Open help for this screen"
      >
        <HelpCircle size={18} />
      </button>

      {/* Navigation Drawer */}
      {isNavOpen && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsNavOpen(false)}
            title="Close navigation"
          />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#0f1210] border-r border-white/10 shadow-2xl p-4 overflow-y-auto">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Jump To</div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentScreen(item.id);
                    setIsNavOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${currentScreen === item.id
                    ? 'border-primary/40 text-primary bg-primary/10'
                    : 'border-white/10 text-gray-300 hover:border-primary/30 hover:text-white'
                    }`}
                  title={`Go to ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[85]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsHelpOpen(false)}
            title="Close help"
          />
          <div className="absolute top-16 right-6 w-[320px] bg-[#0f1210] border border-white/10 shadow-2xl rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Help</div>
            <div className="text-sm text-gray-200">{helpText[currentScreen]}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
