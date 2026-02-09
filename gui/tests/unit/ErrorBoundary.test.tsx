import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../../components/Shared';

const ProblemChild = () => {
    throw new Error('Crashing for test');
};

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Content')).toBeInTheDocument();
    });

    it('renders error UI when child crashes', () => {
        // Suppress console.error for expected crash
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('A component failed to render. This is common in prototypes.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
