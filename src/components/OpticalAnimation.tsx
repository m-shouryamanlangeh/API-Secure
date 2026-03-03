import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface OpticalAnimationProps {
  onComplete: () => void;
}

const OpticalAnimation = ({ onComplete }: OpticalAnimationProps) => {
  const [phase, setPhase] = useState<"startup" | "transform" | "subtitle" | "complete">("startup");
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    console.log("🎬 OpticalAnimation MOUNTED - Starting animation!");
    console.log("   Phase:", phase);
    
    // Phase timing - Extended for better visibility
    const startupTimer = setTimeout(() => {
      console.log("🎬 Phase: TRANSFORM (API Secure text)");
      setPhase("transform");
      // Start background transition to white
      setTimeout(() => setBgColor("#FFFFFF"), 500);
    }, 5000); // 0-5s: Meaningful startup animation (EXTENDED)
    const transformTimer = setTimeout(() => {
      console.log("🎬 Phase: SUBTITLE (Engineered by...)");
      setPhase("subtitle");
    }, 8000); // 5-8s: "API Secure" appears
    const subtitleTimer = setTimeout(() => {
      console.log("🎬 Phase: COMPLETE (Fade out)");
      setPhase("complete");
    }, 10000); // 8-10s: subtitle appears
    
    const completeTimer = setTimeout(() => {
      console.log("🎬 OpticalAnimation COMPLETE - Calling onComplete");
      onComplete();
    }, 12000); // At 12s (TOTAL: 12 seconds)

    return () => {
      console.log("🎬 OpticalAnimation UNMOUNTED");
      clearTimeout(startupTimer);
      clearTimeout(transformTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      animate={{
        backgroundColor: bgColor,
      }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Meaningful Startup Animation (0-3.5s) - "Awakening to Focus" */}
      {phase === "startup" && (
        <>
          {/* Central point - System awakening (MADE BIGGER AND BRIGHTER) */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 1],
              scale: [0, 1, 1, 1]
            }}
            transition={{
              duration: 5,
              times: [0, 0.2, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: "20px",  // INCREASED from 8px
              height: "20px",  // INCREASED from 8px
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 0 60px rgba(255, 255, 255, 1), 0 0 120px rgba(255, 255, 255, 0.8)",  // BRIGHTER
              zIndex: 5,
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          />

          {/* Expanding energy rings - Building focus (MADE BIGGER AND BRIGHTER) */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.9, 0.6, 0],  // INCREASED opacity
                scale: [0, 1.5, 2.5, 3.5]
              }}
              transition={{
                duration: 3,  // LONGER duration
                delay: ring * 0.5,
                times: [0, 0.3, 0.6, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                width: "300px",  // INCREASED from 200px
                height: "300px",  // INCREASED from 200px
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.8)",  // THICKER and BRIGHTER
                boxShadow: "0 0 40px rgba(255, 255, 255, 0.6)",  // BRIGHTER
                willChange: "transform, opacity",
                transform: "translateZ(0)",
              }}
            />
          ))}

          {/* Focusing beams - Two lines rotating from vertical to horizontal, then splitting horizontally (MADE THICKER AND BRIGHTER) */}
          {/* Top beam (starts slightly above center) */}
          <motion.div
            className="absolute"
            initial={{ scaleY: 0, opacity: 0, rotate: 0, y: -1 }}
            animate={{ 
              scaleY: [0, 0, 1, 1, 1, 1],
              opacity: [0, 0, 1, 1, 1, 0.8],  // BRIGHTER
              rotate: [0, 0, 0, 0, 90, 90],
              y: [-1, -1, -1, -1, -1, -100]  // SPREAD FURTHER
            }}
            transition={{
              duration: 5,  // LONGER
              times: [0, 0.4, 0.7, 0.85, 0.92, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: "4px",  // THICKER from 2px
              height: "400px",  // LONGER from 300px
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,1) 50%, transparent)",  // BRIGHTER
              boxShadow: "0 0 80px rgba(255, 255, 255, 0.8)",  // BRIGHTER
              transformOrigin: "center center",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          />
          
          {/* Bottom beam (starts slightly below center) */}
          <motion.div
            className="absolute"
            initial={{ scaleY: 0, opacity: 0, rotate: 0, y: 1 }}
            animate={{ 
              scaleY: [0, 0, 1, 1, 1, 1],
              opacity: [0, 0, 1, 1, 1, 0.8],  // BRIGHTER
              rotate: [0, 0, 0, 0, 90, 90],
              y: [1, 1, 1, 1, 1, 100]  // SPREAD FURTHER
            }}
            transition={{
              duration: 5,  // LONGER
              times: [0, 0.4, 0.7, 0.85, 0.92, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: "4px",  // THICKER from 2px
              height: "400px",  // LONGER from 300px
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,1) 50%, transparent)",  // BRIGHTER
              boxShadow: "0 0 80px rgba(255, 255, 255, 0.8)",  // BRIGHTER
              transformOrigin: "center center",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          />

          {/* Convergence glow - Coming together */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0, 0, 0.8, 0.5],
              scale: [0.5, 0.5, 0.5, 1.2, 1.5]
            }}
            transition={{
              duration: 3.5,
              times: [0, 0.5, 0.7, 0.9, 1],
              ease: "easeOut",
            }}
            style={{
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)",
              filter: "blur(50px)",
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          />

          {/* Outer frame - Context forming */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ 
              opacity: [0, 0, 0, 0.4, 0],
              scale: [1.5, 1.5, 1.5, 1, 0.8]
            }}
            transition={{
              duration: 3.5,
              times: [0, 0.6, 0.7, 0.9, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          />
        </>
      )}

      {/* Phase 2: Transformation to Identity (3.5-5s) - API Secure appears ALONE */}
      {phase === "transform" && (
        <div className="relative text-center flex items-center justify-center">
          {/* Horizontal line that transitions to text */}
          <motion.div
            className="absolute"
            initial={{ opacity: 1, scaleX: 1 }}
            animate={{ 
              opacity: [1, 1, 0],
              scaleX: [1, 1.5, 0]
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.5, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: "450px",
              height: "2px",
              background: bgColor === "#000000" 
                ? "linear-gradient(to right, transparent, rgba(255,255,255,1) 50%, transparent)"
                : "linear-gradient(to right, transparent, rgba(0,0,0,1) 50%, transparent)",
              boxShadow: bgColor === "#000000"
                ? "0 0 50px rgba(255, 255, 255, 0.8)"
                : "0 0 30px rgba(0, 0, 0, 0.3)",
            }}
          />

          {/* API Secure text fading in - ALONE */}
          <motion.h1
            className="text-6xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              color: bgColor === "#000000" ? "#FFFFFF" : "#000000",
            }}
          >
            API Secure
          </motion.h1>
        </div>
      )}

      {/* Phase 3: Subtitle appears (5-6.5s) - Transition to subtitle */}
      {phase === "subtitle" && (
        <div className="relative text-center flex items-center justify-center">
          <motion.h2
            className="text-4xl font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1] }}
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              color: bgColor === "#000000" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            Engineered by
          </motion.h2>
        </div>
      )}

      {/* Phase 4: Resolution (6.5-8s) - Fade out */}
      {phase === "complete" && (
        <div className="relative text-center">
          <motion.h2
            className="text-4xl font-light tracking-wide"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0] }}
            transition={{
              duration: 1.5,
              times: [0, 0.7, 1],
              ease: "easeOut",
            }}
            style={{
              color: bgColor === "#000000" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            Faizan Q & Team
          </motion.h2>
        </div>
      )}
    </motion.div>
  );
};

export default OpticalAnimation;

