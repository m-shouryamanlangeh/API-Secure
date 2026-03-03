import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Check, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";

interface ProfileSetupPageProps {
  userEmail: string;
  displayName: string;
  photoURL: string;
  onComplete: (username: string, password: string, customPhotoURL?: string) => void;
}

// Emoji avatar options
const EMOJI_AVATARS = [
  "😊", "😎", "🤓", "😇", "🥳", "🤩", 
  "😺", "🐶", "🐼", "🦊", "🦁", "🐯",
  "🚀", "⚡", "🔥", "💎", "🌟", "✨",
  "🎮", "💻", "🎨", "🎭", "🎪", "🎯"
];

export const ProfileSetupPage = ({
  userEmail,
  displayName,
  photoURL,
  onComplete
}: ProfileSetupPageProps) => {
  const [username, setUsername] = useState(displayName || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState<"emoji" | "upload">("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setSelectedPhotoType("upload");
      toast.success("Image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const getSelectedPhoto = () => {
    if (selectedPhotoType === "emoji" && selectedEmoji) return `emoji:${selectedEmoji}`;
    if (selectedPhotoType === "upload" && uploadedImage) return uploadedImage;
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const finalPhoto = getSelectedPhoto();
    await onComplete(username.trim(), password, finalPhoto);
    setIsLoading(false);
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-background">
      {/* Left column: profile setup */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Success Icon */}
            <div className="animate-element animate-delay-100 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>

            <h1 className="animate-element animate-delay-200 text-4xl md:text-5xl font-semibold leading-tight">
              <span className="font-light text-foreground tracking-tighter">Welcome! 🎉</span>
            </h1>
            <p className="animate-element animate-delay-300 text-muted-foreground">
              Let's set up your API Secure profile
            </p>

            {/* Profile Picture Selection */}
            <div className="animate-element animate-delay-400 space-y-4">
              <Label className="text-sm font-medium text-muted-foreground">Choose Profile Picture</Label>
              
              {/* Current Selection Preview */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-border backdrop-blur-sm">
                {selectedPhotoType === "emoji" && selectedEmoji ? (
                  <div className="w-16 h-16 rounded-2xl border-2 border-border shadow-md flex items-center justify-center text-4xl bg-background">
                    {selectedEmoji}
                  </div>
                ) : selectedPhotoType === "upload" && uploadedImage ? (
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-16 h-16 rounded-2xl border-2 border-border shadow-md object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Google Connected</span>
                  </div>
                </div>
              </div>

              {/* Picture Options */}
              <div className="space-y-3">
                {/* Emoji Avatars Option */}
                <div 
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPhotoType === "emoji" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPhotoType("emoji")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-xl bg-background">
                      {selectedEmoji || "😊"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Choose Emoji Avatar</p>
                      <p className="text-xs text-muted-foreground">Select from collection</p>
                    </div>
                  </div>
                  
                  {selectedPhotoType === "emoji" && (
                    <div className="grid grid-cols-8 gap-2 animate-fade-in">
                      {EMOJI_AVATARS.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmoji(emoji);
                            toast.success("Emoji selected!");
                          }}
                          className={`w-10 h-10 text-2xl rounded-lg hover:bg-secondary transition-all flex items-center justify-center ${
                            selectedEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-background"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Custom Photo Option */}
                <div 
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPhotoType === "upload" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById('profile-upload')?.click()}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center bg-background">
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload Custom Photo</p>
                      <p className="text-xs text-muted-foreground">Max 2MB (JPG, PNG, GIF)</p>
                    </div>
                  </div>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            {/* Username and Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5 animate-element animate-delay-500">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                  Choose your username
                </Label>
                <div className="mt-2 rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This is how you'll appear in API Secure
                </p>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Create password
                </Label>
                <div className="mt-2 rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
                  Confirm password
                </Label>
                <div className="mt-2 rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password || !confirmPassword}
                className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Setting up your account...
                  </>
                ) : (
                  "Complete Setup & Continue"
                )}
              </button>
            </form>

            {/* What's Next */}
            <div className="animate-element animate-delay-600 space-y-3 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground">What's next?</p>
              <div className="space-y-2">
                {[
                  { icon: "🚀", text: "Access security testing tools" },
                  { icon: "📊", text: "Run API security analysis" },
                  { icon: "📧", text: "Receive reports in Gmail" },
                  { icon: "🔐", text: "Secure personalized testing" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`animate-element animate-delay-${700 + index * 100} flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl hover:bg-secondary/50 transition-colors`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Branding */}
            <p className="animate-element animate-delay-1100 text-center text-sm text-muted-foreground pt-4">
              Engineered by <span className="font-semibold text-foreground">Faizan Q & Team</span>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: Onboarding steps */}
      <section className="hidden md:flex flex-1 items-center justify-center p-8">
        <div className="animate-slide-right animate-delay-300 w-full max-w-lg space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-border backdrop-blur-sm mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">You're Almost There!</h2>
          <p className="text-muted-foreground text-lg">
            Complete your profile to unlock comprehensive API security testing features.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-5 bg-card/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">1</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Set Username</p>
                <p className="text-sm text-muted-foreground">Personalize your API Secure experience</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">2</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Start Testing</p>
                <p className="text-sm text-muted-foreground">Run security analysis on your APIs</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">3</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Get Reports</p>
                <p className="text-sm text-muted-foreground">Receive detailed analysis in your Gmail</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
