import { Loader2, User, Lock, Check } from "lucide-react";

interface ProfileSetupLoadingProps {
  show: boolean;
  username: string;
  email: string;
  photoURL: string;
}

export function ProfileSetupLoading({ show, username, email, photoURL }: ProfileSetupLoadingProps) {
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
        {/* Avatar */}
        <div className="flex justify-center mb-6" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards", opacity: 0 }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg transition-all duration-500 hover:scale-105">
              {photoURL && photoURL !== "" ? (
                <img 
                  src={photoURL} 
                  alt={username} 
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.warn("Failed to load profile image:", photoURL);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            {/* Check badge */}
            <div 
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-background shadow-lg transition-all duration-300"
              style={{ animation: "smoothZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards", opacity: 0 }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="text-center space-y-4" style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards", opacity: 0 }}>
          <h3 className="text-xl font-semibold text-foreground transition-all duration-300">
            Setting up your profile...
          </h3>
          <p className="text-sm text-muted-foreground transition-all duration-300">
            {email}
          </p>

          {/* Animated Loader */}
          <div className="flex justify-center py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin transition-all duration-300" />
          </div>

          {/* Setup Steps */}
          <div 
            className="space-y-3 text-left bg-secondary/30 rounded-lg p-4 transition-all duration-300"
            style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards", opacity: 0 }}
          >
            <div 
              className="flex items-center gap-3 text-sm transition-all duration-300"
              style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards", opacity: 0 }}
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 transition-all duration-300">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-foreground">Creating your account</span>
            </div>
            <div 
              className="flex items-center gap-3 text-sm transition-all duration-300"
              style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards", opacity: 0 }}
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 transition-all duration-300">
                <Lock className="w-3 h-3 text-primary-foreground animate-pulse" />
              </div>
              <span className="text-foreground">Securing your credentials</span>
            </div>
            <div 
              className="flex items-center gap-3 text-sm opacity-50 transition-all duration-300"
              style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards", opacity: 0 }}
            >
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0 transition-all duration-300" />
              <span className="text-muted-foreground">Finalizing setup</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 transition-all duration-300">
            This will only take a moment...
          </p>
        </div>
      </div>
    </div>
  );
}

