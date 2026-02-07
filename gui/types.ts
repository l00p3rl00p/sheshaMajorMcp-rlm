export type ScreenName =
  | 'dashboard'
  | 'cli'
  | 'capabilities'
  | 'persistence'
  | 'agent-center'
  | 'agent-config'
  | 'live-interaction'
  | 'query-console'
  | 'message-monitor'
  | 'operator-chat'
  | 'staging-area'
  | 'styling-preview'
  | 'mount-manager'
  | 'prompt-preview'
  | 'documentation'
  | 'settings';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERR' | 'SYS' | 'START' | 'TOOL_USE' | 'STDIO' | 'THOUGHT';
  message: string;
  detail?: string;
  id?: string;
}

export interface ManifestEntity {
  id: string;
  type: string;
  state: string;
}

export interface McpTool {
  name: string;
  description: string;
  args: string;
  active: boolean;
  requiresContainer?: boolean;
}

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'STANDBY';
  tools: string[];
  color: string;
}
