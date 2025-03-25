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
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error(await response.text());
      }
      return response.json();
    },
    // Improve refresh behavior
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 1
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