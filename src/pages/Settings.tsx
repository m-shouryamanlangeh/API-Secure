import { useState, useEffect } from "react";
import { SafeLensSidebar } from "@/components/SafeLensSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PhotoChangeDialog } from "@/components/ui/photo-change-dialog";
import { 
  User, Bell, Shield, Key, Trash2, 
  Save, Camera, Edit2, Check, X 
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/utils/userProfile";
import type { UserProfile } from "@/lib/supabase";

const Settings = () => {
  const currentUser = auth.currentUser;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile Settings
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [testCompleteNotif, setTestCompleteNotif] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  
  // Photo Change Dialog
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser?.uid) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
          setUsername(profile.username || "");
          setEmail(profile.email || currentUser.email || "");
        }
      }
    };
    
    loadUserProfile();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Profile updated successfully!");
    setIsEditingUsername(false);
    setIsLoading(false);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success("Notification preferences saved!");
    setIsLoading(false);
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success("Security settings updated!");
    setIsLoading(false);
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion is not available in this demo", {
      description: "Contact support for account deletion requests"
    });
  };

  return (
    <SafeLensSidebar>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account and preferences
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Update your profile information and photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {userProfile?.google_photo_url ? (
                    userProfile.google_photo_url.startsWith('emoji:') ? (
                      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-4xl border-2 border-border">
                        {userProfile.google_photo_url.replace('emoji:', '')}
                      </div>
                    ) : (
                      <img 
                        src={userProfile.google_photo_url} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                      />
                    )
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <button 
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setIsPhotoDialogOpen(true)}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold">{username}</h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsPhotoDialogOpen(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
              
              {/* Photo Change Dialog */}
              <PhotoChangeDialog
                open={isPhotoDialogOpen}
                onOpenChange={setIsPhotoDialogOpen}
                currentPhotoUrl={userProfile?.google_photo_url}
                onPhotoChanged={(newPhotoUrl) => {
                  setUserProfile(prev => prev ? { ...prev, google_photo_url: newPhotoUrl } : null);
                }}
              />

              <Separator />

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditingUsername}
                    className="flex-1"
                  />
                  {isEditingUsername ? (
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsername(userProfile?.username || "");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsEditingUsername(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Complete Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when security tests finish
                    </p>
                  </div>
                  <Switch
                    checked={testCompleteNotif}
                    onCheckedChange={setTestCompleteNotif}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly security summary reports
                    </p>
                  </div>
                  <Switch
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical security vulnerability alerts
                    </p>
                  </div>
                  <Switch
                    checked={securityAlerts}
                    onCheckedChange={setSecurityAlerts}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="5"
                    max="120"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically log out after inactive period
                  </p>
                </div>

                <Separator />

                <div>
                  <Button variant="outline" className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-semibold mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your data, reports, and settings will be permanently deleted.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SafeLensSidebar>
  );
};

export default Settings;

