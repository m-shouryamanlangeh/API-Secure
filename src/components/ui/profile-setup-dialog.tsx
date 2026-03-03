import { useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ProfileSetupDialogProps {
  open: boolean;
  userEmail: string;
  displayName: string;
  photoURL: string;
  onComplete: (username: string, password: string) => void;
  onCancel?: () => void;
}

export function ProfileSetupDialog({
  open,
  userEmail,
  displayName,
  photoURL,
  onComplete,
  onCancel,
}: ProfileSetupDialogProps) {
  const id = useId();
  const [username, setUsername] = useState(displayName || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    await onComplete(username.trim(), password);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border transition-all duration-300">
        {/* Header Gradient */}
        <div
          className="px-6 py-4 h-32 transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        />

        {/* Avatar Section */}
        <div 
          className="-mt-16 flex justify-center transition-all duration-500" 
          style={{ animation: "smoothZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards", opacity: 0 }}
        >
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg rounded-full transition-all duration-500 hover:scale-105">
            <AvatarImage src={photoURL} alt="Profile" className="transition-transform duration-500" />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Welcome Text */}
        <div 
          className="px-6 text-center transition-all duration-300" 
          style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards", opacity: 0 }}
        >
          <h2 className="text-2xl font-bold text-foreground transition-all duration-300">Welcome! 🎉</h2>
          <p className="text-sm text-muted-foreground mt-2 transition-all duration-300">
            {userEmail}
          </p>
          <p className="text-sm text-muted-foreground mt-1 transition-all duration-300">
            Let's set up your API Secure profile
          </p>
        </div>

        {/* Form */}
        <div 
          className="px-6 pb-2 space-y-4 transition-all duration-300" 
          style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards", opacity: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 transition-all duration-300">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-username`} className="text-sm font-medium">
                Username
              </Label>
              <Input
                id={`${id}-username`}
                type="text"
                placeholder="Choose your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 transition-all duration-200 focus:scale-[1.02]"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`} className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id={`${id}-password`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-confirm-password`} className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id={`${id}-confirm-password`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter 
          className="border-t border-border px-6 py-4 bg-background rounded-b-2xl transition-all duration-300" 
          style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards", opacity: 0 }}
        >
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !username.trim() || !password || !confirmPassword}
            className="w-full sm:w-auto transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              "Complete Setup & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

