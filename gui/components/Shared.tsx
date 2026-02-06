import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Puzzle, 
  Bot, 
  MoreVertical, 
  ChevronLeft,
  Settings,
  Menu,
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
    return `flex flex-col items-center gap-1 cursor-pointer transition-all ${
      isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
    }`;
  };

  const getIconContainerClass = (screen: ScreenName) => {
    const isActive = currentScreen === screen;
    return `px-4 py-1 rounded-full transition-colors ${
      isActive ? 'bg-primary/10 text-primary' : 'text-gray-400'
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
        >
          <div className={getIconContainerClass(isStatusActive ? 'dashboard' : 'null' as any)}>
            <LayoutDashboard size={24} className={isStatusActive ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${isStatusActive ? 'text-primary' : 'text-gray-400'}`}>Status</span>
        </li>

        <li 
          className={getTabClass('cli')} 
          onClick={() => onNavigate('cli')}
        >
          <div className={getIconContainerClass('cli')}>
            <Terminal size={24} className={currentScreen === 'cli' ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${currentScreen === 'cli' ? 'text-primary' : 'text-gray-400'}`}>CLI</span>
        </li>

        <li 
          className={getTabClass('capabilities')} 
          onClick={() => onNavigate('capabilities')}
        >
          <div className={getIconContainerClass('capabilities')}>
            <Puzzle size={24} className={currentScreen === 'capabilities' ? "text-primary" : "text-gray-400"} />
          </div>
          <span className={`text-[10px] font-medium ${currentScreen === 'capabilities' ? 'text-primary' : 'text-gray-400'}`}>Caps</span>
        </li>

        <li 
          className={getTabClass('agent-center')} 
          onClick={() => onNavigate('agent-center')}
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

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title = "Shesha RLM", 
  showBack, 
  onBack, 
  rightAction,
  subtitle,
  icon
}) => {
  return (
    <header className="flex-none px-5 pt-12 pb-4 flex items-center justify-between z-40 bg-background-dark/95 backdrop-blur-md sticky top-0 border-b border-border-dark">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button 
            onClick={onBack}
            className="p-1 -ml-2 rounded-full hover:bg-white/10 transition-colors text-gray-300"
          >
            <ChevronLeft size={28} />
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
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300">
          <MoreVertical size={20} />
        </button>
      )}
    </header>
  );
};

export const ScanlineEffect = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10px] w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none opacity-20"></div>
);
