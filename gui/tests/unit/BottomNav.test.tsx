import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from '../../components/Shared';
import { ScreenName } from '../../types';

describe('BottomNav', () => {
    it('renders all main navigation tabs', () => {
        const onNavigate = vi.fn();
        render(<BottomNav currentScreen="dashboard" onNavigate={onNavigate} />);

        expect(screen.getByTitle('Go to Dashboard')).toBeInTheDocument();
        expect(screen.getByTitle('Go to CLI Reference')).toBeInTheDocument();
        expect(screen.getByTitle('Go to Capabilities')).toBeInTheDocument();
        expect(screen.getByTitle('Go to Agent Center')).toBeInTheDocument();
    });

    it('calls onNavigate when a tab is clicked', () => {
        const onNavigate = vi.fn();
        render(<BottomNav currentScreen="dashboard" onNavigate={onNavigate} />);

        fireEvent.click(screen.getByTitle('Go to CLI Reference'));
        expect(onNavigate).toHaveBeenCalledWith('cli');
    });

    it('highlights the active tab', () => {
        const onNavigate = vi.fn();
        const { rerender } = render(<BottomNav currentScreen="dashboard" onNavigate={onNavigate} />);

        // Check if dashboard icon has text-primary (or equivalent active class indicator)
        // Based on Shared.tsx: isActive ? 'bg-primary/10 text-primary' : 'text-gray-400'
        const dashboardTab = screen.getByTitle('Go to Dashboard');
        expect(dashboardTab).toHaveClass('opacity-100');

        rerender(<BottomNav currentScreen="cli" onNavigate={onNavigate} />);
        const cliTab = screen.getByTitle('Go to CLI Reference');
        expect(cliTab).toHaveClass('opacity-100');
        expect(screen.getByTitle('Go to Dashboard')).toHaveClass('opacity-50');
    });
});
