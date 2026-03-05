import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import EmailPage from "./pages/EmailPage";
import Settings from "./pages/Settings";
import TestStatus from "./pages/TestStatus";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import OpticalAnimation from "@/components/OpticalAnimation";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showOptical, setShowOptical] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const isInitialCheck = useRef(true);

  // Listen for Firebase auth state — persists across page refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isInitialCheck.current) {
        // Session restored on page refresh — skip animation, go straight to app
        setIsAuthenticated(true);
        setShowOptical(false);
        setShowApp(true);
      } else if (!user) {
        setIsAuthenticated(false);
      }
      // After the first check, ignore further onAuthStateChanged calls
      // Fresh logins are handled by handleAuthSuccess instead
      isInitialCheck.current = false;
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // Fresh login — show optical animation
    setIsAuthenticated(true);
    setShowOptical(true);
  };

  const handleOpticalComplete = () => {
    // After animation, show main app
    setShowOptical(false);
    setTimeout(() => {
      setShowApp(true);
    }, 300);
  };

  // Show loading screen while Firebase checks auth state
  if (isAuthLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="safelens-theme">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="safelens-theme">
        <TooltipProvider>
          {/* Auth Screen (includes login and welcome screen) */}
          {!isAuthenticated ? (
            <Auth onAuthSuccess={handleAuthSuccess} />
          ) : (
            <>
              {/* Optical Animation — only on fresh login, not on refresh */}
              {showOptical && (
                <div className="transition-all duration-500 ease-out">
                  <OpticalAnimation onComplete={handleOpticalComplete} />
                </div>
              )}

              {/* Main App */}
              {!showOptical && (
                <div
                  className={`transition-all duration-700 ease-out ${
                    showApp ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/test-history" element={<TestStatus />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              )}
            </>
          )}

          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
