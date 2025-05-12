import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FirstEventModal } from '../components/FirstEventModal';
import * as wouter from 'wouter';

// Mock the wouter useLocation hook
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => {
      const setLocation = vi.fn();
      return ['/discover', setLocation];
    }
  };
});

describe('FirstEventModal component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly when open is true', () => {
    render(<FirstEventModal cityName="Berlin" open={true} onClose={() => {}} />);
    
    expect(screen.getByText('Be the first in Berlin!')).toBeInTheDocument();
    expect(screen.getByText(/No events have been created in Berlin yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Maybe Later/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Invite Friends/i })).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<FirstEventModal cityName="Berlin" open={false} onClose={() => {}} />);
    
    expect(screen.queryByText('Be the first in Berlin!')).not.toBeInTheDocument();
  });

  it('calls onClose when "Maybe Later" button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<FirstEventModal cityName="Berlin" open={true} onClose={mockOnClose} />);
    
    const maybeLaterButton = screen.getByRole('button', { name: /Maybe Later/i });
    fireEvent.click(maybeLaterButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to /create when "Create Event" button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<FirstEventModal cityName="Berlin" open={true} onClose={mockOnClose} />);
    
    const mockSetLocation = wouter.useLocation()[1] as any;
    const createEventButton = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(createEventButton);
    
    expect(mockSetLocation).toHaveBeenCalledWith('/create');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to /invite when "Invite Friends" button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<FirstEventModal cityName="Berlin" open={true} onClose={mockOnClose} />);
    
    const mockSetLocation = wouter.useLocation()[1] as any;
    const inviteFriendsButton = screen.getByRole('button', { name: /Invite Friends/i });
    fireEvent.click(inviteFriendsButton);
    
    expect(mockSetLocation).toHaveBeenCalledWith('/invite');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});