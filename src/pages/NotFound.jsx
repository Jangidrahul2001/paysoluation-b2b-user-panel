import React, { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { m, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass, Wifi } from 'lucide-react';
import Error404 from '../assets/error404.lottie';

// ─── Stagger variants ───────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
};

// ─── Floating ambient blob ───────────────────────────────────
function AmbientBlob({ style, animate, transition }) {
  return (
    <m.div
      className="absolute rounded-full pointer-events-none"
      style={{ filter: 'blur(72px)', ...style }}
      animate={animate}
      transition={{ repeat: Infinity, ease: 'easeInOut', ...transition }}
    />
  );
}

// ─── Tiny star particle ──────────────────────────────────────
function Particle({ x, y, delay, size }) {
  return (
    <m.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        background: 'radial-gradient(circle, #93c5fd, #818cf8)',
      }}
      animate={{ y: [0, -14, 0], opacity: [0.15, 0.55, 0.15], scale: [1, 1.5, 1] }}
      transition={{ delay, duration: 3.5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

const PARTICLES = [
  { x: 8, y: 20, delay: 0, size: 3 },
  { x: 18, y: 75, delay: 1.2, size: 2 },
  { x: 30, y: 40, delay: 0.6, size: 4 },
  { x: 55, y: 15, delay: 2, size: 2 },
  { x: 70, y: 60, delay: 0.3, size: 3 },
  { x: 82, y: 30, delay: 1.7, size: 4 },
  { x: 92, y: 80, delay: 0.9, size: 2 },
  { x: 45, y: 85, delay: 1.4, size: 3 },
  { x: 65, y: 90, delay: 2.3, size: 2 },
  { x: 12, y: 55, delay: 1.8, size: 4 },
];

// ─── Mouse-tracking tilt card ────────────────────────────────
function TiltCard({ children }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 120, damping: 22 });
  const springRy = useSpring(ry, { stiffness: 120, damping: 22 });

  const handleMouse = (e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = e.clientX - left - width / 2;
    const cy = e.clientY - top - height / 2;
    rx.set((cy / height) * -10);
    ry.set((cx / width) * 10);
  };

  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{
        rotateX: springRx,
        rotateY: springRy,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
    >
      {children}
    </m.div>
  );
}

// ═══════════════════════════════════════════════════════════════
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, #dbeafe 0%, #ede9fe 40%, #f8faff 100%)',
      }}
    >
      {/* ── Ambient blobs ─────────────────────────────── */}
      <AmbientBlob
        style={{ width: 520, height: 420, top: '-12%', left: '-8%', background: 'radial-gradient(circle, hsla(217,91%,68%,0.22), transparent 70%)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12 }}
      />
      <AmbientBlob
        style={{ width: 400, height: 380, bottom: '-14%', right: '-6%', background: 'radial-gradient(circle, hsla(262,80%,72%,0.18), transparent 70%)' }}
        animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
        transition={{ duration: 14, delay: 2 }}
      />
      <AmbientBlob
        style={{ width: 260, height: 260, top: '35%', right: '20%', background: 'radial-gradient(circle, hsla(32,100%,74%,0.12), transparent 70%)' }}
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, delay: 1 }}
      />

      {/* ── Subtle dot-grid ──────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* ── Floating particles ───────────────────────── */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* ══ MAIN CONTENT ══════════════════════════════ */}
      <m.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-xl"
      >
        {/* Status badge */}
        <m.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-2xl border border-slate-200/70 shadow-sm text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            <m.span
              animate={{ rotate: [0, 20, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Compass className="w-3 h-3 text-indigo-400" />
            </m.span>
            Error 404 · Page Not Found
          </span>
        </m.div>

        {/* Lottie with glass halo */}
        <m.div
          variants={fadeUp}
          className="relative w-full max-w-[280px] sm:max-w-[300px] mb-4"
        >
          <TiltCard>
            {/* Glow ring */}
            <div
              className="absolute inset-[-24px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Glass disc */}
            <div className="absolute inset-[-12px] rounded-full bg-white/20 backdrop-blur-sm border border-white/40 shadow-xl pointer-events-none" />
            <DotLottieReact src={Error404} loop autoplay />
          </TiltCard>
        </m.div>

        {/* Headline */}
        <m.h1
          variants={fadeUp}
          className="font-black tracking-tighter leading-[1.05] text-slate-900 mb-3"
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
            fontFamily: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          Lost in the{' '}
          <span className="relative inline-block">
            <span
              style={{
                background: 'linear-gradient(125deg, #3b82f6 10%, #8b5cf6 55%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              void
            </span>
            {/* Animated underline */}
            <m.svg
              viewBox="0 0 120 8"
              className="absolute -bottom-0.5 left-0 w-full overflow-visible"
              aria-hidden
            >
              <m.path
                d="M0 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 120 5"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                stroke="url(#uline)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.0, duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="uline" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="55%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </m.svg>
          </span>
          ?
        </m.h1>

        {/* Subtext */}
        <m.p
          variants={fadeUp}
          className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mb-9"
          style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)' }}
        >
          This page drifted off the map. Even the best explorers get lost — let's navigate you back to safety.
        </m.p>

        {/* CTA buttons */}
        <m.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center"
        >
          {/* Ghost */}
          <m.button
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 28px -8px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-600 bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:bg-white transition-all duration-300 cursor-pointer w-full sm:w-auto min-w-[148px] justify-center"
          >
            <m.span
              animate={{ x: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </m.span>
            Go Back
          </m.button>

          {/* Primary */}
          <m.button
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/dashboard')}
            className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm text-white cursor-pointer w-full sm:w-auto min-w-[178px] justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              boxShadow: '0 10px 36px -8px rgba(99,102,241,0.55)',
            }}
          >
            {/* Shimmer */}
            <m.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
              initial={{ x: '-120%' }}
              whileHover={{ x: '220%' }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            />
            <Home className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Return Home</span>
          </m.button>
        </m.div>

        {/* Meta pills */}
        <m.div
          variants={fadeUp}
          className="flex items-center gap-2 mt-10 flex-wrap justify-center"
        >
          {[
            { label: 'Status', val: '404' },
            { label: 'Type', val: 'Not Found' },
            { label: 'Action', val: 'Redirect' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-slate-200/60 text-[10px] font-bold text-slate-400 shadow-sm"
            >
              <span className="text-slate-300">{pill.label}</span>
              <span className="w-px h-2.5 bg-slate-200" />
              <span className="text-slate-500">{pill.val}</span>
            </span>
          ))}
        </m.div>
      </m.div>

      {/* ── Footer branding ──────────────────────────── */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-0 right-0 text-center pointer-events-none"
      >
        <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black tracking-[0.3em] text-slate-300">
          <Wifi className="w-2.5 h-2.5 opacity-50" />
          User Panel Experience
        </span>
      </m.div>
    </m.div>
  );
};

export default NotFound;
