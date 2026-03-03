import { useState } from "react";
import { SignInPage } from "@/components/ui/sign-in";
import { ProfileSetupDialog } from "@/components/ui/profile-setup-dialog";
import { GoogleSignInLoading } from "@/components/ui/google-signin-loading";
import { ProfileSetupLoading } from "@/components/ui/profile-setup-loading";
import { WelcomeScreen } from "@/components/ui/welcome-screen";
import { toast } from "sonner";
import { signInWithGoogleSimple, signInWithPassword, completeProfileSetup } from "@/lib/auth-supabase";

interface AuthProps {
  onAuthSuccess: () => void;
}

type AuthStep = 'google-signin' | 'profile-setup' | 'welcome';

interface UserInfo {
  displayName: string;
  photoURL: string;
  email?: string;
  uid?: string;
}

const Auth = ({ onAuthSuccess }: AuthProps) => {
  const [step, setStep] = useState<AuthStep>('google-signin');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleLoading, setShowGoogleLoading] = useState(false);
  const [showProfileSetupLoading, setShowProfileSetupLoading] = useState(false);
  const [showSignInPage, setShowSignInPage] = useState(true);

  // Handle email/password login
  const handlePasswordSignIn = async (email: string, password: string) => {
    const result = await signInWithPassword(email, password);
    
    if (result.success) {
      toast.success("Login successful!");
      
      // Fade out sign-in page
      setShowSignInPage(false);
      
      // Show welcome screen after fade out
      setTimeout(() => {
        setUserInfo({
          displayName: result.user?.displayName || result.userData?.username || email.split('@')[0],
          photoURL: result.user?.photoURL || "",
        });
        setStep('welcome');
      }, 500);
    } else {
      toast.error(result.error || "Login failed", {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        },
        icon: false,
        duration: 4000,
      });
    }
  };

  // Handle Google sign-in (simplified like Bit Bets)
  const handleGoogleSignIn = async () => {
    console.log("🚀 Google Sign-In button clicked!");
    console.log("========================================");
    
    setIsLoading(true);
    setShowGoogleLoading(true); // Show loading overlay
    
    // Don't show toast here - the overlay is enough
    
    try {
      const result = await signInWithGoogleSimple();
      
      setShowGoogleLoading(false); // Hide loading overlay
      
      console.log("========================================");
      console.log("📊 RECEIVED RESULT FROM signInWithGoogleSimple:");
      console.log("   success:", result.success);
      console.log("   user:", result.user);
      console.log("   isNewUser:", result.isNewUser);
      console.log("   userData:", result.userData);
      console.log("========================================");
      
      if (result.success && result.user) {
        console.log("✅ SUCCESS - Processing result...");
        console.log("   Checking isNewUser flag:", result.isNewUser);
        
        if (result.isNewUser === true) {
          // New user - show profile setup with smooth transition
          console.log("🎯 NEW USER BRANCH - Setting up profile page");
          
          toast.success("Welcome! Let's set up your profile...", { duration: 2000 });
          
          const userInfoData = {
            uid: result.user.uid,
            email: result.user.email || "",
            displayName: result.user.displayName || "",
            photoURL: result.user.photoURL || "",
          };
          
          console.log("   Creating userInfo:", userInfoData);
          setUserInfo(userInfoData);
          
          // Fade out sign-in page first
          setShowSignInPage(false);
          
          // Show profile setup dialog after fade out
          setTimeout(() => {
            console.log("   Setting step to: profile-setup");
            setStep('profile-setup');
            setIsLoading(false);
            console.log("✅ Profile setup should now be visible!");
          }, 500);
        } else {
          // Existing user - show welcome screen
          console.log("🔄 EXISTING USER BRANCH - Going to welcome screen");
          toast.success(`Welcome back!`, { duration: 2000 });
          
          // Fade out sign-in page
          setShowSignInPage(false);
          
          // Show welcome screen after fade out
          setTimeout(() => {
            setUserInfo({
              displayName: result.userData?.username || result.user?.displayName || result.user?.email?.split('@')[0] || "User",
              photoURL: result.userData?.google_photo_url || result.user?.photoURL || "",
            });
            setStep('welcome');
            setIsLoading(false);
          }, 500);
        }
      } else {
        console.error("❌ SIGN-IN FAILED!");
        console.error("   Error:", result.error);
        setIsLoading(false);
        toast.error(result.error || "Failed to sign in with Google", {
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          },
          icon: false,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      setIsLoading(false);
      setShowGoogleLoading(false); // Hide loading overlay on error
      toast.error("An unexpected error occurred", {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        },
        icon: false,
        duration: 4000,
      });
    }
    
    console.log("========================================");
  };

  const handleProfileSetup = async (username: string, password: string, customPhotoURL?: string) => {
    if (!userInfo) return;

    console.log("📝 Starting profile setup...");
    console.log("   Custom photo:", customPhotoURL ? "Yes" : "No");
    
    // Hide the dialog and show loading overlay
    setStep('google-signin'); // This hides the dialog
    setShowProfileSetupLoading(true); // Show loading overlay

    // Use custom photo if provided, otherwise use Google photo
    const finalPhotoURL = customPhotoURL || userInfo.photoURL || "";

    const result = await completeProfileSetup(
      userInfo.uid || "",
      username,
      userInfo.email || "",
      password,
      userInfo.displayName,
      finalPhotoURL
    );

    setShowProfileSetupLoading(false); // Hide loading overlay

    if (result.success) {
      console.log("✅ Profile setup successful!");
      toast.success("Profile setup complete! 🎉", { duration: 2000 });
      
      // Update userInfo with the username and photo they just set
      setUserInfo((prev) => ({
        ...prev,
        displayName: username,
        photoURL: finalPhotoURL,
      }));
      
      // Small delay, then show welcome screen
      setTimeout(() => {
        setStep('welcome');
      }, 800);
    } else {
      console.error("❌ Profile setup failed:", result.error);
      toast.error(result.error || "Failed to set up profile", {
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        },
        icon: false,
        duration: 4000,
      });
      // Return to profile setup dialog on error
      setShowSignInPage(true);
      setStep('profile-setup');
    }
  };

  console.log("🖼️ RENDER - Current state:");
  console.log("   step:", step);
  console.log("   userInfo:", userInfo);
  console.log("   isLoading:", isLoading);

  return (
    <>
      {/* Sign-In Page with fade transition */}
      <div 
        className={`transition-all duration-500 ${
          showSignInPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <SignInPage
          onSignIn={handlePasswordSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          onResetPassword={() => toast.info("Password reset feature coming soon!")}
          onCreateAccount={handleGoogleSignIn}
        />
      </div>
      
      {/* Google Sign-In Loading Overlay */}
      <GoogleSignInLoading show={showGoogleLoading} />
      
      {/* Profile Setup Loading Overlay */}
      {showProfileSetupLoading && userInfo && (
        <ProfileSetupLoading
          show={showProfileSetupLoading}
          username={userInfo.displayName || "User"}
          email={userInfo.email || ""}
          photoURL={userInfo.photoURL || ""}
        />
      )}
      
      {/* Profile Setup Dialog - Shows when step is 'profile-setup' */}
      {step === 'profile-setup' && userInfo && (
        <ProfileSetupDialog
          open={true}
          userEmail={userInfo.email || ""}
          displayName={userInfo.displayName || ""}
          photoURL={userInfo.photoURL || ""}
          onComplete={handleProfileSetup}
          onCancel={() => {
            setShowSignInPage(true);
            setStep('google-signin');
            setUserInfo(null);
            toast.info("Profile setup cancelled");
          }}
        />
      )}
      
      {/* Welcome Screen - Shows after successful profile setup or login */}
      {step === 'welcome' && userInfo && (
        <WelcomeScreen
          username={userInfo.displayName}
          photoURL={userInfo.photoURL}
          onComplete={() => {
            console.log("🎉 Welcome screen complete! Calling onAuthSuccess to show OpticalAnimation");
            onAuthSuccess();
          }}
        />
      )}
    </>
  );
};

export default Auth;

