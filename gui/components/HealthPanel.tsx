import React from 'react';
import {
  ShieldCheck,
  XCircle,
  Server,
  Activity,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export interface HealthState {
  bridgeStatus: 'active' | 'disconnected' | 'unknown';
  dockerAvailable: boolean;
  manifestExists: boolean;
  manifestExpectedPath: string;
  manifestDir: string;
  manifestConfigured: boolean;
  lastChecked: string | null;
  checking: boolean;
}

interface Props {
  health: HealthState;
  onRefresh: () => Promise<void>;
  onOpenBridge: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

const blockedFeatures: Record<string, string[]> = {
  docker: ['Project queries', 'Sandboxed execution', 'Health-enabled automations'],
  bridge: ['Mount Manager', 'Operator chat', 'Mount sync'],
  manifest: ['Persistence dashboard visuals', 'Manifest-aware commands'],
};

export const HealthPanel: React.FC<Props> = ({
  health,
  onRefresh,
  onOpenBridge,
  onOpenSettings,
  onClose,
}) => {
  const overallStatus =
    health.bridgeStatus === 'active' && health.dockerAvailable ? 'healthy' : 'degraded';

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[95] px-5">
  <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 rounded-[32px] p-4 shadow-[0_10px_40px_rgba(99,102,241,0.4)]">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Server className="text-primary" size={20} />
            <span className="text-xs uppercase tracking-wider text-gray-400">
              Health Audit
            </span>
            <button
              onClick={onClose}
              className="ml-auto text-[10px] uppercase tracking-wider text-gray-400 hover:text-white"
              title="Hide health panel"
            >
              Close
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-200">
            {overallStatus === 'healthy'
              ? 'All critical dependencies are healthy.'
              : 'Some dependencies are degraded; features may be limited.'}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatusCard
              title="Bridge"
              icon={health.bridgeStatus === 'active' ? ShieldCheck : AlertTriangle}
              healthy={health.bridgeStatus === 'active'}
              description={
                health.bridgeStatus === 'active'
                  ? 'Bridge API ready'
                  : 'Bridge unreachable. Mount features are blocked.'
              }
              actionLabel="Open Bridge"
              onAction={onOpenBridge}
            />
            <StatusCard
              title="Docker"
              icon={health.dockerAvailable ? ShieldCheck : AlertTriangle}
              healthy={health.dockerAvailable}
              description={
                health.dockerAvailable
                  ? 'Docker running'
                  : 'Docker stopped. Queries and sandboxed execution disabled.'
              }
              actionLabel="Start Docker"
              onAction={onOpenSettings}
            />
            <StatusCard
              title="Manifest"
              icon={health.manifestExists ? Activity : AlertTriangle}
              healthy={health.manifestExists}
              description={
                health.manifestExists
                  ? 'Manifest available'
                  : `Manifest missing at ${health.manifestExpectedPath || '(unknown path)'}. Set manifest-dir in Settings, then run: librarian install --manifest-dir <that folder>.`
              }
              actionLabel="View Settings"
              onAction={onOpenSettings}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw size={14} />
            <span>Last checked:</span>
            <span className="text-white">{health.lastChecked ?? 'n/a'}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={health.checking}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
            title="Re-check dependencies via local bridge"
          >
            {health.checking ? 'Checking…' : 'Recheck Health'}
          </button>
        </div>
      </div>

      <div className="mt-3 bg-[#080c0a]/90 border border-white/5 rounded-2xl p-3 shadow-inner">
        <div className="text-[10px] uppercase tracking-wide text-gray-400">Blocked Features</div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          {Object.entries(blockedFeatures).map(([key, features]) => {
            const healthy =
              key === 'docker'
                ? health.dockerAvailable
                : key === 'bridge'
                  ? health.bridgeStatus === 'active'
                  : health.manifestExists;
            return (
              <div
                key={key}
                className={`border rounded-xl p-2 ${healthy ? 'border-green-500/30' : 'border-red-500/20'}`}
              >
                <p className="text-gray-300">{key.toUpperCase()}</p>
                <ul className="mt-1 space-y-1 text-white">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-1">
                      <span className={healthy ? 'text-green-400' : 'text-red-400'}>
                        {healthy ? '●' : '◦'}
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  description: string;
  healthy: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  actionLabel: string;
  onAction: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  healthy,
  icon: Icon,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col gap-2 bg-black/40 border border-white/5 rounded-2xl p-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wider text-gray-500">{title}</span>
      <Icon
        size={16}
        className={healthy ? 'text-green-400' : 'text-red-400'}
      />
    </div>
    <div className="text-sm text-white">{description}</div>
    <button
      onClick={onAction}
      className="text-[10px] text-primary hover:underline self-start mt-auto"
      title={`Open ${title} help/action`}
    >
      {actionLabel}
    </button>
  </div>
);
