import { render, screen, fireEvent } from '@testing-library/react';
import { MessageMonitorScreen } from '../../screens/MessageMonitor';
import { vi, Mock } from 'vitest';
import * as useBridgeEventsHook from '../../src/hooks/useBridgeEvents';

// Mock the hook
vi.mock('../../src/hooks/useBridgeEvents', () => ({
    useBridgeEvents: vi.fn(),
}));

describe('MessageMonitorScreen', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock return
        (useBridgeEventsHook.useBridgeEvents as Mock).mockReturnValue([
            {
                id: '1',
                timestamp: Date.now(),
                type: 'res',
                method: 'health',
                payload: { status: 'ok' },
                duration: 50
            },
            {
                id: '2',
                timestamp: Date.now() - 1000,
                type: 'req',
                method: 'project_query',
                payload: { question: 'hi' }
            }
        ]);
    });

    it('renders the screen title', () => {
        render(<MessageMonitorScreen onNavigate={mockNavigate} currentScreen="message-monitor" />);
        expect(screen.getByText('Message Monitor')).toBeInTheDocument();
    });

    it('displays filter buttons', () => {
        render(<MessageMonitorScreen onNavigate={mockNavigate} currentScreen="message-monitor" />);
        expect(screen.getByText('LIVE')).toBeInTheDocument();
        expect(screen.getByText('Docker')).toBeInTheDocument();
        expect(screen.getByText('Errors')).toBeInTheDocument();
    });

    it('renders events from the hook', () => {
        render(<MessageMonitorScreen onNavigate={mockNavigate} currentScreen="message-monitor" />);
        expect(screen.getByText('health')).toBeInTheDocument();
        expect(screen.getByText('project_query')).toBeInTheDocument();
    });

    it('toggles payload details on click', () => {
        render(<MessageMonitorScreen onNavigate={mockNavigate} currentScreen="message-monitor" />);

        // Find the node with 'Res' (Response) text
        const responseNode = screen.getByText('Res').closest('div');
        expect(responseNode).toBeInTheDocument();

        // Initially collapsed
        expect(screen.queryByText(/"status": "ok"/)).not.toBeInTheDocument();

        // Click to expand
        if (responseNode) {
            fireEvent.click(responseNode);
        }

        // Now visible (using regex for flexibility with formatting)
        expect(screen.getByText(/"status": "ok"/)).toBeInTheDocument();
    });
});
