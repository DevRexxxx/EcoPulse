import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import AIVerificationModal from './AIVerificationModal';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Zustand store
vi.mock('@/store/userStore', () => ({
  useUserStore: () => vi.fn(),
}));

describe('AIVerificationModal', () => {
  beforeEach(() => {
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
    });
  });

  it('should render the modal when isOpen is true', async () => {
    render(<AIVerificationModal isOpen={true} onClose={vi.fn()} onClaimPoints={vi.fn()} />);
    
    // Check if terminal logs are visible
    expect(screen.getByText(/> TERMINAL::READY — Awaiting scan command\./i)).toBeInTheDocument();
    
    // Check if scan button exists, wait for camera to be ready (fixes act warning)
    expect(await screen.findByText(/SCAN ACTION/i)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<AIVerificationModal isOpen={false} onClose={vi.fn()} onClaimPoints={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<AIVerificationModal isOpen={true} onClose={handleClose} onClaimPoints={vi.fn()} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText(/SCAN ACTION/i)).toBeInTheDocument()); // Wait to prevent act warning
  });
});
