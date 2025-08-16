import { renderHook, waitFor } from '@testing-library/react-native';
import { useRemoteFlags } from '../lib/useRemoteFlags';

// Mock the supabase module to avoid ES6 import issues
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ 
          data: [{ key: 'newUI', enabled: true }], 
          error: null 
        })
      }))
    }))
  }
}));

describe('useRemoteFlags', () => {
  it('returns isEnabled for fetched flags', async () => {
    const { result } = renderHook(() => useRemoteFlags());

    await waitFor(() => expect(result.current.flags.length).toBeGreaterThanOrEqual(0));
    expect(result.current.isEnabled('newUI')).toBe(true);
    expect(result.current.isEnabled('unknown')).toBe(false);
  });
});


