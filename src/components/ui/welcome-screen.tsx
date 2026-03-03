import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface WelcomeScreenProps {
  username: string;
  photoURL?: string;
  onComplete: () => void;
}

export function WelcomeScreen({ username, photoURL, onComplete }: WelcomeScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    console.log("👋 WelcomeScreen MOUNTED - showing for 2.5 seconds");
    console.log("   Username:", username);
    
    // Auto-advance after 2.5 seconds
    const timer = setTimeout(() => {
      console.log("👋 WelcomeScreen fading out...");
      setShow(false);
      // Wait for fade out animation, then call onComplete
      setTimeout(() => {
        console.log("👋 WelcomeScreen calling onComplete!");
        onComplete();
      }, 500);
    }, 2500);

    return () => {
      console.log("👋 WelcomeScreen UNMOUNTED");
      clearTimeout(timer);
    };
  }, [onComplete, username]);

  // Don't render anything if not showing (completely remove from DOM)
  if (!show) {
    console.log("👋 WelcomeScreen returning null (removed from DOM)");
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-background transition-all duration-500 opacity-100"
    >
      <div 
        className="relative max-w-md w-full mx-4 text-center space-y-8"
        style={{ animation: "smoothZoomIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Avatar or Check Icon - Minimalist */}
        <div 
          className="flex justify-center"
          style={{ animation: "smoothZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards", opacity: 0 }}
        >
          {photoURL && photoURL !== "" ? (
            photoURL.startsWith('emoji:') ? (
              // Handle emoji avatars
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" style={{ animationDuration: '2s', transform: 'scale(1.1)' }} />
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-4xl border-2 border-border shadow-lg">
                  {photoURL.replace('emoji:', '')}
                </div>
              </div>
            ) : (
              // Handle image URLs
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" style={{ animationDuration: '2s', transform: 'scale(1.1)' }} />
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border shadow-lg">
                  <img 
                    src={photoURL} 
                    alt={username} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      console.warn("Failed to load profile image:", photoURL);
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Welcome Message - Clean & Simple */}
        <div 
          className="space-y-2"
          style={{ animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards", opacity: 0 }}
        >
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome, {username}
          </h1>
          
          <p className="text-sm text-muted-foreground">
            Your account is ready
          </p>
        </div>

        {/* Minimal Progress Indicator */}
        <div 
          className="flex justify-center gap-1.5 pt-4"
          style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards", opacity: 0 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

