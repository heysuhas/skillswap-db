import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from '@/components/protected-route';

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Profile from "@/pages/profile";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Sessions from "@/pages/sessions";
import NotFound from "@/pages/not-found";

const PublicOnlyRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <PublicOnlyRoute component={Login} />
      </Route>
      <Route path="/register">
        <PublicOnlyRoute component={Register} />
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/matches">
        <ProtectedRoute>
          <Matches />
        </ProtectedRoute>
      </Route>
      <Route path="/messages/:id?">
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      </Route>
      <Route path="/sessions">
        <ProtectedRoute>
          <Sessions />
        </ProtectedRoute>
      </Route>

      {/* Root redirect */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      {/* 404 route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
