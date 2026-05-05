import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ImageModal = ({ images = [], isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageList = Array.isArray(images) ? images : (images ? [images] : []);

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === 'string') return img;
    return img.url || img.path || img.image || img.src || "";
  };

  // Reset selected index when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-500"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative z-10 w-fit max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center p-4"
          >


            {/* Modal content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {imageList.length > 0 ? (
                <>
                  <div className="flex flex-col gap-6 items-center">
                    <div className="relative overflow-visible group">
                      {/* Close Button on Image Top Right */}
                      <button
                        onClick={onClose}
                        className="absolute -top-4 -right-4 z-[30] flex items-center justify-center rounded-full h-10 w-10 bg-slate-900/60 text-white hover:bg-rose-500 hover:scale-110 active:scale-95 backdrop-blur-md transition-all duration-150 border border-white/20 shadow-2xl group/btn"
                      >
                        <X className="w-5 h-5 transition-transform duration-150 " />
                      </button>
                      {(() => {
                        const rawSrc = imageList[selectedIndex];
                        const src = getImageUrl(rawSrc);
                        const isPdf = typeof src === 'string' && (src.toLowerCase().endsWith('.pdf') || src.includes('application/pdf'));
                        return isPdf ? (
                          <iframe
                            src={src}
                            title={`Preview PDF`}
                            className="w-full h-[80vh] border-none bg-white rounded-2xl shadow-2xl"
                          />
                        ) : (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            src={src}
                            alt={`Preview ${selectedIndex + 1}`}
                            className="max-w-[85vw] max-h-[80vh] object-contain rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] border border-white/10"
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Thumbnails Gallery */}
                  {imageList.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
                      {imageList.map((img, idx) => {
                        const src = getImageUrl(img);
                        const isPdf = typeof src === 'string' && src.toLowerCase().endsWith('.pdf');
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-1 ${selectedIndex === idx
                              ? "border-slate-950 bg-slate-950/5"
                              : "border-slate-100 bg-white opacity-50 hover:opacity-100 hover:border-slate-300"
                              }`}
                          >
                            <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-50">
                              {isPdf ? (
                                <div className="flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                  <span className="text-[8px] opacity-60">DOC</span>
                                  PDF
                                </div>
                              ) : (
                                <img
                                  src={src}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <X className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest italic">Document not found</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImageModal;
