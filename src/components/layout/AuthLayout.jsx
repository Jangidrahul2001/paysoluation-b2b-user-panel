import React from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import LogoWhite from '../../assets/logo.png';

export const AuthLayout = ({ children, title, subtitle, imagePosition = 'left' }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
      <m.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[720px] p-2 md:p-3 relative ${imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}
      >
        {/* Visual Slider Side */}
        <m.div
          layout
          transition={{
            type: "spring",
            duration: 0.8,
            bounce: 0.15
          }}
          className="hidden md:block w-full md:w-[45%] h-[200px] md:h-auto relative rounded-[2rem] overflow-hidden shrink-0"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-1000"
          >
            <source src="https://res.cloudinary.com/dhz60qrwq/video/upload/v1777980603/b2b-userpanel_a8kvmk.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"></div>

          <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-10">
            {/* <img src={LogoWhite} alt="logo" className="h-8 w-auto object-contain" /> */}
            <div className="flex items-center gap-4">
              <Link to={imagePosition === 'left' ? "/signup" : "/login"} className="text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                {imagePosition === 'left' ? 'Sign Up' : 'Log In'}
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 backdrop-blur-md">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed= Sarah.ux"
                  alt="Avatar"
                />
              </div>
              <div className="text-white">
                <p className="font-black leading-none mb-1 text-sm">User Portal</p>
                <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider font-mono">Pay Soluation</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white bg-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
          </div>
        </m.div>

        {/* Content/Form Side */}
        <m.div
          layout
          transition={{
            type: "spring",
            duration: 0.8,
            bounce: 0.15
          }}
          className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-center"
        >
          <div className="max-w-[440px] mx-auto w-full">

            {children}

            <div className="mt-12 flex justify-center gap-7 text-slate-400">
              <a href="https://www.facebook.com/camleniosoftware/" className="hover:text-indigo-600 transition-colors duration-300"><Facebook size={18} /></a>
              <a href="https://x.com/camlenio" className="hover:text-indigo-600 transition-colors duration-300"><Twitter size={18} /></a>
              <a href="https://www.linkedin.com/company/camlenio/?originalSubdomain=in" className="hover:text-indigo-600 transition-colors duration-300"><Linkedin size={18} /></a>
              <a href="https://www.instagram.com/camleniosoftware/" className="hover:text-indigo-600 transition-colors duration-300"><Instagram size={18} /></a>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                Copyright © 2026 Pay Soluation. All rights reserved.
              </span>
            </div>
          </div>
        </m.div>
      </m.div>
    </div>
  );
};
