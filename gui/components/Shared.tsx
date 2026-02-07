import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Puzzle,
  Bot,
  MoreVertical,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getTabClass = (screen: ScreenName) => {
    const isActive = currentScreen === screen;
    return `flex flex-col items-center gap-1 cursor-pointer transition-all ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
      }`;
  };

  const getIconContainerClass = (screen: ScreenName) => {
    const isActive = currentScreen === screen;
    return `px-4 py-1 rounded-full transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400'
      }`;
  };

  // Helper to determine active state for grouped screens
  const isAgentActive = ['agent-center', 'agent-config', 'live-interaction'].includes(currentScreen);
  const isStatusActive = ['dashboard', 'persistence'].includes(currentScreen);

  return (
    <nav className="flex-none bg-surface-dark/90 backdrop-blur-lg border-t border-border-dark pb-6 pt-3 px-6 sticky bottom-0 z-50">
      <ul className="flex justify-between items-center w-full">
        <li
          className={getTabClass('dashboard')}
          onClick={() => onNavigate('dashboard')}
          title="Go to Dashboard"
        >
          <div className={getIconContainerClass(isStatusActive ? 'dashboard' : 'null' as any)}>
            <LayoutDashboard size={24} className={isStatusActive ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${isStatusActive ? 'text-primary' : 'text-gray-400'}`}>Status</span>
        </li>

        <li
          className={getTabClass('cli')}
          onClick={() => onNavigate('cli')}
          title="Go to CLI Reference"
        >
          <div className={getIconContainerClass('cli')}>
            <Terminal size={24} className={currentScreen === 'cli' ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${currentScreen === 'cli' ? 'text-primary' : 'text-gray-400'}`}>CLI</span>
        </li>

        <li
          className={getTabClass('capabilities')}
          onClick={() => onNavigate('capabilities')}
          title="Go to Capabilities"
        >
          <div className={getIconContainerClass('capabilities')}>
            <Puzzle size={24} className={currentScreen === 'capabilities' ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${currentScreen === 'capabilities' ? 'text-primary' : 'text-gray-400'}`}>Caps</span>
        </li>

        <li
          className={getTabClass('agent-center')}
          onClick={() => onNavigate('agent-center')}
          title="Go to Agent Center"
        >
          <div className={getIconContainerClass(isAgentActive ? 'agent-center' : 'null' as any)}>
            <Bot size={24} className={isAgentActive ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${isAgentActive ? 'text-primary' : 'text-gray-400'}`}>Agents</span>
        </li>
      </ul>
    </nav>
  );
};

export const NAV_GROUPS: { label: string; items: { id: ScreenName; label: string }[] }[] = [
  {
    label: 'System',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'capabilities', label: 'Capabilities' },
      { id: 'persistence', label: 'Persistence' },
    ],
  },
  {
    label: 'Setup',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'cli', label: 'CLI' },
      { id: 'documentation', label: 'Docs' },
    ],
  },
  {
    label: 'Ingestion',
    items: [
      { id: 'mount-manager', label: 'Mounts' },
      { id: 'staging-area', label: 'Staging' },
    ],
  },
  {
    label: 'Models',
    items: [
      { id: 'query-console', label: 'Query' },
      { id: 'prompt-preview', label: 'Prompt' },
      { id: 'operator-chat', label: 'Chat' },
      { id: 'agent-center', label: 'Agents' },
      { id: 'agent-config', label: 'Config' },
      { id: 'live-interaction', label: 'Live' },
    ],
  },
  {
    label: 'Logs',
    items: [{ id: 'message-monitor', label: 'Messages' }],
  },
];

interface HeaderTabsProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const HeaderTabs: React.FC<HeaderTabsProps> = ({ currentScreen, onNavigate }) => (
  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
    {NAV_GROUPS.map((group) => (
      <div
        key={group.label}
        className="flex items-center gap-2 pr-4 border-r border-white/10 last:border-r-0"
      >
        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          {group.label}
        </span>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
          {group.items.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${isActive
                  ? 'bg-primary text-black'
                  : 'text-gray-300 hover:bg-white/10'
                  }`}
                title={`Go to ${item.label}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  currentScreen?: ScreenName;
  onNavigate?: (screen: ScreenName) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = "Shesha RLM",
  showBack,
  onBack,
  rightAction,
  subtitle,
  icon,
  currentScreen,
  onNavigate
}) => {
  return (
    <header className="flex-none px-5 pt-4 pb-3 flex flex-col gap-2 z-40 bg-background-dark/95 backdrop-blur-md sticky top-0 border-b border-border-dark">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-1 -ml-2 rounded-full hover:bg-white/10 transition-colors text-gray-300"
              title="Go back"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            icon ? (
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                {icon}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
            ) : (
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="text-primary" size={20} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
            )
          )}

          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-white">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 font-mono mt-1">{subtitle}</p>}
          </div>
        </div>

        {rightAction || (
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300" title="More actions">
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      {currentScreen && onNavigate && (
        <HeaderTabs currentScreen={currentScreen} onNavigate={onNavigate} />
      )}
    </header>
  );
};

export const ScanlineEffect = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10px] w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none opacity-20"></div>
);

/**
 * Basic Error Boundary to prevent the entire app from crashing if a screen fails
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  public state: { hasError: boolean };
  public props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6">A component failed to render. This is common in prototypes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-black font-bold rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
