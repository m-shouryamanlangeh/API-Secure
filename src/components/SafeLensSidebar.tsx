"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { getUserProfile } from "@/utils/userProfile";
import type { UserProfile } from "@/lib/supabase";

interface SafeLensSidebarProps {
  children: React.ReactNode;
}

// Separate component to use useSidebar hook (must be inside Sidebar context)
function SidebarFooterContent({ 
  userProfile, 
  user, 
  isLoggingOut, 
  handleLogout 
}: { 
  userProfile: UserProfile | null;
  user: typeof auth.currentUser;
  isLoggingOut: boolean;
  handleLogout: () => void;
}) {
  const { open, animate } = useSidebar();
  
  return (
    <div className="flex flex-col gap-2">
      {/* User Profile - Display only, no navigation */}
      <div className="flex items-center justify-start gap-2 py-2">
        {/* Profile Picture - Fixed size, always visible */}
        {userProfile?.google_photo_url?.startsWith('emoji:') ? (
          <div className="h-7 w-7 min-w-[1.75rem] flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-base">
            {userProfile.google_photo_url.replace('emoji:', '')}
          </div>
        ) : userProfile?.google_photo_url || user?.photoURL ? (
          <img
            src={userProfile?.google_photo_url || user?.photoURL || ""}
            className="h-7 w-7 min-w-[1.75rem] flex-shrink-0 rounded-full object-cover"
            alt="Avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <User className="h-7 w-7 min-w-[1.75rem] flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 p-1 text-neutral-700 dark:text-neutral-200" />
        )}
        
        {/* Username - Only shows when sidebar is open, wraps to multiple lines */}
        <motion.span
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            x: animate ? (open ? 0 : -10) : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
            opacity: { duration: 0.25 },
          }}
          style={{
            display: animate ? (open ? "block" : "none") : "block",
          }}
          className="text-neutral-700 dark:text-neutral-200 text-sm !p-0 !m-0 max-w-[120px] break-words leading-tight"
        >
          {userProfile?.username || user?.displayName || user?.email?.split('@')[0] || "User"}
        </motion.span>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 text-left w-full transition-all",
          isLoggingOut && "opacity-50 cursor-not-allowed"
        )}
      >
        <LogOut className={cn(
          "text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 transition-transform",
          isLoggingOut && "animate-pulse"
        )} />
        <motion.span
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            x: animate ? (open ? 0 : -10) : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
            opacity: { duration: 0.25 },
          }}
          style={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
          }}
          className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition-transform duration-200 whitespace-pre !p-0 !m-0"
        >
          {isLoggingOut ? "Signing out..." : "Logout"}
        </motion.span>
      </button>
    </div>
  );
}

export function SafeLensSidebar({ children }: SafeLensSidebarProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const user = auth.currentUser;

  // Fetch user profile from Supabase on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          console.log("📸 User profile loaded:", {
            photoURL: profile.google_photo_url,
            username: profile.username
          });
        }
      }
    };
    
    fetchUserProfile();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Show logout toast
      toast.loading("Signing out...", { id: "logout" });
      
      // Wait a moment for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Update toast
      toast.success("Logged out successfully!", { id: "logout" });
      
      // Wait for toast to be visible
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reload the page to reset all state and show login
      window.location.href = "/";
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", { id: "logout" });
      setIsLoggingOut(false);
    }
  };

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-background w-full min-h-screen mx-auto"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <SidebarFooterContent 
            userProfile={userProfile}
            user={user}
            isLoggingOut={isLoggingOut}
            handleLogout={handleLogout}
          />
        </SidebarBody>
      </Sidebar>
      {/* Main content with left margin for fixed sidebar */}
      <div className="flex flex-1 w-full md:ml-[60px]">
        <div className="flex-1 w-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

