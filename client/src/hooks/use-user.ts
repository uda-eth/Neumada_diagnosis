import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from "@db/schema";

interface UserResponse extends User {
  connections?: Array<{
    id: number;
    username: string;
    fullName: string;
    profileImage: string | null;
    status?: string;
  }>;
}

type RequestResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

async function handleRequest(
  url: string,
  method: string,
  body?: any
): Promise<RequestResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status >= 500) {
        return { ok: false, message: response.statusText };
      }
      const message = await response.text();
      return { ok: false, message };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e.toString() };
  }
}

export function useUser() {
  const queryClient = useQueryClient();

  // Check if there's a session parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  
  // If we have a sessionId in the URL, clean it up by removing that parameter
  // and store it in localStorage for persistence across webview issues
  if (sessionId) {
    console.log("Detected session parameter, storing in localStorage and refreshing user data");
    
    // Store the session in localStorage for persistence
    localStorage.setItem('maly_session_id', sessionId);
    
    // Create a clean URL without the sessionId parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('sessionId');
    url.searchParams.delete('ts');
    
    // Replace the URL without reloading the page to remove sessionId from browser history
    window.history.replaceState({}, document.title, url.toString());
  }

  // Retrieve stored session ID from localStorage if it exists
  const storedSessionId = localStorage.getItem('maly_session_id');
  
  // Check for cached user data in localStorage
  const getCachedUser = (): UserResponse | null => {
    try {
      const cachedUserJson = localStorage.getItem('maly_user_data');
      if (cachedUserJson) {
        return JSON.parse(cachedUserJson);
      }
      return null;
    } catch (error) {
      console.error("Error parsing cached user data:", error);
      return null;
    }
  };

  const { data: user, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      console.log("Fetching user data from server, sessionId present:", !!(sessionId || storedSessionId));
      
      // Force a delay if we have a sessionId to ensure the server has time to process the session
      if (sessionId) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Try to include the session ID from localStorage in the request if available
      const extraHeaders: Record<string, string> = { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache'
      };

      if (storedSessionId) {
        extraHeaders['X-Session-ID'] = storedSessionId;
      }

      // First check auth status with the dedicated endpoint
      const authCheckResponse = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-store', // Stronger cache control
        headers: extraHeaders
      });
      
      if (!authCheckResponse.ok) {
        console.error("Auth check failed:", authCheckResponse.status);
        
        // If server auth fails, try using cached user data as fallback
        const cachedUser = getCachedUser();
        if (cachedUser) {
          console.log("Using cached user data as fallback");
          return cachedUser;
        }
        
        return null;
      }
      
      const authStatus = await authCheckResponse.json();
      
      // If authenticated, use the user data from the auth check response
      if (authStatus.authenticated && authStatus.user) {
        console.log("User authenticated via auth check:", authStatus.user.username);
        
        // Cache the user data
        localStorage.setItem('maly_user_data', JSON.stringify(authStatus.user));
        
        return authStatus.user;
      }
      
      // If not authenticated via cookies, try to send the stored session ID as a header
      if (!authStatus.authenticated && storedSessionId) {
        console.log("Cookie auth failed, trying stored session ID");
        
        // Get cached user ID if available
        const cachedUser = getCachedUser();
        const cachedUserId = cachedUser?.id;
        
        // Build URL with user ID as query parameter if available
        let userBySessionUrl = '/api/user-by-session';
        if (cachedUserId) {
          userBySessionUrl += `?userId=${cachedUserId}`;
        }
        
        // Try the user endpoint with the stored session ID
        const response = await fetch(userBySessionUrl, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 
            'X-Session-ID': storedSessionId,
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            console.log("User authenticated via stored session ID:", userData.username);
            
            // Cache the user data
            localStorage.setItem('maly_user_data', JSON.stringify(userData));
            
            return userData;
          }
        }
      }
      
      // If still not authenticated, check cached data
      if (!authStatus.authenticated) {
        console.log("User not authenticated via auth check");
        console.log("No authenticated user detected, checking for cached data");
        
        const cachedUser = getCachedUser();
        
        if (cachedUser) {
          console.log("Using cached user data, verifying with server");
          
          // Try to verify the cached user with the server
          const verifyResponse = await fetch('/api/verify-user', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, private',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ userId: cachedUser.id })
          });
          
          if (verifyResponse.ok) {
            console.log("Cached user verified with server");
            return cachedUser;
          } else {
            console.log("Cached user could not be verified, redirecting to auth page");
            // Clear cached data if verification fails
            localStorage.removeItem('maly_user_data');
            localStorage.removeItem('maly_session_id');
            return null;
          }
        }
        
        console.log("No cached user data found, redirecting to auth page");
        return null;
      }
      
      // If we get here, try the regular user endpoint as a final fallback
      const response = await fetch('/api/user', {
        credentials: 'include',
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error(await response.text());
      }
      
      const userData = await response.json();
      
      // Cache the user data
      if (userData) {
        localStorage.setItem('maly_user_data', JSON.stringify(userData));
      }
      
      return userData;
    },
    // Improve refresh behavior with more aggressive settings
    staleTime: 0, // No stale time - always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3, // Try more times
    retryDelay: 1000, // Wait 1 second between retries
    // Force a refresh when there's a sessionId parameter
    enabled: true
  });

  const login = useMutation({
    mutationFn: async (userData: any) => {
      const result = await handleRequest('/api/login', 'POST', userData);
      if (result.ok) {
        // Force a refetch immediately after successful login
        await refetch();
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const register = useMutation({
    mutationFn: async (userData: any) => {
      const result = await handleRequest('/api/register', 'POST', userData);
      if (result.ok) {
        // Force a refetch immediately after successful registration
        await refetch();
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logout = useMutation({
    mutationFn: () => handleRequest('/api/logout', 'POST'),
    onSuccess: () => {
      // Clear user data immediately
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Clear localStorage cached data
      localStorage.removeItem('maly_user_data');
      localStorage.removeItem('maly_session_id');
      console.log("Cleared cached user data on logout");
    },
  });

  const startChat = async (userId: number) => {
    if (!user) return '/auth';
    return `/chat/${userId}`;
  };

  // Dedicated method to refresh user data and return the updated user
  const refreshUser = async (): Promise<UserResponse | null> => {
    try {
      console.log("Explicitly refreshing user data");
      // Force invalidate the cache first
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Then explicitly refetch
      const { data } = await refetch();
      console.log("User data refreshed successfully:", data);
      
      return data || null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };
  
  // Immediately refresh user data if we have a sessionId in the URL
  if (sessionId) {
    refreshUser();
  }

  // Add profile update mutation
  const updateProfile = useMutation({
    mutationFn: async (profileData: any) => {
      const result = await handleRequest('/api/profile', 'POST', profileData);
      if (result.ok) {
        // Force a refetch immediately after successful profile update
        await refetch();
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    register: register.mutateAsync,
    startChat,
    refetchUser: refetch,
    refreshUser,
    updateProfile: updateProfile.mutateAsync
  };
}