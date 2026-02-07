import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HealthPanel, HealthState } from '../../components/HealthPanel';

const defaultHealth: HealthState = {
  bridgeStatus: 'active',
  dockerAvailable: true,
  manifestExists: true,
  lastChecked: 'now',
  checking: false,
};

describe('HealthPanel', () => {
  it('renders healthy state and blocked features', () => {
    const refresh = vi.fn();
    render(
      <HealthPanel
        health={defaultHealth}
        onRefresh={refresh}
        onOpenBridge={() => {}}
        onOpenSettings={() => {}}
      />
    );
    expect(screen.getByText(/All critical dependencies are healthy/i)).toBeTruthy();
    expect(screen.getByText('Bridge')).toBeTruthy();
    expect(screen.getByText('Docker')).toBeTruthy();
    expect(screen.getByText('Manifest')).toBeTruthy();
  });

  it('shows degraded state when docker is down', () => {
    const refresh = vi.fn();
    render(
      <HealthPanel
        health={{
          ...defaultHealth,
          dockerAvailable: false,
          bridgeStatus: 'disconnected',
          manifestExists: false,
        }}
        onRefresh={refresh}
        onOpenBridge={() => {}}
        onOpenSettings={() => {}}
      />
    );
    expect(screen.getByText(/Some dependencies are degraded/i)).toBeTruthy();
    expect(screen.getByText(/Project queries/i)).toBeTruthy();
  });
});
