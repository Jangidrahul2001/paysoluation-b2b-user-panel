import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * A reusable FAQ-style expandable message component for table cells
 * @param {string} text - The content to display
 * @param {string} maxWidth - Optional maximum width for the truncated trigger text
 */
const ExpandableMessage = ({ text, maxWidth = "150px" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div
        className="w-full mx-auto relative"
        style={{ maxWidth }}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
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

        {/* Desktop Dropdown */}
        {!isMobile && (
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
        )}
      </div>

      {/* Mobile Modal */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative z-10 w-full max-w-sm mx-4 max-h-[80vh] flex flex-col"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col max-h-full">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-slate-700">Message</h3>
                    <button
                      onClick={handleClose}
                      className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-sm text-slate-600 leading-relaxed break-words">
                      {text}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ExpandableMessage;
