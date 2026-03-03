import { auth } from "./firebase";
import { getUserProfile } from "@/utils/userProfile";
import { toast } from "sonner";

/**
 * Enhanced n8n webhook call with Firebase user authentication + Supabase data
 * This function will pass user-specific information to n8n for email automation
 */
export const callN8NWithAuth = async (payload: Record<string, unknown>, file?: File) => {
  try {
    // Get current authenticated user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      toast.error("Please login to use security testing");
      throw new Error("User not authenticated");
    }

    console.log("👤 Current user:", currentUser.uid, currentUser.email);

    // Get user data from Supabase
    const userData = await getUserProfile(currentUser.uid);
    
    if (!userData) {
      toast.error("User profile not found");
      throw new Error("User data not found in Supabase");
    }

    console.log("📂 User profile loaded:", userData);

    // Enhanced payload with user information
    const enhancedPayload: Record<string, unknown> = {
      ...payload,
      // User identification
      userId: currentUser.uid,
      userEmail: currentUser.email || userData.email,
      username: userData.username,
      // Google account info (if connected)
      googleEmail: userData.google_email || currentUser.email,
      googleConnected: userData.google_connected || false,
    };

    console.log("📦 Enhanced Payload for n8n:", JSON.stringify(enhancedPayload, null, 2));

    // Call n8n webhook (use proxy in dev to avoid CORS)
    const webhookPath = import.meta.env.VITE_N8N_WEBHOOK_PATH || "/webhook/testingIEHintegration";
    const webhookUrl = import.meta.env.DEV
      ? webhookPath  // Dev: use Vite proxy
      : `${import.meta.env.VITE_N8N_WEBHOOK_BASE_URL}${webhookPath}`; // Prod: direct
    console.log("🌐 Calling n8n webhook...");
    console.log("🔄 File upload mode:", !!file);
    console.log("📍 Using URL:", webhookUrl);
    
    let response;
    
    // If file is provided, send as multipart/form-data
    if (file) {
      console.log("📄 Uploading file:", file.name);
      const formData = new FormData();
      formData.append("data", file); // n8n expects binary data in "data" field
      
      // Add other payload fields as form data
      Object.keys(enhancedPayload).forEach(key => {
        const value = enhancedPayload[key];
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      
      response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        // No Content-Type header - browser will set it with boundary
      });
    } else {
      // Regular JSON payload
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancedPayload),
      });
    }

    console.log("✅ n8n Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ n8n Error:", errorText);
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("✅ n8n Response Data:", responseData);

    return {
      success: true,
      data: responseData,
    };

  } catch (error) {
    const err = error as Error;
    console.error("❌ Error calling n8n:", err);
    return {
      success: false,
      error: err.message || "Failed to start security analysis",
    };
  }
};

/**
 * Check if current user has completed all auth requirements
 */
export const checkAuthRequirements = async () => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return {
      authenticated: false,
      googleConnected: false,
      canUseApp: false,
      message: "Please login to continue",
    };
  }

  // Get user data from Supabase
  const userData = await getUserProfile(currentUser.uid);
  
  if (!userData) {
    return {
      authenticated: true,
      googleConnected: false,
      canUseApp: true, // Allow app usage even without profile (will use email)
      message: "Profile not found, but you can still use the app",
    };
  }

  return {
    authenticated: true,
    googleConnected: userData.google_connected || false,
    canUseApp: true, // Allow all authenticated users to use the app
    message: "Ready to use API Secure",
    userData,
  };
};

