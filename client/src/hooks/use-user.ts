import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, NewUser } from "@db/schema";

type RequestResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

async function handleRequest(
  url: string,
  method: string,
  body?: NewUser
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

  const { data: user, error, isLoading } = useQuery<User>({
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
  });

  const login = useMutation({
    mutationFn: (userData: NewUser) => 
      handleRequest('/api/login', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const register = useMutation({
    mutationFn: (userData: NewUser) =>
      handleRequest('/api/register', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logout = useMutation({
    mutationFn: () => handleRequest('/api/logout', 'POST'),
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
  };
}
