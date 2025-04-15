import { useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  isPremium?: boolean;
  isAdmin?: boolean;
  // Add other user properties as needed
}

/**
 * Hook for user authentication state
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have a stored session ID
      const sessionId = localStorage.getItem('maly_session_id');
      
      const requestOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? { 'x-session-id': sessionId } : {})
        }
      };
      
      const response = await fetch('/api/user-by-session', requestOptions);
      
      if (!response.ok) {
        // Not authenticated
        if (response.status === 401) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        throw new Error('Failed to fetch user');
      }
      
      const data = await response.json();
      
      // If response includes a sessionId, save it
      if (data.sessionId) {
        localStorage.setItem('maly_session_id', data.sessionId);
      }
      
      // Look for session ID in headers
      const headerSessionId = response.headers.get('x-session-id');
      if (headerSessionId) {
        localStorage.setItem('maly_session_id', headerSessionId);
      }
      
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUser = () => {
    fetchUser();
  };
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  return { user, isLoading, error, refetchUser };
} 