import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export function PageTransition({ children, className, style, transitionKey }) {
  const location = useLocation();
  const key = transitionKey || location.pathname;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{
          opacity: 0,
          scale: 0.97,
          y: 15, 
          filter: "blur(4px)"
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)"
        }}
        exit={{
          opacity: 0,
          scale: 0.98,
          y: -10,
          filter: "blur(2px)",
          transition: { duration: 0.2 }
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 25,
          mass: 0.9
        }}
        className={className}
        style={{
          width: "100%",
          willChange: "transform, opacity, filter",
          ...style
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
