import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return <>{children}</>;
}