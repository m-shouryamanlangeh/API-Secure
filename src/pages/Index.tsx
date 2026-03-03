import { useEffect, useRef, useState } from "react";
import TestingForm from "@/components/TestingForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import FloatingEmojis from "@/components/FloatingEmojis";
import { SafeLensSidebar } from "@/components/SafeLensSidebar";
import { Shield, Zap, Lock, Globe, TrendingUp, CheckCircle2, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Floating Paths Component for animated background
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const Index = () => {
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isWhyVisible, setIsWhyVisible] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsAboutVisible(true);
        }
      });
    }, observerOptions);

    const whyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsWhyVisible(true);
        }
      });
    }, observerOptions);

    if (aboutRef.current) aboutObserver.observe(aboutRef.current);
    if (whyRef.current) whyObserver.observe(whyRef.current);

    return () => {
      aboutObserver.disconnect();
      whyObserver.disconnect();
    };
  }, []);

  return (
    <SafeLensSidebar>
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        {/* Animated Background Paths - Fixed Position */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: 0.35 }}>
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        
        {/* Background gradient overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-background via-background to-accent/5" />
        
        <FloatingEmojis />
        <div className="fixed top-6 right-6 z-40">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-16 pb-24 relative z-10">
          <div className="text-center mb-16 space-y-3 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              API Secure
            </h1>
            <p className="text-base md:text-lg text-muted-foreground/80 font-light tracking-wide">
              API Security Testing
            </p>
          </div>

          <TestingForm />

          {/* About Section */}
          <div 
            ref={aboutRef}
            className={`mt-48 mb-20 transition-all duration-1000 ${
              isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className={`text-center mb-10 transition-all duration-700 delay-100 ${
              isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                About API Secure
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                AI-powered security testing platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto relative">
              {/* What is API Secure */}
              <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 ${
                isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="mb-3 inline-block p-2.5 bg-primary/10 rounded-xl">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">What is API Secure?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    Modern security testing platform for identifying API and web application vulnerabilities through AI-driven analysis.
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">HTTP security headers analysis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">SSL/TLS configuration testing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">Server version disclosure detection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">Improper error handling detection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">CORS policy validation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 ${
                isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="mb-3 inline-block p-2.5 bg-primary/10 rounded-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">AI-Powered Analysis</h4>
                        <p className="text-xs text-muted-foreground">Intelligent threat detection with GPT</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">Flexible Testing</h4>
                        <p className="text-xs text-muted-foreground">Single, multiple, or batch file upload</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">Professional Reports</h4>
                        <p className="text-xs text-muted-foreground">Email reports with detailed analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Section */}
          <div 
            ref={whyRef}
            className={`mt-32 mb-24 transition-all duration-1000 ${
              isWhyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className={`text-center mb-10 transition-all duration-700 delay-100 ${
              isWhyVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Why API Secure?
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Security testing made simple
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Reason 1 */}
              <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 ${
                isWhyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <div className="mb-3 inline-block p-2.5 bg-primary/10 rounded-xl">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stay Ahead of Threats</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Identify and fix vulnerabilities before attackers exploit them.
                  </p>
                </div>
              </div>

              {/* Reason 2 */}
              <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 ${
                isWhyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <div className="mb-3 inline-block p-2.5 bg-primary/10 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Compliance Ready</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Meet OWASP, NIST, and CIS Benchmarks with automated assessments.
                  </p>
                </div>
              </div>

              {/* Reason 3 */}
              <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 ${
                isWhyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '600ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <div className="mb-3 inline-block p-2.5 bg-primary/10 rounded-xl">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Save Time</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Automate security testing across hundreds of endpoints in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative py-6 bg-background border-t border-border mt-16 z-10">
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

export default Index;
