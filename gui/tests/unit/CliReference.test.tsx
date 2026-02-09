import { render, screen, fireEvent } from '@testing-library/react';
import { CliReferenceScreen } from '../../screens/CLI';
import { vi } from 'vitest';

describe('CliReferenceScreen', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the screen title', () => {
        render(<CliReferenceScreen onNavigate={mockNavigate} currentScreen="cli-reference" />);
        expect(screen.getByText('CLI Reference')).toBeInTheDocument();
    });

    it('displays command list', () => {
        render(<CliReferenceScreen onNavigate={mockNavigate} currentScreen="cli-reference" />);
        expect(screen.getByText('librarian install')).toBeInTheDocument();
        expect(screen.getByText('librarian mcp')).toBeInTheDocument();
    });

    it('filters commands by search input', () => {
        render(<CliReferenceScreen onNavigate={mockNavigate} currentScreen="cli-reference" />);

        const searchInput = screen.getByPlaceholderText(/Search commands/i);
        fireEvent.change(searchInput, { target: { value: 'install' } });

        expect(screen.getByText('librarian install')).toBeInTheDocument();
        expect(screen.queryByText('librarian query')).not.toBeInTheDocument();
    });

    it('navigates back when back button clicked', () => {
        render(<CliReferenceScreen onNavigate={mockNavigate} currentScreen="cli-reference" />);

        // Assuming AppHeader has a back button with title "Back" or similar accessible name
        // In the implementation, it's just an arrow icon, but usually has a title or aria-label.
        // Let's check the code: <AppHeader ... showBack onBack={() => onNavigate('dashboard')} ... />
        // AppHeader implementation details are needed to be precise, but we can look for the button.

        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('dashboard');
    });
});
