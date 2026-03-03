import EmailManagement from "@/components/EmailManagement";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SafeLensSidebar } from "@/components/SafeLensSidebar";

const EmailPage = () => {
  return (
    <SafeLensSidebar>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative">
        <div className="fixed top-6 right-6 z-40">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-16 pb-24 relative z-10 max-w-5xl">
          <EmailManagement />
        </div>

        <footer className="relative bottom-0 left-0 right-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border mt-16">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              Built with Faizan Q & Team • © 2025 API Secure
            </p>
          </div>
        </footer>
      </div>
    </SafeLensSidebar>
  );
};

export default EmailPage;

