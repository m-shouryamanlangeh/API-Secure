import { supabase, UserProfile } from '@/lib/supabase';

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    console.log("📂 Fetching user profile from Supabase for UID:", uid);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user doesn't exist
        console.log("👤 No profile found in Supabase");
        return null;
      }
      throw error;
    }

    console.log("✅ Profile found in Supabase:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return null;
  }
}

/**
 * Save or update user profile in Supabase
 */
export async function saveUserProfile(
  uid: string,
  email: string,
  username: string,
  googleDisplayName?: string,
  googlePhotoUrl?: string,
  googleEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Trim email and username to avoid spacing issues
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedGoogleEmail = googleEmail?.trim();
    
    console.log("💾 Saving user profile to Supabase...");
    console.log("   UID:", uid);
    console.log("   Email:", trimmedEmail);
    console.log("   Username:", trimmedUsername);

    // First, check if user already exists by email or UID
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or(`id.eq.${uid},email.eq.${trimmedEmail}`)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("❌ Error checking existing user:", checkError);
      return {
        success: false,
        error: checkError.message || 'Failed to check existing user'
      };
    }

    const profileData: Partial<UserProfile> = {
      id: uid,
      email: trimmedEmail,
      username: trimmedUsername,
      google_connected: !!googleEmail,
      has_password: true,
      last_login: new Date().toISOString(),
    };

    // Add Google data if available
    if (googleDisplayName) profileData.google_display_name = googleDisplayName;
    if (googlePhotoUrl) profileData.google_photo_url = googlePhotoUrl;
    if (trimmedGoogleEmail) profileData.google_email = trimmedGoogleEmail;

    let result;
    
    if (existingUser) {
      // Update existing user
      console.log("📝 Updating existing user profile...");
      // Don't update created_at for existing users
      result = await supabase
        .from('users')
        .update(profileData)
        .eq('id', uid);
    } else {
      // Insert new user
      console.log("➕ Creating new user profile...");
      profileData.created_at = new Date().toISOString();
      result = await supabase
        .from('users')
        .insert([profileData]);
    }

    if (result.error) {
      console.error("❌ Supabase operation error:", result.error);
      
      // Handle specific errors
      if (result.error.code === '23505') {
        if (result.error.message.includes('users_email_key')) {
          return {
            success: false,
            error: 'This email is already registered. Please use a different email or login instead.'
          };
        }
        if (result.error.message.includes('users_username_key')) {
          return {
            success: false,
            error: 'This username is already taken. Please choose a different username.'
          };
        }
      }
      
      return {
        success: false,
        error: result.error.message || 'Failed to save profile'
      };
    }

    console.log("✅ Profile saved successfully to Supabase");
    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("❌ Error saving user profile:", err);
    return {
      success: false,
      error: err.message || 'Failed to save profile'
    };
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(uid: string): Promise<void> {
  try {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', uid);
    
    console.log("✅ Last login updated for UID:", uid);
  } catch (error) {
    console.error("❌ Error updating last login:", error);
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (excludeUid) {
      query = query.neq('id', excludeUid);
    }

    const { data, error } = await query;

    if (error) throw error;

    return !data || data.length === 0;
  } catch (error) {
    console.error("❌ Error checking username availability:", error);
    return false;
  }
}

/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("📸 Uploading profile photo to Supabase Storage...");
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uid}-${Date.now()}.${fileExt}`;
    const filePath = `${uid}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return {
        success: false,
        error: uploadError.message || 'Failed to upload photo'
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log("✅ Photo uploaded successfully:", urlData.publicUrl);
    
    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    const err = error as Error;
    console.error("❌ Error uploading profile photo:", err);
    return {
      success: false,
      error: err.message || 'Failed to upload photo'
    };
  }
}

/**
 * Update user's profile photo URL in database
 */
export async function updateUserPhoto(
  uid: string,
  photoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("📸 Updating profile photo in Supabase...");
    console.log("   UID:", uid);
    console.log("   New Photo URL:", photoUrl.substring(0, 50) + "...");

    const { error } = await supabase
      .from('users')
      .update({ 
        google_photo_url: photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', uid);

    if (error) {
      console.error("❌ Error updating photo:", error);
      return {
        success: false,
        error: error.message || 'Failed to update photo'
      };
    }

    console.log("✅ Profile photo updated successfully");
    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("❌ Error updating profile photo:", err);
    return {
      success: false,
      error: err.message || 'Failed to update photo'
    };
  }
}

