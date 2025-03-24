import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LoginCredentials, RegisterCredentials } from '@shared/schema';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  // Modified user query to prevent unnecessary refetching
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) return null;
      const response = await apiRequest('GET', '/api/user/me');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
    onError: () => {
      logout();
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
      }
    },
  });

  // Register mutation updated to use refetch
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest('POST', '/api/auth/register', credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
    },
  });

  // Set authorization header for all requests
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const adjustedInit = init || {};
      if (token && !adjustedInit.headers?.hasOwnProperty('Authorization')) {
        adjustedInit.headers = {
          ...adjustedInit.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return originalFetch(input, adjustedInit);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  // Remove the unnecessary refetch effect
  useEffect(() => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  }, [token]);

  // Logout function - modified to handle cleanup better
  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    // Clear specific queries instead of all queries
    queryClient.removeQueries({ queryKey: ['currentUser'] });
    queryClient.removeQueries({ queryKey: ['skills'] });
    queryClient.removeQueries({ queryKey: ['matches'] });
    queryClient.removeQueries({ queryKey: ['sessions'] });
    queryClient.removeQueries({ queryKey: ['stats'] });
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    return registerMutation.mutateAsync(credentials);
  };

  const contextValue = {
    isAuthenticated,
    isLoading: isLoading && !!token,
    user,
    token,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout
  };

  if (isLoading && !!token) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}