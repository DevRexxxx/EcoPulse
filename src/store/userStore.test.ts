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
});
