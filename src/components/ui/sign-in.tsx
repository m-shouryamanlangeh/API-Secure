import React, { useState } from 'react';
import { Chrome, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { SplineScene } from '@/components/ui/splite';

// --- TYPE DEFINITIONS ---
export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onSignIn?: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  onCreateAccount?: () => void;
  onResetPassword?: () => void;
}

// --- SUB-COMPONENTS ---
const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

// --- MAIN COMPONENT ---
export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome Back</span>,
  description = "Sign in to access your API Secure account",
  onSignIn,
  onGoogleSignIn,
  onCreateAccount,
  onResetPassword,
}) => {
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn?.(email.trim(), password);
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-background">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 z-50 p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-200 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-300 text-muted-foreground">{description}</p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email or Username</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="text"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
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
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-600 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-foreground/90">Keep me signed in</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetPassword?.();
                  }}
                  className="hover:underline text-violet-400 transition-colors"
                >
                  Reset password
                </a>
              </div>

              <button
                type="submit"
                className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="animate-element animate-delay-800 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or</span>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={onGoogleSignIn}
              className="animate-element animate-delay-900 w-full flex items-center justify-center gap-3 border-2 border-border rounded-2xl py-4 hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-xl font-medium hover:scale-[1.02] active:scale-[0.98] hover:border-primary/30"
            >
              <Chrome className="w-6 h-6 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
              Continue with Google
            </button>

            {/* Create Account */}
            <p className="animate-element animate-delay-1000 text-center text-sm text-muted-foreground">
              New to API Secure?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCreateAccount?.();
                }}
                className="text-violet-400 hover:underline transition-colors font-medium"
              >
                Sign in with Google to get started
              </a>
            </p>

            {/* Branding */}
            <p className="animate-element animate-delay-1100 text-center text-sm text-muted-foreground pt-4 border-t border-border">
              Engineered by <span className="font-semibold text-foreground">Faizan Q & Team</span>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: 3D Robot with API Secure branding */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="animate-slide-right animate-delay-300 h-full rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-950 dark:via-gray-900 dark:to-black border border-border overflow-hidden relative">
          {/* Spotlight effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-40"></div>
          
          {/* 3D Spline Robot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="text-center space-y-2 p-8">
              <h2 className="text-6xl font-extrabold tracking-tight drop-shadow-2xl">
                <span className="text-white">
                  API Secure
                </span>
              </h2>
              <p className="text-base text-gray-300 font-medium tracking-wide drop-shadow-lg">
                Ease your testing
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
