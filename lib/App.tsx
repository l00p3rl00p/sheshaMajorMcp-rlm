import React, { useState } from 'react';
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
import { DataIngestionScreen } from './screens/DataIngestion';
import { IngestionValidationScreen } from './screens/IngestionValidation';
import { ScreenName } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');

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
      case 'data-ingestion':
        return <DataIngestionScreen onNavigate={setCurrentScreen} />;
      case 'ingestion-validation':
        return <IngestionValidationScreen onNavigate={setCurrentScreen} />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col shadow-2xl">
      {renderScreen()}
    </div>
  );
};

export default App;
