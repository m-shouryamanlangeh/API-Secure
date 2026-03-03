import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <Shield className="w-24 h-24 text-primary opacity-50" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
