import React from "react";
import { motion } from "framer-motion";

export const LoadingScreen = ({
  message = "Accessing Data",
  subtitle = "Secure Connection Established",
  variant = "full", // "full" or "inline"
  className = ""
}) => {
  const isInline = variant === "inline";

  return (
    <div className={`
      flex flex-col items-center justify-center w-full relative bg-[var(--content-bg)]
      ${isInline ? "py-8 bg-transparent" : "h-screen w-screen fixed inset-0 z-50"}
      ${className}
    `}>
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Loader Graphic - 'The Digital Core' */}
        <div className={`relative flex items-center justify-center ${isInline ? "w-16 h-16" : "w-32 h-32"}`}>
          {/* Ring 1 - Outer Orbital (Satellite) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[1px] border-[var(--primary-light)]/20 border-t-[var(--primary-color)]/30 opacity-80"
          />

          {/* Ring 2 - Counter Rotating Tech Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className={`absolute rounded-full border-[1.5px] border-transparent border-r-[var(--primary-color)] border-l-[var(--primary-color)]/50 ${isInline ? "inset-1.5" : "inset-3"}`}
          />

          {/* Ring 3 - Inner Power Ring (Pulsing) */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className={`absolute rounded-full border-[3px] border-[var(--content-bg)] border-t-[var(--primary-color)] shadow-[0_0_20px_var(--primary-light)] ${isInline ? "inset-4" : "inset-8"}`}
          />

          {/* Ring 4 - The Core */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`${isInline ? "w-1.5 h-1.5" : "w-3 h-3"} bg-[var(--primary-color)] rounded-full shadow-[0_0_15px_var(--primary-color)] ring-2 ring-[var(--primary-light)]/30`}
          />
        </div>

        {/* Cinematic Text Block */}
        <div className={`${isInline ? "mt-3" : "mt-10"} text-center space-y-1`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={`${isInline ? "text-[13px]" : "text-xl"} font-bold text-[var(--content-text)] tracking-tight`}>
              {message}
            </h3>
            {!isInline && (
              <p className="text-xs font-semibold text-[var(--content-text-muted)] uppercase tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Advanced Progress Bar */}
          {!isInline && (
            <div className="h-1 w-48 bg-[var(--content-bg-secondary)] rounded-full overflow-hidden mx-auto relative mt-4">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent w-1/2 opacity-80"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
