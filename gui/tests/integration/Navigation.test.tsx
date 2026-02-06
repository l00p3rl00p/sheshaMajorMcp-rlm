import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App Integration', () => {
    it('starts on the dashboard screen', () => {
        render(<App />);
        // Check for dashboard elements
        expect(screen.getByText(/Librarian MCP • v/i)).toBeInTheDocument();
    });

    it('navigates to CLI Reference via bottom nav', () => {
        render(<App />);

        // Click CLI tab
        fireEvent.click(screen.getByTitle('Go to CLI Reference'));

        // Check for CLI screen header
        expect(screen.getByText('CLI Reference')).toBeInTheDocument();
    });

    it('navigates to Agent Center via bottom nav', () => {
        render(<App />);

        fireEvent.click(screen.getByTitle('Go to Agent Center'));

        // Check for Agent Center header (SheshaRLM)
        expect(screen.getByText(/Shesha/i)).toBeInTheDocument();
        expect(screen.getByText(/RLM/i)).toBeInTheDocument();
    });

    it('opens and closes the global navigation drawer', () => {
        render(<App />);

        // Open nav
        fireEvent.click(screen.getByTitle('Open global navigation'));
        expect(screen.getByText('Jump To')).toBeInTheDocument();
        expect(screen.getByText('Prompt Preview')).toBeInTheDocument();

        // Click a nav item
        fireEvent.click(screen.getByTitle('Go to Persistence'));

        // Check if persistence screen is rendered
        expect(screen.getByText('Persistence Manager')).toBeInTheDocument();

        // Nav drawer should be closed after selection
        expect(screen.queryByText('Jump To')).not.toBeInTheDocument();
    });

    it('opens and closes the help panel', () => {
        render(<App />);

        // Open help
        fireEvent.click(screen.getByTitle('Open help for this screen'));
        expect(screen.getByText('Help')).toBeInTheDocument();
        expect(screen.getByText(/High-level system status/i)).toBeInTheDocument();

        // Close help by clicking overlay
        fireEvent.click(screen.getByTitle('Close help'));
        expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
});
