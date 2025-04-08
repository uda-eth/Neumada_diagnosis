
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '../../../../client/src/hooks/use-user';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

// Mock local storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key]),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUser Hook Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (global.fetch as jest.Mock).mockReset();
  });
  
  describe('Authentication Optimization', () => {
    it('should use cached user data without making API calls', async () => {
      // Set up mock cached user data
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Store mock user in localStorage
      localStorage.setItem('maly_user_data', JSON.stringify(mockUser));
      localStorage.setItem('maly_user_verified_at', Date.now().toString());
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Since we're using cached data, this should resolve immediately
      expect(result.current.user).toEqual(mockUser);
      
      // Verify that no fetch was called for cached user
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    it('should fetch user data if cache is expired', async () => {
      // Set up mock cached user data with expired verification
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Store mock user in localStorage with expired verification time
      localStorage.setItem('maly_user_data', JSON.stringify(mockUser));
      localStorage.setItem('maly_user_verified_at', (Date.now() - 6 * 60 * 1000).toString()); // 6 minutes ago
      
      // Mock the API response for verification
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Initial state should use cache
      expect(result.current.user).toEqual(mockUser);
      
      // Verification should happen in background
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that fetch was called for verification
      expect(global.fetch).toHaveBeenCalledWith('/api/verify-user', expect.any(Object));
      
      // Check that verification timestamp was updated
      expect(localStorage.getItem('maly_user_verified_at')).not.toBe((Date.now() - 6 * 60 * 1000).toString());
    });
    
    it('should use sessionId from localStorage for authentication', async () => {
      // Set up mock session ID
      localStorage.setItem('maly_session_id', 'test-session-id');
      
      // Mock the auth check API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            authenticated: true,
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            }
          })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the authentication to complete
      await waitForNextUpdate();
      
      // Check that the user data was set correctly
      expect(result.current.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
      
      // Verify the fetch was called with the correct headers
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/check', expect.objectContaining({
        headers: expect.objectContaining({
          'X-Session-ID': 'test-session-id'
        })
      }));
    });
  });
  
  describe('UserID-based Authentication', () => {
    it('should use userId from localStorage for authentication', async () => {
      // Set up mock user ID
      localStorage.setItem('maly_user_id', '1');
      
      // Mock the auth check API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            authenticated: true,
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            }
          })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the authentication to complete
      await waitForNextUpdate();
      
      // Check that the user data was set correctly
      expect(result.current.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
      
      // Verify the fetch was called with the correct headers
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/check', expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-ID': '1'
        })
      }));
    });
    
    it('should authenticate successfully with user ID even if session is invalid', async () => {
      // Set up mock user ID and invalid session ID
      localStorage.setItem('maly_user_id', '1');
      localStorage.setItem('maly_session_id', 'invalid-session-id');
      
      // Mock the auth check API response (session fails but user ID works)
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            authenticated: true,
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            }
          })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the authentication to complete
      await waitForNextUpdate();
      
      // Check that the user data was set correctly despite invalid session
      expect(result.current.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
    });
    
    it('should store user data in localStorage after successful login', async () => {
      // Mock the login API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            },
            sessionId: 'new-session-id'
          })
        })
      );
      
      // Mock the auth check API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            authenticated: true,
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            }
          })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the initial load
      await waitForNextUpdate();
      
      // Perform login
      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password'
        });
      });
      
      // Check that user data and session ID were stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('maly_user_data', expect.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('maly_session_id', 'new-session-id');
      expect(localStorage.setItem).toHaveBeenCalledWith('maly_user_id', '1');
    });
    
    it('should clear localStorage data on logout', async () => {
      // Setup initial state
      localStorage.setItem('maly_user_data', JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }));
      localStorage.setItem('maly_session_id', 'test-session-id');
      localStorage.setItem('maly_user_id', '1');
      
      // Mock the logout API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Logged out successfully" })
        })
      );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the initial load
      await waitForNextUpdate();
      
      // Perform logout
      await act(async () => {
        await result.current.logout();
      });
      
      // Check that localStorage data was cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('maly_user_data');
      expect(localStorage.removeItem).toHaveBeenCalledWith('maly_session_id');
    });
  });
  
  describe('Refreshing User Data', () => {
    it('should refresh user data when explicitly requested', async () => {
      // Set up initial mock user data
      const initialUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Set up updated user data
      const updatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User Updated'
      };
      
      // Store initial mock user in localStorage
      localStorage.setItem('maly_user_data', JSON.stringify(initialUser));
      localStorage.setItem('maly_user_id', '1');
      
      // Mock the auth check API response for the refresh
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              authenticated: true,
              user: updatedUser
            })
          })
        );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Initial state should be using cached data
      expect(result.current.user).toEqual(initialUser);
      
      // Perform explicit refresh
      await act(async () => {
        await result.current.refreshUser();
      });
      
      // Check that user data was updated
      expect(result.current.user).toEqual(updatedUser);
      
      // Verify the fetch was called for the refresh
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/check', expect.any(Object));
    });
    
    it('should update profile and refresh user data', async () => {
      // Set up initial mock user data
      const initialUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Set up updated user data after profile update
      const updatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'New Name'
      };
      
      // Store initial mock user in localStorage
      localStorage.setItem('maly_user_data', JSON.stringify(initialUser));
      
      // Mock the profile update API response
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: "Profile updated successfully" })
          })
        )
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              authenticated: true,
              user: updatedUser
            })
          })
        );
      
      // Render the hook
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper });
      
      // Wait for the initial load
      await waitForNextUpdate();
      
      // Perform profile update
      await act(async () => {
        await result.current.updateProfile({
          fullName: 'New Name'
        });
      });
      
      // Check that user data was updated
      expect(result.current.user).toEqual(updatedUser);
      
      // Verify the fetch was called for both the update and refresh
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/check', expect.any(Object));
    });
  });
});
