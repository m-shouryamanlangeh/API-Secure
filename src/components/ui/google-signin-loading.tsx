import { Loader2 } from "lucide-react";

interface GoogleSignInLoadingProps {
  show: boolean;
}

export function GoogleSignInLoading({ show }: GoogleSignInLoadingProps) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out"
      style={{ animation: "smoothFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
    >
      <div 
        className="relative bg-background rounded-2xl p-8 shadow-2xl border border-border max-w-md w-full mx-4"
        style={{ animation: "smoothZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Google Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
        </div>

        {/* Loading Content */}
        <div className="text-center space-y-4" style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards", opacity: 0 }}>
          <h3 className="text-xl font-semibold text-foreground transition-all duration-300">
            Signing in with Google
          </h3>
          <p className="text-sm text-muted-foreground transition-all duration-300">
            Please wait while we authenticate your account...
          </p>

          {/* Animated Loader */}
          <div className="flex justify-center py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin transition-all duration-300" />
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full bg-primary transition-all duration-300" 
              style={{ 
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '0ms' 
              }} 
            />
            <div 
              className="w-2 h-2 rounded-full bg-primary transition-all duration-300" 
              style={{ 
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '150ms' 
              }} 
            />
            <div 
              className="w-2 h-2 rounded-full bg-primary transition-all duration-300" 
              style={{ 
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '300ms' 
              }} 
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4 transition-all duration-300">
            A popup window will appear for authentication
          </p>
        </div>
      </div>
    </div>
  );
}

