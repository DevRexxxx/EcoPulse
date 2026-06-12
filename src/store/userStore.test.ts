import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useUserStore.setState({
      user: null,
      ecoPoints: 0,
      baseline: null,
      pendingReport: null,
      lastEmergencyDate: null,
    });
  });

  it('should initialize with default values', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.ecoPoints).toBe(0);
    expect(state.baseline).toBeNull();
  });

  it('should add eco points', () => {
    useUserStore.getState().addEcoPoints(50);
    expect(useUserStore.getState().ecoPoints).toBe(50);
    
    useUserStore.getState().addEcoPoints(25);
    expect(useUserStore.getState().ecoPoints).toBe(75);
  });

  it('should set user and update authentication status', () => {
    const mockUser = { uid: '123', email: 'test@example.com', displayName: 'Test User', region: 'US', createdAt: '2023-01-01', onboardingComplete: true };
    useUserStore.getState().setUser(mockUser as any);
    
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should reset state completely', () => {
    useUserStore.getState().addEcoPoints(100);
    useUserStore.getState().setHasConnectedDevice(true);
    useUserStore.getState().reset();
    
    const state = useUserStore.getState();
    expect(state.ecoPoints).toBe(0);
    expect(state.hasConnectedDevice).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
