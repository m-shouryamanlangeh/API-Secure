"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Upload, Smile, Image as ImageIcon, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadProfilePhoto, updateUserPhoto } from "@/utils/userProfile";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

// Emoji avatars
const EMOJI_AVATARS = [
  "😊", "😎", "🤖", "👨‍💻", "👩‍💻", "🦊", "🐱", "🐶", "🦁", "🐼",
  "🦄", "🐉", "🔥", "⚡", "🌟", "💎", "🎮", "🎯", "🚀", "🛡️",
  "🎭", "🎪", "👾", "🤠", "🥷", "🧙‍♂️", "🦸", "🧑‍🚀", "👨‍🎨", "🎸"
];

type PhotoType = "emoji" | "upload" | null;

interface PhotoChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoUrl?: string;
  onPhotoChanged: (newPhotoUrl: string) => void;
}

export function PhotoChangeDialog({
  open,
  onOpenChange,
  currentPhotoUrl,
  onPhotoChanged
}: PhotoChangeDialogProps) {
  const [selectedType, setSelectedType] = useState<PhotoType>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setSelectedType("upload");
    };
    reader.readAsDataURL(file);
  };

  const getSelectedPhoto = (): string => {
    if (selectedType === "emoji" && selectedEmoji) return selectedEmoji;
    if (selectedType === "upload" && uploadedImage) return uploadedImage;
    return "";
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!selectedType) {
      toast.error("Please select a photo option");
      return;
    }

    setIsLoading(true);

    try {
      let finalPhotoUrl = "";

      if (selectedType === "emoji" && selectedEmoji) {
        // For emoji, we'll store a special format
        finalPhotoUrl = `emoji:${selectedEmoji}`;
      } else if (selectedType === "upload" && uploadedFile) {
        // Upload to Supabase Storage
        toast.loading("Uploading photo...", { id: "photo-upload" });
        
        const uploadResult = await uploadProfilePhoto(user.uid, uploadedFile);
        
        if (!uploadResult.success || !uploadResult.url) {
          toast.error(uploadResult.error || "Failed to upload photo", { id: "photo-upload" });
          setIsLoading(false);
          return;
        }
        
        finalPhotoUrl = uploadResult.url;
        toast.success("Photo uploaded!", { id: "photo-upload" });
      }

      if (!finalPhotoUrl) {
        toast.error("No photo selected");
        setIsLoading(false);
        return;
      }

      // Update Supabase database
      const updateResult = await updateUserPhoto(user.uid, finalPhotoUrl);
      
      if (!updateResult.success) {
        toast.error(updateResult.error || "Failed to update photo");
        setIsLoading(false);
        return;
      }

      // Update Firebase profile (for non-emoji photos)
      if (!finalPhotoUrl.startsWith('emoji:')) {
        try {
          await updateProfile(user, { photoURL: finalPhotoUrl });
        } catch (error) {
          console.warn("Could not update Firebase profile:", error);
        }
      }

      toast.success("Profile photo updated! 🎉");
      onPhotoChanged(finalPhotoUrl);
      onOpenChange(false);
      
      // Reset state
      setSelectedType(null);
      setSelectedEmoji("");
      setUploadedImage("");
      setUploadedFile(null);
      
    } catch (error) {
      console.error("Error saving photo:", error);
      toast.error("Failed to save photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setSelectedType(null);
      setSelectedEmoji("");
      setUploadedImage("");
      setUploadedFile(null);
    }
  };

  // Render preview based on selection
  const renderPreview = () => {
    const photo = getSelectedPhoto();
    
    if (!photo && currentPhotoUrl) {
      // Show current photo
      if (currentPhotoUrl.startsWith('emoji:')) {
        return (
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-5xl border-2 border-border">
            {currentPhotoUrl.replace('emoji:', '')}
          </div>
        );
      }
      return (
        <img 
          src={currentPhotoUrl} 
          alt="Current" 
          className="w-24 h-24 rounded-full object-cover border-2 border-border"
        />
      );
    }

    if (selectedType === "emoji" && selectedEmoji) {
      return (
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-5xl border-2 border-primary">
          {selectedEmoji}
        </div>
      );
    }

    if (selectedType === "upload" && uploadedImage) {
      return (
        <img 
          src={uploadedImage} 
          alt="Preview" 
          className="w-24 h-24 rounded-full object-cover border-2 border-primary"
        />
      );
    }

    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-border">
        <User className="w-12 h-12 text-white" />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Change Profile Photo
          </DialogTitle>
          <DialogDescription>
            Choose a new profile picture from the options below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            {renderPreview()}
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Emoji Option */}
            <div
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "emoji" 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedType("emoji")}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Choose an Emoji</p>
                  <p className="text-xs text-muted-foreground">Pick from fun emoji avatars</p>
                </div>
                {selectedType === "emoji" && <Check className="w-5 h-5 text-primary" />}
              </div>
              
              {selectedType === "emoji" && (
                <div className="grid grid-cols-10 gap-1 mt-3 p-2 bg-background rounded-md max-h-32 overflow-y-auto">
                  {EMOJI_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-secondary transition-colors ${
                        selectedEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmoji(emoji);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Option */}
            <div
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "upload" 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Upload Photo</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : "JPG, PNG, GIF up to 5MB"}
                  </p>
                </div>
                {selectedType === "upload" && <Check className="w-5 h-5 text-primary" />}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isLoading || !selectedType || (selectedType === "emoji" && !selectedEmoji)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

