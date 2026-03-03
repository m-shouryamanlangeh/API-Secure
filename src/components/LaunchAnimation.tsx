import { useEffect, useState } from "react";

interface LaunchAnimationProps {
  onComplete: () => void;
}

const LaunchAnimation = ({ onComplete }: LaunchAnimationProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3500);
    const timer3 = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-1000"
         style={{ opacity: step === 2 ? 0 : 1 }}>
      <div className="text-center animate-scale-in">
        {step === 0 && (
          <h1 className="text-6xl font-bold tracking-tight">
            API Secure
          </h1>
        )}
        {step === 1 && (
          <h2 className="text-4xl font-light tracking-wide text-muted-foreground animate-fade-in">
            Engineered by Faizan Q & Team
          </h2>
        )}
      </div>
    </div>
  );
};

export default LaunchAnimation;
