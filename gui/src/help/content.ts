import { ScreenName } from '../../types';

export interface HelpEntry {
  heading: string;
  description: string[];
  actions?: string[];
}

export const helpContent: Record<ScreenName, HelpEntry> = {
  dashboard: {
    heading: 'Dashboard Quick Start',
    description: [
      'Overview of bridge health, Docker availability, and manifest sync.',
      'Use the floating Agent button to jump into the agent center or inspections.',
      'Status tiles show what dependencies are healthy and what to do if they are not.',
    ],
    actions: [
      'Click the Agent Center FAB to observe live MCP/agent activity.',
      'Toggle the Health Audit panel to re-run dependency checks.',
    ],
  },
  cli: {
    heading: 'CLI Reference',
    description: [
      'Shows canonical `librarian` commands and flags for local workflows.',
      'Commands run from the shell, not the browser—use the provided PATH helpers if you need `librarian` globally.',
    ],
    actions: ['Copy commands into your terminal; run `librarian bridge` + `librarian gui` after installation.'],
  },
  capabilities: {
    heading: 'Capabilities Overview',
    description: [
      'Lists MCP tools, throughput limits, and degraded features such as sandboxed queries.',
      'Each card explains what the tool does and what parameters it expects.',
    ],
    actions: ['Review Docker status before attempting a capability that requires sandboxed execution.'],
  },
  persistence: {
    heading: 'Persistence Insights',
    description: [
      'Manifest inspector shows what state was captured at install time.',
      'Storage/log tiles show resolved paths; nothing is writable from this view.',
    ],
    actions: ['Use the CLI `librarian install`/`librarian projects ...` commands described at the bottom of this README.'],
  },
  documentation: {
    heading: 'Generated Commands',
    description: ['Mirror commands from `mcp-server-readme.md` inside the GUI reference panel.'],
  },
  'agent-center': {
    heading: 'Agent Center',
    description: [
      'Primary hub for agents and tool-flow monitoring.',
      'Trace each tool invocation to see what CLI commands were executed.',
    ],
    actions: ['Use the audit logs here before you replicate expertise on the CLI.'],
  },
  'agent-config': {
    heading: 'Agent Config',
    description: ['Define personas, assign tool access, and set guardrails for each agent.'],
  },
  'live-interaction': {
    heading: 'Live Interaction',
    description: ['Live trace of the running MCP loop—watch new steps being emitted in realtime.'],
  },
  'query-console': {
    heading: 'Query Console',
    description: ['Compose questions before sending them to the bridge; use the same project IDs as in Mount Manager.'],
  },
  'message-monitor': {
    heading: 'Message Monitor',
    description: ['Shows raw request/response pairs for debugging transport issues.'],
  },
  'operator-chat': {
    heading: 'Operator Chat',
    description: [
      'Send natural language questions via the bridge; Docker runs the sandbox that answers.',
      'Select one or more mount points so the chat queries the intended project.',
    ],
    actions: ['If Docker is missing, start Docker Desktop and click “Recheck Health”.'],
  },
  'staging-area': {
    heading: 'Staging Area',
    description: ['Build multi-step prompts using clip gallery input or preserved messages.'],
  },
  'prompt-preview': {
    heading: 'Prompt Preview',
    description: ['Render token usage and tool context before you execute prompts.'],
  },
  'mount-manager': {
    heading: 'Mount Manager',
    description: [
      'Bind local directories (absolute path or ~) to Librarian project IDs.',
      'Drag-and-drop is visual only; paste the full path to persist it.',
    ],
    actions: ['Run `librarian projects create <id> <path>` if you prefer the terminal.'],
  },
  'styling-preview': {
    heading: 'Styling Preview',
    description: ['Visual design sandbox for UI components.'],
  },
  settings: {
    heading: 'Settings',
    description: ['Add the `.venv/bin` path to your shell environment for easier CLI access.'],
    actions: ['Use the provided copy buttons to write to `.zshrc`, `.bashrc`, or PowerShell.'],
  },
};
