import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const TypewriterText = ({ text, delay = 0 }) => {
  const characters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className="overflow-hidden flex items-center justify-center"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const WelcomeScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-50 text-slate-900 overflow-hidden font-sans"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
        transition: { duration: 0.8, ease: "easeInOut" } 
      }}
    >
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-x-0 top-0 h-96 bg-linear-to-b from-indigo-100/50 to-transparent" />
        <div className="absolute inset-0 bg-size-[24px_24px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Icon with Glow */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            delay: 0.2 
          }}
          className="relative mb-10"
        >
          <div className="absolute -inset-6 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Wallet className="w-10 h-10 text-indigo-600 stroke-[1.5]" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg ring-4 ring-white"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.div>

        {/* Typewriter Title */}
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TypewriterText text="B2B USER PANEL" delay={0.6} />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-slate-500 mt-3 font-medium flex items-center gap-2"
          >
            <ShieldCheck size={18} className="text-indigo-500" />
            Securing Your Financial Future
          </motion.p>
        </div>

        {/* Sophisticated Progress Bar */}
        <div className="w-full max-w-xs mt-8">
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden relative border border-slate-100/50">
            <motion.div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-indigo-500 to-indigo-700 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
            
            {/* Glossy reflection on progress bar */}
            <motion.div
              className="absolute top-0 left-0 h-full w-20 bg-white/30 skew-x-[-20deg]"
              animate={{ 
                left: ["-100%", "200%"] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
          
          <div className="flex justify-between mt-3">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] font-bold text-slate-400 tracking-widest uppercase"
            >
              System Ready
            </motion.span>
            <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">
              {progress}%
            </span>
          </div>
        </div>

        {/* Floating Background Accents */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 bg-indigo-50/50 w-32 h-32 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-20 bg-blue-50/50 w-40 h-40 rounded-full blur-3xl -z-10"
        />
      </motion.div>

      {/* Production-Ready Footer Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 text-slate-400 text-xs font-medium tracking-[0.2em] flex items-center gap-3"
      >
        <Zap size={14} className="text-indigo-400" />
        VERSION 4.0.0 ENCRYPTED
      </motion.div>
    </motion.div>
  );
};

