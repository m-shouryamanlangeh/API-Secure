import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, X, Plus, Mail, Users, FileText } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/utils/userProfile";

interface EmailRecipient {
  id: string;
  email: string;
}

const EmailManagement = () => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add recipient
  const addRecipient = () => {
    const trimmedEmail = currentEmail.trim();
    
    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check for duplicates
    if (recipients.some(r => r.email === trimmedEmail)) {
      toast.error("Email already added");
      return;
    }

    setRecipients([
      ...recipients,
      { id: Date.now().toString(), email: trimmedEmail }
    ]);
    setCurrentEmail("");
    toast.success("Recipient added");
  };

  // Remove recipient
  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    toast.success("Recipient removed");
  };

  // Send emails
  const sendEmails = async () => {
    // Validation
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Please login to send emails");
      return;
    }

    setIsLoading(true);

    try {
      // Get user data
      const userData = await getUserProfile(currentUser.uid);
      
      if (!userData) {
        toast.error("User profile not found");
        return;
      }

      // Prepare email payload for n8n
      const payload = {
        action: "send_custom_email",
        userId: currentUser.uid,
        userEmail: currentUser.email || userData.email,
        username: userData.username,
        googleEmail: userData.google_email || currentUser.email,
        recipients: recipients.map(r => r.email),
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
      };

      // Call n8n webhook
      const webhookPath = import.meta.env.VITE_N8N_WEBHOOK_PATH || "/webhook/testingIEHintegration";
      const webhookUrl = import.meta.env.DEV
        ? webhookPath
        : `${import.meta.env.VITE_N8N_WEBHOOK_BASE_URL}${webhookPath}`;

      console.log("📧 Sending emails to n8n...");
      console.log("Recipients:", recipients.length);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send emails: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Email sent successfully:", result);

      toast.success(`Emails sent successfully to ${recipients.length} recipient(s)! 🎉`, {
        duration: 4000,
      });

      // Clear form
      setRecipients([]);
      setSubject("");
      setMessage("");

    } catch (error) {
      console.error("❌ Error sending emails:", error);
      toast.error("Failed to send emails. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="h-8 w-8 text-primary" />
          Email Management
        </h2>
        <p className="text-muted-foreground">
          Send custom emails to multiple recipients
        </p>
      </div>

      <Separator />

      {/* Recipients Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recipients
          </CardTitle>
          <CardDescription>
            Add email addresses of people you want to send to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Recipient */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address (e.g., user@example.com)"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecipient();
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={addRecipient}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {recipients.length} recipient(s) added:
              </Label>
              <div className="flex flex-wrap gap-2">
                {recipients.map((recipient) => (
                  <Badge
                    key={recipient.id}
                    variant="secondary"
                    className="gap-2 px-3 py-1"
                  >
                    <Mail className="h-3 w-3" />
                    {recipient.email}
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      disabled={isLoading}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {recipients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recipients added yet</p>
              <p className="text-sm">Add email addresses above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Email Content
          </CardTitle>
          <CardDescription>
            Compose your email message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Send Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setRecipients([]);
            setSubject("");
            setMessage("");
            toast.success("Form cleared");
          }}
          disabled={isLoading}
        >
          Clear All
        </Button>
        <Button
          onClick={sendEmails}
          disabled={isLoading || recipients.length === 0}
          className="gap-2"
          size="lg"
        >
          <Send className="h-4 w-4" />
          {isLoading ? "Sending..." : `Send to ${recipients.length} Recipient(s)`}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">How it works</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Emails are sent via your connected Gmail account</li>
                <li>• Recipients will see your email as the sender</li>
                <li>• All emails are sent through secure n8n automation</li>
                <li>• You can send to multiple recipients at once</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailManagement;

