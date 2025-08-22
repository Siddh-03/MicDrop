import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import pages and components
import Landing from "./pages/Landing";
import JoinSession from "./pages/JoinSession";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import SpeakerDashboard from "./pages/SpeakerDashboard";
import AudienceVoting from "./pages/AudienceVoting";

const queryClient = new QueryClient();

// NEW: Updated route guard that handles the loading state
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authState } = useAuth();

  if (authState.status === 'loading') {
    // While checking, show a loading screen to prevent the "blink"
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If the check is complete and user is not authenticated, redirect
  return authState.status === 'authenticated' ? children : <Navigate to="/auth/login" replace />;
};

// NEW: Updated public route guard
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { authState } = useAuth();

  if (authState.status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If the check is complete and user is authenticated, redirect away from login page
  return authState.status === 'authenticated' ? <Navigate to="/dashboard" replace /> : children;
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<About />} />
        
        <Route path="/auth/login" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/auth/signup" element={<PublicRoute><Auth /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-session" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />
        <Route path="/session/:sessionCode/dashboard" element={<ProtectedRoute><SpeakerDashboard /></ProtectedRoute>} />
        <Route path="/session/:sessionCode/voting" element={<AudienceVoting />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="micdrop-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
