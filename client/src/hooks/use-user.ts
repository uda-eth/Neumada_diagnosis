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
  if (sessionId) {
    console.log("Detected session parameter, refreshing user data");
    // Create a clean URL without the sessionId parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('sessionId');
    url.searchParams.delete('ts');
    
    // Replace the URL without reloading the page to remove sessionId from browser history
    window.history.replaceState({}, document.title, url.toString());
  }

  const { data: user, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      console.log("Fetching user data from server, sessionId present:", !!sessionId);
      
      // Force a delay if we have a sessionId to ensure the server has time to process the session
      if (sessionId) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // First check auth status with the dedicated endpoint
      const authCheckResponse = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-store', // Stronger cache control
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache'
        }
      });
      
      if (!authCheckResponse.ok) {
        console.error("Auth check failed:", authCheckResponse.status);
        return null;
      }
      
      const authStatus = await authCheckResponse.json();
      
      // If authenticated, use the user data from the auth check response
      if (authStatus.authenticated && authStatus.user) {
        console.log("User authenticated via auth check:", authStatus.user.username);
        return authStatus.user;
      }
      
      // If not authenticated, return null (no user)
      if (!authStatus.authenticated) {
        console.log("User not authenticated via auth check");
        console.log("No authenticated user detected, redirecting to auth page");
        return null;
      }
      
      // If we get here, we need to try the regular user endpoint as fallback
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
      
      return response.json();
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

  return {
    user,
    isLoading,
    error,
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    register: register.mutateAsync,
    startChat,
    refetchUser: refetch,
    refreshUser
  };
}