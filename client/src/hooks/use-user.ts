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

  const { data: user, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      // First check auth status with the dedicated endpoint
      const authCheckResponse = await fetch('/api/auth/check', {
        credentials: 'include'
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
        return null;
      }
      
      // If we get here, we need to try the regular user endpoint as fallback
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    // Improve refresh behavior with more aggressive settings
    staleTime: 5 * 1000, // 5 seconds instead of 30
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2 // Try more times
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

  return {
    user,
    isLoading,
    error,
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    register: register.mutateAsync,
    startChat,
    refetchUser: refetch
  };
}