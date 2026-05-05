import { motion } from "framer-motion";

export function SidebarPageTransition({ children, className, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 0.6
      }}
      className={className}
      style={{
        width: "100%",
        willChange: "transform, opacity",
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

