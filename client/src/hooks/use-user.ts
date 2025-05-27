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
        console.error(`Server error: ${response.statusText}`);
        return { ok: false, message: 'Internal server error. Please try again later.' };
      }
      const message = await response.text();
      console.error(`Request failed: ${message}`);
      return { ok: false, message };
    }

    if (url === '/api/login' || url === '/api/register' || url === '/api/auth/check') {
      try {
        const data = await response.json();
        
        if (data && data.sessionId) {
          console.log("Storing session ID from server response:", data.sessionId);
          localStorage.setItem('maly_session_id', data.sessionId);
        }
        
        if (data && data.user) {
          localStorage.setItem('maly_user_data', JSON.stringify(data.user));
          if (data.user.id) {
            console.log("Storing user ID for auth:", data.user.id);
            localStorage.setItem('maly_user_id', data.user.id.toString());
          }
        }
        
        return { ok: true };
      } catch (parseError) {
        console.warn("Error parsing JSON response:", parseError);
        return { ok: true };
      }
    }

    return { ok: true };
  } catch (e: any) {
    console.error('Network or fetch error:', e);
    return { ok: false, message: 'Network error. Please check your connection and try again.' };
  }
}

export function useUser() {
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  
  if (sessionId) {
    console.log("Detected session parameter, storing in localStorage and refreshing user data");
    localStorage.setItem('maly_session_id', sessionId);
    
    const url = new URL(window.location.href);
    url.searchParams.delete('sessionId');
    url.searchParams.delete('ts');
    
    window.history.replaceState({}, document.title, url.toString());
  }

  const storedSessionId = localStorage.getItem('maly_session_id');
  
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
      
      const cachedUser = getCachedUser();
      
      if (cachedUser && !sessionId && !window.location.pathname.startsWith('/auth')) {
        console.log("Using cached user data without verification");
        const lastVerified = localStorage.getItem('maly_user_verified_at');
        const now = Date.now();
        
        if (!lastVerified || now - parseInt(lastVerified, 10) > 5 * 60 * 1000) {
          setTimeout(async () => {
            try {
              const verifyResponse = await fetch('/api/verify-user', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: cachedUser.id })
              });
              
              if (verifyResponse.ok) {
                localStorage.setItem('maly_user_verified_at', now.toString());
              } else {
                queryClient.invalidateQueries({ queryKey: ['user'] });
              }
            } catch (error) {
              console.error("Background verification error:", error);
            }
          }, 100);
        }
        
        return cachedUser;
      }
      
      const extraHeaders: Record<string, string> = {};

      const userId = localStorage.getItem('maly_user_id');
      if (userId) {
        console.log("Including user ID in auth check:", userId);
        extraHeaders['X-User-ID'] = userId;
      }

      const malySessionId = localStorage.getItem('maly_session_id');
      if (malySessionId) {
        console.log("Including maly_session_id in auth check:", malySessionId.substring(0, 5) + '...');
        extraHeaders['X-Session-ID'] = malySessionId;
      } else if (storedSessionId) {
        console.log("Including storedSessionId in auth check:", storedSessionId.substring(0, 5) + '...');
        extraHeaders['X-Session-ID'] = storedSessionId;
      }

      try {
        const authCheckResponse = await fetch('/api/auth/check', {
          credentials: 'include',
          headers: extraHeaders
        });
        
        if (!authCheckResponse.ok) {
          console.error("Auth check failed:", authCheckResponse.status);
          throw new Error(`Auth check failed: ${authCheckResponse.status}`);
        }
        
        const authStatus = await authCheckResponse.json();
        
        if (authStatus.authenticated && authStatus.user) {
          console.log("User authenticated via auth check:", authStatus.user.username);
          localStorage.setItem('maly_user_data', JSON.stringify(authStatus.user));
          localStorage.setItem('maly_user_verified_at', Date.now().toString());
          return authStatus.user;
        }
        
        if (!authStatus.authenticated && storedSessionId) {
          console.log("Cookie auth failed, trying stored session ID");
          
          const response = await fetch('/api/user-by-session', {
            credentials: 'include',
            headers: { 
              'X-Session-ID': storedSessionId
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData) {
              console.log("User authenticated via stored session ID:", userData.username);
              localStorage.setItem('maly_user_data', JSON.stringify(userData));
              localStorage.setItem('maly_user_verified_at', Date.now().toString());
              return userData;
            }
          }
        }
        
        if (cachedUser) {
          localStorage.removeItem('maly_user_data');
          localStorage.removeItem('maly_session_id');
          localStorage.removeItem('maly_user_verified_at');
        }
        
        return null;
      } catch (error) {
        console.error("Auth check error:", error);
        if (cachedUser) {
          return cachedUser;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000,
    enabled: true
  });

  const login = useMutation({
    mutationFn: async (userData: any) => {
      const result = await handleRequest('/api/login', 'POST', userData);
      if (result.ok) {
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
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      localStorage.removeItem('maly_user_data');
      localStorage.removeItem('maly_session_id');
      localStorage.removeItem('maly_user_id');
      localStorage.removeItem('maly_user_verified_at');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('connect.sid');
      localStorage.removeItem('maly_session');
      
      console.log("Cleared all cached user data on logout");
      
      window.location.href = '/auth';
    },
  });

  const startChat = async (userId: number) => {
    if (!user) return '/auth';
    return `/chat/${userId}`;
  };

  const refreshUser = async (): Promise<UserResponse | null> => {
    try {
      console.log("Explicitly refreshing user data");
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      const { data } = await refetch();
      console.log("User data refreshed successfully:", data);
      
      return data || null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };
  
  if (sessionId) {
    refreshUser();
  }

  const updateProfile = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }
      
      const updatedUser = await response.json();
      
      if (updatedUser) {
        localStorage.setItem('maly_user_data', JSON.stringify(updatedUser));
      }
      
      return { ok: true, user: updatedUser };
    },
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(['user'], data.user);
      }
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