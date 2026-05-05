import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A reusable FAQ-style expandable message component for table cells
 * @param {string} text - The content to display
 * @param {string} maxWidth - Optional maximum width for the truncated trigger text
 */
const ExpandableMessage = ({ text, maxWidth = "150px" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="w-full mx-auto relative"
      style={{ maxWidth }}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className="truncate cursor-pointer py-1"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span className="text-[11px] font-medium text-slate-400 capitalize whitespace-nowrap transition-colors duration-200 hover:text-indigo-600">
          {text}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95, y: -5 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full z-[100] mt-1 origin-top min-w-[200px]"
          >
            <div className="p-3 bg-white border border-slate-200/60 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-xl">
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed break-words whitespace-normal text-center">
                {text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpandableMessage;
