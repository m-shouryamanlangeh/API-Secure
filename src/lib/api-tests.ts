import { supabase } from './supabase';
import { auth } from './firebase';

// Type definitions for API test tracking
export interface ApiTest {
  id: string;
  user_id: string;
  
  // Test Details
  test_name: string | null;
  urls: string[];
  test_types: string[];
  cors_mode: string | null;
  origin_url: string | null;
  recipient_emails: string[];
  
  // Status & Tracking
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Results
  result_summary: TestResultSummary | null;
  report_url: string | null;
  error_message: string | null;
  
  // Notifications
  email_sent: boolean;
  notification_read: boolean;
  
  // Timestamps
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  
  // Metadata
  metadata: Record<string, unknown>;
}

export interface TestResultSummary {
  total_urls?: number;
  vulnerabilities_found?: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  [key: string]: unknown;
}

/**
 * Create a new API test record
 */
export const createApiTest = async (testData: {
  test_name?: string;
  urls: string[];
  test_types: string[];
  cors_mode?: string;
  origin_url?: string;
  recipient_emails?: string[];
  user_email?: string;
  username?: string;
}): Promise<{ success: boolean; test_id?: string; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate a descriptive test name
    const testTypesStr = testData.test_types.join(', ') || 'Security Test';
    const urlCount = testData.urls.length;
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const generatedName = testData.test_name || 
      `${testTypesStr} - ${urlCount} URL${urlCount > 1 ? 's' : ''} - ${timestamp}`;

    const { data, error } = await supabase
      .from('api_tests')
      .insert({
        user_id: user.uid,
        test_name: generatedName,
        urls: testData.urls,
        test_types: testData.test_types,
        cors_mode: testData.cors_mode || null,
        origin_url: testData.origin_url || null,
        recipient_emails: testData.recipient_emails || [],
        status: 'pending',
        progress: 0,
        email_sent: false,
        notification_read: false,
        metadata: {
          user_email: testData.user_email || user.email,
          username: testData.username || user.displayName,
          created_by: user.uid,
          source: 'web_app'
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating API test:', error);
      return { success: false, error: error.message };
    }

    return { success: true, test_id: data.id };
  } catch (error) {
    console.error('Error creating API test:', error);
    return { success: false, error: 'Failed to create test record' };
  }
};

/**
 * Get all tests for current user
 */
export const getUserTests = async (limit = 50): Promise<ApiTest[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('api_tests')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user tests:', error);
      return [];
    }

    return (data as ApiTest[]) || [];
  } catch (error) {
    console.error('Error fetching user tests:', error);
    return [];
  }
};

/**
 * Get a specific test by ID
 */
export const getTestById = async (testId: string): Promise<ApiTest | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const { data, error } = await supabase
      .from('api_tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', user.uid)
      .single();

    if (error) {
      console.error('Error fetching test:', error);
      return null;
    }

    return data as ApiTest;
  } catch (error) {
    console.error('Error fetching test:', error);
    return null;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (testId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const { error } = await supabase
      .from('api_tests')
      .update({ notification_read: true })
      .eq('id', testId)
      .eq('user_id', user.uid);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Get unread test notifications
 */
export const getUnreadNotifications = async (): Promise<ApiTest[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const { data, error } = await supabase
      .from('api_tests')
      .select('*')
      .eq('user_id', user.uid)
      .eq('status', 'completed')
      .eq('notification_read', false)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }

    return (data as ApiTest[]) || [];
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
};

/**
 * Subscribe to real-time test updates
 */
export const subscribeToTestUpdates = (
  userId: string,
  callback: (test: ApiTest) => void
) => {
  const subscription = supabase
    .channel('api_tests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'api_tests',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        if (payload.new) {
          callback(payload.new as ApiTest);
        }
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time updates
 */
export const unsubscribeFromTestUpdates = async (subscription: ReturnType<typeof subscribeToTestUpdates>) => {
  await supabase.removeChannel(subscription);
};

/**
 * Delete a test (if needed)
 */
export const deleteTest = async (testId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const { error } = await supabase
      .from('api_tests')
      .delete()
      .eq('id', testId)
      .eq('user_id', user.uid);

    if (error) {
      console.error('Error deleting test:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting test:', error);
    return false;
  }
};

/**
 * Get test statistics for dashboard
 */
export const getTestStatistics = async (): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }

    const { data, error } = await supabase
      .from('api_tests')
      .select('status')
      .eq('user_id', user.uid);

    if (error) {
      console.error('Error fetching statistics:', error);
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }

    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      processing: data.filter(t => t.status === 'processing').length,
      completed: data.filter(t => t.status === 'completed').length,
      failed: data.filter(t => t.status === 'failed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
  }
};

